import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { getStudioWorkspaceData } from "@/lib/studio-data";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return NextResponse.json(
        { error: "Invalid member ID" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, numericId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Studio member not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updates: Partial<typeof users.$inferInsert> = {};

    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim();
    }
    if (typeof body.role === "string" && body.role.trim()) {
      updates.role = body.role.trim();
    }
    if (typeof body.department === "string" && body.department.trim()) {
      updates.department = body.department.trim();
    }
    if (typeof body.status === "string" && body.status.trim()) {
      updates.status = body.status.trim();
    }
    if (
      typeof body.weeklyCapacityHours === "number" &&
      Number.isFinite(body.weeklyCapacityHours)
    ) {
      updates.weeklyCapacityHours = Math.min(
        60,
        Math.max(10, Math.round(body.weeklyCapacityHours))
      );
    }
    if (
      typeof body.hourlyRateCents === "number" &&
      Number.isFinite(body.hourlyRateCents)
    ) {
      updates.hourlyRateCents = Math.max(
        5000,
        Math.round(body.hourlyRateCents)
      );
    }
    if (
      typeof body.avatarColor === "string" &&
      body.avatarColor.startsWith("#")
    ) {
      updates.avatarColor = body.avatarColor;
    }

    await db.update(users).set(updates).where(eq(users.id, numericId));

    const workspace = await getStudioWorkspaceData();
    const hydrated = workspace.team.find((m) => m.id === numericId);

    return NextResponse.json({ member: hydrated });
  } catch (err) {
    console.error("PATCH /api/team/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update studio member" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return NextResponse.json(
        { error: "Invalid member ID" },
        { status: 400 }
      );
    }

    if (sessionUser.id === numericId) {
      return NextResponse.json(
        { error: "You cannot remove your currently active session account" },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(users)
      .where(eq(users.id, numericId))
      .returning({ id: users.id });

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Studio member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deletedId: numericId });
  } catch (err) {
    console.error("DELETE /api/team/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to remove studio member" },
      { status: 500 }
    );
  }
}
