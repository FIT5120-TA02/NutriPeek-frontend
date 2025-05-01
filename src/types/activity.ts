export interface ActivityEntry {
  name: string;
  hours: number;
}

export interface MetyActivity {
  category: string;
  specificActivity: string;
}

export interface ActivityDetail {
  activity: string;
  hours: number;
  mety_level: number;
  mety_minutes: number;
}

export interface ActivityResult {
  pal: number;
  total_mety_minutes: number;
  details: ActivityDetail[];
}

