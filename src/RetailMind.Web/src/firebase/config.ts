import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // apiKey: "AIzaSyAylJ1IikuXz_rUSOj84looAZmXjzRc-eE",
  // authDomain: "retailmind-ai-9db67.firebaseapp.com",
  // projectId: "retailmind-ai-9db67",
  // storageBucket: "retailmind-ai-9db67.firebasestorage.app",
  // messagingSenderId: "935867070354",
  // appId: "1:935867070354:web:3d62ba2a85eb839e03734b"

  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
