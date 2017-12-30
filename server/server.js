const express = require("express");
const request = require("request-promise-native");
const qs = require("qs");

const app = express();

app.get("/authenticate", function(req, res) {
  console.log("request token for code", req.query.code);
  const params = {
    mode: "no-cors",
    headers: [["Content-Type", "test/plain"], ["Accept", "application/json"]]
  };

  // const redirect_uri = "localhost:3000/auth-callback";

  const githubAuthUrl =
    "https://github.com/login/oauth/access_token?" +
    qs.stringify({
      client_id: "1e031c3e419938e53c8e",
      client_secret: "",
      code: req.query.code,
      state: req.query.state
    });

  request
    .post(githubAuthUrl, { json: true })
    .then(responseBody => {
      console.log(responseBody);
      res.json(responseBody);
    })
    .catch(error => {
      console.error("Error during request for token:", error);
      res.statusCode = 500;
    });
});

const port = 7000;
const host = "localhost";
app.listen(port, host, () => {
  console.log(`Server running on: http://${host}:${port}`);
});
