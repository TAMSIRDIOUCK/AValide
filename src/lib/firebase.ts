import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBNM88NZV3Rxsj-rp25zB1QWfwTSO0_KnQ",
  authDomain: "avalide-push.firebaseapp.com",
  projectId: "avalide-push",
  messagingSenderId: "1027830005942",
  appId: "1:1027830005942:web:adb58cde5396468f33e617",
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
