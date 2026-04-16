// 전역 언어 토글 버튼 (KO ↔ EN)
// ThemeToggle과 동일한 패턴 — lang 쿠키를 직접 변경 후 router.refresh()로 서버 재렌더링
// SSR hydration mismatch 방지를 위해 마운트 전 빈 div 렌더링

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { dict } from "@/lib/i18n";

interface LanguageToggleProps {
  initialLang: Lang;
}

export default function LanguageToggle({ initialLang }: LanguageToggleProps): React.JSX.Element {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  const toggle = (): void => {
    const next: Lang = lang === "ko" ? "en" : "ko";
    document.cookie = `lang=${next}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
    setLang(next);
    router.refresh();
  };

  const t = dict[lang];

  return (
    <button
      onClick={toggle}
      aria-label={t.langToggleLabel}
      className="w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {t.langToggle}
    </button>
  );
}
