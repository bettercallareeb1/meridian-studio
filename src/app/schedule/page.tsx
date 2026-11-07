import React from "react";
import { WorkspaceBootstrap } from "@/components/WorkspaceBootstrap";
import { ScheduleClient } from "@/components/ScheduleClient";

export const dynamic = "force-dynamic";

export default function SchedulePage() {
  return (
    <WorkspaceBootstrap>
      <ScheduleClient />
    </WorkspaceBootstrap>
  );
}
