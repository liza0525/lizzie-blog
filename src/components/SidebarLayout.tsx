"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface SidebarLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="4" x2="16" y2="4" />
      <line x1="2" y1="9" x2="16" y2="9" />
      <line x1="2" y1="14" x2="16" y2="14" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="3" y1="3" x2="15" y2="15" />
      <line x1="15" y1="3" x2="3" y2="15" />
    </svg>
  );
}

export default function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex">
      {/* 사이드바 — lg 이상에서만 표시, 햄버거 토글로 열고 닫기 */}
      <div
        className={`hidden lg:block shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
          open ? "w-48" : "w-0"
        }`}
      >
        <div
          className={`w-48 pr-6 transition-transform duration-300 ease-in-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebar}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 min-w-0">
        {/* 토글 버튼 — lg 이상에서만 표시 */}
        <button
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "사이드바 닫기" : "사이드바 열기"}
          className="hidden lg:block mb-6 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>

        {children}
      </div>
    </div>
  );
}
