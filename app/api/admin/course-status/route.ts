import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { isNextResponse, requireStaffApi } from "@/lib/auth";

const schema = z.object({
  status_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  course_status: z.string().optional(),
  range_status: z.string().optional(),
  cart_status: z.string().optional(),
  announcement: z.string().optional().nullable(),
  first_available_time: z.string().optional().nullable(),
});

export async function PATCH(request: Request) {
  const auth = await requireStaffApi();
  if (isNextResponse(auth)) return auth;

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status data" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("course_status")
    .upsert(
      {
        ...parsed.data,
        updated_by: auth.id,
      },
      { onConflict: "status_date" },
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: data });
}
