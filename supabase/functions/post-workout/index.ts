// Supabase Edge Function: post-workout
// Processes post-workout reflection and returns AI-powered feedback
//
// Deploy with: supabase functions deploy post-workout

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY')!;
const NVIDIA_MODEL = 'meta/llama-3.1-8b-instruct';
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PostWorkoutRequest {
  user_id: string;
  workout_id: string;
  rpe: number;
  could_push_harder: boolean;
  feeling_stronger: string;
  notes: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const reflectionData: PostWorkoutRequest = await req.json();

    const userMessage = `Post-workout reflection:
- RPE (Rate of Perceived Exertion): ${reflectionData.rpe}/10
- Could push harder: ${reflectionData.could_push_harder ? 'Yes' : 'No'}
- Feeling stronger: ${reflectionData.feeling_stronger}
- Notes: ${reflectionData.notes || 'None'}

Based on this reflection, provide feedback and insights.`;

    const systemPrompt = `You are a sports performance analyst. Based on the user's post-workout reflection, provide: 1) acknowledgment of their effort, 2) one specific insight about their performance, 3) how this data will inform their next session. Keep it personal and under 100 words. Respond ONLY with valid JSON: { "feedback": string, "next_session_adjustment": string|null, "concern_flag": boolean, "concern_detail": string|null }`;

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

    const feedback = JSON.parse(jsonContent);

    return new Response(JSON.stringify(feedback), {
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
