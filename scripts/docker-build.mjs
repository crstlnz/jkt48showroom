import { spawnSync } from 'node:child_process'
import 'dotenv/config'

const api = process.env.NUXT_PUBLIC_API?.trim()
const siteName = process.env.NUXT_SITE_NAME?.trim()
const imageTag = process.env.DOCKER_IMAGE_TAG?.trim() || 'crstlnz/jkt48showroom:latest'

if (!api) {
  console.error('NUXT_PUBLIC_API is required. Set it in .env or export it before building.')
  process.exit(1)
}

const args = [
  'build',
  '--build-arg',
  `NUXT_PUBLIC_API=${api}`,
  '--tag',
  imageTag,
]

if (siteName) {
  args.push(
    '--build-arg',
    `NUXT_SITE_NAME=${siteName}`,
  )
}

args.push('.')

if (process.argv.includes('--dry-run')) {
  process.stdout.write(`Docker image: ${imageTag}\n`)
  process.stdout.write(`NUXT_PUBLIC_API: configured (${new URL(api).origin})\n`)
  process.exit(0)
}

const result = spawnSync('docker', args, { stdio: 'inherit' })
process.exit(result.status ?? 1)
