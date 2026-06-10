"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepShell, saveStep } from "@/components/registration/StepShell";
import { AddressFields, EMPTY_ADDRESS, type AddressValue } from "@/components/registration/AddressStep";
import { addressSchema } from "@/lib/validation/member";

export default function AddressStepPage() {
  const router = useRouter();
  const [v, setV] = useState<AddressValue>(EMPTY_ADDRESS);
  const [err, setErr] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submitAll() {
    setSubmitting(true); setErr(null);
    const res = await fetch("/api/members/me/submit", { method: "POST" });
    const j = await res.json();
    setSubmitting(false);
    if (!res.ok) { setErr(j.error); return; }
    router.push("/register/status");
  }

  return (
    <>
      <StepShell step="address" title="Address" submitting={busy} error={err}
        onSubmit={async ()=>{ setBusy(true); setErr(null);
          try { await saveStep("address", addressSchema.parse(v)); }
          catch (e:any){ setErr(e.issues?.[0]?.message ?? e.message); throw e; }
          finally { setBusy(false); }
        }}>
        <AddressFields value={v} onChange={setV}/>
      </StepShell>
      <div className="mt-6 border-t pt-4">
        <button onClick={submitAll} disabled={submitting}
          className="w-full bg-emerald-600 text-white rounded py-3">
          {submitting ? "Submitting…" : "Submit Membership Application"}
        </button>
      </div>
    </>
  );
}
