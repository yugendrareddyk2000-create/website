import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mandal_id = Number(url.searchParams.get("mandal_id"));
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!mandal_id) return NextResponse.json([]);
  let qb = supabaseAdmin
    .from("villages")
    .select("id,name,village_code")
    .eq("mandal_id", mandal_id)
    .order("name")
    .limit(50);
  if (q) qb = qb.ilike("name", `%${q}%`);
  const { data, error } = await qb;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
