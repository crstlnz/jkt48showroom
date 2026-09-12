import { readFile, writeFile } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'

const packagePath = new URL('../package.json', import.meta.url)

function hasStagedChanges() {
  try {
    execFileSync('git', ['diff', '--cached', '--quiet'])
    return false
  }
  catch (error) {
    if (error.status === 1) return true
    throw error
  }
}

function bumpPatch(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/)
  if (!match) {
    throw new Error(`Expected a SemVer version in package.json, received: ${version}`)
  }

  const [, major, minor, patch] = match
  return `${major}.${minor}.${Number(patch) + 1}`
}

if (!hasStagedChanges()) {
  process.exit(0)
}

const pkg = JSON.parse(await readFile(packagePath, 'utf8'))
const nextVersion = bumpPatch(pkg.version)
pkg.version = nextVersion

await writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`)
execFileSync('git', ['add', 'package.json'])
console.log(`Version bumped: ${pkg.version}`)
