// DeepL API를 이용한 마크다운 번역 서비스
// 코드블록, 인라인 코드, HTML 태그, URL을 placeholder로 치환 후 번역 → 복원
// (이 부분들은 번역하면 안 되기 때문)
//
// 캐싱 전략: Vercel KV (Redis) — 원문 SHA256 해시를 키로 사용
// 원문이 바뀌면 해시가 달라지므로 Notion 내용 변경 시 자연 무효화됨
// → /api/revalidate로 Notion 캐시를 지우면 다음 요청에서 새 원문을 읽고 KV miss → 재번역

import { getPostContent } from "@/lib/services/post.service";
import { getTranslationCache, setTranslationCache } from "@/lib/cache/kv";
import type { Post } from "@/types";

// placeholder 토큰 — DeepL이 번역하지 않도록 특수문자 조합 사용
const token = (i: number): string => `[[[${i}]]]`;
const TOKEN_RE = /\[\[\[(\d+)\]\]\]/g;

interface ExtractResult {
  text: string;
  preserved: string[];
}

// 번역하면 안 되는 부분을 placeholder로 치환
function extractPreserved(markdown: string): ExtractResult {
  const preserved: string[] = [];

  const keep = (match: string): string => {
    const idx = preserved.length;
    preserved.push(match);
    return token(idx);
  };

  let text = markdown;

  // 1. 펜스드 코드블록 (``` ... ```) — 반드시 먼저 처리해야 안에 있는 backtick이 오인식 안 됨
  text = text.replace(/```[\s\S]*?```/g, keep);

  // 2. 인라인 코드 (`...`)
  text = text.replace(/`[^`\n]+`/g, keep);

  // 3. 콜아웃 — wrapper HTML(아이콘 포함)은 보존하고 body 텍스트만 번역에 노출
  // 구조: <div class="notion-callout"[attrs]><span ...>emoji</span><div class="notion-callout-body">텍스트</div></div>
  // openTag와 closeTag를 각각 placeholder로 치환 → body 텍스트는 DeepL이 번역함
  text = text.replace(
    /<div class="notion-callout"([^>]*)><span class="notion-callout-icon">([^<]*)<\/span><div class="notion-callout-body">([\s\S]*?)<\/div><\/div>/g,
    (_, colorAttr: string, icon: string, body: string) => {
      const openTag = `<div class="notion-callout"${colorAttr}><span class="notion-callout-icon">${icon}</span><div class="notion-callout-body">`;
      const closeTag = `</div></div>`;
      return `${keep(openTag)}${body}${keep(closeTag)}`;
    }
  );

  // 4. 나머지 HTML 블록/태그 — iframe embed 등
  text = text.replace(/<[a-zA-Z][^>]*>[\s\S]*?<\/[a-zA-Z]+>/g, keep);
  text = text.replace(/<[a-zA-Z][^>]*\/>/g, keep);

  // 5. 마크다운 링크/이미지의 URL 부분만 보존 — 텍스트는 번역, URL은 유지
  // [링크 텍스트](url) → [링크 텍스트][[[n]]]
  // ![alt](url)       → ![alt][[[n]]]
  text = text.replace(/\]\(([^)]+)\)/g, (_, url: string) => `]${keep(`(${url})`)}`);

  return { text, preserved };
}

// placeholder 복원
function restorePreserved(translated: string, preserved: string[]): string {
  return translated.replace(TOKEN_RE, (_, idx: string) => preserved[parseInt(idx)] ?? "");
}

// DeepL API 호출 (한국어 → 영어)
async function callDeepL(text: string): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) throw new Error("DEEPL_API_KEY 환경변수가 설정되지 않았습니다");

  // Free tier 키는 :fx 로 끝남 — 엔드포인트가 다름
  const baseUrl = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [text],
      source_lang: "KO",
      target_lang: "EN",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DeepL API 오류 (${response.status}): ${body}`);
  }

  const data = await response.json() as { translations: { text: string }[] };
  return data.translations[0].text;
}

// 마크다운 전체 번역 (보존 처리 포함)
// KV 캐시: 원문 마크다운 전체를 키로 사용
export async function translateMarkdown(markdown: string): Promise<string> {
  const cached = await getTranslationCache(markdown);
  if (cached) return cached;

  const { text, preserved } = extractPreserved(markdown);
  const translated = await callDeepL(text);
  const result = restorePreserved(translated, preserved);

  await setTranslationCache(markdown, result);
  return result;
}

// pageId로 포스트 본문을 가져와 번역 반환
// 본문은 post.service의 unstable_cache로 캐싱 → 번역은 KV로 캐싱
export async function getTranslatedPostContent(pageId: string): Promise<string> {
  const content = await getPostContent(pageId);
  return translateMarkdown(content);
}

// 포스트 메타데이터(title + description) 번역
// title과 description을 구분자로 합쳐 DeepL 1회 호출 → API 비용 최소화
// KV 캐시: "title\n\n---SPLIT---\n\ndescription" 전체를 원문 키로 사용
export async function translatePostsMeta(posts: Post[]): Promise<Post[]> {
  const SPLIT = "\n\n---SPLIT---\n\n";

  return Promise.all(
    posts.map(async (post) => {
      const combined = post.description ? `${post.title}${SPLIT}${post.description}` : post.title;

      const cached = await getTranslationCache(combined);
      if (cached) {
        return parseMeta(post, cached);
      }

      const translated = await callDeepL(combined);
      await setTranslationCache(combined, translated);
      return parseMeta(post, translated);
    })
  );
}

function parseMeta(post: Post, translated: string): Post {
  if (!post.description) return { ...post, title: translated.trim() };

  const splitIdx = translated.indexOf("---SPLIT---");
  if (splitIdx === -1) return { ...post, title: translated.trim() };

  return {
    ...post,
    title: translated.slice(0, splitIdx).trim(),
    description: translated.slice(splitIdx + 11).trim(),
  };
}
