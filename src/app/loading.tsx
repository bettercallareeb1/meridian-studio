import React from "react";

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-[#F7F7F5] dark:bg-[#0E0E11]">
      <div className="hidden w-[240px] shrink-0 border-r border-[#E4E4E7] bg-[#F0EFEA] p-4 dark:border-[#27272F] dark:bg-[#141418] lg:block">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-[#E4E4E7] dark:bg-[#27272F]" />
        <div className="mt-6 h-9 w-full animate-pulse rounded-lg bg-[#E4E4E7] dark:bg-[#27272F]" />
        <div className="mt-6 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 w-full animate-pulse rounded-lg bg-[#E4E4E7]/70 dark:bg-[#222229]"
            />
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-28 animate-pulse rounded bg-[#E4E4E7] dark:bg-[#27272F]" />
            <div className="h-7 w-64 animate-pulse rounded-lg bg-[#E4E4E7] dark:bg-[#27272F]" />
          </div>
          <div className="h-9 w-36 animate-pulse rounded-lg bg-[#E4E4E7] dark:bg-[#27272F]" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-5 dark:border-[#27272F] dark:bg-[#19191E]"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="h-80 animate-pulse rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] dark:border-[#27272F] dark:bg-[#19191E] lg:col-span-7" />
          <div className="h-80 animate-pulse rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] dark:border-[#27272F] dark:bg-[#19191E] lg:col-span-5" />
        </div>
      </div>
    </div>
  );
}
