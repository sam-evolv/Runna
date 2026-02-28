// Supabase Edge Function: generate-plan
// Generates a personalised training plan using Claude AI
//
// Deploy with: supabase functions deploy generate-plan

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

console.log(`[generate-plan] ANTHROPIC_API_KEY length: ${ANTHROPIC_API_KEY.length}`);

interface PlanRequest {
  user: {
    date_of_birth: string | null;
    gender: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    unit_preference: string;
  };
  goal: {
    goal_type: string;
    goal_subtype: string | null;
    target_value: string | null;
    target_event: string | null;
    target_date: string | null;
    current_level: string;
    available_days: number[];
    preferred_long_session_day: number | null;
  };
  stats: {
    recent_5k_time: string | null;
    recent_10k_time: string | null;
    recent_half_time: string | null;
    recent_marathon_time: string | null;
    weekly_mileage_km: number | null;
    max_heart_rate: number | null;
    resting_heart_rate: number | null;
    bench_press_1rm: number | null;
    squat_1rm: number | null;
    deadlift_1rm: number | null;
    overhead_press_1rm: number | null;
    injury_history: string | null;
    equipment_available: string[] | null;
    gym_access: boolean;
  };
}

function buildSystemPrompt(req: PlanRequest): string {
  const { goal, stats, user } = req;

  let roleDescription = '';
  let specificGuidelines = '';

  switch (goal.goal_type) {
    case 'running':
      roleDescription = 'You are an expert running coach and sports scientist with 20+ years of experience coaching runners from couch-to-5k through to sub-elite marathon runners.';
      specificGuidelines = `
RUNNING-SPECIFIC RULES:
- Never increase weekly mileage by more than 10% week-over-week
- Include a deload/recovery week every 3-4 weeks (reduce volume by 30-40%)
- Long run should not exceed 30-35% of weekly volume
- Easy runs should make up 80% of total volume (polarized training)
- Include strides/drills on easy days for neuromuscular development
- If training for a race with a date, include a 2-3 week taper
- Pace zones should be based on recent race times when available

RUNNING WORKOUT TYPES AND SEGMENTS:
Each running workout must include a "segments" array with the following structure:
- warmup: Easy jog to prepare for the session
- interval: Fast-paced efforts (VO2max or threshold)
- recovery: Easy jog between intervals
- steady: Consistent moderate effort
- tempo: Sustained comfortably-hard pace
- easy: Easy aerobic pace
- cooldown: Easy jog to finish`;
      break;

    case 'strength':
      roleDescription = 'You are an expert strength & conditioning coach with 20+ years of experience programming for natural lifters from beginners to competitive powerlifters.';
      specificGuidelines = `
STRENGTH-SPECIFIC RULES:
- Progressive overload is king: increase weight, reps, or sets systematically
- Include a deload week every 3-4 weeks (reduce volume by 40%, keep intensity)
- Compound movements first, accessories after
- Ensure balanced push/pull ratios
- Program appropriate rest times: 2-3 min for compounds, 60-90s for accessories
- RPE should guide intensity: working sets at RPE 7-9
- Include warm-up sets before working weight

STRENGTH WORKOUT STRUCTURE:
Each exercise must include a "sets" array with:
- set_number, reps, weight_kg, type (warmup/working/drop/amrap), rest_seconds`;
      break;

    case 'triathlon':
      roleDescription = 'You are an expert triathlon coach experienced in training athletes from sprint distance to full Ironman.';
      specificGuidelines = `
TRIATHLON-SPECIFIC RULES:
- Balance swim, bike, run volume appropriately for the target distance
- Include brick sessions (bike-to-run transitions)
- Don't neglect strength work for injury prevention
- Progressive volume increase with recovery weeks
- Periodize: base phase -> build phase -> peak/race phase`;
      break;

    case 'general_fitness':
      roleDescription = 'You are an expert fitness coach who specialises in helping everyday people achieve their health and fitness goals.';
      specificGuidelines = `
GENERAL FITNESS RULES:
- Mix cardio and strength for balanced fitness
- Keep it achievable and enjoyable
- Progress gradually - build habits before intensity
- Include flexibility/mobility work`;
      break;
  }

  const age = user.date_of_birth
    ? Math.floor((Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return `${roleDescription}

You are generating a personalised training plan. You MUST respond with valid JSON only - no markdown, no explanation.

USER PROFILE:
- Age: ${age ?? 'Unknown'}
- Gender: ${user.gender ?? 'Not specified'}
- Height: ${user.height_cm ? user.height_cm + 'cm' : 'Unknown'}
- Weight: ${user.weight_kg ? user.weight_kg + 'kg' : 'Unknown'}
- Units: ${user.unit_preference}

GOAL:
- Type: ${goal.goal_type}
- Specific goal: ${goal.goal_subtype ?? 'General'}
- Target: ${goal.target_value ?? 'General improvement'}
- Target event: ${goal.target_event ?? 'None'}
- Target date: ${goal.target_date ?? 'No specific date'}
- Current level: ${goal.current_level}
- Available training days: ${goal.available_days.join(', ')} (1=Mon, 7=Sun)
- Preferred long session day: ${goal.preferred_long_session_day ?? 'Any'}

CURRENT FITNESS:
${stats.recent_5k_time ? `- Recent 5k: ${stats.recent_5k_time}` : ''}
${stats.recent_10k_time ? `- Recent 10k: ${stats.recent_10k_time}` : ''}
${stats.recent_half_time ? `- Recent Half Marathon: ${stats.recent_half_time}` : ''}
${stats.weekly_mileage_km ? `- Weekly mileage: ${stats.weekly_mileage_km}km` : ''}
${stats.bench_press_1rm ? `- Bench Press 1RM: ${stats.bench_press_1rm}kg` : ''}
${stats.squat_1rm ? `- Squat 1RM: ${stats.squat_1rm}kg` : ''}
${stats.deadlift_1rm ? `- Deadlift 1RM: ${stats.deadlift_1rm}kg` : ''}
${stats.injury_history ? `- Injury history: ${stats.injury_history}` : '- No injuries reported'}
${stats.equipment_available ? `- Equipment: ${stats.equipment_available.join(', ')}` : ''}
${stats.gym_access ? '- Has gym access' : '- No gym access'}

${specificGuidelines}

GENERAL RULES:
- Plan should be 4-16 weeks depending on goal
- Each week should have workouts ONLY on the available days
- Include rest days on non-training days
- Be specific with paces/weights - don't be vague
- Consider injury history for exercise selection
- Include warm-up and cool-down in running workouts

RESPONSE FORMAT (strict JSON):
{
  "plan_name": "string - catchy plan name",
  "description": "string - 1-2 sentence plan overview",
  "total_weeks": number,
  "philosophy": "string - training philosophy for this plan",
  "key_sessions": ["string array - the 2-3 most important session types"],
  "progression_notes": "string - how the plan progresses over time",
  "weeks": [
    {
      "week_number": number,
      "theme": "string - e.g. 'Base Building', 'Speed Development', 'Taper'",
      "total_distance_km": number (for running) or null,
      "total_volume": "string description of volume for strength" or null,
      "notes": "string - coach notes for this week",
      "workouts": [
        {
          "day_of_week": number (1-7),
          "workout_type": "string - easy_run|tempo_run|interval_run|long_run|recovery_run|fartlek|hill_run|race_pace|strength|mobility|rest",
          "title": "string - e.g. 'Easy Run - 5km' or 'Upper Body Strength'",
          "description": "string - brief description",
          "workout_data": { ... }, // Running: {type, total_distance_km, segments: [{type, distance_km, target_pace_min_km, description}], notes}
                                   // Strength: {type: "strength", focus, exercises: [{name, sets: [{set_number, reps, weight_kg, type, rest_seconds}], notes}], estimated_duration_minutes, notes}
          "estimated_duration_minutes": number
        }
      ]
    }
  ]
}`;
}

serve(async (req) => {
  // CORS
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
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set. Configure it in the Supabase dashboard under Edge Function secrets.');
    }

    const body = await req.json();
    console.log('[generate-plan] Request keys:', Object.keys(body));

    // Validate the expected nested shape
    if (!body.user || !body.goal || !body.stats) {
      console.error('[generate-plan] Invalid request shape. Expected {user, goal, stats}, got:', Object.keys(body));
      throw new Error(`Invalid request: expected {user, goal, stats} but got {${Object.keys(body).join(', ')}}`);
    }

    const planRequest: PlanRequest = body;
    const systemPrompt = buildSystemPrompt(planRequest);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 8192,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: 'Generate the training plan now. Respond with JSON only.',
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorBody}`);
    }

    const claudeResponse = await response.json();
    const content = claudeResponse.content[0]?.text;

    if (!content) {
      throw new Error('Empty response from Claude');
    }

    // Parse the JSON response (handle potential markdown wrapping)
    let planJson = content;
    if (planJson.includes('```json')) {
      planJson = planJson.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    planJson = planJson.trim();

    const plan = JSON.parse(planJson);

    return new Response(JSON.stringify(plan), {
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
