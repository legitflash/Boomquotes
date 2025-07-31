// Simple in-memory storage for quotes and message favorites
import type { Quote, InsertQuote } from "@shared/schema";

export class SimpleStorage {
  private quotes: Quote[] = [];
  private favorites: Quote[] = [];
  private messageFavorites: any[] = [];

  constructor() {
    this.seedQuotes();
  }

  // Quote methods
  getQuotes(): Quote[] {
    return this.quotes;
  }

  createQuote(quote: InsertQuote): Quote {
    const newQuote: Quote = {
      id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: quote.text,
      author: quote.author,
      category: quote.category,
      source: quote.source || 'builtin'
    };
    
    this.quotes.push(newQuote);
    return newQuote;
  }

  // Favorite methods (quotes)
  getFavorites(): Quote[] {
    return this.favorites;
  }

  addFavorite(quote: Quote): void {
    const exists = this.favorites.find(fav => fav.id === quote.id);
    if (!exists) {
      this.favorites.push(quote);
    }
  }

  removeFavorite(quoteId: string): boolean {
    const index = this.favorites.findIndex(fav => fav.id === quoteId);
    if (index !== -1) {
      this.favorites.splice(index, 1);
      return true;
    }
    return false;
  }

  isFavorite(quoteId: string): boolean {
    return this.favorites.some(fav => fav.id === quoteId);
  }

  // Message favorite methods
  getMessageFavorites(): any[] {
    return this.messageFavorites;
  }

  addMessageFavorite(message: any): void {
    const exists = this.messageFavorites.find(fav => fav.id === message.id);
    if (!exists) {
      this.messageFavorites.push(message);
    }
  }

  removeMessageFavorite(messageId: string): void {
    const index = this.messageFavorites.findIndex(fav => fav.id === messageId);
    if (index !== -1) {
      this.messageFavorites.splice(index, 1);
    }
  }

  isMessageFavorite(messageId: string): boolean {
    return this.messageFavorites.some(fav => fav.id === messageId);
  }

  private seedQuotes(): void {
    const initialQuotes = [
      // Motivation
      {
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "motivation"
      },
      {
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
        category: "motivation"
      },
      {
        text: "Don't watch the clock; do what it does. Keep going.",
        author: "Sam Levenson",
        category: "motivation"
      },
      
      // Love
      {
        text: "Love is not about how much you say 'I love you', but how much you prove that it's true.",
        author: "Anonymous",
        category: "love"
      },
      {
        text: "The best thing to hold onto in life is each other.",
        author: "Audrey Hepburn",
        category: "love"
      },
      
      // Hustle/Success
      {
        text: "Success is walking from failure to failure with no loss of enthusiasm.",
        author: "Winston Churchill",
        category: "hustle"
      },
      {
        text: "The way to get started is to quit talking and begin doing.",
        author: "Walt Disney",
        category: "hustle"
      },
      
      // Wisdom
      {
        text: "The only true wisdom is in knowing you know nothing.",
        author: "Socrates",
        category: "wisdom"
      },
      {
        text: "Yesterday is history, tomorrow is a mystery, today is a gift, that's why they call it the present.",
        author: "Eleanor Roosevelt",
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
      }
    ];

    initialQuotes.forEach(quote => this.createQuote(quote));
  }
}

export const storage = new SimpleStorage();