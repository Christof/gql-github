import * as React from "react";
import { App } from "../../src/components/app";
import { shallow, mount } from "enzyme";
import { waitImmediate } from "../helper";

describe("App", function() {
  describe("AppBar", function() {
    it("renders the tilte, MenuButtons and GithubButton", function() {
      const wrapper = mount(<App />);

      const appBar = wrapper.find("WithStyles(AppBar)");
      expect(appBar).toHaveLength(1);

      const title = appBar.find("WithStyles(Typography)");
      expect(title).toHaveLength(1);
      expect(title.prop("children")).toEqual("Github Stats & Releases");

      const menuButtons = appBar.find("MenuButton");
      expect(menuButtons).toHaveLength(5);

      expect(appBar.find("GithubButton")).toHaveLength(1);
    });
  });
});
