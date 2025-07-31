import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    // If user is authenticated and app is loaded, skip splash faster
    if (!loading) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Wait for fade out animation
      }, user ? 1000 : 2500); // Shorter delay if user is already signed in

      return () => clearTimeout(timer);
    }
  }, [onComplete, user, loading]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center z-50 transition-opacity duration-300 opacity-0" />
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center z-50">
      <div className="text-center text-white animate-pulse">
        <div className="mb-6">
          <Quote className="h-16 w-16 mx-auto mb-4 animate-bounce" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Boomquotes</h1>
        <p className="text-xl opacity-90">Daily Inspiration Awaits</p>
        <div className="mt-8">
          <div className="w-12 h-1 bg-white rounded-full mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}