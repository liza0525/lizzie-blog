// 홈 화면 수평 태그 필터 바
// 글 있는 코어 태그만 기본 노출, "더 보기"로 나머지 태그를 구분선 아래 둘째 줄에 펼침
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

// 토글 버튼(aria-controls)과 펼쳐지는 둘째 줄을 연결하는 id
const OTHER_TAGS_ID = "tag-filter-others";

export default function TagFilter({ tags }: TagFilterProps): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");
  const [expanded, setExpanded] = useState(false);

  const tagNameSet = new Set(tags.map((t) => t.name));

  const coreTags = CORE_TAGS.filter((t) => tagNameSet.has(t));
  const otherTags = tags.filter((t) => !CORE_TAGS.includes(t.name));

  // activeTag가 비코어 태그면 자동 펼침
  const isActiveNonCore = !!activeTag && !CORE_TAGS.includes(activeTag);
  const showOtherTags = expanded || isActiveNonCore;

  function handleClick(name: string): void {
    router.push(activeTag === name ? "/" : `/?tag=${encodeURIComponent(name)}`);
  }

  function itemClass(name: string): string {
    return `text-sm font-sans transition-colors px-3 py-1 border-b-2 ${
      activeTag === name
        ? "text-ink font-semibold border-accent"
        : "text-muted hover:text-ink border-transparent"
    }`;
  }

  return (
    <div className="mb-8">
      {/* 1줄: 전체 + 코어 태그 + 토글 — 토글이 항상 코어 태그 바로 뒤에 있어 펼쳐도 위치가 바뀌지 않음 */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => router.push("/")}
          className={`text-sm font-sans transition-colors px-3 py-1 border-b-2 ${
            !activeTag
              ? "text-ink font-semibold border-accent"
              : "text-muted hover:text-ink border-transparent"
          }`}
        >
          전체
        </button>

        {coreTags.map((name) => (
          <button key={name} onClick={() => handleClick(name)} className={itemClass(name)}>
            {name}
          </button>
        ))}

        {/* 비코어 태그가 선택된 상태에선 접으면 선택 태그가 사라지므로 토글을 숨김 */}
        {otherTags.length > 0 && !isActiveNonCore && (
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-controls={OTHER_TAGS_ID}
            className="flex items-center gap-1 text-sm text-muted hover:text-ink font-sans transition-colors px-2 py-1"
          >
            {expanded ? "접기" : `+${otherTags.length} 더 보기`}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className={`transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* 2줄: 나머지 태그 — 구분선 아래 별도 줄로 펼침 */}
      {showOtherTags && (
        <div
          id={OTHER_TAGS_ID}
          className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-border"
        >
          {otherTags.map(({ name }) => (
            <button key={name} onClick={() => handleClick(name)} className={itemClass(name)}>
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
