// Notion 클라이언트 초기화 — Flask의 db 클라이언트 초기화와 동일한 역할
// 앱 전체에서 이 인스턴스를 공유함 (싱글톤)

import { Client } from "@notionhq/client";

if (!process.env.NOTION_API_KEY) {
  throw new Error("NOTION_API_KEY 환경변수가 설정되지 않았습니다.");
}

export const notionClient = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const DATABASE_ID = process.env.NOTION_DATABASE_ID ?? (() => {
  throw new Error("NOTION_DATABASE_ID 환경변수가 설정되지 않았습니다.");
})();
