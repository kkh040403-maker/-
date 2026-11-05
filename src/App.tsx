import React, { useState } from 'react';
import { PageTab, PhotoItem, VideoItem } from './types';
import { useArchiveStore } from './lib/store';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { PhotoView } from './components/PhotoView';
import { VideoView } from './components/VideoView';
import { AboutView } from './components/AboutView';
import { AdminView } from './components/AdminView';
import { PhotoModal } from './components/PhotoModal';
import { VideoModal } from './components/VideoModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<PageTab>('HOME');

  const {
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
  } = useArchiveStore();

  // Active Lightbox / Theater Modals
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  // Photo Navigation in Modal
  const activePhotoIndex = selectedPhoto
    ? photos.findIndex((p) => p.id === selectedPhoto.id)
    : -1;
  const hasPrevPhoto = activePhotoIndex > 0;
  const hasNextPhoto = activePhotoIndex !== -1 && activePhotoIndex < photos.length - 1;

  const handlePrevPhoto = () => {
    if (hasPrevPhoto) {
      setSelectedPhoto(photos[activePhotoIndex - 1]);
    }
  };

  const handleNextPhoto = () => {
    if (hasNextPhoto) {
      setSelectedPhoto(photos[activePhotoIndex + 1]);
    }
  };

  // Video Navigation in Modal
  const activeVideoIndex = selectedVideo
    ? videos.findIndex((v) => v.id === selectedVideo.id)
    : -1;
  const hasPrevVideo = activeVideoIndex > 0;
  const hasNextVideo = activeVideoIndex !== -1 && activeVideoIndex < videos.length - 1;

  const handlePrevVideo = () => {
    if (hasPrevVideo) {
      setSelectedVideo(videos[activeVideoIndex - 1]);
    }
  };

  const handleNextVideo = () => {
    if (hasNextVideo) {
      setSelectedVideo(videos[activeVideoIndex + 1]);
    }
  };

  const handleSelectTab = (tab: PageTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalWorks = photos.length + videos.length;

  return (
    <div className="min-h-screen bg-[#101010] text-[#FAFAFA] flex flex-col font-sans selection:bg-[#333333] selection:text-white">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isAdmin={isAdmin}
        totalItems={totalWorks}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'HOME' && (
          <HomeView
            photos={photos}
            videos={videos}
            onSelectTab={handleSelectTab}
            onSelectPhoto={(photo) => setSelectedPhoto(photo)}
            onSelectVideo={(video) => setSelectedVideo(video)}
          />
        )}

        {currentTab === 'PHOTO' && (
          <PhotoView
            photos={photos}
            onSelectPhoto={(photo) => setSelectedPhoto(photo)}
            onGoToUpload={() => handleSelectTab('ADMIN')}
            isAdmin={isAdmin}
          />
        )}

        {currentTab === 'VIDEO' && (
          <VideoView
            videos={videos}
            onSelectVideo={(video) => setSelectedVideo(video)}
            onGoToUpload={() => handleSelectTab('ADMIN')}
            isAdmin={isAdmin}
          />
        )}

        {currentTab === 'ABOUT' && (
          <AboutView
            profile={profile}
            isAdmin={isAdmin}
            onGoToEditProfile={() => handleSelectTab('ADMIN')}
          />
        )}

        {currentTab === 'ADMIN' && (
          <AdminView
            isAdmin={isAdmin}
            currentUserEmail={currentUser?.email}
            photos={photos}
            videos={videos}
            profile={profile}
            onLoginGoogle={loginWithGoogle}
            onLoginPasscode={loginWithPasscode}
            onLogout={logout}
            onAddPhoto={addPhoto}
            onUpdatePhoto={updatePhoto}
            onDeletePhoto={deletePhoto}
            onAddVideo={addVideo}
            onUpdateVideo={updateVideo}
            onDeleteVideo={deleteVideo}
            onUpdateProfile={updateProfile}
            onResetSamples={resetToSampleData}
          />
        )}
      </main>

      {/* Modals */}
      <PhotoModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onPrev={handlePrevPhoto}
        onNext={handleNextPhoto}
        hasPrev={hasPrevPhoto}
        hasNext={hasNextPhoto}
      />

      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
        onPrev={handlePrevVideo}
        onNext={handleNextVideo}
        hasPrev={hasPrevVideo}
        hasNext={hasNextVideo}
      />

      {/* Footer */}
      <Footer onSelectTab={handleSelectTab} isAdmin={isAdmin} />
    </div>
  );
}
