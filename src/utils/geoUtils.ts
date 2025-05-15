/**
 * Simple mapping of Australian regions to their approximate coordinates
 * This is a simplified approach - in a production app, you would use a more sophisticated API
 */
type RegionCoordinates = {
  region: string;
  latitude: number;
  longitude: number;
};

// Simplified mapping of Australian major regions to coordinates
const AUSTRALIAN_REGIONS: RegionCoordinates[] = [
  { region: 'Victoria', latitude: -37.8136, longitude: 144.9631 }, // Melbourne
  { region: 'New South Wales', latitude: -33.8688, longitude: 151.2093 }, // Sydney
  { region: 'Queensland', latitude: -27.4698, longitude: 153.0251 }, // Brisbane
  { region: 'South Australia', latitude: -34.9285, longitude: 138.6007 }, // Adelaide
  { region: 'Western Australia', latitude: -31.9505, longitude: 115.8605 }, // Perth
  { region: 'Tasmania', latitude: -42.8821, longitude: 147.3272 }, // Hobart
  { region: 'Northern Territory', latitude: -12.4634, longitude: 130.8456 }, // Darwin
  { region: 'Australian Capital Territory', latitude: -35.2809, longitude: 149.1300 }, // Canberra
];

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function getDistanceFromLatLonInKm(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

/**
 * Convert degrees to radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

/**
 * Find the closest region based on coordinates
 * @param latitude Current latitude
 * @param longitude Current longitude
 * @returns Closest region name
 */
export function findClosestRegion(latitude: number, longitude: number): string {
  if (!latitude || !longitude) {
    return 'Victoria'; // Default fallback
  }

  let closestRegion = AUSTRALIAN_REGIONS[0].region;
  let minDistance = Number.MAX_SAFE_INTEGER;

  AUSTRALIAN_REGIONS.forEach(regionData => {
    const distance = getDistanceFromLatLonInKm(
      latitude,
      longitude,
      regionData.latitude,
      regionData.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestRegion = regionData.region;
    }
  });

  return closestRegion;
}

/**
 * Get the current month name
 * @returns Current month name
 */
export function getCurrentMonth(): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[new Date().getMonth()];
}

/**
 * Get the current season based on month
 * @returns Current season
 */
export function getCurrentSeason(): string {
  const month = new Date().getMonth();
  
  // Southern hemisphere seasons
  if (month >= 11 || month <= 1) return 'Summer';
  if (month >= 2 && month <= 4) return 'Autumn';
  if (month >= 5 && month <= 7) return 'Winter';
  return 'Spring';
} 