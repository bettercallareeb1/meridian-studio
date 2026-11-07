"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock, Mail, User, Sparkles } from "lucide-react";
import { MeridianLogo } from "@/components/MeridianLogo";
import { ThemeToggleButton } from "@/components/ThemeProvider";

const DEMO_PERSONAS = [
  {
    name: "Areeb Ahmed",
    email: "areeb@meridian.studio",
    role: "Creative Director",
    initials: "AA",
    color: "#4F46E5",
  },
  {
    name: "Julian Vance",
    email: "julian@meridian.studio",
    role: "Executive Producer",
    initials: "JV",
    color: "#059669",
  },
  {
    name: "Sora Takahashi",
    email: "sora@meridian.studio",
    role: "Principal Brand Designer",
    initials: "ST",
    color: "#D97706",
  },
];

export function AuthView({
  currentUserEmail,
}: {
  currentUserEmail?: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("areeb@meridian.studio");
  const [password, setPassword] = useState("Meridian2026!");
  const [role, setRole] = useState("Senior Brand Designer");
  const [department, setDepartment] = useState("Brand Design");
  const [loading, setLoading] = useState(false);
  const [demoLoadingEmail, setDemoLoadingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password, role, department };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error while connecting to studio server");
      setLoading(false);
    }
  }

  async function handleDemoPersona(personaEmail: string) {
    setError(null);
    setDemoLoadingEmail(personaEmail);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: personaEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Could not start demo session");
        setDemoLoadingEmail(null);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Unable to start demo session");
      setDemoLoadingEmail(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#F7F7F5] px-4 py-10 dark:bg-[#0E0E11] sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <MeridianLogo />
        <div className="flex items-center gap-2.5">
          <ThemeToggleButton />
          {currentUserEmail && (
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-1.5 text-[13px] font-medium text-[#111111] transition hover:bg-[#F0EFEA] dark:border-[#27272F] dark:bg-[#19191E] dark:text-[#F4F4F5] dark:hover:bg-[#222229]"
            >
              Back to Workspace
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto my-8 grid w-full max-w-5xl grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        {/* Left Editorial Column */}
        <div className="lg:col-span-6 lg:pr-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-1 text-[12px] font-medium text-[#52525B] dark:border-[#27272F] dark:bg-[#19191E] dark:text-[#A1A1AA]">
            <span className="h-2 w-2 rounded-full bg-[#059669] dark:bg-[#34D399]" />
            Meridian Creative Group · Q2 Production Cycle
          </div>
          <h1 className="mt-5 text-[34px] font-semibold leading-[1.15] tracking-[-0.03em] text-[#111111] dark:text-[#F4F4F5] sm:text-[42px]">
            Precision studio planning for multidisciplinary design teams.
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-[1.6] text-[#52525B] dark:text-[#A1A1AA]">
            Coordinate client engagements, track design deliverables across sprints,
            and balance studio capacity in one calm, editorial workspace.
          </p>

          {/* Instant Demo Persona Cards */}
          <div className="mt-8 rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-5 dark:border-[#27272F] dark:bg-[#19191E]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#4F46E5] dark:text-[#818CF8]" />
                <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#111111] dark:text-[#F4F4F5]">
                  Instant Studio Demo Access
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                1-Click Sign In
              </span>
            </div>
            <p className="mt-1.5 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
              Enter immediately with pre-seeded client projects, deliverables, and
              team allocations:
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {DEMO_PERSONAS.map((persona) => {
                const isBusy = demoLoadingEmail === persona.email;
                return (
                  <button
                    key={persona.email}
                    type="button"
                    disabled={Boolean(demoLoadingEmail) || loading}
                    onClick={() => handleDemoPersona(persona.email)}
                    className="group flex w-full items-center justify-between rounded-lg border border-[#E4E4E7] bg-[#F7F7F5]/60 px-3.5 py-2.5 text-left transition hover:border-[#111111] hover:bg-[#FFFFFF] disabled:opacity-60 dark:border-[#27272F] dark:bg-[#141418] dark:hover:border-[#818CF8] dark:hover:bg-[#222229]"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                        style={{ backgroundColor: persona.color }}
                      >
                        {persona.initials}
                      </span>
                      <div>
                        <div className="text-[13px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                          {persona.name}
                        </div>
                        <div className="text-[12px] text-[#52525B] dark:text-[#A1A1AA]">
                          {persona.role} ·{" "}
                          <span className="font-mono text-[11px]">
                            {persona.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#4F46E5] transition-transform group-hover:translate-x-0.5 dark:text-[#818CF8]">
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Enter <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Authentication Form Card */}
        <div className="lg:col-span-6">
          <div className="rounded-xl border border-[#E4E4E7] bg-[#FFFFFF] p-6 shadow-[0_12px_36px_rgba(17,17,17,0.04)] dark:border-[#27272F] dark:bg-[#19191E] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)] sm:p-8">
            <div className="flex rounded-lg bg-[#F0EFEA] p-1 dark:bg-[#141418]">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`flex-1 rounded-md py-2 text-[13px] font-semibold transition ${
                  mode === "login"
                    ? "bg-[#FFFFFF] text-[#111111] shadow-2xs dark:bg-[#222229] dark:text-[#F4F4F5]"
                    : "text-[#52525B] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                  if (email === "maya@meridian.studio") {
                    setEmail("");
                    setPassword("");
                  }
                }}
                className={`flex-1 rounded-md py-2 text-[13px] font-semibold transition ${
                  mode === "register"
                    ? "bg-[#FFFFFF] text-[#111111] shadow-2xs dark:bg-[#222229] dark:text-[#F4F4F5]"
                    : "text-[#52525B] hover:text-[#111111] dark:text-[#A1A1AA] dark:hover:text-[#F4F4F5]"
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mt-6">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#111111] dark:text-[#F4F4F5]">
                {mode === "login"
                  ? "Sign in to Meridian Studio"
                  : "Join the Meridian Workspace"}
              </h2>
              <p className="mt-1 text-[13px] text-[#52525B] dark:text-[#A1A1AA]">
                {mode === "login"
                  ? "Use your studio credentials or select a demo account."
                  : "Create a persistent studio account with full project access."}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-[#FECDD3] bg-[#FFF1F2] px-3.5 py-2.5 text-[13px] font-medium text-[#E11D48] dark:border-[#E11D48]/35 dark:bg-[#E11D48]/15 dark:text-[#FB7185]"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {mode === "register" && (
                <>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                      Full Name
                    </label>
                    <div className="relative mt-1.5">
                      <User className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Clara Hendriks"
                        className="w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] py-2 pr-3 pl-9 text-[14px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                        Studio Role
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Senior Brand Designer"
                        className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                        Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#111111] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
                      >
                        <option value="Brand Design">Brand Design</option>
                        <option value="Digital Product">Digital Product</option>
                        <option value="Motion & 3D">Motion & 3D</option>
                        <option value="Production">Production</option>
                        <option value="Direction">Direction</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                  Work Email
                </label>
                <div className="relative mt-1.5">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@meridian.studio"
                    className="w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] py-2 pr-3 pl-9 text-[14px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[12px] font-semibold text-[#111111] dark:text-[#F4F4F5]">
                    Password
                  </label>
                  {mode === "login" && (
                    <span className="font-mono text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                      Demo: Meridian2026!
                    </span>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#71717A]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-[#E4E4E7] bg-[#FFFFFF] py-2 pr-3 pl-9 text-[14px] text-[#111111] placeholder:text-[#71717A] focus:border-[#4F46E5] focus:outline-none dark:border-[#27272F] dark:bg-[#141418] dark:text-[#F4F4F5]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || Boolean(demoLoadingEmail)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#111111] px-4 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#27272A] disabled:opacity-60 dark:bg-[#F4F4F5] dark:text-[#111111] dark:hover:bg-[#E4E4E7]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign In to Workspace" : "Create Studio Account"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="mx-auto flex w-full max-w-5xl items-center justify-between border-t border-[#E4E4E7] pt-5 text-[12px] text-[#71717A] dark:border-[#27272F] dark:text-[#A1A1AA]">
        <span>Meridian Studio OS · Swiss Editorial Resource Workspace</span>
        <span className="font-mono">PostgreSQL + Drizzle ORM</span>
      </footer>
    </div>
  );
}
