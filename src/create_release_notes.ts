import * as program from "commander";
import { ReleaseNoteCreator } from "./release_note_creator";

program
  .version("0.0.1")
  .option("--owner <repository owner>", "Owner of the repository")
  .option("--repo <repository name>", "Name of the repository")
  .option("--start <tag>", "The start tag of the range for the release")
  .option("--end <tag>", "The end tag of the range for the release")
  .description(
    `Utility to get pull requests between start and end tags.
  Therefore it requires the repository to be checked out at
  '~/Documents/{repository name}/'. These PRs are categorized
  by the user and a release description is created, which
  is uploaded to github.`
  )
  .parse(process.argv);

const token = process.env.TOKEN;
const releaseNoteCreator = new ReleaseNoteCreator();
releaseNoteCreator
  .create(program.start, program.end, program.owner, program.repo, token)
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
