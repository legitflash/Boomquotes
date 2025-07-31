import { useQuery } from "@tanstack/react-query";
import { Share, Heart, Quote as QuoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Quote } from "@shared/schema";

interface DailyQuoteHeroProps {
  onShare: (quote: Quote) => void;
  onToggleFavorite: (quote: Quote) => void;
  isFavorite: (quoteId: string) => boolean;
}

export function DailyQuoteHero({ onShare, onToggleFavorite, isFavorite }: DailyQuoteHeroProps) {
  const { data: quote, isLoading } = useQuery<Quote>({
    queryKey: ["/api/quotes/daily"],
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      motivational: "bg-yellow-500 text-black",
      wisdom: "bg-emerald-500 text-white",
      funny: "bg-red-500 text-white",
      success: "bg-violet-500 text-white",
      life: "bg-gray-600 text-white",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500 text-white";
  };

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <Skeleton className="h-6 w-32 mb-4 bg-white/20" />
            <Skeleton className="h-8 w-full mb-2 bg-white/20" />
            <Skeleton className="h-8 w-3/4 mb-6 bg-white/20" />
            <Skeleton className="h-6 w-24 mb-8 bg-white/20" />
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
                <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
              </div>
              <Skeleton className="h-8 w-20 rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!quote) {
    return (
      <section className="mb-12">
        <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white text-center">
          <p className="text-lg">No daily quote available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 text-6xl">
            <QuoteIcon className="w-16 h-16" />
          </div>
          <div className="absolute bottom-4 right-4 text-6xl rotate-180">
            <QuoteIcon className="w-16 h-16" />
          </div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-lg font-medium mb-4 opacity-90">Quote of the Day</h2>
          <blockquote className="text-2xl md:text-3xl font-light leading-relaxed mb-6">
            "{quote.text}"
          </blockquote>
          <footer className="text-lg opacity-90">
            — <cite>{quote.author}</cite>
          </footer>
          
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onShare(quote)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-all text-white hover:text-white"
              >
                <Share className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleFavorite(quote)}
                className={`bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-all ${
                  isFavorite(quote.id) ? "text-red-500" : "text-white"
                } hover:text-red-500`}
              >
                <Heart className={`h-5 w-5 ${isFavorite(quote.id) ? "fill-current" : ""}`} />
              </Button>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(quote.category)}`}>
              {quote.category.charAt(0).toUpperCase() + quote.category.slice(1)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
