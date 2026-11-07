"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Trash2,
  Check,
  Plus,
  Calendar,
  Pencil,
  Users,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useWorkspace } from "@/components/WorkspaceProvider";
import { ProjectFilesSection } from "@/components/ProjectFilesSection";
import type {
  HydratedBooking,
  HydratedProject,
  HydratedTask,
  HydratedTeamMember,
} from "@/lib/studio-types";
import {
  formatCurrency,
  formatFullDate,
  formatShortDate,
  getInitials,
  getPriorityStyle,
  getProjectStatusStyle,
  getTaskStatusStyle,
  getBookingStatusStyle,
} from "@/lib/format";

const AVATAR_SWATCHES = [
  "#4F46E5",
  "#059669",
  "#D97706",
  "#111111",
  "#E11D48",
  "#0284C7",
];

function ModalBackdrop({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/40 p-4 backdrop-blur-[2px] dark:bg-black/70"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================================
 * 1. PROJECT CREATE / EDIT MODAL
 * ========================================================================== */

export function ProjectFormModal() {
  const { projectModal, closeProjectModal } = useWorkspace();
  if (!projectModal.open) return null;

  return (
    <ProjectFormContent
      key={projectModal.editing ? `edit-proj-${projectModal.editing.id}` : "new-proj"}
      editing={projectModal.editing}
      onClose={closeProjectModal}
    />
  );
}

function ProjectFormContent({
  editing,
  onClose,
}: {
  editing: HydratedProject | null;
  onClose: () => void;
}) {
  const {
    workspace,
    currentUser,
    createProject,
    updateProject,
    deleteProject,
  } = useWorkspace();

  const [name, setName] = useState(editing?.name ?? "");
  const [clientName, setClientName] = useState(editing?.clientName ?? "");
  const [category, setCategory] = useState(
    editing?.category ?? "Brand Identity"
  );
  const [status, setStatus] = useState(editing?.status ?? "Active");
  const [priority, setPriority] = useState(editing?.priority ?? "High");
  const [budgetDollars, setBudgetDollars] = useState(
    editing ? String(Math.round(editing.budgetCents / 100)) : "85000"
  );
  const [spentDollars, setSpentDollars] = useState(
    editing ? String(Math.round(editing.spentCents / 100)) : "0"
  );
  const [dueDate, setDueDate] = useState(editing?.dueDate ?? "2026-07-20");
  const [leadId, setLeadId] = useState<string>(
    editing?.leadId ? String(editing.leadId) : String(currentUser.id)
  );
  const [summary, setSummary] = useState(editing?.summary ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !clientName.trim()) return;

    const payload = {
      name: name.trim(),
      clientName: clientName.trim(),
      category,
      status,
      priority,
      budgetCents: Math.max(0, Math.round(Number(budgetDollars) || 0)) * 100,
      spentCents: Math.max(0, Math.round(Number(spentDollars) || 0)) * 100,
      dueDate: dueDate || "2026-07-20",
      leadId: leadId ? Number(leadId) : null,
      summary: summary.trim(),
    };

    onClose();
    if (editing) {
      await updateProject(editing.id, payload);
    } else {
      await createProject(payload);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    onClose();
    await deleteProject(editing.id);
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-6 shadow-xl dark:border-[#27272F] dark:bg-[#19191E]">
        <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4 dark:border-[#27272F]">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#71717A] dark:text-[#A1A1AA]">
              {editing ? editing.code : "New Engagement"}
            </span>
            <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-[#F4F4F5]">
              {editing ? "Edit Client Project" : "Create Studio Project"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dieter Rams Digital Archive"
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Client Partner *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Vitsoe & Braun Foundation"
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Discipline
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              >
                <option value="Brand Identity">Brand Identity</option>
                <option value="Digital Product">Digital Product</option>
                <option value="Spatial & Motion">Spatial & Motion</option>
                <option value="Editorial">Editorial</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              >
                <option value="Active">Active</option>
                <option value="In Review">In Review</option>
                <option value="Planning">Planning</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Budget (USD)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={budgetDollars}
                onChange={(e) => setBudgetDollars(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 font-mono text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Spent (USD)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={spentDollars}
                onChange={(e) => setSpentDollars(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 font-mono text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Target Delivery
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 font-mono text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
              Creative Lead
            </label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
            >
              {workspace.team.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} — {member.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
              Scope & Creative Brief
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Outline key milestones, visual direction, and deliverables..."
              className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
            />
          </div>

          <div className="flex items-center justify-between border-t border-[#E4E4E7] pt-4 dark:border-[#27272F]">
            {editing ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-lg bg-[#E11D48] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#BE123C]"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-[12px] text-[#52525B] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#E11D48] hover:bg-[#FFF1F2] dark:text-[#FB7185] dark:hover:bg-[#E11D48]/15"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Project
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3.5 py-2 text-[13px] font-medium text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#111111] dark:border-[#27272F] dark:bg-[#141418] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#27272A] dark:bg-[#F4F4F5] dark:text-[#111111] dark:hover:bg-[#E4E4E7]"
              >
                {editing ? "Save Changes" : "Create Project"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

/* ============================================================================
 * 2. DELIVERABLE / TASK CREATE / EDIT MODAL
 * ========================================================================== */

export function TaskFormModal() {
  const { taskModal, closeTaskModal } = useWorkspace();
  if (!taskModal.open) return null;

  return (
    <TaskFormContent
      key={
        taskModal.editing
          ? `edit-task-${taskModal.editing.id}`
          : `new-task-${taskModal.defaultProjectId ?? "default"}`
      }
      editing={taskModal.editing}
      defaultProjectId={taskModal.defaultProjectId}
      onClose={closeTaskModal}
    />
  );
}

function TaskFormContent({
  editing,
  defaultProjectId,
  onClose,
}: {
  editing: HydratedTask | null;
  defaultProjectId?: number;
  onClose: () => void;
}) {
  const { workspace, currentUser, createTask, updateTask, deleteTask } =
    useWorkspace();

  const initialProj =
    editing?.projectId ?? defaultProjectId ?? workspace.projects[0]?.id ?? "";

  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [projectId, setProjectId] = useState<string>(String(initialProj));
  const [assigneeId, setAssigneeId] = useState<string>(
    editing
      ? editing.assigneeId
        ? String(editing.assigneeId)
        : ""
      : String(currentUser.id)
  );
  const [status, setStatus] = useState(editing?.status ?? "In Progress");
  const [priority, setPriority] = useState(editing?.priority ?? "Normal");
  const [estimateHours, setEstimateHours] = useState(
    editing ? String(editing.estimateHours) : "10"
  );
  const [dueDate, setDueDate] = useState(editing?.dueDate ?? "2026-06-15");
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      projectId: Number(projectId),
      assigneeId: assigneeId ? Number(assigneeId) : null,
      status,
      priority,
      estimateHours: Math.max(1, Math.round(Number(estimateHours) || 8)),
      dueDate: dueDate || "2026-06-15",
    };

    onClose();
    if (editing) {
      await updateTask(editing.id, payload);
    } else {
      await createTask(payload);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    onClose();
    await deleteTask(editing.id);
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-6 shadow-xl dark:border-[#27272F] dark:bg-[#19191E]">
        <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4 dark:border-[#27272F]">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#71717A] dark:text-[#A1A1AA]">
              Studio Deliverable
            </span>
            <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-[#F4F4F5]">
              {editing ? "Edit Deliverable" : "New Studio Deliverable"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
              Deliverable Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Typography specimen & variable weight audit"
              className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Project *
              </label>
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              >
                {workspace.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} · {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              >
                <option value="">Unassigned</option>
                {workspace.team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Stage
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              >
                <option value="Backlog">Backlog</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Est. Hours
              </label>
              <input
                type="number"
                min={1}
                max={200}
                value={estimateHours}
                onChange={(e) => setEstimateHours(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-2 font-mono text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2 py-2 font-mono text-[12px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
              Production Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specifications, print tolerances, or review criteria..."
              className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
            />
          </div>

          <div className="flex items-center justify-between border-t border-[#E4E4E7] pt-4 dark:border-[#27272F]">
            {editing ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-lg bg-[#E11D48] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#BE123C]"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-[12px] text-[#52525B] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#E11D48] hover:bg-[#FFF1F2] dark:text-[#FB7185] dark:hover:bg-[#E11D48]/15"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3.5 py-2 text-[13px] font-medium text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#111111] dark:border-[#27272F] dark:bg-[#141418] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#27272A] dark:bg-[#F4F4F5] dark:text-[#111111] dark:hover:bg-[#E4E4E7]"
              >
                {editing ? "Save Deliverable" : "Add Deliverable"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

/* ============================================================================
 * 3. RESOURCE BOOKING CREATE / EDIT MODAL
 * ========================================================================== */

export function BookingFormModal() {
  const { bookingModal, closeBookingModal } = useWorkspace();
  if (!bookingModal.open) return null;

  return (
    <BookingFormContent
      key={
        bookingModal.editing
          ? `edit-booking-${bookingModal.editing.id}`
          : `new-booking-${bookingModal.defaultProjectId ?? "p"}-${bookingModal.defaultMemberId ?? "m"}`
      }
      editing={bookingModal.editing}
      defaultProjectId={bookingModal.defaultProjectId}
      defaultMemberId={bookingModal.defaultMemberId}
      onClose={closeBookingModal}
    />
  );
}

function BookingFormContent({
  editing,
  defaultProjectId,
  defaultMemberId,
  onClose,
}: {
  editing: HydratedBooking | null;
  defaultProjectId?: number;
  defaultMemberId?: number;
  onClose: () => void;
}) {
  const { workspace, createBooking, updateBooking, deleteBooking } =
    useWorkspace();

  const initialProj =
    editing?.projectId ?? defaultProjectId ?? workspace.projects[0]?.id ?? "";
  const initialMember =
    editing?.memberId ?? defaultMemberId ?? workspace.team[0]?.id ?? "";
  const matchedMember = workspace.team.find(
    (m) => m.id === Number(initialMember)
  );

  const [projectId, setProjectId] = useState<string>(String(initialProj));
  const [memberId, setMemberId] = useState<string>(String(initialMember));
  const [roleTitle, setRoleTitle] = useState(
    editing?.roleTitle ?? matchedMember?.role ?? "Senior Designer"
  );
  const [allocationPercent, setAllocationPercent] = useState(
    editing ? String(editing.allocationPercent) : "50"
  );
  const [startDate, setStartDate] = useState(
    editing?.startDate ?? "2026-05-18"
  );
  const [endDate, setEndDate] = useState(editing?.endDate ?? "2026-06-26");
  const [status, setStatus] = useState(editing?.status ?? "Confirmed");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !memberId) return;

    const payload = {
      projectId: Number(projectId),
      memberId: Number(memberId),
      roleTitle: roleTitle.trim() || "Senior Designer",
      allocationPercent: Math.min(
        100,
        Math.max(5, Math.round(Number(allocationPercent) || 50))
      ),
      startDate: startDate || "2026-05-18",
      endDate: endDate || "2026-06-26",
      status,
      notes: notes.trim(),
    };

    onClose();
    if (editing) {
      await updateBooking(editing.id, payload);
    } else {
      await createBooking(payload);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    onClose();
    await deleteBooking(editing.id);
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-6 shadow-xl dark:border-[#27272F] dark:bg-[#19191E]">
        <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4 dark:border-[#27272F]">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#71717A] dark:text-[#A1A1AA]">
              Capacity Allocation
            </span>
            <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-[#F4F4F5]">
              {editing ? "Edit Resource Booking" : "Schedule Studio Resource"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Team Member *
              </label>
              <select
                required
                value={memberId}
                onChange={(e) => {
                  setMemberId(e.target.value);
                  const m = workspace.team.find(
                    (u) => u.id === Number(e.target.value)
                  );
                  if (m && !editing) setRoleTitle(m.role);
                }}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              >
                {workspace.team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.activeAllocationPercent}% booked)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Project *
              </label>
              <select
                required
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              >
                {workspace.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} · {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Allocation (%)
              </label>
              <input
                type="number"
                min={5}
                max={100}
                step={5}
                value={allocationPercent}
                onChange={(e) => setAllocationPercent(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 font-mono text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-2 font-mono text-[12px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-2 font-mono text-[12px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Engagement Role
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Lead Brand Designer"
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Booking Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Tentative">Tentative</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
              Sprint Focus Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Design system handoff & motion prototypes"
              className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
            />
          </div>

          <div className="flex items-center justify-between border-t border-[#E4E4E7] pt-4 dark:border-[#27272F]">
            {editing ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-lg bg-[#E11D48] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#BE123C]"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-[12px] text-[#52525B] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#E11D48] hover:bg-[#FFF1F2] dark:text-[#FB7185] dark:hover:bg-[#E11D48]/15"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove Booking
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3.5 py-2 text-[13px] font-medium text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#111111] dark:border-[#27272F] dark:bg-[#141418] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#27272A] dark:bg-[#F4F4F5] dark:text-[#111111] dark:hover:bg-[#E4E4E7]"
              >
                {editing ? "Save Booking" : "Confirm Allocation"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

/* ============================================================================
 * 4. TEAM MEMBER CREATE / EDIT MODAL
 * ========================================================================== */

export function MemberFormModal() {
  const { memberModal, closeMemberModal } = useWorkspace();
  if (!memberModal.open) return null;

  return (
    <MemberFormContent
      key={
        memberModal.editing
          ? `edit-member-${memberModal.editing.id}`
          : "new-member"
      }
      editing={memberModal.editing}
      onClose={closeMemberModal}
    />
  );
}

function MemberFormContent({
  editing,
  onClose,
}: {
  editing: HydratedTeamMember | null;
  onClose: () => void;
}) {
  const { currentUser, createMember, updateMember, deleteMember } =
    useWorkspace();

  const [name, setName] = useState(editing?.name ?? "");
  const [email, setEmail] = useState(editing?.email ?? "");
  const [role, setRole] = useState(editing?.role ?? "Senior Brand Designer");
  const [department, setDepartment] = useState(
    editing?.department ?? "Brand Design"
  );
  const [status, setStatus] = useState(editing?.status ?? "In Studio");
  const [weeklyCapacityHours, setWeeklyCapacityHours] = useState(
    editing ? String(editing.weeklyCapacityHours) : "40"
  );
  const [hourlyRateDollars, setHourlyRateDollars] = useState(
    editing ? String(Math.round(editing.hourlyRateCents / 100)) : "190"
  );
  const [avatarColor, setAvatarColor] = useState(
    editing?.avatarColor ?? "#4F46E5"
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || (!editing && !email.trim())) return;

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role.trim() || "Senior Designer",
      department,
      status,
      weeklyCapacityHours: Math.min(
        60,
        Math.max(10, Math.round(Number(weeklyCapacityHours) || 40))
      ),
      hourlyRateCents:
        Math.max(50, Math.round(Number(hourlyRateDollars) || 185)) * 100,
      avatarColor,
    };

    onClose();
    if (editing) {
      await updateMember(editing.id, payload);
    } else {
      await createMember(payload);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    onClose();
    await deleteMember(editing.id);
  }

  return (
    <ModalBackdrop onClose={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-6 shadow-xl dark:border-[#27272F] dark:bg-[#19191E]">
        <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-4 dark:border-[#27272F]">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#71717A] dark:text-[#A1A1AA]">
              Studio Roster
            </span>
            <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-[#F4F4F5]">
              {editing ? "Edit Studio Member" : "Add Team Member"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lukas Meyer"
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Studio Email *
              </label>
              <input
                type="email"
                required
                disabled={Boolean(editing)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lukas@meridian.studio"
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#111111] disabled:bg-[#F7F7F5] disabled:text-[#71717A] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5] dark:disabled:bg-[#0E0E11]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Title / Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Discipline
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              >
                <option value="Brand Design">Brand Design</option>
                <option value="Digital Product">Digital Product</option>
                <option value="Motion & 3D">Motion & 3D</option>
                <option value="Production">Production</option>
                <option value="Direction">Direction</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Presence
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-2 text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              >
                <option value="In Studio">In Studio</option>
                <option value="Available">Available</option>
                <option value="On Shoot">On Shoot</option>
                <option value="Out of Office">Out of Office</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Weekly Hrs
              </label>
              <input
                type="number"
                min={10}
                max={60}
                value={weeklyCapacityHours}
                onChange={(e) => setWeeklyCapacityHours(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 font-mono text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                Rate ($/hr)
              </label>
              <input
                type="number"
                min={50}
                step={5}
                value={hourlyRateDollars}
                onChange={(e) => setHourlyRateDollars(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 font-mono text-[13px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
              Studio Badge Color
            </label>
            <div className="mt-2 flex items-center gap-2.5">
              {AVATAR_SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setAvatarColor(hex)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                    avatarColor === hex
                      ? "ring-2 ring-[#111111] ring-offset-2 dark:ring-[#F4F4F5] dark:ring-offset-[#19191E]"
                      : "opacity-80 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: hex }}
                  aria-label={`Select color ${hex}`}
                >
                  {avatarColor === hex && (
                    <Check className="h-3.5 w-3.5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#E4E4E7] pt-4 dark:border-[#27272F]">
            {editing && editing.id !== currentUser.id ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-lg bg-[#E11D48] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#BE123C]"
                  >
                    Confirm Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-[12px] text-[#52525B] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#E11D48] hover:bg-[#FFF1F2] dark:text-[#FB7185] dark:hover:bg-[#E11D48]/15"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3.5 py-2 text-[13px] font-medium text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#111111] dark:border-[#27272F] dark:bg-[#141418] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#27272A] dark:bg-[#F4F4F5] dark:text-[#111111] dark:hover:bg-[#E4E4E7]"
              >
                {editing ? "Save Profile" : "Add to Roster"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </ModalBackdrop>
  );
}

/* ============================================================================
 * 5. PROJECT DETAIL SLIDE-OVER DRAWER
 * ========================================================================== */

export function ProjectDetailDrawer() {
  const {
    selectedProjectId,
    setSelectedProjectId,
    workspace,
    currentUser,
    openProjectModal,
    openTaskModal,
    openBookingModal,
    createTask,
    updateTask,
  } = useWorkspace();

  const [quickTaskTitle, setQuickTaskTitle] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && selectedProjectId !== null) {
        setSelectedProjectId(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedProjectId, setSelectedProjectId]);

  if (selectedProjectId === null) return null;

  const project = workspace.projects.find((p) => p.id === selectedProjectId);
  if (!project) return null;

  const projectTasks = workspace.tasks.filter(
    (t) => t.projectId === project.id
  );
  const projectBookings = workspace.bookings.filter(
    (b) => b.projectId === project.id
  );

  const budgetPercent =
    project.budgetCents > 0
      ? Math.min(
          100,
          Math.round((project.spentCents / project.budgetCents) * 100)
        )
      : 0;

  async function handleQuickAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!quickTaskTitle.trim() || !project) return;
    const title = quickTaskTitle.trim();
    setQuickTaskTitle("");
    await createTask({
      title,
      description: "",
      projectId: project.id,
      assigneeId: project.leadId ?? currentUser.id,
      status: "In Progress",
      priority: "Normal",
      estimateHours: 8,
      dueDate: project.dueDate,
    });
  }

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-[#111111]/35 backdrop-blur-[1px] dark:bg-black/65"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setSelectedProjectId(null);
      }}
    >
      <aside className="flex h-full w-full max-w-2xl flex-col border-l border-[#E4E4E7] bg-[#FFFFFF] shadow-2xl dark:border-[#27272F] dark:bg-[#19191E]">
        {/* Drawer Header */}
        <div className="flex items-start justify-between border-b border-[#E4E4E7] px-6 py-5 dark:border-[#27272F]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[12px] font-medium text-[#71717A] dark:text-[#A1A1AA]">
                {project.code}
              </span>
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${getProjectStatusStyle(
                  project.status
                )}`}
              >
                {project.status}
              </span>
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${getPriorityStyle(
                  project.priority
                )}`}
              >
                {project.priority} Priority
              </span>
            </div>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-[#F4F4F5]">
              {project.name}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
              {project.clientName} · {project.category}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openProjectModal(project)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-1.5 text-[12px] font-semibold text-[#111111] transition hover:bg-[#F7F7F5] dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5] dark:hover:bg-[#222229]"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setSelectedProjectId(null)}
              className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
              aria-label="Close project drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#E4E4E7] bg-[#F7F7F5] p-4 dark:border-[#27272F] dark:bg-[#141418] sm:grid-cols-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#71717A] dark:text-[#A1A1AA]">
                Creative Lead
              </span>
              <div className="mt-1.5 flex items-center gap-2">
                {project.lead ? (
                  <>
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                      style={{ backgroundColor: project.lead.avatarColor }}
                    >
                      {getInitials(project.lead.name)}
                    </span>
                    <span className="text-[13px] font-medium text-[#111111] dark:text-[#F4F4F5]">
                      {project.lead.name}
                    </span>
                  </>
                ) : (
                  <span className="text-[13px] text-[#71717A]">Unassigned</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#71717A] dark:text-[#A1A1AA]">
                Target Delivery
              </span>
              <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[13px] font-medium text-[#111111] tabular-nums dark:text-[#F4F4F5]">
                <Calendar className="h-3.5 w-3.5 text-[#71717A]" />
                {formatFullDate(project.dueDate)}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#71717A] dark:text-[#A1A1AA]">
                Budget Utilization
              </span>
              <div className="mt-1 flex items-baseline justify-between font-mono text-[13px] font-medium text-[#111111] tabular-nums dark:text-[#F4F4F5]">
                <span>{formatCurrency(project.spentCents)}</span>
                <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                  / {formatCurrency(project.budgetCents)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E4E4E7] dark:bg-[#27272F]">
                <div
                  className="h-full rounded-full bg-[#4F46E5] transition-all dark:bg-[#6366F1]"
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
            </div>
          </div>

          {project.summary && (
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#71717A] dark:text-[#A1A1AA]">
                Creative Brief
              </h4>
              <p className="mt-1.5 text-[14px] leading-[1.6] text-[#111111] dark:text-[#F4F4F5]">
                {project.summary}
              </p>
            </div>
          )}

          {/* Deliverables Section */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#71717A] dark:text-[#A1A1AA]">
                Deliverables ({project.completedTaskCount}/{project.taskCount})
              </h4>
              <button
                type="button"
                onClick={() => openTaskModal(null, project.id)}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#4F46E5] hover:text-[#4338CA] dark:text-[#818CF8] dark:hover:text-[#A5B4FC]"
              >
                <Plus className="h-3.5 w-3.5" />
                Full Deliverable
              </button>
            </div>

            <form
              onSubmit={handleQuickAddTask}
              className="mt-2.5 flex items-center gap-2"
            >
              <input
                type="text"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                placeholder="Quick-add deliverable title and press Enter..."
                className="flex-1 rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-1.5 text-[13px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#111111] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#27272A] dark:bg-[#F4F4F5] dark:text-[#111111] dark:hover:bg-[#E4E4E7]"
              >
                Add
              </button>
            </form>

            <div className="mt-3 divide-y divide-[#E4E4E7] rounded-xl border border-[#E4E4E7] dark:divide-[#27272F] dark:border-[#27272F]">
              {projectTasks.length === 0 ? (
                <div className="p-6 text-center text-[13px] text-[#71717A] dark:text-[#A1A1AA]">
                  No deliverables logged yet for this engagement.
                </div>
              ) : (
                projectTasks.map((task) => {
                  const isDone = task.status === "Done";
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 hover:bg-[#F7F7F5]/60 dark:hover:bg-[#222229]/60"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateTask(task.id, {
                              status: isDone ? "In Progress" : "Done",
                            })
                          }
                          className="shrink-0 text-[#52525B] hover:text-[#059669] dark:text-[#A1A1AA] dark:hover:text-[#34D399]"
                          aria-label={`Mark ${task.title} as ${
                            isDone ? "in progress" : "done"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-[#059669] dark:text-[#34D399]" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openTaskModal(task)}
                          className={`truncate text-left text-[13px] font-medium hover:underline ${
                            isDone
                              ? "text-[#71717A] line-through"
                              : "text-[#111111] dark:text-[#F4F4F5]"
                          }`}
                        >
                          {task.title}
                        </button>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${getTaskStatusStyle(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                        <span className="font-mono text-[11px] text-[#71717A] tabular-nums dark:text-[#A1A1AA]">
                          {formatShortDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <ProjectFilesSection projectId={project.id} />

          {/* Resource Bookings Section */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#71717A] dark:text-[#A1A1AA]">
                <Users className="h-3.5 w-3.5" />
                Allocated Studio Team ({projectBookings.length})
              </h4>
              <button
                type="button"
                onClick={() =>
                  openBookingModal(null, { projectId: project.id })
                }
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#4F46E5] hover:text-[#4338CA] dark:text-[#818CF8] dark:hover:text-[#A5B4FC]"
              >
                <Plus className="h-3.5 w-3.5" />
                Allocate Resource
              </button>
            </div>

            <div className="mt-2.5 divide-y divide-[#E4E4E7] rounded-xl border border-[#E4E4E7] dark:divide-[#27272F] dark:border-[#27272F]">
              {projectBookings.length === 0 ? (
                <div className="p-6 text-center text-[13px] text-[#71717A] dark:text-[#A1A1AA]">
                  No team members scheduled on this project yet.
                </div>
              ) : (
                projectBookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => openBookingModal(b)}
                    className="flex cursor-pointer items-center justify-between px-3.5 py-2.5 hover:bg-[#F7F7F5]/60 dark:hover:bg-[#222229]/60"
                  >
                    <div className="flex items-center gap-2.5">
                      {b.member && (
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                          style={{ backgroundColor: b.member.avatarColor }}
                        >
                          {getInitials(b.member.name)}
                        </span>
                      )}
                      <div>
                        <div className="text-[13px] font-medium text-[#111111] dark:text-[#F4F4F5]">
                          {b.member?.name ?? "Team Member"}
                        </div>
                        <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                          {b.roleTitle} ·{" "}
                          <span className="font-mono text-[11px] tabular-nums">
                            {formatShortDate(b.startDate)} –{" "}
                            {formatShortDate(b.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${getBookingStatusStyle(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                      <span className="rounded-md bg-[#F0EFEA] px-2 py-0.5 font-mono text-[12px] font-semibold text-[#111111] tabular-nums dark:bg-[#222229] dark:text-[#F4F4F5]">
                        {b.allocationPercent}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
