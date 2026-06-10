import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const ac_id = Number(new URL(req.url).searchParams.get("ac_id"));
  if (!ac_id) return NextResponse.json([]);
  const { data, error } = await supabaseAdmin
    .from("mandals")
    .select("id,name,mandal_code")
    .eq("ac_id", ac_id)
    .order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
