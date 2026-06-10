import { NextResponse } from "next/server";
import { supabaseAdmin, createServerClient } from "@/lib/supabase/server";
import { otpSchema } from "@/lib/validation/member";

export async function POST(req: Request) {
  try {
    const { phone, otp } = otpSchema.parse(await req.json());

    // Verify with the user-scoped client so session cookies are set
    const supa = createServerClient();
    const { data, error } = await supa.auth.verifyOtp({ phone, token: otp, type: "sms" });
    if (error || !data.session) {
      return NextResponse.json({ error: error?.message ?? "Invalid code" }, { status: 401 });
    }

    // Ensure a member shell exists
    await supabaseAdmin
      .from("members")
      .upsert({ auth_user_id: data.user!.id, phone }, { onConflict: "auth_user_id" });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Bad request" }, { status: 400 });
  }
}
