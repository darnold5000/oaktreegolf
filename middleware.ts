import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login")) {
    return updateSession(request);
  }
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
