import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  attachSessionCookie,
  createUserSession,
  hashPassword,
  toSafeUser,
} from "@/lib/auth";

const AVATAR_PALETTE = [
  "#4F46E5",
  "#059669",
  "#D97706",
  "#111111",
  "#E11D48",
  "#0284C7",
];

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role =
      typeof body.role === "string" && body.role.trim()
        ? body.role.trim()
        : "Senior Brand Designer";
    const department =
      typeof body.department === "string" && body.department.trim()
        ? body.department.trim()
        : "Brand Design";

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Full name must be at least 2 characters" },
        { status: 400 }
      );
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid work email address" },
        { status: 400 }
      );
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
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
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const avatarColor =
      AVATAR_PALETTE[Math.floor(Math.random() * AVATAR_PALETTE.length)];

    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash: hashPassword(password),
        role,
        department,
        weeklyCapacityHours: 40,
        hourlyRateCents: 18500,
        avatarColor,
        status: "In Studio",
        isAdmin: false,
      })
      .returning();

    const token = await createUserSession(created.id);
    const response = NextResponse.json(
      { user: toSafeUser(created) },
      { status: 201 }
    );
    return attachSessionCookie(response, token);
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Unable to create account right now" },
      { status: 500 }
    );
  }
}
