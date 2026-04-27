// 포스트 본문 서버 컴포넌트 (thin wrapper)
// cookies()로 lang 읽어 영어면 번역본을 서버에서 pre-fetch 후 PostContentClient로 전달
// extractHeadings도 실제 표시할 content 기준으로 호출 → TOC 슬러그 자동 일치

import React from "react";
import { cookies } from "next/headers";
import { getPostContent } from "@/lib/services/post.service";
import { getTranslatedPostContent } from "@/lib/services/translation.service";
import { getLang } from "@/lib/i18n";
import { extractHeadings } from "@/lib/toc";
import PostContentClient from "@/components/PostContentClient";

interface PostContentProps {
  pageId: string;
}

export default async function PostContent({ pageId }: PostContentProps): Promise<React.JSX.Element> {
  const cookieStore = await cookies();
  const lang = getLang(cookieStore.get("lang")?.value);

  // 영어면 원문과 번역본을 병렬로 fetch (둘 다 unstable_cache로 캐싱됨)
  const [koContent, enContent] = await Promise.all([
    getPostContent(pageId),
    lang === "en" ? getTranslatedPostContent(pageId) : Promise.resolve(null),
  ]);

  // enContent가 null이면 번역 실패 — 원문으로 fallback
  const translationFailed = lang === "en" && enContent === null;
  const content = enContent ?? koContent;
  const headings = extractHeadings(content);

  return (
    <PostContentClient
      content={content}
      headings={headings}
      pageId={pageId}
      lang={lang}
      translationFailed={translationFailed}
    />
  );
}
