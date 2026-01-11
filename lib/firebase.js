
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyARadzcSwg8L8g_oVFDi7IcztYwCR1TBY4",
  authDomain: "presales-self-assessment.firebaseapp.com",
  projectId: "presales-self-assessment",
  storageBucket: "presales-self-assessment.firebasestorage.app",
  messagingSenderId: "167946327938",
  appId: "1:167946327938:web:29852bd448c21da37c219b",
  measurementId: "G-4Z1QN5MYE7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };
