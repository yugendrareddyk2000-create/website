import type { LocationHierarchy } from "./location-data";

export interface LocationStats {
  totalStates: number;
  totalDistricts: number;
  totalSubdistricts: number;
  totalVillages: number;
}

export function getLocationStats(data: LocationHierarchy): LocationStats {
  const totalStates = data.states.length;

  const totalDistricts = Object.values(data.districtsByState).reduce(
    (sum, districts) => sum + districts.length,
    0
  );

  const totalSubdistricts = Object.values(data.subdistrictsByKey).reduce(
    (sum, subdistricts) => sum + subdistricts.length,
    0
  );

  const totalVillages = Object.values(data.villagesByKey).reduce(
    (sum, villages) => sum + villages.length,
    0
  );

  return { totalStates, totalDistricts, totalSubdistricts, totalVillages };
}

export function formatStatNumber(value: number): string {
  return value.toLocaleString("en-US");
}
