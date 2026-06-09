"use client";

import { useRef, useState } from "react";
import { parseLocationCsv, type ParseProgress } from "@/lib/csv-parser";
import type { LocationHierarchy } from "@/lib/location-data";

interface CsvUploadProps {
  onLoaded: (data: LocationHierarchy, fileName: string) => void;
}

export function CsvUpload({ onLoaded }: CsvUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ParseProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a CSV file.");
      return;
    }

    setError(null);
    setLoading(true);
    setProgress({ phase: "parsing", percent: 0 });

    try {
      const data = await parseLocationCsv(file, setProgress);
      if (data.states.length === 0) {
        throw new Error("No valid location rows found in the CSV.");
      }
      onLoaded(data, file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load CSV.");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = "";
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 transition ${
          dragging
            ? "border-indigo-400 bg-indigo-50"
            : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50"
        } ${loading ? "pointer-events-none opacity-70" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onInputChange}
        />

        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 16V4m0 0L8 8m4-4 4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="text-base font-semibold text-slate-800">
          {loading ? "Processing CSV…" : "Upload location CSV"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Drag and drop or click to browse
        </p>
        <p className="mt-3 max-w-md text-center text-xs text-slate-400">
          Required columns: State Name, District Name, Subdistrict Name, Village Name
        </p>
      </div>

      {loading && progress && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>{progress.phase === "parsing" ? "Reading rows…" : "Building index…"}</span>
            <span>{Math.round(progress.percent)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
