import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Share2, Download, RefreshCw, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShareModal } from "@/components/share-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Quote } from "@shared/schema";
import { useLocation } from "wouter";

export default function QuotePage() {
  const [, setLocation] = useLocation();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current quote of the day
  const { data: dailyQuote, isLoading: dailyLoading, refetch: refetchDaily } = useQuery<Quote>({
    queryKey: ["/api/quotes/daily"],
  });

  // Get random quote
  const { data: randomQuote, isLoading: randomLoading, refetch: refetchRandom } = useQuery<Quote>({
    queryKey: ["/api/quotes/random"],
  });

  // Get user favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
  });

  // Current quote being displayed (daily by default)
  const [currentQuoteType, setCurrentQuoteType] = useState<'daily' | 'random'>('daily');
  const currentQuote = currentQuoteType === 'daily' ? dailyQuote : randomQuote;
  const isLoading = currentQuoteType === 'daily' ? dailyLoading : randomLoading;

  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async (quote: Quote) => {
      const isFav = favorites.some((f: any) => f.quoteId === quote.id);
      
      if (isFav) {
        const response = await apiRequest("DELETE", `/api/favorites/${quote.id}`);
        return { action: 'removed', data: await response.json() };
      } else {
        const response = await apiRequest("POST", "/api/favorites", {
          quoteId: quote.id,
          quoteData: {
            text: quote.text,
            author: quote.author,
            category: quote.category,
            source: quote.source
          }
        });
        return { action: 'added', data: await response.json() };
      }
    },
    onSuccess: ({ action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: action === 'added' ? "Added to favorites" : "Removed from favorites",
        description: action === 'added' 
          ? "Quote saved to your favorites." 
          : "Quote removed from favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites.",
        variant: "destructive",
      });
    }
  });

  const handleShare = (quote: Quote) => {
    setSelectedQuote(quote);
    setShareModalOpen(true);
  };

  const handleDownload = (quote: Quote) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Text styling
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';

    // Quote text
    ctx.font = 'bold 32px Arial';
    const words = quote.text.split(' ');
    let line = '';
    let y = 200;
    const maxWidth = 700;
    const lineHeight = 45;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, canvas.width / 2, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, y);

    // Author
    ctx.font = '24px Arial';
    ctx.fillText(`— ${quote.author}`, canvas.width / 2, y + 80);

    // Boomquotes branding
    ctx.font = '18px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillText('Boomquotes', canvas.width / 2, canvas.height - 30);

    // Download
    const link = document.createElement('a');
    link.download = `quote-${quote.author.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Quote downloaded",
      description: "Quote image saved to your device.",
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (currentQuoteType === 'daily') {
        await refetchDaily();
      } else {
        await refetchRandom();
      }
      toast({
        title: "Quote refreshed",
        description: "New quote loaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh quote.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const isFavorite = currentQuote ? favorites.some((f: any) => f.quoteId === currentQuote.id) : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your quote...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setLocation("/")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Quote of the Day</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </div>

      {/* Quote Toggle */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          <Button
            variant={currentQuoteType === 'daily' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setCurrentQuoteType('daily')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Daily Quote
          </Button>
          <Button
            variant={currentQuoteType === 'random' ? 'default' : 'ghost'}
            className="flex-1"
            onClick={() => setCurrentQuoteType('random')}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Random Quote
          </Button>
        </div>
      </div>

      {/* Main Quote Card */}
      {currentQuote && (
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-8">
              <div className="text-center">
                {/* Quote Text */}
                <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-6 leading-relaxed">
                  "{currentQuote.text}"
                </blockquote>
                
                {/* Author */}
                <p className="text-lg text-gray-600 mb-2">— {currentQuote.author}</p>
                
                {/* Category */}
                <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-8">
                  {currentQuote.category}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => favoriteMutation.mutate(currentQuote)}
                    disabled={favoriteMutation.isPending}
                    className={isFavorite ? "text-red-600 border-red-200 hover:bg-red-50" : ""}
                  >
                    <Heart 
                      className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} 
                    />
                    {isFavorite ? 'Favorited' : 'Favorite'}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleShare(currentQuote)}
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleDownload(currentQuote)}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-500">
            <p>
              {currentQuoteType === 'daily' 
                ? "This is your quote for today. Come back tomorrow for a new one!" 
                : "Click refresh to get another random quote anytime."
              }
            </p>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {selectedQuote && (
        <ShareModal
          quote={selectedQuote}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  );
}