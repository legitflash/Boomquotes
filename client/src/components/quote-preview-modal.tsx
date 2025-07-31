import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, MessageCircle, Twitter, Facebook, Instagram, Link, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
}

interface QuotePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
  onShare?: (platform: string) => void;
}

export function QuotePreviewModal({ isOpen, onClose, quote, onShare }: QuotePreviewModalProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  if (!quote) return null;

  const handleShare = async (platform: string) => {
    setIsSharing(true);
    try {
      const shareText = `"${quote.text}" - ${quote.author}`;
      const shareUrl = window.location.href;

      switch (platform) {
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
          break;
        case 'instagram':
          // Copy to clipboard for Instagram story
          await navigator.clipboard.writeText(shareText);
          toast({
            title: "Copied to clipboard!",
            description: "Quote copied. Open Instagram and paste it in your story.",
          });
          break;
        case 'copy':
          await navigator.clipboard.writeText(shareText);
          toast({
            title: "Quote copied!",
            description: "Quote has been copied to your clipboard.",
          });
          break;
        case 'native':
          if (navigator.share) {
            await navigator.share({
              title: 'Inspiring Quote',
              text: shareText,
              url: shareUrl,
            });
          }
          break;
      }

      onShare?.(platform);
      
      toast({
        title: "Quote shared!",
        description: `Successfully shared via ${platform}`,
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Could not share the quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownload = () => {
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

    // Quote text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    
    const maxWidth = canvas.width - 100;
    const lineHeight = 40;
    const words = quote.text.split(' ');
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
    ctx.fillText(`- ${quote.author}`, canvas.width / 2, y + 60);

    // Download
    const link = document.createElement('a');
    link.download = `quote-${quote.id}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Quote downloaded!",
      description: "Quote image has been saved to your device.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto p-0">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header with close button */}
          <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Preview</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Quote Preview */}
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-green-800 mb-1">Random quote generated!</p>
              <p className="text-sm text-green-600">Enjoy this new quote.</p>
            </div>

            <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-6 mb-6">
              <blockquote className="text-lg font-medium mb-4 leading-relaxed">
                "{quote.text}"
              </blockquote>
              <cite className="text-blue-100 text-sm">- {quote.author}</cite>
            </Card>

            {/* Share Options */}
            <div className="text-center mb-6">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-xl font-bold text-gray-900">Share this quote</DialogTitle>
                <p className="text-gray-600">Spread the inspiration</p>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleShare('whatsapp')}
                  disabled={isSharing}
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center space-x-2 py-3"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </Button>

                <Button
                  onClick={() => handleShare('twitter')}
                  disabled={isSharing}
                  className="bg-black hover:bg-gray-800 text-white flex items-center justify-center space-x-2 py-3"
                >
                  <Twitter className="h-4 w-4" />
                  <span>X (Twitter)</span>
                </Button>

                <Button
                  onClick={() => handleShare('facebook')}
                  disabled={isSharing}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2 py-3"
                >
                  <Facebook className="h-4 w-4" />
                  <span>Facebook</span>
                </Button>

                <Button
                  onClick={() => handleShare('native')}
                  disabled={isSharing}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center space-x-2 py-3"
                >
                  <Link className="h-4 w-4" />
                  <span>Share</span>
                </Button>

                <Button
                  onClick={() => handleShare('instagram')}
                  disabled={isSharing}
                  className="bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center space-x-2 py-3"
                >
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </Button>

                <Button
                  onClick={() => handleShare('copy')}
                  disabled={isSharing}
                  className="bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center space-x-2 py-3"
                >
                  <Link className="h-4 w-4" />
                  <span>Copy Link</span>
                </Button>
              </div>

              <Button
                onClick={handleDownload}
                variant="outline"
                className="w-full mt-3 flex items-center justify-center space-x-2 py-3"
              >
                <Download className="h-4 w-4" />
                <span>Download Image</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}