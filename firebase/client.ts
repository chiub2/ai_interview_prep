// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDj10Tp-hLORAPl-O7shFRUS5CGNXUEHqo",
  authDomain: "prepvue.firebaseapp.com",
  projectId: "prepvue",
  storageBucket: "prepvue.firebasestorage.app",
  messagingSenderId: "1011670228016",
  appId: "1:1011670228016:web:c365fec800d1ea7b6121f5",
  measurementId: "G-1WL708YB7X"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig):getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);