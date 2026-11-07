import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Meridian — Creative Studio Resource & Production Workspace",
  description:
    "Editorial project management, deliverables workflow, and studio capacity planning for multidisciplinary design teams.",
};

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('meridian-theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-[#F7F7F5] font-sans text-[#111111] antialiased selection:bg-[#4F46E5]/15 selection:text-[#111111] dark:bg-[#0E0E11] dark:text-[#F4F4F5] dark:selection:bg-[#6366F1]/25 dark:selection:text-[#F4F4F5]">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
