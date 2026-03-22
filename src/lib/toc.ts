import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";

export interface Heading {
  level: number;   // 1 | 2 | 3
  text: string;
  id: string;
}

// 헤딩 텍스트 → anchor id 변환
// 이모지 제거 후 소문자, 공백을 하이픈으로 치환
export function toSlug(text: string): string {
  return text
    .replace(/\p{Emoji_Presentation}/gu, "")
    .toLowerCase()
    .replace(/[^\w\s가-힣-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// rehype-slug 대신 사용하는 커스텀 플러그인
// 이모지를 제거한 id를 헤딩 엘리먼트에 직접 주입
export function rehypeSlugNoEmoji() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (/^h[1-6]$/.test(node.tagName)) {
        const text = toString(node);
        node.properties = node.properties ?? {};
        node.properties.id = toSlug(text);
      }
    });
  };
}

// 마크다운 문자열에서 h1~h3 헤딩 추출
// 코드블럭(```...```) 안의 # 주석이 헤딩으로 오인식되는 걸 막기 위해 코드블럭을 먼저 제거
export function extractHeadings(markdown: string): Heading[] {
  const stripped = markdown.replace(/^```[\s\S]*?^```/gm, "");
  const regex = /^(#{1,3})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;
  while ((match = regex.exec(stripped)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    headings.push({ level, text, id: toSlug(text) });
  }
  return headings;
}
