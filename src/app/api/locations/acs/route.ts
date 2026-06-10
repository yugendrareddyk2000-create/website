import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const pc_id = Number(new URL(req.url).searchParams.get("pc_id"));
  if (!pc_id) return NextResponse.json([]);
  const { data, error } = await supabaseAdmin
    .from("assembly_constituencies")
    .select("id,name,ac_code")
    .eq("pc_id", pc_id)
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
