import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  RepositoriesByOwnerSelector,
  LoadData
} from "../../src/components/repositories_by_owner_selector";

jest.mock("../../src/components/owner_dropdown", () => ({
  OwnerDropdown: ({ onSelect }: any) => (
    <button
      data-testid="owner-dropdown"
      onClick={() => onSelect("selectedOwner")}
    >
      Select Owner
    </button>
  )
}));

describe("RepositoriesByOwnerSelector", function () {
  describe("button before selection", function () {
    it("is disabled", function () {
      render(
        <RepositoriesByOwnerSelector github={{} as any} onLoad={() => {}} />
      );
      expect(screen.getByRole("button", { name: /Load/i })).toBeDisabled();
    });
  });

  describe("click load after selecting owner and checking includeForks", function () {
    it("calls onLoad with selected owner and includeForks true", function () {
      let setData: LoadData;

      render(
        <RepositoriesByOwnerSelector
          github={{} as any}
          onLoad={data => (setData = data)}
        />
      );

      fireEvent.click(screen.getByTestId("owner-dropdown"));

      expect(screen.getByRole("button", { name: /Load/i })).not.toBeDisabled();

      fireEvent.click(screen.getByRole("checkbox", { name: /Include Forks/i }));

      fireEvent.click(screen.getByRole("button", { name: /Load/i }));

      expect(setData.includeForks).toBe(true);
      expect(setData.owner).toEqual("selectedOwner");
    });
  });
});
