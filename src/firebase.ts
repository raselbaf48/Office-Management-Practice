import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

function removeUndefinedValues(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues);
  }
  const result: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = removeUndefinedValues(obj[key]);
    }
  }
  return result;
}

export async function saveDbToFirebase(dbData: any) {
  try {
    const extraSettings: Record<string, string> = {};
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('baf_') && key !== 'baf_155_uasu_v2_db') {
          const val = window.localStorage.getItem(key);
          if (val) {
            extraSettings[key] = val;
          }
        }
      }
    }
    
    const cleanData = removeUndefinedValues({
      ...dbData,
      extraSettings
    });

    await setDoc(doc(db, 'baf_155_uasu_v2_db', 'main'), cleanData);
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
      const data = docSnap.data();
      
      if (data.extraSettings && typeof window !== 'undefined' && window.localStorage) {
        let settingsChanged = false;
        Object.entries(data.extraSettings).forEach(([key, value]) => {
          if (typeof value === 'string') {
            const current = window.localStorage.getItem(key);
            if (current !== value) {
              window.localStorage.setItem(key, value);
              settingsChanged = true;
            }
          }
        });
        
        if (settingsChanged) {
          window.dispatchEvent(new CustomEvent('baf_idac_settings_updated'));
          window.dispatchEvent(new CustomEvent('baf_duty_ratio_updated'));
          window.dispatchEvent(new CustomEvent('baf_signatures_updated'));
          window.dispatchEvent(new CustomEvent('baf_theme_updated'));
          window.dispatchEvent(new CustomEvent('baf_logo_updated', { detail: { logoUrl: window.localStorage.getItem('baf_custom_logo') || null } }));
          window.dispatchEvent(new CustomEvent('baf_state_updated'));
        }
      }
      
      return data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error loading from Firebase:', error);
    return null;
  }
}
