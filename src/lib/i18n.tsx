import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ko' | 'en';

const STORAGE_LANG_KEY = 'dark_archive_language';

export const CATEGORY_MAP: Record<string, { ko: string; en: string }> = {
  ALL: { ko: '전체', en: 'ALL' },
  Architecture: { ko: '건축', en: 'Architecture' },
  Street: { ko: '스트리트', en: 'Street' },
  Portrait: { ko: '인물', en: 'Portrait' },
  Editorial: { ko: '에디토리얼', en: 'Editorial' },
  Landscape: { ko: '풍경', en: 'Landscape' },
  'Fine Art': { ko: '순수 예술', en: 'Fine Art' },
  Cinematic: { ko: '시네마틱', en: 'Cinematic' },
  Commercial: { ko: '광고/커머셜', en: 'Commercial' },
  'Music Video': { ko: '뮤직비디오', en: 'Music Video' },
  'Short Film': { ko: '단편 영화', en: 'Short Film' },
  Motion: { ko: '모션 그래픽', en: 'Motion Art' },
  'Motion Art': { ko: '모션 그래픽', en: 'Motion Art' },
  Documentary: { ko: '다큐멘터리', en: 'Documentary' },
  Experimental: { ko: '실험 영상', en: 'Experimental' },
  Narrative: { ko: '내러티브', en: 'Narrative' },
  Fashion: { ko: '패션', en: 'Fashion' },
  Urban: { ko: '도시/어반', en: 'Urban' },
  General: { ko: '일반', en: 'General' },
};

export function getCategoryLabel(category: string, lang: Language): string {
  if (!category) return '';
  const trimmed = category.trim();
  const found = CATEGORY_MAP[trimmed];
  if (found) {
    return found[lang];
  }
  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (key.toLowerCase() === lower) {
      return val[lang];
    }
  }
  return trimmed;
}

export const translations = {
  ko: {
    // Nav & Common
    nav: {
      home: '홈',
      photo: '사진',
      video: '영상',
      about: '소개',
      admin: '관리자',
      logout: '로그아웃',
      brand: '포트폴리오',
      adminActive: '관리자 콘솔',
      adminAccess: '관리자',
      language: '언어',
    },
    // Home View
    home: {
      tag: '학생 아카이브 • 시각 예술 & 미디어 [2026]',
      portfolioTitle: '포트폴리오',
      heroDesc:
        '시각 영상과 사진 예술을 전공하며 탐구한 학업 프로젝트와 개인 창작물의 기록입니다. 빛과 그림자의 명암 대비, 공간과 인물의 서사, 절제된 프레임 구도를 통해 고유한 시각 언어를 구축해 나가는 학생 포트폴리오 아카이브입니다.',
      explorePhoto: '사진 탐색',
      watchCinema: '영상 감상',
      featuredVisual: '주목할 영상',
      featuredPhoto: '주목할 사진',
      fullTheater: '전체 화면 감상',
      totalArchive: '전체 작품',
      stillPhotography: '사진 작품',
      cinematography: '영상 작품',
      monochrome: '촬영 세팅',
      works: '작품',
      frames: '장',
      films: '편',
      recentPhotosTitle: '01 / 사진 컬렉션',
      recentPhotosHeading: '최근 사진 작업물',
      viewAllPhotos: '전체 사진 보기',
      recentVideosTitle: '02 / 모션 릴',
      recentVideosHeading: '영상 작업물',
      viewAllVideos: '전체 영상 보기',
      independentArchive: '독립 아카이브',
      view: '상세보기',
      unmute: '음소거 해제',
      mute: '음소거',
    },
    // Photo View
    photoView: {
      tag: '갤러리 컬렉션 // 02',
      heading: '사진 작품',
      subheading:
        '순간의 빛과 공간의 여백을 절제된 톤으로 포착한 학생 사진 아카이브입니다.',
      archivedFramesSuffix: '개의 보관된 사진',
      filterLabel: '카테고리 필터',
      allCategory: '전체',
      uploadBtn: '사진 등록 (ADMIN)',
      detail: '상세보기',
      sampleBadge: '샘플',
      originalBadge: '오리지널',
      emptyHeading: '등록된 사진 작품이 없습니다',
      emptyDesc:
        '선택한 카테고리에 해당하는 작품이 아직 없습니다. 다른 카테고리를 선택하거나 관리자 페이지에서 새로운 작품을 등록하세요.',
      uploadNewBtn: '새 사진 등록하기',
      viewAllBtn: '전체 목록 보기',
      fitMode: '원본 비율 (FIT)',
      fillMode: '프레임 채우기 (FILL)',
      viewMode: '화면 맞춤',
    },
    // Video View
    videoView: {
      tag: '시네마 릴 // 03',
      heading: '영상 작품',
      subheading:
        '서사와 시각적 연출, 공간의 리듬을 다룬 단편 필름과 시네마틱 영상 작업물입니다.',
      archivedReelsSuffix: '개의 보관된 영상',
      genreLabel: '장르 필터',
      allCategory: '전체',
      uploadBtn: '영상 등록 (ADMIN)',
      play: '재생',
      sampleBadge: '샘플',
      originalBadge: '오리지널',
      emptyHeading: '등록된 영상 작품이 없습니다',
      emptyDesc:
        '해당 장르의 영상물이 아직 등록되지 않았습니다. 관리자 페이지에서 직접 동영상 파일 또는 스트리밍 링크를 등록할 수 있습니다.',
      uploadNewBtn: '새 영상 등록하기',
      viewAllBtn: '전체 목록 보기',
    },
    // About View
    aboutView: {
      tag: '아키비스트 프로필 // 04',
      editProfile: '프로필 수정 (ADMIN)',
      base: '활동 거점',
      philosophyTag: '작가 철학 및 성명 (STATEMENT & PHILOSOPHY)',
      disciplinesTag: '전문 작업 분야 (DISCIPLINES & SERVICES)',
      workflowTag: '제작 툴 및 워크플로우 (TOOLS & WORKFLOW)',
      exhibitionsTag: '전시 및 주요 프로젝트 (EXHIBITIONS & PROJECTS)',
      collabTag: '협업 및 프로젝트 문의 (COLLABORATION & INQUIRIES)',
      collabHeading: '새로운 프로젝트 문의하기',
      collabDesc:
        '촬영 의뢰, 상업 광고 연출, 전시 기획 및 아카이브 프린트 문의는 아래 이메일로 연락 바랍니다.',
      sendEmail: '이메일 보내기',
      copy: '복사',
      copied: '복사됨',
    },
    // Modals
    modal: {
      viewRaw: '원본 보기',
      source: '소스',
      sampleTag: '샘플',
      archiveTag: '오리지널 아카이브',
      techSpecs: '기술 사양 (TECHNICAL SPECS)',
      cinemaSpecs: '영상 사양 (CINEMA SPECS)',
      date: '제작 일자',
      camera: '카메라',
      lens: '렌즈',
      runningTime: '재생 시간',
      resolution: '해상도',
      client: '클라이언트 / 협업',
      identifier: '식별 코드',
      streamType: '스트림 형식',
      keyboardGuide: '방향키 [←] [→]로 넘겨보기 • [ESC] 닫기',
    },
    // Admin
    admin: {
      gateTitle: 'ADMINISTRATOR GATE',
      consoleTitle: '관리자 콘솔 로그인',
      consoleDesc:
        '아카이브 작품 등록, 수정, 삭제 및 프로필 관리는 인증된 관리자만 가능합니다.',
      passcodeLabel: '관리자 비밀번호',
      passcodePlaceholder: '비밀번호 입력',
      loginBtn: '접속하기',
      workspaceTitle: '관리자 워크스페이스',
      logoutBtn: '관리자 로그아웃',
      tabUploadPhoto: '사진 작품 등록',
      tabUploadVideo: '영상 작품 등록',
      tabManage: '작품 목록 및 수정',
      tabAbout: '소개글 (ABOUT) 수정',
      tabBackup: '데이터 백업',
    },
    // Footer
    footer: {
      archiveDesc:
        '빛과 그림자, 서사와 공간을 기록하는 미디어 아트 & 사진 학생 아카이브.',
      navigation: '네비게이션',
      rights: 'ALL RIGHTS RESERVED.',
      studentArchive: 'STUDENT VISUAL ARCHIVE',
    },
  },
  en: {
    // Nav & Common
    nav: {
      home: 'HOME',
      photo: 'PHOTO',
      video: 'VIDEO',
      about: 'ABOUT',
      admin: 'ADMIN',
      logout: 'LOGOUT',
      brand: 'PORTFOLIO',
      adminActive: 'ADMIN CONSOLE (ACTIVE)',
      adminAccess: 'ADMIN ACCESS',
      language: 'LANGUAGE',
    },
    // Home View
    home: {
      tag: 'STUDENT ARCHIVE • VISUAL ARTS & MEDIA [2026]',
      portfolioTitle: 'PORTFOLIO',
      heroDesc:
        'A curated digital archive of academic projects and personal creative works exploring cinematography and photographic arts. Through stark contrast, spatial narratives, and disciplined framing, this portfolio shapes an evolving visual language.',
      explorePhoto: 'EXPLORE PHOTO',
      watchCinema: 'WATCH CINEMA',
      featuredVisual: 'FEATURED VISUAL',
      featuredPhoto: 'FEATURED PHOTOGRAPHY',
      fullTheater: 'FULL THEATER',
      totalArchive: 'TOTAL WORKS',
      stillPhotography: 'PHOTO WORKS',
      cinematography: 'VIDEO WORKS',
      monochrome: 'SHOOTING SETUP',
      works: 'WORKS',
      frames: 'FRAMES',
      films: 'FILMS',
      recentPhotosTitle: '01 / PHOTO COLLECTION',
      recentPhotosHeading: 'RECENT PHOTOGRAPHY',
      viewAllPhotos: 'VIEW ALL PHOTOS',
      recentVideosTitle: '02 / MOTION REEL',
      recentVideosHeading: 'VIDEO WORKS',
      viewAllVideos: 'VIEW ALL FILMS',
      independentArchive: 'INDEPENDENT ARCHIVE',
      view: 'VIEW',
      unmute: 'Unmute',
      mute: 'Mute',
    },
    // Photo View
    photoView: {
      tag: 'GALLERY COLLECTION // 02',
      heading: 'PHOTO WORKS',
      subheading:
        'A student photographic archive capturing fleeting light, architectural voids, and intimate human expressions.',
      archivedFramesSuffix: 'ARCHIVED FRAMES',
      filterLabel: 'CATEGORY FILTER',
      allCategory: 'ALL',
      uploadBtn: 'UPLOAD PHOTO (ADMIN)',
      detail: 'DETAIL',
      sampleBadge: 'SAMPLE',
      originalBadge: 'ORIGINAL',
      emptyHeading: 'No photography items found',
      emptyDesc:
        'No photography works are currently available in this category. Select another category or register new works in the Admin Console.',
      uploadNewBtn: 'Upload New Photo',
      viewAllBtn: 'View All Photos',
      fitMode: 'FIT (Full)',
      fillMode: 'FILL (Cover)',
      viewMode: 'VIEW RATIO',
    },
    // Video View
    videoView: {
      tag: 'CINEMA REEL // 03',
      heading: 'VIDEO WORKS',
      subheading:
        'Short films, narrative scenes, and commercial moving image projects exploring spatial rhythm and cinematic atmosphere.',
      archivedReelsSuffix: 'ARCHIVED REELS',
      genreLabel: 'GENRE FILTER',
      allCategory: 'ALL',
      uploadBtn: 'UPLOAD VIDEO (ADMIN)',
      play: 'PLAY',
      sampleBadge: 'SAMPLE',
      originalBadge: 'ORIGINAL',
      emptyHeading: 'No video works found',
      emptyDesc:
        'No video works are currently registered in this genre. You can upload video files or stream links in the Admin Console.',
      uploadNewBtn: 'Upload New Video',
      viewAllBtn: 'View All Videos',
    },
    // About View
    aboutView: {
      tag: 'ARCHIVIST PROFILE // 04',
      editProfile: 'EDIT PROFILE (ADMIN)',
      base: 'BASE',
      philosophyTag: 'STATEMENT & PHILOSOPHY',
      disciplinesTag: 'DISCIPLINES & SERVICES',
      workflowTag: 'PRODUCTION WORKFLOW & TOOLS',
      exhibitionsTag: 'EXHIBITIONS & SELECTED PROJECTS',
      collabTag: 'COLLABORATION & INQUIRIES',
      collabHeading: "LET'S INITIATE A PROJECT",
      collabDesc:
        'For photographic commissions, cinema directing, exhibition curation, and archival prints, inquiries are welcome via email.',
      sendEmail: 'SEND EMAIL',
      copy: 'COPY',
      copied: 'COPIED',
    },
    // Modals
    modal: {
      viewRaw: 'VIEW RAW',
      source: 'SOURCE',
      sampleTag: 'SAMPLE',
      archiveTag: 'ORIGINAL ARCHIVE',
      techSpecs: 'TECHNICAL SPECIFICATIONS',
      cinemaSpecs: 'CINEMA SPECIFICATIONS',
      date: 'DATE',
      camera: 'CAMERA',
      lens: 'LENS',
      runningTime: 'RUNNING TIME',
      resolution: 'RESOLUTION',
      client: 'CLIENT / COLLAB',
      identifier: 'IDENTIFIER',
      streamType: 'STREAM TYPE',
      keyboardGuide: 'USE [←] [→] KEYS TO BROWSE • [ESC] TO CLOSE',
    },
    // Admin
    admin: {
      gateTitle: 'ADMINISTRATOR GATE',
      consoleTitle: 'Admin Console Login',
      consoleDesc:
        'Work creation, editing, deletion, and profile management are restricted to authenticated administrators.',
      passcodeLabel: 'Admin Passcode',
      passcodePlaceholder: 'Enter passcode',
      loginBtn: 'Log In',
      workspaceTitle: 'ADMINISTRATOR WORKSPACE',
      logoutBtn: 'Admin Logout',
      tabUploadPhoto: 'Upload Photo',
      tabUploadVideo: 'Upload Video',
      tabManage: 'Manage Works',
      tabAbout: 'Edit About Profile',
      tabBackup: 'Backup & Reset',
    },
    // Footer
    footer: {
      archiveDesc:
        'Student visual media and photography archive exploring light, shadows, narrative, and space.',
      navigation: 'NAVIGATION',
      rights: 'ALL RIGHTS RESERVED.',
      studentArchive: 'STUDENT VISUAL ARCHIVE',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations.ko;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'ko',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.ko,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY);
      if (saved === 'en' || saved === 'ko') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'ko';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
