import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { OAK_TREE_TABLES } from "@/lib/supabase/tables";
import { isNextResponse, requireStaffApi } from "@/lib/auth";

const schema = z.object({
  block_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string(),
  end_time: z.string(),
  reason: z.string().min(2),
  public_note: z.string().optional().nullable(),
  internal_note: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  const auth = await requireStaffApi();
  if (isNextResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  const supabase = createServiceClient();
  let query = supabase.from(OAK_TREE_TABLES.blockedTimes).select("*").order("start_time");

  if (date) {
    query = query.eq("block_date", date);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ blocks: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireStaffApi();
  if (isNextResponse(auth)) return auth;

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid block data" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from(OAK_TREE_TABLES.blockedTimes)
    .insert({ ...parsed.data, created_by: auth.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ block: data }, { status: 201 });
}
