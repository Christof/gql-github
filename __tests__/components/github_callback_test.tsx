import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { GithubCallback } from "../../src/components/github_callback";

// Helper to render GithubCallback at a specific URL
function renderCallback(
  url: string,
  onChangeToken: (t: string) => void,
  fetchFn: any
) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route
          path="*"
          element={
            <GithubCallback onChangeToken={onChangeToken} fetch={fetchFn} />
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("GithubCallback", function () {
  afterEach(() => window.localStorage.clear());

  describe("componentDidMount / useEffect", function () {
    it("throws an error if states do not match", function () {
      window.localStorage.setItem("githubState", "some state");

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderCallback(
          "/?state=other-state",
          () => {},
          () => Promise.resolve({} as any)
        );
      }).toThrow(/Retrieved state is not equal to sent one./);

      consoleSpy.mockRestore();
    });

    it("calls to local authenticate route", async function () {
      window.localStorage.setItem("githubState", "state");

      const fetch = jest.fn();
      const token = "token";
      fetch.mockReturnValue(
        Promise.resolve({
          json() {
            return Promise.resolve({ access_token: token });
          }
        })
      );

      let newToken: string;

      renderCallback(
        "/?state=state&code=mycode",
        t => {
          newToken = t;
        },
        fetch
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      expect(fetch.mock.calls[0][0]).toEqual(
        "http://test.com:7000/authenticate?code=mycode&state=state"
      );
      expect(fetch.mock.calls[0][1]).toEqual({ method: "GET" });

      await waitFor(() => {
        expect(newToken).toEqual(token);
      });
    });
  });
});
