// Mermaid 다이어그램 렌더러 — 클라이언트 사이드에서 SVG로 변환
// mermaid.render()는 브라우저 환경에서만 동작하므로 "use client" + useEffect 필수
// 다크/라이트 테마를 next-themes로 감지해 mermaid 테마(dark/default) 자동 전환
"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidBlockProps {
  chart: string;
}

let idCounter = 0;

export default function MermaidBlock({ chart }: MermaidBlockProps): React.JSX.Element {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const idRef = useRef<string>(`mermaid-${++idCounter}`);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: resolvedTheme === "dark" ? "dark" : "default",
      securityLevel: "loose",
    });

    mermaid
      .render(idRef.current, chart.trim())
      .then(({ svg: rendered }) => {
        setSvg(rendered);
        setError("");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Mermaid 렌더링 실패");
        setSvg("");
      });
  }, [chart, resolvedTheme]);

  if (error) {
    return (
      <div className="my-6 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4 text-sm text-red-600 dark:text-red-400">
        <p className="font-medium mb-1">Mermaid 오류</p>
        <pre className="whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-8 flex justify-center items-center text-sm text-gray-400">
        렌더링 중...
      </div>
    );
  }

  return (
    <div
      className="my-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex justify-center overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
