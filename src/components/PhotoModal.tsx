import React, { useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { PhotoItem } from '../types';
import { useLanguage } from '../lib/i18n';
import { X, ChevronLeft, ChevronRight, Camera, Calendar, Tag, ExternalLink } from 'lucide-react';

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
  const { t } = useLanguage();
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
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
      <div className="absolute top-0 left-0 right-0 z-20 flex h-16 items-center justify-between border-b border-[#222222] bg-[#0c0c0c]/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3 font-mono-archive text-xs tracking-wider text-[#888888]">
          <span className="text-white font-semibold">{photo.archiveCode || 'PHOTO'}</span>
          <span>/</span>
          <span>{photo.category}</span>
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

        <div className="flex items-center gap-4">
          <a
            href={photo.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono-archive text-[#888888] hover:text-white transition-colors"
            title="원본 이미지 열기"
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

      {/* Navigation Arrows */}
      {hasPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#2a2a2a] bg-[#141414]/80 p-3 text-white backdrop-blur-md transition-all hover:border-[#555555] hover:bg-[#202020] focus:outline-none"
          aria-label="Previous Photo"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-[#2a2a2a] bg-[#141414]/80 p-3 text-white backdrop-blur-md transition-all hover:border-[#555555] hover:bg-[#202020] focus:outline-none"
          aria-label="Next Photo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Main Content Modal Body */}
      <div className="flex h-full w-full flex-col pt-16 lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Left / Center Image Stage */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex flex-1 items-center justify-center p-4 lg:p-12 overflow-hidden"
        >
          <motion.img
            key={photo.id}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            src={photo.imageUrl}
            alt={photo.title}
            className="max-h-[82vh] max-w-full object-contain rounded-xs shadow-2xl transition-all select-none"
          />
        </motion.div>

        {/* Right Info Drawer (Desktop) / Bottom Details (Mobile) */}
        <div className="w-full border-t border-[#222222] bg-[#111111] p-6 lg:w-96 lg:border-t-0 lg:border-l lg:p-8 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div>
              <div className="text-[11px] font-mono-archive tracking-widest text-[#777777] uppercase">
                {photo.category}
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
            <div className="space-y-3 border-t border-[#222222] pt-5 font-mono-archive text-xs">
              <div className="text-[10px] uppercase tracking-widest text-[#666666]">
                {t.modal.techSpecs}
              </div>

              <div className="flex items-center justify-between text-[#888888]">
                <span className="flex items-center gap-2 text-[#666666]">
                  <Calendar className="h-3.5 w-3.5" />
                  {t.modal.date}
                </span>
                <span className="text-[#dddddd]">{photo.creationDate}</span>
              </div>

              {photo.camera && (
                <div className="flex items-center justify-between text-[#888888]">
                  <span className="flex items-center gap-2 text-[#666666]">
                    <Camera className="h-3.5 w-3.5" />
                    {t.modal.camera}
                  </span>
                  <span className="text-[#dddddd]">{photo.camera}</span>
                </div>
              )}

              {photo.lens && (
                <div className="flex items-center justify-between text-[#888888]">
                  <span className="flex items-center gap-2 text-[#666666]">
                    <Tag className="h-3.5 w-3.5" />
                    {t.modal.lens}
                  </span>
                  <span className="text-[#dddddd]">{photo.lens}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[#888888]">
                <span className="text-[#666666]">{t.modal.identifier}</span>
                <span className="text-[#dddddd]">{photo.id}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-[#222222] pt-4 text-center lg:text-left text-[11px] font-mono-archive text-[#555555]">
            {t.modal.keyboardGuide}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
