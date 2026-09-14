import type { Layout } from '../types/index.js'
import { docsLayout } from './docs.js'

export const layouts = {
  docs: docsLayout,
} satisfies Record<string, Layout>

export type LayoutName = keyof typeof layouts
