import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { OAK_TREE_TABLES } from "@/lib/supabase/tables";
import { isNextResponse, requireAdminApi } from "@/lib/auth";

const settingsSchema = z.object({
  tee_interval_minutes: z.number().int().min(5).max(30).optional(),
  max_players_per_booking: z.number().int().min(1).max(4).optional(),
  booking_window_days: z.number().int().min(1).max(60).optional(),
  minimum_booking_notice_minutes: z.number().int().min(0).max(1440).optional(),
  public_booking_enabled: z.boolean().optional(),
  first_tee_time: z.string().optional(),
  last_tee_time: z.string().optional(),
});

export async function GET() {
  const auth = await requireAdminApi();
  if (isNextResponse(auth)) return auth;

  const supabase = createServiceClient();
  const { data, error } = await supabase.from(OAK_TREE_TABLES.courseSettings).select("*").limit(1).single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (isNextResponse(auth)) return auth;

  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: existing } = await supabase.from(OAK_TREE_TABLES.courseSettings).select("id").limit(1).single();

  if (!existing) {
    return NextResponse.json({ error: "Settings not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from(OAK_TREE_TABLES.courseSettings)
    .update(parsed.data)
    .eq("id", existing.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}
