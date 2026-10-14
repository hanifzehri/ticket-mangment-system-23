import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyD-YSzX5DZFsblvehdaEf4kpCGMT1Gy66c",
  authDomain: "ticket-mangment-system.firebaseapp.com",
  projectId: "ticket-mangment-system",
  storageBucket: "ticket-mangment-system.firebasestorage.app",
  messagingSenderId: "683165037648",
  appId: "1:683165037648:web:474d7889edb79229de0d55",
  measurementId: "G-60WNGWGR0Y"
};


const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app); 
export default app;