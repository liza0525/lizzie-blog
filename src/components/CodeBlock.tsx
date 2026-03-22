// 마크다운 코드 블록 렌더러 — react-syntax-highlighter(Prism) 기반
// next-themes의 useTheme으로 다크/라이트 테마 자동 전환
// 인라인 코드와 블록 코드를 구분해 각각 다른 스타일 적용
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ComponentPropsWithoutRef } from "react";

type CodeProps = ComponentPropsWithoutRef<"code"> & { inline?: boolean };

export default function CodeBlock({ className, children }: CodeProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const language = /language-(\w+)/.exec(className ?? "")?.[1];

  // 언어 미지정 코드블럭 — 하이라이팅 없이 블록 스타일만 적용
  // inline prop은 react-markdown v9+에서 항상 undefined라 줄바꿈 유무로 블록/인라인 구분
  if (!language) {
    const isInline = !String(children).includes("\n");
    if (isInline) {
      return (
        <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm">
          {children}
        </code>
      );
    }
    return (
      <div className="my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <pre className="!bg-gray-50 dark:!bg-gray-900 !px-4 !py-4 overflow-x-auto text-sm leading-relaxed text-gray-800 dark:text-gray-200 !m-0">
          <code>{children}</code>
        </pre>
      </div>
    );
  }

  const theme = mounted && resolvedTheme === "dark" ? oneDark : oneLight;

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* 언어 라벨 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
