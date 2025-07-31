import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, Share2, Download, Search, Shuffle, MessageCircle, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { QuotePreviewModal } from "@/components/quote-preview-modal";
import { Header } from "@/components/header";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  author?: string;
  category: string;
  source?: string;
}

const messageCategories = [
  { id: "all", label: "All", color: "bg-blue-100 text-blue-800" },
  { id: "good-morning", label: "Good Morning", color: "bg-yellow-100 text-yellow-800" },
  { id: "good-night", label: "Good Night", color: "bg-indigo-100 text-indigo-800" },
  { id: "love", label: "Love", color: "bg-red-100 text-red-800" },
  { id: "romantic", label: "Romantic", color: "bg-pink-100 text-pink-800" },
  { id: "sad", label: "Sad", color: "bg-gray-100 text-gray-800" },
  { id: "breakup", label: "Breakup", color: "bg-purple-100 text-purple-800" },
  { id: "friendship", label: "Friendship", color: "bg-green-100 text-green-800" },
  { id: "birthday", label: "Birthday", color: "bg-orange-100 text-orange-800" },
  { id: "congratulations", label: "Congratulations", color: "bg-emerald-100 text-emerald-800" },
  { id: "encouragement", label: "Encouragement", color: "bg-teal-100 text-teal-800" },
  { id: "thank-you", label: "Thank You", color: "bg-cyan-100 text-cyan-800" },
  { id: "apology", label: "Apology", color: "bg-rose-100 text-rose-800" },
];

export default function MessagesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [previewMessage, setPreviewMessage] = useState<Message | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages based on category
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedCategory],
    queryFn: async () => {
      const endpoint = selectedCategory === "all" ? "/api/messages/all" : `/api/messages/${selectedCategory}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch messages");
      const data = await response.json();
      
      // If we get an array of strings instead of message objects, convert them
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
        return data.map((text: string, index: number) => ({
          id: `msg_${selectedCategory}_${Date.now()}_${index}`,
          text,
          author: 'Boomquotes Collection',
          category: selectedCategory,
          source: 'Boomquotes Collection'
        }));
      }
      
      return data;
    },
  });

  // Fetch message favorites
  const { data: messageFavorites = [] } = useQuery<Message[]>({
    queryKey: ["/api/message-favorites"],
    queryFn: async () => {
      const response = await fetch("/api/message-favorites");
      if (!response.ok) throw new Error("Failed to fetch message favorites");
      return response.json();
    },
  });

  // Add to message favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (message: Message) => {
      const response = await fetch("/api/message-favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId: message.id,
          messageText: message.text,
          category: message.category,
        }),
      });
      if (!response.ok) throw new Error("Failed to add favorite");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/message-favorites"] });
      toast({
        title: "Added to favorites!",
        description: "Message saved to your favorites.",
      });
    },
  });

  // Remove from message favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/message-favorites/${messageId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove favorite");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/message-favorites"] });
      toast({
        title: "Removed from favorites",
        description: "Message removed from your favorites.",
      });
    },
  });

  // Get random message mutation
  const randomMessageMutation = useMutation({
    mutationFn: async () => {
      const category = selectedCategory === "all" ? "" : selectedCategory;
      const response = await fetch(`/api/messages/random?category=${category}`);
      if (!response.ok) throw new Error("Failed to fetch random message");
      return response.json();
    },
    onSuccess: (message) => {
      setPreviewMessage(message);
      setIsPreviewOpen(true);
    },
  });

  // Filter messages based on search (category filtering is now handled by API)
  const filteredMessages = messages.filter((message) => {
    const messageText = message.text || '';
    const messageSource = message.source || '';
    const matchesSearch = messageText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         messageSource.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Check if message is favorited
  const isMessageFavorited = (messageId: string) => {
    return messageFavorites.some(fav => fav.id === messageId);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (message: Message) => {
    if (isMessageFavorited(message.id)) {
      removeFavoriteMutation.mutate(message.id);
    } else {
      addFavoriteMutation.mutate(message);
    }
  };

  // Handle category change with animation
  const handleCategoryChange = async (categoryId: string) => {
    if (categoryId === selectedCategory) return;
    
    setIsTransitioning(true);
    
    // Brief delay to show transition effect
    setTimeout(() => {
      setSelectedCategory(categoryId);
      setIsTransitioning(false);
    }, 150);
  };

  const handleShare = (message: Message) => {
    setPreviewMessage(message);
    setIsPreviewOpen(true);
  };

  const handleDownload = (message: Message) => {
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

    // Message text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    
    const maxWidth = canvas.width - 100;
    const lineHeight = 40;
    const words = message.text.split(' ');
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

    // Author (only if exists)
    if (message.author) {
      ctx.font = '24px Arial';
      ctx.fillText(`- ${message.author}`, canvas.width / 2, y + 60);
    }

    // Download
    const link = document.createElement('a');
    link.download = `message-${message.id}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Message downloaded!",
      description: "Message image saved to your device.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <Header />
      
      {/* Messages Header */}
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
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    transition: { duration: 2, repeat: Infinity, repeatDelay: 5 }
                  }}
                >
                  <MessageCircle className="h-6 w-6 mr-2 text-blue-600" />
                </motion.div>
                Messages
              </motion.h1>
              <motion.p 
                className="text-gray-600"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                Share meaningful messages for every moment
              </motion.p>
            </div>
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => randomMessageMutation.mutate()}
                disabled={randomMessageMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center transition-all duration-200"
              >
                <motion.div
                  animate={randomMessageMutation.isPending ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: randomMessageMutation.isPending ? Infinity : 0 }}
                >
                  <Shuffle className="h-4 w-4 mr-2" />
                </motion.div>
                Random Message
              </Button>
            </motion.div>
          </motion.div>

          {/* Search */}
          <motion.div 
            className="relative mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
            />
          </motion.div>

          {/* Category Dropdown Filter */}
          <div className="w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {messageCategories.find(cat => cat.id === selectedCategory)?.label || "Select Category"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 max-h-60 overflow-y-auto">
                {messageCategories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={selectedCategory === category.id ? "bg-blue-50" : ""}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{category.label}</span>
                      {selectedCategory === category.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* Messages Grid */}
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
                  key={index}
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
          ) : filteredMessages.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  transition: { duration: 2, repeat: Infinity, repeatDelay: 3 }
                }}
              >
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search terms" : "Messages will appear here"}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`messages-${selectedCategory}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                    <CardContent className="p-6">
                      <motion.blockquote 
                        className="text-gray-900 mb-4 leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                      >
                        "{message.text}"
                      </motion.blockquote>
                      
                      <motion.div 
                        className="flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.3 }}
                      >
                        <div className="flex items-center space-x-2">
                          <cite className="text-sm text-gray-600">- {message.author}</cite>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <Badge variant="secondary" className="text-xs">
                              {messageCategories.find(c => c.id === message.category)?.label || message.category}
                            </Badge>
                          </motion.div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFavoriteToggle(message)}
                              disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                              className={`transition-colors ${
                                isMessageFavorited(message.id)
                                  ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                                  : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                              }`}
                            >
                              <Heart className={`h-4 w-4 ${isMessageFavorited(message.id) ? "fill-current" : ""}`} />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(message)}
                              className="hover:bg-blue-50 hover:text-blue-500 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShare(message)}
                              className="hover:bg-green-50 hover:text-green-500 transition-colors"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message Preview Modal */}
      {previewMessage && (
        <QuotePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          quote={{
            id: previewMessage.id,
            text: previewMessage.text,
            author: previewMessage.source || 'Boomquotes Collection',
            category: previewMessage.category
          }}
          onShare={(platform) => {
            console.log(`Shared message via ${platform}`);
          }}
        />
      )}
    </div>
  );
}