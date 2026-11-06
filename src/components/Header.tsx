import React, { useState } from 'react';
import { PageTab } from '../types';
import { useLanguage } from '../lib/i18n';
import { Lock, Unlock, Menu, X, ArrowUpRight, LogOut, Globe } from 'lucide-react';

interface HeaderProps {
  currentTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  isAdmin: boolean;
  totalItems?: number;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isAdmin,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  // 4 primary public navigation tabs
  const navItems: { tab: PageTab; label: string }[] = [
    { tab: 'HOME', label: t.nav.home },
    { tab: 'PHOTO', label: t.nav.photo },
    { tab: 'VIDEO', label: t.nav.video },
    { tab: 'ABOUT', label: t.nav.about },
  ];

  const handleNav = (tab: PageTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
    if (currentTab === 'ADMIN') {
      handleNav('HOME');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#222222] bg-[#101010]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('HOME')}
          className="group flex items-center text-left focus:outline-none"
        >
          <span className="text-xl font-bold font-display tracking-[0.25em] text-white transition-opacity group-hover:opacity-80">
            PORTFOLIO
          </span>
        </button>

        {/* Desktop Primary Navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleNav(item.tab)}
                className={`relative py-1 text-xs font-medium tracking-[0.2em] transition-colors ${
                  isActive ? 'text-white' : 'text-[#888888] hover:text-[#cccccc]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 h-[1.5px] w-full bg-white transition-all" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Admin & Logout Controls */}
        <div className="hidden items-center gap-3.5 md:flex">
          {/* Minimalist Language Switcher */}
          <div className="flex items-center rounded-xs border border-[#2a2a2a] bg-[#141414] p-0.5 font-mono-archive text-[11px]">
            <button
              onClick={() => setLanguage('ko')}
              className={`px-2.5 py-1 rounded-xs transition-all ${
                language === 'ko'
                  ? 'bg-white text-black font-semibold'
                  : 'text-[#777777] hover:text-[#cccccc]'
              }`}
              title="한국어로 변경"
            >
              KR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-xs transition-all ${
                language === 'en'
                  ? 'bg-white text-black font-semibold'
                  : 'text-[#777777] hover:text-[#cccccc]'
              }`}
              title="Switch to English"
            >
              EN
            </button>
          </div>

          <button
            onClick={() => handleNav('ADMIN')}
            className={`flex items-center gap-2 rounded-xs border px-3.5 py-1.5 text-xs font-mono-archive tracking-wider transition-all ${
              currentTab === 'ADMIN'
                ? 'border-white bg-white text-black font-semibold'
                : isAdmin
                ? 'border-[#383838] bg-[#1a1a1a] text-[#dddddd] hover:border-[#666666]'
                : 'border-[#262626] bg-transparent text-[#888888] hover:border-[#444444] hover:text-white'
            }`}
            title="관리자 콘솔"
          >
            {isAdmin ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                <span>{t.nav.admin}</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-[#777777]" />
                <span>{t.nav.admin}</span>
              </>
            )}
          </button>

          {/* Quick Logout Button when logged in */}
          {isAdmin && (
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-1.5 rounded-xs border border-[#333333] bg-[#161616] px-3 py-1.5 text-xs font-mono-archive text-[#aaaaaa] hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-300 transition-colors"
              title="관리자 로그아웃"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{t.nav.logout}</span>
            </button>
          )}
        </div>

        {/* Mobile View Toggle and Admin/Logout Buttons */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Quick Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
            className="flex items-center gap-1 rounded-xs border border-[#2a2a2a] bg-[#141414] px-2.5 py-1 text-[11px] font-mono-archive text-[#cccccc]"
            title="언어 변경 (Switch Language)"
          >
            <Globe className="h-3 w-3 text-[#777777]" />
            <span className="font-semibold text-white">{language.toUpperCase()}</span>
          </button>

          <button
            onClick={() => handleNav('ADMIN')}
            className={`p-2 transition-colors ${
              currentTab === 'ADMIN'
                ? 'text-white'
                : isAdmin
                ? 'text-emerald-400'
                : 'text-[#888888]'
            }`}
            aria-label="Admin"
            title="관리자 콘솔"
          >
            {isAdmin ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </button>

          {isAdmin && (
            <button
              onClick={handleLogoutClick}
              className="p-2 text-[#888888] hover:text-red-400 transition-colors"
              aria-label="Logout"
              title="관리자 로그아웃"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#cccccc] hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-[#222222] bg-[#141414] px-6 py-6 md:hidden">
          <div className="flex flex-col gap-5">
            {navItems.map((item) => (
              <button
                key={item.tab}
                onClick={() => handleNav(item.tab)}
                className={`flex items-center justify-between text-left text-sm font-medium tracking-[0.2em] ${
                  currentTab === item.tab ? 'text-white font-semibold' : 'text-[#888888]'
                }`}
              >
                <span>{item.label}</span>
                <ArrowUpRight className="h-4 w-4 opacity-40" />
              </button>
            ))}

            {/* Mobile Language Switcher Row */}
            <div className="pt-4 border-t border-[#222222] flex items-center justify-between">
              <span className="font-mono-archive text-xs text-[#777777] flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                LANGUAGE / 언어
              </span>
              <div className="flex items-center rounded-xs border border-[#2a2a2a] bg-[#101010] p-0.5 font-mono-archive text-xs">
                <button
                  onClick={() => setLanguage('ko')}
                  className={`px-3 py-1 rounded-xs transition-all ${
                    language === 'ko'
                      ? 'bg-white text-black font-semibold'
                      : 'text-[#777777]'
                  }`}
                >
                  한국어
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-xs transition-all ${
                    language === 'en'
                      ? 'bg-white text-black font-semibold'
                      : 'text-[#777777]'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Mobile Admin & Logout Entries */}
            <div className="pt-2 border-t border-[#222222] space-y-3">
              <button
                onClick={() => handleNav('ADMIN')}
                className={`flex w-full items-center justify-between rounded-xs border px-4 py-3 text-xs font-mono-archive tracking-wider ${
                  currentTab === 'ADMIN'
                    ? 'border-white bg-white text-black font-semibold'
                    : 'border-[#333333] bg-[#181818] text-[#cccccc]'
                }`}
              >
                <span className="flex items-center gap-2">
                  {isAdmin ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      ADMIN CONSOLE (ACTIVE)
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5 text-[#777777]" />
                      ADMIN ACCESS
                    </>
                  )}
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-50" />
              </button>

              {isAdmin && (
                <button
                  onClick={handleLogoutClick}
                  className="flex w-full items-center justify-center gap-2 rounded-xs border border-red-900/40 bg-red-950/20 px-4 py-2.5 text-xs font-mono-archive tracking-wider text-red-300 hover:bg-red-900/40 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t.nav.logout}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
