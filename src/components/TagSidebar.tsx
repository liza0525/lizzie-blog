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
      router.push("/");
    } else {
      router.push(`/?tag=${encodeURIComponent(tagName)}`);
    }
  }

  return (
    <aside>
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted mb-4 font-sans">
          Tags
        </h2>
        <ul className="space-y-1">
          {tags.map(({ name, count }) => {
            const isActive = activeTag === name;
            return (
              <li key={name}>
                <button
                  onClick={() => handleTagClick(name)}
                  className={`w-full text-left flex items-center justify-between px-3 py-1.5 text-sm transition-colors font-sans ${
                    isActive
                      ? "bg-accent text-bg font-semibold"
                      : "text-ink hover:bg-surface"
                  }`}
                >
                  <span>{name}</span>
                  <span className={`text-xs ${isActive ? "text-bg opacity-60" : "text-muted"}`}>
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
