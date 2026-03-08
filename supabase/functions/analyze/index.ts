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

      systemPrompt = `You are a senior medical AI for CVX. Provide CONCISE but THOROUGH health analysis. NO markdown symbols (**, ##, *, etc). Plain text only. Use numbered lists where needed.

CRITICAL: ENTIRE response in ${langName}. Be direct and actionable.

RULES:
1. "symptomsChartScore" = HEALTH score (0=critical, 100=excellent).
2. "riskScore" = RISK (0=no risk, 100=critical).
3. "normalHealthScore" = expected healthy score for age/gender (78-95).
4. "verdictSummary" = 2-3 sentence overview of current state.
5. "verdictSections" = array of sections, each with "title" and "content" (100-150 words each). Sections: Current State, Risk Factors, Physiological Explanation, Prognosis, Key Recommendations.
6. For EACH measure category provide 8-12 specific items. NO extra symbols, just clean numbered text.
   - "withoutMeds": lifestyle, exercises, diet, supplements, breathing techniques, sleep hygiene, stress management
   - "withMeds": specific drugs with dosages, frequencies, contraindications
7. For each disease: name, risk 0-100, brief reasoning.
${!hasHeartRate ? `8. No heart rate provided. Skip heart-rate-dependent conditions.` : ''}
${!hasBloodData ? `9. No blood data. Skip blood-dependent conditions. bloodChartScore=null.` : ''}

Response MUST be valid JSON:
{
  "verdictSummary": "concise 2-3 sentence summary",
  "verdictSections": [{"title": "...", "content": "..."}],
  "riskScore": <0-100>,
  "riskCategory": "low|moderate|high|critical",
  "shortTermWithoutMeds": ["8-12 items"],
  "shortTermWithMeds": ["8-12 items"],
  "longTermWithoutMeds": ["8-12 items"],
  "longTermWithMeds": ["8-12 items"],
  "diseases": [{"name": "...", "risk": <0-100>, "reasoning": "brief explanation"}],
  "needsHospital": <boolean>,
  "hospitalMessage": "...",
  "symptomsChartScore": <0-100>,
  "bloodChartScore": <0-100 or null>,
  "normalHealthScore": <78-95>,
  "normalScoreJustification": "...",
  "references": [{"title": "...", "url": "...", "relevance": "..."}]
}`;

      userPrompt = `Patient: Age=${userProfile?.age||'?'}, Gender=${userProfile?.gender||'?'}, City=${userProfile?.city||'?'}
Chronic: ${userProfile?.chronic_diseases||'none'}, Allergies: ${userProfile?.allergies||'none'}, Habits: ${userProfile?.bad_habits||'none'}
Body: ${userProfile?.body_features||'none'}, Work hrs/wk: ${userProfile?.work_hours_per_week||'?'}, Stress resilience: ${userProfile?.stress_resilience||'?'}
Symptoms: ${JSON.stringify(symptoms)}
Free text: ${freeText || 'N/A'}
Diet: ${diet || 'N/A'}
Exercise: ${activity?.exercise||'?'}, Sleep: ${activity?.sleep||'?'}, Stress: ${activity?.stress||'?'}
Heart rate: ${hasHeartRate ? activity.heartRate + ' bpm' : 'N/A'}
Blood: ${hasBloodData ? JSON.stringify(bloodData) : 'N/A'}
Previous: ${previousAnalyses?.length || 0}
RESPOND IN ${langName}. No markdown symbols.`;

    } else if (type === "mental_analysis") {
      const { answers, openText, userProfile } = data;

      systemPrompt = `You are a clinical psychologist AI for CVX. Provide CONCISE but THOROUGH mental health assessment. NO markdown symbols (**, ##, *, etc). Plain text only.

CRITICAL: ENTIRE response in ${langName}. Be direct.

Provide "verdictSummary" (2-3 sentences) and "verdictSections" (array of sections with title/content, 100-150 words each). Sections: Current State, Identified Patterns, Risk Factors, Coping Assessment, Personalized Plan.

For measures provide 8-12 items each:
- "withoutMeds": therapy techniques, lifestyle changes, exercises, meditation, social strategies
- "withMeds": specific supplements/medications with dosages

Response MUST be valid JSON:
{
  "verdictSummary": "concise 2-3 sentence summary",
  "verdictSections": [{"title": "...", "content": "..."}],
  "mentalScore": <0-100>,
  "riskCategory": "low|moderate|high|critical",
  "shortTermWithoutMeds": ["8-12 items"],
  "shortTermWithMeds": ["8-12 items"],
  "longTermWithoutMeds": ["8-12 items"],
  "longTermWithMeds": ["8-12 items"],
  "areas": [{"name": "...", "score": <0-100>, "description": "brief assessment"}],
  "recommendations": "key recommendations",
  "references": [{"title": "...", "url": "...", "relevance": "..."}]
}`;

      userPrompt = `Patient: Age=${userProfile?.age||'?'}, Gender=${userProfile?.gender||'?'}
Work hrs/wk: ${userProfile?.work_hours_per_week||'?'}, Stress resilience: ${userProfile?.stress_resilience||'?'}
Chronic: ${userProfile?.chronic_diseases||'none'}
Answers: ${JSON.stringify(answers)}
Open text: ${openText || 'N/A'}
RESPOND IN ${langName}. No markdown symbols.`;

    } else if (type === "prescription") {
      systemPrompt = `Pharmacist AI. Analyze prescription. RESPOND IN ${langName}. No markdown.
Response MUST be valid JSON:
{"medications": [{"name": "...", "dosage": "...", "purpose": "..."}], "advice": "..."}`;
      userPrompt = `Prescription: ${data.prescriptionText || 'No text'}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
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
        parsed = { verdictSummary: content, verdictSections: [], mentalScore: 50, riskCategory: "moderate", shortTermWithMeds: [], shortTermWithoutMeds: [], longTermWithMeds: [], longTermWithoutMeds: [], areas: [], recommendations: "", references: [] };
      } else {
        parsed = { verdictSummary: content, verdictSections: [], riskScore: 50, riskCategory: "moderate", shortTermWithMeds: [], shortTermWithoutMeds: [], longTermWithMeds: [], longTermWithoutMeds: [], diseases: [], needsHospital: false, symptomsChartScore: 50, bloodChartScore: null, normalHealthScore: 85, references: [] };
      }
    }

    // Clean markdown symbols from all string values
    const cleanText = (s: string) => s?.replace(/[*#_~`>]/g, '').replace(/\n{3,}/g, '\n\n').trim() || s;
    if (parsed.verdictSummary) parsed.verdictSummary = cleanText(parsed.verdictSummary);
    if (parsed.verdictSections) parsed.verdictSections = parsed.verdictSections.map((s: any) => ({ ...s, title: cleanText(s.title), content: cleanText(s.content) }));
    if (parsed.verdict) { parsed.verdictSummary = cleanText(parsed.verdict); delete parsed.verdict; }
    
    const cleanArray = (arr: string[]) => arr?.map(cleanText) || [];
    parsed.shortTermWithMeds = cleanArray(parsed.shortTermWithMeds);
    parsed.shortTermWithoutMeds = cleanArray(parsed.shortTermWithoutMeds);
    parsed.longTermWithMeds = cleanArray(parsed.longTermWithMeds);
    parsed.longTermWithoutMeds = cleanArray(parsed.longTermWithoutMeds);

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
