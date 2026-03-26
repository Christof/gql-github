import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GithubButton } from "../../src/components/github_button";
import { Github, GithubUser } from "../../src/github";
import { waitImmediate } from "../helper";

declare const jsdom: any;

jest.mock("../../src/github");

describe("GithubButton", function () {
  describe("login", function () {
    describe("on localhost", function () {
      it("changes window location to github login page", function () {
        jsdom.reconfigure({ url: "http://localhost:3000" });
        delete (window as any).location;
        (window as any).location = {
          assign: jest.fn(),
          host: "localhost:3000",
          origin: "http://localhost:3000",
          href: "http://localhost:3000"
        };

        render(<GithubButton onChangeToken={() => {}} />);

        const loginButton = screen.getByRole("button", { name: /Login/i });
        expect(loginButton).toBeInTheDocument();

        fireEvent.click(loginButton);

        expect(window.location.assign).toHaveBeenCalled();
        const newUrl = (window.location.assign as jest.Mock).mock.calls[0][0];
        expect(newUrl).toContain("https://github.com/login/oauth");
      });
    });

    describe("in production", function () {
      it("changes window location to github login page", function () {
        jsdom.reconfigure({ url: "http://some-server.com" });
        const token = "my token";
        const authenticator = {
          authenticate: jest.fn((_args: any, callback: any) =>
            callback(undefined, { token })
          )
        };

        let changedToken = "";
        render(
          <GithubButton
            onChangeToken={t => {
              changedToken = t;
            }}
            authenticator={authenticator}
          />
        );

        fireEvent.click(screen.getByRole("button", { name: /Login/i }));

        expect(authenticator.authenticate).toHaveBeenCalled();
        expect(changedToken).toEqual(token);
      });

      it("doesn't call onChangeToken on authenticate error", function () {
        jsdom.reconfigure({ url: "http://some-server.com" });
        const authenticator = {
          authenticate: jest.fn((_args: any, callback: any) =>
            callback(new Error("test error"), undefined)
          )
        };

        const changedTokenCallback = jest.fn();
        render(
          <GithubButton
            onChangeToken={changedTokenCallback}
            authenticator={authenticator}
          />
        );

        fireEvent.click(screen.getByRole("button", { name: /Login/i }));

        expect(authenticator.authenticate).toHaveBeenCalled();
        expect(changedTokenCallback).not.toHaveBeenCalled();
      });
    });

    it("shows github mark in login button", function () {
      render(<GithubButton onChangeToken={() => {}} />);
      const img = screen.getByRole("img") as HTMLImageElement;
      expect(img.src).toContain("mark");
    });

    it("loads avatar image after logged in", async function () {
      const avatarUrl = "url-to-avatar";
      const github = new Github("token", {} as any, undefined);
      github.getUser = jest.fn(() =>
        Promise.resolve({ avatarUrl } as GithubUser)
      );

      const { rerender } = render(<GithubButton onChangeToken={() => {}} />);

      rerender(<GithubButton github={github} onChangeToken={() => {}} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /Logout/i })).toBeInTheDocument();
      });

      const img = screen.getByRole("img") as HTMLImageElement;
      expect(img.src).toContain(avatarUrl);
    });
  });

  describe("logout", function () {
    it("clears localstorage and calls onChangeToken with undefined", function () {
      const avatarUrl = "url-to-avatar";
      const github = new Github("token", {} as any, undefined);
      github.getUser = jest.fn(() =>
        Promise.resolve({ avatarUrl } as GithubUser)
      );

      let changedToken: string = "initial";

      render(
        <GithubButton
          github={github}
          onChangeToken={token => (changedToken = token)}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /Logout/i }));

      expect(window.localStorage.clear).toHaveBeenCalled();
      expect(changedToken).toBeUndefined();
    });

    it("does not reload avatar on update if github instance is the same", async function () {
      const avatarUrl = "url-to-avatar";
      const github = new Github("token", {} as any, undefined);
      github.getUser = jest.fn(() =>
        Promise.resolve({ avatarUrl } as GithubUser)
      );

      const { rerender } = render(
        <GithubButton github={github} onChangeToken={() => {}} />
      );

      rerender(<GithubButton github={github} onChangeToken={() => {}} />);

      await waitImmediate();

      expect(github.getUser).toHaveBeenCalledTimes(1);
    });
  });
});
