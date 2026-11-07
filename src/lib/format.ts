export function formatCurrency(cents: number): string {
  const dollars = Math.round(cents / 100);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dollars);
}

export function formatShortDate(isoDate: string): string {
  if (!isoDate) return "—";
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parsed);
}

export function formatFullDate(isoDate: string): string {
  if (!isoDate) return "—";
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "M";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function getProjectStatusStyle(status: string): string {
  switch (status) {
    case "Active":
      return "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#059669]/15 dark:text-[#34D399] dark:border-[#059669]/35";
    case "In Review":
      return "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE] dark:bg-[#4F46E5]/20 dark:text-[#A5B4FC] dark:border-[#4F46E5]/35";
    case "Planning":
      return "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] dark:bg-[#D97706]/15 dark:text-[#FBBF24] dark:border-[#D97706]/35";
    case "Completed":
    default:
      return "bg-[#F3F4F6] text-[#52525B] border-[#E4E4E7] dark:bg-[#222229] dark:text-[#A1A1AA] dark:border-[#2E2E38]";
  }
}

export function getTaskStatusStyle(status: string): string {
  switch (status) {
    case "Done":
      return "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#059669]/15 dark:text-[#34D399] dark:border-[#059669]/35";
    case "In Review":
      return "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE] dark:bg-[#4F46E5]/20 dark:text-[#A5B4FC] dark:border-[#4F46E5]/35";
    case "In Progress":
      return "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] dark:bg-[#D97706]/15 dark:text-[#FBBF24] dark:border-[#D97706]/35";
    case "Backlog":
    default:
      return "bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7] dark:bg-[#222229] dark:text-[#A1A1AA] dark:border-[#2E2E38]";
  }
}

export function getPriorityStyle(priority: string): string {
  switch (priority) {
    case "Urgent":
      return "bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3] dark:bg-[#E11D48]/15 dark:text-[#FB7185] dark:border-[#E11D48]/35";
    case "High":
      return "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] dark:bg-[#D97706]/15 dark:text-[#FBBF24] dark:border-[#D97706]/35";
    case "Medium":
    case "Normal":
      return "bg-[#F4F4F5] text-[#111111] border-[#E4E4E7] dark:bg-[#222229] dark:text-[#E4E4E7] dark:border-[#2E2E38]";
    case "Low":
    default:
      return "bg-[#FAFAFA] text-[#71717A] border-[#E4E4E7] dark:bg-[#19191E] dark:text-[#A1A1AA] dark:border-[#27272F]";
  }
}

export function getBookingStatusStyle(status: string): string {
  switch (status) {
    case "Confirmed":
      return "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#059669]/15 dark:text-[#34D399] dark:border-[#059669]/35";
    case "Tentative":
      return "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] dark:bg-[#D97706]/15 dark:text-[#FBBF24] dark:border-[#D97706]/35";
    case "Completed":
    default:
      return "bg-[#F4F4F5] text-[#52525B] border-[#E4E4E7] dark:bg-[#222229] dark:text-[#A1A1AA] dark:border-[#2E2E38]";
  }
}

export function getMemberStatusStyle(status: string): string {
  switch (status) {
    case "In Studio":
      return "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] dark:bg-[#059669]/15 dark:text-[#34D399] dark:border-[#059669]/35";
    case "On Shoot":
      return "bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE] dark:bg-[#4F46E5]/20 dark:text-[#A5B4FC] dark:border-[#4F46E5]/35";
    case "Available":
      return "bg-[#F4F4F5] text-[#111111] border-[#E4E4E7] dark:bg-[#222229] dark:text-[#E4E4E7] dark:border-[#2E2E38]";
    case "Out of Office":
    default:
      return "bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3] dark:bg-[#E11D48]/15 dark:text-[#FB7185] dark:border-[#E11D48]/35";
  }
}
