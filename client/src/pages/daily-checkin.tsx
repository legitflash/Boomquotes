import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Clock, Gift, CheckCircle, Phone, Trophy, Target } from "lucide-react";

interface CheckInStatus {
  has_checkin_today: boolean;
  clicks_completed: number;
  total_clicks_required: number;
  is_completed: boolean;
  can_click: boolean;
  next_click_at: string | null;
  current_streak: number;
  total_checkins: number;
  longest_streak: number;
}

interface AirtimeReward {
  id: string;
  amount: number;
  phone_number: string;
  status: string;
  checkins_completed: number;
  created_at: string;
}

export default function DailyCheckIn() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  
  const [checkinStatus, setCheckinStatus] = useState<CheckInStatus | null>(null);
  const [isClicking, setIsClicking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [airtimeRewards, setAirtimeRewards] = useState<AirtimeReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCheckinStatus();
      fetchAirtimeRewards();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            fetchCheckinStatus(); // Refresh status when cooldown ends
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const fetchCheckinStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_checkin_status', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching checkin status:', error);
        return;
      }

      setCheckinStatus(data);
      
      // Calculate time remaining if user can't click yet
      if (data.next_click_at && !data.can_click) {
        const nextClickTime = new Date(data.next_click_at).getTime();
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.ceil((nextClickTime - now) / 1000));
        setTimeRemaining(remaining);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckinClick = async () => {
    if (!user || isClicking || !checkinStatus?.can_click) return;

    setIsClicking(true);

    try {
      const { data, error } = await supabase.rpc('handle_checkin_click', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error handling checkin click:', error);
        toast({
          title: "Error",
          description: "Failed to process click. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Show ad simulation
      simulateAd();

      // Refresh status to get updated data
      await fetchCheckinStatus();

      if (data.is_completed) {
        toast({
          title: "Check-in Complete! 🎉",
          description: `You've completed today's check-in! Current streak: ${data.current_streak || checkinStatus.current_streak + 1} days`,
        });
        
        // Check if user is Nigerian and needs to provide phone for 30-day reward
        if (userProfile?.country === 'NG' && (data.current_streak || checkinStatus.current_streak + 1) >= 30 && !userProfile.phone) {
          setShowPhoneInput(true);
        }
      } else {
        toast({
          title: "Ad Watched! 📺",
          description: `Click ${data.total_clicks_required - data.clicks_completed} more times to complete check-in`,
        });
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClicking(false);
    }
  };

  const simulateAd = () => {
    // Simulate ad display - in real app, this would trigger actual ad
    toast({
      title: "💰 Ad Displayed",
      description: "Thanks for watching the ad! You've earned your click.",
    });
  };

  const fetchAirtimeRewards = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setAirtimeRewards(data);
      }
    } catch (error) {
      console.error('Error fetching airtime rewards:', error);
    }
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || !user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ phone: phoneNumber })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating phone:', error);
        toast({
          title: "Error",
          description: "Failed to save phone number. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Phone Number Saved! 📱",
        description: "Your phone number has been saved for airtime rewards.",
      });
      
      setShowPhoneInput(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!checkinStatus) return 0;
    return (checkinStatus.clicks_completed / checkinStatus.total_clicks_required) * 100;
  };

  const canClickNext = checkinStatus?.can_click && !isClicking && !checkinStatus.is_completed;
  const isNigerian = userProfile?.country === 'NG';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your check-in status...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Daily Check-in</h1>
          <p className="text-gray-600 text-lg">Click 10 times to complete your daily check-in and earn rewards!</p>
        </div>

        {/* Main Check-in Card */}
        <Card className="mb-8 shadow-lg border-0 bg-white">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Target className="h-6 w-6 text-purple-600" />
              Today's Check-in Progress
            </CardTitle>
            <CardDescription>
              {checkinStatus?.is_completed ? (
                <span className="text-green-600 font-semibold">✅ Completed for today!</span>
              ) : (
                <span>Click the button below to watch ads and complete your check-in</span>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{checkinStatus?.clicks_completed || 0} / {checkinStatus?.total_clicks_required || 10} clicks</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-3" />
            </div>

            {/* Check-in Button */}
            <div className="text-center">
              {checkinStatus?.is_completed ? (
                <div className="space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                  <p className="text-green-600 font-semibold text-lg">Check-in completed for today! 🎉</p>
                  <p className="text-gray-600">Come back tomorrow to continue your streak</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    onClick={handleCheckinClick}
                    disabled={!canClickNext || timeRemaining > 0}
                    size="lg"
                    className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isClicking ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Watching Ad...
                      </>
                    ) : timeRemaining > 0 ? (
                      <>
                        <Clock className="h-5 w-5 mr-2" />
                        Wait {formatTime(timeRemaining)}
                      </>
                    ) : (
                      <>
                        <Gift className="h-5 w-5 mr-2" />
                        Click to Watch Ad
                      </>
                    )}
                  </Button>
                  
                  {timeRemaining > 0 && (
                    <p className="text-sm text-gray-500">
                      Next click available in {formatTime(timeRemaining)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{checkinStatus?.current_streak || 0}</div>
              <p className="text-sm text-gray-500">consecutive days</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Total Check-ins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{checkinStatus?.total_checkins || 0}</div>
              <p className="text-sm text-gray-500">completed</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Best Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{checkinStatus?.longest_streak || 0}</div>
              <p className="text-sm text-gray-500">days</p>
            </CardContent>
          </Card>
        </div>

        {/* Nigerian Rewards Section */}
        {isNigerian && (
          <Card className="mb-8 shadow-lg border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2 text-green-800">
                <Gift className="h-6 w-6" />
                Nigerian Airtime Rewards
              </CardTitle>
              <CardDescription className="text-green-700">
                Complete 30 consecutive check-ins to earn ₦500 airtime!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-medium">Progress to next reward:</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {Math.min(checkinStatus?.current_streak || 0, 30)}/30 days
                  </Badge>
                </div>
                
                <Progress 
                  value={Math.min((checkinStatus?.current_streak || 0) / 30 * 100, 100)} 
                  className="h-3"
                />

                {(checkinStatus?.current_streak || 0) >= 30 && (
                  <div className="bg-green-100 p-4 rounded-lg">
                    <p className="text-green-800 font-semibold mb-2">🎉 Congratulations! You've earned ₦500 airtime!</p>
                    <p className="text-green-700 text-sm">Your reward will be processed and sent to your phone number.</p>
                  </div>
                )}

                {airtimeRewards.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-800">Your Rewards:</h4>
                    {airtimeRewards.map((reward) => (
                      <div key={reward.id} className="flex justify-between items-center bg-white p-3 rounded-lg">
                        <div>
                          <span className="font-medium">₦{reward.amount}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {new Date(reward.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge variant={reward.status === 'completed' ? 'default' : 'secondary'}>
                          {reward.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Phone Number Input Modal */}
        {showPhoneInput && (
          <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Add Phone Number for Airtime
              </h3>
              <p className="text-gray-600 mb-4">
                Please provide your Nigerian phone number to receive your ₦500 airtime reward.
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g., +2348012345678"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handlePhoneSubmit} className="flex-1">
                    Save Phone Number
                  </Button>
                  <Button variant="outline" onClick={() => setShowPhoneInput(false)}>
                    Skip
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}