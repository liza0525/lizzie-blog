// next-themes ThemeProvider 래퍼 — layout.tsx에서 전체 앱을 감싸 다크모드 컨텍스트 제공
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export default function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
