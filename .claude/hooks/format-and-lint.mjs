// PostToolUse hook: format and lint every file Claude edits.
// Remaining lint errors go back to Claude (exit code 2), so it fixes them
// before moving on.
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { extname, relative } from "node:path"

const FORMAT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".json",
  ".css",
  ".md",
  ".yml",
  ".yaml",
])
const LINT_EXTENSIONS = new Set([".ts", ".tsx", ".js"])

const input = JSON.parse(await readStdin())
const filePath = input.tool_input?.file_path
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()

if (
  !filePath ||
  !existsSync(filePath) ||
  relative(projectDir, filePath).startsWith("..")
) {
  process.exit(0)
}

const extension = extname(filePath)

if (FORMAT_EXTENSIONS.has(extension)) {
  run("prettier", ["--write", "--ignore-unknown", filePath])
}

if (LINT_EXTENSIONS.has(extension)) {
  const lint = run("eslint", [
    "--fix",
    "--max-warnings",
    "0",
    "--no-warn-ignored",
    filePath,
  ])
  if (lint.status !== 0) {
    process.stderr.write(
      `ESLint found problems in ${filePath}. Fix them:\n${lint.stdout}${lint.stderr}`
    )
    process.exit(2)
  }
}

function run(bin, args) {
  return spawnSync("pnpm", ["exec", bin, ...args], {
    cwd: projectDir,
    encoding: "utf8",
  })
}

async function readStdin() {
  let data = ""
  for await (const chunk of process.stdin) {
    data += chunk
  }
  return data
}
