// 태그 필터 사이드바 — URL 쿼리(?tag=)로 상태 관리
// 같은 태그 재클릭 시 필터 해제, SidebarLayout 안에서 사용
"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Tag {
  name: string;
  count: number;
}

interface TagSidebarProps {
  tags: Tag[];
}

export default function TagSidebar({ tags }: TagSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  function handleTagClick(tagName: string) {
    if (activeTag === tagName) {
      // 같은 태그 다시 클릭 시 필터 해제
      router.push("/");
    } else {
      router.push(`/?tag=${encodeURIComponent(tagName)}`);
    }
  }

  return (
    <aside>
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
          Tags
        </h2>
        <ul className="space-y-1">
          {tags.map(({ name, count }) => {
            const isActive = activeTag === name;
            return (
              <li key={name}>
                <button
                  onClick={() => handleTagClick(name)}
                  className={`w-full text-left flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span>{name}</span>
                  <span className={`text-xs ${isActive ? "text-gray-300 dark:text-gray-600" : "text-gray-400 dark:text-gray-600"}`}>
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
