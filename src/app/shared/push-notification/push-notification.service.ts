import { Injectable } from '@angular/core';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { MessagePayload, getMessaging, getToken, isSupported, Messaging, onMessage } from 'firebase/messaging';
import { firstValueFrom } from 'rxjs';
import { Datos } from '../../datos';
import { firebaseConfig } from '../../../firebase-config';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private firebaseApp: FirebaseApp | null = null;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private messaging: Messaging | null = null;

  constructor(private datosService: Datos) {}

  /**
   * Register the Firebase messaging SW (if supported) and request permission.
   * When the browser returns a token, it is persisted in the backend.
   */
  async enablePushForUser(userId?: number): Promise<boolean> {
    if (!this.canUsePush()) {
      return false;
    }

    try {
      const messaging = await this.initMessaging();
      if (!messaging) {
        return false;
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return false;
      }

      const token = await getToken(messaging, {
        vapidKey: firebaseConfig.vapidKey,
        serviceWorkerRegistration: this.swRegistration ?? undefined
      });

      if (!token) {
        return false;
      }

      await firstValueFrom(
        this.datosService.savePushToken({
          token,
          userId
        })
      );
      return true;
    } catch (error) {
      console.error('No se pudo registrar el token de notificaciones:', error);
      return false;
    }
  }

  /**
   * Listen for foreground messages so UI components can display a toast.
   */
  subscribeToForegroundMessages(callback: (payload: MessagePayload) => void): void {
    isSupported()
      .then((supported: boolean) => {
        if (!supported) {
          return;
        }
        const app = this.getOrInitFirebaseApp();
        const messagingInstance = getMessaging(app);
        onMessage(messagingInstance, (payload: MessagePayload) => callback(payload));
      })
      .catch((error: unknown) => {
        console.error('Error inicializando el listener de FCM:', error);
      });
  }

  private async initMessaging(): Promise<Messaging | null> {
    const supported = await isSupported();
    if (!supported) {
      return null;
    }
    if (!this.messaging) {
      const app = this.getOrInitFirebaseApp();
      this.messaging = getMessaging(app);
    }
    if (!this.swRegistration && 'serviceWorker' in navigator) {
      this.swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }
    return this.messaging;
  }

  private canUsePush(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
  }

  private async requestPermission(): Promise<NotificationPermission> {
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    if (Notification.permission === 'denied') {
      return 'denied';
    }
    return Notification.requestPermission();
  }

  private getOrInitFirebaseApp(): FirebaseApp {
    if (this.firebaseApp) {
      return this.firebaseApp;
    }
    const existing = getApps();
    if (existing.length) {
      this.firebaseApp = existing[0]!;
      return this.firebaseApp;
    }
    this.firebaseApp = initializeApp(firebaseConfig);
    return this.firebaseApp;
  }
}
