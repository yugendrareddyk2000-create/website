export interface LocationHierarchy {
  states: string[];
  districtsByState: Record<string, string[]>;
  subdistrictsByKey: Record<string, string[]>;
  villagesByKey: Record<string, string[]>;
  rowCount: number;
}

function districtKey(state: string, district: string): string {
  return `${state}\0${district}`;
}

function subdistrictKey(state: string, district: string, subdistrict: string): string {
  return `${state}\0${district}\0${subdistrict}`;
}

export function createEmptyHierarchy(): LocationHierarchy {
  return {
    states: [],
    districtsByState: {},
    subdistrictsByKey: {},
    villagesByKey: {},
    rowCount: 0,
  };
}

export class HierarchyBuilder {
  private stateSet = new Set<string>();
  private districtSets = new Map<string, Set<string>>();
  private subdistrictSets = new Map<string, Set<string>>();
  private villageSets = new Map<string, Set<string>>();
  rowCount = 0;

  addRow(row: {
    state: string;
    district: string;
    subdistrict: string;
    village: string;
  }): void {
    const { state, district, subdistrict, village } = row;
    if (!state || !district || !subdistrict || !village) return;

    this.rowCount += 1;
    this.stateSet.add(state);

    if (!this.districtSets.has(state)) this.districtSets.set(state, new Set());
    this.districtSets.get(state)!.add(district);

    const sKey = districtKey(state, district);
    if (!this.subdistrictSets.has(sKey)) this.subdistrictSets.set(sKey, new Set());
    this.subdistrictSets.get(sKey)!.add(subdistrict);

    const vKey = subdistrictKey(state, district, subdistrict);
    if (!this.villageSets.has(vKey)) this.villageSets.set(vKey, new Set());
    this.villageSets.get(vKey)!.add(village);
  }

  build(): LocationHierarchy {
    const sort = (items: Iterable<string>) =>
      [...items].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    const districtsByState: Record<string, string[]> = {};
    for (const [state, districts] of this.districtSets) {
      districtsByState[state] = sort(districts);
    }

    const subdistrictsByKey: Record<string, string[]> = {};
    for (const [key, subdistricts] of this.subdistrictSets) {
      subdistrictsByKey[key] = sort(subdistricts);
    }

    const villagesByKey: Record<string, string[]> = {};
    for (const [key, villages] of this.villageSets) {
      villagesByKey[key] = sort(villages);
    }

    return {
      states: sort(this.stateSet),
      districtsByState,
      subdistrictsByKey,
      villagesByKey,
      rowCount: this.rowCount,
    };
  }
}

export function buildHierarchy(
  rows: Array<{
    state: string;
    district: string;
    subdistrict: string;
    village: string;
  }>
): LocationHierarchy {
  const builder = new HierarchyBuilder();
  for (const row of rows) builder.addRow(row);
  return builder.build();
}

export function getDistricts(data: LocationHierarchy, state: string): string[] {
  return data.districtsByState[state] ?? [];
}

export function getSubdistricts(
  data: LocationHierarchy,
  state: string,
  district: string
): string[] {
  return data.subdistrictsByKey[districtKey(state, district)] ?? [];
}

export function getVillages(
  data: LocationHierarchy,
  state: string,
  district: string,
  subdistrict: string
): string[] {
  return data.villagesByKey[subdistrictKey(state, district, subdistrict)] ?? [];
}
