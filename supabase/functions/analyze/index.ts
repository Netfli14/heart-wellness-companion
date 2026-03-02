import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, data, lang } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langName = lang === 'ru' ? 'Russian' : lang === 'kz' ? 'Kazakh' : 'English';

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "medical_analysis") {
      const { symptoms, freeText, diet, activity, bloodData, userProfile, previousAnalyses } = data;
      const hasHeartRate = activity?.heartRate && activity.heartRate.toString().trim() !== '';
      const hasBloodData = bloodData && Object.values(bloodData).some((v: any) => v !== '' && v != null);

      systemPrompt = `You are a senior cardiologist AI assistant for Clinical Vision eXpert (CVX). Provide analysis based on ESC, AHA/ACC, WHO guidelines.

CRITICAL: ENTIRE response in ${langName}. Every field, every word.

RULES:
1. Reference specific medical guidelines. For each disease provide a link to a relevant study.
2. "symptomsChartScore" = HEALTH score (0=critical, 100=excellent). Must be CONSISTENT with verdict/risk.
3. "riskScore" = RISK (0=no risk, 100=critical). Inverse of health score.
4. "normalHealthScore" = expected healthy score for this age/gender (78-95). Justify in "normalScoreJustification".
${!hasHeartRate ? `5. Patient DID NOT provide heart rate. DO NOT diagnose heart-rate-dependent conditions (tachycardia, bradycardia, arrhythmia).` : ''}
${!hasBloodData ? `6. Patient DID NOT provide blood data. DO NOT diagnose blood-test-dependent conditions (dyslipidemia, diabetes). Set bloodChartScore to null.` : ''}

Response MUST be valid JSON:
{
  "verdict": "detailed verdict in ${langName}",
  "riskScore": <0-100>,
  "riskCategory": "low|moderate|high|critical",
  "shortTermMeasures": ["..."],
  "longTermMeasures": ["..."],
  "diseases": [{"name": "...", "risk": <0-100>, "reasoning": "..."}],
  "needsHospital": <boolean>,
  "hospitalMessage": "...",
  "nextAnalysisMessage": "...",
  "symptomsChartScore": <0-100>,
  "bloodChartScore": <0-100 or null>,
  "normalHealthScore": <78-95>,
  "normalScoreJustification": "...",
  "normalSymptomsInfo": "...",
  "normalBloodInfo": "...",
  "dataLimitations": "...",
  "references": [{"title": "...", "url": "...", "relevance": "..."}]
}`;

      userPrompt = `Patient: Age=${userProfile?.age||'?'}, Gender=${userProfile?.gender||'?'}, City=${userProfile?.city||'?'}
Chronic: ${userProfile?.chronic_diseases||'none'}, Allergies: ${userProfile?.allergies||'none'}, Habits: ${userProfile?.bad_habits||'none'}
Body features: ${userProfile?.body_features||'none'}
Work hours/week: ${userProfile?.work_hours_per_week||'?'}, Stress resilience: ${userProfile?.stress_resilience||'?'}

Symptoms: ${JSON.stringify(symptoms)}
Free text: ${freeText || 'Not provided'}
Diet: ${diet || 'Not provided'}
Exercise: ${activity?.exercise||'?'}, Sleep: ${activity?.sleep||'?'}, Stress: ${activity?.stress||'?'}
Heart rate: ${hasHeartRate ? activity.heartRate + ' bpm' : 'NOT PROVIDED'}
Blood: ${hasBloodData ? JSON.stringify(bloodData) : 'NOT PROVIDED'}
Previous analyses: ${previousAnalyses?.length || 0}

Provide comprehensive cardiovascular assessment. RESPOND IN ${langName}.`;

    } else if (type === "mental_analysis") {
      const { answers, openText, userProfile } = data;

      systemPrompt = `You are a clinical psychologist AI assistant for Clinical Vision eXpert (CVX). Provide mental health assessment.

CRITICAL: ENTIRE response in ${langName}.

Assess based on provided questionnaire answers and open text. Consider work-life balance, stress resilience, and overall mental state.

Response MUST be valid JSON:
{
  "verdict": "detailed mental health assessment in ${langName}",
  "mentalScore": <0-100, where 100=excellent mental health, 0=critical>,
  "riskCategory": "low|moderate|high|critical",
  "shortTermMeasures": ["immediate steps in ${langName}"],
  "longTermMeasures": ["long-term strategies in ${langName}"],
  "areas": [{"name": "area name in ${langName}", "score": <0-100>, "description": "brief assessment in ${langName}"}],
  "recommendations": "personalized recommendations in ${langName}",
  "references": [{"title": "...", "url": "...", "relevance": "..."}]
}`;

      userPrompt = `Patient: Age=${userProfile?.age||'?'}, Gender=${userProfile?.gender||'?'}
Work hours/week: ${userProfile?.work_hours_per_week||'?'}
Stress resilience: ${userProfile?.stress_resilience||'?'}
Chronic conditions: ${userProfile?.chronic_diseases||'none'}

Mental health questionnaire:
${JSON.stringify(answers, null, 2)}

Open text (how they feel):
${openText || 'Not provided'}

Provide comprehensive mental health assessment. RESPOND IN ${langName}.`;

    } else if (type === "prescription") {
      systemPrompt = `You are a pharmacist AI. Analyze prescription. RESPOND IN ${langName}.
Response MUST be valid JSON:
{"medications": [{"name": "...", "dosage": "...", "purpose": "..."}], "advice": "..."}`;
      userPrompt = `Prescription: ${data.prescriptionText || 'No text'}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch {
      if (type === "mental_analysis") {
        parsed = { verdict: content, mentalScore: 50, riskCategory: "moderate", shortTermMeasures: [], longTermMeasures: [], areas: [], recommendations: "", references: [] };
      } else {
        parsed = { verdict: content, riskScore: 50, riskCategory: "moderate", shortTermMeasures: [], longTermMeasures: [], diseases: [], needsHospital: false, symptomsChartScore: 50, bloodChartScore: null, normalHealthScore: 85, references: [] };
      }
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
