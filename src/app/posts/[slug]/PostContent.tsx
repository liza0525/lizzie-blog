// 포스트 본문 + 이전/다음 네비게이션 + TOC를 담당하는 서버 컴포넌트
// page.tsx의 Suspense 안에서 렌더링 — 본문 fetch 완료 후에 표시됨
// getPostContent와 getAdjacentPosts를 Promise.all로 병렬 요청

import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { getPostContent, getAdjacentPosts } from "@/lib/services/post.service";
import { extractHeadings, rehypeSlugNoEmoji } from "@/lib/toc";
import CodeBlock from "@/components/CodeBlock";
import TableOfContents from "@/components/TableOfContents";
import type { Post } from "@/types";

interface PostContentProps {
  pageId: string;
  slug: string;
}

export default async function PostContent({ pageId, slug }: PostContentProps): Promise<React.JSX.Element> {
  const [content, { prev, next }] = await Promise.all([
    getPostContent(pageId),
    getAdjacentPosts(slug),
  ]);

  const headings = extractHeadings(content);

  return (
    <div className="flex gap-12">
      {/* 본문 + 네비게이션 */}
      <div className="flex-1 min-w-0">
        <div className="prose prose-gray dark:prose-invert prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex, rehypeSlugNoEmoji]}
            components={{
              img: ({ src, alt }) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={alt ?? ""} className="rounded-lg w-full" />
              ),
              code: (props) => <CodeBlock {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* 이전/다음 글 네비게이션 */}
        {(prev || next) && (
          <nav className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
            <AdjacentLink post={prev} direction="prev" />
            <div className="flex flex-col items-end text-right">
              <AdjacentLink post={next} direction="next" />
            </div>
          </nav>
        )}
      </div>

      {/* 우측 TOC */}
      <aside className="w-56 shrink-0 hidden xl:block">
        <div className="sticky top-24">
          <TableOfContents headings={headings} />
        </div>
      </aside>
    </div>
  );
}

function AdjacentLink({ post, direction }: { post: Post | null; direction: "prev" | "next" }): React.JSX.Element | null {
  if (!post) return null;

  const isPrev = direction === "prev";
  return (
    <Link href={`/posts/${encodeURIComponent(post.slug)}`} className="group flex flex-col gap-1">
      <span className="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1">
        {isPrev && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        )}
        {isPrev ? "이전 글" : "다음 글"}
        {!isPrev && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        )}
      </span>
      <span className="text-base font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors line-clamp-2">
        {post.title}
      </span>
    </Link>
  );
}
