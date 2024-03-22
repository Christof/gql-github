import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown(props: { source: string; fontFamily?: string }) {
  return (
    <div
      style={{
        fontFamily: props.fontFamily ?? "Roboto, Helvetica, Arial, sans-serif"
      }}
    >
      <ReactMarkdown children={props.source} remarkPlugins={[remarkGfm]} />
    </div>
  );
}
