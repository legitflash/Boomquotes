import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { SplashScreen } from "@/components/splash-screen";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import DailyCheckIn from "@/pages/daily-checkin";
import Profile from "@/pages/profile";
import Bookmarks from "@/pages/bookmarks";
import Invite from "@/pages/invite";
import QuotePage from "@/pages/quote-page";
import TermsOfService from "@/pages/terms-of-service";
import NotFound from "@/pages/not-found";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/daily" component={DailyCheckIn} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/bookmarks" component={Bookmarks} />
      <ProtectedRoute path="/invite" component={Invite} />
      <ProtectedRoute path="/quote" component={QuotePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/terms" component={TermsOfService} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
