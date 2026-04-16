// 글 상세 페이지
// ISR: 2시간마다 재생성 (CLAUDE.md 참고)
// 메타데이터(제목/태그/커버)는 서버에서 즉시 렌더링
// 본문은 PostContent(client)가 스트리밍 API에서 받아 점진적으로 렌더링

import React, { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPost, getAllSlugs } from "@/lib/services/post.service";
import PostContent from "./PostContent";
import AdjacentPosts from "./AdjacentPosts";
import FormattedDate from "@/components/FormattedDate";
import ShareSidebar from "@/components/ShareSidebar";
import GiscusComments from "@/components/GiscusComments";
import { getLang, dict } from "@/lib/i18n";
import { translatePostsMeta } from "@/lib/services/translation.service";

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
  const post = await getPost(decodedSlug);

  if (!post) notFound();

  const cookieStore = await cookies();
  const lang = getLang(cookieStore.get("lang")?.value);
  const t = dict[lang];

  // 영어면 포스트 제목/설명 번역 (목록 페이지와 동일한 캐시 사용)
  const displayPost = lang === "en"
    ? (await translatePostsMeta([post]))[0]
    : post;

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
          {t.backToList}
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
            {displayPost.title}
          </h1>
          {displayPost.description && (
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              {displayPost.description}
            </p>
          )}
          <FormattedDate date={post.publishedAt} className="text-sm text-gray-400 dark:text-gray-500 mt-4 block" />
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

        {/* 본문 영역 — relative로 감싸서 사이드바를 absolute로 바깥에 띄움 */}
        <div className="relative">
          {/* 공유 사이드바 — 모바일: 화면 왼쪽 하단 고정 */}
          <div className="xl:hidden fixed bottom-24 left-6">
            <ShareSidebar title={post.title} />
          </div>

          {/* 공유 사이드바 — 데스크톱: 본문 왼쪽 바깥, 항상 화면 하단에 위치 */}
          <div className="hidden xl:block absolute right-full top-0 h-full pr-20">
            <div className="sticky top-[calc(100vh-12rem)]">
              <ShareSidebar title={post.title} />
            </div>
          </div>

          <PostContent pageId={post.id} />
          <Suspense fallback={null}>
            <AdjacentPosts slug={decodedSlug} />
          </Suspense>
          <GiscusComments />
        </div>
      </article>
    </div>
  );
}
