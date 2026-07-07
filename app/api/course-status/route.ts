import { NextResponse } from "next/server";
import { format } from "date-fns";
import { getCourseStatus } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd");

  try {
    const status = await getCourseStatus(date);
    return NextResponse.json(status);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load course status" }, { status: 500 });
  }
}
