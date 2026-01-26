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
      /(?:Merge pull request #(\d+).*?\n\n([\s\S]*)|([\s\S]*?)\s*\(#(\d+)\))/
    );
    const match = commitMessage.match(pullRequestPartsRegex);

    const text = match[2] ?? match[3];
    const id = match[1] ?? match[4];
    return new PullRequest(text, id, ChangeCategory.Basic);
  }

  toString() {
    return `- ${this.text} (#${this.id})`;
  }

  toText() {
    return `${this.text} (#${this.id})`;
  }
}
