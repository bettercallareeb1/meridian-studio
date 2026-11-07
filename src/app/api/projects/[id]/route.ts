import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, projects } from "@/db";
import { unauthorizedIfNoSession } from "@/lib/api-auth";
import { getSessionUser } from "@/lib/auth";
import { getStudioWorkspaceData } from "@/lib/studio-data";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = await unauthorizedIfNoSession();
    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const workspace = await getStudioWorkspaceData();
    const project = workspace.projects.find((p) => p.id === numericId);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (err) {
    console.error("GET /api/projects/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to load project" },
      { status: 500 }
    );
  }
}

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
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(projects)
      .where(eq(projects.id, numericId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updates: Partial<typeof projects.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim();
    }
    if (typeof body.clientName === "string" && body.clientName.trim()) {
      updates.clientName = body.clientName.trim();
    }
    if (typeof body.category === "string" && body.category.trim()) {
      updates.category = body.category.trim();
    }
    if (typeof body.status === "string" && body.status.trim()) {
      updates.status = body.status.trim();
    }
    if (typeof body.priority === "string" && body.priority.trim()) {
      updates.priority = body.priority.trim();
    }
    if (typeof body.summary === "string") {
      updates.summary = body.summary.trim();
    }
    if (typeof body.dueDate === "string" && body.dueDate.trim()) {
      updates.dueDate = body.dueDate.trim();
    }
    if (typeof body.budgetCents === "number" && Number.isFinite(body.budgetCents)) {
      updates.budgetCents = Math.max(0, Math.round(body.budgetCents));
    }
    if (typeof body.spentCents === "number" && Number.isFinite(body.spentCents)) {
      updates.spentCents = Math.max(0, Math.round(body.spentCents));
    }
    if (body.leadId === null || typeof body.leadId === "number") {
      updates.leadId = body.leadId;
    }

    await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, numericId));

    const workspace = await getStudioWorkspaceData();
    const hydrated = workspace.projects.find((p) => p.id === numericId);

    return NextResponse.json({ project: hydrated });
  } catch (err) {
    console.error("PATCH /api/projects/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to update project" },
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
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(projects)
      .where(eq(projects.id, numericId))
      .returning({ id: projects.id });

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deletedId: numericId });
  } catch (err) {
    console.error("DELETE /api/projects/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
