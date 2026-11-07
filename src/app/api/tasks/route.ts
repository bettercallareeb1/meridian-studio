import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, projects, tasks } from "@/db";
import { unauthorizedIfNoSession } from "@/lib/api-auth";
import { getSessionUser } from "@/lib/auth";
import { getStudioWorkspaceData } from "@/lib/studio-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const unauthorized = await unauthorizedIfNoSession();
    if (unauthorized) {
      return unauthorized;
    }

    const workspace = await getStudioWorkspaceData();
    const { searchParams } = new URL(req.url);
    const projectIdParam = searchParams.get("projectId");
    const statusParam = searchParams.get("status");
    const qParam = searchParams.get("q")?.trim().toLowerCase();

    let items = workspace.tasks;
    if (projectIdParam) {
      const pid = Number(projectIdParam);
      if (Number.isInteger(pid) && pid > 0) {
        items = items.filter((t) => t.projectId === pid);
      }
    }
    if (statusParam && statusParam !== "All") {
      items = items.filter((t) => t.status === statusParam);
    }
    if (qParam) {
      items = items.filter(
        (t) =>
          t.title.toLowerCase().includes(qParam) ||
          t.description.toLowerCase().includes(qParam) ||
          (t.project?.name.toLowerCase().includes(qParam) ?? false) ||
          (t.assignee?.name.toLowerCase().includes(qParam) ?? false)
      );
    }

    return NextResponse.json({ tasks: items });
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return NextResponse.json(
      { error: "Failed to load deliverables" },
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
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const projectId = Number(body.projectId);
    const status =
      typeof body.status === "string" && body.status.trim()
        ? body.status.trim()
        : "In Progress";
    const priority =
      typeof body.priority === "string" && body.priority.trim()
        ? body.priority.trim()
        : "Normal";
    const dueDate =
      typeof body.dueDate === "string" && body.dueDate.trim()
        ? body.dueDate.trim()
        : "2026-06-15";
    const estimateHours =
      typeof body.estimateHours === "number" &&
      Number.isFinite(body.estimateHours)
        ? Math.max(1, Math.round(body.estimateHours))
        : 8;

    if (!title || title.length < 2) {
      return NextResponse.json(
        { error: "Deliverable title is required" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(projectId) || projectId <= 0) {
      return NextResponse.json(
        { error: "A valid project is required" },
        { status: 400 }
      );
    }

    const projectCheck = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (projectCheck.length === 0) {
      return NextResponse.json(
        { error: "Selected project does not exist" },
        { status: 404 }
      );
    }

    const assigneeId =
      typeof body.assigneeId === "number" && Number.isInteger(body.assigneeId)
        ? body.assigneeId
        : body.assigneeId === null
          ? null
          : sessionUser.id;

    const [created] = await db
      .insert(tasks)
      .values({
        projectId,
        assigneeId,
        title,
        description,
        status,
        priority,
        estimateHours,
        dueDate,
        position: 0,
      })
      .returning();

    const workspace = await getStudioWorkspaceData();
    const hydrated = workspace.tasks.find((t) => t.id === created.id) ?? null;

    return NextResponse.json({ task: hydrated ?? created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json(
      { error: "Failed to create deliverable" },
      { status: 500 }
    );
  }
}
