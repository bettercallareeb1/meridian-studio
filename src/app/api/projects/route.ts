import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, projects, users } from "@/db";
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
    const statusFilter = searchParams.get("status");
    const queryFilter = searchParams.get("q")?.trim().toLowerCase();

    let items = workspace.projects;
    if (statusFilter && statusFilter !== "All") {
      items = items.filter((p) => p.status === statusFilter);
    }
    if (queryFilter) {
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(queryFilter) ||
          p.clientName.toLowerCase().includes(queryFilter) ||
          p.code.toLowerCase().includes(queryFilter) ||
          p.category.toLowerCase().includes(queryFilter)
      );
    }

    return NextResponse.json({ projects: items });
  } catch (err) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json(
      { error: "Failed to load projects" },
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
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const clientName =
      typeof body.clientName === "string" ? body.clientName.trim() : "";
    const category =
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : "Brand Identity";
    const status =
      typeof body.status === "string" && body.status.trim()
        ? body.status.trim()
        : "Active";
    const priority =
      typeof body.priority === "string" && body.priority.trim()
        ? body.priority.trim()
        : "High";
    const summary =
      typeof body.summary === "string" ? body.summary.trim() : "";
    const dueDate =
      typeof body.dueDate === "string" && body.dueDate.trim()
        ? body.dueDate.trim()
        : "2026-07-15";

    const budgetCents =
      typeof body.budgetCents === "number" && Number.isFinite(body.budgetCents)
        ? Math.max(0, Math.round(body.budgetCents))
        : 6500000;
    const spentCents =
      typeof body.spentCents === "number" && Number.isFinite(body.spentCents)
        ? Math.max(0, Math.round(body.spentCents))
        : 0;

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Project title is required" },
        { status: 400 }
      );
    }
    if (!clientName || clientName.length < 2) {
      return NextResponse.json(
        { error: "Client name is required" },
        { status: 400 }
      );
    }

    let leadId: number | null = sessionUser.id;
    if (typeof body.leadId === "number" && Number.isInteger(body.leadId)) {
      const leadCheck = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, body.leadId))
        .limit(1);
      leadId = leadCheck.length > 0 ? body.leadId : sessionUser.id;
    } else if (body.leadId === null) {
      leadId = null;
    }

    const randomCodeNum = Math.floor(220 + Math.random() * 750);
    const rawCode =
      typeof body.code === "string" && body.code.trim()
        ? body.code.trim().toUpperCase()
        : `MRD-${randomCodeNum}`;

    const existingCode = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.code, rawCode))
      .limit(1);

    const code =
      existingCode.length > 0
        ? `MRD-${Math.floor(100 + Math.random() * 899)}`
        : rawCode;

    const [created] = await db
      .insert(projects)
      .values({
        code,
        name,
        clientName,
        category,
        status,
        priority,
        budgetCents,
        spentCents,
        dueDate,
        leadId,
        summary,
      })
      .returning();

    const workspace = await getStudioWorkspaceData();
    const hydrated =
      workspace.projects.find((p) => p.id === created.id) ?? null;

    return NextResponse.json({ project: hydrated ?? created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
