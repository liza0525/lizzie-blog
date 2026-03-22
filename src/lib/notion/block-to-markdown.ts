// Notion BlockObjectResponse → 마크다운 문자열 변환
// notion-to-md를 거치지 않고 직접 변환 — 스트리밍 API에서 블록 단위로 사용
// 지원 타입: paragraph, heading, list, code, quote, callout, toggle,
//            image, divider, table, to_do, bookmark, equation, column_list

import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

// 리치 텍스트 배열을 마크다운 인라인 문자열로 변환
export function richTextToMd(items: RichTextItemResponse[]): string {
  return items
    .map((item) => {
      // equation 타입은 인라인 수식으로 변환
      if (item.type === "equation") return `$${item.equation.expression}$`;

      let text = item.plain_text;
      if (!text) return "";

      const { bold, italic, strikethrough, code } = item.annotations;

      // 순서 중요: code는 다른 어노테이션과 중첩하지 않음
      if (code) return `\`${text}\``;
      if (bold && italic) text = `***${text}***`;
      else if (bold) text = `**${text}**`;
      else if (italic) text = `*${text}*`;
      if (strikethrough) text = `~~${text}~~`;
      if (item.href) text = `[${text}](${item.href})`;

      return text;
    })
    .join("");
}

// 자식 마크다운 각 줄에 prefix 추가 (인용/callout 들여쓰기용)
function prefixLines(md: string, prefix: string): string {
  return md
    .split("\n")
    .map((line) => (line.trim() ? `${prefix}${line}` : line))
    .join("\n");
}

// 단일 블록을 마크다운으로 변환
// childrenMd: 이미 변환된 자식 블록들의 마크다운 (재귀 호출 결과)
export function blockToMarkdown(
  block: BlockObjectResponse,
  childrenMd: string
): string {
  switch (block.type) {
    case "paragraph": {
      const text = richTextToMd(block.paragraph.rich_text);
      // 빈 paragraph는 빈 줄로 취급
      return text || "";
    }

    case "heading_1":
      return `# ${richTextToMd(block.heading_1.rich_text)}`;

    case "heading_2":
      return `## ${richTextToMd(block.heading_2.rich_text)}`;

    case "heading_3":
      return `### ${richTextToMd(block.heading_3.rich_text)}`;

    case "bulleted_list_item": {
      const text = richTextToMd(block.bulleted_list_item.rich_text);
      const nested = childrenMd
        ? "\n" + prefixLines(childrenMd, "  ")
        : "";
      return `- ${text}${nested}`;
    }

    case "numbered_list_item": {
      const text = richTextToMd(block.numbered_list_item.rich_text);
      const nested = childrenMd
        ? "\n" + prefixLines(childrenMd, "  ")
        : "";
      return `1. ${text}${nested}`;
    }

    case "to_do": {
      const checked = block.to_do.checked ? "x" : " ";
      return `- [${checked}] ${richTextToMd(block.to_do.rich_text)}`;
    }

    case "code": {
      const lang = block.code.language ?? "";
      const text = block.code.rich_text.map((t) => t.plain_text).join("");
      return `\`\`\`${lang}\n${text}\n\`\`\``;
    }

    case "quote": {
      const text = richTextToMd(block.quote.rich_text);
      const nested = childrenMd ? "\n" + prefixLines(childrenMd, "> ") : "";
      return `> ${text}${nested}`;
    }

    case "callout": {
      const icon =
        block.callout.icon?.type === "emoji"
          ? `${block.callout.icon.emoji} `
          : "";
      const text = richTextToMd(block.callout.rich_text);
      const nested = childrenMd ? "\n" + prefixLines(childrenMd, "> ") : "";
      return `> ${icon}${text}${nested}`;
    }

    case "toggle": {
      // toggle은 브라우저에서 접기/펼치기지만 마크다운엔 없으므로 일반 텍스트로 렌더
      const text = richTextToMd(block.toggle.rich_text);
      return [text, childrenMd].filter(Boolean).join("\n\n");
    }

    case "divider":
      return "---";

    case "image": {
      const url =
        block.image.type === "external"
          ? block.image.external.url
          : block.image.file.url;
      const caption =
        block.image.caption.length > 0
          ? richTextToMd(block.image.caption)
          : "";
      return `![${caption}](${url})`;
    }

    case "video": {
      const url =
        block.video.type === "external" ? block.video.external.url : "";
      return url ? `[Video](${url})` : "";
    }

    case "bookmark": {
      const url = block.bookmark.url;
      const caption =
        block.bookmark.caption.length > 0
          ? richTextToMd(block.bookmark.caption)
          : url;
      return `[${caption}](${url})`;
    }

    case "link_preview":
      return `[${block.link_preview.url}](${block.link_preview.url})`;

    case "equation":
      return `$$\n${block.equation.expression}\n$$`;

    // column_list / column: 자식을 순서대로 이어붙임
    case "column_list":
    case "column":
      return childrenMd;

    case "table": {
      // 자식 table_row들이 childrenMd에 줄 단위로 쌓여있음
      // has_column_header가 true면 첫 행 아래에 구분선 삽입
      const rows = childrenMd.trim().split("\n").filter(Boolean);
      if (block.table.has_column_header && rows.length > 0) {
        const colCount = block.table.table_width;
        const separator = `| ${Array(colCount).fill("---").join(" | ")} |`;
        rows.splice(1, 0, separator);
      }
      return rows.join("\n");
    }

    case "table_row": {
      const cells = block.table_row.cells
        .map((cell) => richTextToMd(cell))
        .join(" | ");
      return `| ${cells} |`;
    }

    case "synced_block":
      // 원본이면 children 렌더, 동기화 복사본이면 빈 문자열 (원본에서 이미 렌더됨)
      return childrenMd;

    default:
      return "";
  }
}
