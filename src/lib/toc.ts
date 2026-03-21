export interface Heading {
  level: number;   // 1 | 2 | 3
  text: string;
  id: string;      // rehype-slug 생성 방식과 동일하게 맞춤
}

// rehype-slug가 생성하는 ID 규칙 재현
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "")  // 영문, 숫자, 한글, 하이픈만 유지
    .trim()
    .replace(/\s+/g, "-");
}

// 마크다운 문자열에서 h1~h3 헤딩 추출
export function extractHeadings(markdown: string): Heading[] {
  const regex = /^(#{1,3})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    headings.push({ level, text, id: toSlug(text) });
  }
  return headings;
}
