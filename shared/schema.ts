import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(),
  source: text("source").default("builtin"), // "api" or "builtin"
});

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteId: text("quote_id").notNull(),
  quoteData: jsonb("quote_data").notNull(), // Store the full quote object
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  source: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
});

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// API Quote interface for external quotes
export interface ApiQuote {
  _id: string;
  content: string;
  author: string;
  tags: string[];
}
