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
import TocBottomSheet from "@/components/TocBottomSheet";
import type { PostType } from "@/types";

interface PostContentClientProps {
  content: string;
  headings: Heading[];
  pageId: string;
  type: PostType;
}

export default function PostContentClient({
  content,
  headings,
  pageId: _pageId,
  type,
}: PostContentClientProps): React.JSX.Element {
  const isNote = type === "note";
  // 데스크톱 사이드바와 모바일 바텀시트가 동일 조건을 공유 — 조건 중복 방지
  const showToc = !isNote && headings.length > 0;

  return (
    <div className={isNote ? "" : "flex gap-12"}>
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
              // Notion API는 에디터에서 조절한 표시 폭을 주지 않으므로 이미지의 원본 픽셀 크기를 기준으로 렌더
              // max-w-full + h-auto — 본문 폭을 넘을 때만 비율 유지한 채 축소 (모바일 대응)
              img: ({ src, alt }) => (
                <figure className="my-0 flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={alt ?? ""} className="max-w-full h-auto" />
                  {alt && (
                    <figcaption className="text-center text-[12px] text-muted mt-2 font-sans">
                      {alt}
                    </figcaption>
                  )}
                </figure>
              ),
              code: (props) => <CodeBlock {...props} />,
              // GFM 표는 셀 내용에 따라 폭이 넓어질 수 있어 전용 가로 스크롤 컨테이너로 감쌈
              // 표 자체 마진은 globals.css에서 0으로 리셋하고 이 래퍼(my-8)가 세로 여백을 담당
              // (overflow-x-auto가 새 BFC를 만들어 표 마진이 밖으로 못 나가 이중 여백 생기는 것 방지)
              table: ({ children }) => (
                <div className="my-8 overflow-x-auto">
                  <table>{children}</table>
                </div>
              ),
              iframe: ({ ...props }) => (
                <iframe {...props} className="notion-embed my-4 w-full h-[600px]" />
              ),
              // 본문 내 모든 링크는 새 탭에서 열림 — 다른 글로 이동해도 읽던 글 유지
              // break-words: 북마크/파일 등이 [텍스트](url) 링크로 렌더될 때 긴 URL/제목이
              // 하이픈 없이 이어져도 페이지 폭을 넘기지 않고 줄바꿈되도록 함
              a: ({ children, ...props }) => (
                <a {...props} target="_blank" rel="noopener noreferrer" className="break-words">
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {showToc && (
        <aside className="w-[140px] shrink-0 hidden xl:block">
          <div className="sticky top-24">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      )}

      {showToc && <TocBottomSheet headings={headings} />}
    </div>
  );
}
