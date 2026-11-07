import { count, eq } from "drizzle-orm";
import { db, users, projects, tasks, bookings, type SafeUser } from "@/db";
import { hashPassword, toSafeUser } from "@/lib/auth";

let seedInFlight: Promise<void> | null = null;

async function runSeed(): Promise<void> {
  const [{ value: existingUsers }] = await db
    .select({ value: count() })
    .from(users);

  if (Number(existingUsers) > 0) {
    return;
  }

  const demoPasswordHash = hashPassword("Meridian2026!");

  const insertedUsers = await db
    .insert(users)
    .values([
      {
        name: "Areeb Ahmed",
        email: "areeb@meridian.studio",
        passwordHash: demoPasswordHash,
        role: "Creative Director",
        department: "Direction",
        weeklyCapacityHours: 40,
        hourlyRateCents: 24500,
        avatarColor: "#4F46E5",
        status: "In Studio",
        isAdmin: true,
      },
      {
        name: "Julian Vance",
        email: "julian@meridian.studio",
        passwordHash: demoPasswordHash,
        role: "Executive Producer",
        department: "Production",
        weeklyCapacityHours: 40,
        hourlyRateCents: 21000,
        avatarColor: "#059669",
        status: "In Studio",
        isAdmin: true,
      },
      {
        name: "Sora Takahashi",
        email: "sora@meridian.studio",
        passwordHash: demoPasswordHash,
        role: "Principal Brand Designer",
        department: "Brand Design",
        weeklyCapacityHours: 40,
        hourlyRateCents: 19500,
        avatarColor: "#D97706",
        status: "In Studio",
        isAdmin: false,
      },
      {
        name: "Marcus Thorne",
        email: "marcus@meridian.studio",
        passwordHash: demoPasswordHash,
        role: "Staff Product Designer",
        department: "Digital Product",
        weeklyCapacityHours: 40,
        hourlyRateCents: 20500,
        avatarColor: "#111111",
        status: "In Studio",
        isAdmin: false,
      },
      {
        name: "Elena Rostova",
        email: "elena@meridian.studio",
        passwordHash: demoPasswordHash,
        role: "Motion & 3D Lead",
        department: "Motion & 3D",
        weeklyCapacityHours: 35,
        hourlyRateCents: 19000,
        avatarColor: "#E11D48",
        status: "On Shoot",
        isAdmin: false,
      },
      {
        name: "Devon Brooks",
        email: "devon@meridian.studio",
        passwordHash: demoPasswordHash,
        role: "Senior Brand Strategist",
        department: "Brand Design",
        weeklyCapacityHours: 40,
        hourlyRateCents: 18500,
        avatarColor: "#0284C7",
        status: "Available",
        isAdmin: false,
      },
    ])
    .returning();

  const [maya, julian, sora, marcus, elena, devon] = insertedUsers;

  const insertedProjects = await db
    .insert(projects)
    .values([
      {
        code: "MRD-204",
        name: "Aesop Botanical Monograph",
        clientName: "Aesop Global",
        category: "Editorial",
        status: "Active",
        priority: "High",
        budgetCents: 9200000,
        spentCents: 5840000,
        dueDate: "2026-06-18",
        leadId: maya.id,
        summary:
          "Hardcover archival print monograph and companion interactive digital index documenting forty botanical formulations.",
      },
      {
        code: "MRD-208",
        name: "Polestar Spatial Cockpit OS",
        clientName: "Polestar Design Lab",
        category: "Digital Product",
        status: "Active",
        priority: "High",
        budgetCents: 14500000,
        spentCents: 8820000,
        dueDate: "2026-07-04",
        leadId: marcus.id,
        summary:
          "Next-generation driver instrument cluster typography, adaptive night-mode HMI tokens, and haptic motion choreography.",
      },
      {
        code: "MRD-211",
        name: "Nothing Ear (3) Packaging & Key Visuals",
        clientName: "Nothing Technology",
        category: "Brand Identity",
        status: "In Review",
        priority: "High",
        budgetCents: 7600000,
        spentCents: 6950000,
        dueDate: "2026-05-29",
        leadId: sora.id,
        summary:
          "Tactile transparent hardware unboxing architecture, dot-matrix typographic system, and global launch film stills.",
      },
      {
        code: "MRD-215",
        name: "Rimowa Aluminum Archive",
        clientName: "Rimowa GmbH",
        category: "Spatial & Motion",
        status: "Active",
        priority: "Medium",
        budgetCents: 11000000,
        spentCents: 4200000,
        dueDate: "2026-07-22",
        leadId: elena.id,
        summary:
          "Interactive 3D WebGL exhibition vault and kinetic groove studies celebrating anodized luggage engineering.",
      },
      {
        code: "MRD-219",
        name: "Kinfolk Issue 54 Art Direction",
        clientName: "Kinfolk Copenhagen",
        category: "Editorial",
        status: "Planning",
        priority: "Medium",
        budgetCents: 5400000,
        spentCents: 1100000,
        dueDate: "2026-08-15",
        leadId: devon.id,
        summary:
          "Seasonal architectural essay pacing, Swiss grid editorial templates, and tactile paper stock specification.",
      },
      {
        code: "MRD-198",
        name: "Leica M11 Monochrom Exhibition",
        clientName: "Leica Camera AG",
        category: "Brand Identity",
        status: "Completed",
        priority: "Low",
        budgetCents: 8400000,
        spentCents: 8190000,
        dueDate: "2026-04-30",
        leadId: maya.id,
        summary:
          "Gallery environmental signage, silver-gelatin catalog typography, and acoustic spatial lighting cues in Wetzlar.",
      },
    ])
    .returning();

  const [aesop, polestar, nothing, rimowa, kinfolk, leica] = insertedProjects;

  await db.insert(tasks).values([
    {
      projectId: aesop.id,
      assigneeId: sora.id,
      title: "Finalize Swiss grid baseline & botanical plate margins",
      description:
        "Lock 12-column baseline grid for 240-page linen-bound edition with foil-stamped spine tolerances.",
      status: "Done",
      priority: "High",
      estimateHours: 14,
      dueDate: "2026-05-12",
      position: 1,
    },
    {
      projectId: aesop.id,
      assigneeId: maya.id,
      title: "Approve press-proof color separation on Munken Polar",
      description:
        "Review wet-proof ink density for deep apothecary amber and botanical plates.",
      status: "In Review",
      priority: "Urgent",
      estimateHours: 6,
      dueDate: "2026-05-20",
      position: 2,
    },
    {
      projectId: aesop.id,
      assigneeId: marcus.id,
      title: "Build interactive ingredient index drawer prototype",
      description:
        "Responsive web index with instant chemical taxonomy filtering and keyboard navigation.",
      status: "In Progress",
      priority: "Normal",
      estimateHours: 18,
      dueDate: "2026-05-28",
      position: 3,
    },
    {
      projectId: polestar.id,
      assigneeId: marcus.id,
      title: "Instrument cluster speed & range tabular numerals",
      description:
        "Custom optical-size variable font kerning for zero-jitter velocity transitions at 60fps.",
      status: "Done",
      priority: "High",
      estimateHours: 20,
      dueDate: "2026-05-10",
      position: 4,
    },
    {
      projectId: polestar.id,
      assigneeId: elena.id,
      title: "ADAS lane-guidance 3D shader transitions",
      description:
        "Subtle depth-of-field fog and LiDAR point-cloud dissolve shaders for highway pilot mode.",
      status: "In Progress",
      priority: "Urgent",
      estimateHours: 24,
      dueDate: "2026-05-25",
      position: 5,
    },
    {
      projectId: polestar.id,
      assigneeId: julian.id,
      title: "Coordinate Gothenburg HMI simulator usability sprint",
      description:
        "Prepare test scripts and hardware rig calibration with Polestar ergonomics engineering.",
      status: "Backlog",
      priority: "Normal",
      estimateHours: 10,
      dueDate: "2026-06-05",
      position: 6,
    },
    {
      projectId: nothing.id,
      assigneeId: sora.id,
      title: "Molded pulp inner tray structural dieline v4",
      description:
        "Zero-plastic precision cradle tolerances for charging case and braided USB-C cable.",
      status: "In Review",
      priority: "Urgent",
      estimateHours: 12,
      dueDate: "2026-05-19",
      position: 7,
    },
    {
      projectId: nothing.id,
      assigneeId: elena.id,
      title: "Macro acoustic chamber exploded-view renders",
      description:
        "4K studio-lit Octane stills highlighting ceramic driver diaphragm and translucent shell.",
      status: "Done",
      priority: "High",
      estimateHours: 16,
      dueDate: "2026-05-14",
      position: 8,
    },
    {
      projectId: rimowa.id,
      assigneeId: elena.id,
      title: "Anodized aluminum groove specular lighting rig",
      description:
        "Physically based brushed metal anisotropic reflections for interactive WebGL viewport.",
      status: "In Progress",
      priority: "High",
      estimateHours: 22,
      dueDate: "2026-06-02",
      position: 9,
    },
    {
      projectId: rimowa.id,
      assigneeId: devon.id,
      title: "Curate 1950–2026 heritage trunk archival copy",
      description:
        "Write concise editorial captions for 32 milestone aviation and expedition cases.",
      status: "In Progress",
      priority: "Normal",
      estimateHours: 14,
      dueDate: "2026-06-09",
      position: 10,
    },
    {
      projectId: kinfolk.id,
      assigneeId: devon.id,
      title: "Issue 54 editorial narrative arc & contributor brief",
      description:
        "Commission essays exploring Nordic timber craft, quiet domesticity, and material longevity.",
      status: "Backlog",
      priority: "Normal",
      estimateHours: 16,
      dueDate: "2026-06-20",
      position: 11,
    },
    {
      projectId: kinfolk.id,
      assigneeId: maya.id,
      title: "Copenhagen architectural location scouting deck",
      description:
        "Shortlist 6 daylight-flooded residences and ceramic ateliers for June editorial shoot.",
      status: "Backlog",
      priority: "Low",
      estimateHours: 8,
      dueDate: "2026-06-24",
      position: 12,
    },
    {
      projectId: leica.id,
      assigneeId: maya.id,
      title: "Wetzlar gallery acoustic & wayfinding sign-off",
      description:
        "Final on-site installation inspection of anodized aluminum wall plaques and catalog plinths.",
      status: "Done",
      priority: "Normal",
      estimateHours: 12,
      dueDate: "2026-04-28",
      position: 13,
    },
  ]);

  await db.insert(bookings).values([
    {
      projectId: aesop.id,
      memberId: maya.id,
      roleTitle: "Creative Direction",
      allocationPercent: 40,
      startDate: "2026-05-04",
      endDate: "2026-06-18",
      status: "Confirmed",
      notes: "Weekly print & digital critique lead",
    },
    {
      projectId: aesop.id,
      memberId: sora.id,
      roleTitle: "Lead Editorial Designer",
      allocationPercent: 60,
      startDate: "2026-05-01",
      endDate: "2026-06-12",
      status: "Confirmed",
      notes: "Monograph typesetting & press check",
    },
    {
      projectId: polestar.id,
      memberId: marcus.id,
      roleTitle: "Staff HMI Designer",
      allocationPercent: 85,
      startDate: "2026-05-01",
      endDate: "2026-07-04",
      status: "Confirmed",
      notes: "Core cockpit design system & prototype",
    },
    {
      projectId: polestar.id,
      memberId: julian.id,
      roleTitle: "Executive Producer",
      allocationPercent: 50,
      startDate: "2026-05-01",
      endDate: "2026-07-04",
      status: "Confirmed",
      notes: "Client sprint cadence & Gothenburg workshop",
    },
    {
      projectId: nothing.id,
      memberId: sora.id,
      roleTitle: "Packaging Lead",
      allocationPercent: 35,
      startDate: "2026-05-04",
      endDate: "2026-05-29",
      status: "Confirmed",
      notes: "Final structural dieline & factory sign-off",
    },
    {
      projectId: nothing.id,
      memberId: elena.id,
      roleTitle: "3D Key Visuals",
      allocationPercent: 40,
      startDate: "2026-05-01",
      endDate: "2026-05-25",
      status: "Confirmed",
      notes: "Octane render delivery",
    },
    {
      projectId: rimowa.id,
      memberId: elena.id,
      roleTitle: "Motion & WebGL Lead",
      allocationPercent: 50,
      startDate: "2026-05-11",
      endDate: "2026-07-22",
      status: "Confirmed",
      notes: "Interactive 3D trunk shaders & motion",
    },
    {
      projectId: rimowa.id,
      memberId: devon.id,
      roleTitle: "Archival Strategist",
      allocationPercent: 45,
      startDate: "2026-05-11",
      endDate: "2026-06-30",
      status: "Confirmed",
      notes: "Heritage narrative & taxonomy",
    },
    {
      projectId: kinfolk.id,
      memberId: devon.id,
      roleTitle: "Editorial Strategist",
      allocationPercent: 35,
      startDate: "2026-05-18",
      endDate: "2026-08-01",
      status: "Tentative",
      notes: "Issue 54 pacing & contributor briefs",
    },
    {
      projectId: kinfolk.id,
      memberId: maya.id,
      roleTitle: "Art Director",
      allocationPercent: 30,
      startDate: "2026-05-25",
      endDate: "2026-08-15",
      status: "Tentative",
      notes: "Copenhagen shoot art direction",
    },
  ]);
}

export async function ensureSeeded(): Promise<void> {
  if (!seedInFlight) {
    seedInFlight = runSeed().finally(() => {
      seedInFlight = null;
    });
  }
  await seedInFlight;
}

export async function getDemoDirectorUser(): Promise<SafeUser | null> {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, "areeb@meridian.studio"))
    .limit(1);
  if (rows.length === 0) return null;
  return toSafeUser(rows[0]);
}
