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

type QuestionCallback = () => Promise<{}>;

class Category {
  public pullRequests = [] as string[];

  constructor(public header: string, public shortcut?: string) {}

  match(input: string) {
    return this.shortcut === undefined ? true : this.shortcut === input;
  }

  addIfMatching(input: string, pullRequest: string) {
    if (this.match(input)) {
      this.pullRequests.push(pullRequest);
      return true;
    }

    return false;
  }

  printLegendLine() {
    const key =
      this.shortcut === undefined ? "default is " : `${this.shortcut} -> `;
    console.log(key + this.header);
  }

  print() {
    if (this.pullRequests.length === 0) return;

    const heading = this.header.charAt(0).toUpperCase() + this.header.slice(1);
    console.log(`**${heading}:**\n\n${this.pullRequests.join("\n")}\n`);
  }
}

class ReleaseNoteCreator {
  private categories = [
    new Category("breaking changes", "b"),
    new Category("training changes", "t"),
    new Category("basic changes")
  ];
  async getMergeCommitsBetweenTags(start: string, end: string, repo: string) {
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

  private createQuestions(pullRequests: string[]): QuestionCallback[] {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    return pullRequests.map(pullRequest => {
      return () => {
        return new Promise(resolve => {
          rl.question(`Category for '${pullRequest}'?`, answer => {
            this.categories.some(catgory =>
              catgory.addIfMatching(answer, pullRequest)
            );

            resolve();
          });
        });
      };
    });
  }
  async assignPRsToCategory(questions: QuestionCallback[]) {
    console.log("Assign PRs to category:");
    this.categories.forEach(category => category.printLegendLine());

    for (const question of questions) await question();

    console.log("\n\n---------- RELEASE NOTES ----------\n");
    this.categories.forEach(category => category.print());
  }

  async create(start: string, end: string, repo: string) {
    const pullRequests = await this.getMergeCommitsBetweenTags(
      start,
      end,
      repo
    );
    const questions = this.createQuestions(pullRequests);
    await this.assignPRsToCategory(questions);
  }
}

const releaseNoteCreator = new ReleaseNoteCreator();
releaseNoteCreator.create(start, end, repositoryName);
