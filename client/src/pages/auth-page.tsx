import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Quote, Loader2, MapPin } from "lucide-react";

export default function AuthPage() {
  const { user, signIn, signUp, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");

  // Redirect if already logged in
  if (user && !loading) {
    return <Redirect to="/" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
    } catch (error) {
      // Error handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signUp(signupEmail, signupPassword, signupPhone);
    } catch (error) {
      // Error handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Hero Section */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Quote className="text-primary text-3xl" />
              <h1 className="text-4xl font-bold text-primary">BoomWheel</h1>
            </div>
            <h2 className="text-3xl font-light text-gray-800">
              Daily Inspiration & Rewards
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Discover inspiring quotes, complete daily check-ins, and earn rewards. 
              Join thousands of Nigerians getting motivated every day.
            </p>
          </div>
          
          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Daily inspirational quotes from around the world</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span>Complete daily check-ins and track your progress</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Earn ₦500 airtime after 30 completed check-ins</span>
            </div>
            <div className="flex items-center space-x-3 text-primary font-medium">
              <MapPin className="w-4 h-4" />
              <span>Available for Nigerian users</span>
            </div>
          </div>

          {/* Quote Sample */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
            <blockquote className="text-lg italic text-gray-800 mb-3">
              "The only way to do great work is to love what you do."
            </blockquote>
            <footer className="text-primary font-medium">— Steve Jobs</footer>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-2">
              <div className="lg:hidden mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Quote className="text-primary text-2xl" />
                  <h1 className="text-2xl font-bold text-primary">BoomWheel</h1>
                </div>
                <p className="text-sm text-gray-600">Daily inspiration & rewards</p>
              </div>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <div className="text-center mb-4">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>Sign in to continue your journey</CardDescription>
                  </div>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <div className="text-center mb-4">
                    <CardTitle className="text-xl">Create account</CardTitle>
                    <CardDescription>Start your daily inspiration journey</CardDescription>
                  </div>
                  
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">
                        Phone Number 
                        <span className="text-sm text-primary font-normal ml-1">(for airtime rewards)</span>
                      </Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+234 802 123 4567"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        className="h-11"
                      />
                      <p className="text-xs text-gray-500">
                        Required for Nigerian users to receive airtime rewards
                      </p>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-11 text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>🇳🇬 Proudly serving Nigerian users</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}