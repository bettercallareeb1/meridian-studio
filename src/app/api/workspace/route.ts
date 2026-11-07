import { NextResponse } from "next/server";
import { unauthorizedIfNoSession } from "@/lib/api-auth";
import { getStudioWorkspaceData } from "@/lib/studio-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const unauthorized = await unauthorizedIfNoSession();
    if (unauthorized) {
      return unauthorized;
    }

    const workspace = await getStudioWorkspaceData();
    return NextResponse.json(workspace);
  } catch (err) {
    console.error("Workspace fetch error:", err);
    return NextResponse.json(
      { error: "Failed to load studio workspace" },
      { status: 500 }
    );
  }
}
