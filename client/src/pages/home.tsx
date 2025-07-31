import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shuffle, Lightbulb, Heart, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { DailyQuoteHero } from "@/components/daily-quote-hero";
import { CategoryFilters } from "@/components/category-filters";
import { QuotesGrid } from "@/components/quotes-grid";
import { ShareModal } from "@/components/share-modal";
import { QuotePreviewModal } from "@/components/quote-preview-modal";
import { MoodSelector, type Mood } from "@/components/mood-selector";
import { useFavorites, useAddFavorite, useRemoveFavorite } from "@/hooks/use-favorites";
import { useMoodQuotes, getMoodRecommendation } from "@/hooks/use-mood-quotes";
import { QuotesAPI } from "@/lib/quotes-api";
import { QuoteAggregator } from "@/lib/quote-sources";
import { apiRequest } from "@/lib/queryClient";
import type { Quote } from "@shared/schema";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [showMoodQuotes, setShowMoodQuotes] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: favorites = [] } = useFavorites();
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();
  
  // Mood-based quote recommendations
  const { quotes: moodQuotes, isLoading: moodLoading } = useMoodQuotes(selectedMood);

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

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    setShowMoodQuotes(true);
    setActiveCategory("all"); // Reset category filter when using mood
    toast({
      title: "Mood selected!",
      description: getMoodRecommendation(mood),
    });
  };

  const handleBackToCategories = () => {
    setShowMoodQuotes(false);
    setSelectedMood(null);
  };

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

        {/* Mood-based recommendations */}
        <MoodSelector
          onMoodSelect={handleMoodSelect}
          selectedMood={selectedMood}
        />

        {showMoodQuotes && selectedMood ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-purple-500" />
                  Quotes for your {selectedMood.label.toLowerCase()} mood
                </h2>
                <p className="text-gray-600 mt-1">
                  {getMoodRecommendation(selectedMood)}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleBackToCategories}
                className="text-gray-600 hover:text-gray-800"
              >
                Browse Categories
              </Button>
            </div>

            {moodLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-48 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {moodQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-neutral-200 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {quote.category.charAt(0).toUpperCase() + quote.category.slice(1)}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFavorite(quote)}
                          className={`transition-colors ${
                            isFavorite(quote.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite(quote.id) ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleShareQuote(quote)}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="relative mb-4 p-4 rounded-lg bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-emerald-900/20 dark:via-blue-900/20 dark:to-purple-900/20">
                      <blockquote className="text-lg leading-relaxed text-gray-800 dark:text-gray-100 font-medium relative z-10">
                        "{quote.text}"
                      </blockquote>
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/30 via-blue-200/30 to-purple-200/30 dark:from-emerald-600/10 dark:via-blue-600/10 dark:to-purple-600/10 rounded-lg blur-sm"></div>
                    </div>

                    <footer className="flex items-center justify-between">
                      <span className="text-neutral-500 font-medium">— {quote.author}</span>
                      {(quote as any).moodScore > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          Mood Match
                        </span>
                      )}
                    </footer>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
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
          </>
        )}
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
