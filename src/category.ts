export class Category {
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

  toString() {
    if (this.pullRequests.length === 0) return "";

    const heading = this.header.charAt(0).toUpperCase() + this.header.slice(1);
    return `**${heading}:**\n\n${this.pullRequests.join("\n")}\n`;
  }
}
