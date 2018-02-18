import * as React from "react";
import { ReleaseNotesRetriever } from "../../src/components/release_notes_retriever";
import { shallow } from "enzyme";
import { Github } from "../../src/github";

jest.mock("../../src/github");

describe("ReleaseNotesRetriever", function() {
  it("shows selected release note", function() {
    const github = new Github("token", {} as any);
    const wrapper = shallow(<ReleaseNotesRetriever github={github} />);

    expect(wrapper.find("RepositorySelector")).toHaveLength(1);
  });
});
