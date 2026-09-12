import { spawnSync } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import 'dotenv/config'

const publicEnv = Object.fromEntries(
  Object.entries(process.env)
    .filter(([key, value]) => key.startsWith('NUXT_PUBLIC_') && value?.trim())
    .map(([key, value]) => [key, value.trim()]),
)
publicEnv.NUXT_PUBLIC_SITE_URL ??= process.env.NUXT_SITE_URL?.trim()
const imageTag = process.env.DOCKER_IMAGE_TAG?.trim() || 'crstlnz/jkt48showroom:latest'

if (!publicEnv.NUXT_PUBLIC_API || !publicEnv.NUXT_PUBLIC_SITE_URL) {
  console.error('NUXT_PUBLIC_API and NUXT_PUBLIC_SITE_URL are required. Set them in .env or export them before building.')
  process.exit(1)
}

const args = [
  'build',
  '--tag',
  imageTag,
]

for (const [key, value] of Object.entries(publicEnv)) {
  if (value) args.push('--build-arg', `${key}=${value}`)
}

args.push('.')

const envContent = Object.entries(publicEnv)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n')

if (process.argv.includes('--dry-run')) {
  process.stdout.write(`Docker image: ${imageTag}\n`)
  process.stdout.write(`NUXT_PUBLIC_API: configured (${new URL(publicEnv.NUXT_PUBLIC_API).origin})\n`)
  process.stdout.write(`NUXT_PUBLIC_SITE_URL: configured (${new URL(publicEnv.NUXT_PUBLIC_SITE_URL).origin})\n`)
  process.exit(0)
}

const tempDirectory = await mkdtemp(join(tmpdir(), 'jkt48showroom-'))
const envPath = join(tempDirectory, 'nuxt-public.env')
await writeFile(envPath, `${envContent}\n`, { mode: 0o600 })
args.splice(1, 0, '--secret', `id=nuxt_public_env,src=${envPath}`)

try {
  const result = spawnSync('docker', args, { stdio: 'inherit' })
  process.exitCode = result.status ?? 1
}
finally {
  await rm(tempDirectory, { force: true, recursive: true })
}
