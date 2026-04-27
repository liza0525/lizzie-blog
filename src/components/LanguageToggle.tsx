// 전역 언어 드롭다운 (KO / EN)
// 현재 언어를 버튼에 표시하고 클릭 시 옵션 목록 노출
// lang 쿠키를 직접 변경 후 router.refresh()로 서버 재렌더링

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";

interface LanguageToggleProps {
  initialLang: Lang;
}

const LANGS: { value: Lang; label: string }[] = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
];

export default function LanguageToggle({ initialLang }: LanguageToggleProps): React.JSX.Element {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!mounted) return <div className="w-14 h-9" />;

  const select = (next: Lang): void => {
    document.cookie = `lang=${next}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
    setLang(next);
    setOpen(false);
    router.refresh();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="h-9 px-2.5 flex items-center gap-1 rounded-full text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {lang.toUpperCase()}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 mt-1 w-28 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {LANGS.map(({ value, label }) => (
            <li key={value}>
              <button
                role="option"
                aria-selected={lang === value}
                onClick={() => select(value)}
                className={`w-full px-3 py-1.5 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  lang === value
                    ? "font-semibold text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
