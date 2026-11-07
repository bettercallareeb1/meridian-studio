"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Columns3,
  List,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  CheckSquare,
} from "lucide-react";
import { useWorkspace } from "@/components/WorkspaceProvider";
import {
  formatShortDate,
  getInitials,
  getPriorityStyle,
  getTaskStatusStyle,
} from "@/lib/format";

const STAGES = ["Backlog", "In Progress", "In Review", "Done"] as const;

export function TasksClient() {
  const { workspace, openTaskModal, updateTask, deleteTask } = useWorkspace();

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  const filtered = workspace.tasks.filter((t) => {
    if (projectFilter !== "All" && String(t.projectId) !== projectFilter) {
      return false;
    }
    if (priorityFilter !== "All" && t.priority !== priorityFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.project?.name.toLowerCase().includes(q) ?? false) ||
        (t.assignee?.name.toLowerCase().includes(q) ?? false)
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
            Production Workflow
          </span>
          <h1 className="mt-1 text-[26px] font-semibold leading-[1.2] tracking-[-0.025em] text-[#111111] dark:text-[#F4F4F5]">
            Studio Deliverables
          </h1>
          <p className="mt-1 text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
            Track creative milestones from backlog to client sign-off with
            instant status updates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openTaskModal(null)}
          className="inline-flex items-center gap-1.5 self-start rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#27272A] dark:bg-[#F4F4F5] dark:text-[#111111] dark:hover:bg-[#E4E4E7] sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Deliverable
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-3.5 dark:border-[#27272F] dark:bg-[#19191E] md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[210px]">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#71717A]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deliverables or assignees..."
              className="w-full rounded-lg border border-[#E4E4E7] bg-[#F7F7F5]/60 py-1.5 pr-3 pl-8 text-[13px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:bg-[#FFFFFF] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5] dark:focus:bg-[#141418]"
            />
          </div>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            aria-label="Filter by project"
            className="rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-1.5 text-[12px] font-medium text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
          >
            <option value="All">All Projects</option>
            {workspace.projects.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.code} · {p.name}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
            className="rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-1.5 text-[12px] font-medium text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex items-center justify-between gap-3 md:justify-end">
          <span className="font-mono text-[12px] text-[#71717A] tabular-nums dark:text-[#A1A1AA]">
            {filtered.length}{" "}
            {filtered.length === 1 ? "deliverable" : "deliverables"}
          </span>

          <div className="flex rounded-lg border border-[#E4E4E7] bg-[#F7F7F5] p-0.5 dark:border-[#27272F] dark:bg-[#141418]">
            <button
              type="button"
              onClick={() => setViewMode("board")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium ${
                viewMode === "board"
                  ? "bg-[#FFFFFF] text-[#111111] shadow-2xs dark:bg-[#222229] dark:text-[#F4F4F5]"
                  : "text-[#71717A] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
              Board
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-medium ${
                viewMode === "list"
                  ? "bg-[#FFFFFF] text-[#111111] shadow-2xs dark:bg-[#222229] dark:text-[#F4F4F5]"
                  : "text-[#71717A] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E4E4E7] bg-[#FFFFFF] p-12 text-center dark:border-[#27272F] dark:bg-[#19191E]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0EFEA] text-[#52525B] dark:bg-[#222229] dark:text-[#A1A1AA]">
            <CheckSquare className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-[16px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
            No deliverables match your view
          </h3>
          <p className="mt-1 max-w-sm text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
            Create a new production deliverable or clear your active search
            filters.
          </p>
          <button
            type="button"
            onClick={() => openTaskModal(null)}
            className="mt-4 rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white dark:bg-[#F4F4F5] dark:text-[#111111]"
          >
            + New Deliverable
          </button>
        </div>
      ) : viewMode === "board" ? (
        /* 4-Column Kanban Board */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STAGES.map((stage) => {
            const stageTasks = filtered.filter((t) => t.status === stage);
            return (
              <div
                key={stage}
                className="flex flex-col rounded-xl border border-[#E4E4E7] bg-[#F0EFEA]/70 p-3 dark:border-[#27272F] dark:bg-[#141418]"
              >
                <div className="flex items-center justify-between px-1 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getTaskStatusStyle(
                        stage
                      )}`}
                    >
                      {stage}
                    </span>
                    <span className="font-mono text-[12px] font-medium text-[#52525B] tabular-nums dark:text-[#A1A1AA]">
                      {stageTasks.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openTaskModal(null)}
                    className="rounded p-1 text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
                    aria-label={`Add deliverable to ${stage}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex flex-1 flex-col gap-2.5">
                  {stageTasks.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-[#E4E4E7] bg-[#FFFFFF]/50 p-6 text-center text-[12px] text-[#71717A] dark:border-[#27272F] dark:bg-[#19191E]/40 dark:text-[#A1A1AA]">
                      No items in {stage}
                    </div>
                  ) : (
                    stageTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => openTaskModal(task)}
                        className="group cursor-pointer rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-3.5 shadow-2xs transition hover:border-[#111111]/40 dark:border-[#27272F] dark:bg-[#19191E] dark:hover:border-[#818CF8]/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-medium text-[#71717A] dark:text-[#A1A1AA]">
                            {task.project?.code ?? "MRD"}
                          </span>
                          <span
                            className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${getPriorityStyle(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <h4 className="mt-2 text-[13px] font-semibold leading-[1.4] text-[#111111] group-hover:text-[#4F46E5] dark:text-[#F4F4F5] dark:group-hover:text-[#818CF8]">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                            {task.description}
                          </p>
                        )}

                        <div
                          className="mt-3 flex items-center justify-between border-t border-[#E4E4E7] pt-2.5 dark:border-[#27272F]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            {task.assignee && (
                              <span
                                title={task.assignee.name}
                                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                                style={{
                                  backgroundColor: task.assignee.avatarColor,
                                }}
                              >
                                {getInitials(task.assignee.name)}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#71717A] tabular-nums dark:text-[#A1A1AA]">
                              <Clock className="h-3 w-3" />
                              {task.estimateHours}h
                            </span>
                          </div>

                          <select
                            value={task.status}
                            aria-label={`Move ${task.title} stage`}
                            onChange={(e) =>
                              updateTask(task.id, { status: e.target.value })
                            }
                            className="rounded-md border border-[#E4E4E7] bg-[#F7F7F5] px-1.5 py-0.5 text-[11px] font-medium text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
                          >
                            {STAGES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="overflow-hidden rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] dark:border-[#27272F] dark:bg-[#19191E]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#E4E4E7] bg-[#F7F7F5] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#71717A] dark:border-[#27272F] dark:bg-[#141418] dark:text-[#A1A1AA]">
                  <th className="py-3 pr-2 pl-5">Done</th>
                  <th className="px-3 py-3">Deliverable</th>
                  <th className="px-3 py-3">Project</th>
                  <th className="px-3 py-3">Assignee</th>
                  <th className="px-3 py-3">Stage</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-3 py-3">Due</th>
                  <th className="py-3 pr-5 pl-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] text-[13px] dark:divide-[#27272F]">
                {filtered.map((task) => {
                  const isDone = task.status === "Done";
                  return (
                    <tr
                      key={task.id}
                      onClick={() => openTaskModal(task)}
                      className="cursor-pointer transition hover:bg-[#F7F7F5] dark:hover:bg-[#222229]/60"
                    >
                      <td
                        className="py-3 pr-2 pl-5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateTask(task.id, {
                              status: isDone ? "In Progress" : "Done",
                            })
                          }
                          className="text-[#52525B] hover:text-[#059669] dark:text-[#A1A1AA] dark:hover:text-[#34D399]"
                          aria-label={`Toggle ${task.title}`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-[#059669] dark:text-[#34D399]" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div
                          className={`font-semibold ${
                            isDone
                              ? "text-[#71717A] line-through"
                              : "text-[#111111] dark:text-[#F4F4F5]"
                          }`}
                        >
                          {task.title}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                        {task.project?.code ?? "—"}
                      </td>
                      <td className="px-3 py-3">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <span
                              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                              style={{
                                backgroundColor: task.assignee.avatarColor,
                              }}
                            >
                              {getInitials(task.assignee.name)}
                            </span>
                            <span className="text-[12px] text-[#111111] dark:text-[#F4F4F5]">
                              {task.assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[12px] text-[#71717A]">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td
                        className="px-3 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={task.status}
                          onChange={(e) =>
                            updateTask(task.id, { status: e.target.value })
                          }
                          className="rounded-md border border-[#E4E4E7] bg-[#FFFFFF] px-2 py-1 text-[12px] font-medium text-[#111111] dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
                        >
                          {STAGES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-[12px] text-[#52525B] tabular-nums dark:text-[#A1A1AA]">
                        {formatShortDate(task.dueDate)}
                      </td>
                      <td
                        className="py-3 pr-5 pl-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="rounded p-1.5 text-[#71717A] hover:bg-[#FFF1F2] hover:text-[#E11D48] dark:text-[#A1A1AA] dark:hover:bg-[#E11D48]/15 dark:hover:text-[#FB7185]"
                          aria-label={`Delete ${task.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
