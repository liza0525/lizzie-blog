// 타이핑 효과 문구 — 글자가 하나씩 쳐지듯 나타나고, 방금 친 글자 뒤에 커서가 따라붙음 (다 치면 커서가 깜빡임)
// CSS 애니메이션만 사용: 글자마다 순번(--i) × --stagger-step만큼 늦게 나타남 (globals.css의 .typing-char)
//   → 서버 컴포넌트라 JS·하이드레이션 시점과 상관없이 같은 타이밍. 같은 순번 단위를 쓰므로 뒤따르는 요소도 staggerStyle로 이어 붙이면 됨
// 글자 span은 inline이라 줄바꿈(word-break: keep-all)은 원문과 똑같이 어절 단위로 일어남 (inline-block이면 글자마다 끊길 수 있음)
// highlight 부분은 다 쳐진 뒤 accent 밑줄이 그어짐

import React from "react";
import { staggerStyle } from "@/lib/motion";

interface TypingTextProps {
  text: string;
  highlight: string;  // text 안에 그대로 들어 있어야 밑줄이 그어짐 (없으면 밑줄 없이 표시)
}

// 마지막 글자까지 쳐지는 순번 — 뒤에 이어 나올 요소(소개·버튼)는 이 값보다 큰 순번을 주면 타이핑이 끝난 뒤 나타남
export function typingEndStep(text: string): number {
  return Array.from(text).length;
}

// 밑줄을 그을 글자 범위 [start, end) — 글자 단위 인덱스 (Array.from은 이모지 같은 2칸짜리 문자도 한 글자로 셈)
function highlightRange(text: string, highlight: string): [number, number] | null {
  const index = highlight ? text.indexOf(highlight) : -1;
  if (index === -1) return null;
  const start = Array.from(text.slice(0, index)).length;
  return [start, start + Array.from(highlight).length];
}

export default function TypingText({ text, highlight }: TypingTextProps): React.JSX.Element {
  const chars = Array.from(text);
  const range = highlightRange(text, highlight);
  const lastIndex = chars.length - 1;

  function renderChar(char: string, i: number): React.JSX.Element {
    return (
      // data-last: 마지막 글자 뒤의 커서는 사라지지 않고 계속 깜빡임
      <span key={i} className="typing-char" style={staggerStyle(i)} data-last={i === lastIndex ? "" : undefined}>
        {char}
      </span>
    );
  }

  const before = range ? chars.slice(0, range[0]) : chars;
  const marked = range ? chars.slice(range[0], range[1]) : [];
  const after = range ? chars.slice(range[1]) : [];

  return (
    <>
      {/* 스크린리더는 글자 조각이 아니라 문장 전체를 읽도록 원문을 따로 두고, 쪼갠 쪽은 숨김 */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {before.map((char, i) => renderChar(char, i))}
        {range && (
          // 밑줄은 ::after로 그림 — 순번은 "다 쳐진 다음"(마지막 순번 + 1)
          <span
            className="relative after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent after:origin-left after:animate-underline-draw"
            style={staggerStyle(chars.length + 1)}
          >
            {marked.map((char, i) => renderChar(char, range[0] + i))}
          </span>
        )}
        {after.map((char, i) => renderChar(char, (range ? range[1] : 0) + i))}
      </span>
    </>
  );
}
