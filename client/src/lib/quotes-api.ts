export interface ExternalQuote {
  _id: string;
  content: string;
  author: string;
  tags: string[];
}

const QUOTABLE_API_BASE = "https://api.quotable.io";

export class QuotesAPI {
  static async getRandomQuote(): Promise<ExternalQuote> {
    try {
      const response = await fetch(`${QUOTABLE_API_BASE}/random`);
      if (!response.ok) {
        throw new Error("Failed to fetch quote from API");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching random quote:", error);
      throw error;
    }
  }

  static async getQuotesByTag(tag: string): Promise<ExternalQuote[]> {
    try {
      const response = await fetch(`${QUOTABLE_API_BASE}/quotes?tags=${tag}&limit=10`);
      if (!response.ok) {
        throw new Error("Failed to fetch quotes from API");
      }
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error fetching quotes by tag:", error);
      throw error;
    }
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
      "success": "success",
      "life": "life",
      "happiness": "life"
    };

    const category = externalQuote.tags.find(tag => tagToCategoryMap[tag]) 
      ? tagToCategoryMap[externalQuote.tags.find(tag => tagToCategoryMap[tag])!]
      : "wisdom";

    return {
      text: externalQuote.content,
      author: externalQuote.author,
      category
    };
  }
}
