import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User, Phone, Trophy, Gift, CheckCircle, AlertTriangle, Coins, Users } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  phone?: string;
  isNigerian: boolean;
  profileLocked: boolean;
  referralCode: string;
  totalReferrals: number;
  referralEarnings: number;
  createdAt: string;
  updatedAt: string;
}

interface CheckInStatus {
  currentStreak: number;
  totalCheckins: number;
  longestStreak: number;
  canCompleteToday: boolean;
  nextRewardAt: number;
}

interface RewardInfo {
  id: string;
  amount: number;
  type: 'checkin' | 'referral';
  status: 'pending' | 'completed';
  createdAt: string;
  description: string;
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  // Queries
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const { data: checkinStatus } = useQuery<CheckInStatus>({
    queryKey: ["/api/checkins/stats"],
    enabled: !!user,
  });

  const { data: rewards = [] } = useQuery<RewardInfo[]>({
    queryKey: ["/api/rewards"],
    enabled: !!user,
  });

  // Mutations
  const saveProfileMutation = useMutation({
    mutationFn: async (data: { fullName: string; phone: string }) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile saved",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile.",
        variant: "destructive",
      });
    }
  });

  const redeemRewardsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/rewards/redeem");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
      toast({
        title: "Rewards redeemed",
        description: "Your airtime has been sent to your phone number.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to redeem rewards.",
        variant: "destructive",
      });
    }
  });

  // Initialize form values
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhoneNumber(profile.phone || "");
    }
  }, [profile]);

  const handleSaveProfile = () => {
    if (!fullName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    // Check if Nigerian phone number is provided
    const isNigerianNumber = phoneNumber.trim() && phoneNumber.match(/^\+234[789][01]\d{8}$/);
    const hasPhoneNumber = phoneNumber.trim().length > 0;

    // If phone number is provided but not Nigerian format, show warning
    if (hasPhoneNumber && !isNigerianNumber) {
      setShowWarning(true);
      return;
    }

    if (profile?.profileLocked) {
      toast({
        title: "Profile locked",
        description: "Your profile cannot be modified after saving.",
        variant: "destructive",
      });
      return;
    }

    saveProfileMutation.mutate({ 
      fullName: fullName.trim(), 
      phone: phoneNumber.trim() || undefined 
    });
  };

  const totalEarnings = rewards.reduce((sum, reward) => 
    reward.status === 'pending' ? sum + reward.amount : sum, 0
  );
  const canRedeem = totalEarnings >= 500 && profile?.phone && profile?.fullName;

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and rewards</p>
        </div>

        {/* Warning Alert */}
        {showWarning && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> The phone number format appears to be non-Nigerian. 
              Only Nigerian phone numbers (+234XXXXXXXXXX) are eligible for airtime rewards. 
              You can save without a phone number if you're not from Nigeria.
              <div className="mt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    saveProfileMutation.mutate({ 
                      fullName: fullName.trim(), 
                      phone: undefined 
                    });
                    setShowWarning(false);
                  }}
                  className="mr-2"
                >
                  Save Without Phone
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowWarning(false)}
                >
                  Review Phone Number
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              {profile?.profileLocked 
                ? "Your profile is locked and cannot be modified."
                : "Required for airtime rewards"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={profile?.profileLocked}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+234, +254, +233, +27, +256, +255... (Required for African users)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={profile?.profileLocked}
              />
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Required for airtime rewards. Supported globally: Africa, Asia, Europe, Latin America, Middle East (150+ countries).
              </p>
            </div>

            {!profile?.profileLocked && (
              <Button
                onClick={handleSaveProfile}
                disabled={saveProfileMutation.isPending}
                className="w-full"
              >
                {saveProfileMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Check-in Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Check-in Progress
            </CardTitle>
            <CardDescription>Your daily check-in streak and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {checkinStatus?.currentStreak || 0}
                </div>
                <div className="text-sm text-gray-500">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {checkinStatus?.longestStreak || 0}
                </div>
                <div className="text-sm text-gray-500">Longest Streak</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {checkinStatus?.totalCheckins || 0}
                </div>
                <div className="text-sm text-gray-500">Total Check-ins</div>
              </div>
            </div>
            
            {checkinStatus && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress to next reward</span>
                  <span>{checkinStatus.currentStreak}/{checkinStatus.nextRewardAt} days</span>
                </div>
                <Progress 
                  value={(checkinStatus.currentStreak / checkinStatus.nextRewardAt) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rewards */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-green-600" />
              Rewards & Earnings
            </CardTitle>
            <CardDescription>
              Total earnings: ₦{totalEarnings} 
              {profile?.referralEarnings && profile.referralEarnings > 0 && ` (₦${profile.referralEarnings / 100} from referrals)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rewards.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No rewards yet. Complete 30 days of check-ins to earn ₦500!
                </p>
              ) : (
                rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">₦{reward.amount}</div>
                      <div className="text-sm text-gray-500">{reward.description}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(reward.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={reward.status === 'pending' ? 'default' : 'secondary'}>
                      {reward.status === 'pending' ? 'Ready' : 'Redeemed'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
            
            {canRedeem && (
              <Button
                onClick={() => redeemRewardsMutation.mutate()}
                disabled={redeemRewardsMutation.isPending}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                <Coins className="h-4 w-4 mr-2" />
                {redeemRewardsMutation.isPending ? "Processing..." : `Redeem ₦${totalEarnings} Airtime`}
              </Button>
            )}
            
            {totalEarnings > 0 && !canRedeem && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  {!profile?.phone || !profile?.fullName 
                    ? "Complete your profile to redeem rewards" 
                    : `Need ₦${500 - totalEarnings} more to redeem`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Referral Stats */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Referral Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {profile.totalReferrals}
                  </div>
                  <div className="text-sm text-gray-500">Total Referrals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₦{Math.floor((profile.referralEarnings || 0) / 100)}
                  </div>
                  <div className="text-sm text-gray-500">Referral Earnings</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm text-indigo-800">
                  Your referral code: <strong>{profile.referralCode || 'BOOM000000'}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}