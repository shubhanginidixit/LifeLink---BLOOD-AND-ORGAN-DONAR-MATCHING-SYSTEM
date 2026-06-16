import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let messaging = null;

function initFirebase() {
  try {
    if (
      !import.meta.env.VITE_FIREBASE_API_KEY ||
      !import.meta.env.VITE_FIREBASE_PROJECT_ID
    ) {
      console.warn('Firebase config missing. FCM push notifications disabled.');
      return false;
    }
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    return true;
  } catch (err) {
    console.warn('Firebase init failed:', err.message);
    return false;
  }
}

export async function requestFCMPermission(saveTokenCallback) {
  if (!messaging && !initFirebase()) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      console.log('FCM token obtained');
      if (saveTokenCallback) await saveTokenCallback(token);
      return token;
    }
  } catch (err) {
    console.warn('FCM token error:', err.message);
  }
  return null;
}

export function onForegroundMessage(callback) {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
}
