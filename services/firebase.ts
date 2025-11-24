import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This is your web app's Firebase configuration, extracted from the script tag.
const firebaseConfig = {
  apiKey: "AIzaSyDY-kcvynBk0ITSIWkO98yTfc5pn0yQMcI",
  authDomain: "aeternacy.firebaseapp.com",
  projectId: "aeternacy",
  storageBucket: "aeternacy.appspot.com",
  messagingSenderId: "241217116295",
  appId: "1:241217116295:web:4b8b14381ad9e4a27d0022",
  measurementId: "G-1S47N5PVW8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
