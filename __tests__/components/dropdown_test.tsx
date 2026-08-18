import * as React from "react";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Dropdown } from "../../src/components/dropdown";

describe("Dropdown", function () {
  describe("with label", function () {
    it("adds an InputLabel", function () {
      render(<Dropdown options={[]} label="label" onSelect={() => {}} />);
      const label = screen.getByText("label", { selector: "label" });
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute("for", "label");
    });

    it("renders a disabled option with value none", function () {
      render(<Dropdown options={[]} label="label" onSelect={() => {}} />);
      const selectButton = screen.getByRole("combobox");
      expect(selectButton).toHaveTextContent(/Select.*label/);
    });
  });

  it("renders a Select with given options", async function () {
    render(<Dropdown options={["opt1", "opt2"]} onSelect={() => {}} />);

    fireEvent.mouseDown(screen.getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");

    expect(within(listbox).getByText("opt1")).toBeInTheDocument();
    expect(within(listbox).getByText("opt2")).toBeInTheDocument();
  });

  describe("initialSelection", function () {
    it("displays initial selection", function () {
      render(
        <Dropdown
          options={["opt1", "opt2"]}
          initialSelection="opt2"
          onSelect={() => {}}
        />
      );
      expect(screen.getByRole("combobox")).toHaveTextContent("opt2");
    });
  });

  describe("componentDidUpdate", function () {
    it("sets an initial selection if given and the options change", function () {
      const { rerender } = render(
        <Dropdown
          options={["opt1", "opt2"]}
          initialSelection="opt2"
          onSelect={() => {}}
        />
      );

      rerender(
        <Dropdown
          options={["optionA", "optionB"]}
          initialSelection="optionA"
          onSelect={() => {}}
        />
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("optionA");
    });

    it("doesn't update the selection if the options are the same", function () {
      const options = ["opt1", "opt2"];
      const { rerender } = render(
        <Dropdown
          options={options}
          initialSelection="opt2"
          onSelect={() => {}}
        />
      );

      rerender(
        <Dropdown
          options={options}
          initialSelection="opt1"
          onSelect={() => {}}
        />
      );

      expect(screen.getByRole("combobox")).toHaveTextContent("opt2");
    });
  });

  describe("onSelect", function () {
    it("on selection calls onSelect", async function () {
      let selected = "";
      render(
        <Dropdown
          options={["opt1", "opt2"]}
          onSelect={value => (selected = value)}
        />
      );

      fireEvent.mouseDown(screen.getByRole("combobox"));
      const listbox = await screen.findByRole("listbox");
      fireEvent.click(within(listbox).getByText("opt2"));

      expect(selected).toEqual("opt2");
    });
  });

  describe("iconUrls", function () {
    it("adds an img before each option", async function () {
      render(
        <Dropdown
          options={["opt1", "opt2"]}
          iconUrls={["url1", "url2"]}
          onSelect={() => {}}
        />
      );

      fireEvent.mouseDown(screen.getByRole("combobox"));
      const listbox = await screen.findByRole("listbox");

      const imgs = within(listbox).getAllByRole("img") as HTMLImageElement[];
      expect(imgs[0].src).toContain("url1");
      expect(imgs[1].src).toContain("url2");
    });
  });
});
