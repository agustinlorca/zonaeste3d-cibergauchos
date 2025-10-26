import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {getFirestore} from "firebase/firestore"


const firebaseConfig = {
  apiKey: "AIzaSyA9w6BffgfUM0T861dAB39sw0wjzjIiJK8",
  authDomain: "zonaeste3d-backend.firebaseapp.com",
  projectId: "zonaeste3d-backend",
  storageBucket: "zonaeste3d-backend.firebasestorage.app",
  messagingSenderId: "122844926245",
  appId: "1:122844926245:web:b72de61af566d988d48acc"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
