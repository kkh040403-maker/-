import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  db,
  auth,
  googleProvider,
  testConnection,
  handleFirestoreError,
  OperationType,
} from './firebase';
import { PhotoItem, VideoItem, ProfileData } from '../types';
import { INITIAL_PHOTOS, INITIAL_VIDEOS, INITIAL_PROFILE } from './initialData';

const ADMIN_EMAIL = 'kkh040403@gmail.com';
const LOCAL_STORAGE_PHOTOS_KEY = 'dark_archive_photos_v1';
const LOCAL_STORAGE_VIDEOS_KEY = 'dark_archive_videos_v1';
const LOCAL_STORAGE_PROFILE_KEY = 'dark_archive_profile_v1';
const LOCAL_STORAGE_ADMIN_SESSION_KEY = 'dark_archive_admin_session';

export function useArchiveStore() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_ADMIN_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Synchronously initialize state from localStorage or default samples to prevent any blank initial render
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PHOTOS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Photos read error:', e);
    }
    return INITIAL_PHOTOS;
  });

  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_VIDEOS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Videos read error:', e);
    }
    return INITIAL_VIDEOS;
  });

  const [profile, setProfile] = useState<ProfileData>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name) return parsed;
      }
    } catch (e) {
      console.warn('Profile read error:', e);
    }
    return INITIAL_PROFILE;
  });

  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'syncing'>('local');

  // Local storage persistence helpers
  const persistPhotosLocal = (data: PhotoItem[]) => {
    setPhotos(data);
    try {
      localStorage.setItem(LOCAL_STORAGE_PHOTOS_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Local storage quota limit reached for photos:', e);
    }
  };

  const persistVideosLocal = (data: VideoItem[]) => {
    setVideos(data);
    try {
      localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Local storage quota limit reached for videos:', e);
    }
  };

  const persistProfileLocal = (data: ProfileData) => {
    setProfile(data);
    try {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Local storage save error for profile:', e);
    }
  };

  // Auth state listener
  useEffect(() => {
    testConnection();

    if (auth) {
      try {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
          setCurrentUser(user);
          if (user) {
            const isUserAdmin =
              user.email === ADMIN_EMAIL ||
              localStorage.getItem(LOCAL_STORAGE_ADMIN_SESSION_KEY) === 'true';
            setIsAdmin(isUserAdmin);
          } else {
            const localSession = localStorage.getItem(LOCAL_STORAGE_ADMIN_SESSION_KEY) === 'true';
            setIsAdmin(localSession);
          }
        });
        return () => unsubscribeAuth();
      } catch (authError) {
        console.warn('Auth state subscription notice:', authError);
      }
    }
  }, []);

  // Background Firestore sync
  useEffect(() => {
    let isMounted = true;

    async function syncFirestoreData() {
      if (!db) return;
      try {
        setSyncStatus('syncing');

        // Fetch Photos
        const photoCol = collection(db, 'photos');
        const photoSnap = await getDocs(photoCol);

        if (isMounted && !photoSnap.empty) {
          const remotePhotos: PhotoItem[] = [];
          photoSnap.forEach((docSnap) => {
            remotePhotos.push({ ...(docSnap.data() as PhotoItem), id: docSnap.id });
          });
          if (remotePhotos.length > 0) {
            persistPhotosLocal(remotePhotos);
          }
        }

        // Fetch Videos
        const videoCol = collection(db, 'videos');
        const videoSnap = await getDocs(videoCol);

        if (isMounted && !videoSnap.empty) {
          const remoteVideos: VideoItem[] = [];
          videoSnap.forEach((docSnap) => {
            remoteVideos.push({ ...(docSnap.data() as VideoItem), id: docSnap.id });
          });
          if (remoteVideos.length > 0) {
            persistVideosLocal(remoteVideos);
          }
        }

        // Fetch Profile
        const profileDoc = doc(db, 'settings', 'profile');
        const profileSnap = await getDoc(profileDoc);
        if (isMounted && profileSnap.exists()) {
          const remoteProfile = profileSnap.data() as ProfileData;
          persistProfileLocal(remoteProfile);
        }

        if (isMounted) {
          setSyncStatus('synced');
        }
      } catch (err) {
        console.info('Using high-performance persistent local archive:', err);
        if (isMounted) {
          setSyncStatus('local');
        }
      }
    }

    syncFirestoreData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auth Actions
  const loginWithGoogle = async () => {
    if (!auth) {
      throw new Error('인증 서비스 연결 중입니다. 비밀번호로 로그인해 주세요.');
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setCurrentUser(user);
      setIsAdmin(true);
      localStorage.setItem(LOCAL_STORAGE_ADMIN_SESSION_KEY, 'true');
      return { success: true, user };
    } catch (error: any) {
      console.warn('Google sign-in notice:', error);
      throw error;
    }
  };

  const loginWithPasscode = (code: string) => {
    if (code.trim() === '0192' || code.trim() === 'archive2026' || code.trim() === 'admin' || code.trim() === '040403') {
      setIsAdmin(true);
      localStorage.setItem(LOCAL_STORAGE_ADMIN_SESSION_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = async () => {
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.warn(e);
      }
    }
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem(LOCAL_STORAGE_ADMIN_SESSION_KEY);
  };

  // Photo Management
  const addPhoto = async (newPhotoData: Omit<PhotoItem, 'id'>) => {
    const id = `photo_${Date.now()}`;
    const newPhoto: PhotoItem = {
      ...newPhotoData,
      id,
      isSample: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.uid || 'admin',
    };

    const updated = [newPhoto, ...photos];
    persistPhotosLocal(updated);

    if (db) {
      try {
        await setDoc(doc(db, 'photos', id), newPhoto);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `photos/${id}`);
      }
    }

    return newPhoto;
  };

  const updatePhoto = async (id: string, updates: Partial<PhotoItem>) => {
    const updated = photos.map((item) =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date().toISOString(), isSample: false }
        : item
    );
    persistPhotosLocal(updated);

    if (db) {
      try {
        const docRef = doc(db, 'photos', id);
        await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `photos/${id}`);
      }
    }
  };

  const deletePhoto = async (id: string) => {
    const updated = photos.filter((item) => item.id !== id);
    persistPhotosLocal(updated);

    if (db) {
      try {
        await deleteDoc(doc(db, 'photos', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `photos/${id}`);
      }
    }
  };

  // Video Management
  const addVideo = async (newVideoData: Omit<VideoItem, 'id'>) => {
    const id = `video_${Date.now()}`;
    const newVideo: VideoItem = {
      ...newVideoData,
      id,
      isSample: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.uid || 'admin',
    };

    const updated = [newVideo, ...videos];
    persistVideosLocal(updated);

    if (db) {
      try {
        await setDoc(doc(db, 'videos', id), newVideo);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `videos/${id}`);
      }
    }

    return newVideo;
  };

  const updateVideo = async (id: string, updates: Partial<VideoItem>) => {
    const updated = videos.map((item) =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date().toISOString(), isSample: false }
        : item
    );
    persistVideosLocal(updated);

    if (db) {
      try {
        const docRef = doc(db, 'videos', id);
        await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `videos/${id}`);
      }
    }
  };

  const deleteVideo = async (id: string) => {
    const updated = videos.filter((item) => item.id !== id);
    persistVideosLocal(updated);

    if (db) {
      try {
        await deleteDoc(doc(db, 'videos', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `videos/${id}`);
      }
    }
  };

  // Profile Management
  const updateProfile = async (newProfile: ProfileData) => {
    const updated = { ...newProfile, updatedAt: new Date().toISOString() };
    persistProfileLocal(updated);

    if (db) {
      try {
        await setDoc(doc(db, 'settings', 'profile'), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'settings/profile');
      }
    }
  };

  // Reset to initial sample data
  const resetToSampleData = () => {
    persistPhotosLocal(INITIAL_PHOTOS);
    persistVideosLocal(INITIAL_VIDEOS);
    persistProfileLocal(INITIAL_PROFILE);
  };

  return {
    currentUser,
    isAdmin,
    photos,
    videos,
    profile,
    loading,
    syncStatus,
    loginWithGoogle,
    loginWithPasscode,
    logout,
    addPhoto,
    updatePhoto,
    deletePhoto,
    addVideo,
    updateVideo,
    deleteVideo,
    updateProfile,
    resetToSampleData,
  };
}
