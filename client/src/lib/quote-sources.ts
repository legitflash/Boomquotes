// Additional quote sources and APIs
import type { ExternalQuote } from './quotes-api';

export interface QuoteSource {
  name: string;
  baseUrl: string;
  enabled: boolean;
  rateLimit?: number; // requests per minute
  apiKey?: string;
}

// Famous Quotes API
export class FamousQuotesAPI {
  private static BASE_URL = "https://api.api-ninjas.com/v1/quotes";

  static async getRandomQuote(apiKey?: string): Promise<ExternalQuote> {
    const headers: HeadersInit = {};
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    const response = await fetch(this.BASE_URL, { headers });
    if (!response.ok) throw new Error("API Ninjas failed");

    const data = await response.json();
    if (!data || data.length === 0) throw new Error("No quotes from API Ninjas");

    const quote = data[0];
    return {
      content: quote.quote,
      author: quote.author,
      tags: [quote.category || 'general'],
      source: "api.api-ninjas.com"
    };
  }

  static async getQuotesByCategory(category: string, apiKey?: string): Promise<ExternalQuote[]> {
    const headers: HeadersInit = {};
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }

    const response = await fetch(`${this.BASE_URL}?category=${category}`, { headers });
    if (!response.ok) throw new Error("API Ninjas category failed");

    const data = await response.json();
    return data.map((quote: any) => ({
      content: quote.quote,
      author: quote.author,
      tags: [quote.category || category],
      source: "api.api-ninjas.com"
    }));
  }
}

// Quotable alternative endpoints
export class QuotableExtendedAPI {
  private static BASE_URL = "https://api.quotable.io";

  static async getAuthorQuotes(author: string): Promise<ExternalQuote[]> {
    const response = await fetch(`${this.BASE_URL}/quotes?author=${encodeURIComponent(author)}&limit=10`);
    if (!response.ok) throw new Error("Quotable author search failed");

    const data = await response.json();
    return (data.results || []).map((quote: any) => ({
      content: quote.content,
      author: quote.author,
      tags: quote.tags || [],
      source: "quotable.io"
    }));
  }

  static async searchQuotes(query: string): Promise<ExternalQuote[]> {
    const response = await fetch(`${this.BASE_URL}/search/quotes?query=${encodeURIComponent(query)}&limit=10`);
    if (!response.ok) throw new Error("Quotable search failed");

    const data = await response.json();
    return (data.results || []).map((quote: any) => ({
      content: quote.content,
      author: quote.author,
      tags: quote.tags || [],
      source: "quotable.io"
    }));
  }

  static async getPopularQuotes(): Promise<ExternalQuote[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.BASE_URL}/quotes?sortBy=datePopular&limit=20`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('Quotable API response not ok:', response.status);
        return [];
      }

      const data = await response.json();
      if (!data.results || !Array.isArray(data.results)) {
        console.warn('Quotable API returned invalid data structure');
        return [];
      }

      return data.results.map((quote: any) => ({
        content: quote.content,
        author: quote.author,
        tags: quote.tags || [],
        source: "quotable.io"
      }));
    } catch (error) {
      console.warn('Quotable popular quotes failed:', error);
      return [];
    }
  }
}

// GoQuotes API (Free alternative)
export class GoQuotesAPI {
  private static BASE_URL = "https://goquotes-api.herokuapp.com/api/v1";

  static async getRandomQuote(): Promise<ExternalQuote> {
    const response = await fetch(`${this.BASE_URL}/random`);
    if (!response.ok) throw new Error("GoQuotes API failed");

    const data = await response.json();
    return {
      content: data.text,
      author: data.author,
      tags: [data.tag || 'general'],
      source: "goquotes-api.herokuapp.com"
    };
  }

  static async getQuotesByTag(tag: string): Promise<ExternalQuote[]> {
    const response = await fetch(`${this.BASE_URL}/quotes/tag?name=${tag}`);
    if (!response.ok) throw new Error("GoQuotes tag search failed");

    const data = await response.json();
    return (data.quotes || []).slice(0, 10).map((quote: any) => ({
      content: quote.text,
      author: quote.author,
      tags: [quote.tag || tag],
      source: "goquotes-api.herokuapp.com"
    }));
  }
}

// Stoic Quotes API (Philosophy focused)
export class StoicQuotesAPI {
  private static BASE_URL = "https://stoicquotesapi.com/v1";

  static async getRandomQuote(): Promise<ExternalQuote> {
    const response = await fetch(`${this.BASE_URL}/random`);
    if (!response.ok) throw new Error("Stoic Quotes API failed");

    const data = await response.json();
    return {
      content: data.text,
      author: data.author,
      tags: ['wisdom', 'philosophy', 'stoic'],
      source: "stoicquotesapi.com"
    };
  }
}

// Quote aggregator with fallback system
export class QuoteAggregator {
  private static sources: QuoteSource[] = [
    { name: "quotable", baseUrl: "https://api.quotable.io", enabled: true },
    { name: "zenquotes", baseUrl: "https://zenquotes.io/api", enabled: true },
    { name: "quotegarden", baseUrl: "https://quote-garden.herokuapp.com/api/v3", enabled: true },
    { name: "goquotes", baseUrl: "https://goquotes-api.herokuapp.com/api/v1", enabled: true },
    { name: "stoicquotes", baseUrl: "https://stoicquotesapi.com/v1", enabled: true }
  ];

  static async getRandomQuoteFromMultipleSources(): Promise<ExternalQuote> {
    const enabledSources = this.sources.filter(s => s.enabled);

    // Randomize source order for variety
    const shuffledSources = enabledSources.sort(() => Math.random() - 0.5);

    for (const source of shuffledSources) {
      try {
        switch (source.name) {
          case "quotable":
            try {
              const popularQuotes = await QuotableExtendedAPI.getPopularQuotes();
              if (popularQuotes.length === 0) {
                console.warn("No popular quotes available from Quotable");
                continue;
              }
              return popularQuotes[Math.floor(Math.random() * popularQuotes.length)];
            } catch (error) {
              console.warn("Quotable source failed:", error);
              continue;
            }
          case "zenquotes":
            // Already implemented in main QuotesAPI
            continue;
          case "goquotes":
            try {
              return await GoQuotesAPI.getRandomQuote();
            } catch (error) {
              console.warn("GoQuotes source failed:", error);
              continue;
            }
          case "stoicquotes":
            try {
              return await StoicQuotesAPI.getRandomQuote();
            } catch (error) {
              console.warn("StoicQuotes source failed:", error);
              continue;
            }
          default:
            continue;
        }
      } catch (error) {
        console.warn(`Quote source ${source.name} failed:`, error);
        continue;
      }
    }

    throw new Error("All quote sources failed");
  }

  static async searchAcrossAllSources(query: string): Promise<ExternalQuote[]> {
    const results: ExternalQuote[] = [];

    // Search in Quotable
    try {
      const quotableResults = await QuotableExtendedAPI.searchQuotes(query);
      results.push(...quotableResults);
    } catch (error) {
      console.warn("Quotable search failed:", error);
    }

    return results.slice(0, 20); // Limit total results
  }

  static getAvailableSources(): QuoteSource[] {
    return [...this.sources];
  }

  static toggleSource(sourceName: string, enabled: boolean): void {
    const source = this.sources.find(s => s.name === sourceName);
    if (source) {
      source.enabled = enabled;
    }
  }
}