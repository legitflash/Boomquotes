import { type Quote, type InsertQuote, type Favorite, type InsertFavorite, type CheckIn, type CheckinStreak, type AirtimeReward, type ButtonClick } from "@shared/schema";
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

  // Check-in operations
  getTodayCheckin(userId: string, date: string): Promise<CheckIn | null>;
  handleButtonClick(userId: string, date: string, buttonNumber: number): Promise<any>;
  getUserStreak(userId: string): Promise<CheckinStreak | null>;
  getUserRewards(userId: string): Promise<AirtimeReward[]>;
}

export class MemStorage implements IStorage {
  private quotes: Map<string, Quote>;
  private favorites: Map<string, Favorite>;
  private checkins: Map<string, CheckIn>;
  private streaks: Map<string, CheckinStreak>;
  private rewards: Map<string, AirtimeReward>;

  constructor() {
    this.quotes = new Map();
    this.favorites = new Map();
    this.checkins = new Map();
    this.streaks = new Map();
    this.rewards = new Map();
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

  // Check-in operations
  async getTodayCheckin(userId: string, date: string): Promise<CheckIn | null> {
    const checkinKey = `${userId}-${date}`;
    return this.checkins.get(checkinKey) || null;
  }

  async handleButtonClick(userId: string, date: string, buttonNumber: number): Promise<any> {
    const checkinKey = `${userId}-${date}`;
    const now = new Date();
    const cooldownUntil = new Date(now.getTime() + 60 * 1000); // 1 minute cooldown

    // Get or create today's check-in
    let checkin = this.checkins.get(checkinKey);
    if (!checkin) {
      checkin = {
        id: randomUUID(),
        userId,
        date,
        buttonClicks: [],
        clickCount: 0,
        completed: false,
        completedAt: null,
        adsShown: 0,
        lastClickAt: null,
        createdAt: now
      };
    }

    // Check if button already clicked
    const buttonClicks = (checkin.buttonClicks as ButtonClick[]) || [];
    const alreadyClicked = buttonClicks.find(click => click.buttonNumber === buttonNumber);
    
    if (alreadyClicked) {
      // Check cooldown
      const cooldownEnd = new Date(alreadyClicked.cooldownUntil);
      if (now < cooldownEnd) {
        throw new Error(`Button ${buttonNumber} is on cooldown for ${Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000)} seconds`);
      }
    }

    // Add button click
    const newClick: ButtonClick = {
      buttonNumber,
      clickedAt: now.toISOString(),
      adShown: true,
      cooldownUntil: cooldownUntil.toISOString()
    };

    if (alreadyClicked) {
      // Update existing click
      const index = buttonClicks.findIndex(click => click.buttonNumber === buttonNumber);
      buttonClicks[index] = newClick;
    } else {
      // Add new click
      buttonClicks.push(newClick);
      checkin.clickCount = (checkin.clickCount || 0) + 1;
    }

    checkin.buttonClicks = buttonClicks;
    checkin.adsShown = (checkin.adsShown || 0) + 1;
    checkin.lastClickAt = now;

    // Check if completed (all 10 buttons clicked)
    if (checkin.clickCount >= 10 && !checkin.completed) {
      checkin.completed = true;
      checkin.completedAt = now;
      
      // Update streak
      await this.updateStreak(userId, date);
    }

    this.checkins.set(checkinKey, checkin);

    return {
      checkin,
      buttonClick: newClick,
      completed: checkin.completed,
      streak: await this.getUserStreak(userId)
    };
  }

  async getUserStreak(userId: string): Promise<CheckinStreak | null> {
    return this.streaks.get(userId) || {
      id: randomUUID(),
      userId,
      currentStreak: 0,
      longestStreak: 0,
      lastCheckinDate: null,
      totalDays: 0,
      updatedAt: new Date()
    };
  }

  async getUserRewards(userId: string): Promise<AirtimeReward[]> {
    return Array.from(this.rewards.values()).filter(reward => reward.userId === userId);
  }

  private async updateStreak(userId: string, date: string): Promise<void> {
    let streak = this.streaks.get(userId);
    if (!streak) {
      streak = {
        id: randomUUID(),
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckinDate: null,
        totalDays: 0,
        updatedAt: new Date()
      };
    }

    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streak.lastCheckinDate === yesterdayStr) {
      // Consecutive day
      streak.currentStreak++;
    } else if (streak.lastCheckinDate === date) {
      // Same day, don't increment
      return;
    } else {
      // Reset streak
      streak.currentStreak = 1;
    }

    streak.lastCheckinDate = date;
    streak.totalDays++;
    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
    streak.updatedAt = new Date();

    // Check for 30-day reward
    if (streak.currentStreak === 30) {
      const reward: AirtimeReward = {
        id: randomUUID(),
        userId,
        amount: 500, // ₦500
        phone: '', // Would be filled from user profile
        status: 'pending',
        checkInCount: 30,
        createdAt: new Date()
      };
      this.rewards.set(reward.id, reward);
    }

    this.streaks.set(userId, streak);
  }
}

export const storage = new MemStorage();
