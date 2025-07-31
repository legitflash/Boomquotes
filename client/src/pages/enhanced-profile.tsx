import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Phone, Key, Globe, Save, Edit, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { COUNTRIES, detectCountryFromIP, getCountryByCode } from "@/lib/countries";

export default function EnhancedProfile() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [canEditPhone, setCanEditPhone] = useState(true);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/profile"],
  });

  // Auto-detect country on component mount
  useEffect(() => {
    const initializeProfile = async () => {
      if (profile) {
        setFullName(profile.fullName || "");
        setPhoneNumber(profile.phone || "");
        setSelectedCountry(profile.country || "");
        setAddress(profile.address || "");
        setAge(profile.age?.toString() || "");
        setGender(profile.gender || "");
        // Check if phone has been edited before
        setCanEditPhone(!profile.phoneEditedAt);
      } else {
        // Auto-detect country for new users
        try {
          const detectedCountry = await detectCountryFromIP();
          setSelectedCountry(detectedCountry);
          
          // Auto-fill phone code based on detected country
          const country = getCountryByCode(detectedCountry);
          if (country && !phoneNumber) {
            setPhoneNumber(country.phoneCode);
          }
        } catch (error) {
          console.log("Country detection failed, defaulting to Nigeria");
          setSelectedCountry("NG");
          setPhoneNumber("+234");
        }
      }
    };

    initializeProfile();
  }, [profile]);

  // Update phone code when country changes
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    const country = getCountryByCode(countryCode);
    if (country) {
      // Only update phone code if phone number is empty or just contains a phone code
      if (!phoneNumber || phoneNumber.match(/^\+\d{1,4}$/)) {
        setPhoneNumber(country.phoneCode);
      }
    }
  };

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await apiRequest("PUT", "/api/profile", profileData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: any) => {
      const response = await apiRequest("POST", "/api/auth/change-password", passwordData);
      return response.json();
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordChange(false);
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Password change failed",
        description: error.message || "Failed to change password.",
        variant: "destructive",
      });
    }
  });

  const handleSaveProfile = () => {
    if (!fullName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return;
    }

    const profileData = {
      fullName: fullName.trim(),
      phone: phoneNumber.trim() || undefined,
      country: selectedCountry,
      age: age ? parseInt(age) : undefined,
      gender: gender || undefined,
    };

    saveProfileMutation.mutate(profileData);
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const selectedCountryData = getCountryByCode(selectedCountry);
  const isProfileLocked = profile?.profileLocked && !isEditing;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto p-4 pt-20">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-2xl mx-auto p-4 pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Profile Information Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your profile details for airtime rewards and account management
                </CardDescription>
              </div>
              {!isProfileLocked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Locked Warning */}
            {isProfileLocked && (
              <Alert className="border-amber-200 bg-amber-50">
                <Lock className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Profile Locked:</strong> Your profile information is locked for security. 
                  Contact support if you need to make changes to verified details.
                </AlertDescription>
              </Alert>
            )}

            {/* Full Name */}
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isProfileLocked || !isEditing}
              />
            </div>

            {/* Country Selection */}
            <div>
              <Label htmlFor="country">Country</Label>
              <Select
                value={selectedCountry}
                onValueChange={handleCountryChange}
                disabled={isProfileLocked || !isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your country">
                    {selectedCountryData && (
                      <span className="flex items-center gap-2">
                        <span>{selectedCountryData.flag}</span>
                        <span>{selectedCountryData.name}</span>
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                        <span className="text-gray-500">({country.phoneCode})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Input
                  className="w-24"
                  value={selectedCountryData?.phoneCode || ""}
                  disabled
                />
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={phoneNumber.replace(selectedCountryData?.phoneCode || "", "")}
                  onChange={(e) => setPhoneNumber((selectedCountryData?.phoneCode || "") + e.target.value)}
                  disabled={isProfileLocked || !isEditing}
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Required for airtime rewards. Supported globally (150+ countries).
              </p>
            </div>

            {/* Age */}
            <div>
              <Label htmlFor="age">Age (Optional)</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={isProfileLocked || !isEditing}
                min="13"
                max="120"
              />
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender">Gender (Optional)</Label>
              <Select
                value={gender}
                onValueChange={setGender}
                disabled={isProfileLocked || !isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Save Button */}
            {isEditing && (
              <Button
                onClick={handleSaveProfile}
                disabled={saveProfileMutation.isPending}
                className="w-full"
              >
                {saveProfileMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Security Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Manage your account security and password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showPasswordChange ? (
              <Button
                variant="outline"
                onClick={() => setShowPasswordChange(true)}
                className="flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                Change Password
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleChangePassword}
                    disabled={changePasswordMutation.isPending}
                    className="flex-1"
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}