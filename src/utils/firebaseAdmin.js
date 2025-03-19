// src/utils/firebaseAdmin.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is not set in the environment.");
  }
  
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("Firebase Admin initialized.");
}

const firestore = admin.firestore();
export { firestore };
