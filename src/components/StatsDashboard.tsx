"use client";

import type { LocationHierarchy } from "@/lib/location-data";
import { formatStatNumber, getLocationStats } from "@/lib/location-stats";

interface StatsDashboardProps {
  data: LocationHierarchy;
}

const STAT_CARDS = [
  {
    key: "totalStates" as const,
    label: "Total States",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 9.5 12 4l9 5.5M5 10.5V20h14v-9.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    accent: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50 text-indigo-600",
  },
  {
    key: "totalDistricts" as const,
    label: "Total Districts",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7h16M4 12h16M4 17h10"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
    accent: "from-violet-500 to-violet-600",
    bg: "bg-violet-50 text-violet-600",
  },
  {
    key: "totalSubdistricts" as const,
    label: "Total Subdistricts",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
    accent: "from-sky-500 to-sky-600",
    bg: "bg-sky-50 text-sky-600",
  },
  {
    key: "totalVillages" as const,
    label: "Total Villages",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    accent: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50 text-emerald-600",
  },
];

export function StatsDashboard({ data }: StatsDashboardProps) {
  const stats = getLocationStats(data);

  return (
    <section aria-label="Location statistics">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Dashboard
        </h2>
        <span className="text-xs text-slate-400">
          {formatStatNumber(data.rowCount)} records loaded
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon, accent, bg }) => (
          <article
            key={key}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`}
              aria-hidden="true"
            />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {formatStatNumber(stats[key])}
                </p>
              </div>
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}
              >
                {icon}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
