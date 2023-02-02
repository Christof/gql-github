import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown(props: { source: string }) {
  return (
    <div style={{ fontFamily: "Roboto, Helvetica, Arial, sans-serif" }}>
      <ReactMarkdown children={props.source} remarkPlugins={[remarkGfm]} />
    </div>
  );
}
