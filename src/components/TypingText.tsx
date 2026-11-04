// 타이핑 효과 문구 — 글자가 하나씩 쳐지듯 나타나고, 방금 친 글자 뒤에 커서가 따라붙음 (다 치면 마지막 글자 뒤에서 커서가 계속 깜빡임)
// CSS 애니메이션만 사용: 글자마다 순번(--i) × --stagger-step만큼 늦게 나타남 (globals.css의 .typing-char)
//   → 서버 컴포넌트라 JS·하이드레이션 시점과 상관없이 같은 타이밍. 같은 순번 단위를 쓰므로 뒤따르는 요소도 staggerStyle로 이어 붙이면 됨
// 글자 span은 inline이라 줄바꿈(word-break: keep-all)은 원문과 똑같이 어절 단위로 일어남 (inline-block이면 글자마다 끊길 수 있음)

import React from "react";
import { staggerStyle } from "@/lib/motion";

interface TypingTextProps {
  text: string;
}

// 마지막 글자까지 쳐지는 순번 — 뒤에 이어 나올 요소(소개·버튼)는 이 값보다 큰 순번을 주면 타이핑이 끝난 뒤 나타남
// Array.from은 이모지 같은 2칸짜리 문자도 한 글자로 셈
export function typingEndStep(text: string): number {
  return Array.from(text).length;
}

export default function TypingText({ text }: TypingTextProps): React.JSX.Element {
  const chars = Array.from(text);

  return (
    <>
      {/* 스크린리더는 글자 조각이 아니라 문장 전체를 읽도록 원문을 따로 두고, 쪼갠 쪽은 숨김 */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {chars.map((char, i) => (
          // 마지막 글자는 커서가 지나간 뒤에도 남아서 깜빡임 (globals.css의 .typing-char-last)
          <span key={i} className={i === chars.length - 1 ? "typing-char typing-char-last" : "typing-char"} style={staggerStyle(i)}>
            {char}
          </span>
        ))}
      </span>
    </>
  );
}
