// 포스트 본문 + TOC 서버 컴포넌트
// page.tsx의 Suspense 안에서 렌더링 — 캐시 히트 시 거의 즉시, 미스 시 Notion API fetch
// getPostContent는 unstable_cache로 래핑되어 있어 두 번째 요청부터는 즉시 반환

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { getPostContent } from "@/lib/services/post.service";
import { extractHeadings, rehypeSlugNoEmoji } from "@/lib/toc";
import CodeBlock from "@/components/CodeBlock";
import TableOfContents from "@/components/TableOfContents";

interface PostContentProps {
  pageId: string;
}

export default async function PostContent({ pageId }: PostContentProps): Promise<React.JSX.Element> {
  const content = await getPostContent(pageId);
  const headings = extractHeadings(content);

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
                  {alt && <figcaption className="text-center text-sm text-gray-400 dark:text-gray-500 mt-2">{alt}</figcaption>}
                </figure>
              ),
              code: (props) => <CodeBlock {...props} />,
              // notion embed iframe — prose 스타일 override로 비율 유지
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
