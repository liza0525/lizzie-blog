// 글 상세 페이지
// ISR: 2시간마다 재생성 (CLAUDE.md 참고)
// 메타데이터(제목/태그/커버)는 서버에서 즉시 렌더링
// 본문은 PostContent(client)가 스트리밍 API에서 받아 점진적으로 렌더링
// 시리즈 글이면 제목 위 한 줄 표시 + 네비게이터 시리즈 섹션 + 하단 시리즈 카드를 함께 렌더링

import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPost, getAllSlugs, getSeriesPosition } from "@/lib/services/post.service";
import { CORE_TAGS } from "@/lib/config";
import PostContent from "./PostContent";
import AdjacentPosts from "./AdjacentPosts";
import SeriesPager from "@/components/SeriesPager";
import BackToListLink from "@/components/BackToListLink";
import FormattedDate from "@/components/FormattedDate";
import GiscusComments from "@/components/GiscusComments";

// revalidate/ISR 미사용 — 한글 slug가 x-next-cache-tags 헤더 오류를 유발
// 데이터 캐싱은 post.service의 unstable_cache로 처리

// 빌드 시 정적 경로 생성 (SSG)
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 글별 동적 메타데이터 생성 — title, description, OG, Twitter card
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(decodeURIComponent(slug));
  if (!post) return {};

  const ogImage = post.coverImage
    ? { url: post.coverImage, width: 1200, height: 500, alt: post.title }
    : undefined;

  return {
    title: post.title,
    description: post.description || undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description || undefined,
      publishedTime: post.publishedAt,
      tags: post.tags,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description || undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  // 시리즈 위치는 헤더에 바로 쓰이므로 Suspense로 미루지 않고 글 메타데이터와 병렬 조회 (둘 다 캐싱됨)
  const [post, series] = await Promise.all([
    getPost(decodedSlug),
    getSeriesPosition(decodedSlug),
  ]);

  if (!post) notFound();

  const isNote = post.type === "note";

  const header = (
    <header className={isNote ? "mb-6" : "mb-10"}>
      {/* 시리즈 표시 — 사이드바는 xl 이상에서만 보이므로 작은 화면에서도 시리즈 글임을 알 수 있게 제목 위에 한 줄로 */}
      {series && (
        <p className="flex items-baseline gap-2 text-sm mb-2 font-sans">
          <span className="text-xs font-semibold text-muted shrink-0">시리즈</span>
          <Link
            href={`/series/${encodeURIComponent(series.series.name)}`}
            className="font-semibold text-ink hover:text-accent transition-colors truncate"
          >
            {series.series.name}
          </Link>
          <span className="text-xs text-subtle tabular-nums shrink-0">
            {series.index + 1}/{series.series.posts.length}
          </span>
        </p>
      )}
      <h1
        className={`leading-snug text-ink font-sans ${
          isNote ? "text-[16px] font-medium mb-2" : "text-[26px] font-bold mb-3"
        }`}
      >
        {post.title}
      </h1>
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <FormattedDate date={post.publishedAt} className="text-xs text-subtle tabular-nums font-sans" />
        {post.tags.map((tag) => (
          <span
            key={tag}
            className={`text-xs font-semibold px-2 py-px border rounded-box font-sans ${
              (CORE_TAGS as readonly string[]).includes(tag)
                ? "bg-accent-soft border-transparent text-on-accent-soft"
                : "border-border text-muted"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>
      {post.description && (
        <p className={`text-muted leading-relaxed ${isNote ? "text-[15px]" : "text-lg"}`}>
          {post.description}
        </p>
      )}
    </header>
  );

  const body = (
    <div>
      <PostContent pageId={post.id} type={post.type} series={series} />
      {series && <SeriesPager position={series} />}
      <Suspense fallback={null}>
        <AdjacentPosts slug={decodedSlug} />
      </Suspense>
      <GiscusComments />
    </div>
  );

  // note는 어떻게 진입하든(직접 링크·새로고침·리스트 클릭) 항상 같은 모양으로 렌더링
  // 클라이언트 라우팅 상태에 기대지 않아서 직접 링크 접속 시에도 동일하게 보임
  // backdrop/dimming 없이, 페이지 배경 위에 좁은 카드만 떠 있는 형태
  if (isNote) {
    return (
      <div className="min-h-full flex items-start justify-center px-4 py-10 sm:py-16">
        <article className="relative w-full max-w-2xl bg-bg border border-border shadow-sm px-6 py-8 sm:px-8">
          <Link
            href="/"
            aria-label="닫기"
            className="absolute top-4 right-4 text-muted hover:text-ink transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </Link>
          {header}
          {body}
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <article>
        {/* 처음 들어온 목록으로 돌아가기 (전체 글 목록 / 시리즈 목록) */}
        <BackToListLink />

        {header}

        {/* 커버 이미지 */}
        {post.coverImage && (
          <div className="overflow-hidden mb-12 aspect-[12/5] bg-surface border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {body}
      </article>
    </div>
  );
}
