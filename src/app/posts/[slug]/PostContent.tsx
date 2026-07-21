// 포스트 본문 서버 컴포넌트 (thin wrapper)
// 본문 마크다운을 fetch해서 PostContentClient로 전달

import React from "react";
import { getPostContent } from "@/lib/services/post.service";
import { extractHeadings } from "@/lib/toc";
import PostContentClient from "@/components/PostContentClient";
import type { PostType } from "@/types";

interface PostContentProps {
  pageId: string;
  type: PostType;
}

export default async function PostContent({ pageId, type }: PostContentProps): Promise<React.JSX.Element> {
  const content = await getPostContent(pageId);
  const headings = extractHeadings(content);

  return (
    <PostContentClient
      content={content}
      headings={headings}
      pageId={pageId}
      type={type}
    />
  );
}
