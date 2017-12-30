const express = require("express");
const request = require("request-promise-native");
const qs = require("qs");

const app = express();

app.get("/authenticate/:code", function(req, res) {
  const params = {
    mode: "no-cors",
    headers: [["Content-Type", "test/plain"], ["Accept", "application/json"]]
  };

  const githubAuthUrl =
    "https://github.com/login/oauth/access_token?" +
    qs.stringify({
      client_id: "1e031c3e419938e53c8e",
      client_secret: "",
      redirect_uri: window.location.origin + "/auth-callback",
      code: this.code,
      state: this.state
    });
  request.post(githubAuthUrl, options).then(response => {
    const retrievedParams = response.json();
    console.log(retrievedParams);
    res.json({ token: retrievedParams.token });
  });
});

const port = 7000;
const host = "localhost";
app.listen(port, host, () => {
  console.log(`Server running on: http://${host}:${port}`);
});
