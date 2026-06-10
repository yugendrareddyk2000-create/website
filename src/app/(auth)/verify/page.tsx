"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyInner() {
  const router = useRouter();
  const phone = useSearchParams().get("phone") ?? "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });
    setLoading(false);
    const j = await res.json();
    if (!res.ok) { setError(j.error); return; }
    router.push("/register/photo");
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold mb-2">Enter OTP</h1>
      <p className="text-sm text-gray-600 mb-4">Sent to {phone}</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2 tracking-widest text-center"
          value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
          placeholder="••••••" inputMode="numeric"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full bg-black text-white rounded py-2" disabled={loading || otp.length!==6}>
          {loading ? "Verifying…" : "Verify"}
        </button>
      </form>
    </main>
  );
}

export default function VerifyPage() {
  return <Suspense><VerifyInner/></Suspense>;
}
