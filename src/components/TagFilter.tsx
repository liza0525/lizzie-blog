// 홈 화면 수평 태그 필터 바
// 글 있는 코어 태그만 기본 노출, "더 보기"로 나머지 태그 펼침
// activeTag가 비코어 태그일 때는 자동으로 전체 목록 노출
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CORE_TAGS } from "@/lib/config";
import type React from "react";

interface Tag {
  name: string;
  count: number;
}

interface TagFilterProps {
  tags: Tag[];
}

export default function TagFilter({ tags }: TagFilterProps): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");
  const [expanded, setExpanded] = useState(false);

  const tagNameSet = new Set(tags.map((t) => t.name));

  const coreTags = (CORE_TAGS as readonly string[]).filter((t) => tagNameSet.has(t));
  const otherTags = tags.filter((t) => !(CORE_TAGS as readonly string[]).includes(t.name));

  // activeTag가 비코어 태그면 자동 펼침
  const isActiveNonCore = !!activeTag && !(CORE_TAGS as readonly string[]).includes(activeTag);
  const showOtherTags = expanded || isActiveNonCore;

  function handleClick(name: string): void {
    router.push(activeTag === name ? "/" : `/?tag=${encodeURIComponent(name)}`);
  }

  function itemClass(name: string): string {
    return `text-sm font-sans transition-colors px-3 py-1 ${
      activeTag === name
        ? "bg-accent text-bg font-semibold"
        : "text-muted hover:text-ink hover:bg-surface"
    }`;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-8">
      <button
        onClick={() => router.push("/")}
        className={`text-sm font-sans transition-colors px-3 py-1 ${
          !activeTag
            ? "bg-accent text-bg font-semibold"
            : "text-muted hover:text-ink hover:bg-surface"
        }`}
      >
        전체
      </button>

      {coreTags.map((name) => (
        <button key={name} onClick={() => handleClick(name)} className={itemClass(name)}>
          {name}
        </button>
      ))}

      {showOtherTags &&
        otherTags.map(({ name }) => (
          <button key={name} onClick={() => handleClick(name)} className={itemClass(name)}>
            {name}
          </button>
        ))}

      {otherTags.length > 0 && !isActiveNonCore && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-sm text-muted hover:text-ink font-sans transition-colors px-2 py-1"
        >
          {expanded ? "접기 ↑" : `+${otherTags.length} 더 보기`}
        </button>
      )}
    </div>
  );
}
