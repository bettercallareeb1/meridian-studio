"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  CalendarPlus,
  Users,
  Mail,
} from "lucide-react";
import { useWorkspace } from "@/components/WorkspaceProvider";
import {
  formatCurrency,
  getInitials,
  getMemberStatusStyle,
} from "@/lib/format";

export function TeamClient() {
  const {
    workspace,
    currentUser,
    openMemberModal,
    openBookingModal,
    updateMember,
  } = useWorkspace();

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const filtered = workspace.team.filter((m) => {
    if (departmentFilter !== "All" && m.department !== departmentFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q)
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
            Multidisciplinary Roster
          </span>
          <h1 className="mt-1 text-[26px] font-semibold leading-[1.2] tracking-[-0.025em] text-[#111111] dark:text-[#F4F4F5]">
            Studio Team
          </h1>
          <p className="mt-1 text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
            Directory of creative directors, designers, motion leads, and
            producers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openMemberModal(null)}
          className="inline-flex items-center gap-1.5 self-start rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#27272A] dark:bg-[#F4F4F5] dark:text-[#111111] dark:hover:bg-[#E4E4E7] sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Team Member
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-3.5 dark:border-[#27272F] dark:bg-[#19191E] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            "All",
            "Direction",
            "Brand Design",
            "Digital Product",
            "Motion & 3D",
            "Production",
          ].map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setDepartmentFilter(dept)}
              className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${
                departmentFilter === dept
                  ? "bg-[#111111] text-white dark:bg-[#F4F4F5] dark:text-[#111111]"
                  : "bg-[#F7F7F5] text-[#52525B] hover:bg-[#F0EFEA] hover:text-[#111111] dark:bg-[#141418] dark:text-[#A1A1AA] dark:hover:bg-[#222229] dark:hover:text-[#F4F4F5]"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#71717A]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, role, email..."
            className="w-full rounded-lg border border-[#E4E4E7] bg-[#F7F7F5]/60 py-1.5 pr-3 pl-8 text-[13px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:bg-[#FFFFFF] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5] dark:focus:bg-[#141418]"
          />
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E4E4E7] bg-[#FFFFFF] p-12 text-center dark:border-[#27272F] dark:bg-[#19191E]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0EFEA] text-[#52525B] dark:bg-[#222229] dark:text-[#A1A1AA]">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-[16px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
            No studio members found
          </h3>
          <p className="mt-1 max-w-sm text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
            Add a specialist to your studio roster or clear the discipline
            filter.
          </p>
          <button
            type="button"
            onClick={() => openMemberModal(null)}
            className="mt-4 rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white dark:bg-[#F4F4F5] dark:text-[#111111]"
          >
            + Add Team Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((member) => {
            const isSelf = member.id === currentUser.id;
            const pct = Math.min(100, member.activeAllocationPercent);
            const isOver = member.activeAllocationPercent > 95;

            return (
              <article
                key={member.id}
                className="flex flex-col justify-between rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-5 transition hover:border-[#111111]/35 dark:border-[#27272F] dark:bg-[#19191E] dark:hover:border-[#818CF8]/50"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold text-white"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {getInitials(member.name)}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[16px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                            {member.name}
                          </h3>
                          {isSelf && (
                            <span className="rounded bg-[#EEF2FF] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#4F46E5] dark:bg-[#4F46E5]/20 dark:text-[#A5B4FC]">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                          {member.role}
                        </div>
                      </div>
                    </div>

                    <select
                      value={member.status}
                      aria-label={`Presence status for ${member.name}`}
                      onChange={(e) =>
                        updateMember(member.id, { status: e.target.value })
                      }
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-medium focus:outline-none dark:bg-[#141418] ${getMemberStatusStyle(
                        member.status
                      )}`}
                    >
                      <option value="In Studio">In Studio</option>
                      <option value="Available">Available</option>
                      <option value="On Shoot">On Shoot</option>
                      <option value="Out of Office">Out of Office</option>
                    </select>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                    <span className="inline-flex items-center gap-1.5 truncate font-mono text-[11px]">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-[#71717A]" />
                      {member.email}
                    </span>
                    <span className="shrink-0 rounded bg-[#F7F7F5] px-2 py-0.5 text-[11px] font-medium text-[#111111] dark:bg-[#222229] dark:text-[#F4F4F5]">
                      {member.department}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-3 border-t border-[#E4E4E7] pt-4 dark:border-[#27272F]">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-[#F7F7F5] px-2 py-2 dark:bg-[#141418]">
                      <div className="font-mono text-[14px] font-semibold text-[#111111] tabular-nums dark:text-[#F4F4F5]">
                        {member.activeProjectCount}
                      </div>
                      <div className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#71717A] dark:text-[#A1A1AA]">
                        Projects
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#F7F7F5] px-2 py-2 dark:bg-[#141418]">
                      <div className="font-mono text-[14px] font-semibold text-[#111111] tabular-nums dark:text-[#F4F4F5]">
                        {member.completedTaskCount}/{member.assignedTaskCount}
                      </div>
                      <div className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#71717A] dark:text-[#A1A1AA]">
                        Tasks Done
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#F7F7F5] px-2 py-2 dark:bg-[#141418]">
                      <div className="font-mono text-[14px] font-semibold text-[#111111] tabular-nums dark:text-[#F4F4F5]">
                        {formatCurrency(member.hourlyRateCents)}/h
                      </div>
                      <div className="text-[10px] font-medium uppercase tracking-[0.04em] text-[#71717A] dark:text-[#A1A1AA]">
                        Bill Rate
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#52525B] dark:text-[#A1A1AA]">
                        Sprint Utilization
                      </span>
                      <span
                        className={`font-mono font-semibold tabular-nums ${
                          isOver
                            ? "text-[#D97706] dark:text-[#FBBF24]"
                            : "text-[#111111] dark:text-[#F4F4F5]"
                        }`}
                      >
                        {member.activeAllocationPercent}% of{" "}
                        {member.weeklyCapacityHours}h
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E4E4E7] dark:bg-[#27272F]">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver
                            ? "bg-[#D97706] dark:bg-[#FBBF24]"
                            : "bg-[#059669] dark:bg-[#34D399]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        openBookingModal(null, { memberId: member.id })
                      }
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#4F46E5] hover:text-[#4338CA] dark:text-[#818CF8] dark:hover:text-[#A5B4FC]"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" />
                      Book Sprint
                    </button>

                    <button
                      type="button"
                      onClick={() => openMemberModal(member)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-1 text-[12px] font-medium text-[#111111] hover:bg-[#F7F7F5] dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5] dark:hover:bg-[#222229]"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
