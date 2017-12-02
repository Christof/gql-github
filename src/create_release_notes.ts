import * as program from "commander";
import { ReleaseNoteCreator } from "./release_note_creator";

program
  .version("0.0.1")
  .option("--owner <repository owner>", "Owner of the repository")
  .option("--repo <repository name>", "Name of the repository")
  .option("--start <tag>", "The start tag of the range for the release")
  .option("--end <tag>", "The end tag of the range for the release")
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
