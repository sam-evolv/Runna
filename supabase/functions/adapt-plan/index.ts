// Supabase Edge Function: adapt-plan
// Adapts an existing plan based on performance or handles missed workouts
//
// Deploy with: supabase functions deploy adapt-plan

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

interface AdaptRequest {
  plan_id: string;
  action?: 'adapt' | 'realign';
  missed_workout_id?: string;
  recent_activities?: Array<{
    workout_id: string;
    actual_pace?: number;
    target_pace?: number;
    completed: boolean;
    rpe?: number;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const adaptRequest: AdaptRequest = await req.json();
    const action = adaptRequest.action || 'adapt';

    // Fetch the plan
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*, workouts(*)')
      .eq('id', adaptRequest.plan_id)
      .single();

    if (planError || !plan) {
      throw new Error(`Plan not found: ${planError?.message}`);
    }

    let prompt = '';

    if (action === 'realign') {
      // Handle missed workout
      const missedWorkout = plan.workouts.find(
        (w: any) => w.id === adaptRequest.missed_workout_id,
      );

      prompt = `A user missed the following workout from their training plan:

MISSED WORKOUT:
${JSON.stringify(missedWorkout, null, 2)}

REMAINING SCHEDULED WORKOUTS (next 2 weeks):
${JSON.stringify(
  plan.workouts
    .filter((w: any) => w.status === 'scheduled')
    .slice(0, 14),
  null, 2,
)}

Please suggest how to realign the plan. Options:
1. Skip the missed session entirely (if it was an easy/recovery day)
2. Merge key elements into the next appropriate session
3. Shift remaining workouts

Respond with JSON:
{
  "message": "string - brief explanation of the adjustment",
  "updated_workouts": [
    {
      "id": "workout_id",
      "title": "updated title if changed",
      "description": "updated description",
      "workout_data": { updated workout data if changed },
      "status": "scheduled or skipped"
    }
  ]
}`;
    } else {
      // Performance-based adaptation
      prompt = `Review the user's recent workout performance and suggest plan adaptations:

RECENT PERFORMANCE:
${JSON.stringify(adaptRequest.recent_activities, null, 2)}

UPCOMING WORKOUTS:
${JSON.stringify(
  plan.workouts
    .filter((w: any) => w.status === 'scheduled')
    .slice(0, 7),
  null, 2,
)}

Analyse whether the user is:
- Consistently beating targets (increase intensity/volume slightly)
- Struggling with targets (reduce intensity/volume)
- On track (maintain current plan)

Respond with JSON:
{
  "adjustments": "string - summary of changes and why",
  "updated_workouts": [
    {
      "id": "workout_id",
      "workout_data": { adjusted workout data }
    }
  ]
}`;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const claudeResponse = await response.json();
    let content = claudeResponse.content[0]?.text || '{}';

    if (content.includes('```json')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const adaptations = JSON.parse(content.trim());

    // Apply the adaptations to the database
    if (adaptations.updated_workouts) {
      for (const update of adaptations.updated_workouts) {
        const updateData: any = {};
        if (update.title) updateData.title = update.title;
        if (update.description) updateData.description = update.description;
        if (update.workout_data) updateData.workout_data = update.workout_data;
        if (update.status) updateData.status = update.status;

        if (Object.keys(updateData).length > 0) {
          await supabase
            .from('workouts')
            .update(updateData)
            .eq('id', update.id);
        }
      }
    }

    return new Response(JSON.stringify(adaptations), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
});
