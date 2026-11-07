import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db, projectFiles, projects } from "@/db";
import { unauthorizedIfNoSession } from "@/lib/api-auth";
import { getSessionUser } from "@/lib/auth";
import { deleteObject, getObjectUrl, uploadObject } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

function parseProjectId(id: string): number | null {
  const numericId = Number(id);
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
}

function sanitizeFileName(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  return cleaned || "file";
}

async function hydrateFile(file: typeof projectFiles.$inferSelect) {
  return {
    ...file,
    url: await getObjectUrl(file.storageKey),
  };
}

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
    const projectId = parseProjectId(id);
    if (!projectId) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const rows = await db
      .select()
      .from(projectFiles)
      .where(eq(projectFiles.projectId, projectId))
      .orderBy(desc(projectFiles.id));

    const files = await Promise.all(rows.map(hydrateFile));
    return NextResponse.json({ files });
  } catch (err) {
    console.error("GET /api/projects/[id]/files error:", err);
    return NextResponse.json(
      { error: "Failed to load project files" },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const projectId = parseProjectId(id);
    if (!projectId) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const projectExists = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);
    if (projectExists.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "A file is required" },
        { status: 400 }
      );
    }
    if (file.size === 0) {
      return NextResponse.json(
        { error: "The selected file is empty" },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "Files must be 10 MB or smaller" },
        { status: 413 }
      );
    }

    const storageKey = `projects/${projectId}/${randomUUID()}-${sanitizeFileName(
      file.name
    )}`;
    const contentType = file.type || "application/octet-stream";
    const body = Buffer.from(await file.arrayBuffer());

    await uploadObject(storageKey, body, contentType);

    try {
      const [created] = await db
        .insert(projectFiles)
        .values({
          projectId,
          storageKey,
          fileName: file.name || sanitizeFileName(file.name),
          contentType,
          sizeBytes: file.size,
          uploadedById: sessionUser.id,
        })
        .returning();

      return NextResponse.json(
        { file: await hydrateFile(created) },
        { status: 201 }
      );
    } catch (dbError) {
      await deleteObject(storageKey).catch(() => undefined);
      throw dbError;
    }
  } catch (err) {
    console.error("POST /api/projects/[id]/files error:", err);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
