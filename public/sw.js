self.addEventListener('push', function(event) {
  const data = event.data?.json() || {};
  self.registration.showNotification(data.title || 'Push Notification', {
    body: data.body || 'You have a new message!',
    icon: '/icon.png',
  });
});
