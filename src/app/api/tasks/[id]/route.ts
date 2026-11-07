import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, tasks } from "@/db";
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
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, numericId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Deliverable not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updates: Partial<typeof tasks.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof body.title === "string" && body.title.trim()) {
      updates.title = body.title.trim();
    }
    if (typeof body.description === "string") {
      updates.description = body.description.trim();
    }
    if (typeof body.status === "string" && body.status.trim()) {
      updates.status = body.status.trim();
    }
    if (typeof body.priority === "string" && body.priority.trim()) {
      updates.priority = body.priority.trim();
    }
    if (typeof body.dueDate === "string" && body.dueDate.trim()) {
      updates.dueDate = body.dueDate.trim();
    }
    if (
      typeof body.projectId === "number" &&
      Number.isInteger(body.projectId) &&
      body.projectId > 0
    ) {
      updates.projectId = body.projectId;
    }
    if (body.assigneeId === null || typeof body.assigneeId === "number") {
      updates.assigneeId = body.assigneeId;
    }
    if (
      typeof body.estimateHours === "number" &&
      Number.isFinite(body.estimateHours)
    ) {
      updates.estimateHours = Math.max(1, Math.round(body.estimateHours));
    }
    if (typeof body.position === "number" && Number.isInteger(body.position)) {
      updates.position = body.position;
    }

    await db.update(tasks).set(updates).where(eq(tasks.id, numericId));

    const workspace = await getStudioWorkspaceData();
    const hydrated = workspace.tasks.find((t) => t.id === numericId);

    return NextResponse.json({ task: hydrated });
  } catch (err) {
    console.error("PATCH /api/tasks/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update deliverable" },
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
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const deleted = await db
      .delete(tasks)
      .where(eq(tasks.id, numericId))
      .returning({ id: tasks.id });

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Deliverable not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deletedId: numericId });
  } catch (err) {
    console.error("DELETE /api/tasks/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete deliverable" },
      { status: 500 }
    );
  }
}
