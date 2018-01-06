const express = require("express");
const request = require("request-promise-native");
const qs = require("qs");
const program = require("commander");
program
  .version("0.0.1")
  .option("--client-id <client id>", "Client id of Github OAuth app")
  .option(
    "--client-secret <client secret>",
    "Client secret of Github OAuth app"
  )
  .option("--port <server port>", "Server port")
  .option("--host <server host>", "Server host")
  .option("--origin <allowed origin>", "CORS allow origin pattern")
  .description(
    `Server to retrieve OAuth access tokens from GitHub.

  It listens for get requests on {host}:{port}/authenticate.
  The whole response body from GitHub is returned as JSON.`
  )
  .parse(process.argv);

if (
  !program.clientId ||
  !program.clientSecret ||
  !program.port ||
  !program.host ||
  !program.origin
) {
  console.log("Please provide all parameters. See help output:");
  program.outputHelp();
  process.exit(1);
}

const app = express();

app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", program.origin);
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/authenticate", function(req, res) {
  console.log("request token for code", req.query.code);
  const params = {
    mode: "no-cors",
    headers: [["Content-Type", "test/plain"], ["Accept", "application/json"]]
  };

  const githubAuthUrl =
    "https://github.com/login/oauth/access_token?" +
    qs.stringify({
      client_id: program.clientId,
      client_secret: program.clientSecret,
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

const port = program.port;
const host = program.host;
app.listen(port, host, () => {
  console.log(`Server running on: http://${host}:${port}`);
});
