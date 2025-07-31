import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { Clock, Gift, CheckCircle, Zap, Target, Trophy, Flame } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { CheckIn, CheckinStreak, ButtonClick } from "@shared/schema";

interface CheckinData {
  todayCheckin: CheckIn | null;
  streak: CheckinStreak | null;
  canCompleteToday: boolean;
  nextRewardAt: number;
}

interface AdsterraAd {
  show: () => void;
  isReady: boolean;
}

// Adsterra Social Bar Ad component
function AdsterraAd() {
  useEffect(() => {
    // Load Adsterra ad script
    const script = document.createElement('script');
    script.async = true;
    script.src = '//pl24527965.profitablecpmrate.com/6b/64/65/6b646568b62d8dba3644f7dd42e62c5e.js';
    script.onload = () => {
      console.log('Adsterra ad loaded');
    };
    document.head.appendChild(script);

    return () => {
      // Clean up script
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full h-20 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-sm">
      <div id="container-6b646568b62d8dba3644f7dd42e62c5e">
        Adsterra Social Bar Ad
      </div>
    </div>
  );
}

export default function DailyCheckIn() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [buttonCooldowns, setButtonCooldowns] = useState<Record<number, number>>({});
  const [showAd, setShowAd] = useState(false);

  // Fetch today's check-in data
  const { data: checkinData, isLoading } = useQuery<CheckinData>({
    queryKey: ["/api/checkins/today"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/checkins/today");
      return await response.json();
    },
  });

  // Button click mutation
  const clickButtonMutation = useMutation({
    mutationFn: async (buttonNumber: number) => {
      const response = await apiRequest("POST", `/api/checkins/click/${buttonNumber}`);
      return await response.json();
    },
    onSuccess: (data) => {
      // Show ad
      setShowAd(true);
      setTimeout(() => setShowAd(false), 3000);

      // Update button cooldown
      if (data.buttonClick) {
        const cooldownUntil = new Date(data.buttonClick.cooldownUntil).getTime();
        const now = new Date().getTime();
        const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
        
        setButtonCooldowns(prev => ({
          ...prev,
          [data.buttonClick.buttonNumber]: cooldownSeconds
        }));
      }

      // Refresh check-in data
      queryClient.invalidateQueries({ queryKey: ["/api/checkins/today"] });

      if (data.completed) {
        toast({
          title: "Daily Check-in Complete! 🎉",
          description: `Streak: ${data.streak.currentStreak} days. ${data.streak.currentStreak === 30 ? "₦500 airtime reward earned!" : `${30 - data.streak.currentStreak} days until reward!`}`,
        });
      } else {
        toast({
          title: "Check-in Confirmed ✓",
          description: `${data.checkin.clickCount}/10 clicks completed today.`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Check-in Failed",
        description: error.message || "Please try again in a moment.",
        variant: "destructive",
      });
    }
  });

  // Update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setButtonCooldowns(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        
        Object.keys(updated).forEach(buttonStr => {
          const button = parseInt(buttonStr);
          if (updated[button] > 0) {
            updated[button]--;
            hasChanges = true;
          } else if (updated[button] === 0) {
            delete updated[button];
            hasChanges = true;
          }
        });
        
        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Initialize button cooldowns from existing data
  useEffect(() => {
    if (checkinData?.todayCheckin?.buttonClicks) {
      const now = new Date().getTime();
      const cooldowns: Record<number, number> = {};
      
      (checkinData.todayCheckin.buttonClicks as ButtonClick[]).forEach(click => {
        const cooldownUntil = new Date(click.cooldownUntil).getTime();
        const remaining = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
        if (remaining > 0) {
          cooldowns[click.buttonNumber] = remaining;
        }
      });
      
      setButtonCooldowns(cooldowns);
    }
  }, [checkinData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const todayCheckin = checkinData?.todayCheckin;
  const streak = checkinData?.streak;
  const clickCount = todayCheckin?.clickCount || 0;
  const isCompleted = todayCheckin?.completed || false;
  const progressPercent = (clickCount / 10) * 100;

  const getButtonStatus = (buttonNum: number): { 
    disabled: boolean; 
    label: string; 
    variant: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  } => {
    const buttonClicks = (todayCheckin?.buttonClicks as ButtonClick[]) || [];
    const hasClicked = buttonClicks.some(click => click.buttonNumber === buttonNum);
    const cooldown = buttonCooldowns[buttonNum];
    
    if (isCompleted) {
      return { disabled: true, label: hasClicked ? "✓" : "-", variant: "secondary" };
    }
    if (hasClicked && cooldown) {
      return { disabled: true, label: `${cooldown}s`, variant: "outline" };
    }
    if (hasClicked) {
      return { disabled: true, label: "✓", variant: "secondary" };
    }
    
    // Check if button is available based on sequential order
    const isAvailable = isButtonAvailable(buttonNum);
    if (!isAvailable) {
      return { disabled: true, label: `${buttonNum}`, variant: "ghost" };
    }
    
    return { disabled: false, label: `${buttonNum}`, variant: "default" };
  };

  const isButtonAvailable = (buttonNumber: number): boolean => {
    if (!todayCheckin) return buttonNumber === 1;
    
    const buttonClicks = (todayCheckin.buttonClicks as ButtonClick[]) || [];
    const buttonClick = buttonClicks.find(click => click.buttonNumber === buttonNumber);
    
    if (!buttonClick) {
      // Button hasn't been clicked yet - check sequential order
      if (buttonNumber === 1) return true;
      
      // Check if all previous buttons have been clicked and cooled down
      for (let i = 1; i < buttonNumber; i++) {
        const prevButtonClick = buttonClicks.find(click => click.buttonNumber === i);
        if (!prevButtonClick) return false; // Previous button not clicked
        
        const prevCooldownEnd = new Date(prevButtonClick.cooldownUntil);
        if (new Date() < prevCooldownEnd) return false; // Previous button still on cooldown
      }
      return true;
    }
    
    // Button was clicked - check cooldown
    const cooldownEnd = new Date(buttonClick.cooldownUntil);
    return new Date() >= cooldownEnd;
      
      // Check if all previous buttons have been clicked and cooled down
      for (let i = 1; i < buttonNumber; i++) {
        const prevButtonClick = buttonClicks.find(click => click.buttonNumber === i);
        if (!prevButtonClick) return false; // Previous button not clicked
        
        const prevCooldownEnd = new Date(prevButtonClick.cooldownUntil);
        if (new Date() < prevCooldownEnd) return false; // Previous button still on cooldown
      }
      return true;
    }
    
    // Button was clicked - check cooldown
    const cooldownEnd = new Date(buttonClick.cooldownUntil);
    return new Date() >= cooldownEnd;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Daily Check-in Challenge
          </h1>
          <p className="text-lg text-gray-600">
            Complete 10 clicks daily for 30 days to earn ₦500 airtime!
          </p>
        </div>

        {/* Ad Display */}
        {showAd && (
          <div className="mb-6">
            <AdsterraAd />
          </div>
        )}

        {/* Progress Card */}
        <Card className="mb-8 shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              Today's Progress
            </CardTitle>
            <CardDescription>
              {isCompleted ? "Daily check-in completed! 🎉" : `${clickCount}/10 clicks completed`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progressPercent} className="h-4" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{clickCount} clicks done</span>
                <span>{10 - clickCount} remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 10 Check-in Buttons */}
        <Card className="mb-8 shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-600" />
              Check-in Buttons
            </CardTitle>
            <CardDescription>
              Click buttons sequentially (1→2→3...→10). Wait 1 minute between each click for ads and cooldown.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(buttonNum => {
                const { disabled, label, variant } = getButtonStatus(buttonNum);
                
                return (
                  <Button
                    key={buttonNum}
                    variant={variant}
                    size="lg"
                    disabled={disabled || clickButtonMutation.isPending || !isButtonAvailable(buttonNum)}
                    onClick={() => clickButtonMutation.mutate(buttonNum)}
                    className="h-16 text-lg font-bold"
                  >
                    {clickButtonMutation.isPending && 
                     clickButtonMutation.variables === buttonNum ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      label
                    )}
                  </Button>
                );
              })}
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>How it works:</strong> Click buttons in order (1→2→3...→10). 
                Each click shows an ad and starts a 1-minute cooldown before the next button unlocks. 
                Complete all 10 for the day to maintain your streak!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Streak Information */}
        <Card className="mb-8 shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-600" />
              Check-in Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {streak?.currentStreak || 0}
                </div>
                <div className="text-sm text-gray-500">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {streak?.longestStreak || 0}
                </div>
                <div className="text-sm text-gray-500">Longest Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {streak?.totalDays || 0}
                </div>
                <div className="text-sm text-gray-500">Total Days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reward Progress */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-6 w-6 text-green-600" />
              Airtime Reward Progress
            </CardTitle>
            <CardDescription>
              Complete 30 consecutive days to earn ₦500 airtime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress 
                value={((streak?.currentStreak || 0) / 30) * 100} 
                className="h-4"
              />
              <div className="flex justify-between text-sm">
                <span>{streak?.currentStreak || 0}/30 days completed</span>
                <span>
                  {(streak?.currentStreak || 0) >= 30 ? (
                    <Badge className="bg-green-100 text-green-800">
                      <Trophy className="h-3 w-3 mr-1" />
                      Reward Earned!
                    </Badge>
                  ) : (
                    `${30 - (streak?.currentStreak || 0)} days remaining`
                  )}
                </span>
              </div>
              
              {(streak?.currentStreak || 0) >= 30 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    🎉 Congratulations! You've completed 30 consecutive days. 
                    Your ₦500 airtime reward is ready for processing.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}