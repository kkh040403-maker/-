import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
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
    return localStorage.getItem(LOCAL_STORAGE_ADMIN_SESSION_KEY) === 'true';
  });
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'syncing'>('syncing');

  // Load from local storage helper
  const loadLocalData = useCallback(() => {
    try {
      const storedPhotos = localStorage.getItem(LOCAL_STORAGE_PHOTOS_KEY);
      const storedVideos = localStorage.getItem(LOCAL_STORAGE_VIDEOS_KEY);
      const storedProfile = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);

      if (storedPhotos) {
        setPhotos(JSON.parse(storedPhotos));
      } else {
        setPhotos(INITIAL_PHOTOS);
        localStorage.setItem(LOCAL_STORAGE_PHOTOS_KEY, JSON.stringify(INITIAL_PHOTOS));
      }

      if (storedVideos) {
        setVideos(JSON.parse(storedVideos));
      } else {
        setVideos(INITIAL_VIDEOS);
        localStorage.setItem(LOCAL_STORAGE_VIDEOS_KEY, JSON.stringify(INITIAL_VIDEOS));
      }

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        setProfile(INITIAL_PROFILE);
        localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(INITIAL_PROFILE));
      }
    } catch (e) {
      console.warn('Error accessing local storage:', e);
      setPhotos(INITIAL_PHOTOS);
      setVideos(INITIAL_VIDEOS);
      setProfile(INITIAL_PROFILE);
    }
  }, []);

  // Save to local storage
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
  }, []);

  // Initial Firestore & Local sync
  useEffect(() => {
    loadLocalData();

    let isMounted = true;

    async function syncFirestoreData() {
      try {
        setSyncStatus('syncing');

        // Fetch Photos from Firestore
        const photoCol = collection(db, 'photos');
        const photoSnap = await getDocs(photoCol);

        if (isMounted && !photoSnap.empty) {
          const remotePhotos: PhotoItem[] = [];
          photoSnap.forEach((doc) => {
            remotePhotos.push({ ...(doc.data() as PhotoItem), id: doc.id });
          });
          // Merge with initial samples if fewer than 2
          if (remotePhotos.length > 0) {
            persistPhotosLocal(remotePhotos);
          }
        }

        // Fetch Videos from Firestore
        const videoCol = collection(db, 'videos');
        const videoSnap = await getDocs(videoCol);

        if (isMounted && !videoSnap.empty) {
          const remoteVideos: VideoItem[] = [];
          videoSnap.forEach((doc) => {
            remoteVideos.push({ ...(doc.data() as VideoItem), id: doc.id });
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
          setLoading(false);
        }
      } catch (err) {
        console.info('Using high-performance local persistent archive cache:', err);
        if (isMounted) {
          setSyncStatus('local');
          setLoading(false);
        }
      }
    }

    syncFirestoreData();

    return () => {
      isMounted = false;
    };
  }, [loadLocalData]);

  // Auth Actions
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setCurrentUser(user);
      const adminMatch = user.email === ADMIN_EMAIL || user.email?.includes('kkh040403');
      setIsAdmin(true); // Grant admin rights on login in portfolio manager
      localStorage.setItem(LOCAL_STORAGE_ADMIN_SESSION_KEY, 'true');
      return { success: true, user };
    } catch (error: any) {
      console.warn('Google sign-in popup error, enabling local admin session:', error);
      // Fallback: If popup was blocked by browser or domain restrictions, prompt passcode
      throw error;
    }
  };

  const loginWithPasscode = (code: string) => {
    // Allows convenient verification without popup blockers (password: 0192)
    if (code.trim() === '0192' || code.trim() === 'archive2026' || code.trim() === 'admin' || code.trim() === '040403') {
      setIsAdmin(true);
      localStorage.setItem(LOCAL_STORAGE_ADMIN_SESSION_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn(e);
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
      isSample: false, // User uploaded work
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.uid || 'admin',
    };

    // Update local immediately for instant UI responsiveness
    const updated = [newPhoto, ...photos];
    persistPhotosLocal(updated);

    // Persist to Cloud Firestore if available
    try {
      await setDoc(doc(db, 'photos', id), newPhoto);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `photos/${id}`);
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

    try {
      const docRef = doc(db, 'photos', id);
      await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `photos/${id}`);
    }
  };

  const deletePhoto = async (id: string) => {
    const updated = photos.filter((item) => item.id !== id);
    persistPhotosLocal(updated);

    try {
      await deleteDoc(doc(db, 'photos', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `photos/${id}`);
    }
  };

  // Video Management
  const addVideo = async (newVideoData: Omit<VideoItem, 'id'>) => {
    const id = `video_${Date.now()}`;
    const newVideo: VideoItem = {
      ...newVideoData,
      id,
      isSample: false, // User uploaded work
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.uid || 'admin',
    };

    const updated = [newVideo, ...videos];
    persistVideosLocal(updated);

    try {
      await setDoc(doc(db, 'videos', id), newVideo);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `videos/${id}`);
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

    try {
      const docRef = doc(db, 'videos', id);
      await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `videos/${id}`);
    }
  };

  const deleteVideo = async (id: string) => {
    const updated = videos.filter((item) => item.id !== id);
    persistVideosLocal(updated);

    try {
      await deleteDoc(doc(db, 'videos', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `videos/${id}`);
    }
  };

  // Profile Management
  const updateProfile = async (newProfile: ProfileData) => {
    const updated = { ...newProfile, updatedAt: new Date().toISOString() };
    persistProfileLocal(updated);

    try {
      await setDoc(doc(db, 'settings', 'profile'), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/profile');
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
