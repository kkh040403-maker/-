import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PhotoItem, VideoItem, PageTab } from '../types';
import { useLanguage } from '../lib/i18n';
import { ArrowRight, Play, Eye, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface HomeViewProps {
  photos: PhotoItem[];
  videos: VideoItem[];
  onSelectTab: (tab: PageTab) => void;
  onSelectPhoto: (photo: PhotoItem) => void;
  onSelectVideo: (video: VideoItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  photos,
  videos,
  onSelectTab,
  onSelectPhoto,
  onSelectVideo,
}) => {
  const [videoMuted, setVideoMuted] = useState(true);
  const { t } = useLanguage();

  // Pick primary featured video or photo
  const featuredVideo = videos.find((v) => v.isFeatured) || videos[0];
  const featuredPhoto = photos.find((p) => p.isFeatured) || photos[0];

  // Recent highlights: top 4 photos and top 2 videos
  const recentPhotos = photos.slice(0, 4);
  const recentVideos = videos.slice(0, 2);

  return (
    <div className="min-h-screen bg-[#101010] text-[#fafafa]">
      {/* Hero Section */}
      <section className="relative px-6 pt-12 pb-20 lg:px-12 lg:pt-20 lg:pb-32 border-b border-[#1c1c1c]">
        <div className="mx-auto max-w-7xl">
          {/* Manifesto / Title Header */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 text-xs font-mono-archive tracking-[0.25em] text-[#888888]">
                <span className="inline-block h-2 w-2 rounded-full bg-white animate-pulse" />
                <span>{t.home.tag}</span>
              </div>
              <h1 className="mt-4 text-4xl font-extrabold font-display tracking-tight sm:text-6xl lg:text-7xl">
                {t.home.portfolioTitle}
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#a1a1aa] sm:text-base">
                {t.home.heroDesc}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:justify-end">
              <button
                onClick={() => onSelectTab('PHOTO')}
                className="group flex items-center justify-center gap-3 border border-[#333333] bg-[#181818] px-6 py-4 text-xs font-mono-archive tracking-widest text-white transition-all hover:border-white hover:bg-white hover:text-black"
              >
                <span>{t.home.explorePhoto}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => onSelectTab('VIDEO')}
                className="group flex items-center justify-center gap-3 border border-[#222222] bg-transparent px-6 py-4 text-xs font-mono-archive tracking-widest text-[#aaaaaa] transition-all hover:border-[#666666] hover:text-white"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{t.home.watchCinema}</span>
              </button>
            </div>
          </div>

          {/* Featured Visual Hero Stage */}
          <div className="mt-12 lg:mt-16">
            <div className="relative aspect-[16/9] lg:aspect-[21/9] w-full overflow-hidden rounded-xs border border-[#222222] bg-[#0c0c0c] group">
              {featuredVideo ? (
                <>
                  <video
                    src={featuredVideo.videoUrl}
                    poster={featuredVideo.thumbnailUrl}
                    autoPlay
                    loop
                    muted={videoMuted}
                    playsInline
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-transparent to-transparent opacity-80" />

                  {/* Stage Overlays */}
                  <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end lg:bottom-10 lg:left-10 lg:right-10">
                    <div>
                      <div className="flex items-center gap-2 font-mono-archive text-[11px] text-[#888888] tracking-widest">
                        <span>FEATURED VISUAL</span>
                        <span>•</span>
                        <span>{featuredVideo.archiveCode || 'CINE'}</span>
                        <span>•</span>
                        <span>{featuredVideo.category}</span>
                      </div>
                      <h2 className="mt-1 text-2xl font-bold tracking-tight text-white lg:text-3xl">
                        {featuredVideo.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setVideoMuted(!videoMuted)}
                        className="rounded-full border border-white/20 bg-black/60 p-3 text-white backdrop-blur-md transition-all hover:bg-black/90 hover:border-white/50"
                        title={videoMuted ? '음소거 해제' : '음소거'}
                      >
                        {videoMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => onSelectVideo(featuredVideo)}
                        className="flex items-center gap-2 rounded-xs border border-white bg-white px-5 py-3 text-xs font-mono-archive tracking-wider text-black transition-all hover:bg-[#e4e4e7]"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>FULL THEATER</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : featuredPhoto ? (
                <div
                  onClick={() => onSelectPhoto(featuredPhoto)}
                  className="relative h-full w-full cursor-pointer"
                >
                  <img
                    src={featuredPhoto.imageUrl}
                    alt={featuredPhoto.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-transparent to-transparent opacity-70" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="font-mono-archive text-xs text-[#888888]">
                      FEATURED PHOTOGRAPHY
                    </div>
                    <div className="mt-1 text-2xl font-bold text-white">
                      {featuredPhoto.title}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Quick Technical Matrix Bar */}
          <div className="mt-8 grid grid-cols-2 gap-4 border border-[#1f1f1f] bg-[#141414] p-6 font-mono-archive text-xs text-[#888888] sm:grid-cols-4">
            <div>
              <span className="text-[#555555] block text-[10px] uppercase">{t.home.totalArchive}</span>
              <span className="mt-1 text-white font-semibold text-sm">
                {(photos.length + videos.length).toString().padStart(2, '0')} {t.home.works}
              </span>
            </div>
            <div>
              <span className="text-[#555555] block text-[10px] uppercase">{t.home.stillPhotography}</span>
              <span className="mt-1 text-white font-semibold text-sm">
                {photos.length.toString().padStart(2, '0')} {t.home.frames}
              </span>
            </div>
            <div>
              <span className="text-[#555555] block text-[10px] uppercase">{t.home.cinematography}</span>
              <span className="mt-1 text-white font-semibold text-sm">
                {videos.length.toString().padStart(2, '0')} {t.home.films}
              </span>
            </div>
            <div>
              <span className="text-[#555555] block text-[10px] uppercase">{t.home.monochrome}</span>
              <span className="mt-1 text-white font-semibold text-sm">
                4K UHD / RAW
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Photos Showcase */}
      <section className="px-6 py-20 lg:px-12 border-b border-[#1c1c1c]">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs font-mono-archive tracking-widest text-[#777777]">
                {t.home.recentPhotosTitle}
              </div>
              <h2 className="mt-2 text-2xl font-bold font-heading tracking-tight text-white lg:text-3xl">
                {t.home.recentPhotosHeading}
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('PHOTO')}
              className="hidden sm:flex items-center gap-2 text-xs font-mono-archive tracking-wider text-[#888888] hover:text-white transition-colors"
            >
              <span>{t.home.viewAllPhotos} ({photos.length})</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Photo Grid with Staggered Cascade */}
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08, delayChildren: 0.1 },
              },
            }}
            initial="hidden"
            animate="visible"
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {recentPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: [0.215, 0.61, 0.355, 1] },
                  },
                }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => onSelectPhoto(photo)}
                className="group relative cursor-pointer overflow-hidden rounded-xs border border-[#202020] bg-[#141414] transition-colors hover:border-[#444444]"
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-[#181818]">
                  <img
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt={photo.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-[11px] font-mono-archive text-[#666666]">
                    <span>{photo.archiveCode || 'ARCH-P'}</span>
                    <span>{photo.category}</span>
                  </div>
                  <h3 className="mt-1.5 truncate text-sm font-semibold text-[#f0f0f0] group-hover:text-white">
                    {photo.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono-archive text-[#555555]">
                    <span>{photo.creationDate}</span>
                    <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#999999]">
                      <Eye className="h-3 w-3" />
                      VIEW
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 text-center sm:hidden">
            <button
              onClick={() => onSelectTab('PHOTO')}
              className="inline-flex items-center gap-2 border border-[#333333] px-6 py-3 text-xs font-mono-archive text-[#cccccc]"
            >
              <span>VIEW ALL PHOTOS</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Recent Videos Showcase */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs font-mono-archive tracking-widest text-[#777777]">
                {t.home.recentVideosTitle}
              </div>
              <h2 className="mt-2 text-2xl font-bold font-heading tracking-tight text-white lg:text-3xl">
                {t.home.recentVideosHeading}
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('VIDEO')}
              className="hidden sm:flex items-center gap-2 text-xs font-mono-archive tracking-wider text-[#888888] hover:text-white transition-colors"
            >
              <span>{t.home.viewAllVideos} ({videos.length})</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.1 },
              },
            }}
            initial="hidden"
            animate="visible"
            className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2"
          >
            {recentVideos.map((video) => (
              <motion.div
                key={video.id}
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.45, ease: [0.215, 0.61, 0.355, 1] },
                  },
                }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => onSelectVideo(video)}
                className="group relative cursor-pointer overflow-hidden rounded-xs border border-[#202020] bg-[#141414] transition-colors hover:border-[#444444]"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-black">
                      <Play className="h-4 w-4 fill-current translate-x-0.5" />
                    </div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-0.5 font-mono-archive text-[11px] text-white">
                      {video.duration}
                    </div>
                  )}
                  {video.resolution && (
                    <div className="absolute top-3 left-3 rounded border border-white/20 bg-black/60 px-2 py-0.5 font-mono-archive text-[10px] text-[#cccccc]">
                      {video.resolution}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between text-[11px] font-mono-archive text-[#666666]">
                    <span>{video.archiveCode || 'CINE-V'}</span>
                    <span>{video.category}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white group-hover:text-white">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#888888]">
                      {video.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-[#1f1f1f] pt-3 text-[11px] font-mono-archive text-[#555555]">
                    <span>{video.creationDate}</span>
                    <span>{video.client || 'INDEPENDENT ARCHIVE'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};
