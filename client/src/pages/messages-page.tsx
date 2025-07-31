import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, Share2, Download, Search, Shuffle, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QuotePreviewModal } from "@/components/quote-preview-modal";

interface Message {
  id: string;
  text: string;
  author: string;
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
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedCategory],
  });

  // Add to favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (message: Message) => {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: message.id,
          quoteData: message,
        }),
      });
      if (!response.ok) throw new Error("Failed to add favorite");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Added to favorites!",
        description: "Message saved to your favorites.",
      });
    },
  });

  // Get random message mutation
  const randomMessageMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/messages/random");
      if (!response.ok) throw new Error("Failed to fetch random message");
      return response.json();
    },
    onSuccess: (message) => {
      setPreviewMessage(message);
      setIsPreviewOpen(true);
    },
  });

  // Filter messages based on category and search
  const filteredMessages = messages.filter((message) => {
    const matchesCategory = selectedCategory === "all" || message.category === selectedCategory;
    const matchesSearch = message.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

    // Author
    ctx.font = '24px Arial';
    ctx.fillText(`- ${message.author}`, canvas.width / 2, y + 60);

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
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MessageCircle className="h-6 w-6 mr-2 text-blue-600" />
                Messages
              </h1>
              <p className="text-gray-600">Share meaningful messages for every moment</p>
            </div>
            <Button
              onClick={() => randomMessageMutation.mutate()}
              disabled={randomMessageMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Random Message
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {messageCategories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                className={selectedCategory === category.id ? category.color : ""}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Grid */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms" : "Messages will appear here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMessages.map((message) => (
              <Card key={message.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <blockquote className="text-gray-900 mb-4 leading-relaxed">
                    "{message.text}"
                  </blockquote>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <cite className="text-sm text-gray-600">- {message.author}</cite>
                      <Badge variant="secondary" className="text-xs">
                        {messageCategories.find(c => c.id === message.category)?.label || message.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addFavoriteMutation.mutate(message)}
                        disabled={addFavoriteMutation.isPending}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(message)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(message)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quote Preview Modal */}
      <QuotePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        quote={previewMessage}
        onShare={(platform) => {
          console.log(`Shared message via ${platform}`);
        }}
      />
    </div>
  );
}