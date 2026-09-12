// 날짜 포맷 컴포넌트 — 브라우저 로케일 기준으로 날짜+시간 표시
// 서버 렌더링 시점엔 방문자의 로케일/타임존을 알 수 없어 서버 기본값(UTC/영문)으로 굳어버리므로,
// 마운트 전에는 빈 값을 렌더링하고 마운트 후 클라이언트에서 포맷을 계산한다
"use client";

import { useEffect, useState } from "react";

interface FormattedDateProps {
  date: string;
  className?: string;
}

// 접속 지역(브라우저 로케일) 기준으로 날짜 포맷
export default function FormattedDate({ date, className }: FormattedDateProps): React.JSX.Element {
  const [formatted, setFormatted] = useState<string | null>(null);

  useEffect(() => {
    setFormatted(
      new Date(date).toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, [date]);

  return (
    <time dateTime={date} className={className}>
      {formatted ?? ""}
    </time>
  );
}
