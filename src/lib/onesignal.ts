// src/lib/onesignal.ts
import OneSignal from "react-onesignal";

export const initOneSignal = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  try {
    await OneSignal.init({
      appId: "3b501ea3-ba6b-41d1-818b-e7b145bb9c60",
      allowLocalhostAsSecureOrigin: true,

      notifyButton: {
        enable: true,
        prenotify: true,
        showCredit: false,
        text: {
          "tip.state.unsubscribed": "Activer les notifications",
          "tip.state.subscribed": "Notifications activées",
          "tip.state.blocked": "Notifications bloquées",

          "message.prenotify": "Recevoir les notifications ?",
          "message.action.subscribing": "Activation...",
          "message.action.subscribed": "Notifications activées",
          "message.action.resubscribed": "Notifications réactivées",
          "message.action.unsubscribed": "Notifications désactivées",

          "dialog.main.title": "Notifications",
          "dialog.main.button.subscribe": "ACTIVER",
          "dialog.main.button.unsubscribe": "DÉSACTIVER",

          "dialog.blocked.title": "Bloqué",
          "dialog.blocked.message":
            "Veuillez autoriser les notifications dans votre navigateur",
        },
      },
    });

    await OneSignal.Slidedown.promptPush();

    const playerId = OneSignal.User?.PushSubscription?.id ?? null;
    console.log("🔔 OneSignal Player ID :", playerId);

    return playerId;
  } catch (error) {
    console.error("❌ Erreur init OneSignal :", error);
    return null;
  }
};

export const getOneSignalUserId = (): string | null => {
  return OneSignal.User?.PushSubscription?.id ?? null;
};
