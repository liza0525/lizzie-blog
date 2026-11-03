// 타이핑 효과 문구 — 글자가 하나씩 쳐지듯 나타나고, 방금 친 글자 뒤에 커서가 따라붙음 (다 치면 커서도 사라짐)
// CSS 애니메이션만 사용: 글자마다 순번(--i) × --stagger-step만큼 늦게 나타남 (globals.css의 .typing-char)
//   → 서버 컴포넌트라 JS·하이드레이션 시점과 상관없이 같은 타이밍. 같은 순번 단위를 쓰므로 뒤따르는 요소도 staggerStyle로 이어 붙이면 됨
// 글자 span은 inline이라 줄바꿈(word-break: keep-all)은 원문과 똑같이 어절 단위로 일어남 (inline-block이면 글자마다 끊길 수 있음)
// highlight 부분은 다 쳐진 뒤 형광펜으로 긋듯 새벽빛 띠가 왼쪽→오른쪽으로 칠해짐 (globals.css의 .highlight-mark + .highlight-swipe)

import React from "react";
import { staggerStyle } from "@/lib/motion";

interface TypingTextProps {
  text: string;
  highlight: string;  // text 안에 그대로 들어 있어야 새벽빛 강조가 붙음 (없으면 강조 없이 표시)
}

// 마지막 글자까지 쳐지는 순번 — 뒤에 이어 나올 요소(소개·버튼)는 이 값보다 큰 순번을 주면 타이핑이 끝난 뒤 나타남
export function typingEndStep(text: string): number {
  return Array.from(text).length;
}

// 형광펜이 그어지기 시작하는 순번 — 타이핑이 끝나고 한 박자 뒤
function highlightStartStep(text: string): number {
  return typingEndStep(text) + 2;
}

// 새벽빛으로 강조할 글자 범위 [start, end) — 글자 단위 인덱스 (Array.from은 이모지 같은 2칸짜리 문자도 한 글자로 셈)
function highlightRange(text: string, highlight: string): [number, number] | null {
  const index = highlight ? text.indexOf(highlight) : -1;
  if (index === -1) return null;
  const start = Array.from(text.slice(0, index)).length;
  return [start, start + Array.from(highlight).length];
}

export default function TypingText({ text, highlight }: TypingTextProps): React.JSX.Element {
  const chars = Array.from(text);
  const range = highlightRange(text, highlight);

  function renderChar(char: string, i: number): React.JSX.Element {
    return (
      <span key={i} className="typing-char" style={staggerStyle(i)}>
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
          // 타이핑 중엔 보통 글자로 쳐지고, 마지막 커서가 사라진 뒤 한 박자 쉬고(마지막 순번 + 2) 형광펜이 그어짐
          <span className="highlight-mark highlight-swipe" style={staggerStyle(highlightStartStep(text))}>
            {marked.map((char, i) => renderChar(char, range[0] + i))}
          </span>
        )}
        {after.map((char, i) => renderChar(char, (range ? range[1] : 0) + i))}
      </span>
    </>
  );
}
