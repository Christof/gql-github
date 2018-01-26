import * as React from "react";
import * as ReactMarkdown from "react-markdown";

export function Markdown(props: { source: string }) {
  return (
    <div style={{ fontFamily: "Roboto, Helvetica, Arial, sans-serif" }}>
      <ReactMarkdown source={props.source} />
    </div>
  );
}