// services/workoutBriefing.ts
// Pre-workout briefings - explain the purpose, tips, and what to expect for each session

export interface WorkoutBriefing {
  title: string;
  purpose: string;
  whatToExpect: string;
  keyTips: string[];
  nutrition?: string;
  warmupAdvice?: string;
  mentalCue?: string;
}

export type RunWorkoutType = 'easy_run' | 'tempo_run' | 'interval_run' | 'long_run' | 'recovery_run' | 'fartlek' | 'hill_run' | 'race_pace';
export type StrengthWorkoutType = 'strength_upper' | 'strength_lower' | 'strength_full' | 'core' | 'mobility';

// Generate a briefing based on workout type and context
export function generateBriefing(params: {
  workoutType: string;
  weekNumber: number;
  totalWeeks: number;
  isKeySession: boolean;
  isDeloadWeek: boolean;
  isTaperWeek: boolean;
  targetEvent?: string;
  daysSinceLastSession?: number;
}): WorkoutBriefing {
  const { workoutType, weekNumber, totalWeeks, isKeySession, isDeloadWeek, isTaperWeek, targetEvent, daysSinceLastSession } = params;

  // Phase context
  const phaseContext = isTaperWeek
    ? 'You\'re in taper mode. Volume is dropping so you arrive at the start line fresh and sharp.'
    : isDeloadWeek
    ? 'This is a deload week. Reduced volume lets your body absorb the training from recent weeks.'
    : weekNumber <= totalWeeks * 0.3
    ? 'You\'re in the base building phase. Laying the aerobic foundation for everything that comes later.'
    : weekNumber <= totalWeeks * 0.7
    ? 'You\'re in the build phase. Sessions are getting more specific and challenging.'
    : 'You\'re in the peak phase. This is where the sharpening happens.';

  switch (workoutType) {
    case 'easy_run':
      return {
        title: 'Easy Run Briefing',
        purpose: 'Easy runs build your aerobic base without creating excessive fatigue. They increase mitochondrial density, improve fat oxidation, and promote recovery from harder sessions. Most of your running should be at this effort.',
        whatToExpect: 'This should feel comfortable throughout. You should be able to hold a full conversation. If you\'re breathing hard, you\'re going too fast.',
        keyTips: [
          'Conversational pace is the goal. If you can\'t chat, slow down.',
          'Don\'t check your pace obsessively. Go by feel and heart rate.',
          'Easy runs are where the magic happens. They\'re not "junk miles".',
          daysSinceLastSession && daysSinceLastSession >= 3 ? 'You\'ve had a few days off. Start slower than usual and ease into it.' : '',
        ].filter(Boolean),
        nutrition: 'No special fuelling needed for easy runs under 60 minutes. Have water available.',
        warmupAdvice: 'Start with 2-3 minutes of walking, then ease into a slow jog. Let your body warm up naturally.',
        mentalCue: 'Relax your shoulders, unclench your jaw, and enjoy the run.',
      };

    case 'tempo_run':
      return {
        title: 'Tempo Run Briefing',
        purpose: 'Tempo runs train your lactate threshold - the pace above which fatigue accumulates rapidly. Improving this threshold means you can sustain faster paces for longer. This is one of the most effective sessions in your plan.',
        whatToExpect: 'The tempo portion should feel "comfortably hard". You can say short sentences but couldn\'t hold a conversation. It should feel controlled but demanding.',
        keyTips: [
          'Don\'t start too fast. The effort should be even throughout.',
          'If you\'re gasping after the first km, you\'ve gone out too hard.',
          'Focus on rhythm and relaxation. Tension wastes energy.',
          isKeySession ? 'This is a key session this week. Give it your best effort.' : '',
        ].filter(Boolean),
        nutrition: 'Eat a light meal 2-3 hours before, or a small snack 30-60 minutes before.',
        warmupAdvice: 'At least 10 minutes of easy running before the tempo effort. Include 4-6 strides in the last 2 minutes.',
        mentalCue: 'Find a rhythm and lock in. This pace should feel sustainable but not easy.',
      };

    case 'interval_run':
      return {
        title: 'Interval Session Briefing',
        purpose: 'Intervals improve your VO2max (maximum oxygen uptake), running economy, and speed. They teach your body to process lactate faster and make race pace feel more comfortable.',
        whatToExpect: 'The fast reps will be hard. The recoveries should feel too short. That\'s by design. You\'re training your body to perform while fatigued.',
        keyTips: [
          'Consistency is key. Run each rep at similar pace rather than going out fast and dying.',
          'The recovery jog is part of the workout. Keep moving, don\'t stop.',
          'If you\'re more than 10 seconds per km slower on the last rep vs the first, you started too fast.',
          'Focus on form when tired. Tall posture, quick cadence, relaxed hands.',
        ],
        nutrition: 'Eat 2-3 hours before. Avoid anything heavy. A banana or toast works well.',
        warmupAdvice: 'Full warmup essential. 10-15 minutes easy running, then 4-6 strides building to interval pace.',
        mentalCue: phaseContext,
      };

    case 'long_run':
      return {
        title: 'Long Run Briefing',
        purpose: targetEvent
          ? `This long run builds the endurance you need for ${targetEvent}. It trains your body to burn fat efficiently, strengthens connective tissue, and builds mental toughness for race day.`
          : 'The long run is the cornerstone of endurance training. It builds aerobic capacity, teaches your body to burn fat, and strengthens you mentally for sustained effort.',
        whatToExpect: 'Start easy and stay easy for the first half. The effort may increase naturally in the back half - that\'s fine. The goal is to finish feeling like you could keep going, not collapsed.',
        keyTips: [
          'Start slower than you think. The first few km should feel almost too easy.',
          'Practice your race day nutrition on long runs. Nothing new on race day.',
          'If your plan says easy pace, mean it. Long runs are about time on feet, not speed.',
          isTaperWeek ? 'Taper long run - shorter than usual. Don\'t add distance because you feel good.' : '',
        ].filter(Boolean),
        nutrition: 'Eat a proper meal 3 hours before. For runs over 90 minutes, take carbohydrates every 30-45 minutes (gels, sweets, or isotonic drink).',
        warmupAdvice: 'The first 1-2 km IS your warmup. Start at a shuffle and build to easy pace.',
        mentalCue: 'Break it into chunks. Don\'t think about the full distance. Just run the next kilometre.',
      };

    case 'recovery_run':
      return {
        title: 'Recovery Run Briefing',
        purpose: 'Recovery runs flush metabolic waste from your muscles, promote blood flow for repair, and maintain your running habit without adding training stress. They should be the easiest runs of your week.',
        whatToExpect: 'This should feel almost too slow. If your legs are heavy from a hard session yesterday, that\'s normal. They\'ll loosen up after 10 minutes.',
        keyTips: [
          'Slower is better. If in doubt, slow down.',
          'Leave your ego at the door. This is not the time for pace.',
          'If you feel genuinely terrible after 10 minutes, it\'s okay to walk instead.',
        ],
        nutrition: 'Nothing special needed. Stay hydrated.',
        warmupAdvice: 'Start walking for 2 minutes, then shuffle into a very easy jog.',
        mentalCue: 'This run has one job: help you recover. Let it do its job.',
      };

    case 'strength_upper':
    case 'strength_lower':
    case 'strength_full':
      return {
        title: workoutType === 'strength_upper' ? 'Upper Body Briefing' : workoutType === 'strength_lower' ? 'Lower Body Briefing' : 'Full Body Briefing',
        purpose: 'Strength training for runners prevents injury, improves running economy, and helps maintain muscle mass. For strength-focused goals, these sessions are your primary training stimulus for muscle and strength gains.',
        whatToExpect: 'Focus on the compound movements first while you\'re fresh. Accessories come after. Rest fully between heavy sets.',
        keyTips: [
          'Quality over quantity. Perfect form on every rep.',
          'If the weight feels too light, increase by the smallest increment available.',
          'Last 1-2 reps of working sets should be genuinely challenging.',
          'Log your actual weights. Progressive overload only works if you track it.',
          isDeloadWeek ? 'Deload week - reduce all weights by 40% and focus purely on movement quality.' : '',
        ].filter(Boolean),
        nutrition: 'Protein-rich meal within 2 hours after. 20-40g protein.',
        warmupAdvice: '5 minutes of light cardio, then warm-up sets building to your working weight.',
        mentalCue: 'Every rep is an opportunity to get stronger. Make them all count.',
      };

    case 'core':
      return {
        title: 'Core Session Briefing',
        purpose: 'A strong core transfers force efficiently when running, maintains posture when fatigued, and prevents lower back and hip injuries.',
        whatToExpect: 'Circuit-style with short rest. Your core will fatigue but you shouldn\'t feel sharp pain anywhere.',
        keyTips: [
          'Brace your core as if someone is about to poke your stomach.',
          'Breathe throughout. Don\'t hold your breath.',
          'If an exercise causes lower back pain, stop and substitute.',
        ],
        mentalCue: 'This is the foundation that makes everything else work.',
      };

    case 'mobility':
      return {
        title: 'Mobility Session Briefing',
        purpose: 'Mobility work maintains range of motion, speeds recovery, and addresses tightness before it becomes an injury. Think of it as maintenance for your body.',
        whatToExpect: 'Slow, controlled movements and holds. Discomfort is okay. Pain is not.',
        keyTips: [
          'Hold each stretch for at least 30 seconds. Shorter is less effective.',
          'Breathe into the stretch. Deep breaths help your muscles relax.',
          'Focus on areas that feel tight from recent training.',
        ],
        mentalCue: 'Slow down. This is recovery time. Be present.',
      };

    default:
      return {
        title: 'Workout Briefing',
        purpose: 'Every session has a purpose in your plan.',
        whatToExpect: 'Listen to your body and execute as planned.',
        keyTips: ['Focus on form', 'Stay hydrated', 'Log your session when done'],
        mentalCue: phaseContext,
      };
  }
}
