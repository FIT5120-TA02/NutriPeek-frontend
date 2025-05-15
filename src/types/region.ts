// Type for region bounds
export interface RegionBounds {
  region: string;
  latMin: number;
  latMax: number;
  lngMin: number;
  lngMax: number;
}

// Mapping of latitude/longitude ranges to region codes
// This is a simplified approach - in a real app, you'd use a proper geocoding service
export const REGION_BOUNDS: RegionBounds[] = [
  { region: 'nsw', latMin: -37.5, latMax: -28.0, lngMin: 141.0, lngMax: 153.5 },
  { region: 'vic', latMin: -39.2, latMax: -34.0, lngMin: 140.9, lngMax: 150.0 },
  { region: 'qld', latMin: -29.0, latMax: -10.0, lngMin: 138.0, lngMax: 154.0 },
  { region: 'sa', latMin: -38.0, latMax: -26.0, lngMin: 129.0, lngMax: 141.0 },
  { region: 'wa', latMin: -35.5, latMax: -14.0, lngMin: 112.0, lngMax: 129.0 },
  { region: 'tas', latMin: -44.0, latMax: -40.0, lngMin: 143.5, lngMax: 149.0 },
  { region: 'nt', latMin: -26.0, latMax: -11.0, lngMin: 129.0, lngMax: 138.0 },
  { region: 'act', latMin: -36.0, latMax: -35.0, lngMin: 148.7, lngMax: 149.4 },
];

// Mapping of region codes to full names
export const REGION_NAMES: Record<string, string> = {
  'nsw': 'New South Wales',
  'vic': 'Victoria',
  'qld': 'Queensland',
  'sa': 'South Australia',
  'wa': 'Western Australia',
  'tas': 'Tasmania',
  'nt': 'Northern Territory',
  'act': 'Australian Capital Territory',
};

// Get region full name from code
export function getRegionFullName(code: string): string {
  return REGION_NAMES[code.toLowerCase()] || code;
}

// Get region code from full name
export function getRegionCode(fullName: string): string {
  if (!fullName) return '';
  
  // If fullName is already a code, return it
  if (Object.keys(REGION_NAMES).map(k => k.toLowerCase()).includes(fullName.toLowerCase())) {
    return fullName.toLowerCase();
  }
  
  // Look for a match in the region names
  const entry = Object.entries(REGION_NAMES).find(
    ([_, name]) => name.toLowerCase() === fullName.toLowerCase()
  );
  
  return entry ? entry[0] : '';
}

// Determine region code from coordinates
export function getRegionFromCoordinates(lat: number, lng: number): string {
  // Find the region that contains these coordinates
  const region = REGION_BOUNDS.find(r => 
    lat >= r.latMin && lat <= r.latMax && lng >= r.lngMin && lng <= r.lngMax
  );
  
  if (region) return region.region;
  
  // Default to NSW if no match (should be improved in production)
  console.warn(`Could not determine region for coordinates: ${lat}, ${lng}. Defaulting to NSW.`);
  return 'nsw';
} 