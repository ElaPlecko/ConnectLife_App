import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function logAction({ userEmail, action, details }) {
  try {
    await addDoc(collection(db, "auditLogs"), {
      userEmail,
      action,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}