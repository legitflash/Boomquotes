import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Share, Heart, Quote as QuoteIcon, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Quote } from "@shared/schema";

interface DailyQuoteHeroProps {
  onShare: (quote: Quote) => void;
  onToggleFavorite: (quote: Quote) => void;
  isFavorite: (quoteId: string) => boolean;
}

export function DailyQuoteHero({ onShare, onToggleFavorite, isFavorite }: DailyQuoteHeroProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: quote, isLoading } = useQuery<Quote>({
    queryKey: ["/api/quotes/daily"],
  });

  const refreshDailyQuoteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/quotes/daily/refresh");
      return response.json();
    },
    onSuccess: (newQuote) => {
      queryClient.setQueryData(["/api/quotes/daily"], newQuote);
      toast({
        title: "Quote refreshed!",
        description: "Enjoy your new daily quote.",
      });
    },
    onError: () => {
      toast({
        title: "Refresh failed",
        description: "Could not get a new quote. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDownload = (quote: Quote) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Quote text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    
    const words = quote.text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + word + ' ';
      if (ctx.measureText(testLine).width > canvas.width - 100 && currentLine) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine.trim());

    const startY = (canvas.height - (lines.length * 50)) / 2;
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + (index * 50));
    });

    // Author
    ctx.font = '24px Arial';
    ctx.fillText(`— ${quote.author}`, canvas.width / 2, startY + (lines.length * 50) + 50);

    // Download
    const link = document.createElement('a');
    link.download = `quote-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Quote downloaded!",
      description: "Quote image saved to your device.",
    });
  };

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
      <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white relative overflow-hidden">
        {/* Enhanced Background pattern with colorful gradients */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-4 w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-lg" />
          <div className="absolute bottom-4 right-4 w-32 h-32 bg-gradient-to-br from-blue-300 to-teal-400 rounded-full blur-lg" />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full blur-lg" />
          <div className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full blur-lg" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-lg font-medium mb-4 opacity-90">Quote of the Day</h2>
          <div className="relative mb-6 p-6 rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-sm border border-white/20">
            <blockquote className="text-2xl md:text-3xl font-light leading-relaxed relative z-10">
              "{quote.text}"
            </blockquote>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-xl"></div>
          </div>
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
