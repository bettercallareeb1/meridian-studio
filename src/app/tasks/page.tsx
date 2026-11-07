import React from "react";
import { WorkspaceBootstrap } from "@/components/WorkspaceBootstrap";
import { TasksClient } from "@/components/TasksClient";

export const dynamic = "force-dynamic";

export default function TasksPage() {
  return (
    <WorkspaceBootstrap>
      <TasksClient />
    </WorkspaceBootstrap>
  );
}
