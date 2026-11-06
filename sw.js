let alarmTime = null;
let alarmCheckInterval = null;

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SET_ALARM') {
    alarmTime = event.data.time;
    startBackgroundCheck();
  } else if (event.data && event.data.type === 'CLEAR_ALARM') {
    alarmTime = null;
    if (alarmCheckInterval) clearInterval(alarmCheckInterval);
  }
});

function startBackgroundCheck() {
  if (alarmCheckInterval) clearInterval(alarmCheckInterval);

  alarmCheckInterval = setInterval(() => {
    if (!alarmTime) return;

    const now = new Date();
    const currentH = String(now.getHours()).padStart(2, '0');
    const currentM = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentH}:${currentM}`;

    if (currentTimeStr === alarmTime && now.getSeconds() === 0) {
      // Risveglia il sistema operativo mostrando la notifica visiva e sonora
      self.registration.showNotification("⏰ SVEGLIA OROLOGIO GEMINI!", {
        body: `Sono le ore ${alarmTime}! Tocca subito per aprire l'orologio.`,
        icon: "https://cdn-icons-png.flaticon.com/512/3103/3103030.png",
        badge: "https://cdn-icons-png.flaticon.com/512/3103/3103030.png",
        vibrate: [1000, 500, 1000, 500, 1000, 500, 1000],
        tag: "gemini-alarm-lock",
        renotify: true,
        requireInteraction: true,
        silent: false
      });
    }
  }, 1000);
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});
