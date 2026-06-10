"use client";
import { useState } from "react";
import { StepShell, saveStep } from "@/components/registration/StepShell";
import { personalSchema } from "@/lib/validation/member";

export default function PersonalStep() {
  const [v, setV] = useState({ full_name:"", father_name:"", date_of_birth:"", gender:"M", email:"" });
  const [err, setErr] = useState<string|null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k:string)=>(e:any)=>setV({...v, [k]: e.target.value});

  return (
    <StepShell step="personal" title="Personal details"
      submitting={busy} error={err}
      onSubmit={async ()=>{ setBusy(true); setErr(null);
        try {
          const parsed = personalSchema.parse(v);
          await saveStep("personal", parsed);
        } catch (e: any) {
          setErr(e.issues?.[0]?.message ?? e.message); throw e;
        } finally { setBusy(false); }
      }}
    >
      <Field label="Full name"><input className="input" value={v.full_name} onChange={set("full_name")}/></Field>
      <Field label="Father's name"><input className="input" value={v.father_name} onChange={set("father_name")}/></Field>
      <Field label="Date of birth"><input type="date" className="input" value={v.date_of_birth} onChange={set("date_of_birth")}/></Field>
      <Field label="Gender">
        <select className="input" value={v.gender} onChange={set("gender")}>
          <option value="M">Male</option><option value="F">Female</option><option value="O">Other</option>
        </select>
      </Field>
      <Field label="Email (optional)"><input type="email" className="input" value={v.email} onChange={set("email")}/></Field>
    </StepShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="mt-1">{children}</div>
      <style jsx>{`.input{}`}</style>
    </label>
  );
}
