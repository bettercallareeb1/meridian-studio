import React from "react";
import { getSessionUser } from "@/lib/auth";
import { getStudioWorkspaceData } from "@/lib/studio-data";
import { AuthView } from "@/components/AuthView";
import { ToastProvider } from "@/components/ToastProvider";
import { WorkspaceProvider } from "@/components/WorkspaceProvider";
import { StudioShell } from "@/components/StudioShell";

export async function WorkspaceBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return <AuthView />;
  }

  const workspace = await getStudioWorkspaceData();
  return (
    <ToastProvider>
      <WorkspaceProvider
        initialUser={sessionUser}
        initialWorkspace={workspace}
        isDemoBootstrap={false}
      >
        <StudioShell>{children}</StudioShell>
      </WorkspaceProvider>
    </ToastProvider>
  );
}
