import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Share2, Users, Gift, Trophy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface ReferralData {
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

export default function Invite() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: referralData, isLoading } = useQuery<ReferralData>({
    queryKey: ["/api/referrals/stats"],
  });

  const referralLink = `${window.location.origin}/auth?ref=${referralData?.referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Referral link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareNatively = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Boomquotes - Earn ₦500!",
          text: "Complete daily check-ins and earn airtime rewards! Use my referral link to get started.",
          url: referralLink,
        });
      } catch (error) {
        // User cancelled or share failed, fallback to copy
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(
      `🚀 Join me on Boomquotes and earn ₦500 airtime rewards!\n\n✅ Complete daily check-ins\n💰 Earn airtime rewards\n📱 Discover inspiring quotes\n\nUse my referral link: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareToTwitter = () => {
    const message = encodeURIComponent(
      `🚀 Earning ₦500 airtime rewards on @Boomquotes! Join me for daily inspiration and rewards. ${referralLink}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Invite & Earn
          </h1>
          <p className="text-lg text-gray-600">
            Earn ₦100 for every friend who completes 10 days of check-ins
          </p>
        </div>

        {/* Referral Link Card */}
        <Card className="mb-8 shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-6 w-6 text-green-600" />
              Your Referral Link
            </CardTitle>
            <CardDescription>
              Share this link with friends to start earning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                />
                <Button
                  size="sm"
                  onClick={copyToClipboard}
                  className={`transition-all ${
                    copied ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={shareNatively}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={shareToWhatsApp}
                  className="bg-green-600 hover:bg-green-700"
                >
                  WhatsApp
                </Button>
                <Button
                  onClick={shareToTwitter}
                  className="bg-sky-600 hover:bg-sky-700"
                >
                  Twitter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-blue-600">
                  {referralData?.totalReferrals || 0}
                </div>
                <div className="text-sm text-gray-500">Total Referrals</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-green-600">
                  {referralData?.validReferrals || 0}
                </div>
                <div className="text-sm text-gray-500">Valid Referrals</div>
                <div className="text-xs text-green-600 mt-1">10+ day check-ins</div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <Gift className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <div className="text-3xl font-bold text-purple-600">
                  ₦{referralData?.totalEarnings || 0}
                </div>
                <div className="text-sm text-gray-500">Total Earnings</div>
                <div className="text-xs text-purple-600 mt-1">₦100 per valid referral</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="mb-8 shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              How Referral Rewards Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Share Your Link</h4>
                  <p className="text-sm text-gray-600">Send your referral link to friends via WhatsApp, Twitter, or any platform</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Friend Joins</h4>
                  <p className="text-sm text-gray-600">Your friend signs up using your referral link and starts their check-in journey</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Earn ₦100</h4>
                  <p className="text-sm text-gray-600">Once your friend completes 10 days of check-ins, you earn ₦100 that can be withdrawn with your 30-day bonus</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        {referralData?.recentReferrals && referralData.recentReferrals.length > 0 && (
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
              <CardDescription>Track your friends' progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referralData.recentReferrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{referral.email}</div>
                      <div className="text-sm text-gray-500">
                        Joined {new Date(referral.joinedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={(referral.checkInDays / 10) * 100} className="h-2 flex-1" />
                        <span className="text-xs text-gray-500">{referral.checkInDays}/10 days</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {referral.isValid ? (
                        <Badge className="bg-green-100 text-green-800">
                          ₦{referral.earnings} Earned
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          In Progress
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}