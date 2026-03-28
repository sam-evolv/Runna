// Supabase Edge Function: autoregulate-volume
// Analyses a week's feedback data and adjusts next week's training volume
// per muscle group (strength) or running load (running). Called weekly.
//
// Deploy with: supabase functions deploy autoregulate-volume

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY')!;
const NVIDIA_MODEL = 'meta/llama-3.3-70b-instruct';
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MuscleGroupFeedback {
  muscle_group: string;
  completed_sets: number;
  avg_rir: number;
  avg_pump: number;
  avg_soreness: number;
  joint_pain: boolean;
}

interface RunningFeedback {
  total_distance_km: number;
  easy_km: number;
  hard_km: number;
  avg_leg_fatigue: number;
  avg_rpe: number;
  niggles: string[];
}

interface WeeklyFeedback {
  muscle_groups: MuscleGroupFeedback[];
  running: RunningFeedback | null;
  sleep_avg: number;
  stress_avg: number;
}

interface AutoregulateRequest {
  user_id: string;
  plan_id: string;
  week_number: number;
  mesocycle_week: number;
  training_type: 'strength' | 'running' | 'mixed';
  weekly_feedback: WeeklyFeedback;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const data: AutoregulateRequest = await req.json();

    const muscleGroupSummary = data.weekly_feedback.muscle_groups
      .map(
        (mg) =>
          `- ${mg.muscle_group}: ${mg.completed_sets} sets, avg RIR ${mg.avg_rir}, pump ${mg.avg_pump}/5, soreness ${mg.avg_soreness}/5, joint pain: ${mg.joint_pain ? 'YES' : 'no'}`
      )
      .join('\n');

    const runningSummary = data.weekly_feedback.running
      ? `Running data:
- Total distance: ${data.weekly_feedback.running.total_distance_km} km (easy: ${data.weekly_feedback.running.easy_km} km, hard: ${data.weekly_feedback.running.hard_km} km)
- Avg leg fatigue: ${data.weekly_feedback.running.avg_leg_fatigue}/5
- Avg RPE: ${data.weekly_feedback.running.avg_rpe}/10
- Niggles: ${data.weekly_feedback.running.niggles.length > 0 ? data.weekly_feedback.running.niggles.join(', ') : 'None'}`
      : 'No running data this week.';

    const userMessage = `Weekly autoregulation data for week ${data.week_number} (mesocycle week ${data.mesocycle_week}):
Training type: ${data.training_type}

Muscle group feedback:
${muscleGroupSummary}

${runningSummary}

Recovery signals:
- Average sleep: ${data.weekly_feedback.sleep_avg} hours
- Average stress: ${data.weekly_feedback.stress_avg}/5

Based on this data, provide volume adjustments for next week.`;

    const systemPrompt = `You are an exercise scientist specialising in training periodisation and autoregulation. You are adjusting next week's training volume based on this week's feedback data. Consider all signals holistically: pump quality indicates stimulus, soreness indicates recovery demand, joint pain is a hard stop, RIR accuracy indicates load appropriateness, sleep and stress affect systemic recovery capacity. For running: leg fatigue, breathing difficulty, pace feel, and niggles replace pump/soreness. Cross-reference multiple signals before making decisions. Always explain your reasoning. Respond ONLY with valid JSON: { "muscle_group_adjustments": [{ "muscle_group": string, "current_sets": number, "recommended_sets": number, "reasoning": string }], "running_adjustments": { "volume_change_percent": number, "intensity_change": string, "reasoning": string } | null, "mesocycle_recommendation": "continue" | "extend" | "deload_now" | "end_mesocycle", "overall_note": string }`;

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
