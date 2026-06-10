"use client";
import { useState } from "react";
import { StepShell, saveStep } from "@/components/registration/StepShell";

export default function PhotoStep() {
  const [file, setFile]   = useState<File|null>(null);
  const [url,  setUrl]    = useState<string|null>(null);
  const [err,  setErr]    = useState<string|null>(null);
  const [busy, setBusy]   = useState(false);

  async function upload() {
    if (!file) throw new Error("Choose a photo");
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload/photo", { method: "POST", body: fd });
    const j = await res.json();
    if (!res.ok) throw new Error(j.error);
    setUrl(j.photo_url);
    return j.photo_url as string;
  }

  return (
    <StepShell step="photo" title="Profile photo"
      submitting={busy} error={err} canContinue={!!file}
      onSubmit={async ()=>{ setBusy(true); setErr(null);
        try { const u = url ?? await upload(); await saveStep("photo", { photo_url: u }); }
        catch (e: any) { setErr(e.message); throw e; }
        finally { setBusy(false); }
      }}
    >
      <input type="file" accept="image/jpeg,image/png,image/webp"
        onChange={e=>{ setFile(e.target.files?.[0] ?? null); setUrl(null); }} />
      {url && <img src={url} alt="" className="w-32 h-32 object-cover rounded-full" />}
      <p className="text-xs text-gray-500">JPG/PNG/WEBP, up to 5MB</p>
    </StepShell>
  );
}
