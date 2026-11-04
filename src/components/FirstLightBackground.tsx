// 홈 인트로 배경 일러스트 "First Light" — 해무 낀 새벽 바다 위로 첫 빛이 번지는 장면 (장식이라 스크린리더에서 숨김, 클릭은 통과)
// 원본: design-system 레포 experiments/first-light-2. 산을 걷어내고 수평으로 겹친 안개 세 겹(Layered Mist: Far/Mid/Near)이 주인공이 되도록 재해석함
//   안개는 반투명한 능선으로 겹치되 화면 아래쪽 절반(y ≥ 470)에만 → 위쪽 글자 영역은 하늘만 보임 (안개가 화면 전체를 덮지 않게)
//   원본은 SVG가 CSS를 xml-stylesheet로 불러오는 별도 문서라 블로그 테마(<html>의 .dark/.light)가 안까지 닿지 않음
//   → SVG를 페이지에 직접(inline) 넣고, 색·움직임은 FirstLightBackground.module.css에서 칠함 (토큰이 light-dark()라 테마를 그대로 따라감)
// 부모는 position: relative(또는 absolute)여야 함 — 이 배경이 부모 상자를 꽉 채우고(absolute inset-0), 글 상자는 relative로 그 위에 올림
// variant로 쓰는 자리를 나눔
//   - "intro": 홈 전체 화면 인트로. 움직임 있음 + 스크롤바 자리(scrollbar-gutter) 없앰 (스크롤 없는 한 장이라)
//   - "hero":  글 목록 위 히어로. 움직임 없음(자주 오가며 읽는 화면이라) + 아래쪽이 페이지 배경으로 서서히 옅어짐(태그 바 앞에서 뚝 끊기지 않게)
// 주의: 그라데이션·필터는 url(#id)로만 참조할 수 있어서 id가 필요함 → useId()로 컴포넌트마다 다른 id를 만들어 두 번 그려져도 겹치지 않게 함
//   (CSS에서 고르는 레이어는 id 대신 CSS Module 클래스로 바꿈 — id가 매번 달라지기 때문)

import React, { useId } from "react";
import styles from "./FirstLightBackground.module.css";

export type FirstLightVariant = "intro" | "hero";

// 장면 좌표계 크기 — viewBox와 배율 계산(firstLightScale)이 같은 값을 보도록 한 곳에 둠
const VIEWBOX_WIDTH = 1600;
const VIEWBOX_HEIGHT = 900;

// 상자(width×height px)에 그려질 때 장면의 배율 — xMidYMid slice는 상자를 꽉 채우는 쪽(큰 배율)을 고름
// 인트로 → 히어로 전환(IntroStage)이 두 상자의 배율 비율을 구해, 전환 중 두 그림을 같은 배율로 겹치는 데 씀
export function firstLightScale(width: number, height: number): number {
  return Math.max(width / VIEWBOX_WIDTH, height / VIEWBOX_HEIGHT);
}

// 안개 능선(윗가장자리) 곡선
// viewBox보다 양옆으로 200씩 넓게 그림 → 옆으로 흘러가도(최대 ±50) 끝이 화면에 드러나지 않음
// 세 겹이 서로 겹쳐 앞 겹이 뒤 겹의 아래쪽을 가림 → 수평선(y=610)은 중간 겹 뒤로 숨고, 바다는 가까운 겹 아래로 조금만 비침
const MIST_CRESTS = {
  // 먼 능선: 해(x=1000, 중심 y=520) 근처가 y≈522 → 해가 반쯤 잠김
  far: "M -200 520 C -40 492 120 470 300 482 C 480 494 600 520 760 512 C 900 505 960 520 1060 526 C 1200 534 1320 500 1480 488 C 1620 478 1720 496 1800 504",
  // 중간 능선: 수평선 위(y 548~596)에서 굴러 수평선을 덮음
  mid: "M -200 584 C -20 560 160 548 340 560 C 520 572 640 596 820 588 C 960 582 1060 556 1200 552 C 1360 548 1500 574 1640 582 C 1720 586 1770 580 1800 576",
  // 가까운 능선: 굴곡이 가장 큼 — 바다 위를 덮고 아래 끝으로 갈수록 비침
  near: "M -200 664 C 0 640 180 628 380 640 C 580 652 720 676 920 668 C 1100 660 1240 632 1420 630 C 1580 628 1700 648 1800 656",
};

// 띠의 아래 끝(y) — 먼·중간 겹은 다음 겹 뒤까지, 가까운 겹은 화면 끝까지
const MIST_BASES = { far: 640, mid: 720, near: 900 };

// 능선 곡선 끝에서 아래로 내려가 닫은 띠 모양
function mistBand(crest: string, baseY: number): string {
  return `${crest} L 1800 ${baseY} L -200 ${baseY} Z`;
}

interface FirstLightBackgroundProps {
  variant: FirstLightVariant;
}

export default function FirstLightBackground({ variant }: FirstLightBackgroundProps): React.JSX.Element {
  // useId: 같은 컴포넌트가 화면에 여러 개 있어도 서로 다른 값을 주는 React 기본 기능. 서버 렌더링 값과 브라우저 값도 같음
  //   React 19.2는 "_r_1_" 같은 모양이라 id·url(#…) 안에 그대로 써도 됨
  const uid = useId();
  const ids = {
    sky: `${uid}sky-gradient`,
    glow: `${uid}glow-gradient`,
    ocean: `${uid}ocean-gradient`,
    mistFar: `${uid}mist-far-gradient`,
    mistMid: `${uid}mist-mid-gradient`,
    mistNear: `${uid}mist-near-gradient`,
  };

  return (
    // 좌표: viewBox 1600×900, 수평선 y=610, 해 x=1000 (세로 화면에서 잘려도 보이도록 가운데에서 조금만 오른쪽)
    // xMidYMid slice: 어느 비율이든 상자를 꽉 채우고, 넘치는 쪽을 가운데 기준으로 자름
    // 그리는 순서(아래 → 위): 하늘 → 빛 번짐 → 해 → 먼 안개 → 바다 → 물빛 반사 → 중간 안개 → 가까운 안개
    //   (수평선에 따로 빛 선을 긋지 않음 — 하늘과 바다가 만나는 경계만. 반사는 안개에 대부분 가려지지만 바다 장면은 남겨 둠)
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className={`${styles["first-light"]} ${styles[variant]}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={ids.sky} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className={styles["sky-stop-top"]} />
          <stop offset="0.6" className={styles["sky-stop-mid"]} />
          <stop offset="1" className={styles["sky-stop-horizon"]} />
        </linearGradient>

        <radialGradient id={ids.glow} cx="1000" cy="560" r="560" gradientUnits="userSpaceOnUse">
          <stop offset="0" className={styles["glow-stop-core"]} />
          <stop offset="0.35" className={styles["glow-stop-mid"]} />
          <stop offset="1" className={styles["glow-stop-edge"]} />
        </radialGradient>

        <linearGradient id={ids.ocean} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className={styles["ocean-stop-near"]} />
          <stop offset="1" className={styles["ocean-stop-deep"]} />
        </linearGradient>

        {/* 안개 능선 몸통: 맨 위(rim)는 새벽빛을 받아 밝고, 그 아래는 겹마다 정한 푸른 회색으로 꽉 참
            가까운 겹만 아래 끝으로 갈수록 옅어져 바다가 조금 비침 */}
        <linearGradient id={ids.mistFar} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className={styles["mist-far-stop-rim"]} />
          <stop offset="0.25" className={styles["mist-far-stop-body"]} />
        </linearGradient>
        <linearGradient id={ids.mistMid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className={styles["mist-mid-stop-rim"]} />
          <stop offset="0.25" className={styles["mist-mid-stop-body"]} />
        </linearGradient>
        <linearGradient id={ids.mistNear} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className={styles["mist-near-stop-rim"]} />
          <stop offset="0.25" className={styles["mist-near-stop-body"]} />
          <stop offset="1" className={styles["mist-near-stop-base"]} />
        </linearGradient>

      </defs>

      <g className={styles["sky-layer"]}>
        <rect x="0" y="0" width="1600" height="610" fill={`url(#${ids.sky})`} />
      </g>

      <g className={styles["sunrise-glow"]}>
        <rect x="0" y="0" width="1600" height="610" fill={`url(#${ids.glow})`} />
      </g>

      {/* 해: 바깥 g는 처음 한 번 떠오름, 안쪽 원은 그 뒤 아주 약하게 좌우로 흔들림 — 두 움직임을 다른 요소에 걸어 transform이 겹치지 않게 함 */}
      <g className={styles["sun-layer"]}>
        <circle className={styles["sun"]} cx="1000" cy="520" r="30" />
      </g>

      {/* 안개 한 겹 = 능선 몸통 하나. 겹마다 불투명도를 낮춰 뒤 겹·해·바다가 비침. 바깥 g가 옆으로 흐르는 움직임을 받음 */}
      <g className={`${styles["mist"]} ${styles["mist-far"]}`}>
        <path d={mistBand(MIST_CRESTS.far, MIST_BASES.far)} fill={`url(#${ids.mistFar})`} />
      </g>

      <g className={styles["ocean-layer"]}>
        <rect x="0" y="610" width="1600" height="290" fill={`url(#${ids.ocean})`} />
        {/* 겹친 너울 두 장 — 아래로 갈수록 한 겹씩 진해짐 */}
        <path
          className={styles["ocean-swell"]}
          d="M -40 668 C 260 656 560 680 860 668 C 1160 656 1400 678 1640 666 L 1640 900 L -40 900 Z"
        />
        <path
          className={styles["ocean-swell"]}
          d="M -40 780 C 300 764 640 792 940 776 C 1240 762 1460 786 1640 772 L 1640 900 L -40 900 Z"
        />
        {/* 수면의 결 — 길고 가는 빛줄 몇 개 */}
        <g className={styles["ocean-lines"]}>
          <rect x="80" y="640" width="520" height="2" rx="1" />
          <rect x="1180" y="652" width="360" height="2" rx="1" />
          <rect x="260" y="716" width="440" height="2" rx="1" />
          <rect x="1040" y="742" width="420" height="2" rx="1" />
        </g>
      </g>

      {/* 해 아래 수면에 부서진 빛 — 아래로 갈수록 짧고 옅어짐. 줄 간격은 첫 줄(y=618) 기준 원본의 70% */}
      <g className={styles["reflection-layer"]}>
        <rect x="945" y="618" width="110" height="3" rx="1.5" opacity="0.7" />
        <rect x="960" y="627.8" width="80" height="3" rx="1.5" opacity="0.6" />
        <rect x="935" y="640.4" width="130" height="3" rx="1.5" opacity="0.5" />
        <rect x="968" y="655.8" width="64" height="3" rx="1.5" opacity="0.4" />
        <rect x="952" y="674" width="96" height="3" rx="1.5" opacity="0.3" />
        <rect x="978" y="696.4" width="44" height="3" rx="1.5" opacity="0.2" />
      </g>

      <g className={`${styles["mist"]} ${styles["mist-mid"]}`}>
        <path d={mistBand(MIST_CRESTS.mid, MIST_BASES.mid)} fill={`url(#${ids.mistMid})`} />
      </g>

      <g className={`${styles["mist"]} ${styles["mist-near"]}`}>
        <path d={mistBand(MIST_CRESTS.near, MIST_BASES.near)} fill={`url(#${ids.mistNear})`} />
      </g>
    </svg>
  );
}
