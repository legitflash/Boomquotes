// Push notification utilities
export interface NotificationPermissionState {
  permission: NotificationPermission;
  supported: boolean;
  serviceWorkerReady: boolean;
}

export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private swRegistration: ServiceWorkerRegistration | null = null;

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  // Check if push notifications are supported
  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  // Get current notification permission state
  async getPermissionState(): Promise<NotificationPermissionState> {
    const supported = this.isSupported();
    let permission: NotificationPermission = 'default';
    let serviceWorkerReady = false;

    if (supported) {
      permission = Notification.permission;
      serviceWorkerReady = await this.isServiceWorkerReady();
    }

    return {
      permission,
      supported,
      serviceWorkerReady
    };
  }

  // Register service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      throw new Error('Service workers are not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      this.swRegistration = registration;

      console.log('Service Worker registered successfully');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error('Notifications are not supported');
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notification permission has been denied');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      await this.registerServiceWorker();
    }

    if (!this.swRegistration) {
      throw new Error('Service Worker registration failed');
    }

    try {
      // Check if already subscribed
      let subscription = await this.swRegistration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            // VAPID public key - this should be generated and stored securely
            'BMqSvZe6JN2-AW5clw7Lg8wT8bF3YKXe_gVqHV7BlQK8oqGhPOGKcBm2w6XFX6BQCJd3z4hIrJF7hRn5CqKGzQU'
          )
        });
      }

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.swRegistration) {
      return false;
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        const unsubscribed = await subscription.unsubscribe();
        if (unsubscribed) {
          // Notify server about unsubscription
          await this.removeSubscriptionFromServer(subscription);
        }
        return unsubscribed;
      }
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Schedule daily quote notification (client-side scheduling)
  async scheduleDailyNotification(hour: number = 9, minute: number = 0): Promise<void> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      throw new Error('Notifications not available');
    }

    // Clear existing scheduled notifications
    this.clearScheduledNotifications();

    // Calculate time until next notification
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If scheduled time is in the past, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    // Schedule the notification
    const timeoutId = setTimeout(async () => {
      await this.sendDailyQuoteNotification();
      // Reschedule for next day
      this.scheduleDailyNotification(hour, minute);
    }, timeUntilNotification);

    // Store timeout ID for later cancellation
    localStorage.setItem('daily-quote-timeout', timeoutId.toString());
  }

  // Clear scheduled notifications
  clearScheduledNotifications(): void {
    const timeoutId = localStorage.getItem('daily-quote-timeout');
    if (timeoutId) {
      clearTimeout(parseInt(timeoutId));
      localStorage.removeItem('daily-quote-timeout');
    }
  }

  // Send daily quote notification
  private async sendDailyQuoteNotification(): Promise<void> {
    try {
      // Fetch daily quote from API
      const response = await fetch('/api/quotes/daily');
      const quote = await response.json();

      // Show local notification
      if (this.swRegistration) {
        await this.swRegistration.showNotification('Daily Quote from BoomQuotes', {
          body: `"${quote.text}" — ${quote.author}`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'daily-quote',
          requireInteraction: false,
          data: { url: '/', quote }
        });
      }
    } catch (error) {
      console.error('Failed to send daily quote notification:', error);
    }
  }

  // Check if service worker is ready
  private async isServiceWorkerReady(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) return false;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration;
    } catch {
      return false;
    }
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }

  // Convert base64 VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Export singleton instance
export const pushNotificationManager = PushNotificationManager.getInstance();