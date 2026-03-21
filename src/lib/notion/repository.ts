// Notion API 직접 호출은 이 파일에서만 — Flask의 repository 레이어
// 다른 파일에서 @notionhq/client를 직접 import하지 말 것

import { NotionToMarkdown } from "notion-to-md";
import type { PageObjectResponse, QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";
import { notionClient, DATABASE_ID } from "./client";
import { mapPageToPost } from "./mapper";
import type { Post, PostDetail, PostListPage } from "@/types";

const n2m = new NotionToMarkdown({ notionClient });

// 페이지네이션 포스트 목록 조회 (20개씩, 태그 필터 선택)
export async function fetchPostPage(options: {
  pageSize: number;
  cursor?: string;
  tag?: string;
}): Promise<PostListPage> {
  const baseFilter = { property: "Status", status: { equals: "Published" } };
  const filter: QueryDatabaseParameters["filter"] = options.tag
    ? { and: [baseFilter, { property: "Tags", multi_select: { contains: options.tag } }] }
    : baseFilter;

  const response = await notionClient.databases.query({
    database_id: DATABASE_ID,
    filter,
    sorts: [{ property: "PublishedAt", direction: "descending" }],
    page_size: options.pageSize,
    ...(options.cursor ? { start_cursor: options.cursor } : {}),
  });

  return {
    posts: response.results
      .filter((p): p is PageObjectResponse => "properties" in p)
      .map(mapPageToPost),
    nextCursor: response.next_cursor,
    hasMore: response.has_more,
  };
}

// 전체 포스트 조회 — generateStaticParams, 태그 목록, 검색에 사용
export async function fetchAllPosts(): Promise<Post[]> {
  const all: Post[] = [];
  let cursor: string | undefined;

  do {
    const page = await fetchPostPage({ pageSize: 100, cursor });
    all.push(...page.posts);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  return all;
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
