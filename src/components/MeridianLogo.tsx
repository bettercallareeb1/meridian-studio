import React from "react";

export function MeridianLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#111111] text-white shadow-xs dark:bg-[#F4F4F5] dark:text-[#111111]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeOpacity="0.35"
          />
          <path
            d="M6.5 16.5V7.5L12 13.5L17.5 7.5V16.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="5" r="1.75" fill="#4F46E5" />
        </svg>
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-[#F4F4F5]">
            Meridian
          </span>
          <span className="mt-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#71717A] dark:text-[#A1A1AA]">
            Studio OS
          </span>
        </div>
      )}
    </div>
  );
}
