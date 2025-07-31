import { useEffect, useState } from 'react';

interface MonetagPushNotificationProps {
  enabled?: boolean;
  delay?: number;
}

export function MonetagPushNotification({ enabled = true, delay = 5000 }: MonetagPushNotificationProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // Request permission after delay
    const timer = setTimeout(() => {
      requestNotificationPermission();
    }, delay);

    // Load Monetag push notification script
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '//thubanoa.com/1?z=7517893';
    
    script.onload = () => {
      setIsLoaded(true);
      // Initialize Monetag push notifications
      if (window.MonetagPush) {
        window.MonetagPush.init({
          key: '7517893',
          format: 'push-notification',
          onSubscribe: () => {
            setPermissionGranted(true);
          }
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      clearTimeout(timer);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [enabled, delay]);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPermissionGranted(true);
        // Send welcome notification
        showWelcomeNotification();
      }
    } catch (error) {
      console.log('Error requesting notification permission:', error);
    }
  };

  const showWelcomeNotification = () => {
    if (permissionGranted && 'Notification' in window) {
      new Notification('Welcome to Boomquotes! 🎉', {
        body: 'You\'ll now receive daily inspiration and special offers.',
        icon: '/favicon.ico',
        tag: 'welcome',
        requireInteraction: false
      });
    }
  };

  const sendDailyQuoteNotification = (quote: string, author: string) => {
    if (permissionGranted && 'Notification' in window) {
      new Notification('💫 Daily Quote', {
        body: `"${quote}" - ${author}`,
        icon: '/favicon.ico',
        tag: 'daily-quote',
        requireInteraction: false
      });
    }
  };

  const sendRewardNotification = (message: string) => {
    if (permissionGranted && 'Notification' in window) {
      new Notification('💰 Reward Earned!', {
        body: message,
        icon: '/favicon.ico',
        tag: 'reward',
        requireInteraction: false
      });
    }
  };

  // Expose functions for external use
  useEffect(() => {
    window.BoomquotesNotifications = {
      sendDailyQuote: sendDailyQuoteNotification,
      sendReward: sendRewardNotification,
      isEnabled: permissionGranted
    };
  }, [permissionGranted]);

  return (
    <>
      {/* Monetag Push Notifications will be handled by script */}
      <div id="monetag-push-notifications" style={{ display: 'none' }} />
    </>
  );
}

// Extend window type for TypeScript
declare global {
  interface Window {
    MonetagPush?: any;
    BoomquotesNotifications?: {
      sendDailyQuote: (quote: string, author: string) => void;
      sendReward: (message: string) => void;
      isEnabled: boolean;
    };
  }
}