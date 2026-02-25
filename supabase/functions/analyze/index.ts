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

      systemPrompt = `You are a senior cardiologist AI assistant. You MUST provide analysis based on established medical literature and clinical guidelines (ESC, AHA/ACC cardiovascular risk assessment guidelines, WHO cardiovascular disease prevention guidelines).

CRITICAL: Your ENTIRE response must be in ${langName}. Every single field, every word must be in ${langName}. No exceptions.

IMPORTANT RULES:
1. Always reference specific medical guidelines and journals when making assessments. Be objective and evidence-based.
2. For each disease risk identified, provide a link to a relevant published medical study or guideline (PubMed, ESC guidelines, AHA/ACC guidelines, etc).
3. The "symptomsChartScore" represents the patient's HEALTH score based ONLY on symptoms (0 = critical/many severe symptoms, 100 = excellent/no symptoms). This score should be CONSISTENT with your verdict and risk assessment. If the patient reports few or mild symptoms, the score should be HIGH (70-95). If the patient reports many severe symptoms, it should be LOW (10-40).
4. The "riskScore" is the OPPOSITE concept — it represents RISK (0 = no risk, 100 = maximum risk). A patient with symptomsChartScore=80 should have riskScore around 15-30, NOT 70+.
5. CRITICAL: The "normalHealthScore" field should be the score that a perfectly healthy person of the same age and gender would have. For most people this is 82-92 depending on age (younger=higher). Justify this value in "normalScoreJustification".

${!hasHeartRate ? `6. IMPORTANT: The patient DID NOT provide their resting heart rate. You MUST NOT diagnose or assess risk for ANY heart-rate-dependent conditions (tachycardia, bradycardia, arrhythmia, atrial fibrillation based on heart rate). Only include diseases that can be assessed from symptoms, lifestyle, and other provided data.` : ''}
${!hasBloodData ? `7. IMPORTANT: The patient DID NOT provide blood test data. You MUST NOT diagnose or assess risk for ANY blood-test-dependent conditions (dyslipidemia, hypercholesterolemia, diabetes/prediabetes based on glucose, anemia based on hemoglobin). Only include diseases assessable from symptoms and lifestyle. Set bloodChartScore to null.` : ''}

Your response MUST be valid JSON with this exact structure:
{
  "verdict": "Detailed medical verdict text in ${langName} based on all provided data. MUST be consistent with scores.",
  "riskScore": <number 0-100, where 0=no risk and 100=maximum risk>,
  "riskCategory": "low|moderate|high|critical",
  "shortTermMeasures": ["measure1 in ${langName}", "measure2 in ${langName}", ...],
  "longTermMeasures": ["measure1 in ${langName}", "measure2 in ${langName}", ...],
  "diseases": [{"name": "disease name in ${langName}", "risk": <number 0-100>, "reasoning": "brief explanation in ${langName} of WHY this risk level was assigned based on PROVIDED data"}],
  "needsHospital": <boolean>,
  "hospitalMessage": "message in ${langName} about hospital if needed",
  "nextAnalysisMessage": "message in ${langName} about when to do next analysis",
  "symptomsChartScore": <number 0-100, HEALTH score where 100=excellent health, must be consistent with riskScore>,
  "bloodChartScore": <number 0-100 or null if no blood data>,
  "normalHealthScore": <number 78-95, the expected healthy score for this patient's age/gender>,
  "normalScoreJustification": "explanation in ${langName} of why this normal score was chosen for this age/gender",
  "normalSymptomsInfo": "description in ${langName} of what a healthy person of same age would feel",
  "normalBloodInfo": "description in ${langName} of what normal blood values look like for this age/gender",
  "dataLimitations": "explanation in ${langName} of what data was missing and how it limits the analysis",
  "references": [{"title": "study/guideline title", "url": "https://pubmed.ncbi.nlm.nih.gov/... or guideline URL", "relevance": "brief note in ${langName}"}]
}`;

      userPrompt = `Patient profile:
- Age: ${userProfile?.age || 'unknown'}
- Gender: ${userProfile?.gender || 'unknown'}
- City: ${userProfile?.city || 'unknown'}
- Chronic diseases: ${userProfile?.chronicDiseases || 'none'}
- Allergies: ${userProfile?.allergies || 'none'}
- Bad habits: ${userProfile?.badHabits || 'none'}
- Body features noted over lifetime: ${userProfile?.bodyFeatures || 'none'}

Symptom questionnaire answers (10 questions):
${JSON.stringify(symptoms, null, 2)}

Patient's own description of feelings:
${freeText || 'Not provided'}

Recent diet:
${diet || 'Not provided'}

Physical activity & lifestyle:
- Exercise: ${activity?.exercise || 'Not provided'}
- Sleep: ${activity?.sleep || 'Not provided'}
- Stress level: ${activity?.stress || 'Not provided'}
- Resting heart rate: ${hasHeartRate ? activity.heartRate + ' bpm' : 'NOT PROVIDED (skipped by patient)'}

Blood test data:
${hasBloodData ? JSON.stringify(bloodData, null, 2) : 'NOT PROVIDED (skipped by patient)'}

Previous analyses count: ${previousAnalyses?.length || 0}
${previousAnalyses?.length ? `Previous scores: ${JSON.stringify(previousAnalyses.map((a: any) => ({ date: a.date, symptomsScore: a.symptomsChartScore, bloodScore: a.bloodChartScore })))}` : ''}

Provide a comprehensive cardiovascular health assessment. ENSURE scores are internally consistent. If symptoms are mild, symptomsChartScore should be high and riskScore should be low. Include references to specific medical studies/guidelines. RESPOND ENTIRELY IN ${langName}.`;
    } else if (type === "prescription") {
      systemPrompt = `You are a pharmacist AI assistant. Analyze the prescription description and identify medications. RESPOND ENTIRELY IN ${langName}.

Your response MUST be valid JSON:
{
  "medications": [{"name": "medication name in ${langName}", "dosage": "dosage info in ${langName}", "purpose": "what it's for in ${langName}"}],
  "advice": "general advice in ${langName} about the medications"
}`;
      userPrompt = `Prescription text/description: ${data.prescriptionText || 'No text provided'}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
      parsed = { verdict: content, riskScore: 50, riskCategory: "moderate", shortTermMeasures: [], longTermMeasures: [], diseases: [], needsHospital: false, hospitalMessage: "", nextAnalysisMessage: "", symptomsChartScore: 50, bloodChartScore: null, normalHealthScore: 85, normalScoreJustification: "", normalSymptomsInfo: "", normalBloodInfo: "", dataLimitations: "", references: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
