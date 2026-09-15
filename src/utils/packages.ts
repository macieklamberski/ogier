import { createRequire } from 'node:module'
import { join } from 'node:path'

// Under pnpm or isolated installs ogier sits in its own folder and cannot see the packages of
// the project that renders, so the project is asked first and ogier's own dependencies second.
export const resolvePackageFile = (path: string): string | undefined => {
  const requires = [
    createRequire(join(process.cwd(), 'package.json')),
    createRequire(import.meta.url),
  ]

  for (const require of requires) {
    try {
      return require.resolve(path)
    } catch {}
  }
}
