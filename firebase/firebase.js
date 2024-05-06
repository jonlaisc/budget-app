import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUPK2GVVBtexLn0l2yKjUdSFRqWyanoL0",
  authDomain: "budget-68766.firebaseapp.com",
  databaseURL: "https://budget-68766-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "budget-68766",
  storageBucket: "budget-68766.appspot.com",
  messagingSenderId: "830794565077",
  appId: "1:830794565077:web:9e295b83af4de873cae95c",
  measurementId: "G-SLRF6X599X"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);