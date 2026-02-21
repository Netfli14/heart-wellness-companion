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

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "medical_analysis") {
      const { symptoms, freeText, diet, bloodData, userProfile, previousAnalyses } = data;
      
      systemPrompt = `You are a senior cardiologist AI assistant. You must provide analysis based on established medical literature and clinical guidelines (ESC, AHA/ACC cardiovascular risk assessment guidelines, WHO cardiovascular disease prevention guidelines).

IMPORTANT: Always reference medical guidelines when making assessments. Be objective and evidence-based.

You must respond in ${lang === 'ru' ? 'Russian' : lang === 'kz' ? 'Kazakh' : 'English'}.

Your response MUST be valid JSON with this exact structure:
{
  "verdict": "Detailed medical verdict text based on all provided data",
  "riskScore": <number 0-100>,
  "riskCategory": "low|moderate|high|critical",
  "shortTermMeasures": ["measure1", "measure2", ...],
  "longTermMeasures": ["measure1", "measure2", ...],
  "diseases": [{"name": "disease name", "risk": <number 0-100>}],
  "needsHospital": <boolean>,
  "hospitalMessage": "message about hospital if needed",
  "nextAnalysisMessage": "message about when to do next analysis",
  "symptomsChartScore": <number 0-100>,
  "bloodChartScore": <number 0-100 or null if no blood data>,
  "normalSymptomsInfo": "what a healthy person would feel",
  "normalBloodInfo": "what normal blood values look like"
}`;

      userPrompt = `Patient profile:
- Age: ${userProfile?.age || 'unknown'}
- Gender: ${userProfile?.gender || 'unknown'}
- City: ${userProfile?.city || 'unknown'}
- Chronic diseases: ${userProfile?.chronicDiseases || 'none'}
- Allergies: ${userProfile?.allergies || 'none'}
- Bad habits: ${userProfile?.badHabits || 'none'}

Symptom questionnaire answers:
${JSON.stringify(symptoms, null, 2)}

Patient's own description of feelings:
${freeText || 'Not provided'}

Recent diet:
${diet || 'Not provided'}

Blood test data:
${bloodData ? JSON.stringify(bloodData, null, 2) : 'Not provided (skipped)'}

Previous analyses count: ${previousAnalyses?.length || 0}
${previousAnalyses?.length ? `Previous scores: ${JSON.stringify(previousAnalyses.map((a: any) => ({ date: a.date, symptomsScore: a.symptomsChartScore, bloodScore: a.bloodChartScore })))}` : ''}

Provide a comprehensive cardiovascular health assessment based on medical literature.`;
    } else if (type === "prescription") {
      systemPrompt = `You are a pharmacist AI assistant. Analyze the prescription description and identify medications. Respond in ${lang === 'ru' ? 'Russian' : lang === 'kz' ? 'Kazakh' : 'English'}.

Your response MUST be valid JSON:
{
  "medications": [{"name": "medication name", "dosage": "dosage info", "purpose": "what it's for"}],
  "advice": "general advice about the medications"
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
        model: "google/gemini-2.5-pro",
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
    
    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch {
      parsed = { verdict: content, riskScore: 50, riskCategory: "moderate", shortTermMeasures: [], longTermMeasures: [], diseases: [], needsHospital: false, hospitalMessage: "", nextAnalysisMessage: "", symptomsChartScore: 50, bloodChartScore: null, normalSymptomsInfo: "", normalBloodInfo: "" };
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
