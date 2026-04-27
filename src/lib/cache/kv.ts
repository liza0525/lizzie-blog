// 표준 Redis 기반 번역 캐시 유틸리티
// 캐시 키 = SHA256(원문 텍스트) — 원문이 바뀌면 해시도 바뀌므로 자연 무효화
// Redis 장애 시 캐시 미스로 처리하여 서비스 중단 방지

import { createClient } from "redis";
import { createHash } from "crypto";

const PREFIX = "translation";
const TTL_SECONDS = 60 * 60 * 24 * 30; // 30일

function makeKey(sourceText: string): string {
  const hash = createHash("sha256").update(sourceText).digest("hex");
  return `${PREFIX}:${hash}`;
}

export async function getTranslationCache(sourceText: string): Promise<string | null> {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  const client = createClient({ url });
  try {
    await client.connect();
    return await client.get(makeKey(sourceText));
  } catch {
    // Redis 장애 시 캐시 미스로 처리 — DeepL fallback
    return null;
  } finally {
    await client.quit().catch(() => {});
  }
}

export async function setTranslationCache(sourceText: string, translated: string): Promise<void> {
  const url = process.env.REDIS_URL;
  if (!url) return;

  const client = createClient({ url });
  try {
    await client.connect();
    await client.set(makeKey(sourceText), translated, { EX: TTL_SECONDS });
  } catch {
    // 쓰기 실패해도 번역 결과는 이미 반환됨 — 조용히 실패
  } finally {
    await client.quit().catch(() => {});
  }
}
