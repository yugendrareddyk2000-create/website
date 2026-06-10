import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supa = createServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: m } = await supa
    .from("members")
    .select("id, status, member_profiles(village_id, gender, full_name)")
    .eq("auth_user_id", user.id)
    .single();
  if (!m) return NextResponse.json({ error: "member missing" }, { status: 404 });
  if (m.status === "approved") return NextResponse.json({ error: "already approved" }, { status: 409 });

  // Sanity check required fields
  const p: any = (m as any).member_profiles;
  if (!p?.village_id || !p?.gender || !p?.full_name) {
    return NextResponse.json({ error: "Profile incomplete" }, { status: 400 });
  }

  await supa.from("members").update({
    status: "submitted",
    submitted_at: new Date().toISOString(),
  }).eq("id", m.id);

  // Auto-issue ID. Remove this RPC call to require manual admin approval.
  const { data: id, error } = await supa.rpc("issue_membership_id", { p_member: m.id });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ membership_id: id });
}
