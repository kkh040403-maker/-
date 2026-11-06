import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './lib/i18n';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in portfolio:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#101010] text-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md border border-[#262626] bg-[#141414] p-8 rounded-xs shadow-2xl">
            <div className="text-xs font-mono tracking-widest text-[#888888]">PORTFOLIO ARCHIVE RECOVERY</div>
            <h1 className="mt-3 text-xl font-bold text-white">화면을 불러오는 중 문제가 발생했습니다</h1>
            <p className="mt-2 text-xs text-[#999999] leading-relaxed">
              캐시를 재설정하거나 새로고침하여 아카이브를 정상적으로 로드할 수 있습니다.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('dark_archive_photos_v1');
                    localStorage.removeItem('dark_archive_videos_v1');
                  } catch (e) {}
                  window.location.reload();
                }}
                className="border border-[#444444] px-4 py-2 text-xs font-mono text-[#cccccc] hover:border-white hover:text-white"
              >
                캐시 초기화 후 재시도
              </button>
              <button
                onClick={() => window.location.reload()}
                className="border border-white bg-white px-5 py-2 text-xs font-mono font-semibold text-black hover:bg-[#e4e4e7]"
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </ErrorBoundary>
);
