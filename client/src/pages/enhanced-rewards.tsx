import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gift, Smartphone, Users, TrendingUp, Clock, CheckCircle, AlertCircle, History, DollarSign, Phone, RefreshCw } from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";

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

interface RewardStats {
  totalEarnings: number;
  pendingPayouts: number;
  successfulPayouts: number;
  failedPayouts: number;
  currentStreak: number;
  nextRewardAt: number;
  totalReferrals: number;
}

export default function EnhancedRewards() {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: payoutHistory = [], isLoading: payoutLoading } = useQuery<PayoutHistory[]>({
    queryKey: ["/api/payouts/history"],
  });

  const { data: rewardStats, isLoading: statsLoading } = useQuery<RewardStats>({
    queryKey: ["/api/rewards/stats"],
  });

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  // Redeem rewards mutation
  const redeemMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/rewards/redeem");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/payouts/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards/stats"] });
      
      toast({
        title: "Payout Initiated!",
        description: `Your reward has been queued for processing. Check payout history for updates.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Redemption Failed",
        description: error.message || "Failed to redeem rewards. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Retry failed payout mutation
  const retryPayoutMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      const response = await apiRequest("POST", `/api/payouts/${payoutId}/retry`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payouts/history"] });
      toast({
        title: "Payout Retry Initiated",
        description: "Your payout has been queued for retry processing.",
      });
    },
  });

  // Format status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary", label: "Pending", icon: Clock, color: "text-yellow-600" },
      processing: { variant: "default", label: "Processing", icon: RefreshCw, color: "text-blue-600" },
      success: { variant: "default", label: "Success", icon: CheckCircle, color: "text-green-600" },
      failed: { variant: "destructive", label: "Failed", icon: AlertCircle, color: "text-red-600" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant as any} className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    const symbols = {
      NGN: '₦',
      KES: 'KES ',
      INR: '₹',
      USD: '$',
    };
    return `${symbols[currency as keyof typeof symbols] || '$'}${amount}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRedeem = () => {
    if (!profile?.phone) {
      toast({
        title: "Phone Number Required",
        description: "Please add your phone number in profile to receive airtime rewards.",
        variant: "destructive",
      });
      return;
    }

    if (!rewardStats?.totalEarnings || rewardStats.totalEarnings === 0) {
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

  if (payoutLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto p-4 pt-20">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  const streakProgress = rewardStats ? (rewardStats.currentStreak / rewardStats.nextRewardAt) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rewards & Earnings</h1>
          <p className="text-gray-600">Track your earnings, manage payouts, and view transaction history</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(rewardStats?.totalEarnings || 0, 'USD')}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Successful Payouts</p>
                  <p className="text-2xl font-bold text-blue-600">{rewardStats?.successfulPayouts || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                  <p className="text-2xl font-bold text-yellow-600">{rewardStats?.pendingPayouts || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Check-in Streak</p>
                  <p className="text-2xl font-bold text-purple-600">{rewardStats?.currentStreak || 0} days</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Tabs defaultValue="rewards" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rewards" className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Payout History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rewards" className="space-y-6">
              {/* Total Earnings Card */}
              <Card className="bg-gradient-to-r from-primary to-purple-600 text-white">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Available Rewards</h2>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">
                          {formatCurrency(rewardStats?.totalEarnings || 0, 'USD')}
                        </span>
                      </div>
                      <p className="mt-2 opacity-90">
                        Check-in Streak: {rewardStats?.currentStreak || 0} days • Referrals: {rewardStats?.totalReferrals || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <Gift className="h-16 w-16 opacity-80 mb-4" />
                      <Button
                        onClick={handleRedeem}
                        disabled={!rewardStats?.totalEarnings || rewardStats.totalEarnings === 0 || redeemMutation.isPending || isRedeeming}
                        className="bg-white text-primary hover:bg-gray-100"
                        size="lg"
                      >
                        {isRedeeming ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
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

              {/* Progress Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Check-in Progress
                  </CardTitle>
                  <CardDescription>
                    Complete daily check-ins to earn rewards. Next reward at {rewardStats?.nextRewardAt || 30} days.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Current streak: {rewardStats?.currentStreak || 0} days</span>
                      <span>Target: {rewardStats?.nextRewardAt || 30} days</span>
                    </div>
                    <Progress value={streakProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Coming Soon Alert */}
              <Alert className="bg-blue-50 border-blue-200">
                <Gift className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Airtime Rewards Coming Soon!</strong> We're finalizing partnerships with global telecom providers. 
                  Keep earning points through daily check-ins - real airtime rewards will be available after app deployment.
                </AlertDescription>
              </Alert>

              {/* Phone Number Alert */}
              {!profile?.phone && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Phone Number Required:</strong> Add your phone number in profile to receive airtime rewards.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Payout History
                  </CardTitle>
                  <CardDescription>
                    Track all your airtime reward transactions and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {payoutHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payout History</h3>
                      <p className="text-gray-600">Your payout transactions will appear here once you redeem rewards.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Operator</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {payoutHistory.map((payout, index) => (
                              <motion.tr
                                key={payout.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b"
                              >
                                <TableCell className="font-medium">
                                  {formatDate(payout.createdAt)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {formatCurrency(payout.localAmount, payout.localCurrency)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ~{formatCurrency(payout.amount, payout.currency)}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    {payout.phone}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span>{payout.operatorName || 'Auto-detected'}</span>
                                    <span className="text-xs text-gray-500">{payout.country}</span>
                                  </div>
                                </TableCell>
                                <TableCell>{getStatusBadge(payout.status)}</TableCell>
                                <TableCell>
                                  {payout.transactionId ? (
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      {payout.transactionId}
                                    </code>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {payout.status === 'failed' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => retryPayoutMutation.mutate(payout.id)}
                                      disabled={retryPayoutMutation.isPending}
                                      className="text-xs"
                                    >
                                      Retry
                                    </Button>
                                  )}
                                  {payout.failureReason && (
                                    <div className="text-xs text-red-600 mt-1">
                                      {payout.failureReason}
                                    </div>
                                  )}
                                </TableCell>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}