"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { SafeUser } from "@/db/schema";
import type {
  HydratedBooking,
  HydratedProject,
  HydratedTask,
  HydratedTeamMember,
  StudioKPIs,
  StudioWorkspaceData,
} from "@/lib/studio-types";
import { useToast } from "@/components/ToastProvider";

export interface ProjectInput {
  name: string;
  clientName: string;
  category: string;
  status: string;
  priority: string;
  budgetCents: number;
  spentCents: number;
  dueDate: string;
  leadId: number | null;
  summary: string;
}

export interface TaskInput {
  title: string;
  description: string;
  projectId: number;
  assigneeId: number | null;
  status: string;
  priority: string;
  estimateHours: number;
  dueDate: string;
}

export interface BookingInput {
  projectId: number;
  memberId: number;
  roleTitle: string;
  allocationPercent: number;
  startDate: string;
  endDate: string;
  status: string;
  notes: string;
}

export interface MemberInput {
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  weeklyCapacityHours: number;
  hourlyRateCents: number;
  avatarColor: string;
}

interface WorkspaceContextValue {
  currentUser: SafeUser;
  workspace: StudioWorkspaceData;
  refreshing: boolean;
  refreshWorkspace: () => Promise<void>;
  // Project CRUD
  createProject: (input: ProjectInput) => Promise<HydratedProject | null>;
  updateProject: (
    id: number,
    patch: Partial<ProjectInput>
  ) => Promise<HydratedProject | null>;
  deleteProject: (id: number) => Promise<boolean>;
  // Task CRUD
  createTask: (input: TaskInput) => Promise<HydratedTask | null>;
  updateTask: (
    id: number,
    patch: Partial<TaskInput>
  ) => Promise<HydratedTask | null>;
  deleteTask: (id: number) => Promise<boolean>;
  // Booking CRUD
  createBooking: (input: BookingInput) => Promise<HydratedBooking | null>;
  updateBooking: (
    id: number,
    patch: Partial<BookingInput>
  ) => Promise<HydratedBooking | null>;
  deleteBooking: (id: number) => Promise<boolean>;
  // Team CRUD
  createMember: (input: MemberInput) => Promise<HydratedTeamMember | null>;
  updateMember: (
    id: number,
    patch: Partial<MemberInput>
  ) => Promise<HydratedTeamMember | null>;
  deleteMember: (id: number) => Promise<boolean>;
  // Modals & Drawers
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number | null) => void;
  projectModal: { open: boolean; editing: HydratedProject | null };
  openProjectModal: (editing?: HydratedProject | null) => void;
  closeProjectModal: () => void;
  taskModal: {
    open: boolean;
    editing: HydratedTask | null;
    defaultProjectId?: number;
  };
  openTaskModal: (
    editing?: HydratedTask | null,
    defaultProjectId?: number
  ) => void;
  closeTaskModal: () => void;
  bookingModal: {
    open: boolean;
    editing: HydratedBooking | null;
    defaultProjectId?: number;
    defaultMemberId?: number;
  };
  openBookingModal: (
    editing?: HydratedBooking | null,
    defaults?: { projectId?: number; memberId?: number }
  ) => void;
  closeBookingModal: () => void;
  memberModal: { open: boolean; editing: HydratedTeamMember | null };
  openMemberModal: (editing?: HydratedTeamMember | null) => void;
  closeMemberModal: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return ctx;
}

function recomputeWorkspace(
  projects: HydratedProject[],
  tasks: HydratedTask[],
  bookings: HydratedBooking[],
  team: HydratedTeamMember[]
): StudioWorkspaceData {
  const nextProjects: HydratedProject[] = projects.map((p) => {
    const pTasks = tasks.filter((t) => t.projectId === p.id);
    const pDone = pTasks.filter((t) => t.status === "Done");
    const pBookings = bookings.filter(
      (b) => b.projectId === p.id && b.status !== "Completed"
    );
    return {
      ...p,
      taskCount: pTasks.length,
      completedTaskCount: pDone.length,
      totalAllocatedPercent: pBookings.reduce(
        (sum, b) => sum + b.allocationPercent,
        0
      ),
    };
  });

  const nextTeam: HydratedTeamMember[] = team.map((m) => {
    const mBookings = bookings.filter(
      (b) => b.memberId === m.id && b.status !== "Completed"
    );
    const mTasks = tasks.filter((t) => t.assigneeId === m.id);
    const mDone = mTasks.filter((t) => t.status === "Done");
    const distinctProjs = new Set(mBookings.map((b) => b.projectId));
    return {
      ...m,
      activeAllocationPercent: mBookings.reduce(
        (sum, b) => sum + b.allocationPercent,
        0
      ),
      assignedTaskCount: mTasks.length,
      completedTaskCount: mDone.length,
      activeProjectCount: distinctProjs.size,
    };
  });

  const activeProjects = nextProjects.filter(
    (p) => p.status === "Active" || p.status === "In Review"
  );
  const completedTasks = tasks.filter((t) => t.status === "Done");
  const avgUtilizationPercent =
    nextTeam.length > 0
      ? Math.round(
          nextTeam.reduce(
            (sum, m) => sum + Math.min(m.activeAllocationPercent, 120),
            0
          ) / nextTeam.length
        )
      : 0;
  const pipelineBudgetCents = nextProjects
    .filter((p) => p.status !== "Completed")
    .reduce((sum, p) => sum + p.budgetCents, 0);
  const spentBudgetCents = nextProjects
    .filter((p) => p.status !== "Completed")
    .reduce((sum, p) => sum + p.spentCents, 0);

  const kpis: StudioKPIs = {
    activeProjectsCount: activeProjects.length,
    totalProjectsCount: nextProjects.length,
    completedTasksCount: completedTasks.length,
    totalTasksCount: tasks.length,
    avgUtilizationPercent,
    pipelineBudgetCents,
    spentBudgetCents,
  };

  return {
    kpis,
    projects: nextProjects,
    tasks,
    bookings,
    team: nextTeam,
  };
}

export function WorkspaceProvider({
  initialUser,
  initialWorkspace,
  isDemoBootstrap = false,
  children,
}: {
  initialUser: SafeUser;
  initialWorkspace: StudioWorkspaceData;
  isDemoBootstrap?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState<SafeUser>(initialUser);
  const [workspace, setWorkspace] =
    useState<StudioWorkspaceData>(initialWorkspace);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [projectModal, setProjectModal] = useState<{
    open: boolean;
    editing: HydratedProject | null;
  }>({ open: false, editing: null });

  const [taskModal, setTaskModal] = useState<{
    open: boolean;
    editing: HydratedTask | null;
    defaultProjectId?: number;
  }>({ open: false, editing: null });

  const [bookingModal, setBookingModal] = useState<{
    open: boolean;
    editing: HydratedBooking | null;
    defaultProjectId?: number;
    defaultMemberId?: number;
  }>({ open: false, editing: null });

  const [memberModal, setMemberModal] = useState<{
    open: boolean;
    editing: HydratedTeamMember | null;
  }>({ open: false, editing: null });

  // Sync when server props change across route transitions
  useEffect(() => {
    setWorkspace(initialWorkspace);
  }, [initialWorkspace]);

  useEffect(() => {
    setCurrentUser(initialUser);
  }, [initialUser]);

  // Establish persistent session cookie on initial unauthenticated demo visit
  useEffect(() => {
    if (!isDemoBootstrap) return;
    let cancelled = false;
    fetch("/api/auth/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: initialUser.email }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isDemoBootstrap, initialUser.email]);

  const handleUnauthorized = useCallback(() => {
    showToast("Session expired — please sign in to continue", "error");
    router.push("/login");
  }, [router, showToast]);

  const refreshWorkspace = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/workspace", { cache: "no-store" });
      if (res.ok) {
        const data: StudioWorkspaceData = await res.json();
        setWorkspace(data);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  // --- PROJECT CRUD ---
  const createProject = useCallback(
    async (input: ProjectInput): Promise<HydratedProject | null> => {
      const snapshot = workspace;
      const lead =
        workspace.team.find((m) => m.id === input.leadId) ?? currentUser;
      const tempId = -Date.now();
      const optimisticProject: HydratedProject = {
        id: tempId,
        code: `MRD-${Math.floor(230 + Math.random() * 600)}`,
        name: input.name,
        clientName: input.clientName,
        category: input.category,
        status: input.status,
        priority: input.priority,
        budgetCents: input.budgetCents,
        spentCents: input.spentCents,
        dueDate: input.dueDate,
        leadId: input.leadId,
        summary: input.summary,
        createdAt: new Date(),
        updatedAt: new Date(),
        lead,
        taskCount: 0,
        completedTaskCount: 0,
        totalAllocatedPercent: 0,
      };

      setWorkspace((prev) =>
        recomputeWorkspace(
          [optimisticProject, ...prev.projects],
          prev.tasks,
          prev.bookings,
          prev.team
        )
      );

      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (res.status === 401) {
          setWorkspace(snapshot);
          handleUnauthorized();
          return null;
        }
        const data = await res.json();
        if (!res.ok) {
          setWorkspace(snapshot);
          showToast(data.error || "Could not create project", "error");
          return null;
        }
        const created: HydratedProject = data.project;
        setWorkspace((prev) =>
          recomputeWorkspace(
            prev.projects.map((p) => (p.id === tempId ? created : p)),
            prev.tasks,
            prev.bookings,
            prev.team
          )
        );
        showToast(`Created ${created.code} · ${created.name}`);
        return created;
      } catch {
        setWorkspace(snapshot);
        showToast("Network error while creating project", "error");
        return null;
      }
    },
    [workspace, currentUser, handleUnauthorized, showToast]
  );

  const updateProject = useCallback(
    async (
      id: number,
      patch: Partial<ProjectInput>
    ): Promise<HydratedProject | null> => {
      const snapshot = workspace;
      const newLead =
        patch.leadId !== undefined
          ? (workspace.team.find((m) => m.id === patch.leadId) ?? null)
          : undefined;

      setWorkspace((prev) =>
        recomputeWorkspace(
          prev.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...patch,
                  lead: newLead !== undefined ? newLead : p.lead,
                  updatedAt: new Date(),
                }
              : p
          ),
          prev.tasks,
          prev.bookings,
          prev.team
        )
      );

      try {
        const res = await fetch(`/api/projects/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (res.status === 401) {
          setWorkspace(snapshot);
          handleUnauthorized();
          return null;
        }
        const data = await res.json();
        if (!res.ok) {
          setWorkspace(snapshot);
          showToast(data.error || "Could not update project", "error");
          return null;
        }
        const updated: HydratedProject = data.project;
        setWorkspace((prev) =>
          recomputeWorkspace(
            prev.projects.map((p) => (p.id === id ? updated : p)),
            prev.tasks,
            prev.bookings,
            prev.team
          )
        );
        showToast(`Updated ${updated.name}`);
        return updated;
      } catch {
        setWorkspace(snapshot);
        showToast("Network error while updating project", "error");
        return null;
      }
    },
    [workspace, handleUnauthorized, showToast]
  );

  const deleteProject = useCallback(
    async (id: number): Promise<boolean> => {
      const snapshot = workspace;
      const target = workspace.projects.find((p) => p.id === id);

      setWorkspace((prev) =>
        recomputeWorkspace(
          prev.projects.filter((p) => p.id !== id),
          prev.tasks.filter((t) => t.projectId !== id),
          prev.bookings.filter((b) => b.projectId !== id),
          prev.team
        )
      );
      if (selectedProjectId === id) {
        setSelectedProjectId(null);
      }

      try {
        const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
        if (res.status === 401) {
          setWorkspace(snapshot);
          handleUnauthorized();
          return false;
        }
        if (!res.ok) {
          const data = await res.json();
          setWorkspace(snapshot);
          showToast(data.error || "Could not delete project", "error");
          return false;
        }
        showToast(`Removed ${target?.name ?? "project"}`);
        return true;
      } catch {
        setWorkspace(snapshot);
        showToast("Network error while deleting project", "error");
        return false;
      }
    },
    [workspace, selectedProjectId, handleUnauthorized, showToast]
  );

  // --- TASK CRUD ---
  const createTask = useCallback(
    async (input: TaskInput): Promise<HydratedTask | null> => {
      const snapshot = workspace;
      const proj = workspace.projects.find((p) => p.id === input.projectId);
      const assignee =
        workspace.team.find((m) => m.id === input.assigneeId) ?? null;
      const tempId = -Date.now();

      const optimisticTask: HydratedTask = {
        id: tempId,
        projectId: input.projectId,
        assigneeId: input.assigneeId,
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        estimateHours: input.estimateHours,
        dueDate: input.dueDate,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        project: proj
          ? {
              id: proj.id,
              code: proj.code,
              name: proj.name,
              clientName: proj.clientName,
              category: proj.category,
            }
          : null,
        assignee,
      };

      setWorkspace((prev) =>
        recomputeWorkspace(
          prev.projects,
          [optimisticTask, ...prev.tasks],
          prev.bookings,
          prev.team
        )
      );

      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (res.status === 401) {
          setWorkspace(snapshot);
          handleUnauthorized();
          return null;
        }
        const data = await res.json();
        if (!res.ok) {
          setWorkspace(snapshot);
          showToast(data.error || "Could not create deliverable", "error");
          return null;
        }
        const created: HydratedTask = data.task;
        setWorkspace((prev) =>
          recomputeWorkspace(
            prev.projects,
            prev.tasks.map((t) => (t.id === tempId ? created : t)),
            prev.bookings,
            prev.team
          )
        );
        showToast(`Added deliverable: ${created.title}`);
        return created;
      } catch {
        setWorkspace(snapshot);
        showToast("Network error while creating deliverable", "error");
        return null;
      }
    },
    [workspace, handleUnauthorized, showToast]
  );

  const updateTask = useCallback(
    async (
      id: number,
      patch: Partial<TaskInput>
    ): Promise<HydratedTask | null> => {
      const snapshot = workspace;
      const nextProj =
        patch.projectId !== undefined
          ? workspace.projects.find((p) => p.id === patch.projectId)
          : undefined;
      const nextAssignee =
        patch.assigneeId !== undefined
          ? (workspace.team.find((m) => m.id === patch.assigneeId) ?? null)
          : undefined;

      setWorkspace((prev) =>
        recomputeWorkspace(
          prev.projects,
          prev.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...patch,
                  project: nextProj
                    ? {
                        id: nextProj.id,
                        code: nextProj.code,
                        name: nextProj.name,
                        clientName: nextProj.clientName,
                        category: nextProj.category,
                      }
                    : t.project,
                  assignee:
                    nextAssignee !== undefined ? nextAssignee : t.assignee,
                  updatedAt: new Date(),
                }
              : t
          ),
          prev.bookings,
          prev.team
        )
      );

      try {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (res.status === 401) {
          setWorkspace(snapshot);
          handleUnauthorized();
          return null;
        }
        const data = await res.json();
        if (!res.ok) {
          setWorkspace(snapshot);
          showToast(data.error || "Could not update deliverable", "error");
          return null;
        }
        const updated: HydratedTask = data.task;
        setWorkspace((prev) =>
          recomputeWorkspace(
            prev.projects,
            prev.tasks.map((t) => (t.id === id ? updated : t)),
            prev.bookings,
            prev.team
          )
        );
        return updated;
      } catch {
        setWorkspace(snapshot);
        showToast("Network error while updating deliverable", "error");
        return null;
      }
    },
    [workspace, handleUnauthorized, showToast]
  );

  const deleteTask = useCallback(
    async (id: number): Promise<boolean> => {
      const snapshot = workspace;
      setWorkspace((prev) =>
        recomputeWorkspace(
          prev.projects,
          prev.tasks.filter((t) => t.id !== id),
          prev.bookings,
          prev.team
        )
      );

      try {
        const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
        if (res.status === 401) {
          setWorkspace(snapshot);
          handleUnauthorized();
          return false;
        }
        if (!res.ok) {
          const data = await res.json();
          setWorkspace(snapshot);
          showToast(data.error || "Could not delete deliverable", "error");
          return false;
        }
        showToast("Deliverable removed");
        return true;
      } catch {
        setWorkspace(snapshot);
        showToast("Network error while deleting deliverable", "error");
        return false;
      }
    },
    [workspace, handleUnauthorized, showToast]
  );

  // --- BOOKING CRUD ---
  const createBooking = useCallback(
    async (input: BookingInput): Promise<HydratedBooking | null> => {
      const snapshot = workspace;
      const proj = workspace.projects.find((p) => p.id === input.projectId);
      const member =
        workspace.team.find((m) => m.id === input.memberId) ?? null;
      const tempId = -Date.now();

      const optimisticBooking: HydratedBooking = {
        id: tempId,
        projectId: input.projectId,
        memberId: input.memberId,
        roleTitle: input.roleTitle,
        allocationPercent: input.allocationPercent,
        startDate: input.startDate,
        endDate: input.endDate,
        status: input.status,
        notes: input.notes,
        createdAt: new Date(),
        project: proj
          ? {
              id: proj.id,
              code: proj.code,
              name: proj.name,
              clientName: proj.clientName,
              status: proj.status,
            }
          : null,
        member,
      };

      setWorkspace((prev) =>
        recomputeWorkspace(
          prev.projects,
          prev.tasks,
          [optimisticBooking, ...prev.bookings],
          prev.team
        )
      );

      try {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (res.status === 401) {
          setWorkspace(snapshot);
          handleUnauthorized();
          return null;
        }
        const data = await res.json();
        if (!res.ok) {
          setWorkspace(snapshot);
          showToast(data.error || "Could not schedule booking", "error");
          return null;
        }
        const created: HydratedBooking = data.booking;
        setWorkspace((prev) =>
          recomputeWorkspace(
            prev.projects,
            prev.tasks,
            prev.bookings.map((b) => (b.id === tempId ? created : b)),
            prev.team
          )
        );
        showToast(
          `Scheduled ${member?.name ?? "member"} (${created.allocationPercent}%)`
        );
        return created;
      } catch {
        setWorkspace(snapshot);
        showToast("Network error while scheduling booking", "error");
        return null;
      }
    },
    [workspace, handleUnauthorized, showToast]
  );

  const updateBooking = useCallback(
    async (
      id: number,
      patch: Partial<BookingInput>
    ): Promise<HydratedBooking | null> => {
      const snapshot = workspace;
      const nextProj =
        patch.projectId !== undefined
          ? workspace.projects.find((p) => p.id === patch.projectId)
          : undefined;
      const nextMember =
        patch.memberId !== undefined
          ? (workspace.team.find((m) => m.id === patch.memberId) ?? null)
          : undefined;

      setWorkspace((prev) =>
        recomputeWorkspace(
          prev.projects,
          prev.tasks,
          prev.bookings.map((b) =>
            b.id === id
              ? {
                  ...b,
                  ...patch,
                  project: nextProj
                    ? {
                        id: nextProj.id,
                        code: nextProj.code,
                        name: nextProj.name,
                        clientName: nextProj.clientName,
                        status: nextProj.status,
                      }
                    : b.project,
                  member: nextMember !== undefined ? nextMember : b.member,
                }
              : b
          ),
          prev.team
        )
      );

      try {
        const res = await fetch(`/api/bookings/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (res.status === 401) {
          setWorkspace(snapshot);
          handleUnauthorized();
          return null;
        }
        const data = await res.json();
        if (!res.ok) {
          setWorkspace(snapshot);
          showToast(data.error || "Could not update booking", "error");
          return null;
        }
        const updated: HydratedBooking = data.booking;
        setWorkspace((prev) =>
          recomputeWorkspace(
            prev.projects,
            prev.tasks,
            prev.bookings.map((b) => (b.id === id ? updated : b)),
            prev.team
          )
        );
        showToast("Allocation updated");
        return updated;
      } catch {
        setWorkspace(snapshot);
        showToast("Network error while updating booking", "error");
        return null;
      }
    },
    [workspace, handleUnauthorized, showToast]
  );

  const deleteBooking = useCallback(
    async (id: number): Promise<boolean> => {
      const snapshot = workspace;
      setWorkspace((prev) =>
        recomputeWorkspace(
          prev.projects,
          prev.tasks,
          prev.bookings.filter((b) => b.id !== id),
          prev.team
        )
      );

      try {
        const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
        if (res.status === 401) {
          setWorkspace(snapshot);
          handleUnauthorized();
          return false;
        }
        if (!res.ok) {
          const data = await res.json();
          setWorkspace(snapshot);
          showToast(data.error || "Could not remove booking", "error");
          return false;
        }
        showToast("Resource booking removed");
        return true;
      } catch {
        setWorkspace(snapshot);
        showToast("Network error while removing booking", "error");
        return false;
      }
    },
    [workspace, handleUnauthorized, showToast]
  );

  // --- TEAM MEMBER CRUD ---
  const createMember = useCallback(
    async (input: MemberInput): Promise<HydratedTeamMember | null> => {
      const snapshot = workspace;
      const tempId = -Date.now();
      const optimisticMember: HydratedTeamMember = {
        id: tempId,
        name: input.name,
        email: input.email,
        role: input.role,
        department: input.department,
        weeklyCapacityHours: input.weeklyCapacityHours,
        hourlyRateCents: input.hourlyRateCents,
        avatarColor: input.avatarColor,
        status: input.status,
        isAdmin: false,
        createdAt: new Date(),
        activeAllocationPercent: 0,
        assignedTaskCount: 0,
        completedTaskCount: 0,
        activeProjectCount: 0,
      };

      setWorkspace((prev) =>
        recomputeWorkspace(prev.projects, prev.tasks, prev.bookings, [
          ...prev.team,
          optimisticMember,
        ])
      );

      try {
        const res = await fetch("/api/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (res.status === 401) {
          setWorkspace(snapshot);
          handleUnauthorized();
          return null;
        }
        const data = await res.json();
        if (!res.ok) {
          setWorkspace(snapshot);
          showToast(data.error || "Could not add team member", "error");
          return null;
        }
        const created: HydratedTeamMember = data.member;
        setWorkspace((prev) =>
          recomputeWorkspace(
            prev.projects,
            prev.tasks,
            prev.bookings,
            prev.team.map((m) => (m.id === tempId ? created : m))
          )
        );
        showToast(`Added ${created.name} to studio roster`);
        return created;
      } catch {
        setWorkspace(snapshot);
        showToast("Network error while adding team member", "error");
        return null;
      }
    },
    [workspace, handleUnauthorized, showToast]
  );

  const updateMember = useCallback(
    async (
      id: number,
      patch: Partial<MemberInput>
    ): Promise<HydratedTeamMember | null> => {
      const snapshot = workspace;
      setWorkspace((prev) =>
        recomputeWorkspace(
          prev.projects,
          prev.tasks,
          prev.bookings,
          prev.team.map((m) => (m.id === id ? { ...m, ...patch } : m))
        )
      );

      try {
        const res = await fetch(`/api/team/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        if (res.status === 401) {
          setWorkspace(snapshot);
          handleUnauthorized();
          return null;
        }
        const data = await res.json();
        if (!res.ok) {
          setWorkspace(snapshot);
          showToast(data.error || "Could not update member", "error");
          return null;
        }
        const updated: HydratedTeamMember = data.member;
        setWorkspace((prev) =>
          recomputeWorkspace(
            prev.projects,
            prev.tasks,
            prev.bookings,
            prev.team.map((m) => (m.id === id ? updated : m))
          )
        );
        if (currentUser.id === id) {
          setCurrentUser(updated);
        }
        showToast(`Updated ${updated.name}`);
        return updated;
      } catch {
        setWorkspace(snapshot);
        showToast("Network error while updating member", "error");
        return null;
      }
    },
    [workspace, currentUser.id, handleUnauthorized, showToast]
  );

  const deleteMember = useCallback(
    async (id: number): Promise<boolean> => {
      const snapshot = workspace;
      setWorkspace((prev) =>
        recomputeWorkspace(
          prev.projects,
          prev.tasks,
          prev.bookings.filter((b) => b.memberId !== id),
          prev.team.filter((m) => m.id !== id)
        )
      );

      try {
        const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
        if (res.status === 401) {
          setWorkspace(snapshot);
          handleUnauthorized();
          return false;
        }
        if (!res.ok) {
          const data = await res.json();
          setWorkspace(snapshot);
          showToast(data.error || "Could not remove team member", "error");
          return false;
        }
        showToast("Studio member removed");
        return true;
      } catch {
        setWorkspace(snapshot);
        showToast("Network error while removing team member", "error");
        return false;
      }
    },
    [workspace, handleUnauthorized, showToast]
  );

  const openProjectModal = useCallback(
    (editing: HydratedProject | null = null) => {
      setProjectModal({ open: true, editing });
    },
    []
  );
  const closeProjectModal = useCallback(() => {
    setProjectModal({ open: false, editing: null });
  }, []);

  const openTaskModal = useCallback(
    (editing: HydratedTask | null = null, defaultProjectId?: number) => {
      setTaskModal({ open: true, editing, defaultProjectId });
    },
    []
  );
  const closeTaskModal = useCallback(() => {
    setTaskModal({ open: false, editing: null });
  }, []);

  const openBookingModal = useCallback(
    (
      editing: HydratedBooking | null = null,
      defaults?: { projectId?: number; memberId?: number }
    ) => {
      setBookingModal({
        open: true,
        editing,
        defaultProjectId: defaults?.projectId,
        defaultMemberId: defaults?.memberId,
      });
    },
    []
  );
  const closeBookingModal = useCallback(() => {
    setBookingModal({ open: false, editing: null });
  }, []);

  const openMemberModal = useCallback(
    (editing: HydratedTeamMember | null = null) => {
      setMemberModal({ open: true, editing });
    },
    []
  );
  const closeMemberModal = useCallback(() => {
    setMemberModal({ open: false, editing: null });
  }, []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      currentUser,
      workspace,
      refreshing,
      refreshWorkspace,
      createProject,
      updateProject,
      deleteProject,
      createTask,
      updateTask,
      deleteTask,
      createBooking,
      updateBooking,
      deleteBooking,
      createMember,
      updateMember,
      deleteMember,
      selectedProjectId,
      setSelectedProjectId,
      projectModal,
      openProjectModal,
      closeProjectModal,
      taskModal,
      openTaskModal,
      closeTaskModal,
      bookingModal,
      openBookingModal,
      closeBookingModal,
      memberModal,
      openMemberModal,
      closeMemberModal,
    }),
    [
      currentUser,
      workspace,
      refreshing,
      refreshWorkspace,
      createProject,
      updateProject,
      deleteProject,
      createTask,
      updateTask,
      deleteTask,
      createBooking,
      updateBooking,
      deleteBooking,
      createMember,
      updateMember,
      deleteMember,
      selectedProjectId,
      projectModal,
      openProjectModal,
      closeProjectModal,
      taskModal,
      openTaskModal,
      closeTaskModal,
      bookingModal,
      openBookingModal,
      closeBookingModal,
      memberModal,
      openMemberModal,
      closeMemberModal,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
