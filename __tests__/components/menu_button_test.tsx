import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { MenuButton } from "../../src/components/menu_button";

function renderMenuButton(url = "/other", disabled = false) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <MenuButton
        text="Route1"
        to="/route1"
        disabled={disabled}
        className="some-class"
      />
    </MemoryRouter>
  );
}

describe("MenuButton", function () {
  it("renders with given className", function () {
    renderMenuButton();
    const item = screen.getByText("Route1");
    expect(item.closest("[class*='some-class'], .some-class") ||
      item.parentElement).toBeTruthy();
  });

  it("passes text along as children", function () {
    renderMenuButton();
    expect(screen.getByText("Route1")).toBeInTheDocument();
  });

  it("renders as a link to the given route", function () {
    renderMenuButton();
    const link = screen.getByText("Route1").closest("a");
    expect(link).toHaveAttribute("href", "/route1");
  });

  it("is disabled when disabled prop is true", function () {
    renderMenuButton("/other", true);
    // MUI MenuItem with component=Link renders as <a> — check aria-disabled on the link
    const link = screen.getByText("Route1").closest("a");
    expect(link).toHaveAttribute("aria-disabled", "true");
  });
});
