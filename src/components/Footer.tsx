import React, { useState, useEffect } from 'react';
import { PageTab } from '../types';
import { ArrowUp } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: PageTab) => void;
  isAdmin: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, isAdmin }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Seoul',
        }) + ' KST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#1f1f1f] bg-[#0c0c0c] text-[#777777] transition-colors">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-16">
          {/* Col 1: Identity */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold tracking-[0.25em] text-white">
              PORTFOLIO
            </h3>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-[#888888]">
              A personal digital archive showcasing student works in still photography, cinematography, and creative visual media.
              Recording creative exploration, coursework projects, and independent film direction.
            </p>
            <div className="mt-6 flex items-center gap-4 text-xs font-mono-archive text-[#666666]">
              <span>SEOUL 37°33&apos;N 126°58&apos;E</span>
              <span>•</span>
              <span>{timeStr || 'LIVE ARCHIVE'}</span>
            </div>
          </div>

          {/* Col 2: Navigation Index */}
          <div>
            <h4 className="text-xs font-mono-archive uppercase tracking-widest text-[#aaaaaa]">
              Index
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs font-mono-archive">
              <li>
                <button
                  onClick={() => onSelectTab('HOME')}
                  className="hover:text-white transition-colors"
                >
                  01 / HOME
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('PHOTO')}
                  className="hover:text-white transition-colors"
                >
                  02 / PHOTO ARCHIVE
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('VIDEO')}
                  className="hover:text-white transition-colors"
                >
                  03 / CINEMATOGRAPHY
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('ABOUT')}
                  className="hover:text-white transition-colors"
                >
                  04 / ABOUT &amp; CONTACT
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: System & Admin */}
          <div>
            <h4 className="text-xs font-mono-archive uppercase tracking-widest text-[#aaaaaa]">
              System
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs font-mono-archive">
              <li>
                <button
                  onClick={() => onSelectTab('ADMIN')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>{isAdmin ? 'ADMIN CONSOLE (ACTIVE)' : 'ADMIN ACCESS'}</span>
                </button>
              </li>
              <li className="text-[#555555]">
                ENCODING: 4K DCI / RAW
              </li>
              <li className="text-[#555555]">
                STORAGE: FIRESTORE &amp; STORAGE
              </li>
              <li>
                <button
                  onClick={scrollToTop}
                  className="mt-2 flex items-center gap-1.5 text-xs text-[#999999] hover:text-white transition-colors"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                  <span>BACK TO TOP</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[#1a1a1a] pt-8 text-[11px] font-mono-archive text-[#555555] sm:flex-row">
          <div>© {new Date().getFullYear()} DARK ARCHIVE. ALL RIGHTS RESERVED.</div>
          <div>MINIMALIST DIGITAL ARCHIVE PLATFORM</div>
        </div>
      </div>
    </footer>
  );
};
