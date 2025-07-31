import { ReactNode, useEffect, useState } from 'react';
import { AdsterraSocialBar } from './adsterra-social-bar';
import { AdsterraPushAd } from './adsterra-push-ad';
import { MonetagBanner } from './monetag-banner';
import { MonetagInterstitial } from './monetag-interstitial';
import { MonetagPushNotification } from './monetag-push-notification';

interface AdLayoutProps {
  children: ReactNode;
  showInterstitial?: boolean;
  enablePushNotifications?: boolean;
  onSocialBarClick?: () => void;
}

export function AdLayout({ 
  children, 
  showInterstitial = false, 
  enablePushNotifications = true,
  onSocialBarClick 
}: AdLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="ad-layout relative min-h-screen">
      {/* Main content with proper spacing for ads */}
      <div className="content-wrapper pb-20 pt-0">
        {children}
      </div>
      
      {/* Monetag Banner at bottom - appears above social bar */}
      <MonetagBanner 
        position="bottom" 
        size={isMobile ? 'mobile' : 'responsive'} 
      />
      
      {/* Adsterra Social Bar - always at very bottom */}
      <AdsterraSocialBar 
        onAdClick={onSocialBarClick}
        visible={true}
      />
      
      {/* Adsterra Push Ads - corner positioning */}
      <AdsterraPushAd 
        position={isMobile ? 'bottom-right' : 'top-right'}
        delay={3000}
      />
      
      {/* Monetag Interstitial - triggered on first visit per day */}
      {showInterstitial && (
        <MonetagInterstitial 
          trigger="pageload"
          onShow={() => {
            console.log('Interstitial shown');
            // Track interstitial view
            if (window.gtag) {
              window.gtag('event', 'ad_view', {
                event_category: 'monetag',
                event_label: 'interstitial'
              });
            }
          }}
          onClose={() => {
            console.log('Interstitial closed');
          }}
        />
      )}
      
      {/* Monetag Push Notifications */}
      <MonetagPushNotification 
        enabled={enablePushNotifications}
        delay={5000}
      />
      
      <style>{`
        .ad-layout {
          position: relative;
          min-height: 100vh;
        }
        
        .content-wrapper {
          padding-bottom: 120px; /* Space for banner + social bar */
          min-height: calc(100vh - 120px);
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .content-wrapper {
            padding-bottom: 100px; /* Reduced spacing for mobile */
            min-height: calc(100vh - 100px);
          }
        }
      `}</style>
    </div>
  );
}

// Hook for checking if user should see interstitial
export function useInterstitialCheck(): boolean {
  const [shouldShow, setShouldShow] = useState(false);
  
  useEffect(() => {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('monetag-interstitial-last-shown');
    const pageVisits = parseInt(localStorage.getItem('page-visits-today') || '0');
    
    // Show interstitial on first visit of the day
    if (lastShown !== today && pageVisits === 0) {
      setShouldShow(true);
      localStorage.setItem('page-visits-today', '1');
    } else {
      localStorage.setItem('page-visits-today', (pageVisits + 1).toString());
    }
    
    // Reset page visits counter at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    setTimeout(() => {
      localStorage.removeItem('page-visits-today');
    }, msUntilMidnight);
    
  }, []);
  
  return shouldShow;
}

// Extend window type for analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}