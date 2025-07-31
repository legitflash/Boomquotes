import { Share, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      
      <blockquote className="text-lg leading-relaxed text-gray-800 mb-4">
        "{quote.text}"
      </blockquote>
      
      <footer className="text-neutral-500 font-medium">
        — {quote.author}
      </footer>
    </div>
  );
}
