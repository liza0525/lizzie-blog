// Google Analytics 스크립트 삽입 컴포넌트
// process.env.NODE_ENV가 'production'일 때만 렌더링 — 로컬 개발 시 수집 안 함
// NEXT_PUBLIC_GA_MEASUREMENT_ID 환경변수가 없으면 아무것도 렌더링하지 않음

import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics(): React.ReactElement | null {
  if (process.env.NODE_ENV !== "production" || !GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
