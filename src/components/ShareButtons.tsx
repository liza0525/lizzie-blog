// 포스트 공유 버튼 — 링크 복사 / LinkedIn / Facebook
// 현재 URL은 클라이언트에서만 알 수 있으므로 "use client" 필요
// 링크 복사 후 1.5초간 "복사됨" 피드백 표시

"use client";

import React, { useState } from "react";

interface ShareButtonsProps {
  title: string;
}

export default function ShareButtons({ title }: ShareButtonsProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  function getUrl(): string {
    return window.location.href;
  }

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(getUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleLinkedIn(): void {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleFacebook(): void {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">공유</span>

      {/* 링크 복사 */}
      <button
        onClick={handleCopy}
        title="링크 복사"
        className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors px-2.5 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {copied ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            복사됨
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            링크
          </>
        )}
      </button>

      {/* LinkedIn */}
      <button
        onClick={handleLinkedIn}
        title={`LinkedIn에 공유: ${title}`}
        className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-[#0A66C2] transition-colors px-2.5 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        LinkedIn
      </button>

      {/* Facebook */}
      <button
        onClick={handleFacebook}
        title={`Facebook에 공유: ${title}`}
        className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-[#1877F2] transition-colors px-2.5 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Facebook
      </button>
    </div>
  );
}
