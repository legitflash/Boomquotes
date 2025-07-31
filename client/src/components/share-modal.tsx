import { Facebook, Twitter, Instagram, Link2, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Quote } from "@shared/schema";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
}

export function ShareModal({ isOpen, onClose, quote }: ShareModalProps) {
  const { toast } = useToast();

  if (!quote) return null;

  const shareText = `"${quote.text}" — ${quote.author}`;
  const shareUrl = window.location.origin;

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\nShared from BoomQuotes - ${shareUrl}`)}`;
    window.open(url, '_blank');
  };

  const shareToInstagram = () => {
    // Instagram doesn't have a direct sharing URL, so we'll copy to clipboard
    copyToClipboard();
    toast({
      title: "Quote copied!",
      description: "Paste this quote in your Instagram post or story.",
    });
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BoomQuotes',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\nShared from BoomQuotes - ${shareUrl}`);
      toast({
        title: "Copied to clipboard!",
        description: "Quote has been copied to your clipboard.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Share this quote</DialogTitle>
          <DialogDescription className="text-center text-neutral-500">
            Spread the inspiration
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={shareToWhatsApp}
            className="flex items-center justify-center p-4 bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button
            onClick={shareToTwitter}
            className="flex items-center justify-center p-4 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            X (Twitter)
          </Button>
          <Button
            onClick={shareToFacebook}
            className="flex items-center justify-center p-4 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </Button>
          <Button
            onClick={shareNative}
            className="flex items-center justify-center p-4 bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={shareToInstagram}
            className="flex items-center justify-center p-4 bg-pink-500 text-white hover:bg-pink-600 transition-colors"
          >
            <Instagram className="h-4 w-4 mr-2" />
            Instagram
          </Button>
          <Button
            onClick={copyToClipboard}
            className="flex items-center justify-center p-4 bg-gray-600 text-white hover:bg-gray-700 transition-colors"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
