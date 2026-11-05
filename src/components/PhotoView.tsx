import React, { useState, useMemo } from 'react';
import { PhotoItem } from '../types';
import { Filter, Eye, Camera, Plus, Sparkles } from 'lucide-react';

interface PhotoViewProps {
  photos: PhotoItem[];
  onSelectPhoto: (photo: PhotoItem) => void;
  onGoToUpload?: () => void;
  isAdmin?: boolean;
}

export const PhotoView: React.FC<PhotoViewProps> = ({
  photos,
  onSelectPhoto,
  onGoToUpload,
  isAdmin = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => {
      if (p.category) set.add(p.category.trim());
    });
    return ['ALL', ...Array.from(set)];
  }, [photos]);

  // Filtered photos
  const filteredPhotos = useMemo(() => {
    if (selectedCategory === 'ALL') return photos;
    return photos.filter((p) => p.category.trim().toLowerCase() === selectedCategory.toLowerCase());
  }, [photos, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#101010] text-[#fafafa] px-6 py-12 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-[#222222] pb-8 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-archive tracking-[0.25em] text-[#777777]">
              <span>CATALOG // PHOTO</span>
              <span>•</span>
              <span>{photos.length} ARCHIVED FRAMES</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
              STILL PHOTOGRAPHY
            </h1>
            <p className="mt-3 max-w-xl text-xs text-[#888888] sm:text-sm">
              브루탈리즘 건축, 미니멀한 명암 대비, 도시의 침묵과 조각 같은 인물의 실루엣을 기록한 사진 작업물 아카이브입니다.
            </p>
          </div>

          {isAdmin && onGoToUpload && (
            <button
              onClick={onGoToUpload}
              className="inline-flex items-center gap-2 border border-white bg-white px-5 py-3 text-xs font-mono-archive font-semibold tracking-wider text-black transition-all hover:bg-[#e4e4e7]"
            >
              <Plus className="h-4 w-4" />
              <span>사진 작품 업로드</span>
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-[#1c1c1c] pb-6">
          <div className="mr-3 flex items-center gap-1.5 text-xs font-mono-archive text-[#555555]">
            <Filter className="h-3.5 w-3.5" />
            <span>FILTER:</span>
          </div>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'ALL'
                ? photos.length
                : photos.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xs px-3.5 py-1.5 text-xs font-mono-archive tracking-wider transition-all ${
                  isSelected
                    ? 'bg-white text-black font-semibold'
                    : 'bg-[#181818] text-[#888888] hover:bg-[#222222] hover:text-[#cccccc]'
                }`}
              >
                <span>{cat}</span>
                <span className={`ml-1.5 text-[10px] ${isSelected ? 'text-[#555555]' : 'text-[#555555]'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Photos Grid */}
        {filteredPhotos.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => onSelectPhoto(photo)}
                className="group relative cursor-pointer overflow-hidden rounded-xs border border-[#202020] bg-[#141414] transition-all duration-300 hover:border-[#444444]"
              >
                {/* Photo Image Aspect */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#181818]">
                  <img
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt={photo.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101010]/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Corner Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {photo.isSample ? (
                      <span className="rounded bg-black/60 px-2 py-0.5 font-mono-archive text-[10px] text-[#888888] backdrop-blur-sm">
                        SAMPLE
                      </span>
                    ) : (
                      <span className="rounded border border-[#3b82f6]/40 bg-[#1e293b]/80 px-2 py-0.5 font-mono-archive text-[10px] text-[#93c5fd] backdrop-blur-sm">
                        ORIGINAL
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata Card Footer */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-[11px] font-mono-archive text-[#666666]">
                    <span>{photo.archiveCode || 'ARCH-P'}</span>
                    <span className="rounded bg-[#1c1c1c] px-2 py-0.5 text-[#999999]">
                      {photo.category}
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-base font-semibold text-[#f0f0f0] group-hover:text-white transition-colors">
                    {photo.title}
                  </h3>

                  {photo.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#888888]">
                      {photo.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between border-t border-[#1f1f1f] pt-3 text-[11px] font-mono-archive text-[#555555]">
                    <span>{photo.creationDate}</span>
                    <span className="flex items-center gap-1 text-[#aaaaaa] opacity-80 group-hover:opacity-100">
                      <Eye className="h-3 w-3" />
                      <span>DETAIL</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="mt-20 flex flex-col items-center justify-center rounded-xs border border-dashed border-[#222222] py-24 text-center">
            <Camera className="h-10 w-10 text-[#444444]" />
            <h3 className="mt-4 text-base font-semibold text-white">등록된 사진 작품이 없습니다</h3>
            <p className="mt-2 text-xs text-[#777777] max-w-sm">
              선택한 카테고리에 해당하는 작품이 아직 없습니다. 다른 카테고리를 선택하거나 관리자 페이지에서 새로운 작품을 등록하세요.
            </p>
            {isAdmin && onGoToUpload ? (
              <button
                onClick={onGoToUpload}
                className="mt-6 border border-[#333333] bg-[#181818] px-5 py-2.5 text-xs font-mono-archive text-white hover:border-white"
              >
                새 사진 등록하기
              </button>
            ) : (
              <button
                onClick={() => setSelectedCategory('ALL')}
                className="mt-6 border border-[#333333] px-5 py-2 text-xs font-mono-archive text-[#aaaaaa] hover:text-white"
              >
                전체 목록 보기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
