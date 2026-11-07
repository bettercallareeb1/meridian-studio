import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { bookings, db } from "@/db";
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
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, numericId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updates: Partial<typeof bookings.$inferInsert> = {};

    if (
      typeof body.projectId === "number" &&
      Number.isInteger(body.projectId) &&
      body.projectId > 0
    ) {
      updates.projectId = body.projectId;
    }
    if (
      typeof body.memberId === "number" &&
      Number.isInteger(body.memberId) &&
      body.memberId > 0
    ) {
      updates.memberId = body.memberId;
    }
    if (typeof body.roleTitle === "string" && body.roleTitle.trim()) {
      updates.roleTitle = body.roleTitle.trim();
    }
    if (
      typeof body.allocationPercent === "number" &&
      Number.isFinite(body.allocationPercent)
    ) {
      updates.allocationPercent = Math.min(
        100,
        Math.max(5, Math.round(body.allocationPercent))
      );
    }
    if (typeof body.startDate === "string" && body.startDate.trim()) {
      updates.startDate = body.startDate.trim();
    }
    if (typeof body.endDate === "string" && body.endDate.trim()) {
      updates.endDate = body.endDate.trim();
    }
    if (typeof body.status === "string" && body.status.trim()) {
      updates.status = body.status.trim();
    }
    if (typeof body.notes === "string") {
      updates.notes = body.notes.trim();
    }

    await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, numericId));

    const workspace = await getStudioWorkspaceData();
    const hydrated = workspace.bookings.find((b) => b.id === numericId);

    return NextResponse.json({ booking: hydrated });
  } catch (err) {
    console.error("PATCH /api/bookings/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update booking" },
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
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(bookings)
      .where(eq(bookings.id, numericId))
      .returning({ id: bookings.id });

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deletedId: numericId });
  } catch (err) {
    console.error("DELETE /api/bookings/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
