"use client";
import { useRouter } from "next/navigation";
import { STEP_ORDER, type StepName } from "@/lib/validation/member";

export function StepShell({
  step, title, children, onSubmit, submitting, error, canContinue = true,
}: {
  step: StepName; title: string;
  children: React.ReactNode;
  onSubmit: () => Promise<void>;
  submitting?: boolean; error?: string|null;
  canContinue?: boolean;
}) {
  const router = useRouter();
  const idx = STEP_ORDER.indexOf(step);
  const nextHref = idx < STEP_ORDER.length - 1 ? `/register/${STEP_ORDER[idx+1]}` : "/register/status";

  return (
    <form
      onSubmit={async e => { e.preventDefault(); await onSubmit(); router.push(nextHref); }}
      className="space-y-4"
    >
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="space-y-3">{children}</div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 pt-2">
        {idx > 0 && (
          <button type="button" onClick={()=>router.push(`/register/${STEP_ORDER[idx-1]}`)}
            className="px-4 py-2 border rounded">Back</button>
        )}
        <button className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
          disabled={submitting || !canContinue}>
          {submitting ? "Saving…" : (idx === STEP_ORDER.length - 1 ? "Save" : "Continue")}
        </button>
      </div>
    </form>
  );
}

export async function saveStep(step: StepName, body: any) {
  const res = await fetch(`/api/members/me/${step}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await res.json();
  if (!res.ok) throw new Error(j.error ?? "Save failed");
  return j;
}
