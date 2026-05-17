import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDtbUsd1VCDfgU-kJTdJ1oHk6R1b5eU4S4",
    authDomain: "piwo-a76ce.firebaseapp.com",
    projectId: "piwo-a76ce",
    storageBucket: "piwo-a76ce.firebasestorage.app",
    messagingSenderId: "483481913062",
    appId: "1:483481913062:web:22bb16b52d67a7e2859d27",
    measurementId: "G-RG9HYH8L68"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
