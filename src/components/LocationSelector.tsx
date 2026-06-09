"use client";

import { useMemo, useState } from "react";
import {
  getDistricts,
  getSubdistricts,
  getVillages,
  type LocationHierarchy,
} from "@/lib/location-data";
import { SearchableSelect } from "./SearchableSelect";

interface LocationSelectorProps {
  data: LocationHierarchy;
}

export function LocationSelector({ data }: LocationSelectorProps) {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [subdistrict, setSubdistrict] = useState("");
  const [village, setVillage] = useState("");

  const districts = useMemo(
    () => (state ? getDistricts(data, state) : []),
    [data, state]
  );

  const subdistricts = useMemo(
    () => (state && district ? getSubdistricts(data, state, district) : []),
    [data, state, district]
  );

  const villages = useMemo(
    () =>
      state && district && subdistrict
        ? getVillages(data, state, district, subdistrict)
        : [],
    [data, state, district, subdistrict]
  );

  function handleStateChange(value: string) {
    setState(value);
    setDistrict("");
    setSubdistrict("");
    setVillage("");
  }

  function handleDistrictChange(value: string) {
    setDistrict(value);
    setSubdistrict("");
    setVillage("");
  }

  function handleSubdistrictChange(value: string) {
    setSubdistrict(value);
    setVillage("");
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <SearchableSelect
        label="State"
        placeholder="Search or select a state…"
        options={data.states}
        value={state}
        onChange={handleStateChange}
      />
      <SearchableSelect
        label="District"
        placeholder="Search or select a district…"
        options={districts}
        value={district}
        onChange={handleDistrictChange}
        disabled={!state}
      />
      <SearchableSelect
        label="Subdistrict"
        placeholder="Search or select a subdistrict…"
        options={subdistricts}
        value={subdistrict}
        onChange={handleSubdistrictChange}
        disabled={!district}
      />
      <SearchableSelect
        label="Village"
        placeholder="Search or select a village…"
        options={villages}
        value={village}
        onChange={setVillage}
        disabled={!subdistrict}
      />

      {village && (
        <div className="sm:col-span-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">
            Selected location
          </p>
          <p className="mt-1 text-sm text-indigo-900">
            {village}, {subdistrict}, {district}, {state}
          </p>
        </div>
      )}
    </div>
  );
}
