export interface ExternalQuote {
  _id?: string;
  content: string;
  author: string;
  tags: string[];
  source?: string;
}

export interface ZenQuote {
  q: string;
  a: string;
  c: string;
  h: string;
}

export interface QuoteGardenQuote {
  _id: string;
  quoteText: string;
  quoteAuthor: string;
  quoteGenre: string;
  __v: number;
}

const QUOTABLE_API_BASE = "https://api.quotable.io";
const ZENQUOTES_API_BASE = "https://zenquotes.io/api";
const QUOTEGARDEN_API_BASE = "https://quote-garden.herokuapp.com/api/v3";

export class QuotesAPI {
  // Try multiple sources for random quotes
  static async getRandomQuote(): Promise<ExternalQuote> {
    const sources = [
      () => this.getQuotableRandomQuote(),
      () => this.getZenQuotesRandomQuote(),
      () => this.getQuoteGardenRandomQuote()
    ];

    // Try sources in order, fallback to next if one fails
    for (const getQuote of sources) {
      try {
        const quote = await getQuote();
        if (quote) return quote;
      } catch (error) {
        console.warn("Quote source failed, trying next:", error);
        continue;
      }
    }

    throw new Error("All quote sources failed");
  }

  // Quotable.io API
  static async getQuotableRandomQuote(): Promise<ExternalQuote> {
    const response = await fetch(`${QUOTABLE_API_BASE}/random`);
    if (!response.ok) throw new Error("Quotable API failed");
    
    const data = await response.json();
    return {
      content: data.content,
      author: data.author,
      tags: data.tags || [],
      source: "quotable.io"
    };
  }

  // ZenQuotes API
  static async getZenQuotesRandomQuote(): Promise<ExternalQuote> {
    const response = await fetch(`${ZENQUOTES_API_BASE}/random`);
    if (!response.ok) throw new Error("ZenQuotes API failed");
    
    const data: ZenQuote[] = await response.json();
    if (!data || data.length === 0) throw new Error("No quotes from ZenQuotes");
    
    const quote = data[0];
    return {
      content: quote.q,
      author: quote.a,
      tags: [], // ZenQuotes doesn't provide tags
      source: "zenquotes.io"
    };
  }

  // Quote Garden API
  static async getQuoteGardenRandomQuote(): Promise<ExternalQuote> {
    const response = await fetch(`${QUOTEGARDEN_API_BASE}/quotes/random`);
    if (!response.ok) throw new Error("Quote Garden API failed");
    
    const data = await response.json();
    if (!data.data) throw new Error("Invalid Quote Garden response");
    
    const quote = data.data;
    return {
      content: quote.quoteText.replace(/^"|"$/g, ''), // Remove surrounding quotes
      author: quote.quoteAuthor,
      tags: [quote.quoteGenre || 'general'],
      source: "quotegarden.herokuapp.com"
    };
  }

  static async getQuotesByTag(tag: string): Promise<ExternalQuote[]> {
    const allQuotes: ExternalQuote[] = [];

    // Try multiple sources for category-based quotes
    try {
      const quotableQuotes = await this.getQuotableQuotesByTag(tag);
      allQuotes.push(...quotableQuotes);
    } catch (error) {
      console.warn("Quotable quotes by tag failed:", error);
    }

    try {
      const zenQuotes = await this.getZenQuotesByCategory(tag);
      allQuotes.push(...zenQuotes);
    } catch (error) {
      console.warn("ZenQuotes by category failed:", error);
    }

    try {
      const gardenQuotes = await this.getQuoteGardenByGenre(tag);
      allQuotes.push(...gardenQuotes);
    } catch (error) {
      console.warn("Quote Garden by genre failed:", error);
    }

    return allQuotes.slice(0, 15); // Limit to 15 quotes total
  }

  static async getQuotableQuotesByTag(tag: string): Promise<ExternalQuote[]> {
    const mappedTag = this.mapCategoryToTag(tag);
    const response = await fetch(`${QUOTABLE_API_BASE}/quotes?tags=${mappedTag}&limit=5`);
    if (!response.ok) throw new Error("Quotable API failed");
    
    const data = await response.json();
    return (data.results || []).map((quote: any) => ({
      content: quote.content,
      author: quote.author,
      tags: quote.tags || [],
      source: "quotable.io"
    }));
  }

  static async getZenQuotesByCategory(category: string): Promise<ExternalQuote[]> {
    // ZenQuotes has specific endpoints for categories
    const categoryEndpoints: Record<string, string> = {
      'motivational': 'inspirational',
      'wisdom': 'wisdom',
      'life': 'life',
      'funny': 'funny',
      'love': 'love'
    };

    const endpoint = categoryEndpoints[category];
    if (!endpoint) return [];

    const response = await fetch(`${ZENQUOTES_API_BASE}/${endpoint}`);
    if (!response.ok) throw new Error("ZenQuotes category API failed");
    
    const data: ZenQuote[] = await response.json();
    return data.slice(0, 5).map(quote => ({
      content: quote.q,
      author: quote.a,
      tags: [category],
      source: "zenquotes.io"
    }));
  }

  static async getQuoteGardenByGenre(category: string): Promise<ExternalQuote[]> {
    const genreMap: Record<string, string> = {
      'motivational': 'motivational',
      'wisdom': 'wisdom',
      'life': 'life',
      'love': 'love',
      'funny': 'humor',
      'hustle': 'success',
      'social': 'society'
    };

    const genre = genreMap[category];
    if (!genre) return [];

    const response = await fetch(`${QUOTEGARDEN_API_BASE}/quotes?genre=${genre}&limit=5`);
    if (!response.ok) throw new Error("Quote Garden genre API failed");
    
    const data = await response.json();
    return (data.data || []).map((quote: QuoteGardenQuote) => ({
      content: quote.quoteText.replace(/^"|"$/g, ''),
      author: quote.quoteAuthor,
      tags: [quote.quoteGenre || category],
      source: "quotegarden.herokuapp.com"
    }));
  }

  static mapExternalQuoteToLocal(externalQuote: ExternalQuote) {
    // Map tags to our categories
    const tagToCategoryMap: Record<string, string> = {
      "motivational": "motivational",
      "inspirational": "motivational", 
      "wisdom": "wisdom",
      "philosophy": "wisdom",
      "funny": "funny",
      "humor": "funny",
      "success": "hustle",
      "business": "hustle",
      "life": "life",
      "happiness": "life",
      "love": "love",
      "friendship": "love",
      "romance": "romantic",
      "politics": "politics",
      "government": "politics",
      "society": "social",
      "community": "social"
    };

    const foundTag = externalQuote.tags.find(tag => tagToCategoryMap[tag.toLowerCase()]);
    const category = foundTag ? tagToCategoryMap[foundTag.toLowerCase()] : "wisdom";

    return {
      text: externalQuote.content,
      author: externalQuote.author,
      category
    };
  }

  static mapCategoryToTag(category: string): string {
    // Map our categories to external API tags for fetching
    const categoryToTagMap: Record<string, string> = {
      "motivational": "motivational,inspirational",
      "wisdom": "wisdom,philosophy",
      "hustle": "success,business",
      "life": "life,happiness",
      "funny": "funny,humor",
      "love": "love,friendship",
      "romantic": "romance,love",
      "politics": "politics,government",
      "social": "society,community"
    };

    return categoryToTagMap[category] || "wisdom";
  }
}
