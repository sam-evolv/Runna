// Supabase Edge Function: exercise-explainer
// Explains exercise benefits tailored to the user's goals
//
// Deploy with: supabase functions deploy exercise-explainer

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY')!;
const NVIDIA_MODEL = 'meta/llama-3.1-8b-instruct';
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExerciseExplainerRequest {
  exercise_name: string;
  user_goal: string;
  user_goal_area?: string;
  user_level: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData: ExerciseExplainerRequest = await req.json();

    const userMessage = `Exercise: ${requestData.exercise_name}
User's goal: ${requestData.user_goal}
${requestData.user_goal_area ? `Goal area: ${requestData.user_goal_area}` : ''}
User's level: ${requestData.user_level}

Explain why this exercise benefits this user.`;

    const systemPrompt = `You are an exercise science educator. Explain why the given exercise benefits the user's specific goals. Be specific about muscles targeted, how it contributes to their goal, and one form tip. Keep it under 80 words. Speak directly to the user. Respond ONLY with valid JSON: { "explanation": string, "muscles_targeted": string[], "form_tip": string }`;

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

    const explanation = JSON.parse(jsonContent);

    return new Response(JSON.stringify(explanation), {
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
