import { Category } from "./category";
import * as readline from "readline";
import * as request from "request-promise-native";
import { CommitsFromRepository } from "./commits_from_repository";

type QuestionCallback = () => Promise<{}>;

export class ReleaseNoteCreator {
  private categories = [
    new Category("breaking changes", "b"),
    new Category("training changes", "t"),
    new Category("basic changes")
  ];
  private rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  private assignToCategoryForAnswer(answer: string, pullRequest: string) {
    this.categories.some(catgory => catgory.addIfMatching(answer, pullRequest));
  }

  private createQuestion(pullRequest: string) {
    return new Promise(resolve => {
      this.rl.question(`Category for '${pullRequest}'?`, answer => {
        this.assignToCategoryForAnswer(answer, pullRequest);
        resolve();
      });
    });
  }

  private createQuestions(pullRequests: string[]): QuestionCallback[] {
    return pullRequests.map(pullRequest => {
      return () => this.createQuestion(pullRequest);
    });
  }
  async assignPRsToCategory(questions: QuestionCallback[]) {
    console.log("Assign PRs to category:");
    this.categories.forEach(category => category.printLegendLine());

    for (const question of questions) await question();

    console.log("\n\n---------- RELEASE NOTES ----------\n");
    const releaseDescription = this.categories
      .map(category => category.toString())
      .join("\n");
    console.log(releaseDescription);

    return releaseDescription;
  }

  private askIfReleaseShouldBePosted(
    release: string,
    tag: string
  ): Promise<boolean> {
    return new Promise(resolve => {
      this.rl.question(
        `Should the following release for ${tag} be posted?
        ${release}\n\n[y, n]`,
        answer => resolve(answer.toLowerCase() === "y")
      );
    });
  }

  private createRelease(tag: string, description: string) {
    return {
      tag_name: tag,
      target_commitish: "master",
      name: tag,
      body: description,
      draft: false,
      prerelease: false
    };
  }

  async postRelease(owner: string, repo: string, release: any, token: string) {
    const options: request.Options = {
      method: "POST",
      uri: `https://api.github.com/repos/${owner}/${repo}/releases`,
      body: {
        ...release
      },
      auth: { bearer: token },
      headers: { "User-Agent": owner },
      json: true
    };

    const response = await request(options);

    console.log("Release created: ", response.url);
  }

  async create(
    start: string,
    end: string,
    owner: string,
    repo: string,
    token: string
  ) {
    const commits = new CommitsFromRepository(repo);
    const pullRequests = await commits.getPullRequestCommitsBetween(start, end);
    const questions = this.createQuestions(pullRequests);
    const releaseDescription = await this.assignPRsToCategory(questions);
    const shouldBePosted = await this.askIfReleaseShouldBePosted(
      releaseDescription,
      end
    );

    if (!shouldBePosted) return;

    const release = this.createRelease(end, releaseDescription);
    await this.postRelease(owner, repo, release, token);
  }
}
