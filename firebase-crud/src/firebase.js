
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7On79RLEeUzecwolWw81EWcdh4ktJKjI",
  authDomain: "sse3308w6.firebaseapp.com",
  projectId: "sse3308w6",
  storageBucket: "sse3308w6.firebasestorage.app",
  messagingSenderId: "778155799662",
  appId: "1:778155799662:web:4aa34280be72e722c5a27f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);