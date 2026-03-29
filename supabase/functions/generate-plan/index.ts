// Supabase Edge Function: generate-plan
// Generates a personalised training plan using Claude AI
//
// Deploy with: supabase functions deploy generate-plan

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const NVIDIA_API_KEY = Deno.env.get('NVIDIA_API_KEY')!;
const NVIDIA_MODEL = 'meta/llama-3.3-70b-instruct';
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';


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
      roleDescription = `You are an elite-level running coach and exercise physiologist with 25+ years coaching runners from absolute beginners through Olympic-level athletes. You design plans with the precision of a Pfitzinger or Daniels program — every session has a physiological purpose, every pace is derived from race data, and every week fits into a periodized mesocycle.`;
      specificGuidelines = `
RUNNING-SPECIFIC RULES:

PACE DERIVATION (mandatory):
- All paces MUST be derived from the user's race times. If 5k time is provided, use the VDOT equivalent model:
  * Easy pace: VDOT easy (typically 5k pace + 60-90 sec/km)
  * Tempo/Threshold pace: approximately 5k pace + 20-30 sec/km (roughly 1-hour race pace)
  * Interval/VO2max pace: approximately 5k pace - 5 to +5 sec/km
  * Repetition pace: approximately 5k pace - 15 to -10 sec/km
  * Marathon pace: approximately 5k pace + 40-55 sec/km
  * Long run pace: easy pace or slightly slower
- Example: if 5k is 25:00 (5:00/km), then easy ~6:15-6:30/km, tempo ~5:20-5:30/km, intervals ~4:50-5:05/km, reps ~4:40-4:50/km
- If no race time is given, estimate conservatively from their current_level and weekly_mileage_km.
- Include effort zones (Zone 1-5 or RPE) alongside every pace target.

TRAINING STRUCTURE:
- Enforce 80/20 polarized distribution: 80% of weekly volume at easy/aerobic pace, 20% at moderate-to-hard
- Never increase weekly mileage by more than 10% week-over-week
- Include a deload/recovery week every 3-4 weeks (reduce volume by 30-40%, keep some intensity)
- Long run should not exceed 30-35% of weekly volume
- Include strides (4-6 x 80-100m at fast relaxed pace) on 1-2 easy days per week for neuromuscular development
- If training for a race with a target_date, include a 2-3 week taper reducing volume 40-60% while keeping short sharp efforts

SESSION TYPES:
- Easy Run: conversational pace, Zone 1-2. Include strides at end when specified.
- Tempo/Threshold Run: sustained effort at lactate threshold (Zone 3-4). Warm-up -> tempo block -> cool-down.
- Interval Session: VO2max work. Warm-up -> intervals with jog recovery -> cool-down. Specify exact rep distance, pace, and recovery duration.
- Long Run: aerobic endurance. Steady easy pace or with progression/race-pace segments in later weeks.
- Recovery Run: very easy, short. Zone 1 only.
- Fartlek: unstructured speed play mixing paces. Still specify segment guidelines.
- Hill Repeats: short hills for power, long hills for strength. Specify gradient if possible.

EVERY RUNNING WORKOUT must include:
- "session_purpose" in workout_data explaining the physiological adaptation targeted
- Structured warm-up (10-15 min easy jog + dynamic drills: leg swings, high knees, A-skips)
- Structured cool-down (5-10 min easy jog + static stretching notes)
- Segments array with exact distances and pace targets

RUNNING WORKOUT SEGMENTS STRUCTURE:
Each running workout must include a "segments" array with objects containing:
- type: "warmup" | "interval" | "recovery" | "steady" | "tempo" | "easy" | "cooldown" | "strides" | "hill"
- distance_km: exact distance for this segment
- target_pace_min_km: target pace as decimal (e.g., 5.5 = 5:30/km)
- effort_zone: "Zone 1" through "Zone 5" or RPE description
- description: what the athlete should feel/focus on`;
      break;

    case 'strength':
      roleDescription = `You are an elite strength & hypertrophy coach at the level of RP Strength, Jeff Nippard, or Mike Israetel. You have 25+ years programming for natural lifters from untrained beginners to competitive bodybuilders and powerlifters. Every exercise selection is backed by biomechanics and EMG data. Every set and rep scheme follows evidence-based hypertrophy and strength science. You program with surgical precision — nothing is random, every exercise serves a purpose within the mesocycle.`;
      specificGuidelines = `
STRENGTH-SPECIFIC RULES:

SPLIT STRUCTURE (mandatory - use PHUL: Power Upper, Power Lower, Hypertrophy Upper, Hypertrophy Lower):
- 4-day split recommended: Upper Strength, Lower Strength, Upper Hypertrophy, Lower Hypertrophy
- Power/Strength days: 7-8 exercises, 18-22 working sets, heavy compounds at RPE 8-9, 3-5 min rest
- Hypertrophy days: 8-10 exercises, 20-24 working sets, moderate loads at RPE 7-8, 2 min rest, more isolation and supersets
- If user has only 3 available days: Upper, Lower, Full Body
- If user has 5-6 days: Push/Pull/Legs x2 or PHUL + extra day

SESSION STRUCTURE (mandatory):
- 6-10 exercises per session
- Compound movements FIRST, then isolation movements
- Hit each muscle from multiple angles: e.g., for chest: flat press + incline press + flyes; for back: rows + pulldowns + face pulls
- Include warm-up sets before every compound lift (typically 2-3 progressively heavier warm-up sets)
- Use supersets for accessories where time-efficient (note which exercises are supersetted)
- Estimated realistic session duration: 45-60 minutes

REP RANGE DISTRIBUTION (evidence-based from Schoenfeld, Israetel):
- Distribute work across three bands: ~25% at 5-10 reps (heavy compounds), ~50% at 10-20 reps (hypertrophy sweet spot), ~25% at 20-30 reps (machines/isolation pump work)
- Strength days: 3-6 reps on main compounds, 6-8 on secondary compounds, 8-10 on accessories
- Hypertrophy days: 8-12 reps on compounds, 10-15 on isolation, 15-25+ on myo-reps/drop sets
- The traditional "8-12 hypertrophy zone" is NOT uniquely optimal — similar growth occurs across 6-20 reps when taken close to failure (Schoenfeld 2021)
- Base working weight off the user's 1RM data when available:
  * Hypertrophy sets: ~60-75% of 1RM
  * Strength sets: ~80-90% of 1RM
  * Warm-up ramp: bar x5 → 50% x5 → 70% x3 → 85% x1 → working sets
- If no 1RM data, use reasonable estimates based on current_level and bodyweight

RIR (Reps In Reserve) PROGRESSION ACROSS MESOCYCLE:
- Key principle: 1-3 RIR captures NEARLY ALL hypertrophic benefit while preserving volume capacity (Robinson et al. 2024, Refalo et al. 2024)
- Training to absolute failure produces identical growth to 1-2 RIR but causes 54% repetition drop-off on subsequent sets vs 27% at 3 RIR
- Reserve true failure (0 RIR) for LAST SET of isolation exercises only — never on heavy compounds
- Week 1: 3-4 RIR on all working sets (introductory volume, moderate effort)
- Week 2: 2-3 RIR (building intensity)
- Week 3: 1-2 RIR (hard — approaching failure on final sets of isolation)
- Week 4: 0-1 RIR (overreach — near failure on compounds, TO failure on isolation last sets)
- Deload week: 4+ RIR, reduce sets by 40-60%, maintain same exercises at ~80% of peak weight
- Express RIR as RPE: RIR 3 = RPE 7, RIR 2 = RPE 8, RIR 1 = RPE 9, RIR 0 = RPE 10

REST PERIODS (evidence-based — Schoenfeld 2016: 3-min rest > 1-min for both hypertrophy AND strength):
- Heavy compounds on strength days (squat, bench, deadlift): 3-5 minutes (preserves volume capacity)
- Moderate compounds (rows, pulldowns, leg press): 2-3 minutes
- Isolation exercises: 60-90 seconds
- Agonist-antagonist supersets (e.g. curl/extension, bench/row): 0 seconds between pair, 90 seconds between rounds — reduces session time by 36-50% with no performance loss
- Myo-reps: activation set of 12-20 reps, then mini-sets of 3-5 reps with 10-20 seconds rest — equivalent growth to 3 traditional sets in 70% less time
- Drop sets: on LAST SET of isolation exercises — equivalent growth to traditional sets in less time (Fonseca 2023)
- Warm-up sets: 60 seconds

PROGRESSIVE OVERLOAD:
- Progressive overload is the primary driver. Increase weight, reps, or sets systematically week to week.
- Across a 4-week block: add 1-2 reps per set each week OR add 2.5-5kg to compounds / 1-2.5kg to isolations
- Deload every 3-4 weeks: reduce volume (sets) by 40%, keep intensity (weight) at ~80% of peak week

EXERCISE SELECTION PRINCIPLES:
- Prioritize compound movements: Barbell Bench Press, Barbell Squat, Conventional/Sumo Deadlift, Overhead Press, Barbell/Dumbbell Rows, Pull-ups/Lat Pulldowns
- Follow compounds with complementary isolation work
- CRITICAL — prefer exercises that challenge muscles in STRETCHED/LENGTHENED positions (research shows significantly more growth):
  * Triceps: ALWAYS include overhead extensions (28% more growth than pushdowns alone)
  * Biceps: incline dumbbell curls or Bayesian cable curls (arm behind body = stretched long head)
  * Hamstrings: SEATED leg curls over lying (55% more growth in research)
  * Calves: STANDING calf raises over seated (12% vs 2% growth)
  * Chest: deep stretch cable flyes or dumbbell flyes with full ROM
  * Lats: overhead cable pullovers or lat pulldowns with full stretch at top
- Use Stimulus-to-Fatigue Ratio (SFR): prefer machine/cable variations for volume accumulation (less fatiguing), save heavy barbell for strength days
- Hit every muscle from multiple angles: chest needs flat + incline + fly pattern, back needs vertical pull + horizontal row + rear delt
- Consider injury history — substitute movements that aggravate injuries
- Consider equipment_available and gym_access
- Every exercise must have a "notes" field with a 1-line explanation of why it serves the user's goal

VOLUME TARGETS PER MUSCLE GROUP PER WEEK (sets):
- Chest: 10-20 (MEV 6, MAV 12-18, MRV 22)
- Back: 14-22 (MEV 10, MAV 14-22, MRV 25+)
- Quads: 12-18 (MEV 8, MAV 12-18, MRV 20+)
- Hamstrings: 10-16
- Side Delts: 12-22 (recover fast, need high volume)
- Rear Delts: 8-16
- Front Delts: 0-8 direct (get indirect from pressing)
- Biceps: 8-14
- Triceps: 8-14 (get indirect from pressing)
- Calves: 8-12
- Abs/Core: 6-12

EXERCISE DATA FORMAT (mandatory for every exercise):
Each exercise object must contain:
- "name": string (exercise name)
- "notes": string (1-line explanation of why this exercise is in the program for this user)
- "sets": array of set objects, each containing:
  - "set_number": number
  - "reps": number
  - "weight_kg": number or null (null for bodyweight exercises)
  - "type": "warmup" | "working" | "drop" | "amrap"
  - "rest_seconds": number
  - "rpe": number (optional, 1-10 scale)

INTENSIFICATION TECHNIQUES (use on hypertrophy days for time-efficiency):
- Myo-reps: best for isolation exercises (leg extensions, lateral raises, calf raises). Format: "set_type": "myo_rep"
- Drop sets: on final set of isolation exercises. Format: "set_type": "drop_set"
- Agonist-antagonist supersets: pair opposing muscles (curl+extension, bench+row). Format: "superset_with": "exercise name"
- These produce equivalent hypertrophy to straight sets in less time (Fonseca 2023 meta-analysis)
- NEVER use intensification techniques on heavy compound main lifts

REFERENCE PROGRAMME (adapt based on user's level, equipment, and goals):
Day 1 — Upper Strength: Bench 4x4-6, Row 4x4-6, DB OHP 3x6-8, Weighted Chin-ups 3x6-8, Curl 2x8-10, Overhead Extension 2x8-10, Face Pulls 2x12-15 (~20 sets, 55-70 min)
Day 2 — Lower Strength: Squat 4x4-6, RDL 3x6-8, Leg Press 3x8-10, Lying Leg Curl 3x8-10, Standing Calf Raise 4x8-12, Hanging Leg Raise 3x10-15 (~20 sets, 55-70 min)
Day 3 — Upper Hypertrophy: Incline DB Press 3x8-12, Cable Row 3x10-12, DB Lateral Raise 3x12-15, Lat Pulldown 3x10-12, SS: DB Curl+Pushdown 3x10-12, Cable Fly 2x12-15, Myo-rep Rear Delt Fly (~22 sets, 50-65 min)
Day 4 — Lower Hypertrophy: Hack Squat 3x8-12, Conv Deadlift 3x6-8, BSS 3x10-12/leg, Seated Leg Curl 3x10-12, Myo-rep Leg Ext, Drop-set Calf Raise 3x12-15, Cable Crunch 3x12-15 (~20 sets, 55-70 min)

SESSION DURATION: 45-90 minutes is productive (the "60-minute cortisol rule" is a myth — West & Phillips 2012). Strength sessions with longer rests may run 60-70 min. Hypertrophy sessions with supersets can be 50-65 min.

COOL-DOWN:
- Include cool-down guidance in the workout notes: 5 min light cardio + static stretching for worked muscle groups`;
      break;

    case 'triathlon':
      roleDescription = `You are an elite triathlon coach with 25+ years training athletes from sprint distance to full Ironman, including age-group podium finishers and professional triathletes. You understand the interplay between swim, bike, and run training and how to balance volume across three disciplines without overtraining.`;
      specificGuidelines = `
TRIATHLON-SPECIFIC RULES:
- Balance swim, bike, run volume appropriately for the target distance
- Include brick sessions (bike-to-run transitions) at least once per week in build phase
- Include strength work for injury prevention (2x per week in base phase, 1x in build/peak)
- Progressive volume increase with recovery weeks every 3-4 weeks
- Periodize: base phase -> build phase -> peak/race phase -> taper
- Open water swim practice when possible before race

SWIMMING SESSIONS must include:
- "session_purpose" in workout_data
- Structured warm-up: 200-400m easy swim + 4x50m drill work (catch-up, fingertip drag, etc.)
- Drill work for technique improvement (specify drill names and distances)
- Main set with specific distances and target times (e.g., 8x100m on 1:50 send-off)
- Cool-down: 200m easy swim
- If pool access is limited, include dryland alternatives: band pull-aparts, resistance band swim simulation, core work
- Estimated realistic duration

RUNNING SESSIONS must follow the same rules as the running goal_type (pacing from race data, 80/20 polarized, warm-up/cool-down, etc.)

CYCLING SESSIONS must include:
- "session_purpose" in workout_data
- Power zones or RPE targets for each segment
- Cadence targets where relevant
- Indoor/outdoor alternatives`;
      break;

    case 'swimming':
      roleDescription = `You are an elite swimming coach with 25+ years coaching competitive and recreational swimmers. You understand stroke mechanics, energy systems, and how to structure pool sessions for maximum improvement.`;
      specificGuidelines = `
SWIMMING-SPECIFIC RULES:
- "session_purpose" in workout_data for every session
- Include drill work in every session for technique reinforcement
- Main set with specific distances and target times or send-off intervals
- Structure: Warm-up (200-400m easy + drills) -> Pre-set (technique or threshold activation) -> Main Set -> Cool-down (200m easy)
- Drills to include: catch-up, fingertip drag, single-arm, kick sets, pull sets with buoy
- If pool access is limited, include dryland strength work: resistance bands, core stability, shoulder prehab
- Progressive volume and intensity across mesocycle
- Deload every 3-4 weeks
- Estimated realistic duration for each session`;
      break;

    case 'general_fitness':
      roleDescription = `You are an expert fitness coach who specialises in helping everyday people achieve sustainable health and fitness goals. You combine evidence-based strength training with appropriate cardio and mobility work, creating well-rounded programs that people actually enjoy and stick to.`;
      specificGuidelines = `
GENERAL FITNESS RULES:
- Mix strength and cardio for balanced fitness (typically 2-3 strength + 2-3 cardio sessions per week)
- Strength sessions follow the same quality standards as dedicated strength plans: compound first, proper warm-up sets, progressive overload
- Cardio sessions should vary: steady-state, intervals, and active recovery
- Include flexibility/mobility work (can be part of warm-up/cool-down or standalone sessions)
- Progress gradually — build habits before intensity
- Keep it achievable and enjoyable
- Every session needs a "session_purpose" in workout_data
- Estimated realistic duration for each session
- Cool-down guidance for every session`;
      break;
  }

  const age = user.date_of_birth
    ? Math.floor((Date.now() - new Date(user.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return `${roleDescription}

You are generating a personalised training plan. You MUST respond with valid JSON only - no markdown, no explanation, no text before or after the JSON.

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
${stats.recent_marathon_time ? `- Recent Marathon: ${stats.recent_marathon_time}` : ''}
${stats.weekly_mileage_km ? `- Weekly mileage: ${stats.weekly_mileage_km}km` : ''}
${stats.max_heart_rate ? `- Max heart rate: ${stats.max_heart_rate} bpm` : ''}
${stats.resting_heart_rate ? `- Resting heart rate: ${stats.resting_heart_rate} bpm` : ''}
${stats.bench_press_1rm ? `- Bench Press 1RM: ${stats.bench_press_1rm}kg` : ''}
${stats.squat_1rm ? `- Squat 1RM: ${stats.squat_1rm}kg` : ''}
${stats.deadlift_1rm ? `- Deadlift 1RM: ${stats.deadlift_1rm}kg` : ''}
${stats.overhead_press_1rm ? `- Overhead Press 1RM: ${stats.overhead_press_1rm}kg` : ''}
${stats.injury_history ? `- Injury history: ${stats.injury_history}` : '- No injuries reported'}
${stats.equipment_available ? `- Equipment: ${stats.equipment_available.join(', ')}` : ''}
${stats.gym_access ? '- Has gym access' : '- No gym access (home/bodyweight only)'}

${specificGuidelines}

GENERAL RULES FOR ALL PLANS:
- CRITICAL: Generate ONLY Week 1 workouts in detail. Include full plan metadata (name, philosophy, total_weeks, progression_notes) but ONLY output the first week's workouts. Future weeks are generated on-demand as the user progresses. This keeps the response size manageable.
- Keep total response under 4000 tokens.
- Plan should be 4-16 weeks depending on goal and target_date (but only Week 1 workouts in the response)
- Each week should have workouts ONLY on the available days specified
- Include rest days on non-training days
- Be extremely specific with paces, weights, distances, times — never be vague
- Consider injury history when selecting exercises and movements
- Every workout must have a "session_purpose" field in workout_data explaining why this session exists in the plan
- Every workout must have a realistic "estimated_duration_minutes"
- Every workout must include cool-down guidance (in notes or as a segment)
- Progressive overload and periodization must be evident across the weeks

RESPONSE FORMAT (strict JSON — no other output, keep under 4000 tokens):
{
  "plan_name": "string - catchy plan name",
  "description": "string - 1-2 sentence plan overview",
  "total_weeks": number (total plan length, e.g. 5 for 4+1 deload),
  "philosophy": "string - training philosophy for this plan",
  "key_sessions": ["string array - the 2-3 most important session types"],
  "progression_notes": "string - how the plan progresses week by week including RIR targets",
  "weeks": [
    // ONLY ONE WEEK (Week 1) — future weeks generated on demand
    {
      "week_number": number,
      "theme": "string - e.g. 'Base Building', 'Hypertrophy Block 1', 'Speed Development', 'Deload', 'Taper'",
      "total_distance_km": number (for running/triathlon) or null,
      "total_volume": "string description of volume for strength (e.g. '52 working sets')" or null,
      "notes": "string - coach notes for this week including RIR targets for strength or intensity distribution for running",
      "workouts": [
        {
          "day_of_week": number (1-7),
          "workout_type": "string - easy_run|tempo_run|interval_run|long_run|recovery_run|fartlek|hill_run|race_pace|strength|mobility|rest|swim|bike|brick",
          "title": "string - descriptive title e.g. 'Chest + Triceps — Hypertrophy' or 'Tempo Run — 6km at Threshold'",
          "description": "string - brief description of what the session involves",
          "workout_data": {
            // For running:
            // "type": "running",
            // "session_purpose": "string - why this session exists",
            // "total_distance_km": number,
            // "segments": [{"type": "warmup|interval|recovery|steady|tempo|easy|cooldown|strides|hill", "distance_km": number, "target_pace_min_km": number, "effort_zone": "string", "description": "string"}],
            // "notes": "string",
            // "estimated_duration_minutes": number

            // For strength:
            // "type": "strength",
            // "focus": "string - e.g. 'Chest + Triceps'",
            // "session_purpose": "string - why this session exists in the mesocycle",
            // "exercises": [
            //   {
            //     "name": "string",
            //     "notes": "string - 1-line explanation of why this exercise serves the user's goal",
            //     "sets": [
            //       {"set_number": 1, "reps": 10, "weight_kg": 40, "type": "warmup", "rest_seconds": 60},
            //       {"set_number": 2, "reps": 8, "weight_kg": 70, "type": "working", "rest_seconds": 120, "rpe": 7},
            //       {"set_number": 3, "reps": 8, "weight_kg": 75, "type": "working", "rest_seconds": 120, "rpe": 8}
            //     ]
            //   }
            // ],
            // "estimated_duration_minutes": number,
            // "notes": "string - session-level coaching notes including cool-down guidance"

            // For swimming:
            // "type": "swimming",
            // "session_purpose": "string",
            // "warmup": {"distance_m": number, "description": "string"},
            // "drills": [{"name": "string", "distance_m": number, "description": "string"}],
            // "main_set": {"description": "string", "sets": [{"distance_m": number, "reps": number, "target_time": "string", "rest_seconds": number}]},
            // "cooldown": {"distance_m": number, "description": "string"},
            // "dryland": [{"name": "string", "sets": number, "reps": number, "description": "string"}] (optional, for limited pool access),
            // "estimated_duration_minutes": number,
            // "notes": "string"
          },
          "estimated_duration_minutes": number
        }
      ]
    }
  ]
}`;
}

function repairJSON(text: string): string {
  let s = text.trim();
  // Remove markdown fences
  s = s.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  s = s.trim();
  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([}\]])/g, '$1');
  // Fix missing commas between properties (the #1 LLM JSON error)
  // Matches: }\n" or ]\n" or "value"\n" or number\n" — inserts comma
  s = s.replace(/([}\]"0-9])\s*\n\s*"/g, '$1,"');
  // If JSON is truncated (more { than }), find the last complete top-level object
  let braceCount = 0;
  let lastValidEnd = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '{') braceCount++;
    if (s[i] === '}') {
      braceCount--;
      if (braceCount === 0) lastValidEnd = i;
    }
  }
  if (braceCount > 0 && lastValidEnd > 0) {
    s = s.substring(0, lastValidEnd + 1);
  }
  return s;
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
    const planRequest: PlanRequest = await req.json();
    const systemPrompt = buildSystemPrompt(planRequest);

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: NVIDIA_MODEL,
        max_tokens: 4096,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: 'Generate the training plan now. Include full plan metadata but ONLY Week 1 workouts in detail. Respond with valid JSON only — no markdown, no explanation.',
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
      throw new Error('Empty response from AI');
    }

    // Parse the JSON response with repair logic
    const planJson = repairJSON(content);

    let plan;
    try {
      plan = JSON.parse(planJson);
    } catch (e) {
      // Try more aggressive repair
      const aggressive = planJson
        .replace(/[\x00-\x1F\x7F]/g, ' ')  // Remove control characters
        .replace(/,\s*,/g, ',')              // Remove double commas
        .replace(/\{\s*,/g, '{')             // Remove leading commas in objects
        .replace(/\[\s*,/g, '[');            // Remove leading commas in arrays
      try {
        plan = JSON.parse(aggressive);
      } catch (e2) {
        throw new Error('Failed to parse plan JSON: ' + (e2 as Error).message + '. Response length: ' + content.length);
      }
    }

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
