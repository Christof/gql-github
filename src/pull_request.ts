export enum ChangeCategory {
  Basic = "Basic",
  Training = "Training",
  Breaking = "Breaking"
}

export class PullRequest {
  constructor(
    public text: string,
    public id: string,
    public changeCategory: ChangeCategory
  ) {}

  static parseFrom(commitMessage: string) {
    const pullRequestPartsRegex = new RegExp(
      /Merge pull request #(\d*) .*?\n\n(.*)/
    );
    const match = commitMessage.match(pullRequestPartsRegex);

    const text = match[2];
    const id = match[1];
    return new PullRequest(text, id, ChangeCategory.Basic);
  }

  toString() {
    return `- ${this.text} (#${this.id})`;
  }

  toText() {
    return `${this.text} (#${this.id})`;
  }
}
