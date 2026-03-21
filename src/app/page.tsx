// 홈 페이지 — 글 카드 목록
// ISR: 1시간마다 재생성 (CLAUDE.md 참고)

import React from "react";
import Link from "next/link";
import { getPostList } from "@/lib/services/post.service";
import type { Post } from "@/types";

export const revalidate = 3600;

// coverImage가 없을 때 post id 기반으로 일관된 랜덤 이미지 반환
function getCardImage(post: Post): string {
  if (post.coverImage) return post.coverImage;
  const seed = encodeURIComponent(post.id);
  return `https://picsum.photos/seed/${seed}/800/450`;
}

export default async function HomePage(): Promise<React.JSX.Element> {
  const posts = await getPostList();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: Post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-gray-950 transition-shadow duration-200"
          >
            {/* 커버 이미지 */}
            <div className="aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getCardImage(post)}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* 카드 본문 */}
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
                {post.title}
              </h2>

              {post.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
                  {post.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-400 dark:text-gray-500">{post.publishedAt}</span>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  Read →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-gray-400 py-24">아직 게시된 글이 없습니다.</p>
      )}
    </div>
  );
}
