import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Share2, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { ShareModal } from "@/components/share-modal";
import { QuoteCard } from "@/components/quote-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Quote, Favorite } from "@shared/schema";

export default function Bookmarks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites"],
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const response = await apiRequest("DELETE", `/api/favorites/${quoteId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from bookmarks",
        description: "Quote removed from your bookmarks.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove bookmark.",
        variant: "destructive",
      });
    }
  });

  const filteredFavorites = favorites.filter(favorite => {
    if (!favorite || !favorite.quoteData) return false;
    const quoteData = favorite.quoteData as any;
    if (!quoteData.text || !quoteData.author || !quoteData.category) return false;
    
    const query = searchQuery.toLowerCase();
    return (
      quoteData.text.toLowerCase().includes(query) ||
      quoteData.author.toLowerCase().includes(query) ||
      quoteData.category.toLowerCase().includes(query)
    );
  });

  const handleShare = (quote: Quote) => {
    setSelectedQuote(quote);
    setShareModalOpen(true);
  };

  const handleRemove = (quoteId: string) => {
    removeFavoriteMutation.mutate(quoteId);
  };

  const isFavorite = (quoteId: string) => {
    return favorites.some(fav => fav.quoteId === quoteId);
  };

  const handleToggleFavorite = (quote: Quote) => {
    if (isFavorite(quote.id)) {
      removeFavoriteMutation.mutate(quote.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Bookmarks</h1>
          <p className="text-gray-600">Your saved quotes for inspiration</p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search your bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{favorites.length}</div>
                <div className="text-sm text-gray-500">Total Bookmarks</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(favorites.map(f => (f.quoteData as any)?.category).filter(Boolean)).size}
                </div>
                <div className="text-sm text-gray-500">Categories</div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(favorites.map(f => (f.quoteData as any)?.author).filter(Boolean)).size}
                </div>
                <div className="text-sm text-gray-500">Authors</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookmarks Grid */}
        {filteredFavorites.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "No bookmarks match your search" : "No bookmarks yet"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery 
                    ? "Try a different search term" 
                    : "Start bookmarking quotes you love by tapping the heart icon"
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => window.location.href = "/"}>
                    Discover Quotes
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFavorites.map((favorite) => {
              const quoteData = favorite.quoteData as any;
              const quote: Quote = {
                id: favorite.quoteId,
                text: quoteData.text,
                author: quoteData.author,
                category: quoteData.category,
                source: quoteData.source || 'builtin'
              };

              return (
                <QuoteCard
                  key={favorite.id}
                  quote={quote}
                  onShare={(q) => {
                    setSelectedQuote(q);
                    setShareModalOpen(true);
                  }}
                  onToggleFavorite={() => handleRemove(favorite.quoteId)}
                  isFavorite={true}
                />
              );
            })}
          </div>
        )}
      </main>

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        quote={selectedQuote}
      />
    </div>
  );
}