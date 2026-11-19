import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { VideoItem } from '../types';
import { useLanguage, getCategoryLabel } from '../lib/i18n';
import { Filter, Play, Film, Plus } from 'lucide-react';

interface VideoViewProps {
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onGoToUpload?: () => void;
  isAdmin?: boolean;
}

export const VideoView: React.FC<VideoViewProps> = ({
  videos,
  onSelectVideo,
  onGoToUpload,
  isAdmin = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const { language, t } = useLanguage();

  // Extract unique video categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    videos.forEach((v) => {
      if (v.category) set.add(v.category.trim());
    });
    return ['ALL', ...Array.from(set)];
  }, [videos]);

  const filteredVideos = useMemo(() => {
    if (selectedCategory === 'ALL') return videos;
    return videos.filter((v) => v.category.trim().toLowerCase() === selectedCategory.toLowerCase());
  }, [videos, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#101010] text-[#fafafa] px-6 py-12 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-[#222222] pb-8 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-[#777777]">
              <span>{t.videoView.tag}</span>
              <span>•</span>
              <span>{videos.length} {t.videoView.archivedReelsSuffix}</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold font-heading tracking-tight sm:text-5xl">
              {t.videoView.heading}
            </h1>
            <p className="mt-3 max-w-xl text-xs text-[#888888] sm:text-sm">
              {t.videoView.subheading}
            </p>
          </div>

          {isAdmin && onGoToUpload && (
            <button
              onClick={onGoToUpload}
              className="inline-flex items-center gap-2 border border-white bg-white px-5 py-3 text-xs font-semibold tracking-wider text-black transition-all hover:bg-[#e4e4e7]"
            >
              <Plus className="h-4 w-4" />
              <span>{t.videoView.uploadBtn}</span>
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-[#1c1c1c] pb-6">
          <div className="mr-3 flex items-center gap-1.5 text-xs font-medium text-[#666666]">
            <Filter className="h-3.5 w-3.5" />
            <span>{t.videoView.genreLabel}:</span>
          </div>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'ALL'
                ? videos.length
                : videos.filter((v) => v.category.toLowerCase() === cat.toLowerCase()).length;
            const localizedLabel = getCategoryLabel(cat, language);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xs px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-black font-semibold'
                    : 'bg-[#181818] text-[#888888] hover:bg-[#222222] hover:text-[#cccccc]'
                }`}
              >
                <span>{localizedLabel}</span>
                <span className={`ml-1.5 text-[10px] ${isSelected ? 'text-[#555555]' : 'text-[#555555]'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Video Works Grid with Staggered Cascade Motion */}
        {filteredVideos.length > 0 ? (
          <motion.div
            key={selectedCategory}
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.06,
                },
              },
            }}
            className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2"
          >
            {filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.45,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                }}
                whileHover={{ y: -5, transition: { duration: 0.25, ease: 'easeOut' } }}
                onClick={() => onSelectVideo(video)}
                className="group relative cursor-pointer overflow-hidden rounded-xs border border-[#202020] bg-[#141414] transition-colors duration-300 hover:border-[#4f4f4f]"
              >
                {/* Video Thumbnail Stage */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-85 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
                  />

                  {/* Play Button Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-white group-hover:bg-white group-hover:text-black">
                      <Play className="h-5 w-5 fill-current translate-x-0.5" />
                    </div>
                  </div>

                  {/* Corner Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {video.resolution && (
                      <span className="rounded border border-white/20 bg-black/70 px-2 py-0.5 text-[10px] font-medium text-[#cccccc] backdrop-blur-sm">
                        {video.resolution}
                      </span>
                    )}
                    {video.duration && (
                      <span className="rounded bg-black/70 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                        {video.duration}
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    {video.isSample ? (
                      <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-[#888888] backdrop-blur-sm">
                        {t.videoView.sampleBadge}
                      </span>
                    ) : (
                      <span className="rounded border border-[#3b82f6]/40 bg-[#1e293b]/80 px-2 py-0.5 text-[10px] font-medium text-[#93c5fd] backdrop-blur-sm">
                        {t.videoView.originalBadge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Video Info Section */}
                <div className="p-6">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#666666]">
                    <span>{video.archiveCode || 'CINE-V'}</span>
                    <span className="rounded bg-[#1c1c1c] px-2 py-0.5 text-[#999999]">
                      {getCategoryLabel(video.category, language)}
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-lg font-bold text-[#f0f0f0] group-hover:text-white transition-colors">
                    {video.title}
                  </h3>

                  {video.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#888888]">
                      {video.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t border-[#1f1f1f] pt-3 text-[11px] text-[#555555]">
                    <span>{video.creationDate}</span>
                    <span className="text-[#888888]">
                      {video.client || 'DIRECT CINEMA'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          /* Empty State */
          <div className="mt-20 flex flex-col items-center justify-center rounded-xs border border-dashed border-[#222222] py-24 text-center">
            <Film className="h-10 w-10 text-[#444444]" />
            <h3 className="mt-4 text-base font-semibold text-white">{t.videoView.emptyHeading}</h3>
            <p className="mt-2 text-xs text-[#777777] max-w-sm">
              {t.videoView.emptyDesc}
            </p>
            {isAdmin && onGoToUpload ? (
              <button
                onClick={onGoToUpload}
                className="mt-6 border border-[#333333] bg-[#181818] px-5 py-2.5 text-xs font-medium text-white hover:border-white"
              >
                {t.videoView.uploadNewBtn}
              </button>
            ) : (
              <button
                onClick={() => setSelectedCategory('ALL')}
                className="mt-6 border border-[#333333] px-5 py-2 text-xs font-medium text-[#aaaaaa] hover:text-white"
              >
                {t.videoView.viewAllBtn}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
