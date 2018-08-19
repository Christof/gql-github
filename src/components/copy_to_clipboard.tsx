import * as React from "react";
import { Button } from "@material-ui/core";

interface Props {
  text: string;
  onClick?: () => void;
}

export class CopyToClipboard extends React.Component<Props, {}> {
  private copyToClipboard() {
    const range = document.createRange();
    const selection = document.getSelection();
    selection.empty();
    const copyText = document.getElementById("textToCopy");
    range.selectNode(copyText);
    selection.addRange(range);
    document.execCommand("Copy");
  }

  private onClick = () => {
    if (this.props.onClick) {
      this.props.onClick();
    }

    this.copyToClipboard();
  };

  render() {
    return (
      <>
        <span
          style={{
            userSelect: "text",
            whiteSpace: "pre",
            position: "absolute",
            clip: "rect(0, 0, 0, 0)"
          }}
          id="textToCopy"
        >
          {this.props.text}
        </span>
        <Button variant="raised" onClick={this.onClick}>
          Copy
        </Button>
      </>
    );
  }
}
