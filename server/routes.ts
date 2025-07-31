import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./simple-storage";
import { createReloadlyService } from "./reloadly";
import { insertQuoteSchema, insertFavoriteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all quotes with optional category filter
  app.get("/api/quotes", (req, res) => {
    try {
      const quotes = storage.getQuotes();
      const category = req.query.category as string;
      
      if (category) {
        const filteredQuotes = quotes.filter(quote => 
          quote.category.toLowerCase() === category.toLowerCase()
        );
        res.json(filteredQuotes);
      } else {
        res.json(quotes);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  // Get random quote
  app.get("/api/quotes/random", (req, res) => {
    try {
      const quotes = storage.getQuotes();
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
  app.get("/api/quotes/daily", (req, res) => {
    try {
      const quotes = storage.getQuotes();
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

  // Refresh daily quote endpoint
  app.post("/api/quotes/daily/refresh", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      if (quotes.length === 0) {
        return res.status(404).json({ message: "No quotes available" });
      }
      
      const randomIndex = Math.floor(Math.random() * quotes.length);
      res.json(quotes[randomIndex]);
    } catch (error) {
      res.status(500).json({ message: "Failed to refresh daily quote" });
    }
  });

  // MESSAGE ENDPOINTS
  
  // Get all messages
  app.get("/api/messages/all", async (req, res) => {
    try {
      const { getAllMessages } = await import("../messages_comprehensive.js");
      const allMessages = getAllMessages();
      const messagesWithIds = allMessages.map((messageText, index) => ({
        id: `message_${Date.now()}_all_${Math.random().toString(36).substr(2, 9)}`,
        text: messageText,
        category: 'all'
      }));
      res.json(messagesWithIds);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get random message (must come before category route)
  app.get("/api/messages/random", async (req, res) => {
    try {
      const { category } = req.query;
      const { getRandomMessage, getAllMessages } = await import("../messages_comprehensive.js");
      
      let randomMessage;
      if (category && category !== 'all') {
        randomMessage = getRandomMessage(category);
      } else {
        // Get random from all messages
        const allMessages = getAllMessages();
        if (allMessages.length > 0) {
          const randomIndex = Math.floor(Math.random() * allMessages.length);
          randomMessage = {
            id: `message_${Date.now()}_random_${Math.random().toString(36).substr(2, 9)}`,
            text: allMessages[randomIndex],
            category: 'random'
          };
        }
      }
      
      if (!randomMessage) {
        return res.status(404).json({ message: "No messages available" });
      }
      
      res.json(randomMessage);
    } catch (error) {
      console.error("Error fetching random message:", error);
      res.status(500).json({ message: "Failed to fetch random message" });
    }
  });

  // Get messages by category
  app.get("/api/messages/:category", async (req, res) => {
    try {
      const { category } = req.params;
      
      // Handle special endpoints that shouldn't be treated as categories
      if (category === 'all' || category === 'daily' || category === 'categories') {
        return res.status(400).json({ message: "Invalid category endpoint" });
      }
      
      const { getCategoryMessages } = await import("../messages_comprehensive.js");
      const messages = getCategoryMessages(category);
      
      if (messages.length === 0) {
        return res.status(404).json({ message: "Category not found or no messages available" });
      }
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching category messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get random message
  app.get("/api/messages/random", async (req, res) => {
    try {
      const { category } = req.query;
      const { getRandomMessage, getAllMessages } = await import("../messages_comprehensive.js");
      
      let randomMessage;
      if (category && category !== 'all') {
        randomMessage = getRandomMessage(category);
      } else {
        // Get random from all messages
        const allMessages = getAllMessages();
        if (allMessages.length > 0) {
          const randomIndex = Math.floor(Math.random() * allMessages.length);
          randomMessage = allMessages[randomIndex];
        }
      }
      
      if (!randomMessage) {
        return res.status(404).json({ message: "No messages available" });
      }
      
      res.json(randomMessage);
    } catch (error) {
      console.error("Error fetching random message:", error);
      res.status(500).json({ message: "Failed to fetch random message" });
    }
  });

  // Get daily message
  app.get("/api/messages/daily", async (req, res) => {
    try {
      const { getDailyMessage } = await import("../messages_comprehensive.js");
      const dailyMessage = getDailyMessage();
      
      if (!dailyMessage) {
        return res.status(404).json({ message: "No daily message available" });
      }
      
      res.json(dailyMessage);
    } catch (error) {
      console.error("Error fetching daily message:", error);
      res.status(500).json({ message: "Failed to fetch daily message" });
    }
  });

  // Message categories
  app.get("/api/messages/categories", async (req, res) => {
    try {
      const { messageCategories } = await import("../messages_data.js");
      res.json(messageCategories);
    } catch (error) {
      console.error("Error fetching message categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
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
  app.get("/api/favorites", (req, res) => {
    try {
      const favorites = storage.getFavorites();
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Add favorite
  app.post("/api/favorites", (req, res) => {
    try {
      const { quoteId, quoteText, author, category } = req.body;
      const quote = { 
        id: quoteId, 
        text: quoteText, 
        author: author || 'Unknown',
        category: category || 'general',
        source: 'favorites'
      };
      storage.addFavorite(quote);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  // Remove favorite
  app.delete("/api/favorites/:quoteId", (req, res) => {
    try {
      const { quoteId } = req.params;
      const removed = storage.removeFavorite(quoteId);
      
      if (!removed) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // MESSAGE FAVORITES ENDPOINTS
  
  // Get message favorites
  app.get("/api/message-favorites", (req, res) => {
    try {
      const favorites = storage.getMessageFavorites();
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch message favorites" });
    }
  });

  // Add message favorite
  app.post("/api/message-favorites", (req, res) => {
    try {
      const { messageId, messageText, category } = req.body;
      const message = { 
        id: messageId, 
        text: messageText, 
        category: category || 'general',
        source: 'Boomquotes Collection'
      };
      storage.addMessageFavorite(message);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to add message favorite" });
    }
  });

  // Remove message favorite
  app.delete("/api/message-favorites/:messageId", (req, res) => {
    try {
      const { messageId } = req.params;
      storage.removeMessageFavorite(messageId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove message favorite" });
    }
  });

  // Check if quote is favorite
  app.get("/api/favorites/:quoteId", (req, res) => {
    try {
      const { quoteId } = req.params;
      const isFavorite = storage.isFavorite(quoteId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Notification subscription endpoints
  app.post("/api/notifications/subscribe", (req, res) => {
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

  app.post("/api/notifications/unsubscribe", (req, res) => {
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

  // UNIFIED CONTENT ENDPOINTS
  
  // Get unified content (quotes + messages)
  app.get("/api/unified-content", async (req, res) => {
    try {
      const { category, type } = req.query;
      let allContent = [];
      
      // Get quotes
      if (!type || type === 'all' || type === 'quotes') {
        const quotes = storage.getQuotes();
        const quoteContent = quotes.map(quote => ({
          ...quote,
          type: 'quote'
        }));
        allContent.push(...quoteContent);
      }
      
      // Get messages
      if (!type || type === 'all' || type === 'messages') {
        try {
          const { getAllMessages } = await import("../messages_comprehensive.js");
          const messages = getAllMessages();
          const messageContent = messages.map(msg => ({
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: msg,
            category: 'general',
            type: 'message',
            source: 'Boomquotes Collection'
          }));
          allContent.push(...messageContent);
          
          // Add categorized messages with expanded content
          try {
            const { getExpandedContent } = await import("../server/content-expander.js");
            const expandedMessages = getExpandedContent('all', 'message', 100);
            allContent.push(...expandedMessages);
          } catch (error) {
            console.error("Error loading expanded messages:", error);
          }
        } catch (error) {
          console.error("Error loading messages:", error);
        }
      }
      
      // Filter by category if specified
      if (category && category !== 'all') {
        allContent = allContent.filter(item => 
          item.category.toLowerCase() === category.toLowerCase()
        );
      }
      
      // Shuffle content for variety
      allContent = allContent.sort(() => Math.random() - 0.5);
      
      res.json(allContent);
    } catch (error) {
      console.error("Error fetching unified content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });
  
  // Get random unified content
  app.get("/api/unified-content/random", async (req, res) => {
    try {
      const { category, type } = req.query;
      let allContent = [];
      
      // Get quotes
      if (!type || type === 'all' || type === 'quotes') {
        const quotes = storage.getQuotes();
        const quoteContent = quotes.map(quote => ({
          ...quote,
          type: 'quote'
        }));
        allContent.push(...quoteContent);
      }
      
      // Get messages
      if (!type || type === 'all' || type === 'messages') {
        try {
          const { getRandomMessage } = await import("../messages_comprehensive.js");
          const randomMessage = getRandomMessage();
          if (randomMessage) {
            allContent.push({
              id: `msg_random_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              text: randomMessage,
              category: 'random',
              type: 'message',
              source: 'Boomquotes Collection'
            });
          }
        } catch (error) {
          console.error("Error loading random message:", error);
        }
      }
      
      // Filter by category if specified
      if (category && category !== 'all') {
        allContent = allContent.filter(item => 
          item.category.toLowerCase() === category.toLowerCase()
        );
      }
      
      if (allContent.length === 0) {
        return res.status(404).json({ message: "No content available" });
      }
      
      const randomIndex = Math.floor(Math.random() * allContent.length);
      res.json(allContent[randomIndex]);
    } catch (error) {
      console.error("Error fetching random unified content:", error);
      res.status(500).json({ message: "Failed to fetch random content" });
    }
  });
  
  // Get unified favorites
  app.get("/api/unified-favorites", (req, res) => {
    try {
      const quoteFavorites = storage.getFavorites().map(fav => ({
        ...fav,
        type: 'quote'
      }));
      const messageFavorites = storage.getMessageFavorites().map(fav => ({
        ...fav,
        type: 'message'
      }));
      
      const allFavorites = [...quoteFavorites, ...messageFavorites];
      res.json(allFavorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unified favorites" });
    }
  });
  
  // Add unified favorite
  app.post("/api/unified-favorites", (req, res) => {
    try {
      const item = req.body;
      
      if (item.type === 'quote') {
        storage.addFavorite({
          id: item.id,
          text: item.text,
          author: item.author || 'Unknown',
          category: item.category || 'general',
          source: item.source || 'favorites'
        });
      } else if (item.type === 'message') {
        storage.addMessageFavorite({
          id: item.id,
          text: item.text,
          category: item.category || 'general',
          source: item.source || 'Boomquotes Collection'
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to add unified favorite" });
    }
  });
  
  // Remove unified favorite
  app.delete("/api/unified-favorites/:itemId", (req, res) => {
    try {
      const { itemId } = req.params;
      
      // Try removing from both quote and message favorites
      const quoteRemoved = storage.removeFavorite(itemId);
      const messageRemoved = storage.removeMessageFavorite(itemId);
      
      if (!quoteRemoved && !messageRemoved) {
        return res.status(404).json({ message: "Favorite not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove unified favorite" });
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

  // Get payout history
  app.get("/api/payouts/history", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    storage.getPayoutHistory(req.user.id)
      .then(history => res.json(history))
      .catch(err => {
        console.error("Error fetching payout history:", err);
        res.status(500).json({ error: "Failed to fetch payout history" });
      });
  });

  // Get rewards stats
  app.get("/api/rewards/stats", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    storage.getRewardsStats(req.user.id)
      .then(stats => res.json(stats))
      .catch(err => {
        console.error("Error fetching rewards stats:", err);
        res.status(500).json({ error: "Failed to fetch rewards stats" });
      });
  });

  // Retry failed payout
  app.post("/api/payouts/:payoutId/retry", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const { payoutId } = req.params;
    
    storage.updatePayoutStatus(payoutId, 'pending')
      .then(payout => {
        if (payout) {
          res.json({ success: true, payout });
        } else {
          res.status(404).json({ error: "Payout not found" });
        }
      })
      .catch(err => {
        console.error("Error retrying payout:", err);
        res.status(500).json({ error: "Failed to retry payout" });
      });
  });

  const httpServer = createServer(app);
  return httpServer;
}
