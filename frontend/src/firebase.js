import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBS6xXeZ1zfGfyqvFs7g-7DE1uX-KhF4po",
  authDomain: "paper-pilot-5362f.firebaseapp.com",
  projectId: "paper-pilot-5362f",
  storageBucket: "paper-pilot-5362f.firebasestorage.app",
  messagingSenderId: "478888853354",
  appId: "1:478888853354:web:23766150f86a87fcd96f13",
  databaseURL: "https://paper-pilot-5362f-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
