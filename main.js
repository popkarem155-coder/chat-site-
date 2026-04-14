// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNCq5bP_UVdQgXPr40lroIkiti5aMWyvw",
  authDomain: "chat-nar.firebaseapp.com",
  projectId: "chat-nar",
  storageBucket: "chat-nar.firebasestorage.app",
  messagingSenderId: "199917444253",
  appId: "1:199917444253:web:aef64b8f6cb812d8f2c874",
  measurementId: "G-B8LJJ7XJ7W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
