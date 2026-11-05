import React, { useState } from 'react';
import { PhotoItem, VideoItem, ProfileData } from '../types';
import { uploadMediaFile } from '../lib/firebase';
import {
  Lock,
  Unlock,
  Upload,
  Image,
  Video,
  Edit2,
  Trash2,
  Plus,
  Check,
  X,
  RefreshCw,
  LogOut,
  Save,
  Download,
  UploadCloud,
  FileText,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface AdminViewProps {
  isAdmin: boolean;
  currentUserEmail?: string | null;
  photos: PhotoItem[];
  videos: VideoItem[];
  profile: ProfileData;
  onLoginGoogle: () => Promise<any>;
  onLoginPasscode: (code: string) => boolean;
  onLogout: () => void;
  onAddPhoto: (photo: Omit<PhotoItem, 'id'>) => Promise<PhotoItem>;
  onUpdatePhoto: (id: string, updates: Partial<PhotoItem>) => Promise<void>;
  onDeletePhoto: (id: string) => Promise<void>;
  onAddVideo: (video: Omit<VideoItem, 'id'>) => Promise<VideoItem>;
  onUpdateVideo: (id: string, updates: Partial<VideoItem>) => Promise<void>;
  onDeleteVideo: (id: string) => Promise<void>;
  onUpdateProfile: (profile: ProfileData) => Promise<void>;
  onResetSamples: () => void;
}

type AdminTab = 'UPLOAD_PHOTO' | 'UPLOAD_VIDEO' | 'MANAGE_WORKS' | 'EDIT_ABOUT' | 'BACKUP';

export const AdminView: React.FC<AdminViewProps> = ({
  isAdmin,
  currentUserEmail,
  photos,
  videos,
  profile,
  onLoginGoogle,
  onLoginPasscode,
  onLogout,
  onAddPhoto,
  onUpdatePhoto,
  onDeletePhoto,
  onAddVideo,
  onUpdateVideo,
  onDeleteVideo,
  onUpdateProfile,
  onResetSamples,
}) => {
  // Login State
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('UPLOAD_PHOTO');

  // Photo Upload Form State
  const [photoForm, setPhotoForm] = useState({
    title: '',
    description: '',
    category: 'Architecture',
    customCategory: '',
    imageUrl: '',
    thumbnailUrl: '',
    creationDate: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    camera: 'Sony α7R V',
    lens: 'FE 24-70mm f/2.8 GM II',
    archiveCode: `ARCH-P${(photos.length + 1).toString().padStart(2, '0')}`,
    isFeatured: false,
  });
  const [photoFileUploading, setPhotoFileUploading] = useState(false);

  // Video Upload Form State
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    category: 'Cinematic',
    customCategory: '',
    videoUrl: '',
    thumbnailUrl: '',
    creationDate: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    duration: '02:30',
    resolution: '4K DCI',
    client: '',
    archiveCode: `CINE-V${(videos.length + 1).toString().padStart(2, '0')}`,
    isFeatured: false,
  });
  const [videoFileUploading, setVideoFileUploading] = useState(false);
  const [videoThumbUploading, setVideoThumbUploading] = useState(false);

  // Status feedback toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Editing Item Modal State
  const [editingPhoto, setEditingPhoto] = useState<PhotoItem | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // About Form State
  const [aboutForm, setAboutForm] = useState({
    name: profile.name,
    title: profile.title,
    bio: profile.bio,
    email: profile.email,
    location: profile.location,
    disciplinesStr: profile.disciplines.join('\n'),
    softwareStr: profile.software.join('\n'),
    exhibitionsStr: profile.exhibitions
      .map((e) => `${e.year} | ${e.title} | ${e.roleOrPlace}`)
      .join('\n'),
  });

  // Handle Passcode Login
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = onLoginPasscode(passcode);
    if (!success) {
      setLoginError('비밀번호가 일치하지 않습니다. (관리자 비밀번호: 0192)');
    }
  };

  // Handle Google Login
  const handleGoogleLoginClick = async () => {
    setLoginLoading(true);
    setLoginError('');
    try {
      await onLoginGoogle();
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setLoginError('Google 로그인 팝업이 차단되었거나 실패했습니다. 관리자 비밀번호(0192)를 입력해 주세요.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Photo File Input Handler
  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFileUploading(true);
    try {
      const uploadedUrl = await uploadMediaFile(file, 'photos');
      setPhotoForm((prev) => ({
        ...prev,
        imageUrl: uploadedUrl,
        thumbnailUrl: uploadedUrl,
      }));
      showFeedback('success', `사진 파일 (${file.name})이 성공적으로 로드되었습니다.`);
    } catch (err) {
      showFeedback('error', '사진 파일 로드 중 오류가 발생했습니다.');
    } finally {
      setPhotoFileUploading(false);
    }
  };

  // Video File Input Handler
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFileUploading(true);
    try {
      const uploadedUrl = await uploadMediaFile(file, 'videos');
      setVideoForm((prev) => ({
        ...prev,
        videoUrl: uploadedUrl,
      }));
      showFeedback('success', `영상 파일 (${file.name})이 성공적으로 로드되었습니다.`);
    } catch (err) {
      showFeedback('error', '영상 파일 로드 중 오류가 발생했습니다.');
    } finally {
      setVideoFileUploading(false);
    }
  };

  // Video Poster Input Handler
  const handleVideoThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoThumbUploading(true);
    try {
      const uploadedUrl = await uploadMediaFile(file, 'thumbnails');
      setVideoForm((prev) => ({
        ...prev,
        thumbnailUrl: uploadedUrl,
      }));
      showFeedback('success', `영상 썸네일 포스터 (${file.name})가 등록되었습니다.`);
    } catch (err) {
      showFeedback('error', '썸네일 등록 중 오류가 발생했습니다.');
    } finally {
      setVideoThumbUploading(false);
    }
  };

  // Submit Photo
  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoForm.title.trim() || !photoForm.imageUrl.trim()) {
      showFeedback('error', '작품 제목과 사진 파일(또는 이미지 URL)을 입력해 주세요.');
      return;
    }

    const finalCategory =
      photoForm.category === 'Custom'
        ? photoForm.customCategory.trim() || 'General'
        : photoForm.category;

    try {
      await onAddPhoto({
        title: photoForm.title.trim(),
        description: photoForm.description.trim(),
        category: finalCategory,
        imageUrl: photoForm.imageUrl.trim(),
        thumbnailUrl: photoForm.thumbnailUrl.trim() || photoForm.imageUrl.trim(),
        creationDate: photoForm.creationDate.trim(),
        camera: photoForm.camera.trim(),
        lens: photoForm.lens.trim(),
        archiveCode: photoForm.archiveCode.trim(),
        isFeatured: photoForm.isFeatured,
      });

      showFeedback('success', `사진 작품 "${photoForm.title}"이(가) 성공적으로 아카이브에 등록되었습니다.`);
      // Reset form
      setPhotoForm({
        title: '',
        description: '',
        category: 'Architecture',
        customCategory: '',
        imageUrl: '',
        thumbnailUrl: '',
        creationDate: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
        camera: 'Sony α7R V',
        lens: 'FE 24-70mm f/2.8 GM II',
        archiveCode: `ARCH-P${(photos.length + 2).toString().padStart(2, '0')}`,
        isFeatured: false,
      });
    } catch (err) {
      showFeedback('error', '사진 등록 중 오류가 발생했습니다.');
    }
  };

  // Submit Video
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoForm.title.trim() || !videoForm.videoUrl.trim() || !videoForm.thumbnailUrl.trim()) {
      showFeedback('error', '영상 제목, 영상 소스(파일 또는 URL), 썸네일 포스터를 모두 입력해 주세요.');
      return;
    }

    const finalCategory =
      videoForm.category === 'Custom'
        ? videoForm.customCategory.trim() || 'General'
        : videoForm.category;

    try {
      await onAddVideo({
        title: videoForm.title.trim(),
        description: videoForm.description.trim(),
        category: finalCategory,
        videoUrl: videoForm.videoUrl.trim(),
        thumbnailUrl: videoForm.thumbnailUrl.trim(),
        creationDate: videoForm.creationDate.trim(),
        duration: videoForm.duration.trim(),
        resolution: videoForm.resolution.trim(),
        client: videoForm.client.trim(),
        archiveCode: videoForm.archiveCode.trim(),
        isFeatured: videoForm.isFeatured,
      });

      showFeedback('success', `영상 작품 "${videoForm.title}"이(가) 성공적으로 아카이브에 등록되었습니다.`);
      // Reset form
      setVideoForm({
        title: '',
        description: '',
        category: 'Cinematic',
        customCategory: '',
        videoUrl: '',
        thumbnailUrl: '',
        creationDate: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
        duration: '02:30',
        resolution: '4K DCI',
        client: '',
        archiveCode: `CINE-V${(videos.length + 2).toString().padStart(2, '0')}`,
        isFeatured: false,
      });
    } catch (err) {
      showFeedback('error', '영상 등록 중 오류가 발생했습니다.');
    }
  };

  // Save About Profile
  const handleAboutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const disciplines = aboutForm.disciplinesStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const software = aboutForm.softwareStr
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const exhibitions = aboutForm.exhibitionsStr
      .split('\n')
      .map((line) => {
        const parts = line.split('|').map((p) => p.trim());
        return {
          year: parts[0] || '2025',
          title: parts[1] || 'Exhibition',
          roleOrPlace: parts[2] || 'Gallery',
        };
      })
      .filter((e) => e.title);

    try {
      await onUpdateProfile({
        name: aboutForm.name.trim(),
        title: aboutForm.title.trim(),
        bio: aboutForm.bio.trim(),
        email: aboutForm.email.trim(),
        location: aboutForm.location.trim(),
        disciplines,
        software,
        exhibitions,
      });
      showFeedback('success', 'ABOUT 프로필 및 소개 정보가 성공적으로 업데이트되었습니다.');
    } catch (err) {
      showFeedback('error', '프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      photos,
      videos,
      profile,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dark_archive_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFeedback('success', '아카이브 전체 데이터가 JSON 백업 파일로 다운로드되었습니다.');
  };

  // IF NOT LOGGED IN AS ADMIN: SHOW LOGIN FORM
  if (!isAdmin) {
    return (
      <div className="flex min-h-[85vh] items-center justify-center bg-[#101010] px-6 py-16 text-[#fafafa]">
        <div className="w-full max-w-md rounded-xs border border-[#222222] bg-[#141414] p-8 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#222222] pb-5">
            <div className="flex items-center gap-2 font-mono-archive text-xs tracking-widest text-[#777777]">
              <Lock className="h-4 w-4 text-[#aaaaaa]" />
              <span>ADMINISTRATOR GATE</span>
            </div>
            <span className="font-mono-archive text-[10px] text-[#555555]">SECURE</span>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              관리자 콘솔 로그인
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#888888]">
              아카이브 작품 등록, 수정, 삭제 및 프로필 관리는 인증된 관리자만 가능합니다.
            </p>
          </div>

          {loginError && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xs border border-red-900/50 bg-red-950/30 p-3.5 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Google Auth Button */}
          <div className="mt-6">
            <button
              onClick={handleGoogleLoginClick}
              disabled={loginLoading}
              className="flex w-full items-center justify-center gap-3 border border-[#333333] bg-[#1a1a1a] py-3 text-xs font-mono-archive tracking-wider text-white transition-all hover:border-white hover:bg-[#252525] disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.1 7.5 23 12 23z"
                />
              </svg>
              <span>{loginLoading ? '로그인 중...' : 'Google 계정으로 로그인'}</span>
            </button>
          </div>

          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#222222]" />
            </div>
            <span className="relative bg-[#141414] px-3 font-mono-archive text-[10px] tracking-widest text-[#555555]">
              OR DIRECT PASSCODE
            </span>
          </div>

          {/* Passcode fallback */}
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <div>
              <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                관리자 비밀번호
              </label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="0192"
                className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3.5 py-2.5 font-mono-archive text-xs text-white placeholder-[#444444] focus:border-white focus:outline-none"
              />
              <span className="mt-1 block text-[10px] font-mono-archive text-[#555555]">
                관리자 비밀번호: <strong className="text-[#cccccc]">0192</strong>
              </span>
            </div>

            <button
              type="submit"
              className="w-full border border-white bg-white py-2.5 font-mono-archive text-xs font-semibold tracking-wider text-black transition-all hover:bg-[#e4e4e7]"
            >
              접속하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  // LOGGED IN AS ADMIN: WORKSPACE
  return (
    <div className="min-h-screen bg-[#101010] text-[#fafafa] px-6 py-10 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Admin Header Bar */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#222222] pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-mono-archive text-xs tracking-widest text-[#aaaaaa]">
                ADMINISTRATOR WORKSPACE
              </span>
              <span className="text-[#444444]">|</span>
              <span className="font-mono-archive text-xs text-[#666666]">
                {currentUserEmail || 'admin@darkarchive.io'}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              아카이브 미디어 및 콘텐츠 관리
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 rounded-xs border border-[#333333] bg-[#161616] px-4 py-2 text-xs font-mono-archive text-[#cccccc] hover:border-[#666666] hover:text-white transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Toast */}
        {feedback && (
          <div
            className={`mt-6 flex items-center justify-between rounded-xs border p-4 text-xs font-mono-archive ${
              feedback.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300'
                : 'border-red-500/30 bg-red-950/30 text-red-300'
            }`}
          >
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="text-[#777777] hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-[#222222] pb-4">
          <button
            onClick={() => setActiveTab('UPLOAD_PHOTO')}
            className={`flex items-center gap-2 rounded-xs px-4 py-2.5 text-xs font-mono-archive tracking-wider transition-all ${
              activeTab === 'UPLOAD_PHOTO'
                ? 'bg-white text-black font-semibold'
                : 'bg-[#161616] text-[#888888] hover:bg-[#202020] hover:text-[#cccccc]'
            }`}
          >
            <Image className="h-3.5 w-3.5" />
            <span>사진 작품 업로드</span>
          </button>

          <button
            onClick={() => setActiveTab('UPLOAD_VIDEO')}
            className={`flex items-center gap-2 rounded-xs px-4 py-2.5 text-xs font-mono-archive tracking-wider transition-all ${
              activeTab === 'UPLOAD_VIDEO'
                ? 'bg-white text-black font-semibold'
                : 'bg-[#161616] text-[#888888] hover:bg-[#202020] hover:text-[#cccccc]'
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            <span>영상 작품 업로드</span>
          </button>

          <button
            onClick={() => setActiveTab('MANAGE_WORKS')}
            className={`flex items-center gap-2 rounded-xs px-4 py-2.5 text-xs font-mono-archive tracking-wider transition-all ${
              activeTab === 'MANAGE_WORKS'
                ? 'bg-white text-black font-semibold'
                : 'bg-[#161616] text-[#888888] hover:bg-[#202020] hover:text-[#cccccc]'
            }`}
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>작품 목록 및 수정 ({photos.length + videos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('EDIT_ABOUT')}
            className={`flex items-center gap-2 rounded-xs px-4 py-2.5 text-xs font-mono-archive tracking-wider transition-all ${
              activeTab === 'EDIT_ABOUT'
                ? 'bg-white text-black font-semibold'
                : 'bg-[#161616] text-[#888888] hover:bg-[#202020] hover:text-[#cccccc]'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>소개글 (ABOUT) 수정</span>
          </button>

          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`flex items-center gap-2 rounded-xs px-4 py-2.5 text-xs font-mono-archive tracking-wider transition-all ${
              activeTab === 'BACKUP'
                ? 'bg-white text-black font-semibold'
                : 'bg-[#161616] text-[#888888] hover:bg-[#202020] hover:text-[#cccccc]'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>데이터 백업 &amp; 복원</span>
          </button>
        </div>

        {/* TAB 1: UPLOAD PHOTO */}
        {activeTab === 'UPLOAD_PHOTO' && (
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
            <form onSubmit={handlePhotoSubmit} className="space-y-6 lg:col-span-8">
              <div className="rounded-xs border border-[#222222] bg-[#141414] p-6 lg:p-8 space-y-6">
                <div className="border-b border-[#222222] pb-4">
                  <h2 className="text-lg font-bold text-white">사진 작품 등록</h2>
                  <p className="text-xs text-[#888888] mt-1">
                    사진 이미지 파일 또는 고해상도 이미지 URL과 함께 작품 상세 정보를 입력합니다.
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                    작품 제목 (TITLE) *
                  </label>
                  <input
                    type="text"
                    required
                    value={photoForm.title}
                    onChange={(e) => setPhotoForm({ ...photoForm, title: e.target.value })}
                    placeholder="예: Monolith in Fog (안개 속의 모놀리스)"
                    className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                      카테고리 (CATEGORY) *
                    </label>
                    <select
                      value={photoForm.category}
                      onChange={(e) => setPhotoForm({ ...photoForm, category: e.target.value })}
                      className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2.5 font-mono-archive text-xs text-white focus:border-white focus:outline-none"
                    >
                      <option value="Architecture">Architecture (건축)</option>
                      <option value="Street">Street (스트리트)</option>
                      <option value="Portrait">Portrait (인물)</option>
                      <option value="Editorial">Editorial (에디토리얼)</option>
                      <option value="Landscape">Landscape (풍경)</option>
                      <option value="Custom">+ 직접 입력</option>
                    </select>

                    {photoForm.category === 'Custom' && (
                      <input
                        type="text"
                        placeholder="새 카테고리명 입력"
                        value={photoForm.customCategory}
                        onChange={(e) => setPhotoForm({ ...photoForm, customCategory: e.target.value })}
                        className="mt-2 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-1.5 text-xs text-white focus:border-white focus:outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                      제작 날짜 (CREATION DATE) *
                    </label>
                    <input
                      type="text"
                      required
                      value={photoForm.creationDate}
                      onChange={(e) => setPhotoForm({ ...photoForm, creationDate: e.target.value })}
                      placeholder="2025.10.14"
                      className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3.5 py-2.5 font-mono-archive text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Image Upload or URL */}
                <div className="space-y-4">
                  <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                    사진 이미지 소스 (FILE UPLOAD OR URL) *
                  </label>

                  {/* File upload drag drop input */}
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer rounded-xs border border-dashed border-[#333333] bg-[#111111] p-5 text-center transition-all hover:border-[#666666]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />
                      <UploadCloud className="mx-auto h-6 w-6 text-[#777777]" />
                      <span className="mt-2 block text-xs font-mono-archive text-[#cccccc]">
                        {photoFileUploading ? '이미지 업로드 처리 중...' : '클릭하여 사진 파일 선택 (JPG, PNG, WEBP)'}
                      </span>
                      <span className="mt-1 block text-[10px] text-[#666666]">
                        Firebase Storage 및 브라우저 영구 캐시 연동
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono-archive text-[#555555]">또는 직접 이미지 URL 입력:</span>
                    <input
                      type="url"
                      value={photoForm.imageUrl}
                      onChange={(e) =>
                        setPhotoForm({ ...photoForm, imageUrl: e.target.value, thumbnailUrl: e.target.value })
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 font-mono-archive text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Technical Specs */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                      카메라 (CAMERA)
                    </label>
                    <input
                      type="text"
                      value={photoForm.camera}
                      onChange={(e) => setPhotoForm({ ...photoForm, camera: e.target.value })}
                      placeholder="Sony α7R V"
                      className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                      렌즈 (LENS)
                    </label>
                    <input
                      type="text"
                      value={photoForm.lens}
                      onChange={(e) => setPhotoForm({ ...photoForm, lens: e.target.value })}
                      placeholder="FE 24-70mm f/2.8 GM II"
                      className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                      아카이브 코드 (CODE)
                    </label>
                    <input
                      type="text"
                      value={photoForm.archiveCode}
                      onChange={(e) => setPhotoForm({ ...photoForm, archiveCode: e.target.value })}
                      placeholder="ARCH-P07"
                      className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 font-mono-archive text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                    작품 설명 및 제작 노트 (DESCRIPTION)
                  </label>
                  <textarea
                    rows={4}
                    value={photoForm.description}
                    onChange={(e) => setPhotoForm({ ...photoForm, description: e.target.value })}
                    placeholder="작업 의도, 피사체와의 교감, 조명 세팅이나 촬영 현장 노트를 적어주세요."
                    className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] p-3 text-xs leading-relaxed text-white focus:border-white focus:outline-none"
                  />
                </div>

                {/* Featured Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={photoForm.isFeatured}
                    onChange={(e) => setPhotoForm({ ...photoForm, isFeatured: e.target.checked })}
                    className="h-4 w-4 rounded border-[#333333] bg-[#101010] text-white accent-white focus:ring-0"
                  />
                  <span className="text-xs text-[#cccccc]">
                    홈(HOME) 메인 대표 작품으로 추천 표시
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full border border-white bg-white py-3.5 font-mono-archive text-xs font-semibold tracking-wider text-black transition-all hover:bg-[#e4e4e7]"
                >
                  사진 아카이브 등록하기
                </button>
              </div>
            </form>

            {/* Preview Card */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 rounded-xs border border-[#222222] bg-[#141414] p-5">
                <div className="font-mono-archive text-[11px] text-[#666666] uppercase tracking-wider">
                  LIVE PREVIEW
                </div>

                <div className="mt-4 aspect-[4/5] w-full overflow-hidden rounded-xs border border-[#262626] bg-[#0c0c0c]">
                  {photoForm.imageUrl ? (
                    <img
                      src={photoForm.imageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-[#555555]">
                      <Image className="h-8 w-8 text-[#444444]" />
                      <span className="mt-2 text-xs font-mono-archive">이미지 등록 시 미리보기가 표시됩니다</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-1">
                  <div className="text-[10px] font-mono-archive text-[#666666]">
                    {photoForm.archiveCode || 'ARCH-P'} • {photoForm.category}
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate">
                    {photoForm.title || '작품 제목 미입력'}
                  </h3>
                  <div className="text-[11px] font-mono-archive text-[#555555]">
                    {photoForm.creationDate}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD VIDEO */}
        {activeTab === 'UPLOAD_VIDEO' && (
          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
            <form onSubmit={handleVideoSubmit} className="space-y-6 lg:col-span-8">
              <div className="rounded-xs border border-[#222222] bg-[#141414] p-6 lg:p-8 space-y-6">
                <div className="border-b border-[#222222] pb-4">
                  <h2 className="text-lg font-bold text-white">영상 작품 등록</h2>
                  <p className="text-xs text-[#888888] mt-1">
                    동영상 파일 또는 스트리밍 링크(MP4, YouTube, Vimeo)와 썸네일 포스터를 등록합니다.
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                    영상 작품 제목 (TITLE) *
                  </label>
                  <input
                    type="text"
                    required
                    value={videoForm.title}
                    onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                    placeholder="예: Steel & Resonance (강철과 공명)"
                    className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                      장르 및 카테고리 (GENRE) *
                    </label>
                    <select
                      value={videoForm.category}
                      onChange={(e) => setVideoForm({ ...videoForm, category: e.target.value })}
                      className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2.5 font-mono-archive text-xs text-white focus:border-white focus:outline-none"
                    >
                      <option value="Cinematic">Cinematic (시네마틱)</option>
                      <option value="Commercial">Commercial (상업 광고)</option>
                      <option value="Music Video">Music Video (뮤직비디오)</option>
                      <option value="Short Film">Short Film (단편 영화)</option>
                      <option value="Motion">Motion Art (모션 그래픽)</option>
                      <option value="Custom">+ 직접 입력</option>
                    </select>

                    {videoForm.category === 'Custom' && (
                      <input
                        type="text"
                        placeholder="새 장르 입력"
                        value={videoForm.customCategory}
                        onChange={(e) => setVideoForm({ ...videoForm, customCategory: e.target.value })}
                        className="mt-2 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-1.5 text-xs text-white focus:border-white focus:outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                      제작 날짜 (CREATION DATE) *
                    </label>
                    <input
                      type="text"
                      required
                      value={videoForm.creationDate}
                      onChange={(e) => setVideoForm({ ...videoForm, creationDate: e.target.value })}
                      placeholder="2025.11.02"
                      className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3.5 py-2.5 font-mono-archive text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Video Media Source */}
                <div className="space-y-4">
                  <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                    영상 소스 (VIDEO FILE OR STREAMING URL) *
                  </label>

                  {/* File upload */}
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xs border border-dashed border-[#333333] bg-[#111111] p-5 text-center transition-all hover:border-[#666666]">
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleVideoFileUpload}
                      className="hidden"
                    />
                    <Video className="h-6 w-6 text-[#777777]" />
                    <span className="mt-2 block text-xs font-mono-archive text-[#cccccc]">
                      {videoFileUploading ? '영상 파일 로딩 중...' : '클릭하여 MP4 / WebM 비디오 파일 업로드'}
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono-archive text-[#555555]">또는 영상 링크 입력:</span>
                    <input
                      type="url"
                      value={videoForm.videoUrl}
                      onChange={(e) => setVideoForm({ ...videoForm, videoUrl: e.target.value })}
                      placeholder="https://...mp4 또는 YouTube/Vimeo 링크"
                      className="flex-1 rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 font-mono-archive text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Thumbnail Poster */}
                <div className="space-y-4">
                  <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                    썸네일 포스터 이미지 (POSTER THUMBNAIL) *
                  </label>

                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer rounded-xs border border-[#333333] bg-[#111111] px-4 py-2 text-xs font-mono-archive text-[#cccccc] hover:border-white transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleVideoThumbUpload}
                        className="hidden"
                      />
                      <span>{videoThumbUploading ? '포스터 업로드 중...' : '포스터 파일 선택'}</span>
                    </label>

                    <input
                      type="url"
                      value={videoForm.thumbnailUrl}
                      onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })}
                      placeholder="썸네일 이미지 URL 직접 입력"
                      className="flex-1 rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 font-mono-archive text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Duration, Resolution, Client */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                      재생 시간 (DURATION)
                    </label>
                    <input
                      type="text"
                      value={videoForm.duration}
                      onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                      placeholder="03:15"
                      className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 font-mono-archive text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                      해상도 (RESOLUTION)
                    </label>
                    <input
                      type="text"
                      value={videoForm.resolution}
                      onChange={(e) => setVideoForm({ ...videoForm, resolution: e.target.value })}
                      placeholder="4K DCI, UHD"
                      className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 font-mono-archive text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                      클라이언트 / 협업사
                    </label>
                    <input
                      type="text"
                      value={videoForm.client}
                      onChange={(e) => setVideoForm({ ...videoForm, client: e.target.value })}
                      placeholder="Brand X 또는 독립 아카이브"
                      className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                    영상 시놉시스 및 연출 노트 (SYNOPSIS)
                  </label>
                  <textarea
                    rows={4}
                    value={videoForm.description}
                    onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                    placeholder="프로젝트 기획 배경, 촬영 장비, 컬러 그레이딩 및 사운드 디자인 노트를 입력하세요."
                    className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] p-3 text-xs leading-relaxed text-white focus:border-white focus:outline-none"
                  />
                </div>

                {/* Featured Checkbox */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoForm.isFeatured}
                    onChange={(e) => setVideoForm({ ...videoForm, isFeatured: e.target.checked })}
                    className="h-4 w-4 rounded border-[#333333] bg-[#101010] text-white accent-white focus:ring-0"
                  />
                  <span className="text-xs text-[#cccccc]">
                    홈(HOME) 메인 대표 영상으로 추천 노출
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full border border-white bg-white py-3.5 font-mono-archive text-xs font-semibold tracking-wider text-black transition-all hover:bg-[#e4e4e7]"
                >
                  영상 아카이브 등록하기
                </button>
              </div>
            </form>

            {/* Video Preview Card */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 rounded-xs border border-[#222222] bg-[#141414] p-5">
                <div className="font-mono-archive text-[11px] text-[#666666] uppercase tracking-wider">
                  POSTER PREVIEW
                </div>

                <div className="mt-4 aspect-video w-full overflow-hidden rounded-xs border border-[#262626] bg-black">
                  {videoForm.thumbnailUrl ? (
                    <img
                      src={videoForm.thumbnailUrl}
                      alt="Thumbnail Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-[#555555]">
                      <Video className="h-8 w-8 text-[#444444]" />
                      <span className="mt-2 text-xs font-mono-archive">썸네일 등록 시 미리보기가 표시됩니다</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-1">
                  <div className="text-[10px] font-mono-archive text-[#666666]">
                    {videoForm.archiveCode || 'CINE-V'} • {videoForm.category}
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate">
                    {videoForm.title || '영상 제목 미입력'}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] font-mono-archive text-[#555555]">
                    <span>{videoForm.creationDate}</span>
                    <span>{videoForm.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANAGE WORKS (LIST, EDIT, DELETE) */}
        {activeTab === 'MANAGE_WORKS' && (
          <div className="mt-8 space-y-12">
            {/* Photos Management List */}
            <div className="rounded-xs border border-[#222222] bg-[#141414] p-6 lg:p-8">
              <div className="flex items-center justify-between border-b border-[#222222] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">등록된 사진 목록 ({photos.length})</h2>
                  <p className="text-xs text-[#888888] mt-1">
                    기존 사진의 제목, 카테고리, 추천 여부를 수정하거나 삭제할 수 있습니다.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('UPLOAD_PHOTO')}
                  className="flex items-center gap-1.5 border border-[#333333] px-3 py-1.5 text-xs font-mono-archive text-[#cccccc] hover:border-white hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>새 사진 등록</span>
                </button>
              </div>

              <div className="mt-6 divide-y divide-[#1e1e1e]">
                {photos.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.thumbnailUrl || item.imageUrl}
                        alt={item.title}
                        className="h-14 w-14 rounded-xs object-cover border border-[#262626] bg-[#0c0c0c] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[10px] font-mono-archive text-[#666666]">
                          <span>{item.archiveCode || 'ARCH-P'}</span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{item.creationDate}</span>
                          {item.isSample ? (
                            <span className="rounded bg-[#202020] px-1.5 py-0.2 text-[#888888]">
                              SAMPLE
                            </span>
                          ) : (
                            <span className="rounded bg-[#1e293b] px-1.5 py-0.2 text-[#93c5fd]">
                              CUSTOM
                            </span>
                          )}
                          {item.isFeatured && (
                            <span className="rounded bg-amber-950/60 border border-amber-600/40 px-1.5 py-0.2 text-amber-300">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <h4 className="mt-1 truncate text-sm font-medium text-white">{item.title}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setEditingPhoto(item)}
                        className="flex items-center gap-1 border border-[#333333] px-3 py-1.5 text-xs font-mono-archive text-[#cccccc] hover:border-white hover:text-white transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>수정</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`정말로 "${item.title}" 사진을 삭제하시겠습니까?`)) {
                            onDeletePhoto(item.id);
                            showFeedback('success', `사진 "${item.title}"이(가) 삭제되었습니다.`);
                          }
                        }}
                        className="flex items-center gap-1 border border-red-900/50 bg-red-950/20 px-3 py-1.5 text-xs font-mono-archive text-red-400 hover:bg-red-900/40 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>삭제</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Videos Management List */}
            <div className="rounded-xs border border-[#222222] bg-[#141414] p-6 lg:p-8">
              <div className="flex items-center justify-between border-b border-[#222222] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">등록된 영상 목록 ({videos.length})</h2>
                  <p className="text-xs text-[#888888] mt-1">
                    기존 영상의 제목, 링크, 썸네일, 클라이언트 정보를 수정하거나 삭제할 수 있습니다.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('UPLOAD_VIDEO')}
                  className="flex items-center gap-1.5 border border-[#333333] px-3 py-1.5 text-xs font-mono-archive text-[#cccccc] hover:border-white hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>새 영상 등록</span>
                </button>
              </div>

              <div className="mt-6 divide-y divide-[#1e1e1e]">
                {videos.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="h-14 w-20 rounded-xs object-cover border border-[#262626] bg-[#0c0c0c] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[10px] font-mono-archive text-[#666666]">
                          <span>{item.archiveCode || 'CINE-V'}</span>
                          <span>•</span>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{item.duration || '00:00'}</span>
                          {item.isSample ? (
                            <span className="rounded bg-[#202020] px-1.5 py-0.2 text-[#888888]">
                              SAMPLE
                            </span>
                          ) : (
                            <span className="rounded bg-[#1e293b] px-1.5 py-0.2 text-[#93c5fd]">
                              CUSTOM
                            </span>
                          )}
                          {item.isFeatured && (
                            <span className="rounded bg-amber-950/60 border border-amber-600/40 px-1.5 py-0.2 text-amber-300">
                              FEATURED
                            </span>
                          )}
                        </div>
                        <h4 className="mt-1 truncate text-sm font-medium text-white">{item.title}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setEditingVideo(item)}
                        className="flex items-center gap-1 border border-[#333333] px-3 py-1.5 text-xs font-mono-archive text-[#cccccc] hover:border-white hover:text-white transition-colors"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>수정</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`정말로 "${item.title}" 영상을 삭제하시겠습니까?`)) {
                            onDeleteVideo(item.id);
                            showFeedback('success', `영상 "${item.title}"이(가) 삭제되었습니다.`);
                          }
                        }}
                        className="flex items-center gap-1 border border-red-900/50 bg-red-950/20 px-3 py-1.5 text-xs font-mono-archive text-red-400 hover:bg-red-900/40 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>삭제</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EDIT ABOUT */}
        {activeTab === 'EDIT_ABOUT' && (
          <div className="mt-8">
            <form onSubmit={handleAboutSubmit} className="rounded-xs border border-[#222222] bg-[#141414] p-6 lg:p-8 space-y-6">
              <div className="border-b border-[#222222] pb-4">
                <h2 className="text-lg font-bold text-white">소개글 (ABOUT) 및 연락처 수정</h2>
                <p className="text-xs text-[#888888] mt-1">
                  포트폴리오의 작가 소개, 사용하는 소프트웨어 도구, 작업 분야, 이메일 주소를 직접 편집합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                    작가 이름 (NAME)
                  </label>
                  <input
                    type="text"
                    value={aboutForm.name}
                    onChange={(e) => setAboutForm({ ...aboutForm, name: e.target.value })}
                    className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                    직함 및 역할 (TITLE)
                  </label>
                  <input
                    type="text"
                    value={aboutForm.title}
                    onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                    className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                    연락처 이메일 (EMAIL)
                  </label>
                  <input
                    type="email"
                    value={aboutForm.email}
                    onChange={(e) => setAboutForm({ ...aboutForm, email: e.target.value })}
                    className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                    활동 지역 (LOCATION)
                  </label>
                  <input
                    type="text"
                    value={aboutForm.location}
                    onChange={(e) => setAboutForm({ ...aboutForm, location: e.target.value })}
                    className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3.5 py-2.5 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                  작가 소개 및 철학 (BIO STATEMENT)
                </label>
                <textarea
                  rows={5}
                  value={aboutForm.bio}
                  onChange={(e) => setAboutForm({ ...aboutForm, bio: e.target.value })}
                  className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] p-3 text-xs leading-relaxed text-white focus:border-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                    작업 분야 (줄 단위로 구분)
                  </label>
                  <textarea
                    rows={4}
                    value={aboutForm.disciplinesStr}
                    onChange={(e) => setAboutForm({ ...aboutForm, disciplinesStr: e.target.value })}
                    className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] p-3 font-mono-archive text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                    사용 프로그램 및 장비 (줄 단위로 구분)
                  </label>
                  <textarea
                    rows={4}
                    value={aboutForm.softwareStr}
                    onChange={(e) => setAboutForm({ ...aboutForm, softwareStr: e.target.value })}
                    className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] p-3 font-mono-archive text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-archive text-[11px] text-[#777777] uppercase tracking-wider">
                  전시 및 프로젝트 이력 (형식: 연도 | 전시명 | 장소/역할)
                </label>
                <textarea
                  rows={4}
                  value={aboutForm.exhibitionsStr}
                  onChange={(e) => setAboutForm({ ...aboutForm, exhibitionsStr: e.target.value })}
                  placeholder="2025 | Monolith: Shadows in Silence | Solo Exhibition, Seoul"
                  className="mt-1.5 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] p-3 font-mono-archive text-xs text-white focus:border-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full border border-white bg-white py-3.5 font-mono-archive text-xs font-semibold tracking-wider text-black transition-all hover:bg-[#e4e4e7]"
              >
                소개글 정보 저장하기
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: BACKUP & DATA CONTROLS */}
        {activeTab === 'BACKUP' && (
          <div className="mt-8 space-y-8">
            <div className="rounded-xs border border-[#222222] bg-[#141414] p-6 lg:p-8">
              <h2 className="text-lg font-bold text-white">데이터 백업 (JSON Export)</h2>
              <p className="mt-1 text-xs text-[#888888]">
                현재 등록된 모든 사진, 영상, 프로필 정보를 단일 JSON 파일로 내려받아 보관할 수 있습니다.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleExportJSON}
                  className="inline-flex items-center gap-2 border border-white bg-white px-5 py-3 font-mono-archive text-xs font-semibold text-black hover:bg-[#e4e4e7]"
                >
                  <Download className="h-4 w-4" />
                  <span>아카이브 전체 JSON 다운로드</span>
                </button>
              </div>
            </div>

            <div className="rounded-xs border border-red-900/30 bg-[#161111] p-6 lg:p-8">
              <h2 className="text-lg font-bold text-red-200">초기 샘플 데이터 재설정 (Reset)</h2>
              <p className="mt-1 text-xs text-red-400/80">
                테스트 중 데이터를 초기 샘플 상태(고해상도 흑백 건축 사진 및 시네마틱 영상)로 되돌립니다.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    if (confirm('모든 작품을 초기 샘플 상태로 재설정하시겠습니까?')) {
                      onResetSamples();
                      showFeedback('success', '기본 샘플 아카이브로 초기화되었습니다.');
                    }
                  }}
                  className="inline-flex items-center gap-2 border border-red-800 bg-red-950 px-5 py-3 font-mono-archive text-xs text-red-300 hover:bg-red-900"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>샘플 데이터로 재설정</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT PHOTO MODAL */}
        {editingPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-2xl rounded-xs border border-[#333333] bg-[#141414] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#222222] pb-4">
                <h3 className="text-base font-bold text-white">사진 작품 정보 수정</h3>
                <button onClick={() => setEditingPhoto(null)} className="text-[#888888] hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-mono-archive text-[#777777]">제목</label>
                  <input
                    type="text"
                    value={editingPhoto.title}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                    className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono-archive text-[#777777]">카테고리</label>
                    <input
                      type="text"
                      value={editingPhoto.category}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, category: e.target.value })}
                      className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-archive text-[#777777]">제작 날짜</label>
                    <input
                      type="text"
                      value={editingPhoto.creationDate}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, creationDate: e.target.value })}
                      className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-archive text-[#777777]">이미지 URL</label>
                  <input
                    type="url"
                    value={editingPhoto.imageUrl}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, imageUrl: e.target.value })}
                    className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono-archive text-[#777777]">카메라</label>
                    <input
                      type="text"
                      value={editingPhoto.camera || ''}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, camera: e.target.value })}
                      className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-archive text-[#777777]">렌즈</label>
                    <input
                      type="text"
                      value={editingPhoto.lens || ''}
                      onChange={(e) => setEditingPhoto({ ...editingPhoto, lens: e.target.value })}
                      className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-archive text-[#777777]">설명</label>
                  <textarea
                    rows={3}
                    value={editingPhoto.description}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
                    className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] p-3 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPhoto.isFeatured || false}
                    onChange={(e) => setEditingPhoto({ ...editingPhoto, isFeatured: e.target.checked })}
                    className="h-4 w-4 rounded border-[#333333] bg-[#101010] text-white accent-white"
                  />
                  <span className="text-xs text-[#cccccc]">홈(HOME) 메인 대표 작품으로 노출</span>
                </label>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-[#222222] pt-4">
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="border border-[#333333] px-4 py-2 text-xs font-mono-archive text-[#aaaaaa] hover:text-white"
                >
                  취소
                </button>
                <button
                  onClick={async () => {
                    await onUpdatePhoto(editingPhoto.id, editingPhoto);
                    setEditingPhoto(null);
                    showFeedback('success', '사진 정보가 업데이트되었습니다.');
                  }}
                  className="border border-white bg-white px-5 py-2 text-xs font-mono-archive font-semibold text-black hover:bg-[#e4e4e7]"
                >
                  수정 사항 저장
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT VIDEO MODAL */}
        {editingVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-2xl rounded-xs border border-[#333333] bg-[#141414] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#222222] pb-4">
                <h3 className="text-base font-bold text-white">영상 작품 정보 수정</h3>
                <button onClick={() => setEditingVideo(null)} className="text-[#888888] hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-mono-archive text-[#777777]">제목</label>
                  <input
                    type="text"
                    value={editingVideo.title}
                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                    className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono-archive text-[#777777]">장르 / 카테고리</label>
                    <input
                      type="text"
                      value={editingVideo.category}
                      onChange={(e) => setEditingVideo({ ...editingVideo, category: e.target.value })}
                      className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-archive text-[#777777]">제작 날짜</label>
                    <input
                      type="text"
                      value={editingVideo.creationDate}
                      onChange={(e) => setEditingVideo({ ...editingVideo, creationDate: e.target.value })}
                      className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-archive text-[#777777]">영상 스트리밍/파일 URL</label>
                  <input
                    type="url"
                    value={editingVideo.videoUrl}
                    onChange={(e) => setEditingVideo({ ...editingVideo, videoUrl: e.target.value })}
                    className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono-archive text-[#777777]">썸네일 포스터 URL</label>
                  <input
                    type="url"
                    value={editingVideo.thumbnailUrl}
                    onChange={(e) => setEditingVideo({ ...editingVideo, thumbnailUrl: e.target.value })}
                    className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono-archive text-[#777777]">러닝타임</label>
                    <input
                      type="text"
                      value={editingVideo.duration || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, duration: e.target.value })}
                      className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-archive text-[#777777]">해상도</label>
                    <input
                      type="text"
                      value={editingVideo.resolution || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, resolution: e.target.value })}
                      className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-archive text-[#777777]">클라이언트</label>
                    <input
                      type="text"
                      value={editingVideo.client || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, client: e.target.value })}
                      className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] px-3 py-2 text-xs text-white focus:border-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono-archive text-[#777777]">시놉시스</label>
                  <textarea
                    rows={3}
                    value={editingVideo.description}
                    onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                    className="mt-1 w-full rounded-xs border border-[#2a2a2a] bg-[#101010] p-3 text-xs text-white focus:border-white focus:outline-none"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingVideo.isFeatured || false}
                    onChange={(e) => setEditingVideo({ ...editingVideo, isFeatured: e.target.checked })}
                    className="h-4 w-4 rounded border-[#333333] bg-[#101010] text-white accent-white"
                  />
                  <span className="text-xs text-[#cccccc]">홈(HOME) 메인 대표 영상으로 노출</span>
                </label>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-[#222222] pt-4">
                <button
                  onClick={() => setEditingVideo(null)}
                  className="border border-[#333333] px-4 py-2 text-xs font-mono-archive text-[#aaaaaa] hover:text-white"
                >
                  취소
                </button>
                <button
                  onClick={async () => {
                    await onUpdateVideo(editingVideo.id, editingVideo);
                    setEditingVideo(null);
                    showFeedback('success', '영상 정보가 업데이트되었습니다.');
                  }}
                  className="border border-white bg-white px-5 py-2 text-xs font-mono-archive font-semibold text-black hover:bg-[#e4e4e7]"
                >
                  수정 사항 저장
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
