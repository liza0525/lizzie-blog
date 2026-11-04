// 홈(/) — 헤더·푸터 없는 전체 화면 인트로 전용 페이지
// (site) route group 밖에 있어서 사이트 공통 레이아웃(헤더·푸터)이 붙지 않음
// "Scroll down"을 누르거나 휠·스와이프로 넘기면 인트로가 흐려진 뒤 글 목록(/posts)으로 넘어감 (IntroStage)
// 데이터를 읽지 않아서 빌드 때 정적 HTML로 만들어짐 → 첫 화면이 빠름
// 예전 주소(/?tag=…, /?q=…)는 next.config.ts의 redirects가 /posts로 보냄

import React from "react";
import IntroStage from "@/components/IntroStage";
import HomeIntro from "@/components/HomeIntro";
import { HOME_HERO } from "@/lib/config";

export default function HomePage(): React.JSX.Element {
  return (
    <main className="flex-1">
      <IntroStage>
        <HomeIntro copy={HOME_HERO} />
      </IntroStage>
    </main>
  );
}
