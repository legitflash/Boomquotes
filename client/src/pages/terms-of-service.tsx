import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/auth">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign Up
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: January 31, 2025</p>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          
          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Boomquotes ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our mobile application and web platform that provides daily inspirational quotes, check-in features, and rewards ("Service"). By accessing or using our Service, you agree to be bound by these Terms.
            </p>
          </section>

          {/* 2. Acceptance of Terms */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              By creating an account or using our Service, you confirm that:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>You are at least 16 years of age</li>
              <li>You have the legal capacity to enter into these Terms</li>
              <li>You will comply with all applicable laws and regulations</li>
            </ul>
          </section>

          {/* 3. Account Registration */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Account Registration</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              To access certain features of our Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Provide accurate and complete information</li>
              <li>Keep your login credentials secure</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          {/* 4. Service Description */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Service Description</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Boomquotes provides:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Daily inspirational quotes from various sources</li>
              <li>Quote categorization and browsing features</li>
              <li>Daily check-in system to track engagement</li>
              <li>Rewards program for consistent users</li>
              <li>Social sharing capabilities</li>
            </ul>
          </section>

          {/* 5. Rewards Program */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Rewards Program</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Our rewards program operates as follows:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Available to users in eligible regions</li>
              <li>Requires completion of daily check-in activities</li>
              <li>Rewards are subject to verification and eligibility requirements</li>
              <li>We reserve the right to modify or discontinue the program at any time</li>
              <li>Fraudulent activity will result in account termination and forfeiture of rewards</li>
            </ul>
          </section>

          {/* 6. User Conduct */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. User Conduct</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Create multiple accounts to abuse our rewards program</li>
              <li>Share content that is offensive, harmful, or inappropriate</li>
              <li>Interfere with the normal operation of the Service</li>
            </ul>
          </section>

          {/* 7. Intellectual Property */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service and its content, features, and functionality are owned by Boomquotes and are protected by international copyright, trademark, and other intellectual property laws. Quotes are attributed to their original authors where known and are used for inspirational and educational purposes.
            </p>
          </section>

          {/* 8. Privacy */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your privacy is important to us. We collect and process personal information in accordance with our Privacy Policy. By using our Service, you consent to the collection and use of information as described in our Privacy Policy.
            </p>
          </section>

          {/* 9. Disclaimers */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Disclaimers</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service is provided "as is" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free. Your use of the Service is at your own risk.
            </p>
          </section>

          {/* 10. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the fullest extent permitted by law, Boomquotes shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of profits, data, or business opportunities.
            </p>
          </section>

          {/* 11. Termination */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account at any time for violation of these Terms or for any other reason at our sole discretion. You may also terminate your account at any time by contacting us.
            </p>
          </section>

          {/* 12. Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes through the Service or by email. Continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* 13. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable international laws and regulations. Any disputes shall be resolved through binding arbitration.
            </p>
          </section>

          {/* 14. Contact Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us through the app or at our support channels.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/auth">
            <Button>
              Return to Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}