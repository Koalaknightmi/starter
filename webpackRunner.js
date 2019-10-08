const { spawn } = require("child_process");
const child = spawn("./node_modules/.bin/webpack", ["-d", "--watch"]);

// print the logs
// console.log(child.output.map(b => b && b.toString()).join('\n'))

child.stdout.on("data", data => {
  console.log(`stdout: ${data}`);
});

child.stderr.on("data", data => {
  console.log(`stderr: ${data}`);
});

if (child.error) {
  console.log("error", child.error);
  console.log("error", child);
} else {
  console.log("rebuilt bundle");
}
// console.log('stdout ', child.stdout);
// console.log('stderr ', child.stderr);
