// 포스트 본문 서버 컴포넌트 (thin wrapper)
// 본문 마크다운을 fetch해서 PostContentClient로 전달

import React from "react";
import { getPostContent } from "@/lib/services/post.service";
import { extractHeadings } from "@/lib/toc";
import PostContentClient from "@/components/PostContentClient";
import type { PostType, SeriesPosition } from "@/types";

interface PostContentProps {
  pageId: string;
  type: PostType;
  series: SeriesPosition | null;  // page.tsx에서 이미 조회한 값을 그대로 전달 (네비게이터용)
}

export default async function PostContent({ pageId, type, series }: PostContentProps): Promise<React.JSX.Element> {
  const content = await getPostContent(pageId);
  const headings = extractHeadings(content);

  return (
    <PostContentClient
      content={content}
      headings={headings}
      pageId={pageId}
      type={type}
      series={series}
    />
  );
}
