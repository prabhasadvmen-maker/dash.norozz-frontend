importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCWL52mrmpSh-4QrsuC1uQ3lw78f0e48Bk",
  authDomain: "norozz.firebaseapp.com",
  projectId: "norozz",
  messagingSenderId: "14372623614",
  appId: "1:14372623614:web:632a3e6ca29a63f39781af",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Norozz';
  const body = payload.notification?.body || '';
  const icon = payload.notification?.image || '/logo.png';

  self.registration.showNotification(title, {
    body,
    icon,
    badge: '/logo.png',
    data: payload.data || {},
  });
});

// Notification click pe deep link open karo
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/';
  const targetUrl = self.location.origin + link;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Agar app already khuli hai to focus karo
      for (const client of clientList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Nahi to naya tab kholo
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
