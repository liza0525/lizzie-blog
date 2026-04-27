// 포스트 본문 렌더러 (client component)
// PostContent(server)에서 이미 lang에 맞는 content를 받으므로 단순 렌더링만 담당
// 번역 토글은 헤더의 전역 LanguageToggle로 대체됨

"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { rehypeSlugNoEmoji } from "@/lib/toc";
import type { Heading } from "@/lib/toc";
import type { Lang } from "@/lib/i18n";
import CodeBlock from "@/components/CodeBlock";
import TableOfContents from "@/components/TableOfContents";

interface PostContentClientProps {
  content: string;
  headings: Heading[];
  pageId: string;
  lang: Lang;
}

export default function PostContentClient({
  content,
  headings,
  pageId: _pageId,
  lang: _lang,
}: PostContentClientProps): React.JSX.Element {
  return (
    <div className="flex gap-12">
      <div className="flex-1 min-w-0">
        <div className="prose prose-gray dark:prose-invert prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex, rehypeSlugNoEmoji]}
            components={{
              img: ({ src, alt }) => (
                <figure className="my-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={alt ?? ""} className="rounded-lg w-full" />
                  {alt && (
                    <figcaption className="text-center text-sm text-gray-400 dark:text-gray-500 mt-2">
                      {alt}
                    </figcaption>
                  )}
                </figure>
              ),
              code: (props) => <CodeBlock {...props} />,
              iframe: ({ ...props }) => (
                <iframe {...props} className="notion-embed rounded-lg my-4 w-full h-[600px]" />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      <aside className="w-56 shrink-0 hidden xl:block">
        <div className="sticky top-24">
          <TableOfContents headings={headings} />
        </div>
      </aside>
    </div>
  );
}
