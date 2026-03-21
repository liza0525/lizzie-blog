// 글 상세 페이지
// ISR: 2시간마다 재생성 (CLAUDE.md 참고)

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import { getPostDetail, getAllSlugs } from "@/lib/services/post.service";
import { extractHeadings } from "@/lib/toc";
import CodeBlock from "@/components/CodeBlock";
import TableOfContents from "@/components/TableOfContents";

export const revalidate = 7200;

// 빌드 시 정적 경로 생성 (SSG)
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug: encodeURIComponent(slug) }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const post = await getPostDetail(decodeURIComponent(slug));

  if (!post) notFound();

  const headings = extractHeadings(post.content);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">
        {/* 본문 영역 */}
        <article className="flex-1 min-w-0">
          {/* 뒤로가기 */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            목록으로
          </Link>

          {/* 헤더 */}
          <header className="mb-10">
            {post.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-3xl font-bold leading-snug text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>
            {post.description && (
              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                {post.description}
              </p>
            )}
            <p className="text-sm text-gray-400 dark:text-gray-500">{post.publishedAt}</p>
          </header>

          {/* 커버 이미지 */}
          <div className="rounded-xl overflow-hidden mb-12 aspect-[12/5] bg-gray-100 dark:bg-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage ?? `https://picsum.photos/seed/${encodeURIComponent(post.id)}/1200/500`}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 본문 */}
          <div className="prose prose-gray dark:prose-invert prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeKatex, rehypeSlug]}
              components={{
                img: ({ src, alt }) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={alt ?? ""} className="rounded-lg w-full" />
                ),
                code: (props) => <CodeBlock {...props} />,
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* 우측 TOC */}
        <aside className="w-56 shrink-0 hidden xl:block">
          <div className="sticky top-24">
            <TableOfContents headings={headings} />
          </div>
        </aside>
    </div>
  );
}
