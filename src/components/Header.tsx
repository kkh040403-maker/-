import React, { useState } from 'react';
import { PageTab } from '../types';
import { Lock, Unlock, Menu, X, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  currentTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  isAdmin: boolean;
  totalItems: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  isAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 4 primary public navigation tabs (ADMIN is unified into a single dedicated button on the right)
  const navItems: { tab: PageTab; label: string }[] = [
    { tab: 'HOME', label: 'HOME' },
    { tab: 'PHOTO', label: 'PHOTO' },
    { tab: 'VIDEO', label: 'VIDEO' },
    { tab: 'ABOUT', label: 'ABOUT' },
  ];

  const handleNav = (tab: PageTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#222222] bg-[#101010]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Brand Logo - Clean and minimalist, without overlapping subtitle text */}
        <button
          onClick={() => handleNav('HOME')}
          className="group flex items-center text-left focus:outline-none"
        >
          <span className="text-xl font-bold tracking-[0.25em] text-white transition-opacity group-hover:opacity-80">
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

        {/* Single Unified Admin Button (Desktop) */}
        <div className="hidden items-center md:flex">
          <button
            onClick={() => handleNav('ADMIN')}
            className={`flex items-center gap-2 rounded-xs border px-3.5 py-1.5 text-xs font-mono-archive tracking-wider transition-all ${
              currentTab === 'ADMIN'
                ? 'border-white bg-white text-black font-semibold'
                : isAdmin
                ? 'border-[#383838] bg-[#1a1a1a] text-[#dddddd] hover:border-[#666666]'
                : 'border-[#262626] bg-transparent text-[#888888] hover:border-[#444444] hover:text-white'
            }`}
            title="관리자 설정 (비밀번호: 0192)"
          >
            {isAdmin ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                <span>ADMIN (ACTIVE)</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-[#777777]" />
                <span>ADMIN</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile View Toggle and Single Admin Button */}
        <div className="flex items-center gap-2 md:hidden">
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
            title="관리자 메뉴 (0192)"
          >
            {isAdmin ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </button>
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

            {/* Single Unified Admin Entry in Mobile Menu */}
            <div className="pt-4 border-t border-[#222222]">
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
                      ADMIN ACCESS (0192)
                    </>
                  )}
                </span>
                <ArrowUpRight className="h-4 w-4 opacity-50" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
