// 홈 상단 note 하이라이트 — essay 리스트와 별도 섹션
// 지금은 최소 기능만: 가로 스크롤 카드. 최종 디자인은 추후 결정
import Link from "next/link";
import type React from "react";
import type { Post } from "@/types";
import FormattedDate from "@/components/FormattedDate";

interface NoteHighlightsProps {
  notes: Post[];
}

export default function NoteHighlights({ notes }: NoteHighlightsProps): React.JSX.Element | null {
  if (notes.length === 0) return null;

  return (
    <div className="mb-10 -mx-6 px-6 sm:mx-0 sm:px-0">
      <h2 className="text-xs font-semibold tracking-[0.08em] text-muted uppercase mb-3 font-sans">
        노트
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/posts/${encodeURIComponent(note.slug)}`}
            prefetch={false}
            className="shrink-0 w-56 border border-border bg-surface px-4 py-3 hover:border-accent transition-colors"
          >
            <FormattedDate
              date={note.publishedAt}
              className="block text-[10px] font-semibold tracking-[0.08em] text-muted uppercase mb-1 font-sans"
            />
            <p className="text-[14px] font-medium text-ink leading-snug line-clamp-2">
              {note.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
