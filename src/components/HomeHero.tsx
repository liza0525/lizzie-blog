// 글 목록(/posts) 위 히어로 — 짧은 소개 + 만든 사람(크레딧)
// 문구는 lib/config.ts의 HOME_HERO에서 관리 (홈 인트로와 같은 소개·크레딧). 브랜드 이름(HAE MU)은 헤더 로고가 보여 줘서 여기선 화면에 다시 쓰지 않음
//   대신 페이지 제목(h1)이 없으면 스크린리더·검색엔진이 페이지 주제를 못 잡아서 h1은 화면에서만 숨겨 둠(sr-only)
// 소개의 introHighlight는 새벽빛 형광펜(SunriseHighlight). 인트로와 달리 긋는 애니메이션 없이 처음부터 칠해져 있음
// 등장은 투명도만 바뀌는 fade (제목 → 소개). 디자인 시스템 0.1.0에서 위치 이동·순차로 떠오르는 효과는 쓰지 않음
// 배경: 인트로와 같은 새벽 바다 일러스트(FirstLightBackground)를 화면 폭 끝까지 깔고, 아래쪽은 페이지 배경으로 옅어짐. 움직임은 없음
//   글 목록 컨테이너(900px) 안에 있지만 배경만 화면 폭으로 넓힘. 스크롤바 자리(scrollbar-gutter)는 덮지 못하지만 오른쪽에만 있고 스크롤바가 덮음
// 인트로에서 넘어올 때는 인트로의 배경·소개·크레딧이 이 자리로 줄어들며 옮겨 옴 — vt-intro-* 클래스 (globals.css, IntroStage)

import React from "react";
import type { HomeHeroCopy } from "@/types";
import { staggerStyle } from "@/lib/motion";
import FirstLightBackground from "./FirstLightBackground";
import SunriseHighlight from "./SunriseHighlight";

interface HomeHeroProps {
  copy: HomeHeroCopy;
}

export default function HomeHero({ copy }: HomeHeroProps): React.JSX.Element {
  return (
    <section className="relative pt-6 pb-14 sm:pt-12 sm:pb-20">
      {/* 배경 상자: 히어로 칸 + 위쪽으로 목록 컨테이너의 위 여백(py-12 = 3rem, posts/page.tsx)만큼 → 헤더 바로 아래부터 시작
          w-screen + left-1/2 + -translate-x-1/2: 900px 컨테이너 가운데를 기준으로 화면 폭만큼 양옆으로 넓힘 (넘치는 부분은 body의 overflow-x: hidden이 자름) */}
      <div className="vt-intro-scene pointer-events-none absolute -top-12 bottom-0 left-1/2 w-screen -translate-x-1/2" aria-hidden="true">
        <FirstLightBackground variant="hero" />
      </div>

      {/* relative: 배경(absolute) 위로 올리기 — position이 없는 요소는 absolute 요소보다 먼저(아래에) 그려짐 */}
      <h1 className="sr-only">{copy.catchphrase}</h1>
      <p className="vt-intro-copy relative max-w-reading text-xl text-muted animate-fade-in" style={staggerStyle(0)}>
        <SunriseHighlight text={copy.intro} highlight={copy.introHighlight} />
      </p>
      <p className="vt-intro-credit relative mt-1.25 text-sm text-muted animate-fade-in" style={staggerStyle(2)}>
        {copy.credit}
      </p>
    </section>
  );
}
