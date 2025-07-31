import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, jsonb, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"), // For Nigerian users
  country: text("country").default("NG"), // Nigeria by default
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
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
  userId: integer("user_id").references(() => users.id),
  quoteId: text("quote_id").notNull(),
  quoteData: jsonb("quote_data").notNull(), // Store the full quote object
});

// Daily check-ins table
export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  clickCount: integer("click_count").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Airtime rewards table
export const airtimeRewards = pgTable("airtime_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(), // 500 Naira
  phone: text("phone").notNull(),
  status: text("status").default("pending"), // pending, sent, failed
  checkInCount: integer("check_in_count").notNull(), // 30 check-ins
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(favorites),
  checkIns: many(checkIns),
  airtimeRewards: many(airtimeRewards),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  user: one(users, { fields: [checkIns.userId], references: [users.id] }),
}));

export const airtimeRewardsRelations = relations(airtimeRewards, ({ one }) => ({
  user: one(users, { fields: [airtimeRewards.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
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

export const insertAirtimeRewardSchema = createInsertSchema(airtimeRewards).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
export type AirtimeReward = typeof airtimeRewards.$inferSelect;
export type InsertAirtimeReward = z.infer<typeof insertAirtimeRewardSchema>;

// API Quote interface for external quotes
export interface ApiQuote {
  _id: string;
  content: string;
  author: string;
  tags: string[];
}
