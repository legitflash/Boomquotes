import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { SplashScreen } from "@/components/splash-screen";
import { AdLayout, useInterstitialCheck } from "@/components/ads/ad-layout";
import Home from "@/pages/home";
import MessagesPage from "@/pages/messages-page";
import AuthPage from "@/pages/auth-page";
import DailyCheckIn from "@/pages/daily-checkin";
import EnhancedProfile from "@/pages/enhanced-profile";
import Bookmarks from "@/pages/bookmarks";
import Invite from "@/pages/invite";
import EnhancedRewards from "@/pages/enhanced-rewards";
import QuotePage from "@/pages/quote-page";
import TermsOfService from "@/pages/terms-of-service";
import NotFound from "@/pages/not-found";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { user, loading } = useAuth();
  const shouldShowInterstitial = useInterstitialCheck();
  
  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle check-in social bar click
  const handleSocialBarClick = () => {
    // Navigate to daily check-in page
    window.location.href = '/daily';
  };

  return (
    <AdLayout 
      showInterstitial={shouldShowInterstitial && user !== null}
      enablePushNotifications={user !== null}
      onSocialBarClick={handleSocialBarClick}
    >
      <Switch>
        <ProtectedRoute path="/" component={Home} />
        <ProtectedRoute path="/messages" component={MessagesPage} />
        <ProtectedRoute path="/daily" component={DailyCheckIn} />
        <ProtectedRoute path="/profile" component={EnhancedProfile} />
        <ProtectedRoute path="/bookmarks" component={Bookmarks} />
        <ProtectedRoute path="/invite" component={Invite} />
        <ProtectedRoute path="/rewards" component={EnhancedRewards} />
        <ProtectedRoute path="/quote" component={QuotePage} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/terms" component={TermsOfService} />
        <Route component={NotFound} />
      </Switch>
    </AdLayout>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          {showSplash ? (
            <SplashScreen onComplete={() => setShowSplash(false)} />
          ) : (
            <Router />
          )}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
