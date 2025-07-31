import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Gift, Globe, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { COUNTRIES } from "@/lib/countries";
import { Link, useLocation } from "wouter";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  country: z.string().min(1, "Please select your country"),
  age: z.number().min(13, "You must be at least 13 years old").max(120, "Please enter a valid age"),
  gender: z.enum(["male", "female", "other", "prefer-not-to-say"], {
    required_error: "Please select your gender",
  }),
  phone: z.string().min(10, "Please enter a valid phone number"),
  inviteCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function EnhancedSignup() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<string>("");
  const [phoneCode, setPhoneCode] = useState<string>("");
  
  const { signUp, user } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      country: "NG",
      inviteCode: "",
    },
  });

  const selectedCountry = watch("country");

  // Auto-detect user's country on component mount
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data.country_code) {
          const countryCode = data.country_code.toUpperCase();
          setDetectedCountry(countryCode);
          setValue("country", countryCode);
          
          // Set phone code based on detected country
          const country = COUNTRIES.find(c => c.code === countryCode);
          if (country) {
            setPhoneCode(country.phoneCode);
          }
        }
      } catch (error) {
        console.log("Could not detect country, using default (Nigeria)");
        setValue("country", "NG");
        setPhoneCode("+234");
      }
    };

    detectCountry();
  }, [setValue]);

  // Update phone code when country changes
  useEffect(() => {
    const country = COUNTRIES.find(c => c.code === selectedCountry);
    if (country) {
      setPhoneCode(country.phoneCode);
    }
  }, [selectedCountry]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const onSubmit = async (data: SignupFormData) => {
    try {
      const profileData = {
        full_name: data.fullName,
        country: data.country,
        age: data.age,
        gender: data.gender,
        phone: `${phoneCode}${data.phone.replace(/^\+?[\d\s-]+/, '')}`,
        invite_code: data.inviteCode || undefined,
      };

      await signUp(data.email, data.password, JSON.stringify(profileData));
      
      toast({
        title: "Account created successfully!",
        description: "Welcome to Boomquotes! Complete your profile to start earning rewards.",
      });
      
      reset();
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
    }
  };

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Hero Section */}
        <div className="hidden lg:block space-y-6">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Join Boomquotes Today!
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Discover inspiring quotes and earn airtime rewards from around the world
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Global Rewards</h3>
                <p className="text-gray-600">Earn airtime in 170+ countries worldwide</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Daily Check-ins</h3>
                <p className="text-gray-600">Complete 30 days to earn your reward</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Referral System</h3>
                <p className="text-gray-600">Invite friends and earn bonus rewards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Fill out all fields to get started with Boomquotes
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  {...register("fullName")}
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={selectedCountry}
                  onValueChange={(value) => setValue("country", value)}
                >
                  <SelectTrigger className={errors.country ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <div className="flex items-center space-x-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                          <span className="text-gray-500 text-sm">({country.phoneCode})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {detectedCountry && (
                  <p className="text-sm text-green-600">
                    Auto-detected: {COUNTRIES.find(c => c.code === detectedCountry)?.name}
                  </p>
                )}
                {errors.country && (
                  <p className="text-sm text-red-500">{errors.country.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="flex">
                  <div className="bg-gray-100 px-3 py-2 border border-r-0 rounded-l-md text-sm text-gray-600">
                    {phoneCode}
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    {...register("phone")}
                    className={`rounded-l-none ${errors.phone ? "border-red-500" : ""}`}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Note: You can only change your phone number once after signup
                </p>
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              {/* Age and Gender Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Age"
                    {...register("age", { valueAsNumber: true })}
                    className={errors.age ? "border-red-500" : ""}
                  />
                  {errors.age && (
                    <p className="text-sm text-red-500">{errors.age.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select onValueChange={(value) => setValue("gender", value as any)}>
                    <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-red-500">{errors.gender.message}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    {...register("password")}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    {...register("confirmPassword")}
                    className={errors.confirmPassword ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Invite Code (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="inviteCode">Invite Code (Optional)</Label>
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="Enter invite code if you have one"
                  {...register("inviteCode")}
                />
                <p className="text-xs text-gray-500">
                  Have a friend's invite code? Enter it to earn bonus rewards!
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/auth" className="text-primary hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}