import { describe, expect, it } from 'bun:test'
import { defaultSizes, render } from './layout.js'
import { dark } from './themes/dark.js'
import type { Node, RenderContext } from './types/index.js'

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

const findByStyle = (root: Node, key: string, value: unknown) => {
  return collectNodes(root).find((node) => {
    const style = node.props.style as Record<string, unknown> | undefined

    return style?.[key] === value
  })
}

const listTexts = (root: Node) => {
  return collectNodes(root)
    .map((node) => node.props.children)
    .filter((child) => typeof child === 'string')
}

describe('render', () => {
  const baseContext: RenderContext = {
    card: { header: { text: 'feedsmith' }, title: 'Parsing namespaces' },
    theme: dark,
    sizes: defaultSizes,
    fonts: { title: 'title-latin', label: 'label-latin' },
    background: { pattern: 'dots' },
  }

  it('should render every slot with all properties', () => {
    const value: RenderContext = {
      ...baseContext,
      card: {
        header: { text: 'feedsmith', icon: { svg: '<svg />' }, aside: 'v1.1.0' },
        eyebrow: 'Guides › Parsing',
        title: 'Parsing namespaces',
        byline: 'Test Tosterone',
        description: 'Every tag the parser reads.',
        footer: { text: 'example/repo', icon: { svg: '<svg />' }, aside: 'Page 3' },
      },
      headerIcon: { src: 'data:image/svg+xml;base64,AAAA' },
      footerIcon: { svg: '<svg><path stroke="currentColor" /></svg>' },
    }
    const root = render(value)
    const nodes = collectNodes(root)
    const expectedHeaderIcon = {
      type: 'img',
      props: { src: 'data:image/svg+xml;base64,AAAA', height: 56 },
    }
    const expectedFooterIcon = {
      type: 'img',
      props: {
        height: 32,
        src: `data:image/svg+xml;base64,${Buffer.from('<svg><path stroke="#a3a3a3" /></svg>').toString('base64')}`,
      },
    }
    const expectedAside = {
      props: { style: { marginLeft: 'auto', maxWidth: 536, textAlign: 'right', fontSize: 26 } },
    }
    const expectedEyebrow = {
      props: { style: { fontFamily: 'label-latin', fontSize: 26, color: '#ff8c4d' } },
    }
    const expectedTitle = {
      props: { style: { fontFamily: 'title-latin', fontSize: 72, fontWeight: 700, lineClamp: 2 } },
    }
    const expectedByline = {
      props: { style: { fontFamily: 'label-latin', fontSize: 28, lineClamp: 1 } },
    }
    const expectedDescription = {
      props: { style: { fontSize: 30, lineHeight: 1.35, color: '#a3a3a3', lineClamp: 2 } },
    }
    const expectedTexts = [
      'feedsmith',
      'v1.1.0',
      'Guides › Parsing',
      'Parsing namespaces',
      'Test Tosterone',
      'Every tag the parser reads.',
      'example/repo',
      'Page 3',
    ]

    expect(nodes.find((node) => node.props.height === 56)).toEqual(expectedHeaderIcon)
    expect(nodes.find((node) => node.props.height === 32)).toEqual(expectedFooterIcon)
    expect(findByText(root, 'v1.1.0')).toMatchObject(expectedAside)
    expect(findByText(root, 'Page 3')).toMatchObject(expectedAside)
    expect(findByText(root, 'Guides › Parsing')).toMatchObject(expectedEyebrow)
    expect(findByText(root, 'Parsing namespaces')).toMatchObject(expectedTitle)
    expect(findByText(root, 'Test Tosterone')).toMatchObject(expectedByline)
    expect(findByText(root, 'Every tag the parser reads.')).toMatchObject(expectedDescription)
    expect(listTexts(root)).toEqual(expectedTexts)
  })

  it('should render the header, the title and the dots with minimal properties', () => {
    const root = render(baseContext)
    const nodes = collectNodes(root)
    const expected = {
      props: { style: { fontSize: 72, fontWeight: 700, lineHeight: 1.15 } },
    }

    expect(findByText(root, 'feedsmith')).toBeDefined()
    expect(findByText(root, 'Parsing namespaces')).toMatchObject(expected)
    expect(nodes.filter((node) => node.type === 'circle').length).toBeGreaterThan(0)
    expect(findByStyle(root, 'background', '#ff8c4d')).toBeUndefined()
  })

  it('should render an icon-only header and anchor the lines to their edges', () => {
    const value: RenderContext = {
      ...baseContext,
      card: {
        header: { icon: { svg: '<svg />' }, aside: 'December 15, 2025' },
        title: 'Parsing namespaces',
        footer: { text: 'example/repo', aside: 'A long aside that wraps onto more lines' },
      },
      headerIcon: { svg: '<svg />' },
    }
    const root = render(value)
    const expectedHeader = {
      props: { style: { alignItems: 'flex-start', gap: 20, color: '#f0f0f0' } },
    }
    const expectedFooter = {
      props: { style: { alignItems: 'flex-end', gap: 14, color: '#a3a3a3' } },
    }
    const expectedText = {
      props: { style: { maxWidth: 536, fontSize: 28 } },
    }

    expect(findByStyle(root, 'alignItems', 'flex-start')).toMatchObject(expectedHeader)
    expect(findByStyle(root, 'alignItems', 'flex-end')).toMatchObject(expectedFooter)
    expect(findByText(root, 'example/repo')).toMatchObject(expectedText)
    expect(findByStyle(root, 'fontSize', 44)).toBeUndefined()
  })

  it('should push the headline to the bottom above the footer and draw the accent bar', () => {
    const value: RenderContext = {
      ...baseContext,
      card: { ...baseContext.card, footer: { text: 'example/repo' } },
      sizes: { ...defaultSizes, headlinePosition: 'bottom', barHeight: 10 },
    }
    const root = render(value)
    const body = findByStyle(root, 'justifyContent', 'space-between') as Node
    const bodyChildren = (body.props.children as Array<Node | undefined>).filter(Boolean)
    const expectedBar = {
      props: { style: { height: 10, background: '#ff8c4d' } },
    }

    expect(bodyChildren).toHaveLength(2)
    expect(listTexts(root)).toEqual(['feedsmith', 'Parsing namespaces', 'example/repo'])
    expect(findByStyle(root, 'background', '#ff8c4d')).toMatchObject(expectedBar)
  })

  it('should clamp both the title and the description to two lines', () => {
    const value: RenderContext = {
      ...baseContext,
      card: { ...baseContext.card, description: 'Every tag the parser reads.' },
    }
    const root = render(value)
    const expectedTitle = {
      props: { style: { lineClamp: 2 } },
    }
    const expectedDescription = {
      props: { style: { lineClamp: 2, fontSize: 30, color: '#a3a3a3' } },
    }

    expect(findByText(root, 'Parsing namespaces')).toMatchObject(expectedTitle)
    expect(findByText(root, 'Every tag the parser reads.')).toMatchObject(expectedDescription)
  })

  it('should step the title down past the long length', () => {
    const title = 'A title that runs past the forty character step'
    const value: RenderContext = {
      ...baseContext,
      card: { title },
    }
    const expected = {
      props: { style: { fontSize: 56, fontWeight: 700, letterSpacing: '-0.025em' } },
    }

    expect(findByText(render(value), title)).toMatchObject(expected)
  })

  it('should render a description alone in the title slot at the long size', () => {
    const description =
      'Fast all-in-one feed parser and generator for RSS, Atom, RDF and JSON Feed with 20+ namespaces.'
    const value: RenderContext = {
      ...baseContext,
      card: { header: { text: 'feedsmith' }, description },
    }
    const expected = {
      props: { style: { fontSize: 44, fontWeight: 400, letterSpacing: '-0.0125em' } },
    }

    expect(findByText(render(value), description)).toMatchObject(expected)
  })

  it('should render a background image instead of the dots', () => {
    const value: RenderContext = {
      ...baseContext,
      background: { image: { svg: '' } },
      backgroundImage: { src: 'data:image/png;base64,AAAA' },
    }
    const nodes = collectNodes(render(value))
    const expected = {
      type: 'img',
      props: { src: 'data:image/png;base64,AAAA', style: { objectFit: 'cover' } },
    }

    expect(nodes.find((node) => node.type === 'img')).toMatchObject(expected)
    expect(nodes.filter((node) => node.type === 'circle')).toEqual([])
  })

  it('should apply size overrides over the defaults', () => {
    const value: RenderContext = {
      ...baseContext,
      sizes: { ...defaultSizes, titleText: 80, titleWeight: 500, titleLetterSpacing: '-0.035em' },
    }
    const expected = {
      props: { style: { fontSize: 80, fontWeight: 500, letterSpacing: '-0.035em' } },
    }

    expect(findByText(render(value), 'Parsing namespaces')).toMatchObject(expected)
  })
})
