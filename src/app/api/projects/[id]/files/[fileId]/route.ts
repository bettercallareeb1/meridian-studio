import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, projectFiles } from "@/db";
import { getSessionUser } from "@/lib/auth";
import { deleteObject } from "@/lib/storage";

export const dynamic = "force-dynamic";

function parseId(value: string): number | null {
  const numericId = Number(value);
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id, fileId } = await context.params;
    const projectId = parseId(id);
    const numericFileId = parseId(fileId);
    if (!projectId || !numericFileId) {
      return NextResponse.json(
        { error: "Invalid project or file ID" },
        { status: 400 }
      );
    }

    const [file] = await db
      .select()
      .from(projectFiles)
      .where(
        and(
          eq(projectFiles.id, numericFileId),
          eq(projectFiles.projectId, projectId)
        )
      )
      .limit(1);

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    await deleteObject(file.storageKey).catch((err) => {
      console.error("Storage delete warning:", err);
    });

    await db
      .delete(projectFiles)
      .where(eq(projectFiles.id, numericFileId));

    return NextResponse.json({ deletedId: numericFileId });
  } catch (err) {
    console.error("DELETE /api/projects/[id]/files/[fileId] error:", err);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
