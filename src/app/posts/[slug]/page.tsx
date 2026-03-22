// 글 상세 페이지
// ISR: 2시간마다 재생성 (CLAUDE.md 참고)
// 메타데이터(제목/태그/커버)는 즉시 렌더링, 본문은 Suspense로 스트리밍

import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getAllSlugs } from "@/lib/services/post.service";
import PostContent from "./PostContent";
import FormattedDate from "@/components/FormattedDate";

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
  const decodedSlug = decodeURIComponent(slug);
  const post = await getPost(decodedSlug);

  if (!post) notFound();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <article>
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

        {/* 헤더 — 메타데이터만 사용하므로 즉시 렌더링 */}
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
          <FormattedDate date={post.publishedAt} className="text-sm text-gray-400 dark:text-gray-500" />
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

        {/* 본문 + TOC + 이전/다음 — 느린 fetch를 기다리는 동안 스켈레톤 표시 */}
        <Suspense fallback={<ContentSkeleton />}>
          <PostContent pageId={post.id} slug={decodedSlug} />
        </Suspense>
      </article>
    </div>
  );
}

// 본문 영역 대기 중 스켈레톤
function ContentSkeleton(): React.JSX.Element {
  return (
    <div className="flex gap-12 animate-pulse">
      <div className="flex-1 min-w-0 space-y-3">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
              i % 5 === 0 ? "h-6 w-2/5" : i % 4 === 3 ? "w-3/4" : "w-full"
            }`}
          />
        ))}
      </div>
      <div className="w-56 shrink-0 hidden xl:flex xl:flex-col gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`h-3 bg-gray-200 dark:bg-gray-700 rounded ${i % 3 === 0 ? "w-4/5" : "w-3/5"}`} />
        ))}
      </div>
    </div>
  );
}
