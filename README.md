# Lizzie's blog

Notion을 CMS로 사용하는 개인 개발 기술 블로그.

## 기술 스택

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict)
- **CMS:** Notion API (`@notionhq/client` + `notion-to-md`)
- **Styling:** Tailwind CSS v4 + `@tailwindcss/typography`
- **Font:** Noto Sans KR (UI) / Noto Serif KR (본문)
- **Syntax Highlighting:** react-syntax-highlighter (Prism) + Mermaid
- **Math:** remark-math + rehype-katex
- **Theme:** next-themes (다크/라이트 모드)
- **Comments:** Giscus (GitHub Discussions 기반)

## 주요 기능

- Notion 데이터베이스 기반 포스트 관리
- 포스트 목록 무한 스크롤 (커서 기반 페이지네이션, 20개씩)
- 태그 필터 사이드바 (lg 이상에서만 표시)
- 제목 검색 + 검색어 하이라이팅
- 마크다운 렌더링 (GFM, 수식, 코드 하이라이팅, 이미지, Mermaid 다이어그램)
- 포스트 우측 목차(TOC) — 스크롤 기반 현재 섹션 하이라이팅
- 이전글/다음글 네비게이션
- 다크/라이트 모드 토글
- SNS 공유 버튼 (링크 복사, LinkedIn, Facebook) — 모바일 좌측 하단 고정 / 데스크탑 본문 왼쪽 sticky
- Giscus 댓글 (GitHub 계정으로 로그인, 다크/라이트 모드 연동)
- `unstable_cache` 기반 캐싱 (글 목록 1시간 / 글 상세 2시간) + `/admin`에서 수동 무효화
- OG 메타데이터 자동 생성 (포스트별 제목, 설명, 커버 이미지)
- Notion 업로드 이미지 프록시 — S3 signed URL 만료 우회
- Notion embed 블록 → iframe 렌더링
- Notion callout 블록 — 인용문과 구별되는 박스 스타일 (색상 9종 + 다크모드)
- 브라우저 로케일 기준 날짜 포맷
- Google Analytics 4 연동 (프로덕션 환경에서만 활성화)

## 로컬 실행

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build && npm run start  # 배포 전 로컬 확인
npm run lint                    # 린트 확인
```
