// Notion API 직접 호출은 이 파일에서만 — Flask의 repository 레이어
// 다른 파일에서 @notionhq/client를 직접 import하지 말 것

import { NotionToMarkdown } from "notion-to-md";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notionClient, DATABASE_ID } from "./client";
import { mapPageToPost } from "./mapper";
import type { Post, PostDetail } from "@/types";

const n2m = new NotionToMarkdown({ notionClient });

// 발행된 포스트 목록 조회 (최신순)
export async function fetchPostList(): Promise<Post[]> {
  const response = await notionClient.databases.query({
    database_id: DATABASE_ID,
    filter: {
      property: "Status",
      status: { equals: "Published" },
    },
    sorts: [{ property: "PublishedAt", direction: "descending" }],
  });

  return response.results
    .filter((page): page is PageObjectResponse => "properties" in page)
    .map(mapPageToPost);
}

// slug로 단일 포스트 조회
export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  const response = await notionClient.databases.query({
    database_id: DATABASE_ID,
    filter: {
      property: "Slug",
      formula: { string: { equals: slug } },
    },
  });

  const page = response.results.find(
    (p): p is PageObjectResponse => "properties" in p
  );
  if (!page) return null;

  return mapPageToPost(page);
}

// 포스트 본문(마크다운) 조회
export async function fetchPostContent(pageId: string): Promise<string> {
  const mdBlocks = await n2m.pageToMarkdown(pageId);
  const { parent } = n2m.toMarkdownString(mdBlocks);
  return parent;
}

// 포스트 상세 (메타 + 본문) 조회
export async function fetchPostDetail(slug: string): Promise<PostDetail | null> {
  const post = await fetchPostBySlug(slug);
  if (!post) return null;

  const content = await fetchPostContent(post.id);
  return { ...post, content };
}
