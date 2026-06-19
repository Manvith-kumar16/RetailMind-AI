import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAyvIJIikuXz_rUSOj84uoAZmXjzRc-eE",
  authDomain: "retailmind-ai-9db67.firebaseapp.com",
  projectId: "retailmind-ai-9db67",
  storageBucket: "retailmind-ai-9db67.firebasestorage.app",
  messagingSenderId: "935867070354",
  appId: "1:935867070354:web:3d62ba2a85eb839e03734b",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;