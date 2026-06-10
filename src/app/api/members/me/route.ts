import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supa = createServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: member } = await supa
    .from("members")
    .select("*, member_profiles(*)")
    .eq("auth_user_id", user.id)
    .single();

  return NextResponse.json(member ?? null);
}
