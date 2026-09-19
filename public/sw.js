self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: 'DevConnect',
      body: event.data?.text() || 'You have a new notification.',
    };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'DevConnect', {
      body: data.body || 'You have a new notification.',
      icon: '/icon/logo.png',
      badge: '/icon/logo.png',
      data: {
        url: data.url || '/',
      },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      return clients.openWindow(url);
    }),
  );
});
