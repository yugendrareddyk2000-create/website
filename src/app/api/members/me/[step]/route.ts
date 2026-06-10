import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { STEP_SCHEMAS, STEP_ORDER, type StepName } from "@/lib/validation/member";

export async function PATCH(
  req: Request,
  { params }: { params: { step: StepName } }
) {
  try {
    const step = params.step;
    if (!STEP_SCHEMAS[step]) {
      return NextResponse.json({ error: "unknown step" }, { status: 400 });
    }
    const body = STEP_SCHEMAS[step].parse(await req.json());

    const supa = createServerClient();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { data: m, error: mErr } = await supa
      .from("members")
      .select("id, current_step")
      .eq("auth_user_id", user.id)
      .single();
    if (mErr || !m) return NextResponse.json({ error: "member missing" }, { status: 404 });

    const { error: upErr } = await supa
      .from("member_profiles")
      .upsert({ member_id: m.id, ...body, updated_at: new Date().toISOString() });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 });

    const nextStep = Math.min(STEP_ORDER.indexOf(step) + 2, STEP_ORDER.length + 1);
    if (nextStep > m.current_step) {
      await supa.from("members").update({ current_step: nextStep }).eq("id", m.id);
    }

    return NextResponse.json({ ok: true, next_step: nextStep });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Bad request" }, { status: 400 });
  }
}
