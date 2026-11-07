"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Download,
  FileText,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";

interface ProjectFile {
  id: number;
  projectId: number;
  storageKey: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedById: number | null;
  createdAt: string;
  url: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProjectFilesSection({ projectId }: { projectId: number }) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/files`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not load project files");
      }
      setFiles(data.files ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load files");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  async function handleUpload(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(file: ProjectFile) {
    if (!window.confirm(`Delete "${file.fileName}"?`)) return;

    setDeletingId(file.id);
    setError(null);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/files/${file.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Delete failed");
      }
      setFiles((prev) => prev.filter((item) => item.id !== file.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#71717A] dark:text-[#A1A1AA]">
          <Paperclip className="h-3.5 w-3.5" />
          Project Files ({files.length})
        </h4>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#4F46E5] hover:text-[#4338CA] disabled:opacity-60 dark:text-[#818CF8] dark:hover:text-[#A5B4FC]"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {uploading ? "Uploading..." : "Upload File"}
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => void handleUpload(e.target.files)}
          aria-label="Upload a project file"
        />
      </div>

      <p className="mt-1 text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
        Stored in Neon Object Storage · private bucket · 10 MB max
      </p>

      {error && (
        <div className="mt-2 flex items-start gap-1.5 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-2.5 py-1.5 text-[12px] text-[#B91C1C] dark:border-[#7F1D1D] dark:bg-[#450A0A]/40 dark:text-[#FCA5A5]">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-2.5 divide-y divide-[#E4E4E7] rounded-xl border border-[#E4E4E7] dark:divide-[#27272F] dark:border-[#27272F]">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-6 text-[13px] text-[#71717A] dark:text-[#A1A1AA]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading project files...
          </div>
        ) : files.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-[#71717A] dark:text-[#A1A1AA]">
            No files uploaded yet. Add a brief, deck, or reference asset.
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-[#F7F7F5]/60 dark:hover:bg-[#222229]/60"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <FileText className="h-4 w-4 shrink-0 text-[#71717A] dark:text-[#A1A1AA]" />
                <div className="min-w-0">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-[13px] font-medium text-[#111111] hover:text-[#4F46E5] dark:text-[#F4F4F5] dark:hover:text-[#818CF8]"
                  >
                    {file.fileName}
                  </a>
                  <div className="text-[11px] text-[#71717A] tabular-nums dark:text-[#A1A1AA]">
                    {formatBytes(file.sizeBytes)} ·{" "}
                    {new Date(file.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Download ${file.fileName}`}
                  className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => void handleDelete(file)}
                  disabled={deletingId === file.id}
                  aria-label={`Delete ${file.fileName}`}
                  className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#FEF2F2] hover:text-[#B91C1C] disabled:opacity-60 dark:text-[#A1A1AA] dark:hover:bg-[#450A0A]/40 dark:hover:text-[#FCA5A5]"
                >
                  {deletingId === file.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
