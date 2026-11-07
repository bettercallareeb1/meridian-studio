import React from "react";
import { WorkspaceBootstrap } from "@/components/WorkspaceBootstrap";
import { TeamClient } from "@/components/TeamClient";

export const dynamic = "force-dynamic";

export default function TeamPage() {
  return (
    <WorkspaceBootstrap>
      <TeamClient />
    </WorkspaceBootstrap>
  );
}
