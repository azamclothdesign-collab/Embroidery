import type { ReactNode } from "react";

/**
 * Tiny, safe renderer for CMS text: "## heading", "- bullet", blank-line
 * paragraphs, **bold** and [text](https://link). No raw HTML is ever rendered.
 */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    if (match[1] !== undefined) out.push(<strong key={`${keyBase}-b${index}`}>{match[1]}</strong>);
    else if (match[2] !== undefined && match[3] !== undefined) {
      const external = match[3].startsWith("http");
      out.push(
        <a key={`${keyBase}-a${index}`} href={match[3]} className="link" {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}>
          {match[2]}
        </a>,
      );
    }
    last = match.index + match[0].length;
    index += 1;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = source.replaceAll("\r\n", "\n").split(/\n{2,}/);
  return (
    <div className={className ?? "prose-cms"}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.length === 0) return null;
        if (trimmed.startsWith("## ")) return <h2 key={i}>{inline(trimmed.slice(3), `h${i}`)}</h2>;
        if (trimmed.startsWith("### ")) return <h3 key={i}>{inline(trimmed.slice(4), `h${i}`)}</h3>;
        const lines = trimmed.split("\n");
        if (lines.every((line) => line.trimStart().startsWith("- "))) {
          return (
            <ul key={i}>
              {lines.map((line, j) => (
                <li key={j}>{inline(line.trimStart().slice(2), `l${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        // A heading line followed by bullets in the same block.
        if (lines[0]?.startsWith("## ") === true) {
          return (
            <div key={i}>
              <h2>{inline(lines[0].slice(3), `h${i}`)}</h2>
              <ul>
                {lines.slice(1).map((line, j) => (
                  <li key={j}>{inline(line.replace(/^\s*-\s*/, ""), `l${i}-${j}`)}</li>
                ))}
              </ul>
            </div>
          );
        }
        return <p key={i}>{inline(trimmed, `p${i}`)}</p>;
      })}
    </div>
  );
}
