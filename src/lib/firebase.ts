// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: 'quizwise-ecdsj',
  appId: '1:278761824014:web:ce3ace9cf35e8515aa015f',
  storageBucket: 'quizwise-ecdsj.firebasestorage.app',
  apiKey: 'AIzaSyCiFiIKw7uJFfjhU-fb0N2S70KGhhsl9OI',
  authDomain: 'quizwise-ecdsj.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '278761824014',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
