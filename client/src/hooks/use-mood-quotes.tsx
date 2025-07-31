import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Quote } from "@shared/schema";
import type { Mood } from "@/components/mood-selector";

interface MoodQuoteMapping {
  [key: string]: {
    categories: string[];
    keywords: string[];
    fallbackCategories: string[];
  };
}

const moodQuoteMapping: MoodQuoteMapping = {
  happy: {
    categories: ["success", "inspiration", "life"],
    keywords: ["joy", "happiness", "celebration", "gratitude", "positive", "smile", "blessed"],
    fallbackCategories: ["motivation", "love"]
  },
  motivated: {
    categories: ["motivation", "hustle", "success"],
    keywords: ["achieve", "goal", "work", "effort", "determination", "persistence", "drive"],
    fallbackCategories: ["inspiration", "life"]
  },
  inspired: {
    categories: ["inspiration", "success", "motivation"],
    keywords: ["dream", "create", "innovate", "vision", "possibility", "breakthrough", "imagine"],
    fallbackCategories: ["wisdom", "life"]
  },
  peaceful: {
    categories: ["mindfulness", "wisdom", "life"],
    keywords: ["peace", "calm", "meditation", "balance", "serenity", "tranquil", "harmony"],
    fallbackCategories: ["inspiration", "love"]
  },
  thoughtful: {
    categories: ["wisdom", "life", "mindfulness"],
    keywords: ["wisdom", "reflection", "philosophy", "understanding", "knowledge", "insight"],
    fallbackCategories: ["inspiration", "motivation"]
  },
  romantic: {
    categories: ["love", "inspiration"],
    keywords: ["love", "heart", "romance", "relationship", "affection", "connection", "soul"],
    fallbackCategories: ["life", "wisdom"]
  },
  sad: {
    categories: ["inspiration", "wisdom", "life"],
    keywords: ["hope", "healing", "strength", "overcome", "resilience", "courage", "faith"],
    fallbackCategories: ["motivation", "love"]
  },
  stressed: {
    categories: ["mindfulness", "wisdom", "inspiration"],
    keywords: ["calm", "relief", "perspective", "peace", "strength", "overcome", "breathe"],
    fallbackCategories: ["motivation", "life"]
  }
};

export function useMoodQuotes(selectedMood: Mood | null) {
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);

  // Fetch quotes for mood-specific categories
  const { data: quotesData, isLoading } = useQuery({
    queryKey: ["/api/quotes/mood", selectedMood?.id],
    queryFn: async () => {
      if (!selectedMood) return [];

      const mapping = moodQuoteMapping[selectedMood.id];
      if (!mapping) return [];

      // Fetch quotes from multiple categories
      const allQuotes: Quote[] = [];
      
      for (const category of mapping.categories) {
        try {
          const response = await fetch(`/api/quotes?category=${category}`);
          if (response.ok) {
            const categoryQuotes = await response.json();
            allQuotes.push(...categoryQuotes);
          }
        } catch (error) {
          console.warn(`Failed to fetch quotes for category ${category}:`, error);
        }
      }

      // If no quotes found, try fallback categories
      if (allQuotes.length === 0) {
        for (const category of mapping.fallbackCategories) {
          try {
            const response = await fetch(`/api/quotes?category=${category}`);
            if (response.ok) {
              const categoryQuotes = await response.json();
              allQuotes.push(...categoryQuotes);
            }
          } catch (error) {
            console.warn(`Failed to fetch fallback quotes for category ${category}:`, error);
          }
        }
      }

      return allQuotes;
    },
    enabled: !!selectedMood
  });

  useEffect(() => {
    if (!quotesData || !selectedMood) {
      setFilteredQuotes([]);
      return;
    }

    const mapping = moodQuoteMapping[selectedMood.id];
    if (!mapping) {
      setFilteredQuotes(quotesData);
      return;
    }

    // Score quotes based on keyword relevance
    const scoredQuotes = quotesData.map(quote => {
      let score = 0;
      const text = (quote.text + " " + quote.author).toLowerCase();
      
      // Check for mood-specific keywords
      for (const keyword of mapping.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += 2;
        }
      }
      
      // Check for mood keywords from the mood object
      for (const keyword of selectedMood.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
      
      // Boost score for preferred categories
      if (mapping.categories.includes(quote.category)) {
        score += 3;
      }

      return { ...quote, moodScore: score };
    });

    // Sort by relevance score and limit results
    const sortedQuotes = scoredQuotes
      .sort((a, b) => (b.moodScore || 0) - (a.moodScore || 0))
      .slice(0, 12); // Limit to 12 most relevant quotes

    setFilteredQuotes(sortedQuotes);
  }, [quotesData, selectedMood]);

  return {
    quotes: filteredQuotes,
    isLoading,
    hasQuotes: filteredQuotes.length > 0
  };
}

export function getMoodRecommendation(mood: Mood): string {
  const recommendations: { [key: string]: string } = {
    happy: "Perfect! Here are some uplifting quotes to amplify your joy and keep the positive energy flowing.",
    motivated: "Great energy! These motivational quotes will fuel your drive and help you crush your goals.",
    inspired: "Feeling creative? These inspiring quotes will spark new ideas and expand your vision.",
    peaceful: "Take a moment to breathe. These mindful quotes will help you find inner calm and balance.",
    thoughtful: "Deep thoughts deserve deep wisdom. These reflective quotes will nourish your contemplative mind.",
    romantic: "Love is in the air! These heartfelt quotes celebrate connection and the beauty of relationships.",
    sad: "It's okay to feel down sometimes. These encouraging quotes offer hope and remind you of your strength.",
    stressed: "Take a deep breath. These calming quotes will help you find perspective and inner peace."
  };

  return recommendations[mood.id] || "Here are some quotes perfectly matched to your current mood.";
}