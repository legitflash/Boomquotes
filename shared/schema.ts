import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, jsonb, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profiles table (extends Supabase auth.users)
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey(), // References auth.users.id from Supabase
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(), // Required - can only be edited once
  phoneEditedAt: timestamp("phone_edited_at"), // Track when phone was last edited
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // 'male', 'female', 'other'
  country: text("country").notNull(), // Required country code
  address: text("address").notNull(), // Required full address
  referralCode: text("referral_code").notNull(),
  inviteCode: text("invite_code"), // Optional invite code used during signup
  totalReferrals: integer("total_referrals").default(0),
  referralEarnings: integer("referral_earnings").default(0),
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

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  source: text("source").default("builtin"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
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
  amount: integer("amount").notNull(), // Amount in local currency
  phone: text("phone").notNull(),
  country: text("country").notNull(), // Country code for Reloadly
  operatorId: text("operator_id"), // Reloadly operator ID
  status: text("status").default("pending"), // pending, processing, success, failed
  checkInCount: integer("check_in_count").notNull(), // 30 check-ins required
  transactionId: text("transaction_id"), // Reloadly transaction ID
  failureReason: text("failure_reason"), // Error message if failed
  processedAt: timestamp("processed_at"), // When payout was completed
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Payout history table for tracking all reward transactions
export const payoutHistory = pgTable("payout_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => userProfiles.id).notNull(),
  rewardId: varchar("reward_id").references(() => airtimeRewards.id),
  amount: integer("amount").notNull(),
  currency: text("currency").default("USD"), // USD for global compatibility
  localAmount: integer("local_amount"), // Amount in local currency
  localCurrency: text("local_currency"), // Local currency code
  phone: text("phone").notNull(),
  country: text("country").notNull(),
  operatorName: text("operator_name"),
  status: text("status").notNull(), // pending, processing, success, failed
  transactionId: text("transaction_id"),
  failureReason: text("failure_reason"),
  retryCount: integer("retry_count").default(0),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Referral system table
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: uuid("referrer_id").references(() => userProfiles.id).notNull(),
  refereeId: uuid("referee_id").references(() => userProfiles.id),
  referralCode: text("referral_code").notNull(),
  email: text("email"), // Email of person who signed up
  status: text("status").default("pending"), // pending, completed, invalid
  bonusAwarded: boolean("bonus_awarded").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  favorites: many(favorites),
  checkIns: many(checkIns),
  airtimeRewards: many(airtimeRewards),
  checkinStreak: many(checkinStreaks),
  payoutHistory: many(payoutHistory),
  referrals: many(referrals),
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

export const airtimeRewardsRelations = relations(airtimeRewards, ({ one, many }) => ({
  user: one(userProfiles, { fields: [airtimeRewards.userId], references: [userProfiles.id] }),
  payouts: many(payoutHistory),
}));

export const payoutHistoryRelations = relations(payoutHistory, ({ one }) => ({
  user: one(userProfiles, { fields: [payoutHistory.userId], references: [userProfiles.id] }),
  reward: one(airtimeRewards, { fields: [payoutHistory.rewardId], references: [airtimeRewards.id] }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(userProfiles, { fields: [referrals.referrerId], references: [userProfiles.id] }),
  referee: one(userProfiles, { fields: [referrals.refereeId], references: [userProfiles.id] }),
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

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).omit({
  id: true,
  createdAt: true,
});

// Additional interfaces for button clicks and payout tracking
export interface ButtonClick {
  buttonNumber: number;
  timestamp: string;
  cooldownUntil: string;
}

export interface PayoutHistory {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  localAmount?: number;
  localCurrency?: string;
  phone: string;
  country: string;
  operatorId?: string;
  operatorName?: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  transactionId?: string;
  failureReason?: string;
  retryCount: number;
  processedAt?: string;
  createdAt: string;
}

export interface InsertPayoutHistory {
  userId: string;
  amount: number;
  currency?: string;
  localAmount?: number;
  localCurrency?: string;
  phone: string;
  country: string;
  operatorId?: string;
  operatorName?: string;
  status?: 'pending' | 'processing' | 'success' | 'failed';
  retryCount?: number;
}

// Types for TypeScript
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;
export type CheckIn = typeof checkIns.$inferSelect;
export type CheckinStreak = typeof checkinStreaks.$inferSelect;
export type AirtimeReward = typeof airtimeRewards.$inferSelect;

export const insertCheckinStreakSchema = createInsertSchema(checkinStreaks).omit({
  id: true,
  updatedAt: true,
});

export const insertAirtimeRewardSchema = createInsertSchema(airtimeRewards).omit({
  id: true,
  createdAt: true,
});

export const insertPayoutHistorySchema = createInsertSchema(payoutHistory).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

// Types
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type CheckinStreak = typeof checkinStreaks.$inferSelect;
export type InsertCheckinStreak = z.infer<typeof insertCheckinStreakSchema>;
export type AirtimeReward = typeof airtimeRewards.$inferSelect;
export type InsertAirtimeReward = z.infer<typeof insertAirtimeRewardSchema>;
export type PayoutHistory = typeof payoutHistory.$inferSelect;
export type InsertPayoutHistory = z.infer<typeof insertPayoutHistorySchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

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
