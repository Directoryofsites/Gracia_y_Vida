// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// La configuración de Firebase debe ser reemplazada con las credenciales reales
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "tu_api_key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "tu_auth_domain",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "tu_project_id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "tu_storage_bucket",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "tu_messaging_sender_id",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "tu_app_id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };