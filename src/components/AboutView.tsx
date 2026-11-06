import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ProfileData } from '../types';
import { useLanguage } from '../lib/i18n';
import { Mail, MapPin, Copy, Check, Edit3, ArrowUpRight, Award, Layers, Terminal } from 'lucide-react';

interface AboutViewProps {
  profile: ProfileData;
  isAdmin: boolean;
  onGoToEditProfile?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  profile,
  isAdmin,
  onGoToEditProfile,
}) => {
  const [copied, setCopied] = useState(false);
  const { language, t } = useLanguage();

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#101010] text-[#fafafa] px-6 py-12 lg:px-12 lg:py-20">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-5xl"
      >
        {/* Header Tag */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-6">
          <div className="flex items-center gap-2 text-xs font-mono-archive tracking-[0.25em] text-[#777777]">
            <span>{t.aboutView.tag}</span>
          </div>

          {isAdmin && onGoToEditProfile && (
            <button
              onClick={onGoToEditProfile}
              className="inline-flex items-center gap-1.5 border border-[#444444] bg-[#1a1a1a] px-3.5 py-1.5 text-xs font-mono-archive text-[#cccccc] hover:border-white hover:text-white transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{t.aboutView.editProfile}</span>
            </button>
          )}
        </div>

        {/* Name & Title Hero */}
        <div className="mt-12">
          <h1 className="text-4xl font-extrabold font-display tracking-tight sm:text-6xl text-white">
            {profile.name}
          </h1>
          <p className="mt-3 text-sm font-mono-archive tracking-widest text-[#999999] uppercase">
            {profile.title}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-mono-archive text-[#666666]">
            <MapPin className="h-3.5 w-3.5" />
            <span>BASE: {profile.location}</span>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-12 border-t border-[#1f1f1f] pt-10">
          <h2 className="text-xs font-mono-archive tracking-widest text-[#777777] uppercase">
            {t.aboutView.philosophyTag}
          </h2>
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#cccccc] whitespace-pre-line font-light">
            {profile.bio}
          </p>
        </div>

        {/* Disciplines & Software Suite Grid */}
        <div className="mt-16 grid grid-cols-1 gap-12 border-t border-[#1f1f1f] pt-12 md:grid-cols-2">
          {/* Disciplines */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-archive tracking-widest text-[#777777] uppercase">
              <Layers className="h-3.5 w-3.5 text-[#aaaaaa]" />
              <span>{t.aboutView.disciplinesTag}</span>
            </div>
            <ul className="mt-6 space-y-3 font-mono-archive text-xs text-[#dddddd]">
              {profile.disciplines.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 border-b border-[#1a1a1a] pb-2.5"
                >
                  <span className="text-[#555555]">{(idx + 1).toString().padStart(2, '0')}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Software Suite */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-archive tracking-widest text-[#777777] uppercase">
              <Terminal className="h-3.5 w-3.5 text-[#aaaaaa]" />
              <span>{t.aboutView.workflowTag}</span>
            </div>
            <ul className="mt-6 space-y-3 font-mono-archive text-xs text-[#dddddd]">
              {profile.software.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 border-b border-[#1a1a1a] pb-2.5"
                >
                  <span className="text-[#555555]">SYS_{idx + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Exhibitions & Chronicles */}
        {profile.exhibitions && profile.exhibitions.length > 0 && (
          <div className="mt-16 border-t border-[#1f1f1f] pt-12">
            <div className="flex items-center gap-2 text-xs font-mono-archive tracking-widest text-[#777777] uppercase">
              <Award className="h-3.5 w-3.5 text-[#aaaaaa]" />
              <span>{t.aboutView.exhibitionsTag}</span>
            </div>

            <div className="mt-6 divide-y divide-[#1a1a1a]">
              {profile.exhibitions.map((ex, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-12 sm:items-baseline"
                >
                  <div className="font-mono-archive text-xs text-[#777777] sm:col-span-2">
                    {ex.year}
                  </div>
                  <div className="text-sm font-medium text-white sm:col-span-6">
                    {ex.title}
                  </div>
                  <div className="font-mono-archive text-xs text-[#999999] sm:col-span-4 sm:text-right">
                    {ex.roleOrPlace}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact & Inquiries Section */}
        <div className="mt-20 border-t border-[#222222] bg-[#141414] p-8 sm:p-12">
          <div className="text-xs font-mono-archive tracking-widest text-[#777777] uppercase">
            {t.aboutView.collabTag}
          </div>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t.aboutView.collabHeading}
          </h3>
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-[#888888] sm:text-sm">
            {t.aboutView.collabDesc}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Email display & copy */}
            <div className="flex items-center justify-between rounded-xs border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 font-mono-archive text-xs text-white sm:min-w-[320px]">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#777777]" />
                {profile.email}
              </span>
              <button
                onClick={handleCopyEmail}
                className="ml-4 flex items-center gap-1 text-[11px] text-[#aaaaaa] hover:text-white transition-colors"
                title="이메일 복사"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">{t.aboutView.copied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{t.aboutView.copy}</span>
                  </>
                )}
              </button>
            </div>

            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center justify-center gap-2 border border-white bg-white px-6 py-3 font-mono-archive text-xs font-semibold tracking-wider text-black transition-all hover:bg-[#e4e4e7]"
            >
              <span>{t.aboutView.sendEmail}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
