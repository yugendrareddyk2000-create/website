import Papa from "papaparse";
import { HierarchyBuilder, type LocationHierarchy } from "./location-data";

const COLUMN_ALIASES: Record<string, readonly string[]> = {
  state: ["state name", "state name(in english)", "statename"],
  district: ["district name", "district name(in english)", "districtname"],
  subdistrict: [
    "subdistrict name",
    "subdistrict name(in english)",
    "subdistrictname",
    "sub-district name",
  ],
  village: ["village name", "village name(in english)", "villagename"],
};

type FieldKey = keyof typeof COLUMN_ALIASES;

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase();
}

function resolveColumns(headers: string[]): Record<FieldKey, string> | null {
  const normalized = headers.map(normalizeHeader);
  const resolved = {} as Record<FieldKey, string>;

  for (const field of Object.keys(COLUMN_ALIASES) as FieldKey[]) {
    const aliases = COLUMN_ALIASES[field];
    const index = normalized.findIndex((h) => aliases.includes(h));
    if (index === -1) return null;
    resolved[field] = headers[index];
  }

  return resolved;
}

export interface ParseProgress {
  phase: "parsing" | "building";
  percent: number;
}

export function parseLocationCsv(
  file: File,
  onProgress?: (progress: ParseProgress) => void
): Promise<LocationHierarchy> {
  return new Promise((resolve, reject) => {
    const builder = new HierarchyBuilder();
    let columns: Record<FieldKey, string> | null = null;
    let processedRows = 0;

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      step(results, parser) {
        if (!columns) {
          columns = resolveColumns(results.meta.fields ?? []);
          if (!columns) {
            parser.abort();
            reject(
              new Error(
                "CSV must include columns for State Name, District Name, Subdistrict Name, and Village Name."
              )
            );
            return;
          }
        }

        const data = results.data;
        builder.addRow({
          state: (data[columns.state] ?? "").trim(),
          district: (data[columns.district] ?? "").trim(),
          subdistrict: (data[columns.subdistrict] ?? "").trim(),
          village: (data[columns.village] ?? "").trim(),
        });

        processedRows += 1;
        if (processedRows % 50000 === 0) {
          onProgress?.({
            phase: "parsing",
            percent: Math.min(90, (processedRows / 700000) * 90),
          });
        }
      },
      complete() {
        if (!columns) {
          reject(new Error("CSV file appears to be empty or has no header row."));
          return;
        }

        onProgress?.({ phase: "building", percent: 95 });
        const hierarchy = builder.build();
        onProgress?.({ phase: "building", percent: 100 });
        resolve(hierarchy);
      },
      error(error) {
        reject(new Error(error.message || "Failed to parse CSV file."));
      },
    });
  });
}
