import { describe, expect, it } from 'bun:test'
import { darkTheme } from '../themes/dark.js'
import type { LayoutContext, Node } from '../types/index.js'
import { docsLayout, docsSizes } from './docs.js'

const collectNodes = (node: Node | undefined, nodes: Array<Node> = []): Array<Node> => {
  if (!node) {
    return nodes
  }

  nodes.push(node)

  const children = node.props.children

  if (Array.isArray(children)) {
    for (const child of children) {
      collectNodes(child, nodes)
    }
  }

  if (children && typeof children === 'object' && !Array.isArray(children)) {
    collectNodes(children as Node, nodes)
  }

  return nodes
}

const findByText = (root: Node, text: string) => {
  return collectNodes(root).find((node) => node.props.children === text)
}

describe('docsLayout', () => {
  const baseContext: LayoutContext = {
    card: { name: 'feedsmith', title: 'Parsing namespaces' },
    theme: darkTheme,
    sizes: docsSizes,
    background: { pattern: 'dots' },
  }

  it('should render the eyebrow, the title, the footer and the icons with all properties', () => {
    const value: LayoutContext = {
      ...baseContext,
      card: {
        name: 'feedsmith',
        eyebrow: 'Guides › Parsing',
        title: 'Parsing namespaces',
        footer: 'example/repo',
      },
      logo: { src: 'data:image/svg+xml;base64,AAAA' },
      footerIcon: { children: [{ type: 'path', props: { d: 'M0 0' } }] },
    }
    const nodes = collectNodes(docsLayout.render(value))
    const expectedEyebrow = {
      props: { style: { fontFamily: 'label', fontSize: 26, color: '#ff8c4d' } },
    }
    const expectedTitle = {
      props: { style: { fontFamily: 'title', fontSize: 72, fontWeight: 700, lineClamp: 3 } },
    }
    const expectedLogo = {
      type: 'img',
      props: { src: 'data:image/svg+xml;base64,AAAA', width: 56, height: 56 },
    }
    const expectedFooterIcon = {
      type: 'svg',
      props: { width: 32, height: 32, stroke: 'currentColor' },
    }

    expect(nodes.find((node) => node.props.children === 'Guides › Parsing')).toMatchObject(
      expectedEyebrow,
    )
    expect(nodes.find((node) => node.props.children === 'Parsing namespaces')).toMatchObject(
      expectedTitle,
    )
    expect(nodes.find((node) => node.props.children === 'example/repo')).toBeDefined()
    expect(nodes.find((node) => node.type === 'img')).toEqual(expectedLogo)
    expect(nodes.find((node) => node.type === 'svg' && node.props.stroke)).toMatchObject(
      expectedFooterIcon,
    )
  })

  it('should render the name, the title and the dots with minimal properties', () => {
    const nodes = collectNodes(docsLayout.render(baseContext))
    const expected = {
      props: { style: { fontSize: 72, fontWeight: 700 } },
    }

    expect(nodes.find((node) => node.props.children === 'feedsmith')).toBeDefined()
    expect(nodes.find((node) => node.props.children === 'Parsing namespaces')).toMatchObject(
      expected,
    )
    expect(nodes.filter((node) => node.type === 'circle').length).toBeGreaterThan(0)
  })

  it('should clamp both the title and the description to two lines', () => {
    const value: LayoutContext = {
      ...baseContext,
      card: { ...baseContext.card, description: 'Every tag the parser reads.' },
    }
    const root = docsLayout.render(value)
    const expectedTitle = {
      props: { style: { lineClamp: 2 } },
    }
    const expectedDescription = {
      props: { style: { lineClamp: 2, fontSize: 30, color: '#a3a3a3' } },
    }

    expect(findByText(root, 'Parsing namespaces')).toMatchObject(expectedTitle)
    expect(findByText(root, 'Every tag the parser reads.')).toMatchObject(expectedDescription)
  })

  it('should render a description alone in the title slot at the long size', () => {
    const description =
      'Fast all-in-one feed parser and generator for RSS, Atom, RDF and JSON Feed with 20+ namespaces.'
    const value: LayoutContext = {
      ...baseContext,
      card: { name: 'feedsmith', description },
    }
    const expected = {
      props: { style: { fontSize: 44, fontWeight: 400 } },
    }

    expect(findByText(docsLayout.render(value), description)).toMatchObject(expected)
  })

  it('should render a background image instead of the dots', () => {
    const value: LayoutContext = {
      ...baseContext,
      background: { image: { svg: '' } },
      backgroundImage: { src: 'data:image/png;base64,AAAA' },
    }
    const nodes = collectNodes(docsLayout.render(value))
    const expected = {
      type: 'img',
      props: { src: 'data:image/png;base64,AAAA', style: { objectFit: 'cover' } },
    }

    expect(nodes.find((node) => node.type === 'img')).toMatchObject(expected)
    expect(nodes.filter((node) => node.type === 'circle')).toEqual([])
  })

  it('should apply size overrides over the defaults', () => {
    const value: LayoutContext = {
      ...baseContext,
      sizes: { ...docsSizes, titleText: 80 },
    }
    const expected = {
      props: { style: { fontSize: 80 } },
    }

    expect(findByText(docsLayout.render(value), 'Parsing namespaces')).toMatchObject(expected)
  })
})
