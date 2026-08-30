import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

export async function saveDbToFirebase(dbData: any) {
  try {
    await setDoc(doc(db, 'baf_155_uasu_v2_db', 'main'), dbData);
    return true;
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    return false;
  }
}

export async function getDbFromFirebase() {
  try {
    const docRef = doc(db, 'baf_155_uasu_v2_db', 'main');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error loading from Firebase:', error);
    return null;
  }
}
