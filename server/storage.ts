import { 
  type Quote, 
  type InsertQuote, 
  type Favorite, 
  type InsertFavorite, 
  type CheckIn, 
  type CheckinStreak, 
  type AirtimeReward, 
  type ButtonClick 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

// User Profile interface for the new system
interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  isNigerian: boolean;
  profileLocked: boolean;
  referralCode: string;
  totalReferrals: number;
  referralEarnings: number;
  createdAt: string;
  updatedAt: string;
}

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  validReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  recentReferrals: Array<{
    id: string;
    email: string;
    joinedAt: string;
    checkInDays: number;
    isValid: boolean;
    earnings: number;
  }>;
}

export interface IStorage {
  // Quotes
  getQuotes(category?: string): Promise<Quote[]>;
  getQuoteById(id: string): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  
  // Messages
  getMessages(category?: string): Promise<Message[]>;
  getMessageById(id: string): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Favorites
  getFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(userId: string, favorite: Omit<InsertFavorite, 'userId'>): Promise<Favorite>;
  removeFavorite(userId: string, quoteId: string): Promise<boolean>;
  isFavorite(userId: string, quoteId: string): Promise<boolean>;

  // Check-in operations
  getTodayCheckin(userId: string, date: string): Promise<CheckIn | null>;
  handleButtonClick(userId: string, date: string, buttonNumber: number): Promise<any>;
  getUserStreak(userId: string): Promise<CheckinStreak | null>;
  getUserRewards(userId: string): Promise<AirtimeReward[]>;
  
  // New profile and referral methods
  getUserProfile(userId: string): Promise<UserProfile | null>;
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile>;
  getCheckinStats(userId: string): Promise<any>;
  getRewards(userId: string): Promise<any[]>;
  redeemRewards(userId: string): Promise<any>;
  getReferralStats(userId: string): Promise<ReferralStats>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
    this.seedQuotes();
  }

  private async seedQuotes() {
    try {
      // Check if quotes already exist
      const existingQuotes = await this.getQuotes();
      if (existingQuotes.length > 0) return;

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
        
        // Hustle
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
          text: "Life is really simple, but we insist on making it complicated.",
          author: "Confucius",
          category: "life"
        },
        
        // Social
        {
          text: "The best way to find yourself is to lose yourself in the service of others.",
          author: "Mahatma Gandhi",
          category: "social"
        },
        {
          text: "Be the change that you wish to see in the world.",
          author: "Mahatma Gandhi",
          category: "social"
        },
        
        // Politics
        {
          text: "Injustice anywhere is a threat to justice everywhere.",
          author: "Martin Luther King Jr.",
          category: "politics"
        },
        {
          text: "The only thing necessary for the triumph of evil is for good men to do nothing.",
          author: "Edmund Burke",
          category: "politics"
        },
        
        // Funny
        {
          text: "I haven't failed. I've just found 10,000 ways that won't work.",
          author: "Thomas Edison",
          category: "funny"
        },
        {
          text: "Age is an issue of mind over matter. If you don't mind, it doesn't matter.",
          author: "Mark Twain",
          category: "funny"
        }
      ];

      // Insert quotes in batch
      for (const quote of initialQuotes) {
        await this.createQuote(quote);
      }
    } catch (error) {
      console.error("Error seeding quotes:", error);
    }
  }

  // Quote methods - using in-memory for now since Supabase tables aren't set up yet
  private quotes: Map<string, Quote> = new Map();
  private favorites: Map<string, Favorite> = new Map();
  private checkins: Map<string, CheckIn> = new Map();
  private streaks: Map<string, CheckinStreak> = new Map();
  private rewards: Map<string, AirtimeReward> = new Map();

  async getQuotes(category?: string): Promise<Quote[]> {
    let allQuotes = Array.from(this.quotes.values());
    
    if (category) {
      allQuotes = allQuotes.filter(quote => 
        quote.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    return allQuotes;
  }

  async getQuoteById(id: string): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const id = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newQuote: Quote = {
      id,
      ...quote,
      source: quote.source || 'builtin'
    };
    
    this.quotes.set(id, newQuote);
    return newQuote;
  }

  async getFavorites(userId: string): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(fav => fav.userId === userId);
  }

  async addFavorite(userId: string, favorite: Omit<InsertFavorite, 'userId'>): Promise<Favorite> {
    const id = `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newFavorite: Favorite = {
      id,
      userId,
      ...favorite,
      createdAt: new Date().toISOString()
    };
    
    this.favorites.set(id, newFavorite);
    return newFavorite;
  }

  async removeFavorite(userId: string, quoteId: string): Promise<boolean> {
    const favorites = Array.from(this.favorites.entries());
    const favoriteToRemove = favorites.find(([_, fav]) => 
      fav.userId === userId && fav.quoteId === quoteId
    );
    
    if (favoriteToRemove) {
      this.favorites.delete(favoriteToRemove[0]);
      return true;
    }
    
    return false;
  }

  async isFavorite(userId: string, quoteId: string): Promise<boolean> {
    const userFavorites = await this.getFavorites(userId);
    return userFavorites.some(fav => fav.quoteId === quoteId);
  }

  async getTodayCheckin(userId: string, date: string): Promise<CheckIn | null> {
    const checkin = Array.from(this.checkins.values()).find(
      c => c.userId === userId && c.date === date
    );
    return checkin || null;
  }

  async handleButtonClick(userId: string, date: string, buttonNumber: number): Promise<any> {
    const checkinKey = `${userId}_${date}`;
    let checkin = this.checkins.get(checkinKey);
    
    if (!checkin) {
      checkin = {
        id: `checkin_${Date.now()}`,
        userId,
        date,
        buttonClicks: [],
        clickCount: 0,
        completed: false,
        adsShown: 0,
        createdAt: new Date().toISOString()
      };
    }

    const now = new Date().toISOString();
    const buttonClick: ButtonClick = {
      buttonNumber,
      clickedAt: now,
      cooldownUntil: new Date(Date.now() + 60000).toISOString() // 1 minute cooldown
    };

    checkin.buttonClicks = [...(checkin.buttonClicks || []), buttonClick];
    checkin.clickCount = (checkin.clickCount || 0) + 1;
    checkin.adsShown = (checkin.adsShown || 0) + 1;
    checkin.lastClickAt = now;
    
    if (checkin.clickCount >= 10) {
      checkin.completed = true;
      checkin.completedAt = now;
      
      // Update or create streak
      await this.updateStreak(userId, date);
    }

    this.checkins.set(checkinKey, checkin);
    return { checkin };
  }

  private async updateStreak(userId: string, date: string): Promise<void> {
    let streak = this.streaks.get(userId);
    const currentDate = new Date(date);
    
    if (!streak) {
      streak = {
        id: `streak_${userId}`,
        userId,
        currentStreak: 1,
        longestStreak: 1,
        totalDays: 1,
        lastCheckinDate: date,
        updatedAt: new Date().toISOString()
      };
    } else {
      const lastDate = streak.lastCheckinDate ? new Date(streak.lastCheckinDate) : null;
      const daysDiff = lastDate ? Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      if (daysDiff === 1) {
        // Consecutive day
        streak.currentStreak += 1;
        streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
      } else if (daysDiff > 1) {
        // Streak broken
        streak.currentStreak = 1;
      }
      // If daysDiff === 0, it's the same day, no change needed
      
      streak.totalDays += 1;
      streak.lastCheckinDate = date;
      streak.updatedAt = new Date().toISOString();
    }

    this.streaks.set(userId, streak);

    // Check for reward generation
    if (streak.currentStreak === 30) {
      await this.generateReward(userId, 500, 'checkin', '30-day check-in streak reward');
    }
  }

  private async generateReward(userId: string, amount: number, type: string, description: string): Promise<void> {
    const rewardId = `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reward: AirtimeReward = {
      id: rewardId,
      userId,
      amount,
      phone: '', // Will be filled when user redeems
      status: 'pending',
      checkInCount: type === 'checkin' ? 30 : undefined,
      createdAt: new Date().toISOString()
    };

    const userRewards = this.rewards.get(userId) || [];
    userRewards.push(reward);
    this.rewards.set(userId, userRewards);
  }

  async getUserStreak(userId: string): Promise<CheckinStreak | null> {
    return this.streaks.get(userId) || null;
  }

  async getUserRewards(userId: string): Promise<AirtimeReward[]> {
    return this.rewards.get(userId) || [];
  }

  // New methods for profile and referral system
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    // Mock profile data for now
    return {
      id: userId,
      email: `user${userId}@example.com`,
      fullName: undefined,
      phone: undefined,
      isNigerian: true,
      profileLocked: false,
      referralCode: `BOOM${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      totalReferrals: 0,
      referralEarnings: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const existingProfile = await this.getUserProfile(userId);
    const updatedProfile = {
      ...existingProfile!,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return updatedProfile;
  }

  async getCheckinStats(userId: string): Promise<any> {
    const streak = await this.getUserStreak(userId);
    const today = new Date().toISOString().split('T')[0];
    const todayCheckin = await this.getTodayCheckin(userId, today);
    
    return {
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      totalCheckins: streak?.totalDays || 0,
      canCompleteToday: !todayCheckin?.completed,
      nextRewardAt: 30
    };
  }

  async getRewards(userId: string): Promise<any[]> {
    const rewards = await this.getUserRewards(userId);
    return rewards.map(reward => ({
      id: reward.id,
      amount: reward.amount,
      type: 'checkin',
      status: reward.status,
      createdAt: reward.createdAt,
      description: reward.checkInCount ? `${reward.checkInCount}-day check-in reward` : 'Reward'
    }));
  }

  async redeemRewards(userId: string): Promise<any> {
    // Mock redemption
    return { success: true, message: 'Airtime sent to your phone number' };
  }

  async getReferralStats(userId: string): Promise<ReferralStats> {
    const profile = await this.getUserProfile(userId);
    return {
      referralCode: profile?.referralCode || 'BOOM000000',
      totalReferrals: 0,
      validReferrals: 0,
      pendingReferrals: 0,
      totalEarnings: 0,
      recentReferrals: []
    };
  }
}

export const storage = new DatabaseStorage();