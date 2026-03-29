// Supabase Edge Function: generate-plan
// Two-call approach: metadata first, then Week 1 workouts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY');
const MODEL = 'meta/llama-3.3-70b-instruct';
const API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

interface PlanRequest {
  user: { date_of_birth: string|null; gender: string|null; height_cm: number|null; weight_kg: number|null; unit_preference: string };
  goal: { goal_type: string; goal_subtype: string|null; target_value: string|null; target_event: string|null; target_date: string|null; current_level: string; available_days: number[]; preferred_long_session_day: number|null };
  stats: { recent_5k_time: string|null; recent_10k_time: string|null; recent_half_time: string|null; recent_marathon_time: string|null; weekly_mileage_km: number|null; max_heart_rate: number|null; resting_heart_rate: number|null; bench_press_1rm: number|null; squat_1rm: number|null; deadlift_1rm: number|null; overhead_press_1rm: number|null; injury_history: string|null; equipment_available: string[]|null; gym_access: boolean };
}

function repairJSON(text: string): string {
  let s = text.trim();
  s = s.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  // Remove trailing commas
  s = s.replace(/,\s*([}\]])/g, '$1');
  // Fix missing commas between properties (the #1 LLM JSON error)
  s = s.replace(/(")\s*\n\s*(")/g, '$1,$2');
  s = s.replace(/(})\s*\n\s*({)/g, '$1,$2');
  s = s.replace(/(])\s*\n\s*(")/g, '$1,$2');
  s = s.replace(/(\d)\s*\n\s*(")/g, '$1,$2');
  s = s.replace(/(true|false|null)\s*\n\s*(")/g, '$1,$2');
  // If truncated, find last valid closing brace
  let braceCount = 0;
  let lastValidEnd = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{') braceCount++;
    if (s[i] === '}') { braceCount--; if (braceCount === 0) lastValidEnd = i; }
  }
  if (braceCount > 0 && lastValidEnd > 0) s = s.substring(0, lastValidEnd + 1);
  return s;
}

function safeParseJSON(text: string): any {
  let s = text.trim();
  if (s.includes('```')) {
    s = s.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  }
  try {
    return JSON.parse(s);
  } catch {
    const repaired = repairJSON(s);
    return JSON.parse(repaired);
  }
}

async function callNVIDIA(systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`NVIDIA ${response.status}: ${err.substring(0, 200)}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty NVIDIA response');
  return content;
}

function buildUserSummary(req: PlanRequest): string {
  const { user, goal, stats } = req;
  const age = user.date_of_birth ? Math.floor((Date.now() - new Date(user.date_of_birth).getTime()) / (365.25*24*60*60*1000)) : null;
  const lifts = [
    stats.bench_press_1rm ? `Bench ${stats.bench_press_1rm}kg` : '',
    stats.squat_1rm ? `Squat ${stats.squat_1rm}kg` : '',
    stats.deadlift_1rm ? `DL ${stats.deadlift_1rm}kg` : '',
    stats.overhead_press_1rm ? `OHP ${stats.overhead_press_1rm}kg` : '',
  ].filter(Boolean).join(', ');
  const races = [
    stats.recent_5k_time ? `5k: ${stats.recent_5k_time}` : '',
    stats.recent_10k_time ? `10k: ${stats.recent_10k_time}` : '',
    stats.recent_half_time ? `Half: ${stats.recent_half_time}` : '',
  ].filter(Boolean).join(', ');

  return `User: ${age ?? '?'}yo ${user.gender ?? '?'}, ${user.height_cm ?? '?'}cm, ${user.weight_kg ?? '?'}kg
Goal: ${goal.goal_type}${goal.goal_subtype ? ` (${goal.goal_subtype})` : ''}, level: ${goal.current_level}
Training days: ${goal.available_days.join(',')} (1=Mon, 7=Sun)
${lifts ? `1RMs: ${lifts}` : ''}
${races ? `Race times: ${races}` : ''}
${stats.injury_history ? `Injuries: ${stats.injury_history}` : 'No injuries'}
Equipment: ${stats.equipment_available?.join(', ') ?? 'full gym'}, Gym: ${stats.gym_access ? 'yes' : 'no'}`;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const planRequest: PlanRequest = await req.json();
    const userSummary = buildUserSummary(planRequest);
    const { goal } = planRequest;
    const days = goal.available_days;
    const numDays = days.length;

    // Determine split type
    let splitDesc = '';
    if (goal.goal_type === 'strength' || goal.goal_type === 'muscle_gain') {
      if (numDays >= 4) {
        splitDesc = `4-day PHUL split: Day ${days[0]}=Upper Strength, Day ${days[1]}=Lower Strength, Day ${days[2]}=Upper Hypertrophy, Day ${days[3]}=Lower Hypertrophy`;
      } else if (numDays === 3) {
        splitDesc = `3-day split: Day ${days[0]}=Upper, Day ${days[1]}=Lower, Day ${days[2]}=Full Body`;
      } else {
        splitDesc = `${numDays}-day full body split`;
      }
    } else if (goal.goal_type === 'running') {
      splitDesc = `${numDays} running sessions per week with appropriate mix of easy, tempo, interval, and long runs`;
    } else {
      splitDesc = `${numDays} sessions per week mixing strength and cardio`;
    }

    // ═══════════════════════════════════════════════════════════
    // CALL 1: Plan metadata (~500 tokens)
    // ═══════════════════════════════════════════════════════════
    console.log('[generate-plan] Call 1: metadata');

    const metadataPrompt = `You are an elite fitness coach. Generate plan metadata for this user. Respond with VALID JSON ONLY.

${userSummary}
Split: ${splitDesc}

Return this exact JSON structure:
{"plan_name":"string","description":"1-2 sentences","total_weeks":5,"philosophy":"string","key_sessions":["string","string"],"progression_notes":"Week 1: 3-4 RIR introductory. Week 2: 2-3 RIR building. Week 3: 1-2 RIR hard. Week 4: 0-1 RIR overreach. Week 5: Deload.","weeks_overview":[{"week_number":1,"theme":"string","notes":"string"},{"week_number":2,"theme":"string","notes":"string"},{"week_number":3,"theme":"string","notes":"string"},{"week_number":4,"theme":"string","notes":"string"},{"week_number":5,"theme":"Deload","notes":"string"}]}`;

    const metadataRaw = await callNVIDIA(
      'You are a fitness coach. Respond with valid JSON only. No markdown.',
      metadataPrompt,
      800
    );
    console.log('[generate-plan] Call 1 done, length:', metadataRaw.length);

    const metadata = safeParseJSON(metadataRaw);

    // ═══════════════════════════════════════════════════════════
    // CALL 2: Week 1 workouts (~2500 tokens)
    // ═══════════════════════════════════════════════════════════
    console.log('[generate-plan] Call 2: workouts');

    let workoutRules = '';
    if (goal.goal_type === 'strength' || goal.goal_type === 'muscle_gain') {
      const bench = planRequest.stats.bench_press_1rm;
      const squat = planRequest.stats.squat_1rm;
      const dl = planRequest.stats.deadlift_1rm;
      const ohp = planRequest.stats.overhead_press_1rm;

      workoutRules = `Generate Week 1 workouts for a ${splitDesc}.

RULES:
- Compounds first, then isolation
- Stretched-position exercises: overhead tricep extensions, incline curls, seated leg curls, standing calf raises
- Strength days: 4-6 reps, RPE 8-9, 3-5 min rest, 7-8 exercises
- Hypertrophy days: 8-15 reps, RPE 7-8, 60-120s rest, 8-10 exercises, use supersets on arms
- Week 1 = 3-4 RIR on all working sets
- Include warm-up sets (bar, 50%, 70%) before FIRST compound only
- ${bench ? `Bench working weight: strength ${Math.round(bench*0.82)}kg, hyp ${Math.round(bench*0.68)}kg` : ''}
- ${squat ? `Squat working weight: strength ${Math.round(squat*0.82)}kg, hyp ${Math.round(squat*0.68)}kg` : ''}
- ${dl ? `Deadlift working weight: strength ${Math.round(dl*0.80)}kg, hyp ${Math.round(dl*0.65)}kg` : ''}
- ${ohp ? `OHP working weight: strength ${Math.round(ohp*0.82)}kg, hyp ${Math.round(ohp*0.68)}kg` : ''}
- Each exercise needs: name, notes (1-line why), sets array [{set_number, reps, weight_kg, type, rest_seconds, rpe}]
- type must be: "warmup" or "working"
- 18-24 working sets per session, realistic 55-70 min duration`;
    } else if (goal.goal_type === 'running') {
      workoutRules = `Generate Week 1 running workouts. ${numDays} sessions.
- Include easy runs, one tempo/threshold session, one interval or long run
- 80/20 split: 80% easy volume, 20% hard
- Each workout needs segments: [{type, distance_km, target_pace_min_km, description}]
- Segment types: warmup, easy, tempo, interval, recovery, cooldown, strides
- Include session_purpose for each workout`;
    } else {
      workoutRules = `Generate Week 1 workouts. ${numDays} sessions mixing strength and cardio.
- Strength: compound first, 3-4 sets, 8-12 reps
- Cardio: mix easy and interval sessions
- Each strength exercise needs: name, notes, sets [{set_number, reps, weight_kg, type, rest_seconds}]`;
    }

    const workoutPrompt = `${userSummary}

${workoutRules}

Respond with VALID JSON ONLY:
{"workouts":[{"day_of_week":${days[0]},"workout_type":"strength","title":"string","description":"string","estimated_duration_minutes":60,"workout_data":{"type":"strength","focus":"string","session_purpose":"string","exercises":[{"name":"string","notes":"string","sets":[{"set_number":1,"reps":5,"weight_kg":80,"type":"working","rest_seconds":180,"rpe":7}]}],"estimated_duration_minutes":60,"notes":"string"}}]}`;

    const workoutRaw = await callNVIDIA(
      'You are an elite strength & hypertrophy coach. Respond with valid JSON only. No markdown, no explanation.',
      workoutPrompt,
      3000
    );
    console.log('[generate-plan] Call 2 done, length:', workoutRaw.length);

    const workoutData = safeParseJSON(workoutRaw);

    // ═══════════════════════════════════════════════════════════
    // MERGE
    // ═══════════════════════════════════════════════════════════
    const plan = {
      plan_name: metadata.plan_name || 'Your Training Plan',
      description: metadata.description || 'Personalised training programme',
      total_weeks: metadata.total_weeks || 5,
      philosophy: metadata.philosophy || 'Progressive overload with autoregulation',
      key_sessions: metadata.key_sessions || [],
      progression_notes: metadata.progression_notes || '',
      weeks: [{
        week_number: 1,
        theme: metadata.weeks_overview?.[0]?.theme || 'Introductory',
        total_volume: null,
        notes: metadata.weeks_overview?.[0]?.notes || 'Week 1: 3-4 RIR, focus on form and finding working weights.',
        workouts: workoutData.workouts || [],
      }],
    };

    console.log('[generate-plan] Success. Workouts:', plan.weeks[0].workouts.length);

    return new Response(JSON.stringify(plan), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-plan] Error:', (error as Error).message);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
