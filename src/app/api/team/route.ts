import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { unauthorizedIfNoSession } from "@/lib/api-auth";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { getStudioWorkspaceData } from "@/lib/studio-data";

export const dynamic = "force-dynamic";

const AVATAR_COLORS = [
  "#4F46E5",
  "#059669",
  "#D97706",
  "#111111",
  "#E11D48",
  "#0284C7",
];

export async function GET() {
  try {
    const unauthorized = await unauthorizedIfNoSession();
    if (unauthorized) {
      return unauthorized;
    }

    const workspace = await getStudioWorkspaceData();
    return NextResponse.json({ team: workspace.team });
  } catch (err) {
    console.error("GET /api/team error:", err);
    return NextResponse.json(
      { error: "Failed to load studio roster" },
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
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role =
      typeof body.role === "string" && body.role.trim()
        ? body.role.trim()
        : "Senior Designer";
    const department =
      typeof body.department === "string" && body.department.trim()
        ? body.department.trim()
        : "Brand Design";
    const status =
      typeof body.status === "string" && body.status.trim()
        ? body.status.trim()
        : "In Studio";
    const weeklyCapacityHours =
      typeof body.weeklyCapacityHours === "number" &&
      Number.isFinite(body.weeklyCapacityHours)
        ? Math.min(60, Math.max(10, Math.round(body.weeklyCapacityHours)))
        : 40;
    const hourlyRateCents =
      typeof body.hourlyRateCents === "number" &&
      Number.isFinite(body.hourlyRateCents)
        ? Math.max(5000, Math.round(body.hourlyRateCents))
        : 18500;
    const avatarColor =
      typeof body.avatarColor === "string" && body.avatarColor.startsWith("#")
        ? body.avatarColor
        : AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Member name is required" },
        { status: 400 }
      );
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "A studio member with this email already exists" },
        { status: 409 }
      );
    }

    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash: hashPassword("Meridian2026!"),
        role,
        department,
        weeklyCapacityHours,
        hourlyRateCents,
        avatarColor,
        status,
        isAdmin: false,
      })
      .returning();

    const workspace = await getStudioWorkspaceData();
    const hydrated = workspace.team.find((m) => m.id === created.id) ?? null;

    return NextResponse.json({ member: hydrated }, { status: 201 });
  } catch (err) {
    console.error("POST /api/team error:", err);
    return NextResponse.json(
      { error: "Failed to add studio member" },
      { status: 500 }
    );
  }
}
