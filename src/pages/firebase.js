import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBl4k7aJWfPWkq42LxpvBZBt3TE8jHK5tw",
  authDomain: "lifelink-5d0c4.firebaseapp.com",
  projectId: "lifelink-5d0c4",
  storageBucket: "lifelink-5d0c4.firebasestorage.app",
  messagingSenderId: "1064756611319",
  appId: "1:1064756611319:web:50f868577856a59a9eebf2",
  measurementId: "G-JYQTQB0L9S"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
