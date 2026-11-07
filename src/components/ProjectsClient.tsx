"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  FolderKanban,
  Calendar,
} from "lucide-react";
import { useWorkspace } from "@/components/WorkspaceProvider";
import {
  formatCurrency,
  formatShortDate,
  getInitials,
  getPriorityStyle,
  getProjectStatusStyle,
} from "@/lib/format";

export function ProjectsClient() {
  const {
    workspace,
    openProjectModal,
    deleteProject,
    setSelectedProjectId,
  } = useWorkspace();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = workspace.projects.filter((p) => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[#71717A] dark:text-[#A1A1AA]">
            Client Engagements
          </span>
          <h1 className="mt-1 text-[26px] font-semibold leading-[1.2] tracking-[-0.025em] text-[#111111] dark:text-[#F4F4F5]">
            Studio Projects
          </h1>
          <p className="mt-1 text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
            Manage active client briefs, budgets, delivery milestones, and lead
            assignments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openProjectModal(null)}
          className="inline-flex items-center gap-1.5 self-start rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#27272A] dark:bg-[#F4F4F5] dark:text-[#111111] dark:hover:bg-[#E4E4E7] sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Engagement
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-3.5 dark:border-[#27272F] dark:bg-[#19191E] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {["All", "Active", "In Review", "Planning", "Completed"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                statusFilter === st
                  ? "bg-[#111111] text-white dark:bg-[#F4F4F5] dark:text-[#111111]"
                  : "bg-[#F7F7F5] text-[#52525B] hover:bg-[#F0EFEA] hover:text-[#111111] dark:bg-[#141418] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#71717A]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, client, title..."
              className="w-full rounded-lg border border-[#E4E4E7] bg-[#F7F7F5]/60 py-1.5 pr-3 pl-8 text-[13px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:bg-[#FFFFFF] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5] dark:focus:bg-[#141418]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by discipline"
            className="rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-1.5 text-[12px] font-medium text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
          >
            <option value="All">All Disciplines</option>
            <option value="Brand Identity">Brand Identity</option>
            <option value="Digital Product">Digital Product</option>
            <option value="Spatial & Motion">Spatial & Motion</option>
            <option value="Editorial">Editorial</option>
          </select>

          <div className="flex rounded-lg border border-[#E4E4E7] bg-[#F7F7F5] p-0.5 dark:border-[#27272F] dark:bg-[#141418]">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              className={`rounded-md p-1.5 ${
                viewMode === "grid"
                  ? "bg-[#FFFFFF] text-[#111111] shadow-2xs dark:bg-[#222229] dark:text-[#F4F4F5]"
                  : "text-[#71717A] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              aria-label="Table view"
              className={`rounded-md p-1.5 ${
                viewMode === "table"
                  ? "bg-[#FFFFFF] text-[#111111] shadow-2xs dark:bg-[#222229] dark:text-[#F4F4F5]"
                  : "text-[#71717A] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E4E4E7] bg-[#FFFFFF] p-12 text-center dark:border-[#27272F] dark:bg-[#19191E]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0EFEA] text-[#52525B] dark:bg-[#222229] dark:text-[#A1A1AA]">
            <FolderKanban className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-[16px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
            No client projects found
          </h3>
          <p className="mt-1 max-w-sm text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
            {search || statusFilter !== "All" || categoryFilter !== "All"
              ? "Try adjusting your active search query or discipline filters."
              : "Start your first studio engagement to organize deliverables and team bookings."}
          </p>
          <div className="mt-4 flex items-center gap-2">
            {(search || statusFilter !== "All" || categoryFilter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setCategoryFilter("All");
                }}
                className="rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3.5 py-2 text-[13px] font-medium text-[#111111] dark:border-[#27272F] dark:bg-[#222229] dark:text-[#F4F4F5]"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={() => openProjectModal(null)}
              className="rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white dark:bg-[#F4F4F5] dark:text-[#111111]"
            >
              + New Engagement
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => {
            const pct =
              project.taskCount > 0
                ? Math.round(
                    (project.completedTaskCount / project.taskCount) * 100
                  )
                : 0;
            const budgetPct =
              project.budgetCents > 0
                ? Math.min(
                    100,
                    Math.round((project.spentCents / project.budgetCents) * 100)
                  )
                : 0;

            return (
              <article
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="group flex cursor-pointer flex-col justify-between rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-5 transition hover:border-[#111111]/40 hover:shadow-[0_6px_20px_rgba(17,17,17,0.04)] dark:border-[#27272F] dark:bg-[#19191E] dark:hover:border-[#818CF8]/50 dark:hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-medium text-[#71717A] dark:text-[#A1A1AA]">
                      {project.code} · {project.category}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${getProjectStatusStyle(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-[17px] font-semibold tracking-[-0.015em] text-[#111111] group-hover:text-[#4F46E5] dark:text-[#F4F4F5] dark:group-hover:text-[#818CF8]">
                    {project.name}
                  </h3>
                  <div className="mt-0.5 text-[13px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
                    {project.clientName}
                  </div>

                  {project.summary && (
                    <p className="mt-2.5 line-clamp-2 text-[13px] leading-[1.55] text-[#52525B] dark:text-[#A1A1AA]">
                      {project.summary}
                    </p>
                  )}
                </div>

                <div className="mt-5 space-y-3 border-t border-[#E4E4E7] pt-4 dark:border-[#27272F]">
                  <div className="grid grid-cols-2 gap-3 text-[12px]">
                    <div>
                      <div className="flex items-center justify-between text-[#52525B] dark:text-[#A1A1AA]">
                        <span>Deliverables</span>
                        <span className="font-mono font-medium text-[#111111] tabular-nums dark:text-[#F4F4F5]">
                          {project.completedTaskCount}/{project.taskCount}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#E4E4E7] dark:bg-[#27272F]">
                        <div
                          className="h-full rounded-full bg-[#059669] dark:bg-[#34D399]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[#52525B] dark:text-[#A1A1AA]">
                        <span>Budget</span>
                        <span className="font-mono font-medium text-[#111111] tabular-nums dark:text-[#F4F4F5]">
                          {formatCurrency(project.budgetCents)}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#E4E4E7] dark:bg-[#27272F]">
                        <div
                          className="h-full rounded-full bg-[#4F46E5] dark:bg-[#6366F1]"
                          style={{ width: `${budgetPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      {project.lead && (
                        <span
                          title={project.lead.name}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                          style={{ backgroundColor: project.lead.avatarColor }}
                        >
                          {getInitials(project.lead.name)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#52525B] tabular-nums dark:text-[#A1A1AA]">
                        <Calendar className="h-3 w-3 text-[#71717A]" />
                        {formatShortDate(project.dueDate)}
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => openProjectModal(project)}
                        className="rounded-md p-1.5 text-[#71717A] hover:bg-[#F0EFEA] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
                        aria-label={`Edit ${project.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {deletingId === project.id ? (
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingId(null);
                            deleteProject(project.id);
                          }}
                          className="rounded-md bg-[#E11D48] px-2 py-0.5 text-[11px] font-semibold text-white"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeletingId(project.id)}
                          className="rounded-md p-1.5 text-[#71717A] hover:bg-[#FFF1F2] hover:text-[#E11D48] dark:text-[#A1A1AA] dark:hover:bg-[#E11D48]/15 dark:hover:text-[#FB7185]"
                          aria-label={`Delete ${project.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] dark:border-[#27272F] dark:bg-[#19191E]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#E4E4E7] bg-[#F7F7F5] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#71717A] dark:border-[#27272F] dark:bg-[#141418] dark:text-[#A1A1AA]">
                  <th className="py-3 pr-3 pl-5">Code</th>
                  <th className="px-3 py-3">Project & Client</th>
                  <th className="px-3 py-3">Lead</th>
                  <th className="px-3 py-3">Deliverables</th>
                  <th className="px-3 py-3">Budget</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="py-3 pr-5 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] text-[13px] dark:divide-[#27272F]">
                {filtered.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className="cursor-pointer transition hover:bg-[#F7F7F5] dark:hover:bg-[#222229]/60"
                  >
                    <td className="py-3.5 pr-3 pl-5 font-mono text-[12px] text-[#71717A] dark:text-[#A1A1AA]">
                      {project.code}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="font-semibold text-[#111111] dark:text-[#F4F4F5]">
                        {project.name}
                      </div>
                      <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                        {project.clientName} · {project.category}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      {project.lead ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                            style={{
                              backgroundColor: project.lead.avatarColor,
                            }}
                          >
                            {getInitials(project.lead.name)}
                          </span>
                          <span className="text-[12px] text-[#111111] dark:text-[#F4F4F5]">
                            {project.lead.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#71717A]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 font-mono text-[12px] text-[#111111] tabular-nums dark:text-[#F4F4F5]">
                      {project.completedTaskCount}/{project.taskCount}
                    </td>
                    <td className="px-3 py-3.5 font-mono text-[12px] text-[#111111] tabular-nums dark:text-[#F4F4F5]">
                      {formatCurrency(project.budgetCents)}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${getPriorityStyle(
                          project.priority
                        )}`}
                      >
                        {project.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${getProjectStatusStyle(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td
                      className="py-3.5 pr-5 pl-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openProjectModal(project)}
                          className="rounded p-1.5 text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#2E2E38] dark:hover:text-[#F4F4F5]"
                          aria-label={`Edit ${project.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProject(project.id)}
                          className="rounded p-1.5 text-[#71717A] hover:bg-[#FFF1F2] hover:text-[#E11D48] dark:text-[#A1A1AA] dark:hover:bg-[#E11D48]/15 dark:hover:text-[#FB7185]"
                          aria-label={`Delete ${project.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
