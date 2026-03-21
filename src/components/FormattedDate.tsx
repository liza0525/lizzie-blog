// 날짜 포맷 컴포넌트 — 브라우저 로케일 기준으로 날짜+시간 표시
// 서버/클라이언트 로케일 불일치로 hydration 경고가 생기므로 suppressHydrationWarning 사용
"use client";

interface FormattedDateProps {
  date: string;
  className?: string;
}

// 접속 지역(브라우저 로케일) 기준으로 날짜 포맷
export default function FormattedDate({ date, className }: FormattedDateProps): React.JSX.Element {
  const formatted = new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return <time dateTime={date} className={className} suppressHydrationWarning>{formatted}</time>;
}
