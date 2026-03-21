// 글 상세 페이지
// ISR: 2시간마다 재생성 (CLAUDE.md 참고)

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { getPostDetail, getAllSlugs } from "@/lib/services/post.service";

export const revalidate = 7200;

// 빌드 시 정적 경로 생성 (SSG)
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const post = await getPostDetail(slug);

  if (!post) notFound();

  const coverSrc =
    post.coverImage ?? `https://picsum.photos/seed/${encodeURIComponent(post.id)}/1200/500`;

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-10"
      >
        ← 목록으로
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
        <img src={coverSrc} alt={post.title} className="w-full h-full object-cover" />
      </div>

      {/* 본문 */}
      <div className="prose prose-gray dark:prose-invert prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeRaw, rehypeKatex]}
          components={{
            img: ({ src, alt }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt ?? ""} className="rounded-lg w-full" />
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
