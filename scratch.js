import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_API_KEY || "AIzaSyBAjx1saaTshSEM2Xke6gF68qfpPcT4iII",
  authDomain: "bbs-cafe.firebaseapp.com",
  projectId: "bbs-cafe",
  storageBucket: "bbs-cafe.firebasestorage.app",
  messagingSenderId: "461236507558",
  appId: "1:461236507558:web:11c6957d87db04f8be3567",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  try {
    console.log("Fetching menu collection directly via Node.js SDK...");
    const colRef = collection(db, "menu");
    const snapshot = await getDocs(colRef);
    console.log("Success! Found", snapshot.docs.length, "documents currently in the database.");
    
    // Check what the exact names are
    snapshot.docs.forEach(doc => {
      console.log(" - Document ID:", doc.id, "/ Name:", doc.data().name);
    });
    process.exit(0);
  } catch (err) {
    console.error("FIREBASE NATIVE ERROR:", err.message);
    process.exit(1);
  }
}

testFirebase();
