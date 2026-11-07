import React from "react";
import { ensureSeeded } from "@/db/seed";
import { getSessionUser } from "@/lib/auth";
import { AuthView } from "@/components/AuthView";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  await ensureSeeded();
  const user = await getSessionUser();
  return <AuthView currentUserEmail={user?.email ?? null} />;
}
