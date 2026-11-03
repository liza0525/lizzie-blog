import type { Metadata } from "next";
import ThemeProvider from "@/components/ThemeProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lizzie's Blog",
    // 글 상세 페이지에서 "글 제목 | Lizzie's Blog" 형태로 표시
    template: "%s | Lizzie's Blog",
  },
  description: "Lizzie의 개인 개발 기술 블로그",
  openGraph: {
    siteName: "Lizzie's Blog",
    locale: "ko_KR",
    type: "website",
    url: SITE_URL,
    title: "Lizzie's Blog",
    description: "Lizzie의 개인 개발 기술 블로그",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lizzie's Blog",
    description: "Lizzie의 개인 개발 기술 블로그",
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
