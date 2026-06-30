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
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
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
