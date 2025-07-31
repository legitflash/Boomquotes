import { Share, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteSourceIndicator } from "@/components/quote-source-indicator";
import type { Quote } from "@shared/schema";

interface QuoteCardProps {
  quote: Quote;
  onShare: (quote: Quote) => void;
  onToggleFavorite: (quote: Quote) => void;
  isFavorite: boolean;
}

export function QuoteCard({ quote, onShare, onToggleFavorite, isFavorite }: QuoteCardProps) {
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

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-neutral-200 group">
      <div className="flex items-start justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(quote.category)}`}>
          {quote.category.charAt(0).toUpperCase() + quote.category.slice(1)}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(quote)}
            className={`transition-colors ${
              isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onShare(quote)}
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
        <QuoteSourceIndicator source={(quote as any).source || "builtin"} />
      </footer>
    </div>
  );
}
