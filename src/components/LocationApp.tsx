"use client";

import { useState } from "react";
import type { LocationHierarchy } from "@/lib/location-data";
import { CsvUpload } from "./CsvUpload";
import { LocationSelector } from "./LocationSelector";
import { StatsDashboard } from "./StatsDashboard";

export function LocationApp() {
  const [data, setData] = useState<LocationHierarchy | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleLoaded(hierarchy: LocationHierarchy, name: string) {
    setData(hierarchy);
    setFileName(name);
  }

  function handleReset() {
    setData(null);
    setFileName(null);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-indigo-600">
          Location Directory
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Village Lookup
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">
          Upload a CSV with state, district, subdistrict, and village columns to
          browse locations with searchable cascading dropdowns.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {!data ? (
          <CsvUpload onLoaded={handleLoaded} />
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Loaded file
                </p>
                <p className="text-sm font-medium text-slate-800">{fileName}</p>
                <p className="text-xs text-slate-500">
                  {data.rowCount.toLocaleString()} rows · {data.states.length} states
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Upload new file
              </button>
            </div>

            <StatsDashboard data={data} />

            <LocationSelector data={data} />
          </div>
        )}
      </div>
    </div>
  );
}
