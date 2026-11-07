import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("Senior Designer"),
  department: text("department").notNull().default("Brand Design"),
  weeklyCapacityHours: integer("weekly_capacity_hours").notNull().default(40),
  hourlyRateCents: integer("hourly_rate_cents").notNull().default(18500),
  avatarColor: text("avatar_color").notNull().default("#4F46E5"),
  status: text("status").notNull().default("In Studio"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  clientName: text("client_name").notNull(),
  category: text("category").notNull().default("Brand Identity"),
  status: text("status").notNull().default("Active"),
  priority: text("priority").notNull().default("High"),
  budgetCents: integer("budget_cents").notNull().default(6500000),
  spentCents: integer("spent_cents").notNull().default(0),
  dueDate: text("due_date").notNull(),
  leadId: integer("lead_id").references(() => users.id, {
    onDelete: "set null",
  }),
  summary: text("summary").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  assigneeId: integer("assignee_id").references(() => users.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("In Progress"),
  priority: text("priority").notNull().default("Normal"),
  estimateHours: integer("estimate_hours").notNull().default(8),
  dueDate: text("due_date").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  memberId: integer("member_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  roleTitle: text("role_title").notNull(),
  allocationPercent: integer("allocation_percent").notNull().default(50),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  status: text("status").notNull().default("Confirmed"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectFiles = pgTable("project_files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull().unique(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull().default("application/octet-stream"),
  sizeBytes: integer("size_bytes").notNull().default(0),
  uploadedById: integer("uploaded_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserRecord = typeof users.$inferSelect;
export type SafeUser = Omit<UserRecord, "passwordHash">;
export type ProjectRecord = typeof projects.$inferSelect;
export type TaskRecord = typeof tasks.$inferSelect;
export type BookingRecord = typeof bookings.$inferSelect;
export type ProjectFileRecord = typeof projectFiles.$inferSelect;
