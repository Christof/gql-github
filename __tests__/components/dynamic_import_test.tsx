import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createDynamicImport } from "../../src/components/dynamic_import";

class TestComponent extends React.Component<{ n: number }> {
  render() {
    return <div>Number: {this.props.n}</div>;
  }
}

describe("createDynamicImport", function () {
  describe("before load is finished", function () {
    it("shows 'Loading!' in h1", function () {
      const Component = createDynamicImport<{ n: number }>(
        () => new Promise<typeof TestComponent>(() => {})
      );

      render(<Component n={1} />);

      expect(
        screen.getByRole("heading", { level: 1, name: "Loading!" })
      ).toBeInTheDocument();
    });
  });

  describe("after load is finished", function () {
    it("shows content of TestComponent", async function () {
      const Component = createDynamicImport<{ n: number }>(
        () =>
          new Promise<typeof TestComponent>(resolve => {
            resolve(TestComponent);
          })
      );

      render(<Component n={1} />);

      await waitFor(() => {
        expect(screen.getByText("Number: 1")).toBeInTheDocument();
      });
    });
  });
});
