import { initializeApp } from 'firebase/app';
import { getMessaging, onBackgroundMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: self.__FIREBASE_CONFIG?.apiKey,
  authDomain: self.__FIREBASE_CONFIG?.authDomain,
  projectId: self.__FIREBASE_CONFIG?.projectId,
  storageBucket: self.__FIREBASE_CONFIG?.storageBucket,
  messagingSenderId: self.__FIREBASE_CONFIG?.messagingSenderId,
  appId: self.__FIREBASE_CONFIG?.appId,
};

try {
  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);

  onBackgroundMessage(messaging, (payload) => {
    const { title, body } = payload.notification || {};
    self.registration.showNotification(title || 'LifeLink', {
      body: body || '',
      icon: '/favicon.ico',
      data: payload.data,
    });
  });
} catch (err) {
  // Firebase not configured — service worker still works for other caching
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.redirect || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
