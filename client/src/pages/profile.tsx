import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User, Phone, Trophy, Gift, CheckCircle, Clock } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  country: string;
  is_nigerian: boolean;
  created_at: string;
  updated_at: string;
}

interface CheckInStatus {
  current_streak: number;
  total_checkins: number;
  longest_streak: number;
}

interface RewardInfo {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  phone_number: string;
}

export default function Profile() {
  const { user, userProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneProvider, setPhoneProvider] = useState("");
  const [checkinStatus, setCheckinStatus] = useState<CheckInStatus | null>(null);
  const [rewards, setRewards] = useState<RewardInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchCheckinStatus();
      fetchRewards();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setName(data.name || "");
        setPhoneNumber(data.phone || "");
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          email: user.email!,
          country: 'NG',
          is_nigerian: true
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          setProfile(createdProfile);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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

      setCheckinStatus({
        current_streak: data.current_streak,
        total_checkins: data.total_checkins,
        longest_streak: data.longest_streak
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchRewards = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setRewards(data);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    // Validate Nigerian phone number
    if (phoneNumber && !phoneNumber.match(/^\+234[0-9]{10}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Nigerian phone number starting with +234.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const updates = {
        name: name.trim(),
        phone: phoneNumber || null,
        is_nigerian: phoneNumber.startsWith('+234'),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to save profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setProfile(prev => prev ? { 
        ...prev, 
        ...updates,
        phone: updates.phone || undefined 
      } : null);
      
      // Update auth context
      if (updateProfile) {
        updateProfile(updates);
      }

      toast({
        title: "Profile Saved",
        description: "Your profile has been updated successfully.",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getProviderFromPhone = (phone: string) => {
    if (!phone) return "";
    
    const number = phone.replace('+234', '');
    const prefix = number.substring(0, 3);
    
    // MTN prefixes
    if (['803', '806', '813', '814', '816', '903', '906', '913', '916'].includes(prefix)) {
      return 'MTN';
    }
    // Airtel prefixes
    if (['802', '808', '812', '901', '902', '904', '907', '912'].includes(prefix)) {
      return 'Airtel';
    }
    // Glo prefixes
    if (['805', '807', '811', '815', '905', '915'].includes(prefix)) {
      return 'Glo';
    }
    // 9mobile prefixes
    if (['809', '817', '818', '908', '909'].includes(prefix)) {
      return '9mobile';
    }
    
    return 'Unknown';
  };

  const getStreakProgress = () => {
    if (!checkinStatus) return 0;
    return Math.min((checkinStatus.current_streak / 30) * 100, 100);
  };

  const isRewardUnlocked = () => {
    return checkinStatus && checkinStatus.current_streak >= 30;
  };

  const hasUnclaimedReward = () => {
    return rewards.some(reward => reward.status === 'pending' && reward.amount === 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your profile...</p>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600 text-lg">Manage your account and check your progress</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal details for rewards and notifications
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Name (Required) */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Nigerian Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">Nigerian Phone Number</Label>
                <Input
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+2348012345678"
                  type="tel"
                />
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone className="h-3 w-3" />
                  Required for airtime rewards
                </div>
                
                {phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {getProviderFromPhone(phoneNumber)}
                    </Badge>
                    {phoneNumber.match(/^\+234[0-9]{10}$/) ? (
                      <Badge className="bg-green-100 text-green-800">Valid</Badge>
                    ) : (
                      <Badge variant="destructive">Invalid format</Badge>
                    )}
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={saving || !name.trim()}
                className="w-full"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Check-in Progress */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Check-in Progress
              </CardTitle>
              <CardDescription>
                Your daily check-in streak and statistics
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Current Streak */}
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {checkinStatus?.current_streak || 0}
                </div>
                <p className="text-gray-600">Current Streak (days)</p>
              </div>

              {/* Progress to Reward */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress to ₦500 Reward</span>
                  <span>{Math.min(checkinStatus?.current_streak || 0, 30)}/30 days</span>
                </div>
                <Progress value={getStreakProgress()} className="h-3" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">
                    {checkinStatus?.total_checkins || 0}
                  </div>
                  <p className="text-sm text-gray-600">Total Check-ins</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Trophy className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {checkinStatus?.longest_streak || 0}
                  </div>
                  <p className="text-sm text-gray-600">Best Streak</p>
                </div>
              </div>

              {/* Reward Status */}
              {isRewardUnlocked() ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Reward Unlocked!</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    You've completed 30 consecutive check-ins and earned ₦500 airtime!
                  </p>
                  {!phoneNumber && (
                    <p className="text-orange-600 text-sm mt-2">
                      Add your phone number above to receive your reward.
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Keep Going!</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Complete {30 - (checkinStatus?.current_streak || 0)} more consecutive check-ins to unlock ₦500 airtime reward.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rewards History */}
        {rewards.length > 0 && (
          <Card className="mt-8 shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-6 w-6 text-green-600" />
                Rewards History
              </CardTitle>
              <CardDescription>
                Your airtime rewards and payout history
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {rewards.map((reward) => (
                  <div 
                    key={reward.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">₦{reward.amount} Airtime Reward</div>
                      <div className="text-sm text-gray-500">
                        {new Date(reward.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      {reward.phone_number && (
                        <div className="text-sm text-gray-500">
                          Sent to: {reward.phone_number}
                        </div>
                      )}
                    </div>
                    
                    <Badge 
                      variant={
                        reward.status === 'completed' ? 'default' :
                        reward.status === 'processing' ? 'secondary' :
                        reward.status === 'pending' ? 'outline' : 'destructive'
                      }
                      className={
                        reward.status === 'completed' ? 'bg-green-100 text-green-800' :
                        reward.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        reward.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''
                      }
                    >
                      {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Payout Information</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Rewards are processed once per user per 30-day cycle</li>
                  <li>• Airtime is sent directly to your registered phone number</li>
                  <li>• Supported networks: MTN, Airtel, Glo, 9mobile</li>
                  <li>• Processing typically takes 24-48 hours</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}