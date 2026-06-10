import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const state_id = Number(new URL(req.url).searchParams.get("state_id"));
  if (!state_id) return NextResponse.json([]);
  const { data, error } = await supabaseAdmin
    .from("parliament_constituencies")
    .select("id,name,pc_code")
    .eq("state_id", state_id)
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
