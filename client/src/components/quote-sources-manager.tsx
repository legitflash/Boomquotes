import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Globe, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QuoteAggregator, QuotableExtendedAPI } from "@/lib/quote-sources";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function QuoteSourcesManager() {
  const [sources, setSources] = useState(QuoteAggregator.getAvailableSources());
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const refreshQuotesMutation = useMutation({
    mutationFn: async () => {
      // Fetch fresh quotes from multiple sources
      const quotes = [];
      for (let i = 0; i < 5; i++) {
        try {
          const quote = await QuoteAggregator.getRandomQuoteFromMultipleSources();
          quotes.push(quote);
        } catch (error) {
          console.warn("Failed to fetch quote:", error);
        }
      }
      
      // Add new quotes to database
      for (const quote of quotes) {
        try {
          const mappedQuote = {
            text: quote.content,
            author: quote.author,
            category: quote.tags[0] || 'general'
          };
          await apiRequest("POST", "/api/quotes", mappedQuote);
        } catch (error) {
          console.warn("Failed to save quote:", error);
        }
      }
      
      return quotes.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Quotes Refreshed",
        description: `Added ${count} new quotes from external sources.`,
      });
    },
    onError: () => {
      toast({
        title: "Refresh Failed",
        description: "Unable to fetch new quotes. Please try again.",
        variant: "destructive",
      });
    }
  });

  const searchQuotesMutation = useMutation({
    mutationFn: async (query: string) => {
      const results = await QuotableExtendedAPI.searchQuotes(query);
      
      // Add found quotes to database
      let added = 0;
      for (const quote of results.slice(0, 5)) {
        try {
          const mappedQuote = {
            text: quote.content,
            author: quote.author,
            category: quote.tags[0] || 'general'
          };
          await apiRequest("POST", "/api/quotes", mappedQuote);
          added++;
        } catch (error) {
          console.warn("Failed to save searched quote:", error);
        }
      }
      
      return { results: results.length, added };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({
        title: "Search Complete",
        description: `Found ${data.results} quotes, added ${data.added} new ones.`,
      });
      setSearchQuery("");
    },
    onError: () => {
      toast({
        title: "Search Failed",
        description: "Unable to search quotes. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSourceToggle = (sourceName: string, enabled: boolean) => {
    QuoteAggregator.toggleSource(sourceName, enabled);
    setSources(QuoteAggregator.getAvailableSources());
    
    toast({
      title: enabled ? "Source Enabled" : "Source Disabled",
      description: `${sourceName} is now ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter Search Term",
        description: "Please enter a search term to find quotes.",
        variant: "destructive",
      });
      return;
    }
    
    searchQuotesMutation.mutate(searchQuery.trim());
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-blue-600" />
          Quote Sources Management
        </CardTitle>
        <CardDescription>
          Manage external quote sources and refresh your quote collection
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Source Status */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Available Sources
          </h4>
          
          <div className="grid gap-3">
            {sources.map((source) => (
              <div key={source.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="font-medium capitalize">{source.name}</div>
                    <div className="text-sm text-gray-500">{source.baseUrl}</div>
                  </div>
                  <Badge 
                    variant={source.enabled ? "default" : "secondary"}
                    className={source.enabled ? "bg-green-100 text-green-800" : ""}
                  >
                    {source.enabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
                <Switch
                  checked={source.enabled}
                  onCheckedChange={(enabled) => handleSourceToggle(source.name, enabled)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Refresh Quotes */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Fresh Content
          </h4>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => refreshQuotesMutation.mutate()}
              disabled={refreshQuotesMutation.isPending}
              className="flex-1"
            >
              {refreshQuotesMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Fetching Quotes...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Quotes
                </>
              )}
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            Fetches 5 new random quotes from enabled sources and adds them to your collection.
          </p>
        </div>

        {/* Search Quotes */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search & Add Quotes
          </h4>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for quotes..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              disabled={searchQuotesMutation.isPending || !searchQuery.trim()}
            >
              {searchQuotesMutation.isPending ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
          
          <p className="text-xs text-gray-500">
            Search across multiple quote databases and add relevant quotes to your collection.
          </p>
        </div>

        {/* Usage Stats */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Quote Sources Information</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Quotable.io:</strong> High-quality curated quotes with categories</li>
            <li>• <strong>ZenQuotes:</strong> Inspirational and motivational content</li>
            <li>• <strong>Quote Garden:</strong> Diverse collection with genre classifications</li>
            <li>• <strong>GoQuotes:</strong> Free API with tagged quotes</li>
            <li>• <strong>Stoic Quotes:</strong> Philosophy and wisdom focused content</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}