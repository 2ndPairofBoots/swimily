// XP & Levels
export const LEVELS = [
  { name: "Novice", min: 0, max: 499 },
  { name: "Club Swimmer", min: 500, max: 1499 },
  { name: "Varsity", min: 1500, max: 3499 },
  { name: "Elite", min: 3500, max: 6999 },
  { name: "All-American", min: 7000, max: 11999 },
  { name: "Olympian", min: 12000, max: Infinity },
];

export const XP_PRACTICE = 75;
export const XP_DRYLAND = 60;

export const STROKES = ["FR", "BK", "BR", "FL", "IM", "K", "P", "DR"];
export const EFFORT_TAGS = ["easy", "mod", "build", "desc", "threshold", "race pace", "all out", "sprint", "neg split"];

export const FOCUS_OPTIONS = ["Aerobic", "Sprint", "Endurance", "Technique", "Race pace", "Recovery"];
export const TIME_OF_DAY = ["Morning", "Afternoon", "Evening", "Night"];

// FINA World Records SCY Male
export const WR_SCY_M = {
  "50 FR": 17.63,
  "100 FR": 40.00,
  "200 FR": 87.65,
  "500 FR": 202.36,
  "1000 FR": 416.95,
  "1650 FR": 841.47,
  "50 BK": 21.49,
  "100 BK": 43.49,
  "200 BK": 95.09,
  "50 BR": 24.68,
  "100 BR": 50.31,
  "200 BR": 113.66,
  "50 FL": 19.97,
  "100 FL": 43.72,
  "200 FL": 97.83,
  "100 IM": 47.84,
  "200 IM": 99.57,
  "400 IM": 225.07,
};

// FINA World Records SCY Female
export const WR_SCY_F = {
  "50 FR": 20.37,
  "100 FR": 45.06,
  "200 FR": 97.46,
  "500 FR": 228.52,
  "1000 FR": 469.09,
  "1650 FR": 925.20,
  "50 BK": 24.23,
  "100 BK": 49.21,
  "200 BK": 106.73,
  "50 BR": 27.34,
  "100 BR": 56.71,
  "200 BR": 126.47,
  "50 FL": 22.64,
  "100 FL": 49.21,
  "200 FL": 109.70,
  "100 IM": 52.86,
  "200 IM": 110.22,
  "400 IM": 249.43,
};

// FINA World Records LCM Male
export const WR_LCM_M = {
  "50 FR": 20.91,
  "100 FR": 46.91,
  "200 FR": 102.00,
  "400 FR": 220.07,
  "800 FR": 453.37,
  "1500 FR": 868.83,
  "50 BK": 24.00,
  "100 BK": 51.85,
  "200 BK": 111.92,
  "50 BR": 26.67,
  "100 BR": 57.13,
  "200 BR": 125.95,
  "50 FL": 22.27,
  "100 FL": 49.45,
  "200 FL": 110.73,
  "200 IM": 114.00,
  "400 IM": 245.63,
};

// FINA World Records LCM Female
export const WR_LCM_F = {
  "50 FR": 23.67,
  "100 FR": 51.71,
  "200 FR": 112.98,
  "400 FR": 238.19,
  "800 FR": 491.33,
  "1500 FR": 934.56,
  "50 BK": 27.06,
  "100 BK": 57.45,
  "200 BK": 120.25,
  "50 BR": 29.30,
  "100 BR": 64.13,
  "200 BR": 139.34,
  "50 FL": 24.43,
  "100 FL": 55.48,
  "200 FL": 121.81,
  "200 IM": 126.12,
  "400 IM": 271.53,
};

// SCY Events list
export const SCY_EVENTS = {
  Free: ["50 FR", "100 FR", "200 FR", "500 FR", "1000 FR", "1650 FR"],
  Back: ["50 BK", "100 BK", "200 BK"],
  Breast: ["50 BR", "100 BR", "200 BR"],
  Fly: ["50 FL", "100 FL", "200 FL"],
  IM: ["100 IM", "200 IM", "400 IM"],
};

// LCM Events list
export const LCM_EVENTS = {
  Free: ["50 FR", "100 FR", "200 FR", "400 FR", "800 FR", "1500 FR"],
  Back: ["50 BK", "100 BK", "200 BK"],
  Breast: ["50 BR", "100 BR", "200 BR"],
  Fly: ["50 FL", "100 FL", "200 FL"],
  IM: ["200 IM", "400 IM"],
};

// Cut standards order
export const CUT_ORDER = ["PRO", "NAT", "JRN", "WJR", "FTR", "SEC"];

// SCY Cut Standards Male (seconds)
export const CUTS_SCY_M = {
  "50 FR":  { SEC: 21.09, FTR: 20.79, WJR: 19.69, JRN: 19.49, NAT: 19.29, PRO: 18.99 },
  "100 FR": { SEC: 46.29, FTR: 45.79, WJR: 43.09, JRN: 42.69, NAT: 42.19, PRO: 41.49 },
  "200 FR": { SEC: 101.39, FTR: 100.19, WJR: 93.89, JRN: 92.89, NAT: 91.79, PRO: 90.09 },
  "500 FR": { SEC: 272.69, FTR: 269.49, WJR: 252.19, JRN: 249.49, NAT: 246.49, PRO: 241.09 },
  "1000 FR": { SEC: 563.89, FTR: 557.29, WJR: 521.99, JRN: 516.49, NAT: 510.49, PRO: 499.79 },
  "1650 FR": { SEC: 951.89, FTR: 940.49, WJR: 881.29, JRN: 872.29, NAT: 862.29, PRO: 844.89 },
  "50 BK":  { SEC: 24.39, FTR: 24.09, WJR: 22.79, JRN: 22.59, NAT: 22.39, PRO: 22.09 },
  "100 BK": { SEC: 52.59, FTR: 52.09, WJR: 48.69, JRN: 48.19, NAT: 47.59, PRO: 46.79 },
  "200 BK": { SEC: 115.49, FTR: 114.19, WJR: 106.49, JRN: 105.39, NAT: 104.09, PRO: 102.29 },
  "50 BR":  { SEC: 28.49, FTR: 28.09, WJR: 26.59, JRN: 26.29, NAT: 25.99, PRO: 25.59 },
  "100 BR": { SEC: 61.49, FTR: 60.79, WJR: 56.69, JRN: 56.09, NAT: 55.39, PRO: 54.49 },
  "200 BR": { SEC: 135.09, FTR: 133.79, WJR: 124.29, JRN: 123.09, NAT: 121.69, PRO: 119.49 },
  "50 FL":  { SEC: 22.89, FTR: 22.59, WJR: 21.39, JRN: 21.19, NAT: 20.99, PRO: 20.69 },
  "100 FL": { SEC: 49.99, FTR: 49.49, WJR: 46.49, JRN: 46.09, NAT: 45.59, PRO: 44.89 },
  "200 FL": { SEC: 110.29, FTR: 109.09, WJR: 101.89, JRN: 100.89, NAT: 99.69, PRO: 97.89 },
  "100 IM": { SEC: 54.09, FTR: 53.49, WJR: 50.69, JRN: 50.19, NAT: 49.69, PRO: 48.99 },
  "200 IM": { SEC: 116.79, FTR: 115.49, WJR: 107.69, JRN: 106.59, NAT: 105.29, PRO: 103.49 },
  "400 IM": { SEC: 252.79, FTR: 249.89, WJR: 232.99, JRN: 230.69, NAT: 228.09, PRO: 224.09 },
};

// SCY Cut Standards Female
export const CUTS_SCY_F = {
  "50 FR":  { SEC: 23.49, FTR: 23.09, WJR: 21.99, JRN: 21.79, NAT: 21.59, PRO: 21.19 },
  "100 FR": { SEC: 51.29, FTR: 50.69, WJR: 47.79, JRN: 47.29, NAT: 46.69, PRO: 45.89 },
  "200 FR": { SEC: 111.89, FTR: 110.59, WJR: 103.79, JRN: 102.79, NAT: 101.69, PRO: 99.89 },
  "500 FR": { SEC: 299.89, FTR: 296.69, WJR: 278.69, JRN: 275.99, NAT: 272.99, PRO: 267.49 },
  "1000 FR": { SEC: 617.09, FTR: 610.49, WJR: 573.19, JRN: 567.59, NAT: 561.59, PRO: 550.89 },
  "1650 FR": { SEC: 1036.69, FTR: 1025.29, WJR: 963.99, JRN: 954.99, NAT: 944.99, PRO: 927.59 },
  "50 BK":  { SEC: 27.59, FTR: 27.29, WJR: 25.79, JRN: 25.59, NAT: 25.39, PRO: 24.99 },
  "100 BK": { SEC: 57.99, FTR: 57.49, WJR: 53.99, JRN: 53.49, NAT: 52.89, PRO: 52.09 },
  "200 BK": { SEC: 127.39, FTR: 126.09, WJR: 118.49, JRN: 117.29, NAT: 115.89, PRO: 113.99 },
  "50 BR":  { SEC: 31.59, FTR: 31.29, WJR: 29.59, JRN: 29.29, NAT: 28.99, PRO: 28.49 },
  "100 BR": { SEC: 67.79, FTR: 67.09, WJR: 63.19, JRN: 62.59, NAT: 61.89, PRO: 60.99 },
  "200 BR": { SEC: 148.19, FTR: 146.79, WJR: 137.89, JRN: 136.59, NAT: 135.09, PRO: 132.79 },
  "50 FL":  { SEC: 25.89, FTR: 25.59, WJR: 24.19, JRN: 23.99, NAT: 23.69, PRO: 23.29 },
  "100 FL": { SEC: 55.59, FTR: 54.99, WJR: 51.89, JRN: 51.39, NAT: 50.79, PRO: 49.99 },
  "200 FL": { SEC: 121.89, FTR: 120.69, WJR: 113.59, JRN: 112.49, NAT: 111.09, PRO: 109.09 },
  "100 IM": { SEC: 59.19, FTR: 58.59, WJR: 55.49, JRN: 54.99, NAT: 54.39, PRO: 53.49 },
  "200 IM": { SEC: 127.39, FTR: 125.99, WJR: 118.29, JRN: 117.09, NAT: 115.69, PRO: 113.69 },
  "400 IM": { SEC: 274.39, FTR: 271.49, WJR: 255.39, JRN: 253.09, NAT: 250.39, PRO: 246.39 },
};

// LCM Cut Standards Male
export const CUTS_LCM_M = {
  "50 FR":  { SEC: 23.59, FTR: 23.29, WJR: 22.09, JRN: 21.89, NAT: 21.69, PRO: 21.39 },
  "100 FR": { SEC: 51.09, FTR: 50.49, WJR: 47.99, JRN: 47.59, NAT: 47.09, PRO: 46.39 },
  "200 FR": { SEC: 112.89, FTR: 111.59, WJR: 104.69, JRN: 103.69, NAT: 102.59, PRO: 100.79 },
  "400 FR": { SEC: 241.29, FTR: 238.59, WJR: 224.09, JRN: 221.79, NAT: 219.19, PRO: 215.09 },
  "800 FR": { SEC: 497.29, FTR: 491.99, WJR: 462.19, JRN: 457.39, NAT: 452.09, PRO: 443.09 },
  "1500 FR": { SEC: 943.29, FTR: 932.99, WJR: 876.39, JRN: 867.39, NAT: 857.39, PRO: 840.09 },
  "50 BK":  { SEC: 27.39, FTR: 27.09, WJR: 25.69, JRN: 25.39, NAT: 25.09, PRO: 24.69 },
  "100 BK": { SEC: 58.99, FTR: 58.39, WJR: 54.79, JRN: 54.29, NAT: 53.69, PRO: 52.89 },
  "200 BK": { SEC: 129.19, FTR: 127.89, WJR: 119.89, JRN: 118.69, NAT: 117.29, PRO: 115.29 },
  "50 BR":  { SEC: 29.89, FTR: 29.49, WJR: 27.89, JRN: 27.59, NAT: 27.29, PRO: 26.89 },
  "100 BR": { SEC: 63.49, FTR: 62.79, WJR: 59.09, JRN: 58.49, NAT: 57.79, PRO: 56.89 },
  "200 BR": { SEC: 139.59, FTR: 138.19, WJR: 129.59, JRN: 128.39, NAT: 126.89, PRO: 124.69 },
  "50 FL":  { SEC: 25.09, FTR: 24.79, WJR: 23.49, JRN: 23.19, NAT: 22.89, PRO: 22.49 },
  "100 FL": { SEC: 54.49, FTR: 53.89, WJR: 50.69, JRN: 50.19, NAT: 49.59, PRO: 48.79 },
  "200 FL": { SEC: 120.49, FTR: 119.19, WJR: 111.79, JRN: 110.69, NAT: 109.39, PRO: 107.49 },
  "200 IM": { SEC: 125.09, FTR: 123.79, WJR: 116.09, JRN: 114.99, NAT: 113.69, PRO: 111.79 },
  "400 IM": { SEC: 267.89, FTR: 265.09, WJR: 249.09, JRN: 246.79, NAT: 244.09, PRO: 240.09 },
};

// LCM Cut Standards Female
export const CUTS_LCM_F = {
  "50 FR":  { SEC: 26.39, FTR: 25.99, WJR: 24.59, JRN: 24.39, NAT: 24.19, PRO: 23.79 },
  "100 FR": { SEC: 56.69, FTR: 56.19, WJR: 52.89, JRN: 52.39, NAT: 51.79, PRO: 50.99 },
  "200 FR": { SEC: 123.89, FTR: 122.49, WJR: 115.09, JRN: 113.99, NAT: 112.79, PRO: 110.89 },
  "400 FR": { SEC: 261.39, FTR: 258.59, WJR: 243.19, JRN: 240.89, NAT: 238.29, PRO: 234.09 },
  "800 FR": { SEC: 537.49, FTR: 531.49, WJR: 499.69, JRN: 494.89, NAT: 489.49, PRO: 480.09 },
  "1500 FR": { SEC: 1021.29, FTR: 1010.99, WJR: 950.09, JRN: 941.09, NAT: 931.09, PRO: 913.69 },
  "50 BK":  { SEC: 30.49, FTR: 30.19, WJR: 28.59, JRN: 28.29, NAT: 27.99, PRO: 27.59 },
  "100 BK": { SEC: 64.99, FTR: 64.49, WJR: 60.59, JRN: 59.99, NAT: 59.29, PRO: 58.39 },
  "200 BK": { SEC: 141.89, FTR: 140.39, WJR: 132.19, JRN: 130.99, NAT: 129.49, PRO: 127.39 },
  "50 BR":  { SEC: 33.49, FTR: 33.09, WJR: 31.39, JRN: 31.09, NAT: 30.69, PRO: 30.19 },
  "100 BR": { SEC: 72.49, FTR: 71.79, WJR: 67.79, JRN: 67.09, NAT: 66.39, PRO: 65.29 },
  "200 BR": { SEC: 157.49, FTR: 155.99, WJR: 147.09, JRN: 145.69, NAT: 144.09, PRO: 141.89 },
  "50 FL":  { SEC: 27.99, FTR: 27.59, WJR: 26.19, JRN: 25.89, NAT: 25.59, PRO: 25.09 },
  "100 FL": { SEC: 60.89, FTR: 60.29, WJR: 56.89, JRN: 56.39, NAT: 55.69, PRO: 54.89 },
  "200 FL": { SEC: 133.99, FTR: 132.59, WJR: 124.79, JRN: 123.59, NAT: 122.09, PRO: 119.89 },
  "200 IM": { SEC: 138.59, FTR: 137.09, WJR: 128.79, JRN: 127.59, NAT: 126.09, PRO: 123.99 },
  "400 IM": { SEC: 296.09, FTR: 293.09, WJR: 276.09, JRN: 273.59, NAT: 270.79, PRO: 266.69 },
};

export const SWIM_EQUIPMENT = ["Fins", "Paddles", "Pull buoy", "Kickboard", "Snorkel", "Resistance band", "Ankle band", "Tempo trainer", "Parachute"];

export const WORKOUT_EQUIPMENT = {
  "Free Weights": ["Dumbbells", "Barbells", "Kettlebells", "Weight plates"],
  "Benches & Racks": ["Flat bench", "Incline bench", "Squat rack", "Pull-up bar"],
  "Machines": ["Cable machine", "Lat pulldown", "Leg press", "Chest press machine", "Row machine"],
  "Cable": ["Cable crossover", "Functional trainer"],
  "Specialty": ["TRX/Suspension trainer", "Battle ropes", "Sled/Prowler", "GHD machine"],
  "Accessories": ["Resistance bands", "Foam roller", "Ab wheel", "Medicine ball", "Jump rope"],
};

export const RECOVERY_EQUIPMENT = ["Foam roller", "Massage gun", "Ice bath/tub", "Compression sleeves", "TENS unit", "Stretch strap", "Yoga mat", "Sauna access"];

// Shared cut colors (badge/pill styles)
export const CUT_COLORS = {
  PRO: "text-purple-400 border-purple-400/30 bg-purple-500/10",
  NAT: "text-red-400 border-red-400/30 bg-red-500/10",
  JRN: "text-orange-400 border-orange-400/30 bg-orange-500/10",
  WJR: "text-yellow-400 border-yellow-400/30 bg-yellow-500/10",
  FTR: "text-green-400 border-green-400/30 bg-green-500/10",
  SEC: "text-cyan-400 border-cyan-400/30 bg-cyan-500/10",
};

// Dryland workouts PPL
export const DRYLAND_WORKOUTS = {
  Push: {
    warmup: ["Arm circles x20 each direction", "Band pull-aparts 3x15", "Shoulder CAR x10 each", "Push-up to down-dog x10"],
    exercises: [
      { name: "Barbell Bench Press", sets: "4x8", muscle: "Chest", benefit: "Power off the block & underwater dolphin kicks", equipment: ["Barbells", "Flat bench"] },
      { name: "DB Incline Press", sets: "3x10", muscle: "Upper Chest", benefit: "Shoulder stability for freestyle", equipment: ["Dumbbells", "Incline bench"] },
      { name: "Overhead Press", sets: "3x8", muscle: "Shoulders", benefit: "Freestyle catch & pull power", equipment: ["Barbells", "Dumbbells"] },
      { name: "Lateral Raises", sets: "3x15", muscle: "Side delts", benefit: "Stroke balance & shoulder health", equipment: ["Dumbbells", "Cable machine"] },
      { name: "Tricep Pushdowns", sets: "3x12", muscle: "Triceps", benefit: "Finish phase power", equipment: ["Cable machine"] },
      { name: "Push-ups", sets: "3x max", muscle: "Chest/Triceps", benefit: "General upper body endurance", equipment: [] },
    ],
    cooldown: ["Chest doorway stretch 2x30s", "Overhead tricep stretch 2x30s", "Cross-body shoulder stretch 2x30s"],
  },
  Pull: {
    warmup: ["Band pull-aparts 3x20", "Face pulls 3x15", "Scapular push-ups 3x10", "Dead hang 3x30s"],
    exercises: [
      { name: "Pull-ups", sets: "4x6-8", muscle: "Lats/Biceps", benefit: "Freestyle & butterfly pull power", equipment: ["Pull-up bar"] },
      { name: "Barbell Row", sets: "4x8", muscle: "Upper back", benefit: "Catch position strength", equipment: ["Barbells"] },
      { name: "Lat Pulldown", sets: "3x10", muscle: "Lats", benefit: "Underwater dolphin power", equipment: ["Lat pulldown"] },
      { name: "Seated Cable Row", sets: "3x12", muscle: "Mid back", benefit: "Backstroke pull phase", equipment: ["Cable machine"] },
      { name: "Face Pulls", sets: "3x15", muscle: "Rear delts", benefit: "Rotator cuff health", equipment: ["Cable machine", "Resistance bands"] },
      { name: "Bicep Curls", sets: "3x12", muscle: "Biceps", benefit: "Breaststroke & butterfly pull", equipment: ["Dumbbells", "Barbells"] },
    ],
    cooldown: ["Lat stretch on rack 2x30s", "Child's pose 60s", "Thread-the-needle 2x30s each"],
  },
  Legs: {
    warmup: ["Leg swings 2x20 each", "Hip circles 2x15 each", "Bodyweight squat x20", "Glute bridges 2x20"],
    exercises: [
      { name: "Barbell Back Squat", sets: "4x6", muscle: "Quads/Glutes", benefit: "Breaststroke kick & start power", equipment: ["Barbells", "Squat rack"] },
      { name: "Romanian Deadlift", sets: "4x8", muscle: "Hamstrings/Glutes", benefit: "Turns & underwater dolphin", equipment: ["Barbells", "Dumbbells"] },
      { name: "Leg Press", sets: "3x12", muscle: "Quads", benefit: "Kick power & endurance", equipment: ["Leg press"] },
      { name: "Walking Lunges", sets: "3x12 each", muscle: "Quads/Glutes", benefit: "Unilateral stability for turns", equipment: [] },
      { name: "Calf Raises", sets: "4x20", muscle: "Calves", benefit: "Ankle flexibility & kick efficiency", equipment: [] },
      { name: "Nordic Hamstring Curls", sets: "3x8", muscle: "Hamstrings", benefit: "Dolphin kick strength", equipment: ["GHD machine"] },
    ],
    cooldown: ["Pigeon pose 2x45s each", "Hip flexor stretch 2x30s each", "Hamstring stretch 2x30s each"],
  },
};