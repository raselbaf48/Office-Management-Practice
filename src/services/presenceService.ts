import { db } from '../firebase';
import { doc, setDoc, onSnapshot, serverTimestamp, collection, query, orderBy, limit, addDoc } from 'firebase/firestore';

// Call this when user logs in
export const logUserLogin = async (user: any) => {
  try {
    const timestamp = new Date().toISOString();
    // 1. Add to active users
    await setDoc(doc(db, 'active_users', user.bdNo), {
      bdNo: user.bdNo,
      name: user.name,
      rank: user.rank,
      role: user.role,
      lastActive: serverTimestamp(),
      loginTime: timestamp
    });

    // 2. Add to login history
    const historyRef = collection(db, 'login_history');
    await addDoc(historyRef, {
      bdNo: user.bdNo,
      name: user.name,
      rank: user.rank,
      role: user.role,
      flightName: user.flightName || 'Unknown',
      timestamp: timestamp,
      serverTime: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging user login:', error);
  }
};

// Call this periodically to update last active OR on logout
export const updatePresence = async (bdNo: string, isLoggingOut = false) => {
  if (!bdNo) return;
  try {
    if (isLoggingOut) {
       // Optional: we can delete the doc or mark it offline
       const ref = doc(db, 'active_users', bdNo);
       // await deleteDoc(ref); // If we just want to remove them
       await setDoc(ref, { status: 'offline', lastActive: serverTimestamp() }, { merge: true });
    } else {
       await setDoc(doc(db, 'active_users', bdNo), {
         lastActive: serverTimestamp(),
         status: 'online'
       }, { merge: true });
    }
  } catch (err) {
    console.error(err);
  }
};

export const subscribeToActiveUsers = (callback: (users: any[]) => void) => {
  return onSnapshot(collection(db, 'active_users'), (snapshot) => {
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    // Filter out users who haven't been active for > 5 minutes
    const now = Date.now();
    const active = users.filter(u => {
       if (u.status === 'offline') return false;
       if (!u.lastActive) return true; // Just logged in
       // Firestore timestamp to ms
       const lastActiveMs = u.lastActive.toMillis ? u.lastActive.toMillis() : Date.now();
       return (now - lastActiveMs) < 5 * 60 * 1000;
    });
    callback(active);
  });
};

export const subscribeToLoginHistory = (callback: (logs: any[]) => void) => {
  const q = query(collection(db, 'login_history'), orderBy('timestamp', 'desc'), limit(100));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    callback(logs);
  });
};
