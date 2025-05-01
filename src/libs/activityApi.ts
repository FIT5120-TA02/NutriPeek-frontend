import {
  ActivityEntry,
  ActivityResult,
  MetyActivity
} from '@/types/activity';

import { apiClient } from '@/api/apiClient';

export async function getAllActivities(): Promise<string[]> {
  const res = await apiClient.get<{ activities: string[] }>('/api/v1/activity/activities');
  return res.activities;
}

export async function calculatePAL(
  age: number,
  activities: ActivityEntry[]
): Promise<ActivityResult> {
  const res = await apiClient.post<ActivityResult>('/api/v1/activity/calculate-pal', {
    age,
    activities
  });

  return res;
}