"use client";

import React, { useState } from "react";
import {
  Plus,
  CalendarRange,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import { useWorkspace } from "@/components/WorkspaceProvider";
import {
  formatShortDate,
  getBookingStatusStyle,
  getInitials,
} from "@/lib/format";

export function ScheduleClient() {
  const {
    workspace,
    openBookingModal,
    updateBooking,
    deleteBooking,
    setSelectedProjectId,
  } = useWorkspace();

  const [memberFilter, setMemberFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredBookings = workspace.bookings.filter((b) => {
    if (memberFilter !== "All" && String(b.memberId) !== memberFilter) {
      return false;
    }
    if (statusFilter !== "All" && b.status !== statusFilter) {
      return false;
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        b.roleTitle.toLowerCase().includes(q) ||
        b.notes.toLowerCase().includes(q) ||
        (b.project?.name.toLowerCase().includes(q) ?? false) ||
        (b.member?.name.toLowerCase().includes(q) ?? false)
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
            Capacity & Sprints
          </span>
          <h1 className="mt-1 text-[26px] font-semibold leading-[1.2] tracking-[-0.025em] text-[#111111] dark:text-[#F4F4F5]">
            Resource Schedule
          </h1>
          <p className="mt-1 text-[14px] text-[#52525B] dark:text-[#A1A1AA]">
            Balance studio workload across active client engagements and
            prevent over-allocation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openBookingModal(null)}
          className="inline-flex items-center gap-1.5 self-start rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#27272A] dark:bg-[#F4F4F5] dark:text-[#111111] dark:hover:bg-[#E4E4E7] sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Schedule Resource
        </button>
      </div>

      {/* Team Utilization Matrix Card */}
      <section className="rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-5 dark:border-[#27272F] dark:bg-[#19191E]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
              Specialist Utilization Overview
            </h2>
            <p className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
              Click any team member to schedule a new project allocation
            </p>
          </div>
          <span className="font-mono text-[12px] font-semibold text-[#111111] tabular-nums dark:text-[#F4F4F5]">
            Avg {workspace.kpis.avgUtilizationPercent}%
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {workspace.team.map((member) => {
            const memberBookings = workspace.bookings.filter(
              (b) => b.memberId === member.id && b.status !== "Completed"
            );
            const totalPct = member.activeAllocationPercent;
            const isOver = totalPct > 95;

            return (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-xl border border-[#E4E4E7] bg-[#F7F7F5]/50 p-3.5 dark:border-[#27272F] dark:bg-[#141418] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-[210px] items-center gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {getInitials(member.name)}
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                      {member.name}
                    </div>
                    <div className="text-[11px] text-[#52525B] dark:text-[#A1A1AA]">
                      {member.role} · {member.weeklyCapacityHours}h/wk
                    </div>
                  </div>
                </div>

                {/* Stacked Allocation Bar */}
                <div className="flex-1">
                  <div className="flex h-6 w-full overflow-hidden rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] p-0.5 dark:border-[#27272F] dark:bg-[#19191E]">
                    {memberBookings.map((b, idx) => {
                      const palette = [
                        "#4F46E5",
                        "#059669",
                        "#D97706",
                        "#3F3F46",
                      ];
                      const bg = palette[idx % palette.length];
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => openBookingModal(b)}
                          title={`${b.project?.code ?? "MRD"} · ${
                            b.project?.name ?? ""
                          } (${b.allocationPercent}%)`}
                          style={{
                            width: `${Math.min(100, b.allocationPercent)}%`,
                            backgroundColor: bg,
                          }}
                          className="mr-0.5 flex h-full items-center justify-center truncate rounded-md px-1.5 font-mono text-[10px] font-medium text-white transition hover:opacity-90 last:mr-0"
                        >
                          {b.allocationPercent >= 25
                            ? `${b.project?.code ?? ""} ${b.allocationPercent}%`
                            : `${b.allocationPercent}%`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span
                    className={`font-mono text-[12px] font-semibold tabular-nums ${
                      isOver
                        ? "text-[#D97706] dark:text-[#FBBF24]"
                        : totalPct === 0
                          ? "text-[#71717A] dark:text-[#A1A1AA]"
                          : "text-[#059669] dark:text-[#34D399]"
                    }`}
                  >
                    {totalPct}% allocated
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      openBookingModal(null, { memberId: member.id })
                    }
                    className="rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-semibold text-[#111111] hover:bg-[#F0EFEA] dark:border-[#27272F] dark:bg-[#19191E] dark:text-[#F4F4F5] dark:hover:bg-[#222229]"
                  >
                    + Book
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filters for Bookings Table */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-3.5 dark:border-[#27272F] dark:bg-[#19191E] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px]">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#71717A]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter allocations..."
              className="w-full rounded-lg border border-[#E4E4E7] bg-[#F7F7F5]/60 py-1.5 pr-3 pl-8 text-[13px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:bg-[#FFFFFF] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5] dark:focus:bg-[#141418]"
            />
          </div>

          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            aria-label="Filter by team member"
            className="rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-1.5 text-[12px] font-medium text-[#111111] dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
          >
            <option value="All">All Specialists</option>
            {workspace.team.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by booking status"
            className="rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-2.5 py-1.5 text-[12px] font-medium text-[#111111] dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Tentative">Tentative</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <span className="font-mono text-[12px] text-[#71717A] tabular-nums dark:text-[#A1A1AA]">
          {filteredBookings.length} active{" "}
          {filteredBookings.length === 1 ? "booking" : "bookings"}
        </span>
      </div>

      {/* Bookings Ledger */}
      {filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E4E4E7] bg-[#FFFFFF] p-12 text-center dark:border-[#27272F] dark:bg-[#19191E]">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0EFEA] text-[#52525B] dark:bg-[#222229] dark:text-[#A1A1AA]">
            <CalendarRange className="h-5 w-5" />
          </div>
          <h3 className="mt-3 text-[16px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
            No resource bookings found
          </h3>
          <p className="mt-1 max-w-sm text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
            Allocate studio specialists to projects to plan upcoming sprint
            capacity.
          </p>
          <button
            type="button"
            onClick={() => openBookingModal(null)}
            className="mt-4 rounded-lg bg-[#111111] px-4 py-2 text-[13px] font-semibold text-white dark:bg-[#F4F4F5] dark:text-[#111111]"
          >
            + Schedule Resource
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] dark:border-[#27272F] dark:bg-[#19191E]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#E4E4E7] bg-[#F7F7F5] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#71717A] dark:border-[#27272F] dark:bg-[#141418] dark:text-[#A1A1AA]">
                  <th className="py-3 pr-3 pl-5">Specialist</th>
                  <th className="px-3 py-3">Engagement</th>
                  <th className="px-3 py-3">Role & Notes</th>
                  <th className="px-3 py-3">Window</th>
                  <th className="px-3 py-3">Allocation</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="py-3 pr-5 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E4E7] text-[13px] dark:divide-[#27272F]">
                {filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="transition hover:bg-[#F7F7F5] dark:hover:bg-[#222229]/60"
                  >
                    <td className="py-3.5 pr-3 pl-5">
                      {b.member ? (
                        <div className="flex items-center gap-2.5">
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                            style={{ backgroundColor: b.member.avatarColor }}
                          >
                            {getInitials(b.member.name)}
                          </span>
                          <div>
                            <div className="font-semibold text-[#111111] dark:text-[#F4F4F5]">
                              {b.member.name}
                            </div>
                            <div className="text-[11px] text-[#52525B] dark:text-[#A1A1AA]">
                              {b.member.department}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#71717A]">—</span>
                      )}
                    </td>

                    <td className="px-3 py-3.5">
                      {b.project ? (
                        <button
                          type="button"
                          onClick={() => setSelectedProjectId(b.project!.id)}
                          className="text-left hover:text-[#4F46E5] dark:hover:text-[#818CF8]"
                        >
                          <div className="font-semibold text-[#111111] hover:text-[#4F46E5] dark:text-[#F4F4F5] dark:hover:text-[#818CF8]">
                            {b.project.name}
                          </div>
                          <div className="font-mono text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                            {b.project.code} · {b.project.clientName}
                          </div>
                        </button>
                      ) : (
                        <span className="text-[#71717A]">—</span>
                      )}
                    </td>

                    <td className="px-3 py-3.5">
                      <div className="font-medium text-[#111111] dark:text-[#F4F4F5]">
                        {b.roleTitle}
                      </div>
                      {b.notes && (
                        <div className="max-w-xs truncate text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                          {b.notes}
                        </div>
                      )}
                    </td>

                    <td className="px-3 py-3.5 font-mono text-[12px] text-[#52525B] tabular-nums dark:text-[#A1A1AA]">
                      {formatShortDate(b.startDate)} –{" "}
                      {formatShortDate(b.endDate)}
                    </td>

                    <td className="px-3 py-3.5">
                      <span className="rounded-md bg-[#F0EFEA] px-2 py-0.5 font-mono text-[12px] font-semibold text-[#111111] tabular-nums dark:bg-[#222229] dark:text-[#F4F4F5]">
                        {b.allocationPercent}%
                      </span>
                    </td>

                    <td className="px-3 py-3.5">
                      <select
                        value={b.status}
                        aria-label={`Change booking status for ${b.roleTitle}`}
                        onChange={(e) =>
                          updateBooking(b.id, { status: e.target.value })
                        }
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-medium focus:outline-none dark:bg-[#141418] ${getBookingStatusStyle(
                          b.status
                        )}`}
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Tentative">Tentative</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>

                    <td className="py-3.5 pr-5 pl-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openBookingModal(b)}
                          className="rounded p-1.5 text-[#71717A] hover:bg-[#E4E4E7] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:bg-[#2E2E38] dark:hover:text-[#F4F4F5]"
                          aria-label="Edit booking"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteBooking(b.id)}
                          className="rounded p-1.5 text-[#71717A] hover:bg-[#FFF1F2] hover:text-[#E11D48] dark:text-[#A1A1AA] dark:hover:bg-[#E11D48]/15 dark:hover:text-[#FB7185]"
                          aria-label="Delete booking"
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
