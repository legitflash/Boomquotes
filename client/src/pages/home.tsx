import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { DailyQuoteHero } from "@/components/daily-quote-hero";
import { CategoryFilters } from "@/components/category-filters";
import { QuotesGrid } from "@/components/quotes-grid";
import { ShareModal } from "@/components/share-modal";
import { QuotePreviewModal } from "@/components/quote-preview-modal";
import { useFavorites, useAddFavorite, useRemoveFavorite } from "@/hooks/use-favorites";
import { QuotesAPI } from "@/lib/quotes-api";
import { QuoteAggregator } from "@/lib/quote-sources";
import { apiRequest } from "@/lib/queryClient";
import type { Quote } from "@shared/schema";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: favorites = [] } = useFavorites();
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  const randomQuoteMutation = useMutation({
    mutationFn: async () => {
      try {
        // Try multiple quote sources for better variety
        const externalQuote = await QuoteAggregator.getRandomQuoteFromMultipleSources();
        const mappedQuote = QuotesAPI.mapExternalQuoteToLocal(externalQuote);
        
        // Add to our database
        const response = await apiRequest("POST", "/api/quotes", mappedQuote);
        return await response.json();
      } catch (error) {
        console.warn("All external sources failed, using local quote:", error);
        // Fallback to local random quote
        const response = await apiRequest("GET", "/api/quotes/random");
        return await response.json();
      }
    },
    onSuccess: (newQuote) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      setSelectedQuote(newQuote);
      setPreviewModalOpen(true);
      toast({
        title: "Random quote generated!",
        description: "Enjoy this new quote.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to generate quote",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  });

  const isFavorite = (quoteId: string) => {
    return favorites.some(fav => fav.quoteId === quoteId);
  };

  const handleToggleFavorite = (quote: Quote) => {
    if (isFavorite(quote.id)) {
      removeFavoriteMutation.mutate(quote.id, {
        onSuccess: () => {
          toast({
            title: "Removed from favorites",
            description: "Quote removed from your favorites.",
          });
        }
      });
    } else {
      addFavoriteMutation.mutate(quote, {
        onSuccess: () => {
          toast({
            title: "Added to favorites",
            description: "Quote saved to your favorites.",
          });
        }
      });
    }
  };

  const handleShareQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setShareModalOpen(true);
  };

  const handleRandomQuote = () => {
    randomQuoteMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DailyQuoteHero
          onShare={handleShareQuote}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isFavorite}
        />

        <CategoryFilters
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onRandomQuote={handleRandomQuote}
        />

        <QuotesGrid
          category={activeCategory}
          onShare={handleShareQuote}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isFavorite}
        />
      </main>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        quote={selectedQuote}
      />
      
      <QuotePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        quote={selectedQuote}
        onShare={(platform) => {
          console.log(`Shared quote via ${platform}`);
          setPreviewModalOpen(false);
        }}
      />

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={handleRandomQuote}
          disabled={randomQuoteMutation.isPending}
          className="bg-primary text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          size="icon"
        >
          <Shuffle className={`h-5 w-5 ${randomQuoteMutation.isPending ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
