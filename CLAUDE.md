# Blog Project — CLAUDE.md

## 프로젝트 개요
Notion을 CMS로 사용하는 개인 개발 기술 블로그.
Next.js 16 (App Router) + Notion API + Vercel 배포.
심플한 디자인, 유지보수성 우선.

---

## 나의 배경 & 선호 방식
- Python 백엔드 개발자 (Flask/FastAPI 경험)
- Python type hint에 익숙 → TypeScript 타입도 항상 명시적으로 작성
- `any` 타입 금지, 모든 함수 인자/반환값에 타입 명시
- Layered architecture에 익숙함
  - Notion API = 외부 DB로 간주
  - repository → service → component 흐름 유지
- Next.js / React는 처음이므로 낯선 패턴은 주석이나 설명 추가 요망
- 유지보수성 > 코드 간결함

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
│   ├── page.tsx                # 홈 (글 목록)
│   └── posts/[slug]/
│       └── page.tsx            # 글 상세
├── lib/
│   ├── notion/
│   │   ├── client.ts           # Notion 클라이언트 초기화
│   │   ├── repository.ts       # Notion API 직접 호출 (여기서만)
│   │   └── mapper.ts           # API 응답 → 내부 타입 변환
│   └── services/
│       └── post.service.ts     # 비즈니스 로직 (repository 조합)
├── components/                 # UI 컴포넌트 (각 파일 상단 주석 필수)
│   ├── Header.tsx              # 전역 헤더 (블로그 제목, 검색, 홈 아이콘, 다크모드 토글)
│   ├── ThemeProvider.tsx       # next-themes ThemeProvider 래퍼
│   ├── ThemeToggle.tsx         # 다크/라이트 모드 토글 버튼
│   ├── SearchInput.tsx         # 제목 검색 입력창 (?q= URL 기반)
│   ├── TagSidebar.tsx          # 태그 필터 사이드바 (?tag= URL 기반)
│   ├── SidebarLayout.tsx       # 햄버거 토글 사이드바 레이아웃 (lg 이상)
│   ├── PostGrid.tsx            # 포스트 카드 그리드 (무한 스크롤)
│   ├── HighlightText.tsx       # 검색어 하이라이팅
│   ├── CodeBlock.tsx           # 마크다운 코드 블록 렌더러 (Prism)
│   ├── TableOfContents.tsx     # 포스트 우측 목차 (IntersectionObserver 활성화)
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
```
NOTION_API_KEY
NOTION_DATABASE_ID
```

---

## ISR 설정
- 글 목록 페이지: `revalidate = 3600` (1시간)
- 글 상세 페이지: `revalidate = 7200` (2시간)

---

## 자주 쓰는 명령어
```bash
npm run dev                      # 로컬 개발 서버
npm run build && npm run start   # 배포 전 로컬 확인
npm run lint                     # 린트 확인
```

---

## Skill 작성 규칙

Skill은 `/slash-command` 형태로 호출할 수 있는 재사용 가능한 프롬프트 템플릿이다.
파일 위치: `.claude/skills/<skill-name>/SKILL.md` (확장자 없음)

### 파일 형식
```markdown
# <skill-name>

<Claude에게 줄 지시문. 사람에게 설명하듯이 자연어로 작성>

- 조건이나 주의사항은 bullet로 추가
```

### 작성 기준
- 파일명 = 호출 명령어 이름 (예: `running` → `/running`)
- 첫 줄은 반드시 `# <skill-name>` 헤더
- 지시문은 Claude가 수행할 동작을 명확하게 기술
- 프로젝트에 특화된 context(기술 스택, 규칙 등)는 이 CLAUDE.md를 참조하도록 명시

### 현재 등록된 skill 목록
| skill | 설명 |
|-------|------|
| `review` | 변경된 코드를 타입 안전성 / 레이어 규칙 / 단일 책임 기준으로 검토 |
| `running` | `npm run dev`로 Next.js 개발 서버 실행 |
| `stop` | 3000번 포트의 Next.js 개발 서버 종료 |
| `diff` | 현재 git 변경사항을 파악하고 무엇이 어떻게 바뀌었는지 설명 |