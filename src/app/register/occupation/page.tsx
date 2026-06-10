"use client";
import { useState } from "react";
import { StepShell, saveStep } from "@/components/registration/StepShell";
import { occupationSchema } from "@/lib/validation/member";

export default function OccupationStep() {
  const [v, setV] = useState({ occupation:"", employer:"", annual_income:"" });
  const [err, setErr] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k:string)=>(e:any)=>setV({...v,[k]:e.target.value});

  return (
    <StepShell step="occupation" title="Occupation" submitting={busy} error={err}
      onSubmit={async ()=>{ setBusy(true); setErr(null);
        try { await saveStep("occupation", occupationSchema.parse(v)); }
        catch (e:any){ setErr(e.issues?.[0]?.message ?? e.message); throw e; }
        finally { setBusy(false); }
      }}>
      <label className="block"><span className="text-sm">Occupation</span>
        <input className="mt-1 w-full border rounded px-3 py-2" value={v.occupation} onChange={set("occupation")}/></label>
      <label className="block"><span className="text-sm">Employer</span>
        <input className="mt-1 w-full border rounded px-3 py-2" value={v.employer} onChange={set("employer")}/></label>
      <label className="block"><span className="text-sm">Annual income (₹)</span>
        <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={v.annual_income} onChange={set("annual_income")}/></label>
    </StepShell>
  );
}
