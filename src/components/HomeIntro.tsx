// 홈 전체 화면 인트로(랜딩) — 헤더 없이 화면 전체에 캐치프레이즈 + 짧은 소개 + "아래로 스크롤" 링크
// 버튼(또는 휠·스와이프·키보드)으로 넘기면 인트로가 흐려진 뒤 글 목록(/posts)으로 넘어감 (전환은 감싸는 IntroStage가 담당)
// 문구는 lib/config.ts의 HOME_HERO에서 관리. 헤드라인은 디자인 시스템 0.1.0 브랜드 "질문으로 접점을 찾는,"
// highlight 부분은 새벽빛(sunrise) — 이 화면에서 가장 먼저 읽혀야 할 한 가지
// 등장 순서: 헤드라인 전체가 한 글자씩 타이핑 → "질문"에 형광펜 긋듯 새벽빛이 왼쪽→오른쪽으로 칠해짐 → 소개 → 아래로 스크롤(가운데 아래, 바운스)
//   전부 CSS 애니메이션 + 같은 순번 단위(--i × --stagger-step)라 JS 없이도 재생되고, 하이드레이션 전 깜빡임이 없음
// 배경: 새벽 바다 일러스트(FirstLightBackground)를 화면 전체에 깔고, 글 상자는 relative로 그 위에 올림
// 목록으로 넘어갈 때 배경·헤드라인·소개는 히어로(HomeHero)의 같은 자리로 줄어들며 옮겨 감 — vt-intro-* 클래스 (globals.css, IntroStage)

import React from "react";
import type { HomeHeroCopy } from "@/types";
import { staggerStyle } from "@/lib/motion";
import FirstLightBackground from "./FirstLightBackground";
import IntroEnterLink from "./IntroEnterLink";
import TypingText, { typingEndStep } from "./TypingText";

interface HomeIntroProps {
  copy: HomeHeroCopy;
}

export default function HomeIntro({ copy }: HomeIntroProps): React.JSX.Element {
  // 순번: 글자 N개(0 ~ N-1) → 형광펜(N+2, TypingText 안, 500ms ≈ 순번 7칸 동안 칠해짐) → 소개(N+7) → 아래로 스크롤(N+8)
  //   형광펜이 거의 다 그어질 즈음 소개가 나오도록 띄움 (끝까지 기다리면 첫 화면이 늦게 채워짐)
  const typedStep = typingEndStep(copy.catchphrase);
  const introStep = typedStep + 7;
  const actionStep = typedStep + 8;

  return (
    // 높이 = 화면 높이 전체 (이 페이지엔 헤더가 없음)
    // svh(작은 뷰포트 높이): 모바일 주소창이 접혔다 펴질 때마다 높이가 바뀌어 화면이 튀는 것을 막음
    <section className="relative flex min-h-svh items-center">
      {/* 배경은 section을 꽉 채움(absolute). 먼저 그려서 뒤에 깔리고, 아래 글 상자·링크는 DOM 순서상 그 위에 그려짐 (z-index 불필요)
          감싸는 상자: 전환 때 배경만 따로 찍히도록 이름표(vt-intro-scene)를 붙일 자리 */}
      <div className="vt-intro-scene pointer-events-none absolute inset-0" aria-hidden="true">
        <FirstLightBackground variant="intro" />
      </div>

      {/* relative: 배경(absolute) 위로 올리기 — position이 없는 요소는 absolute 요소보다 먼저(아래에) 그려짐 */}
      <div className="relative max-w-[900px] w-full mx-auto px-6 py-16">
        <h1 className="vt-intro-headline text-display font-bold tracking-tight text-ink">
          <TypingText text={copy.catchphrase} highlight={copy.highlight} />
        </h1>
        <p className="vt-intro-copy mt-1.25 max-w-reading text-xl text-muted animate-fade-in" style={staggerStyle(introStep)}>
          {copy.intro}
        </p>
      </div>

      {/* 아래로 스크롤 + ↓ — 화면 가운데 아래. 바깥은 등장(fade), 안쪽 링크는 바운스 — 한 요소에 두 animation을 겹치지 않으려고 나눔
          가운데 정렬의 -translate-x-1/2는 translate 속성이라 바운스의 transform과 서로 덮어쓰지 않음 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in" style={staggerStyle(actionStep)}>
        <IntroEnterLink />
      </div>
    </section>
  );
}
