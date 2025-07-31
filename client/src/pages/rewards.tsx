import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gift, Smartphone, Users, TrendingUp, Clock, CheckCircle, AlertCircle, History, DollarSign, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";

interface Reward {
  id: string;
  amount: number;
  type: string;
  status: 'pending' | 'redeemed' | 'failed';
  createdAt: string;
  description: string;
}

interface PayoutHistory {
  id: string;
  amount: number;
  currency: string;
  localAmount: number;
  localCurrency: string;
  phone: string;
  country: string;
  operatorName: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  transactionId?: string;
  failureReason?: string;
  processedAt?: string;
  createdAt: string;
}

interface CheckinStats {
  currentStreak: number;
  longestStreak: number;
  totalCheckins: number;
  canCompleteToday: boolean;
  nextRewardAt: number;
}

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  validReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  recentReferrals: Array<{
    id: string;
    email: string;
    joinedAt: string;
    checkInDays: number;
    isValid: boolean;
    earnings: number;
  }>;
}

export default function Rewards() {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch rewards data
  const { data: rewards = [], isLoading: rewardsLoading } = useQuery<Reward[]>({
    queryKey: ["/api/rewards"],
  });

  const { data: payoutHistory = [], isLoading: payoutLoading } = useQuery<PayoutHistory[]>({
    queryKey: ["/api/payouts/history"],
  });

  const { data: checkinStats, isLoading: statsLoading } = useQuery<CheckinStats>({
    queryKey: ["/api/checkins/stats"],
  });

  const { data: referralStats, isLoading: referralLoading } = useQuery<ReferralStats>({
    queryKey: ["/api/referrals/stats"],
  });

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  // Calculate totals
  const pendingRewards = rewards.filter(r => r.status === 'pending');
  const totalPendingAmount = pendingRewards.reduce((sum, reward) => sum + reward.amount, 0);
  const checkinRewards = pendingRewards.filter(r => r.type === 'checkin').reduce((sum, r) => sum + r.amount, 0);
  const referralEarnings = referralStats?.totalEarnings || 0;
  const totalEarnings = checkinRewards + referralEarnings;

  // Redeem rewards mutation
  const redeemMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/rewards/redeem");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/checkins/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/stats"] });
      
      if (data.success) {
        toast({
          title: "Airtime Sent!",
          description: `${data.airtime.amount} ${data.airtime.currency} sent to your phone via ${data.airtime.operator}`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Redemption Failed",
        description: error.message || "Failed to redeem rewards. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleRedeem = () => {
    if (!profile?.phone) {
      toast({
        title: "Phone Number Required",
        description: "Please add your phone number in profile to receive airtime rewards.",
        variant: "destructive",
      });
      return;
    }

    if (totalEarnings === 0) {
      toast({
        title: "No Rewards Available",
        description: "Complete daily check-ins or invite friends to earn rewards.",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);
    redeemMutation.mutate();
    setTimeout(() => setIsRedeeming(false), 3000);
  };

  if (rewardsLoading || statsLoading || referralLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto p-4 pt-20">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  const streakProgress = checkinStats ? (checkinStats.currentStreak / checkinStats.nextRewardAt) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto p-4 pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rewards Center</h1>
          <p className="text-gray-600">Earn airtime rewards through daily check-ins and referrals</p>
        </div>

        {/* Total Earnings Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Total Available Rewards</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    {profile?.phone?.startsWith('+234') ? '₦' : 
                     profile?.phone?.startsWith('+254') ? 'KES ' :
                     profile?.phone?.startsWith('+91') ? '₹' : '$'}{totalEarnings}
                  </span>
                  <span className="text-lg opacity-80">
                    {profile?.phone?.startsWith('+234') ? 'NGN' : 
                     profile?.phone?.startsWith('+254') ? 'KES' :
                     profile?.phone?.startsWith('+91') ? 'INR' : 'USD'}
                  </span>
                </div>
                <p className="mt-2 opacity-90">
                  Check-in Rewards: {checkinRewards} • Referral Earnings: {referralEarnings}
                </p>
              </div>
              <div className="text-right">
                <Gift className="h-16 w-16 opacity-80 mb-4" />
                <Button
                  onClick={handleRedeem}
                  disabled={totalEarnings === 0 || redeemMutation.isPending || isRedeeming}
                  className="bg-white text-primary hover:bg-gray-100"
                  size="lg"
                >
                  {isRedeeming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Sending Airtime...
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-4 w-4 mr-2" />
                      Redeem Airtime
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phone Number Alert */}
        {!profile?.phone && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Phone Number Required:</strong> Add your phone number in profile to receive airtime rewards. 
              We support 150+ countries worldwide including Africa, Asia, Europe, and more.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Check-in Rewards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Daily Check-in Streak
              </CardTitle>
              <CardDescription>Complete 30 consecutive days for airtime rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Streak</span>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {checkinStats?.currentStreak || 0} days
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to next reward</span>
                    <span>{checkinStats?.currentStreak || 0}/30 days</span>
                  </div>
                  <Progress value={streakProgress} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{checkinStats?.currentStreak || 0}</div>
                    <div className="text-xs text-gray-500">Current</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{checkinStats?.longestStreak || 0}</div>
                    <div className="text-xs text-gray-500">Longest</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{checkinStats?.totalCheckins || 0}</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                </div>

                {checkinStats?.canCompleteToday && (
                  <Alert className="border-green-200 bg-green-50">
                    <Clock className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      You can complete today's check-in! Visit the Daily Check-in page.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Referral Earnings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Referral Program
              </CardTitle>
              <CardDescription>Earn rewards when friends complete 10+ check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Referral Code</span>
                  <Badge variant="outline" className="font-mono">
                    {referralStats?.referralCode || 'BOOM000000'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{referralStats?.totalReferrals || 0}</div>
                    <div className="text-xs text-gray-500">Total Invited</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{referralStats?.validReferrals || 0}</div>
                    <div className="text-xs text-gray-500">Qualified</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{referralStats?.totalEarnings || 0}</div>
                    <div className="text-xs text-gray-500">Earned</div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Each qualified referral earns you rewards</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Share Your Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Rewards History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Rewards History
            </CardTitle>
            <CardDescription>Your recent earning activities</CardDescription>
          </CardHeader>
          <CardContent>
            {rewards.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No rewards yet. Start your daily check-in streak!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rewards.slice(0, 10).map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        reward.status === 'redeemed' ? 'bg-green-500' :
                        reward.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium">{reward.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(reward.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+{reward.amount}</p>
                      <Badge
                        variant={reward.status === 'redeemed' ? 'default' : 
                                reward.status === 'pending' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {reward.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}