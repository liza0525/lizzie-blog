// 문장 속 한 부분에 새벽빛(sunrise) 형광펜 띠를 칠해 보여 줌 — 인트로·히어로의 소개 문장이 같이 씀
// 띠 모양은 globals.css의 .highlight-mark. swipeStep을 주면 그 순번에 왼쪽→오른쪽으로 그어지고(.highlight-swipe, 인트로), 없으면 처음부터 칠해져 있음(히어로)
// highlight가 text 안에 없으면 강조 없이 문장만 표시

import React from "react";
import { staggerStyle } from "@/lib/motion";

interface SunriseHighlightProps {
  text: string;
  highlight: string;
  swipeStep?: number;  // 형광펜이 그어지기 시작하는 등장 순번 (lib/motion.ts의 staggerStyle 단위)
}

// 문장을 강조 앞 / 강조 / 강조 뒤로 나눔 — 강조할 부분이 문장에 없으면 null
function splitHighlight(text: string, highlight: string): [string, string, string] | null {
  const start = highlight ? text.indexOf(highlight) : -1;
  if (start === -1) return null;
  const end = start + highlight.length;
  return [text.slice(0, start), text.slice(start, end), text.slice(end)];
}

export default function SunriseHighlight({ text, highlight, swipeStep }: SunriseHighlightProps): React.JSX.Element {
  const parts = splitHighlight(text, highlight);
  if (!parts) return <>{text}</>;

  const swipe = swipeStep !== undefined;
  return (
    <>
      {parts[0]}
      <mark
        className={swipe ? "highlight-mark highlight-swipe" : "highlight-mark"}
        style={swipe ? staggerStyle(swipeStep) : undefined}
      >
        {parts[1]}
      </mark>
      {parts[2]}
    </>
  );
}
