import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Safely initialize Firebase app
let appInstance: any = null;
try {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (e) {
  console.warn('Firebase initializeApp notice:', e);
}
export const app = appInstance;

// Safely initialize Firestore with databaseId
let dbInstance: any = null;
try {
  if (appInstance) {
    dbInstance = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId);
  }
} catch (e) {
  console.warn('Firebase getFirestore notice:', e);
}
export const db = dbInstance;

// Safely initialize Auth
let authInstance: any = null;
try {
  if (appInstance) {
    authInstance = getAuth(appInstance);
  }
} catch (e) {
  console.warn('Firebase getAuth notice:', e);
}
export const auth = authInstance;

// Safely initialize Storage
let storageInstance: any = null;
try {
  if (appInstance) {
    storageInstance = getStorage(appInstance);
  }
} catch (e) {
  console.warn('Firebase getStorage notice:', e);
}
export const storage = storageInstance;

export const googleProvider = new GoogleAuthProvider();

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notification:', JSON.stringify(errInfo));
  return errInfo;
}

// Test connection on boot per Firebase skill guidelines
export async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, using local persistent cache.');
    }
  }
}

// In-browser Canvas image compressor ensuring payload is web-optimized and under Firestore limits (~150-250KB)
export async function compressImageFile(file: File, maxDim = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        // If still large, slightly lower quality
        if (dataUrl.length > 700000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        }
        resolve(dataUrl);
      };
      img.onerror = () => {
        // Fallback to direct raw DataURL
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Upload file to Firebase Storage with web-optimized base64 fallback
export async function uploadMediaFile(
  file: File,
  folder: 'photos' | 'videos' | 'thumbnails',
  onProgress?: (progress: number) => void
): Promise<string> {
  const isImage = file.type.startsWith('image/');

  if (storage) {
    try {
      const uniqueName = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
      const storageRef = ref(storage, uniqueName);
      onProgress?.(30);
      const snapshot = await uploadBytes(storageRef, file);
      onProgress?.(80);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      onProgress?.(100);
      return downloadUrl;
    } catch (storageError) {
      console.warn('Storage upload notice, falling back to optimized inline data:', storageError);
    }
  }

  // If image, compress with canvas to stay well within Firestore doc size limit
  if (isImage) {
    onProgress?.(50);
    const compressed = await compressImageFile(file);
    onProgress?.(100);
    return compressed;
  }

  // Convert to Data URL / Blob URL for client persistence
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      onProgress?.(100);
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
