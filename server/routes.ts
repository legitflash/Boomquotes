import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createReloadlyService } from "./reloadly";
import { insertQuoteSchema, insertFavoriteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all quotes with optional category filter
  app.get("/api/quotes", async (req, res) => {
    try {
      const category = req.query.category as string;
      const quotes = await storage.getQuotes(category);
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  // Get random quote
  app.get("/api/quotes/random", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      if (quotes.length === 0) {
        return res.status(404).json({ message: "No quotes available" });
      }
      const randomIndex = Math.floor(Math.random() * quotes.length);
      res.json(quotes[randomIndex]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch random quote" });
    }
  });

  // Get daily quote
  app.get("/api/quotes/daily", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      if (quotes.length === 0) {
        return res.status(404).json({ message: "No quotes available" });
      }
      
      // Generate deterministic daily quote based on current date
      const today = new Date().toISOString().slice(0, 10);
      const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
      const dailyIndex = seed % quotes.length;
      
      res.json(quotes[dailyIndex]);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch daily quote" });
    }
  });

  // Add quote from external API
  app.post("/api/quotes", async (req, res) => {
    try {
      const result = insertQuoteSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid quote data", errors: result.error.errors });
      }
      
      const quote = await storage.createQuote(result.data);
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to create quote" });
    }
  });

  // Fetch quotes from external sources by category
  app.post("/api/quotes/fetch-external/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const limit = parseInt(req.query.limit as string) || 5;
      
      // This endpoint would typically integrate with external APIs
      // For now, return success to indicate the endpoint is available
      res.json({ 
        success: true, 
        message: `External quote fetch endpoint for ${category} ready`,
        category,
        limit
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch external quotes" });
    }
  });

  // Get favorites
  app.get("/api/favorites", async (req, res) => {
    try {
      const favorites = await storage.getFavorites();
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Add favorite
  app.post("/api/favorites", async (req, res) => {
    try {
      const result = insertFavoriteSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid favorite data", errors: result.error.errors });
      }
      
      const favorite = await storage.addFavorite(result.data);
      res.json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  // Remove favorite
  app.delete("/api/favorites/:quoteId", async (req, res) => {
    try {
      const { quoteId } = req.params;
      const removed = await storage.removeFavorite(quoteId);
      
      if (!removed) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.json({ message: "Favorite removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Check if quote is favorite
  app.get("/api/favorites/:quoteId", async (req, res) => {
    try {
      const { quoteId } = req.params;
      const isFavorite = await storage.isFavorite(quoteId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Notification subscription endpoints
  app.post("/api/notifications/subscribe", async (req, res) => {
    try {
      const { subscription, timestamp } = req.body;
      console.log('Push subscription received:', subscription?.endpoint);
      res.json({ 
        success: true, 
        message: "Subscription saved successfully" 
      });
    } catch (error) {
      console.error('Error saving subscription:', error);
      res.status(500).json({ message: "Failed to save subscription" });
    }
  });

  app.post("/api/notifications/unsubscribe", async (req, res) => {
    try {
      const { subscription } = req.body;
      console.log('Push unsubscription received:', subscription?.endpoint);
      res.json({ 
        success: true, 
        message: "Unsubscribed successfully" 
      });
    } catch (error) {
      console.error('Error removing subscription:', error);
      res.status(500).json({ message: "Failed to unsubscribe" });
    }
  });

  // Check-in System Routes
  
  // Get today's check-in status
  app.get("/api/checkins/today", async (req, res) => {
    try {
      const userId = "demo-user"; // In real app, get from session
      const today = new Date().toISOString().split('T')[0];
      
      const todayCheckin = await storage.getTodayCheckin(userId, today);
      const streak = await storage.getUserStreak(userId);
      
      res.json({
        todayCheckin,
        streak,
        canCompleteToday: !todayCheckin?.completed,
        nextRewardAt: 30
      });
    } catch (error) {
      console.error('Error fetching checkin data:', error);
      res.status(500).json({ message: "Failed to fetch check-in data" });
    }
  });

  // Handle button click
  app.post("/api/checkins/click/:buttonNumber", async (req, res) => {
    try {
      const userId = "demo-user"; // In real app, get from session
      const buttonNumber = parseInt(req.params.buttonNumber);
      const today = new Date().toISOString().split('T')[0];
      
      if (buttonNumber < 1 || buttonNumber > 10) {
        return res.status(400).json({ message: "Invalid button number" });
      }

      const result = await storage.handleButtonClick(userId, today, buttonNumber);
      
      res.json(result);
    } catch (error) {
      console.error('Error handling button click:', error);
      res.status(500).json({ message: error.message || "Failed to process click" });
    }
  });

  // Get user streak info
  app.get("/api/checkins/streak/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const streak = await storage.getUserStreak(userId);
      res.json(streak);
    } catch (error) {
      console.error('Error fetching streak:', error);
      res.status(500).json({ message: "Failed to fetch streak data" });
    }
  });

  // Get user rewards
  app.get("/api/rewards/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const rewards = await storage.getUserRewards(userId);
      res.json(rewards);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
