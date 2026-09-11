const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, initializeFirestore } = require('firebase/firestore');
const config = require('./firebase-applet-config.json');

const app = initializeApp(config);
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, config.firestoreDatabaseId);

async function test() {
  try {
    console.log("Fetching doc...");
    const snap = await getDoc(doc(db, "test", "connection"));
    console.log("Success:", snap.exists());
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
