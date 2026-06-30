// 포스트 본문 렌더러 (client component)
// PostContent(server)에서 마크다운 content와 headings를 받아 렌더링

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
import CodeBlock from "@/components/CodeBlock";
import TableOfContents from "@/components/TableOfContents";

interface PostContentClientProps {
  content: string;
  headings: Heading[];
  pageId: string;
}

export default function PostContentClient({
  content,
  headings,
  pageId: _pageId,
}: PostContentClientProps): React.JSX.Element {
  return (
    <div className="flex gap-12">
      <div className="flex-1 min-w-0">
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex, rehypeSlugNoEmoji]}
            components={{
              // 이미지를 포함한 단락은 <p> 없이 내보냄 — <p> 안에 block 요소(<figure>) 금지 때문
              // remarkBreaks로 <br>이 끼어있어도 img가 하나라도 있으면 해당
              p: ({ children, node }) => {
                const hasImage = node?.children?.some(
                  (child) => (child as { type?: string; tagName?: string }).type === "element" &&
                             (child as { type?: string; tagName?: string }).tagName === "img"
                );
                if (hasImage) return <>{children}</>;
                return <p>{children}</p>;
              },
              img: ({ src, alt }) => (
                <figure className="my-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={alt ?? ""} className="w-full" />
                  {alt && (
                    <figcaption className="text-center text-[12px] text-muted mt-2 font-sans">
                      {alt}
                    </figcaption>
                  )}
                </figure>
              ),
              code: (props) => <CodeBlock {...props} />,
              iframe: ({ ...props }) => (
                <iframe {...props} className="notion-embed my-4 w-full h-[600px]" />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {headings.length > 0 && (
        <aside className="w-[140px] shrink-0 hidden xl:block">
          <div className="sticky top-24">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      )}
    </div>
  );
}
