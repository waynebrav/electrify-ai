
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbmekVi49UwoLBzhcDfe1907h5Tl9vsy4",
  authDomain: "electrify-b233b.firebaseapp.com",
  projectId: "electrify-b233b",
  storageBucket: "electrify-b233b.firebasestorage.app",
  messagingSenderId: "265760531082",
  appId: "1:265760531082:web:2b75b9d91a96ee85b04373",
  measurementId: "G-N8LVVMPJXH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const analytics = getAnalytics(app);
export const auth = getAuth(app);

export default app;
