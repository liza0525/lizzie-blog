// 모바일/세로화면(<xl) 전용 목차 진입점 — 우하단 플로팅 버튼 + 바텀시트
// 데스크톱 사이드바(TableOfContents)와 별개 UI로, xl 미만 화면에서만 노출
// 배경 dimming 없이 border/shadow로만 시각적 분리 (기존 note 오버레이 카드와 동일한 하우스 스타일)
"use client";

import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/lib/toc";
import TableOfContents from "@/components/TableOfContents";

interface TocBottomSheetProps {
  headings: Heading[];
}

const TRANSITION_MS = 300;

export default function TocBottomSheet({ headings }: TocBottomSheetProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function openSheet(): void {
    setMounted(true);
    setOpen(true);
  }

  function closeSheet(): void {
    setOpen(false);
    setVisible(false);
    triggerRef.current?.focus();
  }

  // 마운트된 다음 프레임에 visible을 켜서 슬라이드업 트랜지션을 트리거
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  // 슬라이드다운 트랜지션이 끝난 뒤 언마운트
  useEffect(() => {
    if (open || !mounted) return;
    const timer = setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [open, mounted]);

  // 시트가 실제로 DOM에 올라온 뒤 포커스 이동
  useEffect(() => {
    if (open && mounted) sheetRef.current?.focus();
  }, [open, mounted]);

  // Esc로 닫기
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") closeSheet();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // 열려있는 동안 배경 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openSheet}
        aria-label="목차 열기"
        className="fixed bottom-6 right-6 z-20 xl:hidden flex items-center gap-2 rounded-full bg-bg border border-border text-ink shadow-lg hover:bg-surface transition-colors pl-4 pr-5 py-3"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="15" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        <span className="text-sm font-medium font-sans">목차</span>
      </button>

      {mounted && (
        <>
          {/* 탭-아웃-투-클로즈용 투명 클릭 캐처 — dimming 없음 */}
          <div
            className="fixed inset-0 z-30 xl:hidden"
            onClick={closeSheet}
            aria-hidden="true"
          />

          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="목차"
            tabIndex={-1}
            className={`fixed inset-x-0 bottom-0 z-40 xl:hidden bg-bg border-t border-border shadow-lg max-h-[75vh] overflow-y-auto transition-transform duration-300 ease-out motion-reduce:transition-none ${
              visible ? "translate-y-0" : "translate-y-full"
            }`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="text-sm font-semibold text-ink font-sans">목차</span>
              <button
                type="button"
                onClick={closeSheet}
                aria-label="목차 닫기"
                className="w-8 h-8 flex items-center justify-center text-muted hover:text-ink transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-4">
              <TableOfContents headings={headings} onNavigate={closeSheet} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
