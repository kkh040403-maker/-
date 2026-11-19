import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { PhotoItem } from '../types';
import { useLanguage, getCategoryLabel } from '../lib/i18n';
import { X, ChevronLeft, ChevronRight, Camera, Calendar, Tag, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

interface PhotoModalProps {
  photo: PhotoItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  photo,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { language, t } = useLanguage();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
      if (e.key === 'f' || e.key === 'F') setIsFullscreen((prev) => !prev);
    },
    [onClose, onPrev, onNext, hasPrev, hasNext, isFullscreen]
  );

  useEffect(() => {
    if (photo) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [photo, handleKeyDown]);

  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]/95 backdrop-blur-xl"
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex h-16 items-center justify-between border-b border-[#222222] bg-[#0c0c0c]/80 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium tracking-wide text-[#888888]">
          <span className="text-white font-semibold">{photo.archiveCode || 'PHOTO'}</span>
          <span>/</span>
          <span className="hidden sm:inline">{getCategoryLabel(photo.category, language)}</span>
          {photo.isSample ? (
            <span className="rounded bg-[#222222] px-2 py-0.5 text-[10px] text-[#999999]">
              {t.modal.sampleTag}
            </span>
          ) : (
            <span className="rounded bg-[#1e293b] px-2 py-0.5 text-[10px] text-[#93c5fd]">
              {t.modal.archiveTag}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Prev / Next */}
          <div className="flex items-center sm:hidden gap-1 mr-1">
            {hasPrev && (
              <button
                onClick={onPrev}
                className="rounded-full p-1.5 text-[#aaaaaa] hover:bg-[#1a1a1a] hover:text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="rounded-full p-1.5 text-[#aaaaaa] hover:bg-[#1a1a1a] hover:text-white"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Fullscreen Expand/Collapse Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 rounded p-1.5 text-xs font-medium text-[#aaaaaa] hover:bg-[#1a1a1a] hover:text-white transition-colors"
            title={isFullscreen ? '기본 화면으로 전환' : '전체 화면으로 보기 (화면 꽉 채움)'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="hidden md:inline">{isFullscreen ? '정보 보기' : '전체 화면'}</span>
          </button>

          <a
            href={photo.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-[#888888] hover:text-white transition-colors"
            title="원본 이미지 새 탭에서 열기"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t.modal.viewRaw}</span>
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

      {/* Navigation Arrows for Desktop */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="hidden sm:flex absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#2a2a2a] bg-[#141414]/80 p-3 text-white backdrop-blur-md transition-all hover:border-[#555555] hover:bg-[#202020] focus:outline-none"
          aria-label="Previous Photo"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={onNext}
          className="hidden sm:flex absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#2a2a2a] bg-[#141414]/80 p-3 text-white backdrop-blur-md transition-all hover:border-[#555555] hover:bg-[#202020] focus:outline-none"
          aria-label="Next Photo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Main Content Modal Body */}
      <div className={`flex h-full w-full flex-col pt-16 ${isFullscreen ? 'overflow-hidden' : 'lg:flex-row overflow-y-auto lg:overflow-hidden'}`}>
        {/* Center Image Stage */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setIsFullscreen(!isFullscreen)}
          className={`relative flex w-full items-center justify-center p-2 sm:p-6 lg:p-8 select-none transition-all ${
            isFullscreen
              ? 'flex-1 h-full min-h-0 max-h-none bg-black cursor-zoom-out'
              : 'shrink-0 min-h-[48vh] max-h-[64vh] lg:min-h-0 lg:max-h-none lg:flex-1 bg-black/40 cursor-zoom-in'
          }`}
        >
          <motion.img
            key={photo.id}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            src={photo.imageUrl}
            alt={photo.title}
            className={`max-w-full w-auto h-auto object-contain rounded-xs shadow-2xl transition-all ${
              isFullscreen
                ? 'max-h-[88vh]'
                : 'max-h-[52vh] sm:max-h-[70vh] lg:max-h-[82vh]'
            }`}
          />
        </motion.div>

        {/* Right Info Drawer (Desktop) / Bottom Details (Mobile) - hidden in isFullscreen */}
        {!isFullscreen && (
          <div className="w-full border-t border-[#222222] bg-[#111111] p-6 lg:w-96 lg:border-t-0 lg:border-l lg:p-8 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-medium text-[#777777] uppercase tracking-wider">
                {getCategoryLabel(photo.category, language)}
              </div>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-white lg:text-2xl">
                {photo.title}
              </h2>
            </div>

            {photo.description && (
              <p className="text-xs leading-relaxed text-[#999999] whitespace-pre-line border-t border-[#222222] pt-4">
                {photo.description}
              </p>
            )}

            {/* Technical Metadata Matrix */}
            <div className="space-y-3 border-t border-[#222222] pt-5 text-xs">
              <div className="text-[10px] uppercase tracking-wider font-medium text-[#666666]">
                {t.modal.techSpecs}
              </div>

              <div className="flex items-center justify-between text-[#888888]">
                <span className="flex items-center gap-2 text-[#666666]">
                  <Calendar className="h-3.5 w-3.5" />
                  {t.modal.date}
                </span>
                <span className="text-[#dddddd] font-medium">{photo.creationDate}</span>
              </div>

              {photo.camera && (
                <div className="flex items-center justify-between text-[#888888]">
                  <span className="flex items-center gap-2 text-[#666666]">
                    <Camera className="h-3.5 w-3.5" />
                    {t.modal.camera}
                  </span>
                  <span className="text-[#dddddd] font-medium">{photo.camera}</span>
                </div>
              )}

              {photo.lens && (
                <div className="flex items-center justify-between text-[#888888]">
                  <span className="flex items-center gap-2 text-[#666666]">
                    <Tag className="h-3.5 w-3.5" />
                    {t.modal.lens}
                  </span>
                  <span className="text-[#dddddd] font-medium">{photo.lens}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[#888888]">
                <span className="text-[#666666]">{t.modal.identifier}</span>
                <span className="text-[#dddddd] font-medium">{photo.id}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[#222222] pt-4 text-center lg:text-left text-[11px] text-[#555555]">
            {t.modal.keyboardGuide}
          </div>
        </div>
        )}
      </div>
    </motion.div>
  );
};
