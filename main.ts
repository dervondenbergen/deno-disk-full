enum OUTPUT {
  OK = "OK",
  DANGER = "DANGER",
  ERROR = "ERROR",
}

const status = (output: OUTPUT) => {
  console.log(output)
  Deno.exit();
};

const okay = () => { status(OUTPUT.OK) };
const danger = () => { status(OUTPUT.DANGER) }
const err = () => { status(OUTPUT.ERROR) };

import { parseArgs } from "@std/cli/parse-args";

const args = parseArgs(Deno.args, {
  default: { path: "/", limit: 90 }
});

let isFolder = false;

try {
  const folderInfo = await Deno.lstat(args.path);
  isFolder = folderInfo.isDirectory;
} catch (_) {
  err();
}

if (!isFolder) {
  err();
}

const dfCommand = new Deno.Command("df", {
  args: [
    "-h",
    args.path,
  ],
});

const { code, stdout } = await dfCommand.output();
if (code !== 0) {
  err();
}

const dfOutput = new TextDecoder().decode(stdout);
const line = dfOutput.split("\n")[1];
const percentage = line.split(/ +/)[4];

const percentageValue = parseInt(percentage.replace("%", ""), 10)

const isInDanger = percentageValue >= args.limit;

if (isInDanger) {
  danger();
} else {
  okay();
}
