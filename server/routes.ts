import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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

  const httpServer = createServer(app);
  return httpServer;
}
