import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isNextResponse, requireStaffApi } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireStaffApi();
  if (isNextResponse(auth)) return auth;

  const { id } = await params;
  const supabase = createServiceClient();
  const { error } = await supabase.from("blocked_times").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
