import type { Metadata } from "next";
import Header from "@/components/Header";
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
    // data-scroll-behavior="smooth": globals.css의 scroll-behavior: smooth(목차 앵커 이동용)를
    // 페이지 이동 때만 Next.js가 잠깐 꺼서, 새 페이지가 이전 스크롤 위치에서 위로 미끄러져 올라가지 않게 함
    // (Next.js 16부터는 이 속성이 있어야만 꺼줌)
    <html lang="ko" className="h-full antialiased" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/fonts-archive/MaruBuri/MaruBuri.css" />
      </head>
      <GoogleAnalytics />
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border mt-16">
            <div className="max-w-[900px] mx-auto px-6 py-8 text-center text-xs text-muted">
              © {new Date().getFullYear()} Lizzie
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
