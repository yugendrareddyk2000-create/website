"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [m, setM] = useState<any>(null);
  useEffect(() => { fetch("/api/members/me").then(r=>r.json()).then(setM); }, []);
  if (!m) return <p className="p-6">Loading…</p>;
  const p = m.member_profiles ?? {};

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center gap-4">
        {p.photo_url && <img src={p.photo_url} className="w-16 h-16 rounded-full object-cover" alt=""/>}
        <div>
          <h1 className="text-2xl font-semibold">{p.full_name ?? "Member"}</h1>
          <p className="text-sm text-gray-600">{m.phone}</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <Card title="Membership ID" value={m.membership_id ?? "—"}/>
        <Card title="Status" value={m.status}/>
        <Card title="Step" value={`${m.current_step}/5`}/>
        <Card title="Submitted" value={m.submitted_at ? new Date(m.submitted_at).toLocaleDateString() : "—"}/>
      </section>

      <nav className="flex gap-2">
        <a className="px-4 py-2 border rounded" href="/profile">View profile</a>
        {m.status === "draft" && <a className="px-4 py-2 bg-black text-white rounded" href={`/register/${["photo","personal","education","occupation","address"][Math.min(m.current_step-1,4)]}`}>Continue registration</a>}
      </nav>
    </div>
  );
}
function Card({ title, value }: any) {
  return <div className="border rounded p-4"><p className="text-xs text-gray-500">{title}</p><p className="font-medium mt-1">{value}</p></div>;
}
