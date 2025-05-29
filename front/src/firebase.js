import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCI0s7HwvB4lRGyT2g7PZUEVBtKAckUdIs",
  authDomain: "pace-5a38b.firebaseapp.com",
  projectId: "pace-5a38b",
  storageBucket: "pace-5a38b.firebasestorage.app",
  messagingSenderId: "188868671351",
  appId: "1:188868671351:web:9254d412143556b0bcd372",
  measurementId: "G-TG4WBS2FS0"
};




const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

