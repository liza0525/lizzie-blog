// 포스트 하단 댓글 컴포넌트 — GitHub Discussions 기반 Giscus 사용

"use client";

import React from "react";
import Giscus from "@giscus/react";
import { useTheme } from "next-themes";

export default function GiscusComments(): React.JSX.Element {
  const { resolvedTheme } = useTheme();

  return (
    <div className="mt-16">
      <Giscus
        repo="liza0525/lizzie-blog"
        repoId="R_kgDORteLCg"
        category="Announcements"
        categoryId="DIC_kwDORteLCs4C5ANY"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        lang="ko"
        loading="lazy"
      />
    </div>
  );
}
