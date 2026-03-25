// Notion API 응답 → 내부 타입 변환 (순수 함수만, 부수효과 없음)
// Flask의 serializer/schema 역할

import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Post } from "@/types";

// Notion 페이지 프로퍼티에서 텍스트 추출 헬퍼
// formula 타입도 지원 — Slug 프로퍼티가 수식일 때 사용
function extractRichText(
  property: PageObjectResponse["properties"][string]
): string {
  if (property.type === "rich_text") {
    return property.rich_text.map((t) => t.plain_text).join("");
  }
  if (property.type === "title") {
    return property.title.map((t) => t.plain_text).join("");
  }
  if (property.type === "formula" && property.formula.type === "string") {
    return property.formula.string ?? "";
  }
  return "";
}

function extractDate(
  property: PageObjectResponse["properties"][string]
): string {
  if (property.type === "date" && property.date) {
    return property.date.start;
  }
  return "";
}

function extractMultiSelect(
  property: PageObjectResponse["properties"][string]
): string[] {
  if (property.type === "multi_select") {
    return property.multi_select.map((s) => s.name);
  }
  return [];
}

function extractCoverImage(page: PageObjectResponse): string | null {
  if (!page.cover) return null;
  if (page.cover.type === "external") return page.cover.external.url;
  // file 타입은 S3 signed URL → 1시간 만료 → 프록시 경유해서 항상 신선한 URL로 redirect
  if (page.cover.type === "file") return `/api/notion-image?pageId=${page.id}`;
  return null;
}

// Notion 페이지 → Post 타입 변환
// CLAUDE.md의 Notion DB 컬럼명과 맞춰야 함 (Title, Description, Slug, PublishedAt, Tags)
export function mapPageToPost(page: PageObjectResponse): Post {
  const props = page.properties;

  return {
    id: page.id,
    slug: extractRichText(props["Slug"]),
    title: extractRichText(props["Title"]),
    description: extractRichText(props["Description"]),
    publishedAt: extractDate(props["PublishedAt"]),
    tags: extractMultiSelect(props["Tags"]),
    coverImage: extractCoverImage(page),
  };
}
