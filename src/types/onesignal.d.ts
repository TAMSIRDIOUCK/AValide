// src/types/onesignal.d.ts

export {};

declare global {
    interface Window {
      OneSignal?: any;
    }
    /**
  
   * Permet d'utiliser OneSignal dans le navigateur
   * window.OneSignal sera disponible après l'inclusion du script OneSignal
   */
  interface Window {
    OneSignal: OneSignalBrowserSDK;
  }

  // Variable globale (optionnelle)
  var OneSignal: OneSignalBrowserSDK;
}

/**
 * Type minimal pour OneSignal dans le navigateur
 */
interface OneSignalBrowserSDK {
  push: (callback: (OneSignal: OneSignalBrowserSDK) => void) => void;
  init: (options: {
    appId: string;
    safari_web_id?: string;
    notifyButton?: boolean;
    allowLocalhostAsSecureOrigin?: boolean;
  }) => void;
  showSlidedownPrompt?: () => void;
  getUserId?: () => Promise<string | null>;
  sendSelfNotification?: (title: string, message: string, url?: string, icon?: string) => void;
}
