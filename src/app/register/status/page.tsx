"use client";
import { useEffect, useState } from "react";

export default function StatusPage() {
  const [m, setM] = useState<any>(null);
  useEffect(() => { fetch("/api/members/me").then(r=>r.json()).then(setM); }, []);
  if (!m) return <p className="p-6">Loading…</p>;

  const colors: any = {
    draft: "bg-gray-100 text-gray-700",
    submitted: "bg-blue-100 text-blue-700",
    under_review: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="mx-auto max-w-lg p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Registration status</h1>
      <span className={`inline-block px-3 py-1 rounded-full text-sm ${colors[m.status]}`}>{m.status}</span>
      {m.membership_id && (
        <div className="border rounded p-4">
          <p className="text-sm text-gray-600">Your Membership ID</p>
          <p className="font-mono text-xl tracking-wider mt-1">{m.membership_id}</p>
        </div>
      )}
      <a href="/dashboard" className="inline-block underline">Go to dashboard</a>
    </div>
  );
}
