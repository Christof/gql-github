import * as React from "react";
import { GithubTag } from "../github_types";
import { Dropdown } from "./dropdown";
import { Button } from "@material-ui/core";

interface Props {
  defaultStartTag?: string;
  defaultEndTag?: string;
  tags: GithubTag[];
  onSelect: (startTag: string, endTag: string) => void;
}

export class TagRangeSelector extends React.Component<
  Props,
  { startTag: string; releaseTag: string }
> {
  constructor(props: Props) {
    super(props);

    this.state = {
      startTag: props.defaultStartTag,
      releaseTag: props.defaultEndTag
    };
  }
  render() {
    const tagNames = this.props.tags.map(tag => tag.name);
    const disabledGetPRsButton =
      this.state.startTag === undefined || this.state.releaseTag === undefined;
    return (
      <>
        <Dropdown
          label="Start Tag"
          options={tagNames}
          initialSelection={this.props.defaultStartTag}
          onSelect={tagName => this.setState({ startTag: tagName })}
        />
        <Dropdown
          label="End Tag"
          options={tagNames}
          initialSelection={this.props.defaultEndTag}
          onSelect={tagName => this.setState({ releaseTag: tagName })}
        />
        <Button
          variant="contained"
          onClick={() =>
            this.props.onSelect(this.state.startTag, this.state.releaseTag)
          }
          disabled={disabledGetPRsButton}
        >
          Get merged PRs in range
        </Button>
      </>
    );
  }
}
