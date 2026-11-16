// Stop hook: Claude can't finish while typecheck or lint fails.
// Skips when nothing changed, and when Claude is already continuing because
// of this hook (prevents an infinite loop).
import { spawnSync } from "node:child_process"

const input = JSON.parse(await readStdin())
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()

if (input.stop_hook_active) {
  process.exit(0)
}

const status = spawnSync("git", ["status", "--porcelain"], {
  cwd: projectDir,
  encoding: "utf8",
})
if (status.stdout.trim() === "") {
  process.exit(0)
}

for (const script of ["typecheck", "lint"]) {
  const result = spawnSync("pnpm", ["run", "--silent", script], {
    cwd: projectDir,
    encoding: "utf8",
  })
  if (result.status !== 0) {
    process.stderr.write(
      `\`pnpm ${script}\` failed. Fix it before finishing:\n${result.stdout}${result.stderr}`
    )
    process.exit(2)
  }
}

async function readStdin() {
  let data = ""
  for await (const chunk of process.stdin) {
    data += chunk
  }
  return data
}
