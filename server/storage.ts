import { type Quote, type InsertQuote, type Favorite, type InsertFavorite } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Quotes
  getQuotes(category?: string): Promise<Quote[]>;
  getQuoteById(id: string): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  
  // Favorites
  getFavorites(): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(quoteId: string): Promise<boolean>;
  isFavorite(quoteId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private quotes: Map<string, Quote>;
  private favorites: Map<string, Favorite>;

  constructor() {
    this.quotes = new Map();
    this.favorites = new Map();
    this.seedQuotes();
  }

  private seedQuotes() {
    const initialQuotes: InsertQuote[] = [
      {
        text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
        author: "Steve Jobs",
        category: "motivational"
      },
      {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
        category: "motivational"
      },
      {
        text: "The only true wisdom is in knowing you know nothing.",
        author: "Socrates",
        category: "wisdom"
      },
      {
        text: "I haven't failed. I've just found 10,000 ways that won't work.",
        author: "Thomas Edison",
        category: "funny"
      },
      {
        text: "Your limitation—it's only your imagination.",
        author: "Unknown",
        category: "success"
      },
      {
        text: "Life is what happens to you while you're busy making other plans.",
        author: "John Lennon",
        category: "life"
      },
      {
        text: "Be yourself; everyone else is already taken.",
        author: "Oscar Wilde",
        category: "wisdom"
      },
      {
        text: "The best way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
        category: "motivational"
      },
      {
        text: "Dream big and dare to fail.",
        author: "Norman Vaughan",
        category: "success"
      },
      {
        text: "Hard work beats talent when talent doesn't work hard.",
        author: "Tim Notke",
        category: "motivational"
      }
    ];

    initialQuotes.forEach(quote => {
      const id = randomUUID();
      const fullQuote: Quote = { ...quote, id, source: "builtin" };
      this.quotes.set(id, fullQuote);
    });
  }

  async getQuotes(category?: string): Promise<Quote[]> {
    const allQuotes = Array.from(this.quotes.values());
    if (category && category !== "all") {
      return allQuotes.filter(quote => quote.category === category);
    }
    return allQuotes;
  }

  async getQuoteById(id: string): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = randomUUID();
    const quote: Quote = { ...insertQuote, id, source: "api" };
    this.quotes.set(id, quote);
    return quote;
  }

  async getFavorites(): Promise<Favorite[]> {
    return Array.from(this.favorites.values());
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = randomUUID();
    const favorite: Favorite = { ...insertFavorite, id };
    this.favorites.set(insertFavorite.quoteId, favorite);
    return favorite;
  }

  async removeFavorite(quoteId: string): Promise<boolean> {
    return this.favorites.delete(quoteId);
  }

  async isFavorite(quoteId: string): Promise<boolean> {
    return this.favorites.has(quoteId);
  }
}

export const storage = new MemStorage();
