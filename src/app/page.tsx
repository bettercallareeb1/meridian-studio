import React from "react";
import { WorkspaceBootstrap } from "@/components/WorkspaceBootstrap";
import { OverviewClient } from "@/components/OverviewClient";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <WorkspaceBootstrap>
      <OverviewClient />
    </WorkspaceBootstrap>
  );
}
