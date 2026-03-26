import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { OwnerDropdown } from "../../src/components/owner_dropdown";

// Mock Dropdown to make selection straightforward
jest.mock("../../src/components/dropdown", () => ({
  Dropdown: ({ options, iconUrls, onSelect }: any) => (
    <div data-testid="dropdown">
      {(options || []).map((opt: string, i: number) => (
        <button
          key={opt}
          data-testid={`option-${opt}`}
          data-icon={iconUrls ? iconUrls[i] : undefined}
          onClick={() => onSelect(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}));

describe("OwnerSelector", function () {
  it("calls onSelect on owner selection", async function () {
    const owner = "owner2";

    const github = {
      getOwnersWithAvatar() {
        return Promise.resolve([
          { login: "owner1", avatarUrl: "icon1" },
          { login: owner, avatarUrl: "icon2" }
        ]);
      }
    } as any;

    let selectedOwner: string;

    render(
      <OwnerDropdown
        github={github}
        onSelect={o => (selectedOwner = o)}
      />
    );

    await waitFor(() => screen.getByTestId("option-owner1"));

    fireEvent.click(screen.getByTestId("option-owner2"));

    expect(selectedOwner).toEqual(owner);
  });

  it("loads owners and icon urls from github", async function () {
    const github = {
      getOwnersWithAvatar() {
        return Promise.resolve([
          { login: "owner1", avatarUrl: "icon1" },
          { login: "owner2", avatarUrl: "icon2" }
        ]);
      }
    } as any;

    render(<OwnerDropdown github={github} onSelect={() => {}} />);

    await waitFor(() => {
      expect(screen.getByTestId("option-owner1")).toBeInTheDocument();
      expect(screen.getByTestId("option-owner2")).toBeInTheDocument();
    });

    expect(screen.getByTestId("option-owner1")).toHaveAttribute(
      "data-icon",
      "icon1"
    );
    expect(screen.getByTestId("option-owner2")).toHaveAttribute(
      "data-icon",
      "icon2"
    );
  });
});
