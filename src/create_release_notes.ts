import * as program from "commander";
import * as readline from "readline";
import { promisify } from "util";
import { exec } from "child_process";
const sh = promisify(exec);

program
  .version("0.0.1")
  .option("--owner <repository owner>", "Owner of the repository")
  .option("--repo <repository name>", "Name of the repository")
  .option("--start <tag>", "The start tag of the range for the release")
  .option("--end <tag>", "The end tag of the range for the release")
  .parse(process.argv);

const repositoryOwner = program.owner;
const repositoryName = program.repo;

const start = program.start;
const end = program.end;

async function getMergeCommitsBetweenTags(
  start: string,
  end: string,
  repo: string
) {
  const { stdout, stderr } = await sh(
    `cd ~/Documents/${repo} && \
    git log ${start}..${end} | \
    grep "Merge pull" --after-context=2`
  );

  if (stderr) throw new Error(stderr);

  const lines = stdout.split("\n");
  const importantLines = lines.reduce(
    (accumulator, line) => {
      if (/\S/.test(line) && line.indexOf("--") !== 0) accumulator.push(line);

      return accumulator;
    },
    [] as string[]
  );

  const pullRequestNumberRegex = new RegExp(/#\d*/);
  const pullRequests = importantLines.reduce(
    (accumulator, line, index, array) => {
      if (index % 2 === 0) return accumulator;

      const pullRequestNumberMatch = array[index - 1].match(
        pullRequestNumberRegex
      );
      const result = `- ${line.trim()} (${pullRequestNumberMatch})`;
      accumulator.push(result);
      return accumulator;
    },
    [] as string[]
  );

  return pullRequests;
}

async function assignPRsToCategory(pullRequests: string[]) {
  const basicChanges = [] as string[];
  const trainingChanges = [] as string[];
  const breakingChanges = [] as string[];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(pullRequests.join("\n"));

  console.log("Assign PRs to category:");
  console.log("  b -> breaking change");
  console.log("  t -> training change");
  console.log("default is basic change");
  const questions = pullRequests.map(pullRequest => {
    return () => {
      return new Promise(resolve => {
        rl.question(`'${pullRequest} [b, t]?`, answer => {
          if (answer === "b") {
            breakingChanges.push(pullRequest);
          } else if (answer === "t") {
            trainingChanges.push(pullRequest);
          } else {
            basicChanges.push(pullRequest);
          }

          resolve();
        });
      });
    };
  });

  for (const question of questions)
    await question();

  console.log("---------- RELEASE NOTES ----------");
  if (breakingChanges.length) {
    console.log(
      "**Breaking changes:**\n\n" + breakingChanges.join("\n") + "\n"
    );
  }
  if (basicChanges.length) {
    console.log("**Basic changes:**\n\n" + basicChanges.join("\n") + "\n");
  }
  if (trainingChanges.length) {
    console.log(
      "**Training changes:**\n\n" + trainingChanges.join("\n") + "\n"
    );
  }
}

getMergeCommitsBetweenTags(start, end, repositoryName).then(pullRequests =>
  assignPRsToCategory(pullRequests)
);
