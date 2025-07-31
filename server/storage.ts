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
      // Motivational
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
        text: "Your limitation—it's only your imagination.",
        author: "Unknown",
        category: "motivational"
      },
      {
        text: "Push yourself, because no one else is going to do it for you.",
        author: "Unknown",
        category: "motivational"
      },
      
      // Love & Romantic
      {
        text: "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.",
        author: "Lao Tzu",
        category: "love"
      },
      {
        text: "The best thing to hold onto in life is each other.",
        author: "Audrey Hepburn",
        category: "romantic"
      },
      {
        text: "Love is not about how many days, weeks or months you've been together, it's all about how much you love each other every day.",
        author: "Unknown",
        category: "romantic"
      },
      {
        text: "You know you're in love when you can't fall asleep because reality is finally better than your dreams.",
        author: "Dr. Seuss",
        category: "love"
      },

      // Hustle & Success
      {
        text: "The hustle brings the dollar. The experience brings the knowledge. The persistence brings success.",
        author: "Unknown",
        category: "hustle"
      },
      {
        text: "Work hard in silence, let your success be your noise.",
        author: "Frank Ocean",
        category: "hustle"
      },
      {
        text: "Success is walking from failure to failure with no loss of enthusiasm.",
        author: "Winston Churchill",
        category: "hustle"
      },
      {
        text: "Dream big and dare to fail.",
        author: "Norman Vaughan",
        category: "hustle"
      },

      // Wisdom
      {
        text: "The only true wisdom is in knowing you know nothing.",
        author: "Socrates",
        category: "wisdom"
      },
      {
        text: "Be yourself; everyone else is already taken.",
        author: "Oscar Wilde",
        category: "wisdom"
      },
      {
        text: "Yesterday is history, tomorrow is a mystery, today is a gift, that's why they call it the present.",
        author: "Eleanor Roosevelt",
        category: "wisdom"
      },
      {
        text: "The journey of a thousand miles begins with one step.",
        author: "Lao Tzu",
        category: "wisdom"
      },

      // Life
      {
        text: "Life is what happens to you while you're busy making other plans.",
        author: "John Lennon",
        category: "life"
      },
      {
        text: "Life is 10% what happens to you and 90% how you react to it.",
        author: "Charles R. Swindoll",
        category: "life"
      },
      {
        text: "The purpose of our lives is to be happy.",
        author: "Dalai Lama",
        category: "life"
      },
      {
        text: "Life is really simple, but we insist on making it complicated.",
        author: "Confucius",
        category: "life"
      },

      // Politics & Social
      {
        text: "The best way to find yourself is to lose yourself in the service of others.",
        author: "Mahatma Gandhi",
        category: "social"
      },
      {
        text: "Injustice anywhere is a threat to justice everywhere.",
        author: "Martin Luther King Jr.",
        category: "politics"
      },
      {
        text: "Be the change that you wish to see in the world.",
        author: "Mahatma Gandhi",
        category: "social"
      },
      {
        text: "The only thing necessary for the triumph of evil is for good men to do nothing.",
        author: "Edmund Burke",
        category: "politics"
      },
      {
        text: "In a gentle way, you can shake the world.",
        author: "Mahatma Gandhi",
        category: "social"
      },

      // Funny & Light
      {
        text: "I haven't failed. I've just found 10,000 ways that won't work.",
        author: "Thomas Edison",
        category: "funny"
      },
      {
        text: "The trouble with having an open mind, of course, is that people will insist on coming along and trying to put things in it.",
        author: "Terry Pratchett",
        category: "funny"
      },
      {
        text: "Age is an issue of mind over matter. If you don't mind, it doesn't matter.",
        author: "Mark Twain",
        category: "funny"
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
