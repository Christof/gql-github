import * as program from "commander";
import * as request from "request-promise-native";
import * as fs from "fs";
import { promisify } from "util";

const token = process.env.TOKEN;
program
  .version("0.0.1")
  .option("--owner <repository owner>", "Owner of the repository")
  .option("--repo <repository name>", "Name of the repository")
  .description(`TBD`)
  .parse(process.argv);

if (program.repo === undefined || program.owner === undefined) {
  console.error("Input arguments missing! See help output:");
  program.outputHelp();
  process.exit(1);
}

async function getStatsFor(owner: string, repo: string) {
  const filename = `stats_${repo}.json`;
  if (fs.existsSync(filename)) {
    const readFile = promisify(fs.readFile);
    return JSON.parse(await readFile(filename, "utf8"));
  }
  const options: request.Options = {
    method: "GET",
    uri: `https://api.github.com/repos/${owner}/${repo}/stats/contributors`,
    auth: { bearer: token },
    headers: { "User-Agent": owner },
    json: true
  };

  const response = await request(options);
  console.log(response);
  const writeFile = promisify(fs.writeFile);
  await writeFile(filename, JSON.stringify(response));

  return response;
}

getStatsFor(program.owner, program.repo).catch(error => {
  console.error(error);
  process.exit(1);
});
