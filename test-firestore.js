import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function test() {
  try {
    console.log("Connecting...");
    await getDoc(doc(db, 'test', 'test'));
    console.log("Success");
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
test();
