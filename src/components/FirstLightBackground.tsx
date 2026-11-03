// 홈 인트로 배경 일러스트 "First Light" — 해무 낀 새벽 바다 위로 첫 빛이 번지는 장면 (장식이라 스크린리더에서 숨김, 클릭은 통과)
// 원본: design-system 레포 experiments/first-light-2 (first-light.svg + first-light.css + first-light-motion.css). 모양·색·움직임은 원본 그대로
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
    mountainFar: `${uid}mountain-far-gradient`,
    mountainMid: `${uid}mountain-mid-gradient`,
    mountainNear: `${uid}mountain-near-gradient`,
    ocean: `${uid}ocean-gradient`,
    horizon: `${uid}horizon-gradient`,
    fogBlur: `${uid}fog-blur`,
  };

  return (
    // 좌표: viewBox 1600×900, 수평선 y=610, 해 x=1000 (세로 화면에서 잘려도 보이도록 가운데에서 조금만 오른쪽)
    // xMidYMid slice: 어느 비율이든 상자를 꽉 채우고, 넘치는 쪽을 가운데 기준으로 자름
    // 그리는 순서(아래 → 위): 하늘 → 빛 번짐 → 해 → 산 → 뒤 안개 → 바다 → 수평선 → 물빛 반사 → 앞 안개
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1600 900"
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

        {/* 산마다 아래로 갈수록 안개 색으로 옅어짐 → 능선 사이에 해무가 낀 것처럼 보임 */}
        <linearGradient id={ids.mountainFar} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className={styles["mountain-far-stop-top"]} />
          <stop offset="1" className={styles["mountain-stop-base"]} />
        </linearGradient>
        <linearGradient id={ids.mountainMid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className={styles["mountain-mid-stop-top"]} />
          <stop offset="1" className={styles["mountain-stop-base"]} />
        </linearGradient>
        <linearGradient id={ids.mountainNear} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.2" className={styles["mountain-near-stop-top"]} />
          <stop offset="1" className={styles["mountain-stop-base"]} />
        </linearGradient>

        <linearGradient id={ids.ocean} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className={styles["ocean-stop-near"]} />
          <stop offset="1" className={styles["ocean-stop-deep"]} />
        </linearGradient>

        {/* 수평선: 해 아래쪽만 빛을 받아 밝아지는 이음매 (가로 그라데이션, 해 위치 x=1000에서 가장 밝음) */}
        <linearGradient id={ids.horizon} x1="0" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" className={styles["horizon-stop-edge"]} />
          <stop offset="0.625" className={styles["horizon-stop-core"]} />
          <stop offset="1" className={styles["horizon-stop-edge"]} />
        </linearGradient>

        {/* 안개 가장자리를 흐리게 하는 필터 하나 — 안개 두 층만 씀 */}
        <filter id={ids.fogBlur} x="-10%" y="-60%" width="120%" height="220%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <g className={styles["sky-layer"]}>
        <rect x="0" y="0" width="1600" height="610" fill={`url(#${ids.sky})`} />
      </g>

      <g className={styles["sunrise-glow"]}>
        <rect x="0" y="0" width="1600" height="610" fill={`url(#${ids.glow})`} />
      </g>

      <g className={styles["sun-layer"]}>
        <circle className={styles["sun"]} cx="1000" cy="520" r="30" />
      </g>

      <g className={styles["mountain-layer"]}>
        <path
          fill={`url(#${ids.mountainFar})`}
          d="M -40 610 L -40 440 C 20 430 60 400 110 404 C 160 408 200 432 260 440 C 340 450 400 470 480 478 C 560 486 620 470 700 482 C 780 494 860 530 960 548 C 1040 562 1120 560 1200 572 C 1300 586 1400 596 1640 600 L 1640 610 Z"
        />
        <path
          fill={`url(#${ids.mountainMid})`}
          d="M -40 610 L -40 520 C 40 510 100 486 170 492 C 240 498 290 528 360 534 C 440 540 520 520 600 528 C 680 536 740 562 820 570 C 900 578 980 572 1040 584 C 1100 596 1160 604 1220 610 Z"
        />
        <path
          fill={`url(#${ids.mountainNear})`}
          d="M -40 610 L -40 572 C 60 566 140 548 220 556 C 300 564 360 586 440 590 C 520 594 600 598 680 610 Z"
        />
        <path
          fill={`url(#${ids.mountainNear})`}
          d="M 1060 610 C 1140 600 1220 580 1300 576 C 1380 572 1440 584 1500 596 C 1540 604 1580 608 1640 610 Z"
        />
      </g>

      <g className={styles["fog-back-layer"]} filter={`url(#${ids.fogBlur})`}>
        <path
          className={styles["fog"]}
          d="M -120 540 C 60 512 260 516 420 530 C 560 542 700 532 820 544 C 900 552 880 572 780 576 C 600 584 300 580 80 578 C -60 576 -140 560 -120 540 Z"
        />
        <path
          className={styles["fog"]}
          d="M 1080 560 C 1200 540 1380 538 1520 548 C 1640 556 1720 566 1700 584 C 1680 598 1500 598 1340 594 C 1200 590 1060 584 1080 560 Z"
        />
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

      <g className={styles["horizon-layer"]}>
        <rect x="0" y="609" width="1600" height="2" fill={`url(#${ids.horizon})`} />
      </g>

      {/* 해 아래 수면에 부서진 빛 — 아래로 갈수록 짧고 옅어짐 */}
      <g className={styles["reflection-layer"]}>
        <rect x="945" y="618" width="110" height="3" rx="1.5" opacity="0.7" />
        <rect x="960" y="632" width="80" height="3" rx="1.5" opacity="0.6" />
        <rect x="935" y="650" width="130" height="3" rx="1.5" opacity="0.5" />
        <rect x="968" y="672" width="64" height="3" rx="1.5" opacity="0.4" />
        <rect x="952" y="698" width="96" height="3" rx="1.5" opacity="0.3" />
        <rect x="978" y="730" width="44" height="3" rx="1.5" opacity="0.2" />
      </g>

      <g className={styles["fog-front-layer"]} filter={`url(#${ids.fogBlur})`}>
        <path
          className={styles["fog"]}
          d="M -120 618 C 120 596 420 600 680 608 C 900 614 1100 600 1320 604 C 1520 608 1720 606 1720 626 C 1720 648 1480 652 1200 648 C 900 644 500 652 200 650 C -20 648 -140 640 -120 618 Z"
        />
        <path
          className={styles["fog"]}
          d="M 200 700 C 360 686 560 690 700 698 C 780 703 760 716 640 718 C 480 720 300 720 220 714 C 170 710 160 704 200 700 Z"
        />
      </g>
    </svg>
  );
}
