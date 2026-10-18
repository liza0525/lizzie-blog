# Blog Project — CLAUDE.md

## 프로젝트 개요
Notion을 CMS로 사용하는 개인 개발 기술 블로그.
Next.js 16 (App Router) + Notion API + Vercel 배포.
심플한 디자인, 유지보수성 우선.

---

## 아키텍처 개념 매핑 (Flask ↔ Next.js)

| Flask / FastAPI     | 이 프로젝트                        | 역할                        |
|---------------------|------------------------------------|-----------------------------|
| `routes/`           | `app/`                             | 라우트 + 뷰 (컨트롤러+템플릿) |
| `services/`         | `lib/services/`                    | 비즈니스 로직               |
| `repositories/`     | `lib/notion/repository.ts`         | 외부 데이터 접근             |
| `schemas / models`  | `types/`                           | 타입 정의                   |
| `db 클라이언트`      | `lib/notion/client.ts`             | 외부 서비스 초기화           |
| `serializer`        | `lib/notion/mapper.ts`             | API 응답 → 내부 타입 변환   |

---

## 프로젝트 구조
> **규칙:** 파일/컴포넌트를 추가·삭제·이동할 때마다 아래 구조와 컴포넌트 목록을 반드시 업데이트할 것.


```
src/
├── app/                        # 라우트 레이어
│   ├── layout.tsx              # 루트 레이아웃 (CDN 폰트 링크, 메타데이터, Header/Footer)
│   ├── page.tsx                # 홈 (글 목록)
│   ├── admin/
│   │   └── page.tsx            # 캐시 수동 무효화 UI
│   ├── api/
│   │   ├── notion-image/       # Notion S3 이미지 프록시 (signed URL 만료 우회)
│   │   ├── posts/              # 무한 스크롤용 포스트 목록 API
│   │   └── revalidate/         # ISR 캐시 수동 무효화 API
│   ├── posts/[slug]/
│   │   ├── page.tsx            # 글 상세
│   │   ├── PostContent.tsx     # 본문 서버 컴포넌트 (fetch → PostContentClient 전달)
│   │   ├── AdjacentPosts.tsx   # 이전/다음 글 네비게이션
│   │   └── loading.tsx         # 글 상세 로딩 UI
│   ├── robots.ts               # robots.txt 생성
│   └── sitemap.ts              # sitemap.xml 생성
├── lib/
│   ├── config.ts               # 전역 설정 (CORE_TAGS 등)
│   ├── toc.ts                  # 마크다운 헤딩 추출 + rehype slug 플러그인
│   ├── notion/
│   │   ├── client.ts           # Notion 클라이언트 초기화
│   │   ├── repository.ts       # Notion API 직접 호출 (여기서만)
│   │   └── mapper.ts           # API 응답 → 내부 타입 변환
│   └── services/
│       └── post.service.ts     # 비즈니스 로직 (repository 조합, React.cache로 중복 방지)
├── components/                 # UI 컴포넌트 (각 파일 상단 주석 필수)
│   ├── Header.tsx              # 전역 헤더 (블로그 제목, 검색, 홈 아이콘, 다크모드 토글)
│   ├── ThemeProvider.tsx       # next-themes ThemeProvider 래퍼
│   ├── ThemeToggle.tsx         # 다크/라이트 모드 토글 버튼
│   ├── SearchInput.tsx         # 제목 검색 입력창 (?q= URL 기반)
│   ├── TagFilter.tsx           # 홈 수평 태그 필터 바 (코어 태그 기본 노출, 더 보기 펼침)
│   ├── PostGrid.tsx            # 포스트 리스트 (무한 스크롤)
│   ├── PostContentClient.tsx   # 포스트 본문 렌더러 (client) — PostContent(server)에서 분리
│   ├── ZoomableImage.tsx       # 본문 이미지 (높이 70vh 제한) + 클릭 확대 라이트박스
│   ├── HighlightText.tsx       # 검색어 하이라이팅
│   ├── CodeBlock.tsx           # 마크다운 코드 블록 렌더러 (Prism) — mermaid는 MermaidBlock으로 위임
│   ├── MermaidBlock.tsx        # Mermaid 다이어그램 SVG 렌더러 (다크/라이트 테마 대응)
│   ├── TableOfContents.tsx     # 포스트 우측 목차 (IntersectionObserver 활성화)
│   ├── TocBottomSheet.tsx      # 모바일/세로화면(<xl)용 TOC 진입점 — 우하단 FAB + 바텀시트
│   ├── GiscusComments.tsx      # Giscus 댓글 (GitHub Discussions 기반)
│   ├── GoogleAnalytics.tsx     # GA4 스크립트 삽입 (프로덕션 환경에서만 활성화)
│   └── FormattedDate.tsx       # 브라우저 로케일 기준 날짜+시간 포맷
└── types/                      # 공통 타입 정의 (index.ts)
```

---

## 코딩 규칙

### 타입
- TypeScript strict 모드 사용
- `any` 금지 — 모르면 `unknown` 쓰고 좁히기
- 모든 함수에 인자 타입 + 반환 타입 명시
- Notion API 응답 타입은 `types/`에 별도 정의

### 레이어 규칙
- Notion API 직접 호출은 `lib/notion/repository.ts` 에만
- 컴포넌트에서 API 직접 호출 금지 — 반드시 service 경유
- mapper는 순수 함수로만 (부수효과 없음)

### 일반
- 함수는 단일 책임 원칙
- 파일당 하나의 책임
- 컴포넌트는 함수형으로
- 주석: "무엇"보다 "왜"를 설명

### 컴포넌트 주석 규칙 (필수)
- **모든 컴포넌트 파일 최상단에 반드시 주석 작성**
- 형식: `// 한 줄 역할 요약`으로 시작, 필요 시 2~3줄 추가
- 포함할 내용: 컴포넌트의 역할, 주요 동작 방식, 주의사항(있을 경우)
- 예시:
  ```tsx
  // 포스트 카드 그리드 — 무한 스크롤 지원
  // IntersectionObserver로 스크롤 바닥 감지 → /api/posts로 다음 페이지 fetch
  ```

---

## 기술 스택
- Next.js 16 (App Router)
- TypeScript (strict)
- `@notionhq/client` + `notion-to-md`
- Tailwind CSS

---

## 환경변수
`.env.example` 참고. 주요 변수:
```
NOTION_API_KEY
NOTION_DATABASE_ID
REVALIDATE_SECRET           # /api/revalidate 보호용 시크릿
NEXT_PUBLIC_SITE_URL        # OG 메타데이터 base URL
NEXT_PUBLIC_GA_MEASUREMENT_ID  # GA4 (운영 환경에서만)
```

---

## 캐싱 전략
- 글 목록 페이지(`page.tsx`): `searchParams` 사용으로 dynamic 렌더링 — 캐싱 없음
- 글 상세 페이지(`posts/[slug]/page.tsx`): SSG (`generateStaticParams`) — 최신 `STATIC_BUILD_POST_LIMIT`(`lib/config.ts`, 현재 20)개만 빌드 시 정적 생성, 나머지는 `dynamicParams`(기본값)로 첫 방문 시 생성 후 캐싱
  - 전체를 다 빌드하면 포스트마다 Notion 블록 트리를 병렬로 가져오는 구조라 글이 쌓일수록 빌드 중 Notion rate limit(429)에 걸림 — 이를 피하기 위한 제한
- 포스트 데이터: `post.service.ts`의 `unstable_cache`로 캐싱 (글 상세 2시간)
- `fetchAllPosts()`: `React.cache()`로 같은 요청 내 중복 호출 방지

---

## 자주 쓰는 명령어
```bash
npm run dev                      # 로컬 개발 서버
npm run build && npm run start   # 배포 전 로컬 확인
npm run lint                     # 린트 확인
```

---

<!-- BEGIN lizzie-design-system -->
## Design System

이 프로젝트는 `design-system/`(git submodule)의 Lizzie Design System을 따른다.

- **고정 버전**: `0.0.2` — 실제 값 확인: `git -C design-system describe --tags`
- **적용 방식**: import
  - **import** — 프로젝트 CSS에서 `design-system/tokens.css`(필요하면 `components.css`도)를 `@import`해서 쓴다

### UI 작업 전에

UI, 스타일, 컴포넌트를 만들거나 고치기 전에 `design-system/design-system.md`를 읽는다.
실제 값은 `design-system/tokens.css`가 원본이고, 재사용 클래스는 `design-system/components.css`에 있다.
시스템에 없는 색·폰트·컴포넌트 패턴은 임의로 만들지 말고 사용자에게 먼저 제안한다.

### 항상 지킬 규칙

- 색은 역할 토큰만 쓴다: `--bg` `--surface` `--border` `--input-border` `--text` `--muted` `--subtle` `--accent` `--accent-soft` `--on-accent` `--on-accent-soft` `--warning` `--warning-soft`. hex 값이나 `--gray-*` 원시값을 직접 쓰지 않는다
- 포인트 색은 `--accent` 하나. `--warning`은 주의 표시에만
- 폰트는 Pretendard가 기본. Maru Buri(세리프)는 장문 본문(`.prose`) 안에서만
- 13px 미만 글씨 금지. 제목은 700 + `--letter-tight`. `uppercase`와 넓은 자간 금지
- 모서리는 전부 `--corner`(4px). 점·아바타만 `--corner-round`. pill 버튼 금지
- 카드: `--surface` 면 + 1px `--border` + 4px, 그림자 없음. 카드에 `border-top/left` 포인트 색 금지
- 선택·탐색 상태는 색 면이 아니라 밑줄 2px(`--accent`) + semibold
- 다크모드는 토큰이 `light-dark()`로 자동 전환한다. 컴포넌트에 `dark:` 분기를 쓰지 않는다

### 디자인 시스템 버전을 올릴 때

"디자인 시스템 올려줘", "design-system 업데이트" 같은 요청을 받으면 아래 순서를 따른다.
**`git pull`이나 submodule 포인터만 바꾸고 끝내지 않는다.** 아직 0.0.x 단계라 어느 태그든 깨지는 변경이 있을 수 있다.

1. 현재 버전 확인: `git -C design-system describe --tags`
2. 태그 목록 확인: `git -C design-system fetch --tags` 후 `git -C design-system tag -l`. 사용자가 버전을 말하지 않았으면 최신 태그를 제안하고 확인받는다
3. 대상 태그로 이동: `git -C design-system checkout <대상 태그>`
4. `design-system/CHANGELOG.md`에서 현재 버전 다음부터 대상 버전까지의 항목을 읽고, 특히 **Removed**를 사용자에게 요약한다
5. `design-system/MIGRATION.md`에서 해당 구간 섹션을 열고, 적용 방식(import/copy)에 맞는 절차를 따른다. 섹션 안의 **검색 명령어를 실행해서 결과가 0건이 될 때까지** 대응표대로 고친다
6. 이 섹션의 "고정 버전"을 새 태그로 바꾼다
7. 바뀐 파일을 요약해서 보여준다. 커밋은 사용자가 지시할 때만 한다
<!-- END lizzie-design-system -->

### 이 프로젝트 메모
- `src/app/globals.css`가 `design-system/tokens.css`만 import한다. 토큰 값을 globals.css에 복사하지 않는다
- `components.css`는 import하지 않는다 — 그 안의 `.prose` 정의가 `@tailwindcss/typography`의 `.prose`와 겹친다. 태그·입력창 등은 같은 토큰으로 Tailwind 유틸리티를 써서 맞춘다 (`rounded-box`, `bg-accent-soft`, `border-input` …)
- `base.css`도 import하지 않는다(Tailwind Preflight와 겹침). 필요한 것(`word-break: keep-all`, 제목 자간, `:focus-visible`, `::selection`)만 globals.css에 옮겨 둠
- Notion 콜아웃 9색은 globals.css의 `.notion-callout[data-color]`에서 3톤(기본/accent/warning)으로 매핑한다
- 폰트: Pretendard Variable(jsDelivr npm), Maru Buri(`fonts-archive/MaruBuri`) 모두 `layout.tsx`의 `<head>`에 `<link rel="stylesheet">`로 로드. **next/font 미사용** — font import 추가/제거 시 `.next` 캐시 삭제 필요 없음
