/* eslint-disable no-undef */
// Firebase messaging service worker. This file is copied as-is to the build
// output (configured in angular.json) so it cannot rely on the bundler.
// Update the config to match src/firebase-config.ts when deploying.
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAqe8fgQxAjRj4GTuS-U1Wm8YjSq7SKbuA',
  authDomain: 'moderni-bfb82.firebaseapp.com',
  projectId: 'moderni-bfb82',
  storageBucket: 'moderni-bfb82.firebasestorage.app',
  messagingSenderId: '147227169884',
  appId: '1:147227169884:web:69a996cd1e5df18d284299',
  measurementId: 'G-MNZ5G7C7XZ'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || 'Moderni';
  const body = payload?.notification?.body || payload?.data?.body || '';
  const notificationOptions = {
    body,
    icon: payload?.notification?.icon || '/icons/icon-192.png',
    data: payload?.data || {}
  };
  self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification?.data?.link || '/';
  event.waitUntil(clients.openWindow(target));
});
