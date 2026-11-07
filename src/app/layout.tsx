import type { Metadata, Viewport } from "next";
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

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://meridian-studio-pi.vercel.app"
    : "http://localhost:3000");

const SITE_TITLE = "Meridian — Creative Studio Resource & Production Workspace";
const SITE_DESCRIPTION =
  "Editorial project management, deliverables workflow, and studio capacity planning for multidisciplinary design teams.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Meridian Studio OS",
  title: {
    default: SITE_TITLE,
    template: "%s · Meridian Studio OS",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "creative studio",
    "studio management",
    "project management",
    "resource planning",
    "production workflow",
    "design operations",
  ],
  authors: [{ name: "Meridian Creative Group" }],
  creator: "Meridian Creative Group",
  publisher: "Meridian Studio OS",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Meridian Studio OS",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Meridian",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F7F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0E11" },
  ],
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
