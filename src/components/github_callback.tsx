import * as React from "react";
import { useEffect } from "react";
import * as qs from "qs";
import { useNavigate, useLocation } from "react-router-dom";
import { DefaultGrid } from "./default_grid";
import { Section } from "./section";

interface Props {
  onChangeToken: (token: string) => void;
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}

export function GithubCallback({ onChangeToken, fetch }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = qs.parse(location.search.substring(1));

    const githubState = queryParams.state;
    const storageState = window.localStorage.getItem("githubState") || undefined;
    if (githubState !== storageState) {
      throw new Error("Retrieved state is not equal to sent one. Possible CSRF!");
    }
    const state = window.localStorage.getItem("githubState");
    window.localStorage.removeItem("githubState");

    const code = queryParams.code as string;
    const params: RequestInit = { method: "GET" };
    const githubAuthUrl =
      `http://${window.location.hostname}:7000/authenticate?` +
      qs.stringify({ code, state });

    fetch(githubAuthUrl, params)
      .then(response => response.json())
      .then(data => {
        onChangeToken(data.access_token);
        navigate("/stats");
      });
  }, []);

  return (
    <DefaultGrid>
      <Section heading="Loading">
        <p>Waiting for credentials</p>
      </Section>
    </DefaultGrid>
  );
}
