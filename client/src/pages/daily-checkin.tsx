import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Clock, Calendar as CalendarIcon, Gift, CheckCircle, Circle, Phone } from "lucide-react";

interface CheckIn {
  id: string;
  date: string;
  click_count: number;
  completed: boolean;
  completed_at: string | null;
}

interface AirtimeReward {
  id: string;
  amount: number;
  phone: string;
  status: string;
  check_in_count: number;
  created_at: string;
}

export default function DailyCheckIn() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const [allCheckIns, setAllCheckIns] = useState<CheckIn[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canClick, setCanClick] = useState(true);
  const [completedDates, setCompletedDates] = useState<Date[]>([]);
  const [airtimeRewards, setAirtimeRewards] = useState<AirtimeReward[]>([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      fetchCheckInData();
      fetchAirtimeRewards();
    }
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setCanClick(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const fetchCheckInData = async () => {
    if (!user) return;

    try {
      // Fetch today's check-in
      const { data: todayData } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (todayData) {
        setTodayCheckIn(todayData);
        setClickCount(todayData.click_count || 0);
      }

      // Fetch all check-ins for calendar
      const { data: allData } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (allData) {
        setAllCheckIns(allData);
        const completed = allData
          .filter(checkIn => checkIn.completed)
          .map(checkIn => new Date(checkIn.date + 'T00:00:00'));
        setCompletedDates(completed);
      }
    } catch (error) {
      console.error('Error fetching check-in data:', error);
    }
  };

  const fetchAirtimeRewards = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('airtime_rewards')
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

  const handleClick = async () => {
    if (!canClick || !user || clickCount >= 3) return;

    setIsChecking(true);
    setCanClick(false);
    setTimeRemaining(120); // 2 minutes

    try {
      const newClickCount = clickCount + 1;
      const isCompleted = newClickCount >= 3;

      if (!todayCheckIn) {
        // Create new check-in
        const { data, error } = await supabase
          .from('check_ins')
          .insert({
            user_id: user.id,
            date: today,
            click_count: newClickCount,
            completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) throw error;
        setTodayCheckIn(data);
      } else {
        // Update existing check-in
        const { data, error } = await supabase
          .from('check_ins')
          .update({
            click_count: newClickCount,
            completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .eq('id', todayCheckIn.id)
          .select()
          .single();

        if (error) throw error;
        setTodayCheckIn(data);
      }

      setClickCount(newClickCount);

      if (isCompleted) {
        toast({
          title: "Daily check-in completed! 🎉",
          description: "Great job! You've completed today's check-in.",
        });

        // Check if user has completed 30 check-ins for airtime reward
        await checkAirtimeEligibility();
        await fetchCheckInData(); // Refresh data
      } else {
        toast({
          title: `Click ${newClickCount}/3 completed`,
          description: `${3 - newClickCount} more clicks to complete today's check-in.`,
        });
      }
    } catch (error) {
      console.error('Error updating check-in:', error);
      toast({
        title: "Error",
        description: "Failed to update check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const checkAirtimeEligibility = async () => {
    if (!user || !userProfile?.phone) return;

    try {
      // Count completed check-ins
      const { count } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('completed', true);

      if (count && count >= 30) {
        // Check if user hasn't already received reward for this milestone
        const { data: existingReward } = await supabase
          .from('airtime_rewards')
          .select('*')
          .eq('user_id', user.id)
          .eq('check_in_count', 30)
          .single();

        if (!existingReward) {
          // Create airtime reward
          const { error } = await supabase
            .from('airtime_rewards')
            .insert({
              user_id: user.id,
              amount: 500,
              phone: userProfile.phone,
              status: 'pending',
              check_in_count: 30,
            });

          if (!error) {
            toast({
              title: "🎉 Congratulations! Airtime reward earned!",
              description: "You've earned ₦500 airtime for completing 30 check-ins!",
            });
            await fetchAirtimeRewards();
          }
        }
      }
    } catch (error) {
      console.error('Error checking airtime eligibility:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletedCheckInsCount = () => {
    return allCheckIns.filter(checkIn => checkIn.completed).length;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Processing" },
      sent: { color: "bg-green-100 text-green-800", text: "Sent" },
      failed: { color: "bg-red-100 text-red-800", text: "Failed" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  if (!user) {
    return <div>Please sign in to access daily check-ins.</div>;
  }

  const completedCount = getCompletedCheckInsCount();
  const progressToReward = Math.min(completedCount, 30);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Check-In</h1>
          <p className="text-gray-600">Complete your daily check-in to earn rewards and track your progress.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Check-in Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Today's Check-In</span>
                </CardTitle>
                <CardDescription>
                  Click the button 3 times with 2-minute intervals to complete your daily check-in.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="flex justify-center space-x-4 mb-6">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex flex-col items-center">
                        {clickCount >= step ? (
                          <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                        ) : (
                          <Circle className="h-8 w-8 text-gray-300 mb-2" />
                        )}
                        <span className="text-sm text-gray-600">Click {step}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6">
                    <Button
                      onClick={handleClick}
                      disabled={!canClick || clickCount >= 3 || isChecking}
                      size="lg"
                      className="w-48 h-16 text-lg font-semibold"
                    >
                      {isChecking ? (
                        "Processing..."
                      ) : clickCount >= 3 ? (
                        "✅ Completed!"
                      ) : (
                        `Click ${clickCount + 1}/3`
                      )}
                    </Button>
                  </div>

                  {timeRemaining > 0 && (
                    <div className="flex items-center justify-center space-x-2 text-primary">
                      <Clock className="h-4 w-4" />
                      <span>Next click available in: {formatTime(timeRemaining)}</span>
                    </div>
                  )}

                  {todayCheckIn?.completed && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-green-800 font-medium">
                        🎉 Today's check-in completed!
                      </p>
                      <p className="text-green-600 text-sm">
                        Completed at {new Date(todayCheckIn.completed_at!).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Progress to Reward */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-5 w-5 text-accent" />
                  <span>Airtime Reward Progress</span>
                </CardTitle>
                <CardDescription>
                  Complete 30 check-ins to earn ₦500 airtime (Nigerian users only)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progressToReward}/30 check-ins</span>
                  </div>
                  <Progress value={(progressToReward / 30) * 100} className="h-3" />
                  
                  {!userProfile?.phone && (
                    <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Phone className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Phone number required</p>
                        <p>Add your phone number to receive airtime rewards.</p>
                      </div>
                    </div>
                  )}

                  {progressToReward >= 30 && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-green-800 font-medium">
                        🎉 Congratulations! You've earned ₦500 airtime!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Airtime Rewards History */}
            {airtimeRewards.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Airtime Rewards</CardTitle>
                  <CardDescription>Your airtime reward history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {airtimeRewards.map((reward) => (
                      <div key={reward.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <p className="font-medium">₦{reward.amount} Airtime</p>
                          <p className="text-sm text-gray-600">{reward.phone}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(reward.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(reward.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Calendar Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <span>Check-In Calendar</span>
                </CardTitle>
                <CardDescription>
                  Track your daily check-in streak
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{completedCount}</p>
                      <p className="text-sm text-gray-600">Total Check-ins</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-accent">{30 - progressToReward}</p>
                      <p className="text-sm text-gray-600">Until Reward</p>
                    </div>
                  </div>

                  <Calendar
                    mode="multiple"
                    selected={completedDates}
                    className="rounded-md border"
                    classNames={{
                      day_selected: "bg-green-500 text-white hover:bg-green-600",
                      day_today: "bg-primary text-white",
                    }}
                  />

                  <div className="text-xs text-gray-500 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Completed check-in</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-primary rounded"></div>
                      <span>Today</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}