// 검색어 하이라이팅 — 텍스트에서 query와 일치하는 부분을 <mark>로 감싸 반환
// 대소문자 무시, 정규식 특수문자 이스케이프 처리
interface HighlightTextProps {
  text: string;
  query: string;
}

// 검색어와 일치하는 부분을 <mark>로 감싸서 반환
export default function HighlightText({ text, query }: HighlightTextProps) {
  if (!query.trim()) return <>{text}</>;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/40 text-inherit rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
