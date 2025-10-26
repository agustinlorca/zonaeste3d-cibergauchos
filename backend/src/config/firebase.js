import admin from "firebase-admin";
import config from "./env.js";

const app = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });

const firestore = admin.firestore(app);
const FieldValue = admin.firestore.FieldValue;

export { admin, firestore, FieldValue };
