"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { phoneSchema } from "@/lib/validation/member";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("+91");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = phoneSchema.safeParse({ phone });
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setLoading(true);
    const res = await fetch("/api/auth/otp/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setLoading(false);
    const j = await res.json();
    if (!res.ok) { setError(j.error); return; }
    router.push(`/verify?phone=${encodeURIComponent(phone)}`);
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          value={phone} onChange={e=>setPhone(e.target.value)}
          placeholder="+919876543210" inputMode="tel"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full bg-black text-white rounded py-2" disabled={loading}>
          {loading ? "Sending…" : "Send OTP"}
        </button>
      </form>
    </main>
  );
}
