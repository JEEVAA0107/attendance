// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7VOV3YJqzBOUstFSbvpfVCjZKU99RfwQ",
  authDomain: "student-attendance-ecd75.firebaseapp.com",
  projectId: "student-attendance-ecd75",
  storageBucket: "student-attendance-ecd75.firebasestorage.app",
  messagingSenderId: "615490230596",
  appId: "1:615490230596:web:68042bf69888427c1fdf11",
  measurementId: "G-XGS9QB28XM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);

export default app;