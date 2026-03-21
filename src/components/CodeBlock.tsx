"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ComponentPropsWithoutRef } from "react";

type CodeProps = ComponentPropsWithoutRef<"code"> & { inline?: boolean };

export default function CodeBlock({ inline, className, children }: CodeProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const language = /language-(\w+)/.exec(className ?? "")?.[1];

  // 인라인 코드는 그냥 렌더링
  if (inline || !language) {
    return (
      <code className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-1.5 py-0.5 rounded text-sm">
        {children}
      </code>
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
