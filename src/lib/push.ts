export async function showPushNotification(title: string, options?: NotificationOptions) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, options);
      }
    }
  } catch (e) {
    console.error("Ошибка при показе push-уведомления:", e);
  }
}