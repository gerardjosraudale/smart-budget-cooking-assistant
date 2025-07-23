// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6AY81YA_XeY3SZPi8Z3wrUW293oUozGo",
  authDomain: "smartbudgetcooking.firebaseapp.com",
  projectId: "smartbudgetcooking",
  storageBucket: "smartbudgetcooking.appspot.com", // Also fixed typo here
  messagingSenderId: "620192153754",
  appId: "1:620192153754:web:40085ae6e65bbcc21d9f23"
};

// ✅ Initialize app before using it
const app = initializeApp(firebaseConfig);

// ✅ Then use app
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("Firebase config:", firebaseConfig);
