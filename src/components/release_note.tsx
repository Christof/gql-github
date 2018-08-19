import * as React from "react";
import { Markdown } from "./markdown";
import { Github } from "../github";
import { withSnackbar } from "./snackbar";
import { CopyToClipboard } from "./copy_to_clipboard";

const ButtonWithSnackbar = withSnackbar(CopyToClipboard, "onClick");

interface Props {
  releaseNote: string;
  Markdown: typeof Markdown;
  releaseTag: string;
  repo: string;
  github: Github;
}

export class ReleaseNote extends React.Component<Props> {
  async postRelease() {
    const release = {
      tag_name: this.props.releaseTag,
      target_commitish: "master",
      name: this.props.releaseTag,
      body: this.props.releaseNote,
      draft: false,
      prerelease: false
    };

    const response = await this.props.github.postRelease(
      this.props.repo,
      release
    );

    if (!response.ok) {
      throw Error(
        `Release could not be posted: status code ${
          response.status
        }, status text ${response.statusText}`
      );
    }
  }

  render() {
    const releaseNoteWithHeader =
      `# ${this.props.releaseTag}\n\n` + this.props.releaseNote;
    return (
      <>
        <this.props.Markdown source={releaseNoteWithHeader} />
        <ButtonWithSnackbar
          snackbarMessage={<span>Release created</span>}
          onClick={() => this.postRelease()}
          text={releaseNoteWithHeader}
          buttonText="Create Release"
        />
      </>
    );
  }
}
