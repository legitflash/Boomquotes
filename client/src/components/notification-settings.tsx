import { useState, useEffect } from "react";
import { Bell, BellOff, Clock, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { pushNotificationManager, type NotificationPermissionState } from "@/lib/push-notifications";

export function NotificationSettings() {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>({
    permission: 'default',
    supported: false,
    serviceWorkerReady: false
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkPermissionState();
    loadSettings();
  }, []);

  const checkPermissionState = async () => {
    try {
      const state = await pushNotificationManager.getPermissionState();
      setPermissionState(state);
      setNotificationsEnabled(state.permission === 'granted');
    } catch (error) {
      console.error('Error checking permission state:', error);
    }
  };

  const loadSettings = () => {
    const savedTime = localStorage.getItem('notification-time');
    const savedEnabled = localStorage.getItem('notifications-enabled') === 'true';
    
    if (savedTime) {
      setNotificationTime(savedTime);
    }
    setNotificationsEnabled(savedEnabled);
  };

  const saveSettings = (enabled: boolean, time: string) => {
    localStorage.setItem('notifications-enabled', enabled.toString());
    localStorage.setItem('notification-time', time);
  };

  const handleEnableNotifications = async () => {
    if (!permissionState.supported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported on this device.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Request permission
      const permission = await pushNotificationManager.requestPermission();
      
      if (permission === 'granted') {
        // Register service worker and subscribe
        await pushNotificationManager.registerServiceWorker();
        await pushNotificationManager.subscribeToPush();
        
        // Schedule daily notifications
        const [hours, minutes] = notificationTime.split(':').map(Number);
        await pushNotificationManager.scheduleDailyNotification(hours, minutes);
        
        setNotificationsEnabled(true);
        saveSettings(true, notificationTime);
        
        toast({
          title: "Notifications Enabled",
          description: `You'll receive daily quotes at ${notificationTime}.`,
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      checkPermissionState();
    }
  };

  const handleDisableNotifications = async () => {
    setLoading(true);

    try {
      await pushNotificationManager.unsubscribeFromPush();
      pushNotificationManager.clearScheduledNotifications();
      
      setNotificationsEnabled(false);
      saveSettings(false, notificationTime);
      
      toast({
        title: "Notifications Disabled",
        description: "You won't receive daily quote notifications.",
      });
    } catch (error) {
      console.error('Error disabling notifications:', error);
      toast({
        title: "Error",
        description: "Failed to disable notifications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      checkPermissionState();
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      await handleEnableNotifications();
    } else {
      await handleDisableNotifications();
    }
  };

  const handleTimeChange = async (newTime: string) => {
    setNotificationTime(newTime);
    saveSettings(notificationsEnabled, newTime);

    if (notificationsEnabled) {
      // Reschedule notifications with new time
      try {
        const [hours, minutes] = newTime.split(':').map(Number);
        pushNotificationManager.clearScheduledNotifications();
        await pushNotificationManager.scheduleDailyNotification(hours, minutes);
        
        toast({
          title: "Time Updated",
          description: `Daily quotes will now arrive at ${newTime}.`,
        });
      } catch (error) {
        console.error('Error updating notification time:', error);
      }
    }
  };

  const testNotification = async () => {
    if (!notificationsEnabled) {
      toast({
        title: "Notifications Disabled",
        description: "Please enable notifications first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Send a test notification
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('Test Notification', {
          body: 'This is a test notification from BoomQuotes!',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'test-notification'
        });
      }
      
      toast({
        title: "Test Sent",
        description: "Check for the test notification!",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Test Failed",
        description: "Could not send test notification.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-600" />
          Daily Quote Notifications
        </CardTitle>
        <CardDescription>
          Get your daily dose of inspiration delivered right to your device
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Browser Support Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Browser Support:</span>
            <div className="flex items-center gap-1">
              {permissionState.supported ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Supported</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">Not Supported</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Permission Status:</span>
            <span className={`capitalize ${
              permissionState.permission === 'granted' ? 'text-green-600' :
              permissionState.permission === 'denied' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              {permissionState.permission}
            </span>
          </div>
        </div>

        {/* Enable/Disable Notifications */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-3">
            {notificationsEnabled ? (
              <Bell className="h-5 w-5 text-green-600" />
            ) : (
              <BellOff className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <Label htmlFor="notifications-toggle" className="text-base font-medium">
                Daily Quote Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Receive inspirational quotes every day
              </p>
            </div>
          </div>
          <Switch
            id="notifications-toggle"
            checked={notificationsEnabled && permissionState.permission === 'granted'}
            onCheckedChange={handleToggleNotifications}
            disabled={loading || !permissionState.supported}
          />
        </div>

        {/* Notification Time */}
        {permissionState.supported && (
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Notification Time
            </Label>
            <Select
              value={notificationTime}
              onValueChange={handleTimeChange}
              disabled={!permissionState.supported}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return (
                    <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                      {i === 0 ? '12:00 AM' : 
                       i < 12 ? `${i}:00 AM` :
                       i === 12 ? '12:00 PM' :
                       `${i - 12}:00 PM`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Choose when you'd like to receive your daily quote
            </p>
          </div>
        )}

        {/* Test Notification Button */}
        {notificationsEnabled && permissionState.permission === 'granted' && (
          <Button
            onClick={testNotification}
            variant="outline"
            className="w-full"
          >
            Send Test Notification
          </Button>
        )}

        {/* Info Messages */}
        {!permissionState.supported && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Push notifications are not supported on this device or browser. 
              Try using a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        )}

        {permissionState.permission === 'denied' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              Notifications are blocked. Please enable them in your browser settings 
              and refresh the page to use this feature.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-2 text-sm text-gray-600">Setting up notifications...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}