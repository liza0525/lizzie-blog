// Notion API 직접 호출은 이 파일에서만 — Flask의 repository 레이어
// 다른 파일에서 @notionhq/client를 직접 import하지 말 것

import { NotionToMarkdown } from "notion-to-md";
import type {
  PageObjectResponse,
  QueryDatabaseParameters,
  BlockObjectResponse,
  EmbedBlockObjectResponse,
  ImageBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { notionClient, DATABASE_ID } from "./client";
import { mapPageToPost } from "./mapper";
import type { Post, PostListPage } from "@/types";

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
      and: [
        { property: "Slug", rich_text: { equals: slug } },
        { property: "Status", status: { equals: "Published" } },
      ],
    },
  });

  const page = response.results.find(
    (p): p is PageObjectResponse => "properties" in p
  );
  if (!page) return null;

  return mapPageToPost(page);
}

// 단일 블록의 모든 children을 페이지네이션 포함해서 가져옴
export async function fetchAllChildren(blockId: string): Promise<BlockObjectResponse[]> {
  const results: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notionClient.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    results.push(
      ...response.results.filter((b): b is BlockObjectResponse => "type" in b)
    );
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return results;
}

// blockId를 루트로 전체 블록 트리를 병렬로 pre-fetch해서 캐시에 저장
// 같은 depth의 children은 Promise.all로 동시에 요청
async function prefetchBlocks(
  blockId: string,
  cache: Map<string, BlockObjectResponse[]>
): Promise<void> {
  const children = await fetchAllChildren(blockId);
  cache.set(blockId, children);

  await Promise.all(
    children
      .filter((b) => b.has_children)
      .map((b) => prefetchBlocks(b.id, cache))
  );
}

// 포스트 본문(마크다운) 조회
// 전체 블록을 병렬 pre-fetch 후 캐시된 클라이언트로 notion-to-md에 주입해
// notion-to-md가 변환 시 API를 재호출하지 않도록 함
export async function fetchPostContent(pageId: string): Promise<string> {
  const cache = new Map<string, BlockObjectResponse[]>();
  await prefetchBlocks(pageId, cache);

  // notion-to-md에 캐시 클라이언트를 주입 — list 호출 시 캐시에서 반환
  const cachedClient = {
    ...notionClient,
    blocks: {
      ...notionClient.blocks,
      children: {
        list: ({ block_id }: { block_id: string }) =>
          Promise.resolve({
            results: cache.get(block_id) ?? [],
            has_more: false,
            next_cursor: null,
            object: "list" as const,
            type: "block" as const,
            block: {},
          }),
      },
    },
  };

  const n2m = new NotionToMarkdown({ notionClient: cachedClient as typeof notionClient });

  // image 블록 — file 타입은 S3 signed URL이 1시간 만료되므로 프록시 경유
  // external 타입(Velog 등 외부 URL)은 만료 없으므로 직접 사용
  n2m.setCustomTransformer("image", async (block) => {
    const imageBlock = block as ImageBlockObjectResponse;
    const caption = imageBlock.image.caption.map((t) => t.plain_text).join("");
    const url =
      imageBlock.image.type === "file"
        ? `/api/notion-image?blockId=${block.id}`
        : imageBlock.image.external.url;
    return `![${caption}](${url})`;
  });

  // embed 블록 → <iframe> HTML로 변환 (rehype-raw가 렌더링)
  // 다른 블로그 글 등 외부 URL을 Notion에서 embed했을 때 iframe으로 표시
  n2m.setCustomTransformer("embed", async (block) => {
    const url = (block as EmbedBlockObjectResponse).embed.url;
    return `<iframe src="${url}" class="notion-embed" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
  });

  const mdBlocks = await n2m.pageToMarkdown(pageId);
  const { parent } = n2m.toMarkdownString(mdBlocks);
  return parent;
}

