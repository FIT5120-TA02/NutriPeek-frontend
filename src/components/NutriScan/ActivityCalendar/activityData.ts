/**
 * Activity intensity levels
 */
export type ActivityIntensity = 'low' | 'medium' | 'high';

export interface Activity {
  name: string;
  description: string;
  intensity: ActivityIntensity;
  category: string;
  color?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// CURATED ACTIVITY LIST
// Each entry maps a clean display name → one representative database name.
// The dbName is sent to the calculatePAL API; the user only sees displayName.
// ─────────────────────────────────────────────────────────────────────────────
export interface CuratedActivity {
  displayName: string;
  dbName: string;           // exact name used in backend PAL lookup
  intensity: ActivityIntensity;
  category: string;
}

export const CURATED_ACTIVITIES: CuratedActivity[] = [
  // ── Rest & Screen Time ──────────────────────────────────────────────────────
  { displayName: 'Sleeping',              dbName: 'Sleeping',                            intensity: 'low',    category: 'Rest & Screen Time' },
  { displayName: 'Watching TV',           dbName: 'Watching Tv/Dvd - Sitting',           intensity: 'low',    category: 'Rest & Screen Time' },
  { displayName: 'Reading / Studying',    dbName: 'Schoolwork',                          intensity: 'low',    category: 'Rest & Screen Time' },
  { displayName: 'Console / Mobile Games',dbName: 'Video Games (Compilation Of Games)',  intensity: 'low',    category: 'Rest & Screen Time' },
  { displayName: 'Quiet Play',            dbName: 'Playing Quietly',                     intensity: 'low',    category: 'Rest & Screen Time' },

  // ── Light Movement ──────────────────────────────────────────────────────────
  { displayName: 'Casual Walking',        dbName: 'Walk Self-Paced Casual',              intensity: 'low',    category: 'Light Movement' },
  { displayName: 'Household Chores',      dbName: 'Housework',                           intensity: 'low',    category: 'Light Movement' },
  { displayName: 'Arts & Crafts',         dbName: 'Arts And Crafts',                     intensity: 'low',    category: 'Light Movement' },
  { displayName: 'Playing Music',         dbName: 'Playing Stringed Instrument',         intensity: 'low',    category: 'Light Movement' },

  // ── Moderate Activity ───────────────────────────────────────────────────────
  { displayName: 'Brisk Walking',         dbName: 'Walk Self-Paced Brisk',               intensity: 'medium', category: 'Moderate Activity' },
  { displayName: 'Cycling',               dbName: 'Riding A Bike - Medium Speed',        intensity: 'medium', category: 'Moderate Activity' },
  { displayName: 'Dancing',               dbName: 'Aerobic Dance/Dance',                 intensity: 'medium', category: 'Moderate Activity' },
  { displayName: 'Gymnastics',            dbName: 'Gymnastics',                          intensity: 'medium', category: 'Moderate Activity' },
  { displayName: 'Motion Gaming (Wii/Kinect)', dbName: 'Active Video Games (Compilation Of Games)', intensity: 'medium', category: 'Moderate Activity' },
  { displayName: 'Trampoline',            dbName: 'Trampoline',                          intensity: 'medium', category: 'Moderate Activity' },
  { displayName: 'Table Tennis',          dbName: 'Table Tennis',                        intensity: 'medium', category: 'Moderate Activity' },
  { displayName: 'Hiking',               dbName: 'Hiking',                              intensity: 'medium', category: 'Moderate Activity' },

  // ── Sports & Vigorous ───────────────────────────────────────────────────────
  { displayName: 'Jogging',               dbName: 'Jog Self-Paced',                      intensity: 'high',   category: 'Sports & Vigorous' },
  { displayName: 'Running',               dbName: 'Run Self-Paced',                      intensity: 'high',   category: 'Sports & Vigorous' },
  { displayName: 'Swimming',              dbName: 'Swimming - Self-Selected Pace',       intensity: 'high',   category: 'Sports & Vigorous' },
  { displayName: 'Basketball',            dbName: 'Basketball - Game',                   intensity: 'high',   category: 'Sports & Vigorous' },
  { displayName: 'Soccer',                dbName: 'Soccer - Game',                       intensity: 'high',   category: 'Sports & Vigorous' },
  { displayName: 'Tennis',                dbName: 'Tennis Practice And Games',           intensity: 'high',   category: 'Sports & Vigorous' },
  { displayName: 'Jump Rope',             dbName: 'Jump Rope',                           intensity: 'high',   category: 'Sports & Vigorous' },
  { displayName: 'Volleyball',            dbName: 'Volleyball',                          intensity: 'high',   category: 'Sports & Vigorous' },
  { displayName: 'Martial Arts',          dbName: 'Martial arts',                        intensity: 'high',   category: 'Sports & Vigorous' },
  { displayName: 'Rollerblading',         dbName: 'Rollerblading',                       intensity: 'high',   category: 'Sports & Vigorous' },
];

export const ACTIVITY_CATEGORIES = [
  'Rest & Screen Time',
  'Light Movement',
  'Moderate Activity',
  'Sports & Vigorous',
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Legacy exports kept for backwards compatibility with other files
// ─────────────────────────────────────────────────────────────────────────────
export const activityIntensityMap: Record<string, ActivityIntensity> = Object.fromEntries(
  CURATED_ACTIVITIES.map(a => [a.dbName, a.intensity])
);

export const activityCategories = ACTIVITY_CATEGORIES;

export const intensityColorMap: Record<ActivityIntensity, string> = {
  low:    'blue',
  medium: 'amber',
  high:   'red',
};

export function groupActivitiesByCategory(activities: string[]): Record<string, Activity[]> {
  const result: Record<string, Activity[]> = {};
  CURATED_ACTIVITIES.forEach(ca => {
    if (!activities.includes(ca.dbName)) return;
    if (!result[ca.category]) result[ca.category] = [];
    result[ca.category].push({
      name: ca.displayName,
      description: '',
      intensity: ca.intensity,
      category: ca.category,
    });
  });
  return result;
}