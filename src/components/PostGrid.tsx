// 포스트 카드 그리드 — 무한 스크롤 지원
// IntersectionObserver로 스크롤 바닥 감지 → /api/posts로 다음 페이지 fetch
// 태그 필터/검색어 변경 시 자동으로 처음부터 다시 로드
// lang prop을 받아 API 호출 시 전달하고 빈 상태 메시지를 i18n으로 처리
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Post, PostListPage } from "@/types";
import HighlightText from "@/components/HighlightText";
import FormattedDate from "@/components/FormattedDate";
import type { Lang } from "@/lib/i18n";
import { dict } from "@/lib/i18n";

interface PostGridProps {
  initialPosts: Post[];
  initialCursor: string | null;
  initialHasMore: boolean;
  tag?: string;
  query?: string;
  lang: Lang;
}

function getCardImage(post: Post): string {
  if (post.coverImage) return post.coverImage;
  return `https://picsum.photos/seed/${encodeURIComponent(post.id)}/800/450`;
}

export default function PostGrid({
  initialPosts,
  initialCursor,
  initialHasMore,
  tag,
  query,
  lang,
}: PostGridProps): React.JSX.Element {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 필터 변경 시 초기 상태로 리셋
  useEffect(() => {
    setPosts(initialPosts);
    setCursor(initialCursor);
    setHasMore(initialHasMore);
  }, [initialPosts, initialCursor, initialHasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0].isIntersecting || loading || !hasMore) return;

        setLoading(true);
        const params = new URLSearchParams({
          ...(cursor ? { cursor } : {}),
          ...(tag ? { tag } : {}),
          lang,
        });
        const res = await fetch(`/api/posts?${params}`);
        const data: PostListPage = await res.json();

        setPosts((prev) => [...prev, ...data.posts]);
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
        setLoading(false);
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cursor, hasMore, loading, tag, lang]);

  const t = dict[lang];

  if (posts.length === 0) {
    return (
      <p className="text-center text-gray-400 py-24">
        {query
          ? t.noResults(query)
          : tag
          ? t.noTagResults(tag)
          : t.noPosts}
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${encodeURIComponent(post.slug)}`}
            prefetch={false}
            className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-gray-950 transition-shadow duration-200"
          >
            <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getCardImage(post)}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="p-5">
              {post.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h2 className="font-bold text-gray-900 dark:text-white text-base leading-snug mb-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors line-clamp-2">
                <HighlightText text={post.title} query={query ?? ""} />
              </h2>

              {post.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
                  {post.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-auto">
                <FormattedDate date={post.publishedAt} className="text-xs text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 스크롤 감지 sentinel */}
      <div ref={sentinelRef} className="h-10 mt-6 flex items-center justify-center">
        {loading && <span className="text-sm text-gray-400">{t.loading}</span>}
      </div>
    </>
  );
}
