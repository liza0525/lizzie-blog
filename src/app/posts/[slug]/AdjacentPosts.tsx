// 이전/다음 글 네비게이션 서버 컴포넌트
// page.tsx의 Suspense 안에서 렌더링 — 본문 스트리밍과 독립적으로 로드

import React from "react";
import Link from "next/link";
import { getAdjacentPosts } from "@/lib/services/post.service";
import type { Post } from "@/types";

interface AdjacentPostsProps {
  slug: string;
}

export default async function AdjacentPosts({ slug }: AdjacentPostsProps): Promise<React.JSX.Element | null> {
  const { prev, next } = await getAdjacentPosts(slug);

  if (!prev && !next) return null;

  return (
    <nav className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-4">
      <div>
        <AdjacentLink post={prev} slug={prev?.slug} direction="prev" label="이전 글" />
      </div>
      <div className="flex flex-col items-end text-right">
        <AdjacentLink post={next} slug={next?.slug} direction="next" label="다음 글" />
      </div>
    </nav>
  );
}

function AdjacentLink({
  post,
  slug,
  direction,
  label,
}: {
  post: Post | null;
  slug: string | undefined;
  direction: "prev" | "next";
  label: string;
}): React.JSX.Element | null {
  if (!post || !slug) return null;

  const isPrev = direction === "prev";
  return (
    <Link
      href={`/posts/${encodeURIComponent(slug)}`}
      className={`group flex flex-col gap-1${isPrev ? "" : " items-end text-right"}`}
    >
      <span className="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1">
        {isPrev && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        )}
        {label}
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
