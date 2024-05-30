// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyADh4dDvPhFnGM8njkBvRDS1goNHm3-jsc",
  authDomain: "aimyguest.firebaseapp.com",
  projectId: "aimyguest",
  storageBucket: "aimyguest.appspot.com",
  messagingSenderId: "500810328334",
  appId: "1:500810328334:web:77af70c4bdeaeb32bccf5f",
  measurementId: "G-XD73YJFT6C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);