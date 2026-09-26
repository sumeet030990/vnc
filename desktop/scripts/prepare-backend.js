// Copies the built backend into desktop/build/backend with only its runtime
// dependencies, so the installer doesn't ship TypeScript, linters, etc.
const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const source = path.join(__dirname, '..', '..', 'be-vnc')
const target = path.join(__dirname, '..', 'build', 'backend')

fs.rmSync(target, { recursive: true, force: true })
fs.mkdirSync(target, { recursive: true })

fs.cpSync(path.join(source, 'dist'), path.join(target, 'dist'), {
  recursive: true,
})
for (const file of ['package.json', 'package-lock.json']) {
  fs.copyFileSync(path.join(source, file), path.join(target, file))
}

// --omit=optional drops the Prisma CLI, which npm otherwise pulls in as an
// optional peer of @prisma/client. --ignore-scripts skips `prisma generate`,
// which isn't needed because the generated client is already compiled into dist.
execSync('npm ci --omit=dev --omit=optional --ignore-scripts', {
  cwd: target,
  stdio: 'inherit',
})
