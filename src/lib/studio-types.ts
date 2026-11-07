import type {
  SafeUser,
  ProjectRecord,
  TaskRecord,
  BookingRecord,
} from "@/db/schema";

export type ProjectStatus = "Active" | "In Review" | "Planning" | "Completed";
export type ProjectCategory =
  | "Brand Identity"
  | "Digital Product"
  | "Spatial & Motion"
  | "Editorial";
export type PriorityLevel = "High" | "Medium" | "Low";

export type TaskStatus = "Backlog" | "In Progress" | "In Review" | "Done";
export type TaskPriority = "Urgent" | "High" | "Normal" | "Low";

export type BookingStatus = "Confirmed" | "Tentative" | "Completed";
export type MemberStatus =
  | "In Studio"
  | "Available"
  | "On Shoot"
  | "Out of Office";

export interface HydratedProject extends ProjectRecord {
  lead: SafeUser | null;
  taskCount: number;
  completedTaskCount: number;
  totalAllocatedPercent: number;
}

export interface HydratedTask extends TaskRecord {
  project: {
    id: number;
    code: string;
    name: string;
    clientName: string;
    category: string;
  } | null;
  assignee: SafeUser | null;
}

export interface HydratedBooking extends BookingRecord {
  project: {
    id: number;
    code: string;
    name: string;
    clientName: string;
    status: string;
  } | null;
  member: SafeUser | null;
}

export interface HydratedTeamMember extends SafeUser {
  activeAllocationPercent: number;
  assignedTaskCount: number;
  completedTaskCount: number;
  activeProjectCount: number;
}

export interface StudioKPIs {
  activeProjectsCount: number;
  totalProjectsCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
  avgUtilizationPercent: number;
  pipelineBudgetCents: number;
  spentBudgetCents: number;
}

export interface StudioWorkspaceData {
  kpis: StudioKPIs;
  projects: HydratedProject[];
  tasks: HydratedTask[];
  bookings: HydratedBooking[];
  team: HydratedTeamMember[];
}
