import {
  registerForPushNotifications,
  saveSubscription,
} from "@/src/services/notificationService";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

export function usePushNotifications(userId: number | string | null) {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      const token = await registerForPushNotifications(userId);

      if (token) {
        await saveSubscription({ userId, token, platform: Platform.OS });
      }
    })();

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("notification دریافت شد:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("کاربر کلیک کرد:", data);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [userId]);
}
