import { apiClient } from '@/api/apiClient';

interface TargetEnergyParams {
  age: number;
  gender: string; // frontend uses "male" | "female"
  pal: number;
}

export async function getTargetEnergy({
  age,
  gender,
  pal,
}: TargetEnergyParams): Promise<number | null> {
  try {
    // Convert to backend expected value: "boy" or "girl"
    const genderFormatted = gender.toLowerCase() === 'female' ? 'girl' : 'boy';

    const res = await apiClient.post('/api/v1/child_energy_requirements/find-nearest-pal', {
      age,
      gender: genderFormatted,
      physical_activity_level: pal,
    });

    return res?.estimated_energy_requirement ?? null;
  } catch (error) {
    console.error('[getTargetEnergy] Failed to fetch target energy:', error);
    return null;
  }
}

