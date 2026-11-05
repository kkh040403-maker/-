import React, { useEffect, useCallback, useMemo } from 'react';
import { VideoItem } from '../types';
import { X, ChevronLeft, ChevronRight, Play, Film, Calendar, Clapperboard, ExternalLink } from 'lucide-react';

interface VideoModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  video,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  );

  useEffect(() => {
    if (video) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [video, handleKeyDown]);

  // Video embed or direct stream analyzer
  const embedInfo = useMemo(() => {
    if (!video) return { type: 'none', url: '' };
    const url = video.videoUrl.trim();

    // YouTube check
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      return {
        type: 'youtube',
        url: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
      };
    }

    // Vimeo check
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        url: `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=1`,
      };
    }

    // Direct MP4 / WebM / Blob
    return {
      type: 'direct',
      url,
    };
  }, [video]);

  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]/95 backdrop-blur-xl animate-fadeIn">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex h-16 items-center justify-between border-b border-[#222222] bg-[#0c0c0c]/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3 font-mono-archive text-xs tracking-wider text-[#888888]">
          <span className="text-white font-semibold">{video.archiveCode || 'VIDEO'}</span>
          <span>/</span>
          <span>{video.category}</span>
          {video.resolution && (
            <span className="rounded border border-[#333333] px-1.5 py-0.5 text-[10px] text-[#cccccc]">
              {video.resolution}
            </span>
          )}
          {video.isSample ? (
            <span className="rounded bg-[#222222] px-2 py-0.5 text-[10px] text-[#999999]">
              SAMPLE
            </span>
          ) : (
            <span className="rounded bg-[#1e293b] px-2 py-0.5 text-[10px] text-[#93c5fd]">
              ORIGINAL ARCHIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono-archive text-[#888888] hover:text-white transition-colors"
            title="원본 영상 링크 열기"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">SOURCE</span>
          </a>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#888888] hover:bg-[#1a1a1a] hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#2a2a2a] bg-[#141414]/80 p-3 text-white backdrop-blur-md transition-all hover:border-[#555555] hover:bg-[#202020] focus:outline-none"
          aria-label="Previous Video"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#2a2a2a] bg-[#141414]/80 p-3 text-white backdrop-blur-md transition-all hover:border-[#555555] hover:bg-[#202020] focus:outline-none"
          aria-label="Next Video"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Main Content Modal Body */}
      <div className="flex h-full w-full flex-col pt-16 lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Left / Center Video Stage */}
        <div className="relative flex flex-1 items-center justify-center p-4 lg:p-12 overflow-hidden bg-[#070707]">
          <div className="w-full max-w-5xl aspect-video rounded-xs overflow-hidden shadow-2xl bg-black border border-[#222222]">
            {embedInfo.type === 'direct' ? (
              <video
                key={video.id}
                src={embedInfo.url}
                poster={video.thumbnailUrl}
                controls
                autoPlay
                playsInline
                className="h-full w-full object-contain"
              >
                브라우저가 HTML5 비디오 재생을 지원하지 않습니다.
              </video>
            ) : (
              <iframe
                key={video.id}
                src={embedInfo.url}
                title={video.title}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>

        {/* Right Info Drawer (Desktop) / Bottom Details (Mobile) */}
        <div className="w-full border-t border-[#222222] bg-[#111111] p-6 lg:w-96 lg:border-t-0 lg:border-l lg:p-8 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono-archive tracking-widest text-[#777777] uppercase">
                <span>{video.category}</span>
                {video.duration && <span>• {video.duration}</span>}
              </div>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-white lg:text-2xl">
                {video.title}
              </h2>
            </div>

            {video.description && (
              <p className="text-xs leading-relaxed text-[#999999] whitespace-pre-line border-t border-[#222222] pt-4">
                {video.description}
              </p>
            )}

            {/* Technical Metadata Matrix */}
            <div className="space-y-3 border-t border-[#222222] pt-5 font-mono-archive text-xs">
              <div className="text-[10px] uppercase tracking-widest text-[#666666]">
                CINEMA SPECIFICATIONS
              </div>

              <div className="flex items-center justify-between text-[#888888]">
                <span className="flex items-center gap-2 text-[#666666]">
                  <Calendar className="h-3.5 w-3.5" />
                  DATE
                </span>
                <span className="text-[#dddddd]">{video.creationDate}</span>
              </div>

              {video.duration && (
                <div className="flex items-center justify-between text-[#888888]">
                  <span className="flex items-center gap-2 text-[#666666]">
                    <Film className="h-3.5 w-3.5" />
                    RUNNING TIME
                  </span>
                  <span className="text-[#dddddd]">{video.duration}</span>
                </div>
              )}

              {video.resolution && (
                <div className="flex items-center justify-between text-[#888888]">
                  <span className="flex items-center gap-2 text-[#666666]">
                    <Clapperboard className="h-3.5 w-3.5" />
                    RESOLUTION
                  </span>
                  <span className="text-[#dddddd]">{video.resolution}</span>
                </div>
              )}

              {video.client && (
                <div className="flex items-center justify-between text-[#888888]">
                  <span className="text-[#666666]">CLIENT / COLLAB</span>
                  <span className="text-[#dddddd]">{video.client}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[#888888]">
                <span className="text-[#666666]">STREAM TYPE</span>
                <span className="text-[#dddddd] uppercase">{embedInfo.type}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[#222222] pt-4 text-center lg:text-left text-[11px] font-mono-archive text-[#555555]">
            USE [←] [→] KEYS TO BROWSE • [ESC] TO CLOSE
          </div>
        </div>
      </div>
    </div>
  );
};
