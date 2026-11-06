import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ko' | 'en';

const STORAGE_LANG_KEY = 'dark_archive_language';

export const translations = {
  ko: {
    // Nav & Common
    nav: {
      home: 'HOME',
      photo: 'PHOTO',
      video: 'VIDEO',
      about: 'ABOUT',
      admin: 'ADMIN',
      logout: 'LOGOUT',
    },
    // Home View
    home: {
      tag: 'STUDENT ARCHIVE • VISUAL ARTS & MEDIA [2026]',
      portfolioTitle: 'Portfolio',
      heroDesc:
        '시각 영상과 사진 예술을 전공하며 탐구한 학업 프로젝트와 개인 창작물의 기록입니다. 빛과 그림자의 명암 대비, 공간과 인물의 서사, 절제된 프레임 구도를 통해 나만의 고유한 시각 언어를 구축해 나가는 학생 포트폴리오 아카이브입니다.',
      explorePhoto: 'EXPLORE PHOTO',
      watchCinema: 'WATCH CINEMA',
      featuredVisual: 'FEATURED VISUAL',
      featuredPhoto: 'FEATURED PHOTOGRAPHY',
      fullTheater: 'FULL THEATER',
      totalArchive: 'TOTAL ARCHIVE',
      stillPhotography: 'STILL PHOTOGRAPHY',
      cinematography: 'CINEMATOGRAPHY',
      monochrome: 'MONOCHROME & DUAL',
      works: 'WORKS',
      frames: 'FRAMES',
      films: 'FILMS',
      recentPhotosTitle: '01 / STILL COLLECTION',
      recentPhotosHeading: 'RECENT PHOTOGRAPHY',
      viewAllPhotos: 'VIEW ALL PHOTOS',
      recentVideosTitle: '02 / MOTION REEL',
      recentVideosHeading: 'CINEMATOGRAPHY WORKS',
      viewAllVideos: 'VIEW ALL FILMS',
      independentArchive: 'INDEPENDENT ARCHIVE',
      view: 'VIEW',
    },
    // Photo View
    photoView: {
      tag: 'GALLERY COLLECTION // 02',
      heading: 'STILL PHOTOGRAPHY',
      subheading:
        '순간의 빛과 공간의 여백을 절제된 흑백과 듀얼 톤으로 포착한 학생 사진 아카이브입니다.',
      allCategory: 'ALL',
      uploadBtn: '사진 등록 (ADMIN)',
      emptyMessage: '해당 카테고리에 등록된 사진 작품이 없습니다.',
      view: 'VIEW',
    },
    // Video View
    videoView: {
      tag: 'CINEMA REEL // 03',
      heading: 'CINEMATOGRAPHY & MOTION',
      subheading:
        '서사와 시각적 연출, 공간의 리듬을 다룬 단편 필름과 시네마틱 영상 작업물입니다.',
      allCategory: 'ALL',
      uploadBtn: '영상 등록 (ADMIN)',
      emptyMessage: '해당 카테고리에 등록된 영상 작품이 없습니다.',
      play: 'PLAY',
    },
    // About View
    aboutView: {
      tag: 'ARCHIVIST PROFILE // 04',
      editProfile: '프로필 수정 (ADMIN)',
      base: 'BASE',
      philosophyTag: 'STATEMENT & PHILOSOPHY',
      disciplinesTag: 'DISCIPLINES & SERVICES',
      workflowTag: 'PRODUCTION WORKFLOW & TOOLS',
      exhibitionsTag: 'EXHIBITIONS & SELECTED PROJECTS',
      collabTag: 'COLLABORATION & INQUIRIES',
      collabHeading: "LET'S INITIATE A PROJECT",
      collabDesc:
        '촬영 의뢰, 상업 광고 연출, 전시 기획 및 아카이브 프린트 문의는 아래 이메일로 연락 바랍니다.',
      sendEmail: 'SEND EMAIL',
      copy: 'COPY',
      copied: '복사됨',
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
      consoleTitle: '관리자 콘솔 로그인',
      consoleDesc:
        '아카이브 작품 등록, 수정, 삭제 및 프로필 관리는 인증된 관리자만 가능합니다.',
      passcodeLabel: '관리자 비밀번호',
      passcodePlaceholder: '비밀번호 입력',
      loginBtn: '접속하기',
      workspaceTitle: 'ADMINISTRATOR WORKSPACE',
      logoutBtn: '관리자 로그아웃',
      tabUploadPhoto: '사진 작품 업로드',
      tabUploadVideo: '영상 작품 업로드',
      tabManage: '작품 목록 및 수정',
      tabAbout: '소개글 (ABOUT) 수정',
      tabBackup: '데이터 백업',
    },
    // Footer
    footer: {
      archiveDesc:
        '빛과 그림자, 서사와 공간을 기록하는 미디어 아트 & 사진 학생 아카이브.',
      navigation: 'NAVIGATION',
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
    },
    // Home View
    home: {
      tag: 'STUDENT ARCHIVE • VISUAL ARTS & MEDIA [2026]',
      portfolioTitle: 'Portfolio',
      heroDesc:
        'A curated digital archive of academic projects and personal creative works exploring cinematography and photographic arts. Through stark contrast, spatial narratives, and disciplined framing, this portfolio shapes an evolving visual language.',
      explorePhoto: 'EXPLORE PHOTO',
      watchCinema: 'WATCH CINEMA',
      featuredVisual: 'FEATURED VISUAL',
      featuredPhoto: 'FEATURED PHOTOGRAPHY',
      fullTheater: 'FULL THEATER',
      totalArchive: 'TOTAL ARCHIVE',
      stillPhotography: 'STILL PHOTOGRAPHY',
      cinematography: 'CINEMATOGRAPHY',
      monochrome: 'MONOCHROME & DUAL',
      works: 'WORKS',
      frames: 'FRAMES',
      films: 'FILMS',
      recentPhotosTitle: '01 / STILL COLLECTION',
      recentPhotosHeading: 'RECENT PHOTOGRAPHY',
      viewAllPhotos: 'VIEW ALL PHOTOS',
      recentVideosTitle: '02 / MOTION REEL',
      recentVideosHeading: 'CINEMATOGRAPHY WORKS',
      viewAllVideos: 'VIEW ALL FILMS',
      independentArchive: 'INDEPENDENT ARCHIVE',
      view: 'VIEW',
    },
    // Photo View
    photoView: {
      tag: 'GALLERY COLLECTION // 02',
      heading: 'STILL PHOTOGRAPHY',
      subheading:
        'A student photographic archive capturing fleeting light, architectural voids, and intimate human expressions in monochrome and dual tones.',
      allCategory: 'ALL',
      uploadBtn: 'UPLOAD PHOTO (ADMIN)',
      emptyMessage: 'No photography items found in this category.',
      view: 'VIEW',
    },
    // Video View
    videoView: {
      tag: 'CINEMA REEL // 03',
      heading: 'CINEMATOGRAPHY & MOTION',
      subheading:
        'Short films, narrative scenes, and commercial moving image projects exploring spatial rhythm and cinematic atmosphere.',
      allCategory: 'ALL',
      uploadBtn: 'UPLOAD VIDEO (ADMIN)',
      emptyMessage: 'No video works found in this category.',
      play: 'PLAY',
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
