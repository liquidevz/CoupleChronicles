import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import {
  users,
  couples,
  calendarEvents,
  photos,
  moods,
  workStatus,
  loveNotes,
  type User,
  type InsertUser,
  type Couple,
  type InsertCouple,
  type CalendarEvent,
  type InsertCalendarEvent,
  type Photo,
  type InsertPhoto,
  type Mood,
  type InsertMood,
  type WorkStatus,
  type InsertWorkStatus,
  type LoveNote,
  type InsertLoveNote,
} from "@shared/schema";

const connection = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const db = connection ? drizzle(connection) : null;

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;

  // Couples
  getCouple(id: string): Promise<Couple | undefined>;
  getCoupleByUserId(userId: string): Promise<Couple | undefined>;
  createCouple(couple: InsertCouple): Promise<Couple>;
  getCoupleWithUsers(coupleId: string): Promise<{ couple: Couple; partner1: User; partner2: User } | undefined>;

  // Calendar Events
  getCalendarEvents(coupleId: string): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: string, updates: Partial<InsertCalendarEvent>): Promise<CalendarEvent>;
  deleteCalendarEvent(id: string): Promise<void>;

  // Photos
  getPhotos(coupleId: string): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: string): Promise<void>;

  // Moods
  getUserMood(userId: string, date: Date): Promise<Mood | undefined>;
  createMood(mood: InsertMood): Promise<Mood>;
  updateMood(id: string, updates: Partial<InsertMood>): Promise<Mood>;

  // Work Status
  getUserWorkStatus(userId: string): Promise<WorkStatus | undefined>;
  createWorkStatus(status: InsertWorkStatus): Promise<WorkStatus>;
  updateWorkStatus(userId: string, updates: Partial<InsertWorkStatus>): Promise<WorkStatus>;

  // Love Notes
  getLoveNotes(coupleId: string): Promise<LoveNote[]>;
  createLoveNote(note: InsertLoveNote): Promise<LoveNote>;

  // Stats
  getCoupleStats(coupleId: string): Promise<{
    daysTogether: number;
    memoriesShared: number;
    datesPlanned: number;
    loveNotes: number;
  }>;
}

export class DbStorage implements IStorage {
  private checkConnection() {
    if (!db) {
      throw new Error('Database not connected. Please provide DATABASE_URL environment variable.');
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    this.checkConnection();
    const result = await db!.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    this.checkConnection();
    const result = await db!.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    this.checkConnection();
    const result = await db!.select().from(users).where(eq(users.googleId, googleId)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getCouple(id: string): Promise<Couple | undefined> {
    const result = await db.select().from(couples).where(eq(couples.id, id)).limit(1);
    return result[0];
  }

  async getCoupleByUserId(userId: string): Promise<Couple | undefined> {
    const result = await db
      .select()
      .from(couples)
      .where(
        and(
          sql`${couples.partner1Id} = ${userId} OR ${couples.partner2Id} = ${userId}`
        )
      )
      .limit(1);
    return result[0];
  }

  async createCouple(couple: InsertCouple): Promise<Couple> {
    const result = await db.insert(couples).values(couple).returning();
    return result[0];
  }

  async getCoupleWithUsers(coupleId: string): Promise<{ couple: Couple; partner1: User; partner2: User } | undefined> {
    const result = await db
      .select({
        couple: couples,
        partner1: users,
        partner2: users,
      })
      .from(couples)
      .leftJoin(users, eq(couples.partner1Id, users.id))
      .where(eq(couples.id, coupleId))
      .limit(1);

    if (!result[0]) return undefined;

    const partner2Result = await db
      .select()
      .from(users)
      .where(eq(users.id, result[0].couple.partner2Id))
      .limit(1);

    return {
      couple: result[0].couple,
      partner1: result[0].partner1!,
      partner2: partner2Result[0],
    };
  }

  async getCalendarEvents(coupleId: string): Promise<CalendarEvent[]> {
    return await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.coupleId, coupleId))
      .orderBy(desc(calendarEvents.date));
  }

  async createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent> {
    const result = await db.insert(calendarEvents).values(event).returning();
    return result[0];
  }

  async updateCalendarEvent(id: string, updates: Partial<InsertCalendarEvent>): Promise<CalendarEvent> {
    const result = await db.update(calendarEvents).set(updates).where(eq(calendarEvents.id, id)).returning();
    return result[0];
  }

  async deleteCalendarEvent(id: string): Promise<void> {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
  }

  async getPhotos(coupleId: string): Promise<Photo[]> {
    return await db
      .select()
      .from(photos)
      .where(eq(photos.coupleId, coupleId))
      .orderBy(desc(photos.createdAt));
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const result = await db.insert(photos).values(photo).returning();
    return result[0];
  }

  async deletePhoto(id: string): Promise<void> {
    await db.delete(photos).where(eq(photos.id, id));
  }

  async getUserMood(userId: string, date: Date): Promise<Mood | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db
      .select()
      .from(moods)
      .where(
        and(
          eq(moods.userId, userId),
          gte(moods.date, startOfDay),
          sql`${moods.date} <= ${endOfDay}`
        )
      )
      .limit(1);
    return result[0];
  }

  async createMood(mood: InsertMood): Promise<Mood> {
    const result = await db.insert(moods).values(mood).returning();
    return result[0];
  }

  async updateMood(id: string, updates: Partial<InsertMood>): Promise<Mood> {
    const result = await db.update(moods).set(updates).where(eq(moods.id, id)).returning();
    return result[0];
  }

  async getUserWorkStatus(userId: string): Promise<WorkStatus | undefined> {
    const result = await db
      .select()
      .from(workStatus)
      .where(eq(workStatus.userId, userId))
      .orderBy(desc(workStatus.updatedAt))
      .limit(1);
    return result[0];
  }

  async createWorkStatus(status: InsertWorkStatus): Promise<WorkStatus> {
    const result = await db.insert(workStatus).values(status).returning();
    return result[0];
  }

  async updateWorkStatus(userId: string, updates: Partial<InsertWorkStatus>): Promise<WorkStatus> {
    const existing = await this.getUserWorkStatus(userId);
    if (existing) {
      const result = await db
        .update(workStatus)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(workStatus.userId, userId))
        .returning();
      return result[0];
    } else {
      return this.createWorkStatus({ userId, ...updates } as InsertWorkStatus);
    }
  }

  async getLoveNotes(coupleId: string): Promise<LoveNote[]> {
    return await db
      .select()
      .from(loveNotes)
      .where(eq(loveNotes.coupleId, coupleId))
      .orderBy(desc(loveNotes.createdAt));
  }

  async createLoveNote(note: InsertLoveNote): Promise<LoveNote> {
    const result = await db.insert(loveNotes).values(note).returning();
    return result[0];
  }

  async getCoupleStats(coupleId: string): Promise<{
    daysTogether: number;
    memoriesShared: number;
    datesPlanned: number;
    loveNotes: number;
  }> {
    const couple = await this.getCouple(coupleId);
    const daysTogether = couple?.relationshipStart
      ? Math.floor((Date.now() - couple.relationshipStart.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const memoriesShared = (await this.getPhotos(coupleId)).length;
    const datesPlanned = (await this.getCalendarEvents(coupleId)).length;
    const loveNotesCount = (await this.getLoveNotes(coupleId)).length;

    return {
      daysTogether,
      memoriesShared,
      datesPlanned,
      loveNotes: loveNotesCount,
    };
  }
}

export const storage = new DbStorage();
