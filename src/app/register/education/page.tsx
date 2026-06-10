"use client";
import { useState } from "react";
import { StepShell, saveStep } from "@/components/registration/StepShell";
import { educationSchema } from "@/lib/validation/member";

export default function EducationStep() {
  const [v, setV] = useState({ education_level:"secondary", qualification:"", institution:"", year_completed:"" });
  const [err, setErr] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k:string)=>(e:any)=>setV({...v,[k]:e.target.value});

  return (
    <StepShell step="education" title="Education" submitting={busy} error={err}
      onSubmit={async ()=>{ setBusy(true); setErr(null);
        try { await saveStep("education", educationSchema.parse(v)); }
        catch (e:any){ setErr(e.issues?.[0]?.message ?? e.message); throw e; }
        finally { setBusy(false); }
      }}>
      <label className="block"><span className="text-sm">Highest level</span>
        <select className="mt-1 w-full border rounded px-3 py-2" value={v.education_level} onChange={set("education_level")}>
          {["none","primary","secondary","higher_secondary","diploma","graduate","postgraduate","doctorate"].map(o=>(
            <option key={o} value={o}>{o.replace("_"," ")}</option>
          ))}
        </select>
      </label>
      <label className="block"><span className="text-sm">Qualification</span>
        <input className="mt-1 w-full border rounded px-3 py-2" value={v.qualification} onChange={set("qualification")}/></label>
      <label className="block"><span className="text-sm">Institution</span>
        <input className="mt-1 w-full border rounded px-3 py-2" value={v.institution} onChange={set("institution")}/></label>
      <label className="block"><span className="text-sm">Year completed</span>
        <input type="number" className="mt-1 w-full border rounded px-3 py-2" value={v.year_completed} onChange={set("year_completed")}/></label>
    </StepShell>
  );
}
