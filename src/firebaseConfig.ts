// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC70VMgHFw8r6YcB-D3qOQl-ipdeDllTg4",
  authDomain: "avalide-e45f0.firebaseapp.com",
  projectId: "avalide-e45f0",
  storageBucket: "avalide-e45f0.appspot.com", // ✅ corrigé ici
  messagingSenderId: "1086896659888",
  appId: "1:1086896659888:web:0043c0fa605e8124ea8a75"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
