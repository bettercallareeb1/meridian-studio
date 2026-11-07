import { asc, desc } from "drizzle-orm";
import { db, users, projects, tasks, bookings } from "@/db";
import { ensureSeeded } from "@/db/seed";
import { toSafeUser } from "@/lib/auth";
import type {
  HydratedBooking,
  HydratedProject,
  HydratedTask,
  HydratedTeamMember,
  StudioKPIs,
  StudioWorkspaceData,
} from "@/lib/studio-types";

export async function getStudioWorkspaceData(): Promise<StudioWorkspaceData> {
  await ensureSeeded();

  const [allUsers, allProjects, allTasks, allBookings] = await Promise.all([
    db.select().from(users).orderBy(asc(users.id)),
    db.select().from(projects).orderBy(desc(projects.id)),
    db.select().from(tasks).orderBy(asc(tasks.position), desc(tasks.id)),
    db.select().from(bookings).orderBy(asc(bookings.startDate), desc(bookings.id)),
  ]);

  const safeUsers = allUsers.map(toSafeUser);
  const userById = new Map(safeUsers.map((u) => [u.id, u]));
  const projectById = new Map(allProjects.map((p) => [p.id, p]));

  const hydratedProjects: HydratedProject[] = allProjects.map((project) => {
    const projectTasks = allTasks.filter((t) => t.projectId === project.id);
    const completedTasks = projectTasks.filter((t) => t.status === "Done");
    const projectBookings = allBookings.filter(
      (b) => b.projectId === project.id && b.status !== "Completed"
    );
    const totalAllocatedPercent = projectBookings.reduce(
      (sum, b) => sum + b.allocationPercent,
      0
    );

    return {
      ...project,
      lead: project.leadId ? (userById.get(project.leadId) ?? null) : null,
      taskCount: projectTasks.length,
      completedTaskCount: completedTasks.length,
      totalAllocatedPercent,
    };
  });

  const hydratedTasks: HydratedTask[] = allTasks.map((task) => {
    const proj = projectById.get(task.projectId);
    return {
      ...task,
      project: proj
        ? {
            id: proj.id,
            code: proj.code,
            name: proj.name,
            clientName: proj.clientName,
            category: proj.category,
          }
        : null,
      assignee: task.assigneeId
        ? (userById.get(task.assigneeId) ?? null)
        : null,
    };
  });

  const hydratedBookings: HydratedBooking[] = allBookings.map((booking) => {
    const proj = projectById.get(booking.projectId);
    return {
      ...booking,
      project: proj
        ? {
            id: proj.id,
            code: proj.code,
            name: proj.name,
            clientName: proj.clientName,
            status: proj.status,
          }
        : null,
      member: userById.get(booking.memberId) ?? null,
    };
  });

  const hydratedTeam: HydratedTeamMember[] = safeUsers.map((member) => {
    const memberBookings = allBookings.filter(
      (b) => b.memberId === member.id && b.status !== "Completed"
    );
    const activeAllocationPercent = memberBookings.reduce(
      (sum, b) => sum + b.allocationPercent,
      0
    );
    const memberTasks = allTasks.filter((t) => t.assigneeId === member.id);
    const completedMemberTasks = memberTasks.filter((t) => t.status === "Done");
    const distinctProjects = new Set(memberBookings.map((b) => b.projectId));

    return {
      ...member,
      activeAllocationPercent,
      assignedTaskCount: memberTasks.length,
      completedTaskCount: completedMemberTasks.length,
      activeProjectCount: distinctProjects.size,
    };
  });

  const activeProjects = hydratedProjects.filter(
    (p) => p.status === "Active" || p.status === "In Review"
  );
  const completedTasks = hydratedTasks.filter((t) => t.status === "Done");

  const avgUtilizationPercent =
    hydratedTeam.length > 0
      ? Math.round(
          hydratedTeam.reduce(
            (sum, m) => sum + Math.min(m.activeAllocationPercent, 120),
            0
          ) / hydratedTeam.length
        )
      : 0;

  const pipelineBudgetCents = hydratedProjects
    .filter((p) => p.status !== "Completed")
    .reduce((sum, p) => sum + p.budgetCents, 0);

  const spentBudgetCents = hydratedProjects
    .filter((p) => p.status !== "Completed")
    .reduce((sum, p) => sum + p.spentCents, 0);

  const kpis: StudioKPIs = {
    activeProjectsCount: activeProjects.length,
    totalProjectsCount: hydratedProjects.length,
    completedTasksCount: completedTasks.length,
    totalTasksCount: hydratedTasks.length,
    avgUtilizationPercent,
    pipelineBudgetCents,
    spentBudgetCents,
  };

  return {
    kpis,
    projects: hydratedProjects,
    tasks: hydratedTasks,
    bookings: hydratedBookings,
    team: hydratedTeam,
  };
}
