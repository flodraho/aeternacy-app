
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDY-kcvynBk0ITSIWkO98yTfc5m",
  authDomain: "aeternacy.firebaseapp.com",
  projectId: "aeternacy",
  storageBucket: "aeternacy.firebasestorage.app",
  messagingSenderId: "241217116295",
  appId: "1:241217116295:web:4b8b14381ad9e4a27d0022",
  measurementId: "G-1S47N5PVW8"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
