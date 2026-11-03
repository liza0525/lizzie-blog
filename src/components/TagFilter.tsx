// 홈 화면 수평 태그 필터 바
// 글 있는 코어 태그만 기본 노출, "더 보기"로 나머지 태그를 구분선 아래 둘째 줄에 펼침 (아래로 펼쳐지고 위로 접히는 collapse 애니메이션)
// 비코어 태그가 선택된 채로 진입하면 펼친 상태로 시작, 접으면 선택된 태그만 첫 줄에 남겨 선택이 보이게 함
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

  const tagNameSet = new Set(tags.map((t) => t.name));

  const coreTags = CORE_TAGS.filter((t) => tagNameSet.has(t));
  const otherTags = tags.filter((t) => !CORE_TAGS.includes(t.name));

  const isActiveNonCore = !!activeTag && !CORE_TAGS.includes(activeTag);
  // 비코어 태그가 선택된 URL로 처음 들어오면 펼친 상태로 시작 (초기값만 — 이후엔 사용자가 접고 펼 수 있음)
  // 홈 안에서 태그를 눌러 이동할 땐 컴포넌트가 유지되므로 펼침 상태도 그대로 유지됨
  const [expanded, setExpanded] = useState(isActiveNonCore);

  // 접힌 상태에서 비코어 태그가 선택돼 있으면 그 태그만 첫 줄에 남김 — 선택이 화면에서 사라지지 않게
  const pinnedActiveTag = !expanded && isActiveNonCore ? activeTag : null;
  const hiddenCount = otherTags.length - (pinnedActiveTag ? 1 : 0);

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

        {pinnedActiveTag && (
          <button onClick={() => handleClick(pinnedActiveTag)} className={itemClass(pinnedActiveTag)}>
            {pinnedActiveTag}
          </button>
        )}

        {otherTags.length > 0 && (
          <button
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-controls={OTHER_TAGS_ID}
            className="flex items-center gap-1 text-sm text-muted hover:text-ink font-sans transition-colors px-2 py-1"
          >
            {expanded ? "접기" : `+${hiddenCount} 더 보기`}
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
              className={`transition-transform duration-(--motion-base) ease-motion motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* 2줄: 나머지 태그 — 구분선 아래 별도 줄로 펼침 (아래로 펼쳐지고 위로 접히는 collapse 애니메이션)
          height: auto는 transition이 안 돼서, grid 행 높이를 0fr ↔ 1fr로 바꾸는 방식을 씀
          → 태그 개수·화면 폭에 따라 줄 높이가 달라져도 높이를 재지 않고 자연스럽게 열고 닫힘
          접기 애니메이션이 보이려면 접힌 상태에서도 렌더링돼 있어야 하므로, 대신 inert로 포커스·클릭·스크린리더에서 제외 */}
      {otherTags.length > 0 && (
        <div
          id={OTHER_TAGS_ID}
          inert={!expanded}
          className={`grid transition-[grid-template-rows,opacity] duration-(--motion-base) ease-motion ${
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          {/* 여백·구분선까지 안쪽에 둬야 접혔을 때 높이 0으로 완전히 사라짐 (min-h-0: grid 자식이 내용 높이 밑으로 줄어들 수 있게) */}
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-border">
              {otherTags.map(({ name }) => (
                <button key={name} onClick={() => handleClick(name)} className={itemClass(name)}>
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
