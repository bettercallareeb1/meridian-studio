import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { bookings, db, projects, users } from "@/db";
import { unauthorizedIfNoSession } from "@/lib/api-auth";
import { getSessionUser } from "@/lib/auth";
import { getStudioWorkspaceData } from "@/lib/studio-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const unauthorized = await unauthorizedIfNoSession();
    if (unauthorized) {
      return unauthorized;
    }

    const workspace = await getStudioWorkspaceData();
    return NextResponse.json({ bookings: workspace.bookings });
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    return NextResponse.json(
      { error: "Failed to load resource bookings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const projectId = Number(body.projectId);
    const memberId = Number(body.memberId);
    const roleTitle =
      typeof body.roleTitle === "string" && body.roleTitle.trim()
        ? body.roleTitle.trim()
        : "Senior Designer";
    const allocationPercent =
      typeof body.allocationPercent === "number" &&
      Number.isFinite(body.allocationPercent)
        ? Math.min(100, Math.max(5, Math.round(body.allocationPercent)))
        : 50;
    const startDate =
      typeof body.startDate === "string" && body.startDate.trim()
        ? body.startDate.trim()
        : "2026-05-15";
    const endDate =
      typeof body.endDate === "string" && body.endDate.trim()
        ? body.endDate.trim()
        : "2026-06-30";
    const status =
      typeof body.status === "string" && body.status.trim()
        ? body.status.trim()
        : "Confirmed";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return NextResponse.json(
        { error: "Valid project is required" },
        { status: 400 }
      );
    }
    if (!Number.isInteger(memberId) || memberId <= 0) {
      return NextResponse.json(
        { error: "Valid team member is required" },
        { status: 400 }
      );
    }

    const [projExists, memberExists] = await Promise.all([
      db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1),
      db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, memberId))
        .limit(1),
    ]);

    if (projExists.length === 0) {
      return NextResponse.json(
        { error: "Selected project not found" },
        { status: 404 }
      );
    }
    if (memberExists.length === 0) {
      return NextResponse.json(
        { error: "Selected studio member not found" },
        { status: 404 }
      );
    }

    const [created] = await db
      .insert(bookings)
      .values({
        projectId,
        memberId,
        roleTitle,
        allocationPercent,
        startDate,
        endDate,
        status,
        notes,
      })
      .returning();

    const workspace = await getStudioWorkspaceData();
    const hydrated =
      workspace.bookings.find((b) => b.id === created.id) ?? null;

    return NextResponse.json(
      { booking: hydrated ?? created },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json(
      { error: "Failed to create resource booking" },
      { status: 500 }
    );
  }
}
