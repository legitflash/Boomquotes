import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, jsonb, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profiles table (extends Supabase auth.users)
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey(), // References auth.users.id from Supabase
  email: text("email").notNull(),
  phone: text("phone"), // Required for Nigerian users for airtime
  country: text("country").default("NG"), // Nigeria by default
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  source: text("source").default("builtin"), // "api" or "builtin"
});

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => userProfiles.id),
  quoteId: text("quote_id").notNull(),
  quoteData: jsonb("quote_data").notNull(), // Store the full quote object
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Daily check-ins table - Updated for 10-button system
export const checkIns = pgTable("check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => userProfiles.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  buttonClicks: jsonb("button_clicks").default(sql`'[]'::jsonb`), // Array of ButtonClick objects
  clickCount: integer("click_count").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  adsShown: integer("ads_shown").default(0),
  lastClickAt: timestamp("last_click_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Check-in streaks table for tracking consecutive days
export const checkinStreaks = pgTable("checkin_streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => userProfiles.id).notNull().unique(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastCheckinDate: text("last_checkin_date"), // YYYY-MM-DD format
  totalDays: integer("total_days").default(0),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Airtime rewards table
export const airtimeRewards = pgTable("airtime_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => userProfiles.id).notNull(),
  amount: integer("amount").notNull(), // 500 Naira
  phone: text("phone").notNull(),
  status: text("status").default("pending"), // pending, sent, failed
  checkInCount: integer("check_in_count").notNull(), // 30 check-ins
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  favorites: many(favorites),
  checkIns: many(checkIns),
  airtimeRewards: many(airtimeRewards),
  checkinStreak: many(checkinStreaks),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(userProfiles, { fields: [favorites.userId], references: [userProfiles.id] }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  user: one(userProfiles, { fields: [checkIns.userId], references: [userProfiles.id] }),
}));

export const checkinStreaksRelations = relations(checkinStreaks, ({ one }) => ({
  user: one(userProfiles, { fields: [checkinStreaks.userId], references: [userProfiles.id] }),
}));

export const airtimeRewardsRelations = relations(airtimeRewards, ({ one }) => ({
  user: one(userProfiles, { fields: [airtimeRewards.userId], references: [userProfiles.id] }),
}));

// Insert schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  source: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).omit({
  id: true,
  createdAt: true,
});

export const insertCheckinStreakSchema = createInsertSchema(checkinStreaks).omit({
  id: true,
  updatedAt: true,
});

export const insertAirtimeRewardSchema = createInsertSchema(airtimeRewards).omit({
  id: true,
  createdAt: true,
});

// Types
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type CheckinStreak = typeof checkinStreaks.$inferSelect;
export type InsertCheckinStreak = z.infer<typeof insertCheckinStreakSchema>;
export type AirtimeReward = typeof airtimeRewards.$inferSelect;
export type InsertAirtimeReward = z.infer<typeof insertAirtimeRewardSchema>;

// API Quote interface for external quotes
export interface ApiQuote {
  _id: string;
  content: string;
  author: string;
  tags: string[];
}

// Button click interface for check-in system
export interface ButtonClick {
  buttonNumber: number; // 1-10
  clickedAt: string; // ISO timestamp
  adShown: boolean;
  cooldownUntil: string; // ISO timestamp (clickedAt + 1 minute)
}
