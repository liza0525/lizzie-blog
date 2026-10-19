// 시리즈 상세 페이지 — 한 시리즈의 글을 1편부터 순서대로 나열
// URL은 시리즈 이름 기반(/series/<이름>) — 추후 별도 Series DB로 옮겨도 slug를 이름과 같게 두면 링크 유지

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSeries, getSeries } from "@/lib/services/post.service";
import FormattedDate from "@/components/FormattedDate";

// revalidate/ISR 미사용 — 글 상세(posts/[slug])와 같은 이유: 한글 경로가 x-next-cache-tags 헤더 오류를 유발
// 데이터 캐싱은 post.service의 unstable_cache("post" 태그)로 처리

// 시리즈 페이지는 본문 블록을 긁지 않아 Notion rate limit 부담이 없으므로 전부 빌드 시 생성
export async function generateStaticParams(): Promise<{ name: string }[]> {
  const allSeries = await getAllSeries();
  return allSeries.map((s) => ({ name: s.name }));
}

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  const series = await getSeries(decodeURIComponent(name));
  if (!series) return {};
  return { title: `${series.name} 시리즈` };
}

export default async function SeriesDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { name } = await params;
  const series = await getSeries(decodeURIComponent(name));

  if (!series) notFound();

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <Link
        href="/series"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-10 font-sans"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        시리즈 목록
      </Link>

      <header className="mb-8">
        <p className="text-xs font-semibold text-muted mb-2 font-sans">시리즈</p>
        <h1 className="text-[26px] font-bold leading-snug text-ink mb-2">{series.name}</h1>
        <p className="text-sm text-subtle tabular-nums font-sans">{series.posts.length}편</p>
      </header>

      <ol className="divide-y divide-border">
        {series.posts.map((post, i) => (
          <li key={post.id}>
            <Link
              href={`/posts/${encodeURIComponent(post.slug)}`}
              className="group flex items-start gap-4 -mx-4 px-4 py-5 hover:bg-surface transition-colors"
            >
              <span className="shrink-0 w-6 text-[18px] font-semibold text-subtle tabular-nums leading-snug">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="text-[18px] font-semibold text-ink leading-snug mb-1.5 line-clamp-2 group-hover:text-accent transition-colors">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="text-[15px] leading-[1.7] text-muted mb-1.5 line-clamp-2">
                    {post.description}
                  </p>
                )}
                <FormattedDate date={post.publishedAt} className="block text-xs text-subtle tabular-nums font-sans" />
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
