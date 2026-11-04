import type { Metadata } from "next";
import ThemeProvider from "@/components/ThemeProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/config";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    // 다른 페이지는 "글 제목 | HAE MU" — 탭이 좁아서 뒤는 사이트 이름만
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fonts-archive/MaruBuri/MaruBuri.css" />
      </head>
      <GoogleAnalytics />
      <body className="min-h-full flex flex-col">
        {/* 헤더·푸터는 (site)/layout.tsx에 있음 — 홈 인트로(app/page.tsx)만 헤더 없이 화면 전체를 쓰게 하려고 분리 */}
        {/* disableTransitionOnChange: 테마를 바꾸는 순간엔 모든 전환을 끔 — 배경만 먼저 바뀌고 버튼·링크가 늦게 따라오는 어긋남 방지 (디자인 시스템 0.1.0) */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
