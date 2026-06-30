// 마크다운 코드 블록 렌더러 — react-syntax-highlighter(Prism) 기반
// next-themes의 useTheme으로 다크/라이트 테마 자동 전환
// 인라인 코드와 블록 코드를 구분해 각각 다른 스타일 적용
// mermaid 언어 블록은 MermaidBlock으로 위임해 SVG 다이어그램으로 렌더링
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ComponentPropsWithoutRef } from "react";
import MermaidBlock from "@/components/MermaidBlock";

type CodeProps = ComponentPropsWithoutRef<"code"> & { inline?: boolean };
type PrismStyle = Record<string, React.CSSProperties>;

// oneLight/oneDark의 배경을 --surface CSS 변수로 교체 — 크림 팔레트와 일치하도록
function withSurfaceBg(theme: PrismStyle): PrismStyle {
  return {
    ...theme,
    'code[class*="language-"]': {
      ...theme['code[class*="language-"]'],
      background: "var(--surface)",
    },
    'pre[class*="language-"]': {
      ...theme['pre[class*="language-"]'],
      background: "var(--surface)",
    },
  };
}

const lightTheme = withSurfaceBg(oneLight as PrismStyle);
const darkTheme = withSurfaceBg(oneDark as PrismStyle);

export default function CodeBlock({ className, children }: CodeProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const language = /language-(\w+)/.exec(className ?? "")?.[1];

  // mermaid 코드블록은 SVG 다이어그램으로 렌더링
  if (language === "mermaid") {
    return <MermaidBlock chart={String(children)} />;
  }

  // 언어 미지정 코드블럭 — 하이라이팅 없이 블록 스타일만 적용
  // inline prop은 react-markdown v9+에서 항상 undefined라 줄바꿈 유무로 블록/인라인 구분
  if (!language) {
    const isInline = !String(children).includes("\n");
    if (isInline) {
      return (
        <code className="text-accent2 text-[0.875em]">
          {children}
        </code>
      );
    }
    return (
      <div className="my-6 overflow-hidden border border-border">
        <pre className="!px-4 !py-4 overflow-x-auto text-sm leading-relaxed text-ink !m-0" style={{ background: "var(--surface)" }}>
          <code>{children}</code>
        </pre>
      </div>
    );
  }

  const theme = mounted && resolvedTheme === "dark" ? darkTheme : lightTheme;

  return (
    <div className="my-6 overflow-hidden border border-border">
      {/* 언어 라벨 */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider font-sans">
          {language}
        </span>
      </div>
      <SyntaxHighlighter
        language={language}
        style={theme}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.875rem",
          lineHeight: "1.6",
        }}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
}
