import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  googleId: text("google_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const couples = pgTable("couples", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  partner1Id: text("partner1_id").notNull().references(() => users.id),
  partner2Id: text("partner2_id").notNull().references(() => users.id),
  relationshipStart: timestamp("relationship_start"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: text("couple_id").notNull().references(() => couples.id),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // 'date', 'memory', 'anniversary'
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: text("couple_id").notNull().references(() => couples.id),
  url: text("url").notNull(),
  caption: text("caption"),
  uploadedBy: text("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const moods = pgTable("moods", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  emoji: text("emoji").notNull(),
  message: text("message"),
  date: timestamp("date").defaultNow().notNull(),
});

export const workStatus = pgTable("work_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id),
  status: text("status").notNull(), // 'available', 'busy', 'in-meeting', 'away'
  note: text("note"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const loveNotes = pgTable("love_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coupleId: text("couple_id").notNull().references(() => couples.id),
  fromUserId: text("from_user_id").notNull().references(() => users.id),
  toUserId: text("to_user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCoupleSchema = createInsertSchema(couples).omit({
  id: true,
  createdAt: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  createdAt: true,
});

export const insertMoodSchema = createInsertSchema(moods).omit({
  id: true,
});

export const insertWorkStatusSchema = createInsertSchema(workStatus).omit({
  id: true,
  updatedAt: true,
});

export const insertLoveNoteSchema = createInsertSchema(loveNotes).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Couple = typeof couples.$inferSelect;
export type InsertCouple = z.infer<typeof insertCoupleSchema>;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Mood = typeof moods.$inferSelect;
export type InsertMood = z.infer<typeof insertMoodSchema>;
export type WorkStatus = typeof workStatus.$inferSelect;
export type InsertWorkStatus = z.infer<typeof insertWorkStatusSchema>;
export type LoveNote = typeof loveNotes.$inferSelect;
export type InsertLoveNote = z.infer<typeof insertLoveNoteSchema>;
