import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { phoneSchema } from "@/lib/validation/member";

export async function POST(req: Request) {
  try {
    const { phone } = phoneSchema.parse(await req.json());

    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("otp_attempts")
      .select("*", { count: "exact", head: true })
      .eq("phone", phone)
      .gte("created_at", since);
    if ((count ?? 0) >= 5) {
      return NextResponse.json({ error: "Too many attempts. Try later." }, { status: 429 });
    }

    await supabaseAdmin.from("otp_attempts").insert({ phone });
    const { error } = await supabaseAdmin.auth.signInWithOtp({ phone });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Bad request" }, { status: 400 });
  }
}
