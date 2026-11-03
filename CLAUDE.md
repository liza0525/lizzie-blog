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
│   ├── layout.tsx              # 루트 레이아웃 (html·body, CDN 폰트 링크, 메타데이터, ThemeProvider, GA) — 헤더·푸터 없음
│   ├── page.tsx                # 홈(/) — 헤더 없는 전체 화면 인트로 전용 (정적). 버튼 → fade out → /posts
│   ├── (site)/                 # route group(URL에 안 나타남) — 헤더·푸터가 붙는 일반 페이지들
│   │   ├── layout.tsx          # 사이트 공통 레이아웃 (Header + main + footer)
│   │   ├── admin/
│   │   │   └── page.tsx        # 캐시 수동 무효화 UI
│   │   ├── posts/
│   │   │   ├── page.tsx        # 글 목록(/posts) — 히어로 + 시리즈 카드 + 태그 필터 + 글 목록
│   │   │   └── [slug]/
│   │   │       ├── page.tsx        # 글 상세
│   │   │       ├── PostContent.tsx # 본문 서버 컴포넌트 (fetch → PostContentClient 전달)
│   │   │       ├── AdjacentPosts.tsx # 이전/다음 글 네비게이션
│   │   │       └── loading.tsx     # 글 상세 로딩 UI
│   │   └── series/
│   │       ├── page.tsx        # 시리즈 목록 (최근 발행 순)
│   │       └── [name]/page.tsx # 시리즈 상세 (1편부터 순서대로)
│   ├── api/
│   │   ├── notion-image/       # Notion S3 이미지 프록시 (signed URL 만료 우회)
│   │   ├── posts/              # 무한 스크롤용 포스트 목록 API
│   │   └── revalidate/         # ISR 캐시 수동 무효화 API
│   ├── robots.ts               # robots.txt 생성
│   └── sitemap.ts              # sitemap.xml 생성
├── lib/
│   ├── config.ts               # 전역 설정 (CORE_TAGS, HOME_HERO 문구 등)
│   ├── listOrigin.ts           # 글을 연 목록(전체/시리즈) 기억 — sessionStorage, 돌아가기 버튼용
│   ├── postList.ts             # 글 목록 주소(postListHref → /posts?tag=…) — 태그·검색·돌아가기·헤더 홈 아이콘이 사용
│   ├── motion.ts               # 애니메이션 헬퍼 — 등장 순번(staggerStyle), motion 토큰 길이 읽기(readMotionMs)
│   ├── toc.ts                  # 마크다운 헤딩 추출 + rehype slug 플러그인
│   ├── notion/
│   │   ├── client.ts           # Notion 클라이언트 초기화
│   │   ├── repository.ts       # Notion API 직접 호출 (여기서만)
│   │   └── mapper.ts           # API 응답 → 내부 타입 변환
│   └── services/
│       └── post.service.ts     # 비즈니스 로직 (repository 조합, React.cache로 중복 방지)
├── components/                 # UI 컴포넌트 (각 파일 상단 주석 필수)
│   ├── Header.tsx              # 전역 헤더 (블로그 제목 → 인트로, 검색, 홈 아이콘 → 글 목록 위치, 다크모드 토글)
│   ├── ThemeProvider.tsx       # next-themes ThemeProvider 래퍼
│   ├── ThemeToggle.tsx         # 다크/라이트 모드 토글 버튼
│   ├── SearchInput.tsx         # 제목 검색 입력창 (?q= URL 기반)
│   ├── HomeHero.tsx            # 글 목록 위 히어로 — 브랜드 헤드라인(새벽빛 강조) + 소개, 검색 결과 화면에서만 숨김
│   ├── HomeIntro.tsx           # 홈 전체 화면 인트로(랜딩) — 브랜드 헤드라인 타이핑 → "질문" 형광펜 긋기(새벽빛) + 소개 + 가운데 아래 "아래로 스크롤"
│   ├── TypingText.tsx          # 타이핑 효과 문구 (서버 컴포넌트, CSS만) — 글자마다 순번 지연 + 따라가는 커서, 다 치면 밑줄
│   ├── IntroStage.tsx          # 인트로 전환 무대 — 버튼·휠·스와이프·↓/PageDown/Space → fade out이 끝나면(transitionend) /posts로 이동, Context로 시작 함수 제공
│   ├── IntroEnterLink.tsx      # 인트로의 "아래로 스크롤" + ↓ 링크(바운스) — /posts 일반 링크, 일반 클릭만 IntroStage 전환에 맡김
│   ├── HomeIntroMarker.tsx     # 글 목록(/posts)을 떠나거나 태그·검색이 바뀌면 이후 등장 애니메이션을 끔 (새로고침하면 다시 재생, 렌더링 없음)
│   ├── SeriesShelf.tsx         # 글 목록 위 시리즈 카드 줄 (제목 줄 "모든 시리즈 보기" + 최근 시리즈 카드, hover는 색 변화만)
│   ├── ScrollFadeRow.tsx       # 가로 스크롤 줄 — 넘칠 때만 오른쪽 끝 페이드 표시, 스크롤바는 처음엔 숨김(마우스는 hover 시 표시)
│   ├── TagFilter.tsx           # 홈 수평 태그 필터 바 (코어 태그 기본 노출, 더 보기 펼침 — 펼치기/접기 애니메이션)
│   ├── PostGrid.tsx            # 포스트 리스트 (무한 스크롤)
│   ├── PostContentClient.tsx   # 포스트 본문 렌더러 (client) — PostContent(server)에서 분리
│   ├── ZoomableImage.tsx       # 본문 이미지 (높이 70vh 제한) + 클릭 확대 라이트박스
│   ├── HighlightText.tsx       # 검색어 하이라이팅
│   ├── CodeBlock.tsx           # 마크다운 코드 블록 렌더러 (Prism) — mermaid는 MermaidBlock으로 위임
│   ├── MermaidBlock.tsx        # Mermaid 다이어그램 SVG 렌더러 (다크/라이트 테마 대응)
│   ├── TableOfContents.tsx     # 포스트 우측 목차 (IntersectionObserver 활성화)
│   ├── PostNavigator.tsx       # 글 상세 네비게이터 패널 — 시리즈 + 목차 섹션 (사이드바·바텀시트 공용)
│   ├── SeriesNav.tsx           # 네비게이터의 시리즈 섹션 (편 목록, 현재 글 하이라이트)
│   ├── SeriesPager.tsx         # 글 상세 하단 시리즈 카드 (시리즈 내 이전편/다음편)
│   ├── ListOriginMarker.tsx    # 목록 화면이 열릴 때 "마지막으로 본 목록"을 기록 (렌더링 없음)
│   ├── BackToListLink.tsx      # 글 상세 돌아가기 링크 — 처음 들어온 목록으로 (‹ 글 목록 / ‹ CS 시리즈)
│   ├── TocBottomSheet.tsx      # 모바일/세로화면(<xl)용 네비게이터 진입점 — 우하단 FAB + 바텀시트
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
NEXT_PUBLIC_CORE_TAGS       # 코어 태그 (쉼표 구분, 순서 = 홈 태그 바 순서) — 바꾸면 재배포 필요
NEXT_PUBLIC_GA_MEASUREMENT_ID  # GA4 (운영 환경에서만)
```

---

## 캐싱 전략
- 홈 인트로(`app/page.tsx`): 데이터를 읽지 않아 정적(Static). 예전 주소 `/?tag=`·`/?q=`는 `next.config.ts` redirects가 `/posts`로 보냄 (페이지에서 searchParams를 읽으면 dynamic이 되므로)
- 글 목록 페이지(`(site)/posts/page.tsx`): `searchParams` 사용으로 dynamic 렌더링 — 캐싱 없음
- 글 상세 페이지(`(site)/posts/[slug]/page.tsx`): SSG (`generateStaticParams`) — 최신 `STATIC_BUILD_POST_LIMIT`(`lib/config.ts`, 현재 20)개만 빌드 시 정적 생성, 나머지는 `dynamicParams`(기본값)로 첫 방문 시 생성 후 캐싱
  - 전체를 다 빌드하면 포스트마다 Notion 블록 트리를 병렬로 가져오는 구조라 글이 쌓일수록 빌드 중 Notion rate limit(429)에 걸림 — 이를 피하기 위한 제한
- 포스트 데이터: `post.service.ts`의 `unstable_cache`로 캐싱 (글 상세 2시간)
- 시리즈: Notion `Series`(select) 속성 기반. 전체 글 목록을 `unstable_cache`(2시간, `post` 태그)로 캐싱한 뒤 메모리에서 묶음 — Notion 추가 호출 없음
  - `/series/[name]`은 글 상세와 같은 이유(한글 경로)로 `revalidate` export 없음, 전체 시리즈를 `generateStaticParams`로 빌드
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

- **고정 버전**: `0.1.0` — 실제 값 확인: `git -C design-system describe --tags`
- **적용 방식**: import
  - **import** — 프로젝트 CSS에서 `design-system/tokens.css`(필요하면 `components.css`도)를 `@import`해서 쓴다

### UI 작업 전에

UI, 스타일, 컴포넌트를 만들거나 고치기 전에 `design-system/design-system.md`를 읽는다.
실제 값은 `design-system/tokens.css`가 원본이고, 재사용 클래스는 `design-system/components.css`에 있다.
시스템에 없는 색·폰트·컴포넌트 패턴은 임의로 만들지 말고 사용자에게 먼저 제안한다.

### 항상 지킬 규칙

- 색은 역할 토큰만 쓴다: `--bg` `--surface` `--border` `--input-border` `--text` `--muted` `--subtle` `--accent` `--accent-soft` `--on-accent` `--on-accent-soft` `--sunrise` `--on-sunrise` `--warning` `--warning-soft` `--danger` `--danger-soft` `--success` `--success-soft`. hex 값이나 `--gray-*` 원시값을 직접 쓰지 않는다
- `--accent`는 링크·주요 버튼·활성 표시에. `--sunrise`는 그 화면에서 가장 먼저 읽혀야 할 한 가지에만, 누르지 않는 자리에(대부분 한 화면에 하나)(라이트에서는 글자색 금지). 상태색은 그 의미일 때만, 레이블과 함께
- 폰트는 Pretendard가 기본. Maru Buri(세리프)는 장문 본문(`.prose`) 안에서만
- 13px 미만 글씨 금지. 제목은 700 + `--letter-tight`. `uppercase`와 넓은 자간 금지
- 모서리는 전부 `--corner`(4px). 점·아바타만 `--corner-round`. pill 버튼 금지
- 카드: `--surface` 면 + 1px `--border` + 4px, 그림자 없음. 카드에 `border-top/left` 포인트 색 금지
- 그림자는 떠 있는 층(툴팁·팝오버·메뉴·모달·토스트)에만 `--elevation-float` 한 단계. z-index는 `--layer-float` `--layer-overlay` `--layer-toast`만 쓰고 숫자를 직접 쓰지 않는다. 툴팁·팝오버는 `.tooltip` `.popover`를 쓴다
- 선택·탐색 상태는 색 면이 아니라 밑줄 2px(`--accent`) + semibold
- 다크모드는 토큰이 `light-dark()`로 자동 전환한다. 컴포넌트에 `dark:` 분기를 쓰지 않는다
- 브레이크포인트는 40rem(`sm`)과 56rem(`wide`) 두 개만. 다른 값을 새로 만들지 않는다
- 모션은 hover·focus의 색 변화(`--motion-fast`), 나타남·사라짐 fade, 펼침·접힘 높이(`.collapse`)에만 쓴다. 나타날 때는 `--motion-base` + `--motion-ease`, 사라질 때는 `--motion-fast` + `--motion-ease-exit`(사라질 때도 fade 없이 바로 없애지 않는다. 예외: 버튼 안 스피너는 글자와 함께, 탭·페이지 이동은 바로 바꾼다). 스크롤 진입 애니메이션, hover 시 떠오르는 카드, 확대, 바운스 금지
- 로딩은 내용을 기다리면 `.skeleton`(`animate-skeleton`), 누른 일의 결과를 기다리면 글자와 함께 `.spinner`(`animate-spinner`). Tailwind 기본 `animate-pulse`·`animate-spin` 금지

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
- `base.css`도 import하지 않는다(Tailwind Preflight와 겹침). 필요한 것(`word-break: keep-all`, 제목 자간, `:focus-visible`, `::selection`, `prefers-reduced-motion`)만 globals.css에 옮겨 둠
  - reduced-motion 규칙에는 `animation-delay`/`transition-delay` 리셋을 더했다 (stagger 등장이 delay 동안 투명하게 남지 않도록)
- motion: `ease-motion`·`ease-motion-exit`는 tokens.css(0.1.0) `@theme`이 매핑한다. globals.css는 기본 transition 값(`--motion-fast`, `--motion-ease`)과 `animate-fade-in`(투명도만), 타이핑(`.typing-char`)만 정의한다. duration은 `duration-(--motion-base)` 문법으로 토큰을 참조하고 숫자를 직접 쓰지 않는다
  - 나타남·펼침은 `duration-(--motion-base) ease-motion`, 사라짐·접힘은 `duration-(--motion-fast) ease-motion-exit`. 상태별로 클래스를 나눠 "도착하는 상태"에 둔다(TagFilter·TocBottomSheet·ZoomableImage·IntroStage)
  - JS가 길이를 알아야 하면(닫힘 트랜지션 뒤 언마운트 타이머 등) 값을 복사하지 말고 `readMotionMs("--motion-fast")`로 토큰을 읽는다
  - 순차 등장은 `style={staggerStyle(n)}`(`lib/motion.ts`)로 순번 `--i`를 주면 `--i × --stagger-step`(`--motion-fast`/2)만큼 늦게 시작. 끝 상태는 forwards가 아니라 기본 스타일로 둔다(타이핑 커서가 남던 버그)
  - "질문" 강조는 globals.css의 `.highlight-mark`(모서리 없는 직사각형 띠, 글자 높이의 75%, 세로 가운데 — 디자인 시스템 `.mark-sunrise` 대신 쓰는 블로그 전용 모양, 사용자 결정). 인트로는 `.highlight-swipe`를 더해 500ms 동안 왼쪽→오른쪽으로 그어짐. 타이핑은 globals.css의 `.typing-char`(글자마다 `--i` × `--stagger-step`). 뒤따르는 요소는 `staggerStyle(typingEndStep(text) + n)`으로 이어 붙인다
  - 0.1.0에서 걷어낸 것: 스크롤 진입(Reveal), 위로 떠오르는 fade-up(translate), 밑줄 그리기, 무한 반복(인트로 화살표·커서 깜빡임), hover 위치 이동(SeriesShelf), 500ms 인트로 fade
  - **의도된 예외(사용자 결정, 2026-11-03):** 홈 인트로의 타이핑 효과·형광펜 긋기·"아래로 스크롤" 바운스(포물선 반복, `.intro-bounce`)과 인트로 → `/posts` fade(150ms + ease-motion-exit)는 0.1.0 원칙("움직임은 상태 변화에만", "로딩 외 무한 반복·위치 이동 금지", "페이지 이동은 fade 없이")과 다르지만 유지한다. 바운스는 overshoot가 없어 시스템의 "바운스 easing" 금지에는 해당하지 않음. 원칙에 맞춘다고 임의로 지우지 않는다
  - 테마 전환 순간 전환 끄기는 next-themes `disableTransitionOnChange`로 처리(base.css의 `data-theme-switching` 대신)
  - 글 목록(`/posts`, `[data-intro]` 컨테이너)의 등장 fade는 페이지를 새로 불러온 뒤 처음 볼 때만 재생된다(새로고침하면 다시). 목록 안에서 이동하거나 떠나면 `HomeIntroMarker`가 `<html data-intro-seen>`을 붙여 CSS로 끈다
- 홈(`/`)은 헤더 없는 인트로 전용, 글 목록은 `/posts`다. **목록으로 가는 링크는 전부 `postListHref()`(`lib/postList.ts`)로 만든다** — `"/"`로 보내면 인트로로 간다. `"/"`(인트로)로 가는 링크는 헤더 블로그 제목뿐
  - 헤더·푸터가 필요한 새 페이지는 `app/(site)/` 아래에 만든다 (그룹 밖이면 헤더가 안 붙음)
- Notion 콜아웃 9색은 globals.css의 `.notion-callout[data-color]`에서 3톤(기본/accent/warning)으로 매핑한다
- 폰트: Pretendard Variable(jsDelivr npm), Maru Buri(`fonts-archive/MaruBuri`) 모두 `layout.tsx`의 `<head>`에 `<link rel="stylesheet">`로 로드. **next/font 미사용** — font import 추가/제거 시 `.next` 캐시 삭제 필요 없음
