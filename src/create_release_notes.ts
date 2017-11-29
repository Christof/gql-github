import * as program from "commander";
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
  const i = importantLines.reduce(
    (accumulator, line, index, array) => {
      if (index % 2 === 0) return accumulator;

      const pullRequestNumberMatch = array[index - 1].match(
        pullRequestNumberRegex
      );
      const result = `- ${line.trim()} (${pullRequestNumberMatch})`;
      accumulator.push(result);
      return accumulator;
    },
    [] as String[]
  );
  console.log(i.join("\n"));
}

getMergeCommitsBetweenTags(start, end, repositoryName);
