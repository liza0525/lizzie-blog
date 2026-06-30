// 포스트 리스트 — 무한 스크롤 지원
// IntersectionObserver로 스크롤 바닥 감지 → /api/posts로 다음 페이지 fetch
// 태그 필터/검색어 변경 시 자동으로 처음부터 다시 로드
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Post, PostListPage } from "@/types";
import HighlightText from "@/components/HighlightText";
import FormattedDate from "@/components/FormattedDate";
import { CORE_TAGS } from "@/lib/config";

interface PostGridProps {
  initialPosts: Post[];
  initialCursor: string | null;
  initialHasMore: boolean;
  tag?: string;
  query?: string;
}

export default function PostGrid({
  initialPosts,
  initialCursor,
  initialHasMore,
  tag,
  query,
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
  }, [cursor, hasMore, loading, tag]);

  if (posts.length === 0) {
    return (
      <p className="text-center text-muted py-24">
        {query
          ? `"${query}"에 대한 검색 결과가 없습니다.`
          : tag
          ? `"${tag}" 태그의 글이 없습니다.`
          : "아직 게시된 글이 없습니다."}
      </p>
    );
  }

  return (
    <>
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${encodeURIComponent(post.slug)}`}
            prefetch={false}
            className="group flex items-start gap-5 py-5 -mx-4 px-4 hover:bg-surface transition-colors"
          >
            {/* 텍스트 영역 */}
            <div className="flex-1 min-w-0">
              <time className="block text-[11px] font-semibold tracking-[0.08em] text-muted uppercase mb-1.5 font-sans">
                <FormattedDate date={post.publishedAt} />
              </time>
              <h2 className="text-[18px] font-semibold text-ink leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                <HighlightText text={post.title} query={query ?? ""} />
              </h2>
              {post.description && (
                <p className="text-[15px] leading-[1.7] text-ink opacity-75 mb-2.5 line-clamp-2 font-serif">
                  {post.description}
                </p>
              )}
              {post.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {post.tags.map((tagName) => (
                    <span
                      key={tagName}
                      className={`text-xs font-semibold text-bg px-[10px] py-[3px] rounded-[2px] font-sans ${
                        (CORE_TAGS as readonly string[]).includes(tagName) ? "bg-accent2" : "bg-accent"
                      }`}
                    >
                      {tagName}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {/* 썸네일 — cover 이미지가 있을 때만 표시 */}
            {post.coverImage && (
              <div className="shrink-0 w-24 h-[72px] border border-border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* 스크롤 감지 sentinel */}
      <div ref={sentinelRef} className="h-10 mt-4 flex items-center justify-center">
        {loading && <span className="text-sm text-muted">불러오는 중...</span>}
      </div>
    </>
  );
}
