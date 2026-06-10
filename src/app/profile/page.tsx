"use client";
import { useEffect, useState } from "react";

export default function Profile() {
  const [m, setM] = useState<any>(null);
  useEffect(() => { fetch("/api/members/me").then(r=>r.json()).then(setM); }, []);
  if (!m) return <p className="p-6">Loading…</p>;
  const p = m.member_profiles ?? {};

  const rows: [string, any][] = [
    ["Membership ID", m.membership_id ?? "—"],
    ["Phone", m.phone],
    ["Full name", p.full_name],
    ["Father's name", p.father_name],
    ["DOB", p.date_of_birth],
    ["Gender", p.gender],
    ["Email", p.email],
    ["Education", `${p.education_level ?? ""} ${p.qualification ?? ""}`],
    ["Institution", p.institution],
    ["Year completed", p.year_completed],
    ["Occupation", p.occupation],
    ["Employer", p.employer],
    ["Annual income", p.annual_income],
    ["Address", [p.address_line1, p.address_line2, p.pincode].filter(Boolean).join(", ")],
  ];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>
      {p.photo_url && <img src={p.photo_url} alt="" className="w-24 h-24 rounded-full object-cover mb-4"/>}
      <dl className="divide-y border rounded">
        {rows.map(([k,v]) => (
          <div key={k} className="flex justify-between px-4 py-2 text-sm">
            <dt className="text-gray-500">{k}</dt>
            <dd className="font-medium text-right">{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
