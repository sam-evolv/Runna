export type ExerciseCategory =
  | 'barbell'
  | 'dumbbell'
  | 'bodyweight'
  | 'machine'
  | 'cable'
  | 'kettlebell'
  | 'band'
  | 'hyrox'
  | 'cardio'
  | 'core';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'forearms'
  | 'full_body'
  | 'hip_flexors';

export type Equipment =
  | 'barbell'
  | 'dumbbells'
  | 'pull_up_bar'
  | 'bench'
  | 'squat_rack'
  | 'cable_machine'
  | 'kettlebell'
  | 'resistance_bands'
  | 'none'
  | 'machine'
  | 'ski_erg'
  | 'rower'
  | 'sled'
  | 'sandbag'
  | 'wall_ball'
  | 'box'
  | 'ab_wheel'
  | 'dip_bars';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ExerciseInfo {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  isCompound: boolean;
  difficulty: Difficulty;
  instructions: string[];
  coachingCues: string[];
  alternatives: string[];
}

// ---------------------------------------------------------------------------
// EXERCISES DATABASE
// ---------------------------------------------------------------------------

export const exercises: ExerciseInfo[] = [
  // ===========================================================================
  // BARBELL (12)
  // ===========================================================================
  {
    id: 'squat',
    name: 'Squat',
    category: 'barbell',
    muscleGroups: ['quads', 'glutes', 'hamstrings', 'core'],
    equipment: ['barbell', 'squat_rack'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Set up the barbell in a squat rack at roughly shoulder height. Step under the bar and position it across your upper traps.',
      'Unrack the bar and take two steps back. Set your feet shoulder-width apart with toes turned out slightly.',
      'Take a deep breath, brace your core, then bend at the hips and knees simultaneously to descend until your hip crease drops below your knee.',
      'Drive through your whole foot to stand back up, exhaling as you pass the sticking point.',
    ],
    coachingCues: [
      'Keep your chest tall and elbows pinned under the bar throughout the lift.',
      'Push your knees out over your toes — do not let them cave inward.',
      'Think about sitting between your hips, not behind them.',
    ],
    alternatives: ['front_squat', 'goblet_squat', 'bodyweight_squat'],
  },
  {
    id: 'bench_press',
    name: 'Bench Press',
    category: 'barbell',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['barbell', 'bench'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Lie on a flat bench with your eyes roughly under the bar. Plant your feet flat on the floor and set a slight arch in your upper back.',
      'Grip the bar just outside shoulder width and unrack it with straight arms directly over your shoulders.',
      'Lower the bar in a controlled arc to your mid-chest, keeping your elbows at roughly 45 degrees.',
      'Press the bar back up to lockout, driving through your chest and triceps.',
    ],
    coachingCues: [
      'Retract and depress your shoulder blades before you unrack — they stay pinned for the entire set.',
      'Leg drive starts from the ground: press your feet down to keep your upper back tight.',
      'Touch the bar to your chest on every rep — no half reps.',
    ],
    alternatives: ['incline_bench_press', 'dumbbell_press', 'push_up'],
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'barbell',
    muscleGroups: ['hamstrings', 'glutes', 'back', 'core'],
    equipment: ['barbell'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Stand with the bar over your mid-foot, feet about hip-width apart. Bend down and grip the bar just outside your shins.',
      'Drop your hips until your shins touch the bar, chest up, back flat, arms straight.',
      'Take a big breath, brace hard, and push the floor away with your legs while keeping the bar tight to your body.',
      'Lock out by driving your hips forward and standing tall. Reverse the motion to return the bar to the floor.',
    ],
    coachingCues: [
      'The bar should travel in a straight vertical line — keep it in contact with your legs.',
      'Do not round your lower back; think about pushing the floor away rather than pulling the bar up.',
      'Squeeze your glutes hard at lockout without leaning back excessively.',
    ],
    alternatives: ['sumo_deadlift', 'romanian_deadlift', 'hip_thrust'],
  },
  {
    id: 'overhead_press',
    name: 'Overhead Press',
    category: 'barbell',
    muscleGroups: ['shoulders', 'triceps', 'core'],
    equipment: ['barbell'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Unrack the barbell at collarbone height with a grip just outside your shoulders.',
      'Brace your core and squeeze your glutes to create a stable base.',
      'Press the bar straight overhead, moving your head out of the way by pulling your chin back slightly.',
      'Lock out with the bar directly over the midline of your foot, then lower under control back to the start.',
    ],
    coachingCues: [
      'Keep your ribs down — do not flare them or over-arch your lower back.',
      'Once the bar clears your forehead, push your head through the window to get the bar over your center of mass.',
      'Squeeze the bar hard and think about pushing yourself away from the bar.',
    ],
    alternatives: ['dumbbell_shoulder_press', 'pike_push_up', 'push_up'],
  },
  {
    id: 'barbell_row',
    name: 'Barbell Row',
    category: 'barbell',
    muscleGroups: ['back', 'biceps'],
    equipment: ['barbell'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Stand with feet hip-width apart and hinge forward at the hips until your torso is roughly 45 degrees from the floor.',
      'Grip the bar just outside your knees with an overhand grip, arms hanging straight.',
      'Pull the bar to your lower chest/upper abdomen by driving your elbows back and squeezing your shoulder blades together.',
      'Lower the bar under control until your arms are fully extended.',
    ],
    coachingCues: [
      'Keep your back flat and your core braced throughout — no rounding the lower back.',
      'Initiate the pull by retracting your shoulder blades, then bend the elbows.',
      'Avoid using momentum; the torso angle should stay constant.',
    ],
    alternatives: ['pendlay_row', 'dumbbell_row', 'cable_row'],
  },
  {
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift',
    category: 'barbell',
    muscleGroups: ['hamstrings', 'glutes', 'back'],
    equipment: ['barbell'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Hold a barbell at hip height with a shoulder-width overhand grip, standing with feet hip-width apart.',
      'Push your hips straight back while keeping a slight bend in the knees and your back flat.',
      'Lower the bar along your thighs until you feel a strong stretch in your hamstrings, typically around mid-shin.',
      'Drive your hips forward to return to the start, squeezing your glutes at the top.',
    ],
    coachingCues: [
      'Think about pushing your hips to the wall behind you — the movement is a hip hinge, not a squat.',
      'Keep the bar glued to your legs for the entire range of motion.',
      'Maintain a neutral spine; stop descending if your lower back starts to round.',
    ],
    alternatives: ['deadlift', 'dumbbell_row', 'hip_thrust'],
  },
  {
    id: 'front_squat',
    name: 'Front Squat',
    category: 'barbell',
    muscleGroups: ['quads', 'core', 'glutes'],
    equipment: ['barbell', 'squat_rack'],
    isCompound: true,
    difficulty: 'advanced',
    instructions: [
      'Set the bar in the rack at collarbone height. Step in and position the bar across the front of your shoulders in a clean grip or cross-arm grip.',
      'Unrack and step back. Set your feet shoulder-width with toes slightly out.',
      'Keeping your elbows as high as possible, descend into a deep squat until your hip crease passes below the knee.',
      'Drive up through your whole foot, maintaining an upright torso throughout.',
    ],
    coachingCues: [
      'Elbows HIGH — if they drop, the bar rolls forward and the lift fails.',
      'Front squats demand an upright torso; think about leading with your chest on the way up.',
      'Brace your core even harder than a back squat; the front load magnifies trunk demands.',
    ],
    alternatives: ['squat', 'goblet_squat', 'bodyweight_squat'],
  },
  {
    id: 'incline_bench_press',
    name: 'Incline Bench Press',
    category: 'barbell',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    equipment: ['barbell', 'bench'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Set an adjustable bench to a 30-45 degree incline and position it inside a rack or under a smith machine.',
      'Lie back with your eyes under the bar. Grip the bar slightly wider than shoulder width and unrack.',
      'Lower the bar to your upper chest just below the collarbone, keeping elbows at about 45 degrees.',
      'Press the bar back to lockout, keeping your shoulder blades pinned to the bench.',
    ],
    coachingCues: [
      'The steeper the incline, the more shoulder-dominant the press becomes — 30 degrees is the sweet spot for upper chest.',
      'Do not let your butt lift off the bench; maintain contact throughout.',
      'Lower the bar to a higher touch point than flat bench — roughly the clavicle area.',
    ],
    alternatives: ['bench_press', 'dumbbell_press', 'push_up'],
  },
  {
    id: 'close_grip_bench',
    name: 'Close Grip Bench Press',
    category: 'barbell',
    muscleGroups: ['triceps', 'chest', 'shoulders'],
    equipment: ['barbell', 'bench'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Lie on a flat bench and grip the bar with your hands roughly shoulder-width apart or slightly narrower.',
      'Unrack the bar and hold it directly above your shoulders with locked arms.',
      'Lower the bar to your lower chest, keeping your elbows tucked close to your sides at about 30 degrees.',
      'Press the bar back up by extending your elbows, focusing on contracting the triceps.',
    ],
    coachingCues: [
      'Hands should be no narrower than shoulder-width; going too narrow stresses the wrists.',
      'Tuck your elbows more than a standard bench press to shift emphasis to the triceps.',
      'Full lockout at the top is where the triceps work the hardest — do not cut reps short.',
    ],
    alternatives: ['tricep_pushdown', 'dip', 'tricep_extension'],
  },
  {
    id: 'sumo_deadlift',
    name: 'Sumo Deadlift',
    category: 'barbell',
    muscleGroups: ['glutes', 'quads', 'hamstrings', 'back', 'core'],
    equipment: ['barbell'],
    isCompound: true,
    difficulty: 'advanced',
    instructions: [
      'Stand with a wide stance so your shins are close to the collars of the bar. Point your toes out at roughly 45 degrees.',
      'Bend down and grip the bar between your legs with a shoulder-width or mixed grip.',
      'Drop your hips, open your knees over your toes, lift your chest, and flatten your back.',
      'Push the floor apart with your feet while pulling the bar up your legs to lockout.',
    ],
    coachingCues: [
      'Think about spreading the floor apart with your feet rather than pulling the bar up.',
      'Keep your hips close to the bar — the more upright your torso, the better.',
      'Lockout by driving your hips forward and squeezing your glutes, not by leaning back.',
    ],
    alternatives: ['deadlift', 'romanian_deadlift', 'hip_thrust'],
  },
  {
    id: 'hip_thrust',
    name: 'Hip Thrust',
    category: 'barbell',
    muscleGroups: ['glutes', 'hamstrings'],
    equipment: ['barbell', 'bench'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Sit on the floor with your upper back against a bench, knees bent, feet flat. Roll a loaded barbell over your legs until it sits in your hip crease.',
      'Use a pad or towel on the bar for comfort. Grip the bar with both hands to stabilize it.',
      'Drive through your heels and squeeze your glutes to raise your hips until your torso is parallel to the floor.',
      'Hold the top for a beat, then lower your hips back down under control.',
    ],
    coachingCues: [
      'At the top, your shins should be vertical — adjust foot position if needed.',
      'Tuck your chin slightly and look forward, not at the ceiling, to avoid over-extending your spine.',
      'Squeeze your glutes as hard as possible at lockout; this is the money zone.',
    ],
    alternatives: ['deadlift', 'romanian_deadlift', 'goblet_squat'],
  },
  {
    id: 'pendlay_row',
    name: 'Pendlay Row',
    category: 'barbell',
    muscleGroups: ['back', 'biceps', 'core'],
    equipment: ['barbell'],
    isCompound: true,
    difficulty: 'advanced',
    instructions: [
      'Set up like a deadlift: feet hip-width, bar over mid-foot. Hinge forward until your torso is parallel to the floor.',
      'Grip the bar with an overhand grip slightly wider than shoulder width. The bar should be on the floor at the start of each rep.',
      'Explosively row the bar to your lower chest, keeping your torso stationary and parallel to the ground.',
      'Lower the bar all the way back to the floor. Reset briefly, then pull the next rep.',
    ],
    coachingCues: [
      'Each rep starts from a dead stop on the floor — no bouncing or touch-and-go.',
      'Your torso must stay parallel to the ground; if you have to stand up to row it, the weight is too heavy.',
      'Drive your elbows toward the ceiling and squeeze your shoulder blades at the top.',
    ],
    alternatives: ['barbell_row', 'dumbbell_row', 'cable_row'],
  },

  // ===========================================================================
  // DUMBBELL (12)
  // ===========================================================================
  {
    id: 'dumbbell_press',
    name: 'Dumbbell Bench Press',
    category: 'dumbbell',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['dumbbells', 'bench'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Sit on a flat bench with a dumbbell in each hand resting on your thighs. Kick them up one at a time as you lie back.',
      'Start with the dumbbells at chest level, palms facing forward, elbows at roughly 45 degrees.',
      'Press both dumbbells up until your arms are fully extended, allowing them to come together slightly at the top.',
      'Lower the dumbbells back to chest level under control, feeling a stretch across your chest at the bottom.',
    ],
    coachingCues: [
      'Keep your shoulder blades squeezed together and pinned to the bench throughout.',
      'Do not clang the dumbbells together at the top — bring them close but keep tension on the chest.',
      'Lower with a 2-second tempo to maximize time under tension.',
    ],
    alternatives: ['bench_press', 'push_up', 'cable_fly'],
  },
  {
    id: 'dumbbell_shoulder_press',
    name: 'Dumbbell Shoulder Press',
    category: 'dumbbell',
    muscleGroups: ['shoulders', 'triceps'],
    equipment: ['dumbbells'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Sit on a bench set to 90 degrees or stand with feet shoulder-width apart. Hold a dumbbell in each hand at shoulder height, palms forward.',
      'Brace your core and press both dumbbells overhead until your arms are fully extended.',
      'At the top, the dumbbells should be almost touching directly over your head.',
      'Lower them back to shoulder level under control.',
    ],
    coachingCues: [
      'Do not lean back excessively — keep your ribs down and core tight.',
      'Press in a slight arc so the dumbbells end up over the crown of your head, not out in front.',
      'Full lockout overhead for maximum tricep and delt engagement.',
    ],
    alternatives: ['overhead_press', 'pike_push_up', 'lateral_raise'],
  },
  {
    id: 'dumbbell_row',
    name: 'Dumbbell Row',
    category: 'dumbbell',
    muscleGroups: ['back', 'biceps'],
    equipment: ['dumbbells', 'bench'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Place one knee and the same-side hand on a bench, the other foot flat on the floor. Hold a dumbbell in the free hand, arm hanging straight.',
      'Keeping your back flat and core braced, pull the dumbbell toward your hip by driving your elbow up and back.',
      'Squeeze your shoulder blade at the top of the movement and hold for a beat.',
      'Lower the dumbbell under control until your arm is fully extended. Complete all reps, then switch sides.',
    ],
    coachingCues: [
      'Think about pulling with your elbow, not your hand — this engages the lats more.',
      'Keep your torso square to the bench; do not rotate to heave the weight up.',
      'Let the dumbbell come to a dead hang at the bottom for a full stretch.',
    ],
    alternatives: ['barbell_row', 'cable_row', 'lat_pulldown'],
  },
  {
    id: 'dumbbell_lunge',
    name: 'Dumbbell Lunge',
    category: 'dumbbell',
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
    equipment: ['dumbbells'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Stand upright holding a dumbbell in each hand at your sides, feet together.',
      'Take a controlled step forward with one leg, landing heel-first.',
      'Lower your body until your front thigh is parallel to the ground and your back knee hovers just above the floor.',
      'Push through your front heel to return to the starting position. Alternate legs or complete all reps on one side.',
    ],
    coachingCues: [
      'Keep your torso upright throughout — do not lean forward over your front knee.',
      'Your front knee should track over your toes but not shoot far past them.',
      'Step far enough forward that both legs form roughly 90-degree angles at the bottom.',
    ],
    alternatives: ['bodyweight_lunge', 'goblet_squat', 'bodyweight_squat'],
  },
  {
    id: 'dumbbell_curl',
    name: 'Dumbbell Curl',
    category: 'dumbbell',
    muscleGroups: ['biceps'],
    equipment: ['dumbbells'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart, holding a dumbbell in each hand with arms fully extended, palms facing forward.',
      'Keeping your upper arms pinned to your sides, curl both dumbbells up toward your shoulders.',
      'Squeeze the biceps hard at the top of the movement.',
      'Lower the dumbbells under control back to the starting position.',
    ],
    coachingCues: [
      'Do not swing the weights — if you need momentum, the weight is too heavy.',
      'Keep your elbows stationary at your sides; only your forearms should move.',
      'Control the negative portion for at least 2 seconds.',
    ],
    alternatives: ['hammer_curl', 'cable_curl', 'chin_up'],
  },
  {
    id: 'tricep_extension',
    name: 'Overhead Tricep Extension',
    category: 'dumbbell',
    muscleGroups: ['triceps'],
    equipment: ['dumbbells'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Stand or sit and hold one dumbbell with both hands, gripping the top end. Press it overhead with arms extended.',
      'Keeping your upper arms close to your ears and elbows pointing forward, lower the dumbbell behind your head by bending at the elbows.',
      'Descend until your forearms are roughly parallel to the floor and you feel a stretch in the triceps.',
      'Extend your arms to press the dumbbell back to the starting position overhead.',
    ],
    coachingCues: [
      'Keep your elbows as close to your head as possible — do not let them flare out.',
      'Brace your core to prevent your lower back from arching.',
      'Focus on feeling the stretch at the bottom and the squeeze at the top.',
    ],
    alternatives: ['tricep_pushdown', 'close_grip_bench', 'dip'],
  },
  {
    id: 'lateral_raise',
    name: 'Lateral Raise',
    category: 'dumbbell',
    muscleGroups: ['shoulders'],
    equipment: ['dumbbells'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart, holding a dumbbell in each hand at your sides with palms facing inward.',
      'With a slight bend in the elbows, raise both arms out to the sides until they reach shoulder height.',
      'Pause briefly at the top with your arms parallel to the floor.',
      'Lower the dumbbells back to your sides slowly and with control.',
    ],
    coachingCues: [
      'Lead with your elbows, not your hands — imagine pouring water from a pitcher at the top.',
      'Do not shrug your traps; keep your shoulders down and relaxed.',
      'Use lighter weight with strict form rather than heavier weight with momentum.',
    ],
    alternatives: ['cable_lateral_raise', 'dumbbell_shoulder_press', 'face_pull'],
  },
  {
    id: 'goblet_squat',
    name: 'Goblet Squat',
    category: 'dumbbell',
    muscleGroups: ['quads', 'glutes', 'core'],
    equipment: ['dumbbells'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Hold a dumbbell vertically against your chest, cupping the top end with both hands. Stand with feet shoulder-width apart, toes slightly out.',
      'Keeping the dumbbell close to your body and your elbows inside your knees, squat down as deep as you can.',
      'At the bottom, use your elbows to push your knees out if needed.',
      'Drive through your feet to stand back up, keeping your chest tall.',
    ],
    coachingCues: [
      'The goblet position forces an upright torso — embrace it and sit deep.',
      'Push your knees out over your pinky toes for maximum depth.',
      'This is a great warm-up or teaching tool for the barbell squat.',
    ],
    alternatives: ['squat', 'front_squat', 'bodyweight_squat'],
  },
  {
    id: 'dumbbell_fly',
    name: 'Dumbbell Fly',
    category: 'dumbbell',
    muscleGroups: ['chest'],
    equipment: ['dumbbells', 'bench'],
    isCompound: false,
    difficulty: 'intermediate',
    instructions: [
      'Lie on a flat bench with a dumbbell in each hand, arms extended above your chest, palms facing each other.',
      'With a slight bend in the elbows, slowly lower both dumbbells out to the sides in a wide arc.',
      'Descend until you feel a deep stretch in your chest and your upper arms are roughly in line with the bench.',
      'Reverse the arc and bring the dumbbells back together above your chest, squeezing your pecs at the top.',
    ],
    coachingCues: [
      'Think about hugging a large tree — maintain the slight elbow bend throughout.',
      'Do not go too heavy; this is an isolation exercise that demands strict control.',
      'Focus on the stretch at the bottom and the squeeze at the top.',
    ],
    alternatives: ['cable_fly', 'dumbbell_press', 'push_up'],
  },
  {
    id: 'hammer_curl',
    name: 'Hammer Curl',
    category: 'dumbbell',
    muscleGroups: ['biceps', 'forearms'],
    equipment: ['dumbbells'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart, holding a dumbbell in each hand at your sides with palms facing your body (neutral grip).',
      'Keep your upper arms stationary and curl the dumbbells up toward your shoulders, maintaining the neutral grip throughout.',
      'Squeeze at the top, then lower the dumbbells back down under control.',
    ],
    coachingCues: [
      'The neutral grip targets the brachialis and brachioradialis more than standard curls.',
      'Keep your elbows pinned to your sides; no swinging.',
      'Alternate arms if you want to focus on one side at a time.',
    ],
    alternatives: ['dumbbell_curl', 'cable_curl', 'chin_up'],
  },
  {
    id: 'dumbbell_pullover',
    name: 'Dumbbell Pullover',
    category: 'dumbbell',
    muscleGroups: ['chest', 'back'],
    equipment: ['dumbbells', 'bench'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Lie perpendicular across a flat bench with only your upper back and shoulders on the bench, feet flat on the floor, hips slightly dropped.',
      'Hold one dumbbell with both hands, arms extended above your chest with a slight bend in the elbows.',
      'Slowly lower the dumbbell behind your head in an arc until you feel a stretch in your lats and chest.',
      'Pull the dumbbell back to the starting position above your chest by reversing the arc.',
    ],
    coachingCues: [
      'Keep the slight elbow bend locked throughout — do not turn this into a tricep extension.',
      'Drop your hips slightly to increase the stretch on the lats.',
      'Control the weight; do not let it pull you into excessive shoulder extension.',
    ],
    alternatives: ['cable_fly', 'lat_pulldown', 'dumbbell_fly'],
  },
  {
    id: 'reverse_fly',
    name: 'Reverse Fly',
    category: 'dumbbell',
    muscleGroups: ['shoulders', 'back'],
    equipment: ['dumbbells'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Hold a pair of light dumbbells and hinge forward at the hips until your torso is nearly parallel to the floor.',
      'Let the dumbbells hang directly below your shoulders, palms facing each other.',
      'With a slight bend in the elbows, raise both arms out to the sides, squeezing your rear deltoids and upper back.',
      'Pause at the top when your arms are roughly in line with your torso, then lower under control.',
    ],
    coachingCues: [
      'Focus on squeezing your shoulder blades together at the top.',
      'Use light weight — the rear delts are small muscles that respond to strict form, not heavy loads.',
      'Keep your torso angle constant; do not stand up to swing the weight.',
    ],
    alternatives: ['face_pull', 'cable_row', 'barbell_row'],
  },

  // ===========================================================================
  // BODYWEIGHT (12)
  // ===========================================================================
  {
    id: 'push_up',
    name: 'Push Up',
    category: 'bodyweight',
    muscleGroups: ['chest', 'triceps', 'shoulders', 'core'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Start in a high plank position with your hands slightly wider than shoulder-width, fingers spread, and body in a straight line from head to heels.',
      'Brace your core and squeeze your glutes to maintain a rigid body position.',
      'Lower your chest toward the floor by bending your elbows to roughly 45 degrees from your torso.',
      'Push back up to the start position by fully extending your arms.',
    ],
    coachingCues: [
      'Your body should move as one rigid plank — no sagging hips or piking up.',
      'Touch your chest to the floor (or very close) on every rep for full range of motion.',
      'Screw your hands into the floor to create external rotation torque at the shoulder.',
    ],
    alternatives: ['bench_press', 'dumbbell_press', 'dip'],
  },
  {
    id: 'pull_up',
    name: 'Pull Up',
    category: 'bodyweight',
    muscleGroups: ['back', 'biceps', 'forearms'],
    equipment: ['pull_up_bar'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Hang from a pull-up bar with an overhand grip slightly wider than shoulder width, arms fully extended.',
      'Retract your shoulder blades and initiate the pull by driving your elbows down toward your hips.',
      'Pull until your chin clears the bar, squeezing your lats hard at the top.',
      'Lower yourself under control back to a full dead hang.',
    ],
    coachingCues: [
      'Start every rep from a dead hang with your shoulders engaged — no half reps from a bent-arm position.',
      'Think about pulling the bar to your chest rather than your chin over the bar.',
      'Avoid excessive kipping or swinging; control the movement.',
    ],
    alternatives: ['lat_pulldown', 'chin_up', 'dumbbell_row'],
  },
  {
    id: 'chin_up',
    name: 'Chin Up',
    category: 'bodyweight',
    muscleGroups: ['back', 'biceps'],
    equipment: ['pull_up_bar'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Hang from a pull-up bar with an underhand (supinated) grip, hands shoulder-width apart, arms fully extended.',
      'Engage your lats and biceps to pull your body up until your chin clears the bar.',
      'Squeeze at the top, feeling your biceps and lats fully contracted.',
      'Lower yourself slowly back to a full dead hang.',
    ],
    coachingCues: [
      'The underhand grip recruits the biceps more than pull-ups — use this if bicep development is a priority.',
      'Keep your core tight and avoid swinging your legs.',
      'Full range of motion: dead hang to chin over bar on every rep.',
    ],
    alternatives: ['pull_up', 'lat_pulldown', 'cable_curl'],
  },
  {
    id: 'dip',
    name: 'Dip',
    category: 'bodyweight',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['dip_bars'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Grip the parallel bars and press yourself up to the top with arms fully locked out.',
      'Lean your torso slightly forward for chest emphasis, or stay upright for more tricep focus.',
      'Lower yourself by bending your elbows until your upper arms are at least parallel to the floor.',
      'Press back up to full lockout by driving through your palms.',
    ],
    coachingCues: [
      'Control the descent — dropping into the bottom position can stress the shoulders.',
      'Keep your elbows from flaring out too wide; aim for roughly 45 degrees.',
      'If bodyweight dips are too easy, add a dip belt with weight.',
    ],
    alternatives: ['close_grip_bench', 'push_up', 'tricep_pushdown'],
  },
  {
    id: 'bodyweight_lunge',
    name: 'Bodyweight Lunge',
    category: 'bodyweight',
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Stand tall with feet together and hands on your hips or at your sides.',
      'Step forward with one leg, landing heel-first.',
      'Lower your body until both knees form 90-degree angles, with the back knee hovering just above the floor.',
      'Push through the front heel to return to standing. Alternate legs.',
    ],
    coachingCues: [
      'Keep your torso upright and your core engaged throughout the movement.',
      'Step far enough forward that your front shin stays roughly vertical at the bottom.',
      'Control the descent — do not crash your back knee into the floor.',
    ],
    alternatives: ['dumbbell_lunge', 'bodyweight_squat', 'goblet_squat'],
  },
  {
    id: 'bodyweight_squat',
    name: 'Bodyweight Squat',
    category: 'bodyweight',
    muscleGroups: ['quads', 'glutes'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Stand with feet shoulder-width apart, toes slightly turned out, arms at your sides or extended in front for balance.',
      'Initiate the movement by pushing your hips back and bending your knees simultaneously.',
      'Descend as low as you comfortably can, ideally until your hip crease drops below your knees.',
      'Drive through your whole foot to stand back up to the start.',
    ],
    coachingCues: [
      'Keep your chest up and your weight balanced over the middle of your foot.',
      'Push your knees out over your toes — do not let them cave inward.',
      'Use this as a warm-up, a finisher, or a progression tool toward weighted squats.',
    ],
    alternatives: ['goblet_squat', 'squat', 'bodyweight_lunge'],
  },
  {
    id: 'plank',
    name: 'Plank',
    category: 'bodyweight',
    muscleGroups: ['core', 'shoulders'],
    equipment: ['none'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Start face-down on the floor, then prop yourself up on your forearms and toes.',
      'Position your elbows directly under your shoulders and clasp your hands together or keep them flat.',
      'Brace your core, squeeze your glutes, and maintain a straight line from your head to your heels.',
      'Hold this position for the prescribed time, breathing steadily.',
    ],
    coachingCues: [
      'Do not let your hips sag toward the floor — squeeze your glutes to keep them in line.',
      'Do not pike your hips up either — think long and flat, like a board.',
      'Breathe normally; do not hold your breath.',
    ],
    alternatives: ['dead_bug', 'hollow_hold', 'mountain_climber'],
  },
  {
    id: 'mountain_climber',
    name: 'Mountain Climber',
    category: 'bodyweight',
    muscleGroups: ['core', 'full_body', 'hip_flexors'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Start in a high plank position with your hands under your shoulders and body in a straight line.',
      'Drive one knee toward your chest as fast as you can while keeping your hips level.',
      'As you extend that leg back, simultaneously drive the other knee forward.',
      'Continue alternating legs at a rapid pace for the prescribed number of reps or time.',
    ],
    coachingCues: [
      'Keep your hips level with your shoulders — do not pike your butt up.',
      'The faster you go, the more cardiovascular demand; slow it down for more core focus.',
      'Press firmly through your hands to keep your upper body stable.',
    ],
    alternatives: ['burpee', 'plank', 'bodyweight_squat'],
  },
  {
    id: 'burpee',
    name: 'Burpee',
    category: 'bodyweight',
    muscleGroups: ['full_body'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Stand with feet shoulder-width apart.',
      'Drop into a squat, place your hands on the floor, and jump or step your feet back into a plank position.',
      'Perform a push-up (optional for added difficulty), then jump or step your feet back toward your hands.',
      'Explode up from the squat into a jump, reaching your arms overhead. Land softly and immediately begin the next rep.',
    ],
    coachingCues: [
      'Move fluidly — the transitions between positions should be smooth, not jerky.',
      'Land softly from the jump with bent knees to protect your joints.',
      'Scale by stepping back and forward instead of jumping if needed.',
    ],
    alternatives: ['mountain_climber', 'bodyweight_squat', 'box_jump'],
  },
  {
    id: 'box_jump',
    name: 'Box Jump',
    category: 'bodyweight',
    muscleGroups: ['quads', 'glutes', 'calves'],
    equipment: ['box'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Stand facing a sturdy box or platform at roughly arm-length distance, feet shoulder-width apart.',
      'Swing your arms back, hinge your hips slightly, and load your legs.',
      'Explode upward by swinging your arms forward and jumping onto the box, landing softly with both feet fully on the surface.',
      'Stand up completely on the box, then step down (do not jump down) and reset for the next rep.',
    ],
    coachingCues: [
      'Land softly with bent knees — aim for a quiet landing.',
      'Make sure your entire foot is on the box before standing up.',
      'Step down rather than jumping down to reduce eccentric stress on the Achilles and knees.',
    ],
    alternatives: ['burpee', 'bodyweight_squat', 'bodyweight_lunge'],
  },
  {
    id: 'pike_push_up',
    name: 'Pike Push Up',
    category: 'bodyweight',
    muscleGroups: ['shoulders', 'triceps'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Start in a downward-dog position: hands and feet on the floor, hips piked high, body forming an inverted V.',
      'Position your hands slightly wider than shoulder width with fingers pointing forward.',
      'Bend your elbows and lower the top of your head toward the floor between your hands.',
      'Press back up to the start by extending your elbows fully.',
    ],
    coachingCues: [
      'The more vertical your torso, the more this mimics an overhead press.',
      'Elevate your feet on a bench or box to increase difficulty.',
      'Keep your core tight and avoid rounding your lower back.',
    ],
    alternatives: ['overhead_press', 'dumbbell_shoulder_press', 'push_up'],
  },
  {
    id: 'inverted_row',
    name: 'Inverted Row',
    category: 'bodyweight',
    muscleGroups: ['back', 'biceps', 'core'],
    equipment: ['squat_rack'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Set a barbell in a squat rack at roughly waist height. Lie underneath and grip the bar with an overhand grip, hands slightly wider than shoulder width.',
      'Extend your legs with heels on the floor, body in a straight line from head to heels.',
      'Pull your chest up to the bar by retracting your shoulder blades and bending your elbows.',
      'Lower yourself back to the start under control, fully extending your arms.',
    ],
    coachingCues: [
      'Keep your body rigid like a plank — no sagging hips.',
      'The lower the bar, the harder the exercise; raise it to make it easier.',
      'Squeeze your shoulder blades together at the top of each rep.',
    ],
    alternatives: ['pull_up', 'dumbbell_row', 'cable_row'],
  },

  // ===========================================================================
  // CABLE (8)
  // ===========================================================================
  {
    id: 'cable_fly',
    name: 'Cable Fly',
    category: 'cable',
    muscleGroups: ['chest'],
    equipment: ['cable_machine'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Set both pulleys to roughly shoulder height. Stand in the center of the cable station and grab a handle in each hand.',
      'Step forward into a split stance and let your arms open wide with a slight bend in the elbows.',
      'Bring your hands together in front of your chest in a hugging motion, squeezing your pecs hard.',
      'Slowly return to the starting position, feeling the stretch in your chest.',
    ],
    coachingCues: [
      'Maintain the slight elbow bend throughout — do not straighten your arms.',
      'Adjust the pulley height to target different parts of the chest: high for lower chest, low for upper chest.',
      'Focus on the squeeze; cables provide constant tension that free weights cannot match.',
    ],
    alternatives: ['dumbbell_fly', 'dumbbell_press', 'push_up'],
  },
  {
    id: 'lat_pulldown',
    name: 'Lat Pulldown',
    category: 'cable',
    muscleGroups: ['back', 'biceps'],
    equipment: ['cable_machine'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Sit at a lat pulldown machine with your thighs locked under the pads. Grab the wide bar with an overhand grip, hands wider than shoulder width.',
      'Lean back slightly, puff your chest out, and pull the bar toward your upper chest.',
      'Squeeze your lats hard at the bottom of the movement, driving your elbows down and back.',
      'Control the bar back to the top, allowing your lats to fully stretch with arms extended.',
    ],
    coachingCues: [
      'Pull to your chest, not behind your neck — behind-the-neck pulldowns stress the shoulders unnecessarily.',
      'Think about pulling with your elbows, not your hands.',
      'Avoid leaning too far back and turning this into a row.',
    ],
    alternatives: ['pull_up', 'chin_up', 'dumbbell_row'],
  },
  {
    id: 'cable_row',
    name: 'Seated Cable Row',
    category: 'cable',
    muscleGroups: ['back', 'biceps'],
    equipment: ['cable_machine'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Sit at a cable row station with your feet on the platform, knees slightly bent. Grab the handle with both hands.',
      'Start with your arms extended and a slight forward lean, feeling the stretch in your lats.',
      'Pull the handle to your lower chest/upper abdomen by retracting your shoulder blades and driving your elbows back.',
      'Squeeze at the contraction point, then slowly extend your arms back to the start.',
    ],
    coachingCues: [
      'Do not use excessive body momentum — only a slight lean forward and back is acceptable.',
      'Initiate the pull with your shoulder blades before bending the elbows.',
      'Keep your chest up tall throughout the movement.',
    ],
    alternatives: ['barbell_row', 'dumbbell_row', 'lat_pulldown'],
  },
  {
    id: 'face_pull',
    name: 'Face Pull',
    category: 'cable',
    muscleGroups: ['shoulders', 'back'],
    equipment: ['cable_machine'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Set a cable machine to upper chest height with a rope attachment. Grab the rope with both hands, palms facing each other.',
      'Step back to create tension. Stand with feet shoulder-width apart.',
      'Pull the rope toward your face by driving your elbows high and wide, separating the rope ends as they approach your ears.',
      'Squeeze your rear delts and upper back at the end position, then slowly return to the start.',
    ],
    coachingCues: [
      'Your elbows should end up high and wide, like a double biceps pose.',
      'This is a rear delt and upper back exercise — do not turn it into a row by pulling to your chest.',
      'Go light and focus on the contraction; this is corrective work for shoulder health.',
    ],
    alternatives: ['reverse_fly', 'lateral_raise', 'cable_row'],
  },
  {
    id: 'tricep_pushdown',
    name: 'Tricep Pushdown',
    category: 'cable',
    muscleGroups: ['triceps'],
    equipment: ['cable_machine'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Attach a straight bar or rope to a high cable pulley. Stand facing the machine and grab the attachment with an overhand grip.',
      'Pin your upper arms to your sides with elbows bent at roughly 90 degrees.',
      'Push the attachment down by extending your elbows until your arms are fully straight.',
      'Slowly allow the attachment to rise back to the start by bending your elbows, keeping your upper arms stationary.',
    ],
    coachingCues: [
      'Your upper arms should not move at all — only the forearms pivot at the elbow.',
      'Squeeze the triceps hard at full extension.',
      'Use the rope attachment and split the ends at the bottom for extra peak contraction.',
    ],
    alternatives: ['tricep_extension', 'close_grip_bench', 'dip'],
  },
  {
    id: 'cable_curl',
    name: 'Cable Curl',
    category: 'cable',
    muscleGroups: ['biceps'],
    equipment: ['cable_machine'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Attach a straight bar or EZ-bar to a low cable pulley. Stand facing the machine with feet shoulder-width apart.',
      'Grip the bar with an underhand grip, arms fully extended toward the pulley.',
      'Curl the bar up toward your shoulders while keeping your upper arms pinned to your sides.',
      'Squeeze the biceps at the top, then lower the bar back down under control.',
    ],
    coachingCues: [
      'Cables provide constant tension throughout the range — take advantage of that by controlling every inch.',
      'Do not lean back or use body momentum to curl the weight.',
      'Keep your wrists straight and neutral; do not flex or extend them.',
    ],
    alternatives: ['dumbbell_curl', 'hammer_curl', 'chin_up'],
  },
  {
    id: 'cable_lateral_raise',
    name: 'Cable Lateral Raise',
    category: 'cable',
    muscleGroups: ['shoulders'],
    equipment: ['cable_machine'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Set a cable machine to the lowest position with a single handle. Stand sideways to the machine and grab the handle with the far hand.',
      'Let the cable cross in front of your body, arm extended down with a slight bend in the elbow.',
      'Raise your arm out to the side until it reaches shoulder height, leading with your elbow.',
      'Lower the arm back down slowly against the cable resistance.',
    ],
    coachingCues: [
      'Cables provide tension at the bottom of the range that dumbbells cannot match.',
      'Stand far enough from the machine that the cable has tension even at the bottom.',
      'Keep your torso still — do not lean to the side to cheat the weight up.',
    ],
    alternatives: ['lateral_raise', 'dumbbell_shoulder_press', 'face_pull'],
  },
  {
    id: 'cable_woodchop',
    name: 'Cable Woodchop',
    category: 'cable',
    muscleGroups: ['core', 'shoulders'],
    equipment: ['cable_machine'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Set a cable machine to the highest position with a single handle. Stand sideways to the machine with feet wider than shoulder-width.',
      'Grab the handle with both hands, arms extended above the shoulder closest to the machine.',
      'In one fluid motion, pull the cable diagonally across your body to the opposite hip, rotating your torso and pivoting on your feet.',
      'Return to the start under control. Complete all reps on one side, then switch.',
    ],
    coachingCues: [
      'The power comes from your core rotation, not your arms — your arms are just along for the ride.',
      'Keep your arms relatively straight throughout the chop.',
      'Control the return; do not let the weight stack yank you back.',
    ],
    alternatives: ['russian_twist', 'plank', 'mountain_climber'],
  },

  // ===========================================================================
  // CORE (8)
  // ===========================================================================
  {
    id: 'crunch',
    name: 'Crunch',
    category: 'core',
    muscleGroups: ['core'],
    equipment: ['none'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Lie on your back with knees bent, feet flat on the floor, and hands behind your head or across your chest.',
      'Brace your core and curl your shoulder blades off the floor by contracting your abdominals.',
      'Pause briefly at the top of the movement when your abs are fully contracted.',
      'Lower your shoulders back to the floor under control. Do not fully relax between reps.',
    ],
    coachingCues: [
      'Do not pull on your neck with your hands — let your abs do the work.',
      'The range of motion is short; you only need to lift your shoulder blades off the ground.',
      'Exhale forcefully as you crunch up to maximize ab activation.',
    ],
    alternatives: ['leg_raise', 'dead_bug', 'plank'],
  },
  {
    id: 'leg_raise',
    name: 'Hanging Leg Raise',
    category: 'core',
    muscleGroups: ['core', 'hip_flexors'],
    equipment: ['pull_up_bar'],
    isCompound: false,
    difficulty: 'intermediate',
    instructions: [
      'Hang from a pull-up bar with an overhand grip, arms fully extended, body straight.',
      'Keeping your legs straight (or slightly bent for an easier variation), raise them in front of you until they reach at least parallel to the floor.',
      'Pause at the top and contract your abs hard.',
      'Lower your legs back to the starting position under control, resisting the urge to swing.',
    ],
    coachingCues: [
      'Minimize swinging — if you start to pendulum, pause and reset between reps.',
      'Curl your pelvis forward at the top to fully engage the lower abs.',
      'Bend your knees to make it easier, straighten them to make it harder.',
    ],
    alternatives: ['crunch', 'hollow_hold', 'dead_bug'],
  },
  {
    id: 'russian_twist',
    name: 'Russian Twist',
    category: 'core',
    muscleGroups: ['core'],
    equipment: ['none'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Sit on the floor with knees bent and feet either flat or slightly elevated. Lean back until your torso is at roughly 45 degrees.',
      'Clasp your hands together in front of your chest (or hold a weight for added resistance).',
      'Rotate your torso to one side, bringing your hands toward the floor beside your hip.',
      'Rotate through center to the opposite side. Each side-to-side counts as one rep.',
    ],
    coachingCues: [
      'The rotation should come from your thoracic spine, not just swinging your arms side to side.',
      'Keep your chest tall even while leaning back — do not round your upper back.',
      'Lift your feet off the ground to increase the stability challenge.',
    ],
    alternatives: ['cable_woodchop', 'plank', 'crunch'],
  },
  {
    id: 'ab_wheel',
    name: 'Ab Wheel Rollout',
    category: 'core',
    muscleGroups: ['core', 'shoulders'],
    equipment: ['ab_wheel'],
    isCompound: true,
    difficulty: 'advanced',
    instructions: [
      'Kneel on the floor and grip an ab wheel with both hands directly below your shoulders.',
      'Brace your core, tuck your pelvis slightly, and slowly roll the wheel forward, extending your arms and body.',
      'Extend as far as you can while maintaining a flat back — do not let your hips sag.',
      'Pull the wheel back toward your knees by contracting your abs, returning to the start position.',
    ],
    coachingCues: [
      'Posterior pelvic tilt is key — tuck your tailbone under to keep your lower back safe.',
      'Start with small rollouts and increase the range as you get stronger.',
      'If your lower back starts to arch, you have gone too far — shorten the range.',
    ],
    alternatives: ['plank', 'hollow_hold', 'dead_bug'],
  },
  {
    id: 'hollow_hold',
    name: 'Hollow Hold',
    category: 'core',
    muscleGroups: ['core'],
    equipment: ['none'],
    isCompound: false,
    difficulty: 'intermediate',
    instructions: [
      'Lie on your back with arms extended overhead and legs straight.',
      'Press your lower back firmly into the floor by engaging your deep core muscles and tilting your pelvis.',
      'Lift your arms, shoulders, and legs off the floor simultaneously, forming a shallow banana or crescent shape.',
      'Hold this position for the prescribed time, breathing steadily. Your lower back must stay in contact with the floor.',
    ],
    coachingCues: [
      'If your lower back lifts off the floor, bend your knees or lower your legs closer to the ground.',
      'Think about making yourself as long as possible while keeping your lower back glued down.',
      'This is a foundational gymnastics position — master it and your core will be bulletproof.',
    ],
    alternatives: ['plank', 'dead_bug', 'crunch'],
  },
  {
    id: 'dead_bug',
    name: 'Dead Bug',
    category: 'core',
    muscleGroups: ['core'],
    equipment: ['none'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Lie on your back with arms extended toward the ceiling and knees bent at 90 degrees directly above your hips.',
      'Press your lower back into the floor and brace your core.',
      'Slowly extend your right arm overhead and your left leg toward the floor simultaneously, keeping your lower back pinned to the ground.',
      'Return to the start and repeat on the opposite side. Continue alternating.',
    ],
    coachingCues: [
      'Your lower back must stay in contact with the floor at all times — this is non-negotiable.',
      'Move slowly and deliberately; this is about motor control, not speed.',
      'Exhale as you extend and inhale as you return — the breathing pattern reinforces core bracing.',
    ],
    alternatives: ['plank', 'hollow_hold', 'crunch'],
  },
  {
    id: 'pallof_press',
    name: 'Pallof Press',
    category: 'core',
    muscleGroups: ['core'],
    equipment: ['cable_machine'],
    isCompound: false,
    difficulty: 'intermediate',
    instructions: [
      'Set a cable machine to chest height with a single handle. Stand sideways to the machine and grab the handle with both hands at your chest.',
      'Step away from the machine to create tension on the cable.',
      'Brace your core and press the handle straight out in front of your chest, resisting the rotation the cable tries to create.',
      'Hold for a beat at full extension, then bring the handle back to your chest. Complete all reps, then switch sides.',
    ],
    coachingCues: [
      'The goal is anti-rotation — your torso should not twist at all.',
      'The farther you stand from the machine, the harder it gets.',
      'Keep your shoulders square and your hips facing forward.',
    ],
    alternatives: ['plank', 'russian_twist', 'cable_woodchop'],
  },
  {
    id: 'bicycle_crunch',
    name: 'Bicycle Crunch',
    category: 'core',
    muscleGroups: ['core', 'hip_flexors'],
    equipment: ['none'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Lie on your back with hands behind your head, knees bent, and feet off the floor.',
      'Simultaneously extend your right leg while rotating your torso to bring your right elbow toward your left knee.',
      'Without pausing, switch sides: extend your left leg and bring your left elbow toward your right knee.',
      'Continue alternating in a smooth pedaling motion for the prescribed reps.',
    ],
    coachingCues: [
      'Rotate through your thoracic spine — do not just move your elbows; actually turn your torso.',
      'Keep your lower back pressed into the floor throughout.',
      'Go slowly for more time under tension rather than pedaling as fast as possible.',
    ],
    alternatives: ['crunch', 'russian_twist', 'mountain_climber'],
  },

  // ===========================================================================
  // HYROX STATIONS (8)
  // ===========================================================================
  {
    id: 'ski_erg',
    name: 'Ski Erg',
    category: 'hyrox',
    muscleGroups: ['back', 'shoulders', 'core', 'triceps'],
    equipment: ['ski_erg'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Stand facing the ski erg with feet shoulder-width apart. Reach up and grab both handles with an overhand grip.',
      'Initiate the pull by hinging at the hips and simultaneously pulling both arms down in a powerful arc.',
      'Follow through by driving the handles past your hips as your torso hinges forward, knees bending slightly.',
      'Return to the tall starting position by extending your hips and raising your arms overhead. Repeat in a smooth, rhythmic cycle.',
    ],
    coachingCues: [
      'The power comes from the hip hinge and core, not just your arms — think about slamming your hips back.',
      'Keep a consistent rhythm; the ski erg rewards pacing over sprinting.',
      'Breathe out forcefully on the pull phase.',
    ],
    alternatives: ['rowing', 'lat_pulldown', 'cable_row'],
  },
  {
    id: 'sled_push',
    name: 'Sled Push',
    category: 'hyrox',
    muscleGroups: ['quads', 'glutes', 'calves', 'core'],
    equipment: ['sled'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Load the sled with the prescribed weight. Stand behind it and grip the vertical posts at roughly chest or shoulder height.',
      'Lean into the sled with your arms extended, creating a roughly 45-degree body angle.',
      'Drive the sled forward by pushing off the ground one leg at a time, using short, powerful steps.',
      'Maintain a strong lean angle and drive through the balls of your feet to cover the required distance.',
    ],
    coachingCues: [
      'Stay low — a lower body angle gives you more horizontal force and makes the push easier.',
      'Take short, choppy steps rather than long strides.',
      'Keep your core braced and your arms locked out; your legs do the work.',
    ],
    alternatives: ['sled_pull', 'squat', 'bodyweight_lunge'],
  },
  {
    id: 'sled_pull',
    name: 'Sled Pull',
    category: 'hyrox',
    muscleGroups: ['back', 'biceps', 'hamstrings', 'glutes', 'core'],
    equipment: ['sled'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Attach a rope to a loaded sled and stand facing it at the far end of the rope.',
      'Get into a low athletic stance with knees bent and hips back.',
      'Reach forward, grab the rope, and pull it toward you hand over hand while maintaining your low stance.',
      'Continue pulling until the sled reaches you, keeping tension on the rope at all times.',
    ],
    coachingCues: [
      'Stay low and sit back — the lower your center of gravity, the more effective the pull.',
      'Use your whole body, not just your arms; drive with your legs and rotate your torso.',
      'Pull with a smooth, rhythmic motion rather than short, jerky tugs.',
    ],
    alternatives: ['sled_push', 'cable_row', 'barbell_row'],
  },
  {
    id: 'burpee_broad_jump',
    name: 'Burpee Broad Jump',
    category: 'hyrox',
    muscleGroups: ['full_body'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'advanced',
    instructions: [
      'Start standing with feet shoulder-width apart.',
      'Perform a standard burpee: drop down, place your hands on the floor, jump or step back to plank, perform a push-up, then jump or step your feet forward.',
      'Instead of jumping vertically, explode forward into a broad jump, swinging your arms to generate horizontal distance.',
      'Land softly with bent knees and immediately drop into the next burpee.',
    ],
    coachingCues: [
      'The broad jump should cover significant ground — use your arms to generate momentum.',
      'Pace yourself: this station is a grind, and going too fast early will destroy your legs.',
      'Land softly and absorb the impact through your quads to protect your joints.',
    ],
    alternatives: ['burpee', 'box_jump', 'mountain_climber'],
  },
  {
    id: 'rowing',
    name: 'Rowing',
    category: 'hyrox',
    muscleGroups: ['back', 'quads', 'hamstrings', 'core', 'biceps'],
    equipment: ['rower'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Sit on the rowing machine, strap your feet in, and grab the handle with an overhand grip.',
      'Start at the catch position: knees bent, shins vertical, torso leaning slightly forward with a flat back.',
      'Drive with your legs first, then lean back slightly, then pull the handle to your lower chest.',
      'Return by extending your arms first, then hinging forward, then bending your knees to slide back to the catch.',
    ],
    coachingCues: [
      'The sequence is legs-back-arms on the drive and arms-back-legs on the recovery. Never break this order.',
      'Power comes from the legs — roughly 60 percent legs, 20 percent back, 20 percent arms.',
      'Do not rush the recovery; the ratio should be roughly 1:2 (drive faster, recovery slower).',
    ],
    alternatives: ['ski_erg', 'cable_row', 'deadlift'],
  },
  {
    id: 'farmers_carry',
    name: 'Farmers Carry',
    category: 'hyrox',
    muscleGroups: ['forearms', 'core', 'shoulders', 'glutes'],
    equipment: ['dumbbells'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Stand between two heavy dumbbells or kettlebells. Deadlift them off the ground with a flat back.',
      'Stand tall with the weights at your sides, shoulders pulled back and down, chest up.',
      'Walk forward with controlled, purposeful steps, maintaining an upright posture.',
      'Cover the prescribed distance without setting the weights down, then carefully lower them back to the ground.',
    ],
    coachingCues: [
      'Do not let the weights pull you into a forward lean — stay tall with your shoulders back.',
      'Take short, quick steps rather than long strides for better stability.',
      'Crush the handles with your grip to engage the forearms and maintain control.',
    ],
    alternatives: ['deadlift', 'dumbbell_lunge', 'plank'],
  },
  {
    id: 'sandbag_lunge',
    name: 'Sandbag Lunges',
    category: 'hyrox',
    muscleGroups: ['quads', 'glutes', 'hamstrings', 'core'],
    equipment: ['sandbag'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Clean a sandbag up to your shoulders and drape it across the back of your neck, holding it steady with both hands.',
      'Step forward into a lunge, lowering your back knee until it nearly touches the ground.',
      'Drive through the front heel to stand up and bring your back foot forward.',
      'Immediately step forward with the opposite leg into the next lunge. Continue walking forward for the required distance.',
    ],
    coachingCues: [
      'Keep your torso as upright as possible despite the awkward load — fight the urge to lean forward.',
      'Take controlled steps; the sandbag will shift, so stay braced.',
      'In HYROX, this is typically 200m of lunges — pace yourself from the start.',
    ],
    alternatives: ['dumbbell_lunge', 'bodyweight_lunge', 'goblet_squat'],
  },
  {
    id: 'wall_balls',
    name: 'Wall Balls',
    category: 'hyrox',
    muscleGroups: ['quads', 'glutes', 'shoulders', 'core'],
    equipment: ['wall_ball'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Stand facing a wall about an arms-length away, holding a wall ball at chest height with both hands.',
      'Perform a full squat, keeping the ball at your chest and your elbows in.',
      'As you drive up from the squat, use your momentum to press/throw the ball up to a target on the wall (typically 3m for men, 2.7m for women).',
      'Catch the ball as it descends and immediately sink into the next squat.',
    ],
    coachingCues: [
      'The throw comes from the legs, not the arms — use the squat drive to launch the ball.',
      'Catch the ball high and absorb it into the squat; do not stop and reset between reps.',
      'Find a breathing rhythm: inhale on the way down, exhale on the throw.',
    ],
    alternatives: ['goblet_squat', 'overhead_press', 'dumbbell_shoulder_press'],
  },

  // ===========================================================================
  // CARDIO / RUNNING DRILLS (8)
  // ===========================================================================
  {
    id: 'strides',
    name: 'Strides',
    category: 'cardio',
    muscleGroups: ['quads', 'hamstrings', 'calves', 'glutes'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'After a warm-up jog, find a flat stretch of roughly 80-100 meters.',
      'Gradually accelerate over the first third until you reach about 90-95 percent of your max sprint speed.',
      'Hold that speed through the middle third, focusing on smooth, relaxed running form.',
      'Decelerate naturally over the final third. Walk or jog back to the start and repeat.',
    ],
    coachingCues: [
      'Strides should feel fast but relaxed — not an all-out sprint. Think smooth and controlled.',
      'Focus on quick turnover, high knees, and driving your arms.',
      'Great as a warm-up before a workout or as a form drill after an easy run.',
    ],
    alternatives: ['intervals', 'tempo_run', 'fartlek'],
  },
  {
    id: 'tempo_run',
    name: 'Tempo Run',
    category: 'cardio',
    muscleGroups: ['quads', 'hamstrings', 'calves', 'glutes', 'core'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Begin with 10-15 minutes of easy jogging to warm up.',
      'Increase to your tempo pace — roughly the pace you could sustain for 60 minutes in a race, or a comfortably hard effort.',
      'Hold the tempo pace for the prescribed duration (typically 20-40 minutes), maintaining an even effort.',
      'Cool down with 10-15 minutes of easy jogging and then stretch.',
    ],
    coachingCues: [
      'Tempo pace should feel comfortably hard — you can speak in short phrases but not hold a conversation.',
      'Keep your form relaxed: shoulders down, arms swinging naturally, slight forward lean from the ankles.',
      'Avoid starting too fast; the pace should be sustainable for the full duration.',
    ],
    alternatives: ['intervals', 'fartlek', 'strides'],
  },
  {
    id: 'intervals',
    name: 'Intervals',
    category: 'cardio',
    muscleGroups: ['quads', 'hamstrings', 'calves', 'glutes', 'core'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'advanced',
    instructions: [
      'Warm up with 10-15 minutes of easy jogging and a few strides.',
      'Run the prescribed interval distance (e.g. 400m, 800m, 1km) at a hard effort, typically faster than 5K race pace.',
      'Recover by jogging or walking for the prescribed rest period between intervals.',
      'Repeat for the prescribed number of reps. Cool down with 10 minutes of easy jogging.',
    ],
    coachingCues: [
      'Hit your target pace on the first interval — do not start too fast and blow up.',
      'Jog during recovery periods rather than standing still to keep blood flowing.',
      'Focus on maintaining form even when fatigued: head up, shoulders relaxed, quick feet.',
    ],
    alternatives: ['tempo_run', 'fartlek', 'hill_repeats'],
  },
  {
    id: 'hill_repeats',
    name: 'Hill Repeats',
    category: 'cardio',
    muscleGroups: ['quads', 'hamstrings', 'calves', 'glutes', 'core'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'advanced',
    instructions: [
      'Find a hill with a moderate to steep grade (4-8 percent) and a distance of 100-400 meters.',
      'After a thorough warm-up, run up the hill at a hard effort, focusing on driving your knees and pumping your arms.',
      'Jog or walk back down the hill for recovery.',
      'Repeat for the prescribed number of reps. Cool down with easy jogging on flat ground.',
    ],
    coachingCues: [
      'Shorten your stride on the uphill — quick, choppy steps are more efficient than bounding.',
      'Lean into the hill from your ankles, not your waist.',
      'Hill repeats build strength and power that directly translate to faster flat running.',
    ],
    alternatives: ['intervals', 'tempo_run', 'strides'],
  },
  {
    id: 'fartlek',
    name: 'Fartlek',
    category: 'cardio',
    muscleGroups: ['quads', 'hamstrings', 'calves', 'glutes'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Begin with 10-15 minutes of easy jogging to warm up.',
      'During the main session, alternate between periods of faster running and easy recovery running. The intervals can be structured (e.g. 2 minutes fast, 1 minute easy) or unstructured (pick up the pace to the next lamppost, then jog to the next).',
      'Vary the intensity and duration of the faster segments throughout the run.',
      'Cool down with 10 minutes of easy jogging.',
    ],
    coachingCues: [
      'Fartlek means speed play — have fun with it and vary the efforts.',
      'The fast segments can range from mile pace to half-marathon pace; mix it up.',
      'Listen to your body; if one surge feels too hard, back off and make the next one easier.',
    ],
    alternatives: ['tempo_run', 'intervals', 'strides'],
  },
  {
    id: 'easy_run',
    name: 'Easy Run',
    category: 'cardio',
    muscleGroups: ['quads', 'hamstrings', 'calves', 'glutes'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Head out the door at a relaxed, conversational pace.',
      'Maintain a pace where you could comfortably hold a full conversation without gasping.',
      'Run for the prescribed time or distance, keeping the effort level low and enjoyable.',
      'Focus on building aerobic base and recovery — do not push the pace.',
    ],
    coachingCues: [
      'Most of your weekly mileage should be at easy pace — do not turn easy runs into tempo runs.',
      'If you are breathing hard, you are going too fast. Slow down.',
      'Easy runs build the aerobic engine that powers everything else.',
    ],
    alternatives: ['tempo_run', 'fartlek', 'strides'],
  },
  {
    id: 'long_run',
    name: 'Long Run',
    category: 'cardio',
    muscleGroups: ['quads', 'hamstrings', 'calves', 'glutes', 'core'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Plan your route in advance and carry water or plan water stops for runs over 90 minutes.',
      'Start at an easy pace, even slower than your normal easy pace, to conserve energy.',
      'Maintain a steady effort for the prescribed distance, gradually settling into your rhythm.',
      'The last quarter of the run should feel challenging but controlled. Cool down and refuel promptly after finishing.',
    ],
    coachingCues: [
      'Start slower than you think you need to — you will thank yourself in the second half.',
      'Practice your race-day nutrition during long runs to train your gut.',
      'The long run is the most important run of the week for building endurance.',
    ],
    alternatives: ['easy_run', 'tempo_run', 'fartlek'],
  },
  {
    id: 'sprint',
    name: 'Sprint',
    category: 'cardio',
    muscleGroups: ['quads', 'hamstrings', 'calves', 'glutes'],
    equipment: ['none'],
    isCompound: true,
    difficulty: 'advanced',
    instructions: [
      'Warm up thoroughly with 10-15 minutes of jogging, dynamic stretching, and 3-4 build-up strides.',
      'Set up at the start line. From a standing or three-point stance, explode forward with maximum effort.',
      'Sprint the prescribed distance (typically 50-200 meters) at 100 percent intensity.',
      'Walk back to the start and rest fully (2-5 minutes) before the next rep. Full recovery is essential.',
    ],
    coachingCues: [
      'Drive your knees high and pump your arms aggressively — your arms set your leg speed.',
      'Stay relaxed even at max speed; tension in your face or shoulders wastes energy and slows you down.',
      'Full recovery between sprints is non-negotiable — this is speed work, not conditioning.',
    ],
    alternatives: ['intervals', 'strides', 'hill_repeats'],
  },

  // ===========================================================================
  // KETTLEBELL (4)
  // ===========================================================================
  {
    id: 'kettlebell_swing',
    name: 'Kettlebell Swing',
    category: 'kettlebell',
    muscleGroups: ['glutes', 'hamstrings', 'core', 'shoulders'],
    equipment: ['kettlebell'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Stand with feet slightly wider than hip-width, kettlebell on the floor about a foot in front of you.',
      'Hinge at the hips, grip the kettlebell with both hands, and hike it between your legs like a football snap.',
      'Explosively drive your hips forward, squeezing your glutes to swing the kettlebell up to chest or eye height.',
      'Let the kettlebell fall back between your legs by hinging your hips, then immediately drive forward into the next rep.',
    ],
    coachingCues: [
      'This is a hip hinge, not a squat — your knees bend slightly but the power comes from your glutes and hamstrings.',
      'The arms are just along for the ride; do not try to lift the bell with your shoulders.',
      'At the top, you should be standing tall with glutes and core squeezed tight.',
    ],
    alternatives: ['deadlift', 'hip_thrust', 'romanian_deadlift'],
  },
  {
    id: 'turkish_getup',
    name: 'Turkish Get-Up',
    category: 'kettlebell',
    muscleGroups: ['full_body', 'core', 'shoulders'],
    equipment: ['kettlebell'],
    isCompound: true,
    difficulty: 'advanced',
    instructions: [
      'Lie on your back holding a kettlebell in one hand, arm extended toward the ceiling, same-side knee bent with foot flat.',
      'Roll onto your opposite forearm, then press up to your hand while keeping the kettlebell locked out overhead.',
      'Sweep your straight leg underneath you into a kneeling position, then stand up fully while keeping the bell overhead.',
      'Reverse every step to return to the lying position. Keep the kettlebell locked out and your eyes on it throughout.',
    ],
    coachingCues: [
      'Go slowly — this is about control and stability, not speed.',
      'Keep your eyes on the kettlebell at all times until you are fully standing.',
      'Master each transition with no weight before adding the kettlebell.',
    ],
    alternatives: ['kettlebell_swing', 'overhead_press', 'plank'],
  },
  {
    id: 'kettlebell_clean_press',
    name: 'Kettlebell Clean and Press',
    category: 'kettlebell',
    muscleGroups: ['shoulders', 'core', 'glutes', 'forearms'],
    equipment: ['kettlebell'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Stand with a kettlebell between your feet. Hinge down and grip it with one hand.',
      'Clean the kettlebell to the rack position at your shoulder by extending your hips explosively and guiding it with your arm.',
      'From the rack position, press the kettlebell overhead to full lockout.',
      'Lower the kettlebell back to the rack, then back between your legs in a swing. Repeat.',
    ],
    coachingCues: [
      'The clean should be smooth — the bell arcs around your hand, not crashes into your forearm.',
      'Brace your core hard during the press to avoid leaning to the side.',
      'This is a full-body movement; use your hips to generate the initial power.',
    ],
    alternatives: ['overhead_press', 'dumbbell_shoulder_press', 'kettlebell_swing'],
  },
  {
    id: 'kettlebell_goblet_squat',
    name: 'Kettlebell Goblet Squat',
    category: 'kettlebell',
    muscleGroups: ['quads', 'glutes', 'core'],
    equipment: ['kettlebell'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Hold a kettlebell by the horns (sides of the handle) at chest height, elbows pointing down.',
      'Stand with feet shoulder-width apart, toes slightly turned out.',
      'Squat down as deep as you can, using your elbows to push your knees out if needed.',
      'Drive through your feet to stand back up, keeping your chest tall.',
    ],
    coachingCues: [
      'The kettlebell acts as a counterbalance, allowing deeper squats than bodyweight alone.',
      'Use your elbows to pry your knees open at the bottom for extra depth.',
      'Great as a warm-up, teaching tool, or high-rep conditioning exercise.',
    ],
    alternatives: ['goblet_squat', 'squat', 'bodyweight_squat'],
  },

  // ===========================================================================
  // MACHINE (4)
  // ===========================================================================
  {
    id: 'leg_press',
    name: 'Leg Press',
    category: 'machine',
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
    equipment: ['machine'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Sit in the leg press machine with your back flat against the pad. Place your feet shoulder-width apart on the platform.',
      'Release the safety handles and lower the platform by bending your knees until they reach roughly 90 degrees.',
      'Press the platform back up by driving through your whole foot, extending your legs without locking out your knees.',
      'Control the descent on every rep. Re-engage the safeties when your set is finished.',
    ],
    coachingCues: [
      'Do not let your lower back round off the pad at the bottom — stop before that happens.',
      'Place your feet higher on the platform for more glute and hamstring emphasis, lower for quads.',
      'Never fully lock out your knees under heavy load.',
    ],
    alternatives: ['squat', 'front_squat', 'goblet_squat'],
  },
  {
    id: 'leg_curl',
    name: 'Lying Leg Curl',
    category: 'machine',
    muscleGroups: ['hamstrings'],
    equipment: ['machine'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Lie face-down on the leg curl machine with the pad positioned just above your ankles.',
      'Grip the handles and keep your hips pressed into the bench.',
      'Curl the weight up by bending your knees, bringing the pad as close to your glutes as possible.',
      'Lower the weight back down under control without letting the stack touch at the bottom.',
    ],
    coachingCues: [
      'Keep your hips pressed down — do not let them lift off the bench.',
      'Squeeze your hamstrings hard at the top of each rep.',
      'Use a 2-3 second negative for maximum hamstring stimulation.',
    ],
    alternatives: ['romanian_deadlift', 'deadlift', 'kettlebell_swing'],
  },
  {
    id: 'chest_press_machine',
    name: 'Machine Chest Press',
    category: 'machine',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['machine'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Adjust the seat height so the handles are at mid-chest level. Sit with your back flat against the pad.',
      'Grip the handles and plant your feet flat on the floor.',
      'Press the handles forward until your arms are fully extended, squeezing your chest.',
      'Slowly return the handles to the start, feeling the stretch in your chest.',
    ],
    coachingCues: [
      'Keep your shoulder blades retracted against the pad throughout.',
      'Machines are great for training to failure safely without a spotter.',
      'Focus on the mind-muscle connection with your chest since the machine stabilizes the path.',
    ],
    alternatives: ['bench_press', 'dumbbell_press', 'push_up'],
  },
  {
    id: 'leg_extension',
    name: 'Leg Extension',
    category: 'machine',
    muscleGroups: ['quads'],
    equipment: ['machine'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Sit in the leg extension machine with your back against the pad. Position the ankle pad just above your feet.',
      'Grip the side handles for stability.',
      'Extend your legs by straightening your knees until your legs are fully extended.',
      'Lower the weight back under control without letting the stack touch.',
    ],
    coachingCues: [
      'Squeeze your quads hard at the top of each rep and hold for a beat.',
      'Control the negative — do not let the weight drop.',
      'Keep your back pressed into the pad; do not lean forward.',
    ],
    alternatives: ['squat', 'bodyweight_squat', 'leg_press'],
  },

  // ===========================================================================
  // BAND (2)
  // ===========================================================================
  {
    id: 'band_pull_apart',
    name: 'Band Pull Apart',
    category: 'band',
    muscleGroups: ['shoulders', 'back'],
    equipment: ['resistance_bands'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Hold a resistance band in front of you at shoulder height with both hands, arms extended and palms facing down.',
      'Pull the band apart by retracting your shoulder blades and moving your hands outward.',
      'Squeeze your upper back at the end position when the band touches your chest.',
      'Slowly return to the start, controlling the band tension.',
    ],
    coachingCues: [
      'Keep your arms straight throughout — the movement comes from your shoulder blades.',
      'This is an excellent warm-up or posture-correction exercise; do it daily.',
      'Use a lighter band and aim for higher reps (15-25) for best results.',
    ],
    alternatives: ['face_pull', 'reverse_fly', 'cable_row'],
  },
  {
    id: 'band_resisted_push_up',
    name: 'Band-Resisted Push Up',
    category: 'band',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['resistance_bands', 'none'],
    isCompound: true,
    difficulty: 'intermediate',
    instructions: [
      'Loop a resistance band across your upper back and hold each end under your palms.',
      'Set up in a standard push-up position with the band providing extra resistance at the top.',
      'Lower your chest to the floor as you would a normal push-up.',
      'Press back up against the increasing band tension, locking out at the top.',
    ],
    coachingCues: [
      'The band adds accommodating resistance — the lift gets harder as you press up.',
      'Keep your core braced and body in a straight line, just like a regular push-up.',
      'Start with a light band and progress to heavier bands as you adapt.',
    ],
    alternatives: ['push_up', 'bench_press', 'dumbbell_press'],
  },

  // ===========================================================================
  // ADDITIONAL EXERCISES (2)
  // ===========================================================================
  {
    id: 'calf_raise',
    name: 'Standing Calf Raise',
    category: 'bodyweight',
    muscleGroups: ['calves'],
    equipment: ['none'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Stand on the edge of a step or raised platform with the balls of your feet on the edge and your heels hanging off.',
      'Hold onto a wall or railing for balance.',
      'Rise up onto your toes as high as you can, squeezing your calves at the top.',
      'Lower your heels below the platform to get a full stretch, then repeat.',
    ],
    coachingCues: [
      'Full range of motion is key — stretch at the bottom, squeeze at the top.',
      'Pause at the top for 1-2 seconds for maximum calf activation.',
      'Add weight by holding a dumbbell in one hand for progression.',
    ],
    alternatives: ['bodyweight_squat', 'box_jump', 'bodyweight_lunge'],
  },
  {
    id: 'barbell_shrug',
    name: 'Barbell Shrug',
    category: 'barbell',
    muscleGroups: ['shoulders', 'forearms'],
    equipment: ['barbell'],
    isCompound: false,
    difficulty: 'beginner',
    instructions: [
      'Stand holding a barbell in front of your thighs with an overhand grip, hands shoulder-width apart.',
      'Keep your arms straight and shrug your shoulders straight up toward your ears.',
      'Squeeze your traps hard at the top and hold for a beat.',
      'Lower your shoulders back down under control.',
    ],
    coachingCues: [
      'Shrug straight up and down — do not roll your shoulders.',
      'Use straps if grip is a limiting factor so you can load the traps properly.',
      'Keep your chin neutral; do not jut it forward.',
    ],
    alternatives: ['farmers_carry', 'deadlift', 'face_pull'],
  },
  {
    id: 'dumbbell_step_up',
    name: 'Dumbbell Step Up',
    category: 'dumbbell',
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
    equipment: ['dumbbells', 'box'],
    isCompound: true,
    difficulty: 'beginner',
    instructions: [
      'Stand facing a box or bench, holding a dumbbell in each hand at your sides.',
      'Step up with one foot, placing your entire foot on the box.',
      'Drive through the heel of the elevated foot to stand up fully on the box, bringing the trailing foot up.',
      'Step back down with the trailing foot first, then the lead foot. Alternate legs or complete all reps on one side.',
    ],
    coachingCues: [
      'Do not push off the back foot — make the front leg do all the work.',
      'Keep your torso upright and your core braced throughout.',
      'Choose a box height where your thigh is parallel to the ground at the start.',
    ],
    alternatives: ['dumbbell_lunge', 'bodyweight_lunge', 'goblet_squat'],
  },
];

// ---------------------------------------------------------------------------
// UTILITY FUNCTIONS
// ---------------------------------------------------------------------------

export function getExercisesByMuscle(muscle: MuscleGroup): ExerciseInfo[] {
  return exercises.filter((e) => e.muscleGroups.includes(muscle));
}

export function getExercisesByEquipment(available: Equipment[]): ExerciseInfo[] {
  return exercises.filter((e) => e.equipment.every((eq) => available.includes(eq)));
}

export function getExerciseByName(name: string): ExerciseInfo | undefined {
  return exercises.find((e) => e.name.toLowerCase() === name.toLowerCase());
}

export function getExerciseById(id: string): ExerciseInfo | undefined {
  return exercises.find((e) => e.id === id);
}

export function getExercisesByCategory(category: ExerciseCategory): ExerciseInfo[] {
  return exercises.filter((e) => e.category === category);
}

export function getExercisesByDifficulty(difficulty: Difficulty): ExerciseInfo[] {
  return exercises.filter((e) => e.difficulty === difficulty);
}

export function getAlternatives(exerciseId: string): ExerciseInfo[] {
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return [];
  return exercise.alternatives
    .map((altId) => getExerciseById(altId))
    .filter((e): e is ExerciseInfo => e !== undefined);
}
