import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Share2, Download, Search, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QuotePreviewModal } from "@/components/quote-preview-modal";
import { Header } from "@/components/header";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContentItem {
  id: string;
  text: string;
  author?: string;
  category: string;
  source?: string;
  type: 'quote' | 'message';
}

const contentCategories = [
  { id: "all", label: "All Content", type: "both" },
  { id: "motivation", label: "Motivation", type: "quote" },
  { id: "love", label: "Love", type: "both" },
  { id: "hustle", label: "Hustle", type: "quote" },
  { id: "wisdom", label: "Wisdom", type: "quote" },
  { id: "life", label: "Life", type: "quote" },
  { id: "good-morning", label: "Good Morning", type: "message" },
  { id: "good-night", label: "Good Night", type: "message" },
  { id: "romantic", label: "Romantic", type: "both" },
  { id: "sad", label: "Sad", type: "message" },
  { id: "breakup", label: "Breakup", type: "message" },
  { id: "friendship", label: "Friendship", type: "message" },
  { id: "birthday", label: "Birthday", type: "message" },
  { id: "congratulations", label: "Congratulations", type: "message" },
  { id: "encouragement", label: "Encouragement", type: "message" },
  { id: "thank-you", label: "Thank You", type: "message" },
  { id: "apology", label: "Apology", type: "message" },
];

export default function UnifiedContentPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [contentType, setContentType] = useState<'all' | 'quotes' | 'messages'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch unified content
  const { data: allContent = [], isLoading } = useQuery<ContentItem[]>({
    queryKey: ["/api/unified-content", selectedCategory, contentType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (contentType !== "all") params.append("type", contentType);
      
      const response = await fetch(`/api/unified-content?${params}`);
      if (!response.ok) throw new Error("Failed to fetch content");
      return response.json();
    },
  });

  // Fetch favorites
  const { data: favorites = [] } = useQuery<ContentItem[]>({
    queryKey: ["/api/unified-favorites"],
    queryFn: async () => {
      const response = await fetch("/api/unified-favorites");
      if (!response.ok) throw new Error("Failed to fetch favorites");
      return response.json();
    },
  });

  // Add to favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (item: ContentItem) => {
      const response = await fetch("/api/unified-favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error("Failed to add favorite");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/unified-favorites"] });
      toast({
        title: "Added to favorites",
        description: "Content saved to your favorites.",
      });
    },
  });

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/unified-favorites/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove favorite");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/unified-favorites"] });
      toast({
        title: "Removed from favorites",
        description: "Content removed from your favorites.",
      });
    },
  });

  // Get random content mutation
  const randomContentMutation = useMutation({
    mutationFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (contentType !== "all") params.append("type", contentType);
      
      const response = await fetch(`/api/unified-content/random?${params}`);
      if (!response.ok) throw new Error("Failed to fetch random content");
      return response.json();
    },
    onSuccess: (item) => {
      setPreviewItem(item);
      setIsPreviewOpen(true);
    },
  });

  // Filter content based on search
  const filteredContent = allContent.filter((item) => {
    const itemText = item.text || '';
    const itemAuthor = item.author || '';
    const itemSource = item.source || '';
    const matchesSearch = itemText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         itemAuthor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         itemSource.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Check if item is favorited
  const isItemFavorited = (itemId: string) => {
    return favorites.some(fav => fav.id === itemId);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (item: ContentItem) => {
    if (isItemFavorited(item.id)) {
      removeFavoriteMutation.mutate(item.id);
    } else {
      addFavoriteMutation.mutate(item);
    }
  };

  // Handle category change with animation
  const handleCategoryChange = async (categoryId: string) => {
    if (categoryId === selectedCategory) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedCategory(categoryId);
      setIsTransitioning(false);
    }, 150);
  };

  // Handle content type change
  const handleContentTypeChange = (type: 'all' | 'quotes' | 'messages') => {
    setContentType(type);
  };

  const handleShare = (item: ContentItem) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  };

  const handleDownload = (item: ContentItem) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Content text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    
    const maxWidth = canvas.width - 100;
    const lineHeight = 40;
    const words = item.text.split(' ');
    let line = '';
    let y = canvas.height / 2 - 50;

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

    // Author (if exists)
    if (item.author) {
      ctx.font = '24px Arial';
      ctx.fillText(`- ${item.author}`, canvas.width / 2, y + 60);
    }

    // Type badge
    ctx.font = '18px Arial';
    ctx.fillText(`${item.type.toUpperCase()}`, canvas.width / 2, canvas.height - 50);

    // Download
    const link = document.createElement('a');
    link.download = `${item.type}-${item.id}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Content downloaded!",
      description: "Image saved to your device.",
    });
  };

  const selectedCategoryData = contentCategories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <Header />
      
      {/* Content Header */}
      <motion.div 
        className="bg-white shadow-sm border-b sticky top-16 z-10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <motion.div 
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div>
              <motion.h1 
                className="text-2xl font-bold text-gray-900 flex items-center"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                📚 Content Library
              </motion.h1>
              <p className="text-gray-600 mt-1">
                Discover inspiring quotes and meaningful messages
              </p>
            </div>
            
            <Button
              onClick={() => randomContentMutation.mutate()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={randomContentMutation.isPending}
            >
              🎲 Random Content
            </Button>
          </motion.div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search quotes and messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Content Type Filter */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={contentType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleContentTypeChange('all')}
            >
              All Content
            </Button>
            <Button
              variant={contentType === 'quotes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleContentTypeChange('quotes')}
            >
              Quotes Only
            </Button>
            <Button
              variant={contentType === 'messages' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleContentTypeChange('messages')}
            >
              Messages Only
            </Button>
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedCategoryData?.label || "Select Category"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                {contentCategories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={selectedCategory === category.id ? "bg-blue-50" : ""}
                  >
                    {category.label}
                    <span className="ml-auto text-xs text-gray-500">
                      {category.type === 'both' ? 'Q&M' : category.type === 'quote' ? 'Q' : 'M'}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {isLoading || isTransitioning ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[...Array(6)].map((_, index) => (
                <motion.div
                  key={`loading-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : filteredContent.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search terms" : "Content will appear here"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {filteredContent.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === 'quote' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.type}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          {item.category}
                        </span>
                      </div>
                      
                      <blockquote className="text-gray-800 mb-4 leading-relaxed">
                        "{item.text}"
                      </blockquote>
                      
                      {item.author && (
                        <p className="text-sm text-gray-600 mb-4 font-medium">
                          — {item.author}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFavoriteToggle(item)}
                            className={isItemFavorited(item.id) ? "text-red-500" : "text-gray-500"}
                          >
                            <Heart className={`h-4 w-4 ${isItemFavorited(item.id) ? 'fill-current' : ''}`} />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(item)}
                            className="text-gray-500"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare(item)}
                            className="text-gray-500"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {item.source && (
                          <span className="text-xs text-gray-400">
                            {item.source}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <QuotePreviewModal
          quote={{
            id: previewItem.id,
            text: previewItem.text,
            author: previewItem.author || '',
            category: previewItem.category,
            source: previewItem.source
          }}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewItem(null);
          }}
        />
      )}
    </div>
  );
}