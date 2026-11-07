import React from "react";
import { WorkspaceBootstrap } from "@/components/WorkspaceBootstrap";
import { ProjectsClient } from "@/components/ProjectsClient";

export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  return (
    <WorkspaceBootstrap>
      <ProjectsClient />
    </WorkspaceBootstrap>
  );
}
