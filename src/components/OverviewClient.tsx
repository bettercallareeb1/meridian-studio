"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Pencil,
  CalendarPlus,
  RefreshCw,
  FolderKanban,
} from "lucide-react";
import { useWorkspace } from "@/components/WorkspaceProvider";
import {
  formatCurrency,
  formatShortDate,
  getInitials,
  getMemberStatusStyle,
  getPriorityStyle,
  getProjectStatusStyle,
} from "@/lib/format";

export function OverviewClient() {
  const {
    currentUser,
    workspace,
    refreshing,
    refreshWorkspace,
    openProjectModal,
    openTaskModal,
    openBookingModal,
    setSelectedProjectId,
    createTask,
    updateTask,
  } = useWorkspace();

  const [projectStatusFilter, setProjectStatusFilter] = useState<string>("All");
  const [quickTitle, setQuickTitle] = useState("");
  const [quickProjectId, setQuickProjectId] = useState<string>(
    String(workspace.projects[0]?.id ?? "")
  );

  const { kpis, projects, tasks, team } = workspace;

  const filteredProjects =
    projectStatusFilter === "All"
      ? projects
      : projects.filter((p) => p.status === projectStatusFilter);

  const completionRate =
    kpis.totalTasksCount > 0
      ? Math.round((kpis.completedTasksCount / kpis.totalTasksCount) * 100)
      : 0;

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === "Done" && b.status !== "Done") return 1;
    if (a.status !== "Done" && b.status === "Done") return -1;
    return 0;
  });

  async function handleQuickCreateTask(e: React.FormEvent) {
    e.preventDefault();
    const targetPid = Number(quickProjectId) || projects[0]?.id;
    if (!quickTitle.trim() || !targetPid) return;
    const title = quickTitle.trim();
    setQuickTitle("");
    await createTask({
      title,
      description: "",
      projectId: targetPid,
      assigneeId: currentUser.id,
      status: "In Progress",
      priority: "Normal",
      estimateHours: 8,
      dueDate: "2026-06-15",
    });
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-[#71717A] dark:text-[#A1A1AA]">
              Studio Overview · Q2 2026
            </span>
            <button
              type="button"
              onClick={refreshWorkspace}
              disabled={refreshing}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-[#71717A] hover:bg-[#E4E4E7]/50 hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
              title="Sync latest PostgreSQL state"
            >
              <RefreshCw
                className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
              />
              Sync
            </button>
          </div>
          <h1 className="mt-1 text-[26px] font-semibold leading-[1.2] tracking-[-0.025em] text-[#111111] dark:text-[#F4F4F5] sm:text-[28px]">
            Welcome back, {currentUser.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
            Real-time production pulse across client engagements, sprint
            deliverables, and studio capacity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => openTaskModal(null)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3.5 py-2 text-[13px] font-semibold text-[#111111] transition hover:bg-[#F0EFEA] dark:border-[#27272F] dark:bg-[#19191E] dark:text-[#F4F4F5] dark:hover:bg-[#222229]"
          >
            <Plus className="h-4 w-4 text-[#52525B] dark:text-[#A1A1AA]" />
            New Deliverable
          </button>
          <button
            type="button"
            onClick={() => openProjectModal(null)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#27272A] dark:bg-[#F4F4F5] dark:text-[#111111] dark:hover:bg-[#E4E4E7]"
          >
            <Plus className="h-4 w-4" />
            New Engagement
          </button>
        </div>
      </div>

      {/* 4-Card KPI Summary Strip */}
      <section
        aria-label="Studio Key Metrics"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-5 dark:border-[#27272F] dark:bg-[#19191E]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
              Active Engagements
            </span>
            <span className="h-2 w-2 rounded-full bg-[#059669] dark:bg-[#34D399]" />
          </div>
          <div className="mt-2 font-mono text-[28px] font-semibold tracking-[-0.02em] text-[#111111] tabular-nums dark:text-[#F4F4F5]">
            {kpis.activeProjectsCount}
          </div>
          <div className="mt-1 text-[12px] text-[#71717A] tabular-nums dark:text-[#A1A1AA]">
            of {kpis.totalProjectsCount} total studio projects
          </div>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-5 dark:border-[#27272F] dark:bg-[#19191E]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
              Deliverables Shipped
            </span>
            <span className="rounded-md bg-[#ECFDF5] px-1.5 py-0.5 font-mono text-[11px] font-medium text-[#059669] tabular-nums dark:bg-[#059669]/15 dark:text-[#34D399]">
              {completionRate}%
            </span>
          </div>
          <div className="mt-2 font-mono text-[28px] font-semibold tracking-[-0.02em] text-[#111111] tabular-nums dark:text-[#F4F4F5]">
            {kpis.completedTasksCount}
            <span className="text-[18px] font-normal text-[#71717A] dark:text-[#A1A1AA]">
              /{kpis.totalTasksCount}
            </span>
          </div>
          <div className="mt-1 text-[12px] text-[#71717A] dark:text-[#A1A1AA]">
            Completed across active sprints
          </div>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-5 dark:border-[#27272F] dark:bg-[#19191E]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
              Studio Utilization
            </span>
            <span className="rounded-md bg-[#EEF2FF] px-1.5 py-0.5 font-mono text-[11px] font-medium text-[#4F46E5] tabular-nums dark:bg-[#4F46E5]/20 dark:text-[#A5B4FC]">
              Target 80%
            </span>
          </div>
          <div className="mt-2 font-mono text-[28px] font-semibold tracking-[-0.02em] text-[#111111] tabular-nums dark:text-[#F4F4F5]">
            {kpis.avgUtilizationPercent}%
          </div>
          <div className="mt-1 text-[12px] text-[#71717A] tabular-nums dark:text-[#A1A1AA]">
            Across {team.length} studio specialists
          </div>
        </div>

        <div className="rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-5 dark:border-[#27272F] dark:bg-[#19191E]">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-[#52525B] dark:text-[#A1A1AA]">
              Active Pipeline
            </span>
            <span className="font-mono text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
              Q2–Q3
            </span>
          </div>
          <div className="mt-2 font-mono text-[28px] font-semibold tracking-[-0.02em] text-[#111111] tabular-nums dark:text-[#F4F4F5]">
            {formatCurrency(kpis.pipelineBudgetCents)}
          </div>
          <div className="mt-1 text-[12px] text-[#71717A] tabular-nums dark:text-[#A1A1AA]">
            {formatCurrency(kpis.spentBudgetCents)} recognized to date
          </div>
        </div>
      </section>

      {/* Main Two-Column Bento Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 7 Cols: Client Engagements Table */}
        <section className="flex flex-col rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] dark:border-[#27272F] dark:bg-[#19191E] lg:col-span-7">
          <div className="flex flex-col gap-3 border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272F] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[16px] font-semibold tracking-[-0.015em] text-[#111111] dark:text-[#F4F4F5]">
                Client Engagements
              </h2>
              <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                Click any engagement to inspect deliverables and budget burn
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-lg bg-[#F0EFEA] p-0.5 text-[12px] dark:bg-[#141418]">
                {["All", "Active", "In Review", "Planning"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setProjectStatusFilter(st)}
                    className={`rounded-md px-2.5 py-1 font-medium transition ${
                      projectStatusFilter === st
                        ? "bg-[#FFFFFF] text-[#111111] shadow-2xs dark:bg-[#222229] dark:text-[#F4F4F5]"
                        : "text-[#52525B] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-[#4F46E5] hover:text-[#4338CA] dark:text-[#818CF8] dark:hover:text-[#A5B4FC]"
              >
                All
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
              <FolderKanban className="h-8 w-8 text-[#71717A] dark:text-[#A1A1AA]" />
              <p className="mt-2 text-[14px] font-medium text-[#111111] dark:text-[#F4F4F5]">
                No engagements match this filter
              </p>
              <p className="mt-1 text-[12px] text-[#71717A] dark:text-[#A1A1AA]">
                Create a new studio project or clear the status filter.
              </p>
              <button
                type="button"
                onClick={() => openProjectModal(null)}
                className="mt-4 rounded-lg bg-[#111111] px-3.5 py-1.5 text-[12px] font-semibold text-white dark:bg-[#F4F4F5] dark:text-[#111111]"
              >
                + New Engagement
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E4E4E7] bg-[#F7F7F5]/60 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#71717A] dark:border-[#27272F] dark:bg-[#141418] dark:text-[#A1A1AA]">
                    <th className="py-2.5 pr-3 pl-5">Engagement</th>
                    <th className="px-3 py-2.5">Progress</th>
                    <th className="px-3 py-2.5">Budget</th>
                    <th className="px-3 py-2.5">Due</th>
                    <th className="py-2.5 pr-5 pl-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7] text-[13px] dark:divide-[#27272F]">
                  {filteredProjects.slice(0, 6).map((project) => {
                    const pct =
                      project.taskCount > 0
                        ? Math.round(
                            (project.completedTaskCount / project.taskCount) *
                              100
                          )
                        : 0;
                    return (
                      <tr
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                        className="group cursor-pointer transition hover:bg-[#F7F7F5] dark:hover:bg-[#222229]/60"
                      >
                        <td className="py-3 pr-3 pl-5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                              {project.code}
                            </span>
                            <span className="font-semibold text-[#111111] group-hover:text-[#4F46E5] dark:text-[#F4F4F5] dark:group-hover:text-[#818CF8]">
                              {project.name}
                            </span>
                          </div>
                          <div className="mt-0.5 text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                            {project.clientName} · {project.category}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E4E4E7] dark:bg-[#27272F]">
                              <div
                                className="h-full rounded-full bg-[#4F46E5] transition-all dark:bg-[#6366F1]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] text-[#52525B] tabular-nums dark:text-[#A1A1AA]">
                              {project.completedTaskCount}/{project.taskCount}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-3 font-mono text-[12px] text-[#111111] tabular-nums dark:text-[#F4F4F5]">
                          {formatCurrency(project.budgetCents)}
                        </td>

                        <td className="px-3 py-3 font-mono text-[12px] text-[#52525B] tabular-nums dark:text-[#A1A1AA]">
                          {formatShortDate(project.dueDate)}
                        </td>

                        <td className="py-3 pr-5 pl-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <span
                              className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-medium ${getProjectStatusStyle(
                                project.status
                              )}`}
                            >
                              {project.status}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openProjectModal(project);
                              }}
                              className="rounded p-1 text-[#71717A] opacity-0 transition group-hover:opacity-100 hover:bg-[#E4E4E7] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#2E2E38] dark:hover:text-[#F4F4F5]"
                              aria-label={`Edit ${project.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Right 5 Cols: Priority Deliverables Queue */}
        <section className="flex flex-col rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] dark:border-[#27272F] dark:bg-[#19191E] lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#E4E4E7] px-5 py-4 dark:border-[#27272F]">
            <div>
              <h2 className="text-[16px] font-semibold tracking-[-0.015em] text-[#111111] dark:text-[#F4F4F5]">
                Deliverables Queue
              </h2>
              <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                Toggle completion or click any item to edit
              </p>
            </div>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-[#4F46E5] hover:text-[#4338CA] dark:text-[#818CF8] dark:hover:text-[#A5B4FC]"
            >
              Board
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Inline Quick Add Deliverable */}
          {projects.length > 0 && (
            <form
              onSubmit={handleQuickCreateTask}
              className="flex items-center gap-2 border-b border-[#E4E4E7] bg-[#F7F7F5]/60 px-4 py-2.5 dark:border-[#27272F] dark:bg-[#141418]"
            >
              <input
                type="text"
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Quick add deliverable..."
                className="min-w-0 flex-1 rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-1.5 text-[13px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#19191E] dark:text-[#F4F4F5]"
              />
              <select
                value={quickProjectId || String(projects[0].id)}
                onChange={(e) => setQuickProjectId(e.target.value)}
                aria-label="Select project for quick deliverable"
                className="max-w-[115px] truncate rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2 py-1.5 font-mono text-[11px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#19191E] dark:text-[#F4F4F5]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-[#111111] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#27272A] dark:bg-[#F4F4F5] dark:text-[#111111] dark:hover:bg-[#E4E4E7]"
              >
                Add
              </button>
            </form>
          )}

          <div className="divide-y divide-[#E4E4E7] dark:divide-[#27272F]">
            {sortedTasks.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-[#71717A] dark:text-[#A1A1AA]">
                All clear — no deliverables in queue.
              </div>
            ) : (
              sortedTasks.slice(0, 7).map((task) => {
                const isDone = task.status === "Done";
                return (
                  <div
                    key={task.id}
                    className="flex items-start justify-between gap-3 px-4 py-3 transition hover:bg-[#F7F7F5]/60 dark:hover:bg-[#222229]/60"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          updateTask(task.id, {
                            status: isDone ? "In Progress" : "Done",
                          })
                        }
                        className="mt-0.5 shrink-0 text-[#52525B] transition hover:text-[#059669] dark:text-[#A1A1AA] dark:hover:text-[#34D399]"
                        aria-label={`Toggle ${task.title}`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-[#059669] dark:text-[#34D399]" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => openTaskModal(task)}
                          className={`block w-full truncate text-left text-[13px] font-medium hover:text-[#4F46E5] dark:hover:text-[#818CF8] ${
                            isDone
                              ? "text-[#71717A] line-through dark:text-[#71717A]"
                              : "text-[#111111] dark:text-[#F4F4F5]"
                          }`}
                        >
                          {task.title}
                        </button>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-[#52525B] dark:text-[#A1A1AA]">
                          {task.project && (
                            <span className="font-mono text-[#71717A] dark:text-[#A1A1AA]">
                              {task.project.code}
                            </span>
                          )}
                          <span>·</span>
                          <span className="font-mono tabular-nums">
                            {formatShortDate(task.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${getPriorityStyle(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
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
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Bottom Section: Studio Resource Capacity Strip */}
      <section className="rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-5 dark:border-[#27272F] dark:bg-[#19191E]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[16px] font-semibold tracking-[-0.015em] text-[#111111] dark:text-[#F4F4F5]">
              Studio Capacity & Roster
            </h2>
            <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
              Current sprint allocation across design, motion, and production
            </p>
          </div>
          <Link
            href="/schedule"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#4F46E5] hover:text-[#4338CA] dark:text-[#818CF8] dark:hover:text-[#A5B4FC]"
          >
            Open Resource Timeline
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {team.map((member) => {
            const pct = Math.min(100, member.activeAllocationPercent);
            const isOverbooked = member.activeAllocationPercent > 95;
            return (
              <div
                key={member.id}
                className="flex flex-col justify-between rounded-xl border border-[#E4E4E7] bg-[#F7F7F5]/50 p-4 transition hover:bg-[#FFFFFF] dark:border-[#27272F] dark:bg-[#141418] dark:hover:bg-[#1E1E25]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {getInitials(member.name)}
                    </span>
                    <div>
                      <div className="text-[14px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                        {member.name}
                      </div>
                      <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                        {member.role}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${getMemberStatusStyle(
                      member.status
                    )}`}
                  >
                    {member.status}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#52525B] dark:text-[#A1A1AA]">
                      {member.activeProjectCount} active{" "}
                      {member.activeProjectCount === 1 ? "project" : "projects"}
                    </span>
                    <span
                      className={`font-mono font-semibold tabular-nums ${
                        isOverbooked
                          ? "text-[#D97706] dark:text-[#FBBF24]"
                          : "text-[#111111] dark:text-[#F4F4F5]"
                      }`}
                    >
                      {member.activeAllocationPercent}% booked
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E4E4E7] dark:bg-[#27272F]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverbooked
                          ? "bg-[#D97706] dark:bg-[#FBBF24]"
                          : "bg-[#059669] dark:bg-[#34D399]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#E4E4E7]/80 pt-2.5 text-[11px] text-[#71717A] dark:border-[#27272F] dark:text-[#A1A1AA]">
                  <span className="font-mono tabular-nums">
                    {member.weeklyCapacityHours}h/wk capacity
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      openBookingModal(null, { memberId: member.id })
                    }
                    className="inline-flex items-center gap-1 font-semibold text-[#4F46E5] hover:text-[#4338CA] dark:text-[#818CF8] dark:hover:text-[#A5B4FC]"
                  >
                    <CalendarPlus className="h-3 w-3" />
                    Allocate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
