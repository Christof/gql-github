import * as React from "react";
import { ReleaseNotesRetriever } from "../../src/components/release_notes_retriever";
import { shallow } from "enzyme";
import { waitImmediate } from "../helper";
import { Github } from "../../src/github";
import { RepositorySelector } from "../../src/components/repository_selector";
import { Dropdown } from "../../src/components/dropdown";
import { Markdown } from "../../src/components/markdown";
import { CopyToClipboard } from "../../src/components/copy_to_clipboard";

jest.mock("../../src/github");

describe("ReleaseNotesRetriever", function() {
  it("shows selected release note", async function() {
    const github = new Github("token", {} as any, undefined);
    let wrapper = shallow(<ReleaseNotesRetriever github={github} />);

    const respositorySelector = wrapper.find(RepositorySelector);
    expect(respositorySelector).toHaveLength(1);

    github.getReleases = jest.fn(() => [
      { tagName: "v0.0.1", description: "description 1" },
      { tagName: "v0.0.2", description: "description 2" }
    ]);
    (respositorySelector.prop("onRepositorySelect") as any)("myRepo" as any);

    await waitImmediate();
    wrapper.update();

    const releasesDropdown = wrapper.find(Dropdown);
    expect(releasesDropdown).toHaveLength(1);
    expect(releasesDropdown.prop("options")).toEqual(["v0.0.1", "v0.0.2"]);

    releasesDropdown.prop("onSelect")("v0.0.1" as any);

    await waitImmediate();
    wrapper.update();

    const expectedReleaseText = "# v0.0.1\n\ndescription 1\n";

    expect(wrapper.find(Markdown).prop("source")).toEqual(expectedReleaseText);
    expect(wrapper.find(CopyToClipboard).prop("text")).toEqual(
      expectedReleaseText
    );
  });
});
