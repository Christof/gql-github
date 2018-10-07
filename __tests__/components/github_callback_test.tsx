import * as React from "react";
import { GithubCallback } from "../../src/components/github_callback";
import { shallow } from "enzyme";
import { waitImmediate } from "../helper";

describe("GithubCallback", function() {
  afterEach(() => window.localStorage.clear());
  describe("componentDidMount", function() {
    it("throws an error if states do not match", function() {
      window.localStorage.setItem("githubState", "some state");

      const location: any = { search: "?state=other-state" };
      expect(() =>
        shallow(
          <GithubCallback
            onChangeToken={undefined}
            match={undefined}
            location={location}
            history={undefined}
            fetch={undefined}
          />
        )
      ).toThrowError(/Retrieved state is not equal to sent one./);
    });

    it("calls to local authenticate route", async function() {
      window.localStorage.setItem("githubState", "state");

      const location: any = { search: "?state=state&code=mycode" };
      const fetch = jest.fn();
      const token = "token";
      fetch.mockReturnValue({
        json() {
          return Promise.resolve({ access_token: token });
        }
      });
      const history: any = {
        push: jest.fn()
      };

      let newToken: string;

      const wrapper = shallow(
        <GithubCallback
          onChangeToken={t => {
            newToken = t;
          }}
          fetch={fetch}
          match={undefined}
          location={location}
          history={history}
        />
      );

      expect(wrapper).toBeDefined();

      await waitImmediate();

      expect(fetch).toHaveBeenCalled();
      expect(fetch.mock.calls[0][0]).toEqual(
        "http://test.com:7000/authenticate?code=mycode&state=state"
      );
      expect(fetch.mock.calls[0][1]).toEqual({ method: "GET" });
      expect(newToken).toEqual(token);
      expect(history.push).toHaveBeenCalledWith("/stats");
    });
  });
});
