// 본문 이미지 + 클릭 확대 라이트박스
// 본문에서는 높이를 70vh로 제한해 세로로 긴 아이폰 사진/스크린샷이 화면을 덮지 않게 하고,
// 클릭하면 화면 전체 크기로 띄워 줄어든 이미지의 디테일을 볼 수 있게 함
// 오버레이는 portal로 body에 붙임 — prose 스타일과 부모 stacking context의 영향을 받지 않도록
"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ZoomableImageProps {
  src: string | undefined;
  alt: string;
}

const TRANSITION_MS = 200;

export default function ZoomableImage({ src, alt }: ZoomableImageProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function openLightbox(): void {
    setMounted(true);
    setOpen(true);
  }

  function closeLightbox(): void {
    setOpen(false);
    setVisible(false);
    triggerRef.current?.focus();
  }

  // 마운트된 다음 프레임에 visible을 켜서 페이드인 트랜지션을 트리거
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  // 페이드아웃 트랜지션이 끝난 뒤 언마운트
  useEffect(() => {
    if (open || !mounted) return;
    const timer = setTimeout(() => setMounted(false), TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [open, mounted]);

  // 오버레이가 실제로 DOM에 올라온 뒤 포커스 이동 (Esc 키 입력을 바로 받을 수 있도록)
  useEffect(() => {
    if (open && mounted) dialogRef.current?.focus();
  }, [open, mounted]);

  // Esc로 닫기
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") closeLightbox();
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
        onClick={openLightbox}
        aria-label={alt ? `이미지 크게 보기: ${alt}` : "이미지 크게 보기"}
        className="block max-w-full cursor-zoom-in"
      >
        {/* !my-0: button으로 감싸면서 prose의 `figure > *` 여백 리셋이 img에 닿지 않아 직접 0으로 지정
            (일반 my-0은 컴파일된 CSS에서 prose 규칙보다 앞에 나와 덮어써지므로 important 필요) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="max-w-full max-h-[70vh] w-auto h-auto !my-0" />
      </button>

      {mounted &&
        createPortal(
          // 오버레이 어디를 눌러도 닫힘 — 이미지 자체도 닫기 영역에 포함 (모바일에서 닫기 버튼을 찾을 필요 없게)
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={alt || "이미지 크게 보기"}
            tabIndex={-1}
            onClick={closeLightbox}
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4 bg-bg cursor-zoom-out outline-none transition-opacity duration-200 ease-out motion-reduce:transition-none ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="닫기"
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-muted hover:text-ink transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="max-w-full max-h-[85vh] w-auto h-auto object-contain" />
            {alt && <p className="text-center text-[14px] text-muted font-sans">{alt}</p>}
          </div>,
          document.body
        )}
    </>
  );
}
