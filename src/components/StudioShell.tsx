"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  FolderKanban,
  CheckSquare,
  CalendarRange,
  Users,
  Plus,
  LogOut,
  ArrowLeftRight,
  Menu,
  X,
  ChevronUp,
} from "lucide-react";
import { MeridianLogo } from "@/components/MeridianLogo";
import { useWorkspace } from "@/components/WorkspaceProvider";
import {
  ThemeToggleButton,
  ThemeTogglePill,
} from "@/components/ThemeProvider";
import {
  BookingFormModal,
  MemberFormModal,
  ProjectDetailDrawer,
  ProjectFormModal,
  TaskFormModal,
} from "@/components/CrudModals";
import { getInitials } from "@/lib/format";

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    workspace,
    openProjectModal,
    setSelectedProjectId,
  } = useWorkspace();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const openTasksCount = workspace.tasks.filter(
    (t) => t.status !== "Done"
  ).length;
  const activeProjects = workspace.projects.filter(
    (p) => p.status === "Active" || p.status === "In Review"
  );

  const navItems = [
    {
      label: "Overview",
      href: "/",
      icon: LayoutGrid,
      badge: null,
    },
    {
      label: "Projects",
      href: "/projects",
      icon: FolderKanban,
      badge: workspace.projects.length,
    },
    {
      label: "Deliverables",
      href: "/tasks",
      icon: CheckSquare,
      badge: openTasksCount,
    },
    {
      label: "Resource Schedule",
      href: "/schedule",
      icon: CalendarRange,
      badge: workspace.bookings.length,
    },
    {
      label: "Studio Team",
      href: "/team",
      icon: Users,
      badge: workspace.team.length,
    },
  ];

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-[#F0EFEA] px-3.5 py-4 text-[#111111] dark:bg-[#141418] dark:text-[#F4F4F5]">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-1">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <MeridianLogo />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-[#52525B] hover:bg-[#E4E4E7]/60 dark:text-[#A1A1AA] dark:hover:bg-[#222229] lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Create Action */}
        <div className="mt-4 px-1">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              openProjectModal(null);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#111111] px-3 py-2 text-[13px] font-semibold text-white shadow-2xs transition hover:bg-[#27272A] dark:bg-[#F4F4F5] dark:text-[#111111] dark:hover:bg-[#E4E4E7]"
          >
            <Plus className="h-4 w-4" />
            New Engagement
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="mt-5 space-y-1" aria-label="Workspace navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium transition ${
                  isActive
                    ? "bg-[#FFFFFF] font-semibold text-[#111111] shadow-[0_1px_2px_rgba(17,17,17,0.06)] dark:bg-[#1E1E25] dark:text-[#F4F4F5] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                    : "text-[#52525B] hover:bg-[#E4E4E7]/50 hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#1E1E25]/60 dark:hover:text-[#F4F4F5]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive
                        ? "text-[#4F46E5] dark:text-[#818CF8]"
                        : "text-[#71717A] dark:text-[#71717A]"
                    }`}
                  />
                  {item.label}
                </span>
                {item.badge !== null && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] tabular-nums ${
                      isActive
                        ? "bg-[#F0EFEA] text-[#111111] dark:bg-[#27272F] dark:text-[#F4F4F5]"
                        : "text-[#71717A] dark:text-[#A1A1AA]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Active Engagements Quick-Open */}
        <div className="mt-7 px-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[#71717A] dark:text-[#A1A1AA]">
              Active Engagements
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {activeProjects.slice(0, 4).map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSelectedProjectId(project.id);
                }}
                className="group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12px] text-[#52525B] transition hover:bg-[#E4E4E7]/50 hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#1E1E25]/60 dark:hover:text-[#F4F4F5]"
              >
                <span className="truncate font-medium">{project.name}</span>
                <span className="ml-2 shrink-0 font-mono text-[10px] text-[#71717A] group-hover:text-[#4F46E5] dark:text-[#71717A] dark:group-hover:text-[#818CF8]">
                  {project.code}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Appearance Switch & Authenticated User Menu */}
      <div className="relative space-y-2.5 pt-3">
        <ThemeTogglePill />

        {userMenuOpen && (
          <div className="rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-1.5 shadow-lg dark:border-[#27272F] dark:bg-[#19191E]">
            <div className="border-b border-[#E4E4E7] px-2.5 py-2 dark:border-[#27272F]">
              <div className="text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                {currentUser.name}
              </div>
              <div className="truncate font-mono text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                {currentUser.email}
              </div>
            </div>
            <Link
              href="/login"
              onClick={() => setUserMenuOpen(false)}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#111111] hover:bg-[#F7F7F5] dark:text-[#F4F4F5] dark:hover:bg-[#222229]"
            >
              <ArrowLeftRight className="h-3.5 w-3.5 text-[#4F46E5] dark:text-[#818CF8]" />
              Switch Studio Account
            </Link>
            <button
              type="button"
              disabled={signingOut}
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] font-medium text-[#E11D48] hover:bg-[#FFF1F2] disabled:opacity-50 dark:text-[#FB7185] dark:hover:bg-[#E11D48]/15"
            >
              <LogOut className="h-3.5 w-3.5" />
              {signingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setUserMenuOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-2.5 text-left transition hover:border-[#111111]/30 dark:border-[#27272F] dark:bg-[#19191E] dark:hover:border-[#F4F4F5]/30"
          aria-expanded={userMenuOpen}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {getInitials(currentUser.name)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                {currentUser.name}
              </div>
              <div className="truncate text-[11px] text-[#52525B] dark:text-[#A1A1AA]">
                {currentUser.role}
              </div>
            </div>
          </div>
          <ChevronUp
            className={`h-4 w-4 shrink-0 text-[#71717A] transition-transform dark:text-[#A1A1AA] ${
              userMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F7F7F5] text-[#111111] dark:bg-[#0E0E11] dark:text-[#F4F4F5]">
      {/* Desktop Persistent 240px Sidebar */}
      <aside className="hidden w-[240px] shrink-0 border-r border-[#E4E4E7] dark:border-[#27272F] lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-[#111111]/40 backdrop-blur-[1px] dark:bg-black/65 lg:hidden"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <aside className="h-full w-[260px] border-r border-[#E4E4E7] bg-[#F0EFEA] shadow-2xl dark:border-[#27272F] dark:bg-[#141418]">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Canvas */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#E4E4E7] bg-[#F7F7F5]/95 px-4 py-3 backdrop-blur-xs dark:border-[#27272F] dark:bg-[#0E0E11]/95 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] p-2 text-[#111111] dark:border-[#27272F] dark:bg-[#19191E] dark:text-[#F4F4F5]"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <MeridianLogo />
          <div className="flex items-center gap-2">
            <ThemeToggleButton compact />
            <button
              type="button"
              onClick={() => openProjectModal(null)}
              className="rounded-lg bg-[#111111] p-2 text-white dark:bg-[#F4F4F5] dark:text-[#111111]"
              aria-label="New project"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>

      {/* Global CRUD Modals & Project Slide-Over Drawer */}
      <ProjectFormModal />
      <TaskFormModal />
      <BookingFormModal />
      <MemberFormModal />
      <ProjectDetailDrawer />
    </div>
  );
}
