import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/**
 * Returns a 401 response when the request has no valid studio session.
 * Read endpoints call this so workspace data is never exposed anonymously.
 */
export async function unauthorizedIfNoSession() {
  const user = await getSessionUser();
  if (user) {
    return null;
  }

  return NextResponse.json(
    { error: "Authentication required" },
    { status: 401 }
  );
}
