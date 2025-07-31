import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Favorite, Quote } from "@shared/schema";

export function useFavorites() {
  return useQuery<Favorite[]>({
    queryKey: ["/api/favorites"],
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quote: Quote) => {
      const response = await apiRequest("POST", "/api/favorites", {
        quoteId: quote.id,
        quoteData: quote
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (quoteId: string) => {
      const response = await apiRequest("DELETE", `/api/favorites/${quoteId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });
}

export function useIsFavorite(quoteId: string) {
  return useQuery<{ isFavorite: boolean }>({
    queryKey: ["/api/favorites", quoteId],
    enabled: !!quoteId,
  });
}
