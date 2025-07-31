import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuoteCard } from "./quote-card";
import type { Quote } from "@shared/schema";

interface QuotesGridProps {
  category: string;
  onShare: (quote: Quote) => void;
  onToggleFavorite: (quote: Quote) => void;
  isFavorite: (quoteId: string) => boolean;
}

export function QuotesGrid({ category, onShare, onToggleFavorite, isFavorite }: QuotesGridProps) {
  const { data: quotes, isLoading } = useQuery<Quote[]>({
    queryKey: ["/api/quotes", category === "all" ? undefined : category],
  });

  if (isLoading) {
    return (
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!quotes || quotes.length === 0) {
    return (
      <section>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No quotes found for this category.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quotes.map((quote) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            onShare={onShare}
            onToggleFavorite={onToggleFavorite}
            isFavorite={isFavorite(quote.id)}
          />
        ))}
      </div>

      {quotes.length >= 6 && (
        <div className="text-center mt-12">
          <Button
            variant="outline"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all px-8 py-3"
          >
            Load More Quotes
          </Button>
        </div>
      )}
    </section>
  );
}
