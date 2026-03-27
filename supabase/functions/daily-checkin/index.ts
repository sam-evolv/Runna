// Supabase Edge Function: daily-checkin
// Processes pre-workout check-in data and returns AI-powered recommendations
//
// Deploy with: supabase functions deploy daily-checkin

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY')!;
const NVIDIA_MODEL = 'meta/llama-3.1-8b-instruct';
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckinRequest {
  user_id: string;
  workout_id: string;
  mood: number;
  energy_level: number;
  sleep_quality: number;
  sleep_hours?: number;
  soreness_areas: string[];
  stress_level: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const checkinData: CheckinRequest = await req.json();

    const userMessage = `Pre-workout check-in data:
- Mood: ${checkinData.mood}/5
- Energy level: ${checkinData.energy_level}/5
- Sleep quality: ${checkinData.sleep_quality}/5
${checkinData.sleep_hours ? `- Sleep hours: ${checkinData.sleep_hours}` : ''}
- Soreness areas: ${checkinData.soreness_areas.length > 0 ? checkinData.soreness_areas.join(', ') : 'None reported'}
- Stress level: ${checkinData.stress_level}/5

Based on this data, what is your recommendation for today's workout?`;

    const systemPrompt = `You are a supportive personal health coach. Based on the user's pre-workout check-in data, decide whether to: 1) proceed as planned, 2) adjust intensity by a specific percentage, 3) swap for a lighter alternative, or 4) recommend rest. Always explain your reasoning in 2-3 sentences. Be warm and motivating. Respond ONLY with valid JSON: { "action": "proceed|adjust|swap|rest", "adjustment_percent": number|null, "explanation": string, "modified_workout": null }`;

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`NVIDIA API error: ${response.status} - ${errorBody}`);
    }

    const nvidiaResponse = await response.json();
    const content = nvidiaResponse.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from AI model');
    }

    // Parse the JSON response (handle potential markdown wrapping)
    let jsonContent = content;
    if (jsonContent.includes('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    jsonContent = jsonContent.trim();

    const recommendation = JSON.parse(jsonContent);

    return new Response(JSON.stringify(recommendation), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  }
});
