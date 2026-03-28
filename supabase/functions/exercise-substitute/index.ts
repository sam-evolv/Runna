// Supabase Edge Function: exercise-substitute
// Suggests exercise alternatives when equipment is unavailable or an exercise causes pain
//
// Deploy with: supabase functions deploy exercise-substitute

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY')!;
const NVIDIA_MODEL = 'meta/llama-3.1-8b-instruct';
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubstituteRequest {
  exercise_name: string;
  reason: 'equipment_unavailable' | 'pain';
  pain_area?: string;
  available_equipment: string[];
  user_level: string;
  user_goal: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const data: SubstituteRequest = await req.json();

    const userMessage = `I cannot perform: ${data.exercise_name}
Reason: ${data.reason === 'pain' ? `Pain in ${data.pain_area || 'unspecified area'}` : 'Equipment unavailable'}
Available equipment: ${data.available_equipment.join(', ')}
Experience level: ${data.user_level}
Goal: ${data.user_goal}

Please suggest 2-3 alternative exercises.`;

    const systemPrompt = `You are a strength and conditioning coach. The user cannot perform the prescribed exercise due to equipment unavailability or pain. Suggest 2-3 alternatives that: 1) target the same primary muscle group and movement pattern, 2) provide a similar stimulus type (stretch/contraction/compound/isolation), 3) use the user's available equipment, 4) avoid any reported pain areas. For each alternative, briefly explain why it's a good substitute. Respond ONLY with valid JSON: { "alternatives": [{ "exercise": string, "equipment_needed": string, "reasoning": string }] }`;

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
