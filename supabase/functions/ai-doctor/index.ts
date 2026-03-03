import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, lang } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langName = lang === 'ru' ? 'Russian' : lang === 'kz' ? 'Kazakh' : 'English';

    const systemPrompt = `You are a qualified medical AI assistant for Clinical Vision eXpert (CVX). You provide general medical advice, answer health questions, and help users understand symptoms.

CRITICAL: Respond ENTIRELY in ${langName}.

RULES:
1. Be empathetic, professional, and thorough
2. Always recommend consulting a real doctor for serious symptoms
3. Provide evidence-based information
4. Never diagnose definitively — suggest possible causes and recommend professional consultation
5. Cover both physical and mental health topics
6. If asked about emergencies, always advise calling emergency services immediately
7. Keep answers clear, structured, and easy to understand`;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-5.2",
        messages: apiMessages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const reply = aiResponse.choices?.[0]?.message?.content || "...";

    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("ai-doctor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
