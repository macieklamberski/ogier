import { describe, expect, it } from 'bun:test'
import { defaultSizes, getFontWeights, render, resolveSizes } from './layout.js'
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
    fonts: {
      title: 'title-latin',
      description: 'body-latin',
      header: 'label-latin',
      aside: 'label-latin',
      eyebrow: 'label-latin',
      byline: 'label-latin',
      footer: 'label-latin',
    },
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
      props: {
        style: {
          marginLeft: 'auto',
          maxWidth: 536,
          textAlign: 'right',
          fontSize: 26,
          color: '#a3a3a3',
        },
      },
    }
    const expectedEyebrow = {
      props: { style: { fontFamily: 'label-latin', fontSize: 26, color: '#ff8c4d' } },
    }
    const expectedTitle = {
      props: {
        style: {
          fontFamily: 'title-latin',
          fontSize: 72,
          fontWeight: 700,
          lineClamp: 2,
          color: '#f0f0f0',
        },
      },
    }
    const expectedByline = {
      props: { style: { fontFamily: 'label-latin', fontSize: 28, lineClamp: 1, color: '#f0f0f0' } },
    }
    const expectedDescription = {
      props: {
        style: {
          fontFamily: 'body-latin',
          fontSize: 30,
          lineHeight: 1.35,
          color: '#a3a3a3',
          lineClamp: 2,
        },
      },
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

  it('should set each text family and weight from its own font and size keys', () => {
    const value: RenderContext = {
      ...baseContext,
      card: {
        header: { text: 'feedsmith', aside: 'v1.1.0' },
        eyebrow: 'Guides › Parsing',
        title: 'Parsing namespaces',
        byline: 'Test Tosterone',
        description: 'Every tag the parser reads.',
        footer: { text: 'example/repo', aside: 'Page 3' },
      },
      sizes: {
        ...defaultSizes,
        headerWeight: 100,
        asideWeight: 200,
        eyebrowWeight: 300,
        bylineWeight: 600,
        descriptionWeight: 800,
        footerWeight: 900,
      },
      fonts: {
        title: 'title-latin',
        description: 'description-latin',
        header: 'header-latin',
        aside: 'aside-latin',
        eyebrow: 'eyebrow-latin',
        byline: 'byline-latin',
        footer: 'footer-latin',
      },
    }
    const root = render(value)
    const expected = {
      feedsmith: { fontFamily: 'header-latin', fontWeight: 100 },
      'v1.1.0': { fontFamily: 'aside-latin', fontWeight: 200 },
      'Guides › Parsing': { fontFamily: 'eyebrow-latin', fontWeight: 300 },
      'Test Tosterone': { fontFamily: 'byline-latin', fontWeight: 600 },
      'Every tag the parser reads.': { fontFamily: 'description-latin', fontWeight: 800 },
      'example/repo': { fontFamily: 'footer-latin', fontWeight: 900 },
      'Page 3': { fontFamily: 'aside-latin', fontWeight: 200 },
    }

    const styles = Object.fromEntries(
      Object.keys(expected).map((text) => {
        const style = findByText(root, text)?.props.style as Record<string, unknown>

        return [text, { fontFamily: style.fontFamily, fontWeight: style.fontWeight }]
      }),
    )

    expect(styles).toEqual(expected)
  })

  it('should color each text from its own theme key', () => {
    const value: RenderContext = {
      ...baseContext,
      card: {
        header: { text: 'feedsmith', aside: 'v1.1.0' },
        eyebrow: 'Guides › Parsing',
        title: 'Parsing namespaces',
        byline: 'Test Tosterone',
        description: 'Every tag the parser reads.',
        footer: { text: 'example/repo', icon: { svg: '<svg />' }, aside: 'Page 3' },
      },
      theme: {
        ...dark,
        header: '#000001',
        eyebrow: '#000002',
        title: '#000003',
        byline: '#000004',
        description: '#000005',
        footer: '#000006',
        aside: '#000007',
      },
      footerIcon: { svg: '<svg><path stroke="currentColor" /></svg>' },
    }
    const root = render(value)
    const groups = collectNodes(root).filter((node) => {
      const style = node.props.style as Record<string, unknown> | undefined

      return style?.maxWidth === 1072
    })
    const expectedGroups = [
      { props: { style: { color: '#000001' } } },
      { props: { style: { color: '#000006' } } },
    ]
    const expectedFooterIcon = {
      props: {
        src: `data:image/svg+xml;base64,${Buffer.from('<svg><path stroke="#000006" /></svg>').toString('base64')}`,
      },
    }

    const expectedEyebrow = {
      props: { style: { color: '#000002' } },
    }
    const expectedTitle = {
      props: { style: { color: '#000003' } },
    }
    const expectedByline = {
      props: { style: { color: '#000004' } },
    }
    const expectedDescription = {
      props: { style: { color: '#000005' } },
    }
    const expectedAside = {
      props: { style: { color: '#000007' } },
    }

    expect(groups).toMatchObject(expectedGroups)
    expect(collectNodes(root).find((node) => node.props.height === 32)).toMatchObject(
      expectedFooterIcon,
    )
    expect(findByText(root, 'Guides › Parsing')).toMatchObject(expectedEyebrow)
    expect(findByText(root, 'Parsing namespaces')).toMatchObject(expectedTitle)
    expect(findByText(root, 'Test Tosterone')).toMatchObject(expectedByline)
    expect(findByText(root, 'Every tag the parser reads.')).toMatchObject(expectedDescription)
    expect(findByText(root, 'v1.1.0')).toMatchObject(expectedAside)
    expect(findByText(root, 'Page 3')).toMatchObject(expectedAside)
  })

  it('should render the header, the title and the pattern rail with minimal properties', () => {
    const root = render(baseContext)
    const expected = {
      props: { style: { fontSize: 72, fontWeight: 700, lineHeight: 1.15 } },
    }
    const expectedRail = {
      type: 'img',
      props: { style: { position: 'absolute', right: 0, width: 600, height: 630 } },
    }

    expect(findByText(root, 'feedsmith')).toBeDefined()
    expect(findByText(root, 'Parsing namespaces')).toMatchObject(expected)
    expect(findByStyle(root, 'right', 0)).toMatchObject(expectedRail)
    expect(findByStyle(root, 'right', 0)?.props.src).toStartWith('data:image/svg+xml;base64,')
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
    const groups = collectNodes(root).filter((node) => {
      const style = node.props.style as Record<string, unknown> | undefined

      return style?.maxWidth === 1072
    })
    const expectedHeader = {
      props: { style: { alignItems: 'flex-start', gap: 20 } },
    }
    const expectedFooter = {
      props: { style: { alignItems: 'flex-end', gap: 14 } },
    }
    const expectedGroups = [
      { props: { style: { alignItems: 'flex-start', color: '#f0f0f0' } } },
      { props: { style: { alignItems: 'flex-end', color: '#a3a3a3' } } },
    ]
    const expectedText = {
      props: { style: { maxWidth: 536, fontSize: 28, lineHeight: 1.2 } },
    }

    expect(findByStyle(root, 'alignItems', 'flex-start')).toMatchObject(expectedHeader)
    expect(findByStyle(root, 'alignItems', 'flex-end')).toMatchObject(expectedFooter)
    expect(groups).toMatchObject(expectedGroups)
    expect(findByText(root, 'example/repo')).toMatchObject(expectedText)
    expect(findByStyle(root, 'fontSize', 44)).toBeUndefined()
  })

  it('should shift the asides onto the baseline of the line text in the aside color', () => {
    const value: RenderContext = {
      ...baseContext,
      card: {
        header: { text: 'feedsmith', aside: 'v1.1.0' },
        title: 'Parsing namespaces',
        footer: { text: 'example/repo', aside: 'Page 3' },
      },
      theme: { ...dark, aside: '#ffffff' },
      sizes: {
        ...defaultSizes,
        headerText: 46,
        footerText: 30,
        asideText: 26,
        slotLineHeight: 1.5,
        asideBaseline: 0.5,
      },
    }
    const root = render(value)
    const expectedHeaderAside = {
      props: { style: { marginTop: 20, lineHeight: 1.5, color: '#ffffff' } },
    }
    const expectedFooterAside = {
      props: { style: { marginBottom: 2, lineHeight: 1.5, color: '#ffffff' } },
    }

    expect(findByText(root, 'v1.1.0')).toMatchObject(expectedHeaderAside)
    expect(findByText(root, 'Page 3')).toMatchObject(expectedFooterAside)
  })

  it('should push the headline to the bottom above the footer and draw the accent bar', () => {
    const value: RenderContext = {
      ...baseContext,
      card: {
        ...baseContext.card,
        footer: { text: 'example/repo' },
        align: { vertical: 'bottom' },
      },
      sizes: { ...defaultSizes, barHeight: 10 },
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

  it('should keep the headline between the edges without a header or a footer', () => {
    const value: RenderContext = {
      ...baseContext,
      card: { title: 'Parsing namespaces' },
    }
    const root = render(value)
    const body = findByStyle(root, 'justifyContent', 'space-between') as Node
    const expected = [
      { type: 'div', props: { style: {} } },
      { props: { style: { justifyContent: 'flex-start' } } },
      { type: 'div', props: { style: {} } },
    ]

    expect(body.props.children).toMatchObject(expected)
  })

  it('should push the headline to the bottom without a header', () => {
    const value: RenderContext = {
      ...baseContext,
      card: { title: 'Parsing namespaces', align: { vertical: 'bottom' } },
    }
    const root = render(value)
    const body = findByStyle(root, 'justifyContent', 'space-between') as Node
    const expected = [{ type: 'div', props: { style: {} } }, { props: { style: { gap: 16 } } }]

    expect(body.props.children).toMatchObject(expected)
  })

  it('should pull the headline to the top under the header without a footer', () => {
    const value: RenderContext = {
      ...baseContext,
      card: { ...baseContext.card, align: { vertical: 'top' } },
    }
    const root = render(value)
    const body = findByStyle(root, 'justifyContent', 'space-between') as Node
    const expected = [{ props: { style: { gap: 16 } } }, { type: 'div', props: { style: {} } }]
    const group = (body.props.children as Array<Node>)[0]

    expect(body.props.children).toMatchObject(expected)
    expect(listTexts(group)).toEqual(['feedsmith', 'Parsing namespaces'])
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

  it('should render a background image instead of the pattern rail', () => {
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
    expect(findByStyle(render(value), 'right', 0)).toBeUndefined()
  })

  it('should draw the image on the right half and keep the text on the left half', () => {
    const value: RenderContext = {
      ...baseContext,
      card: { ...baseContext.card, image: { svg: '' } },
      image: { src: 'data:image/jpeg;base64,AAAA' },
    }
    const root = render(value)
    const expectedImage = {
      type: 'img',
      props: {
        src: 'data:image/jpeg;base64,AAAA',
        style: {
          position: 'absolute',
          top: 0,
          right: 0,
          width: 600,
          height: 630,
          objectFit: 'cover',
        },
      },
    }
    const expectedHeadlineRow = {
      props: { style: { justifyContent: 'flex-start', marginRight: 600 } },
    }
    const expectedGroup = {
      props: { style: { maxWidth: 472 } },
    }
    const group = findByStyle(root, 'maxWidth', 472)

    expect(findByStyle(root, 'objectFit', 'cover')).toEqual(expectedImage)
    expect(findByStyle(root, 'marginRight', 600)).toMatchObject(expectedHeadlineRow)
    expect(group).toMatchObject(expectedGroup)
    expect(group).not.toHaveProperty('props.style.marginRight')
  })

  it('should draw the image on the left half and keep the lines at the card edges', () => {
    const value: RenderContext = {
      ...baseContext,
      card: { ...baseContext.card, image: { svg: '', position: 'left' } },
      image: { src: 'data:image/jpeg;base64,AAAA' },
    }
    const root = render(value)
    const expectedImage = {
      props: { style: { left: 0, width: 600 } },
    }
    const expectedHeadlineRow = {
      props: { style: { marginLeft: 600 } },
    }
    const expectedGroup = {
      props: { style: { maxWidth: 472, flexShrink: 1 } },
    }
    const group = findByStyle(root, 'maxWidth', 472)

    expect(findByStyle(root, 'left', 0)).toMatchObject(expectedImage)
    expect(findByStyle(root, 'justifyContent', 'flex-start')).toMatchObject(expectedHeadlineRow)
    expect(group).toMatchObject(expectedGroup)
    expect(group).not.toHaveProperty('props.style.marginLeft')
  })

  it('should align the headline right and keep the lines in their order', () => {
    const value: RenderContext = {
      ...baseContext,
      card: {
        header: { text: 'feedsmith', aside: 'v1.1.0' },
        title: 'Parsing namespaces',
        align: { horizontal: 'right' },
      },
    }
    const root = render(value)
    const expectedHeadline = {
      props: { style: { alignItems: 'flex-end', textAlign: 'right' } },
    }
    const expectedAside = {
      props: { style: { marginLeft: 'auto', textAlign: 'right' } },
    }

    expect(findByStyle(root, 'justifyContent', 'flex-end')).toBeDefined()
    expect(findByStyle(root, 'gap', 16)).toMatchObject(expectedHeadline)
    expect(findByStyle(root, 'flexDirection', 'row-reverse')).toBeUndefined()
    expect(findByText(root, 'v1.1.0')).toMatchObject(expectedAside)
  })

  it('should center the headline and keep the lines in their order', () => {
    const value: RenderContext = {
      ...baseContext,
      card: {
        header: { text: 'feedsmith', aside: 'v1.1.0' },
        title: 'Parsing namespaces',
        align: { horizontal: 'center' },
      },
    }
    const root = render(value)
    const expectedHeadline = {
      props: { style: { alignItems: 'center', textAlign: 'center' } },
    }
    const expectedAside = {
      props: { style: { marginLeft: 'auto', textAlign: 'right' } },
    }

    expect(findByStyle(root, 'justifyContent', 'center')).toBeDefined()
    expect(findByStyle(root, 'gap', 16)).toMatchObject(expectedHeadline)
    expect(findByText(root, 'v1.1.0')).toMatchObject(expectedAside)
  })

  it('should put every padding side without a value at the card edge', () => {
    const value: RenderContext = {
      ...baseContext,
      sizes: { ...defaultSizes, cardPadding: { top: 40 } },
    }
    const expected = {
      props: { style: { paddingTop: 40, paddingRight: 0, paddingBottom: 0, paddingLeft: 0 } },
    }

    expect(findByStyle(render(value), 'paddingTop', 40)).toMatchObject(expected)
  })

  it('should cap the column at the content width', () => {
    const value: RenderContext = {
      ...baseContext,
      sizes: { ...defaultSizes, contentWidth: 640 },
    }
    const expected = {
      props: { style: { flexDirection: 'column', width: '100%', maxWidth: 640 } },
    }

    expect(findByStyle(render(value), 'maxWidth', 640)).toMatchObject(expected)
  })

  it('should draw the card icon as the first item of the column above the eyebrow', () => {
    const value: RenderContext = {
      ...baseContext,
      card: { ...baseContext.card, icon: { svg: '<svg />' }, eyebrow: 'Guides › Parsing' },
      icon: { svg: '<svg><path stroke="currentColor" /></svg>' },
    }
    const column = findByStyle(render(value), 'maxWidth', 800) as Node
    const columnChildren = (column.props.children as Array<Node | undefined>).filter(Boolean)
    const expected = [
      {
        type: 'img',
        props: {
          src: 'data:image/svg+xml;base64,PHN2Zz48cGF0aCBzdHJva2U9IiNmMGYwZjAiIC8+PC9zdmc+',
          height: 88,
          style: { borderRadius: 0 },
        },
      },
      { props: { children: 'Guides › Parsing' } },
      { props: { children: 'Parsing namespaces' } },
    ]

    expect(columnChildren).toMatchObject(expected)
  })

  it('should size and round the card icon by its own size keys', () => {
    const value: RenderContext = {
      ...baseContext,
      card: { ...baseContext.card, icon: { file: 'favicon.png' } },
      icon: { src: 'data:image/png;base64,AAAA' },
      sizes: { ...defaultSizes, iconSize: 64, iconRadius: 8 },
    }
    const expected = {
      type: 'img',
      props: { src: 'data:image/png;base64,AAAA', height: 64, style: { borderRadius: 8 } },
    }

    expect(findByStyle(render(value), 'borderRadius', 8)).toEqual(expected)
  })

  it('should draw the extra element as the last item of the column under the description', () => {
    const extra = { type: 'div', props: { children: 'Ranked tools' } }
    const value: RenderContext = {
      ...baseContext,
      card: { ...baseContext.card, description: 'Every tag the parser reads.', extra },
    }
    const column = findByStyle(render(value), 'maxWidth', 800) as Node
    const columnChildren = (column.props.children as Array<Node | undefined>).filter(Boolean)
    const expected = [
      { props: { children: 'Parsing namespaces' } },
      { props: { children: 'Every tag the parser reads.' } },
      extra,
    ]

    expect(columnChildren).toMatchObject(expected)
  })

  it('should draw the extra element under the title without a description', () => {
    const extra = { type: 'div', props: { children: 'Ranked tools' } }
    const value: RenderContext = {
      ...baseContext,
      card: { ...baseContext.card, extra },
    }
    const column = findByStyle(render(value), 'maxWidth', 800) as Node
    const columnChildren = (column.props.children as Array<Node | undefined>).filter(Boolean)
    const expected = [{ props: { children: 'Parsing namespaces' } }, extra]

    expect(columnChildren).toMatchObject(expected)
  })

  it('should track each text by its own size key', () => {
    const value: RenderContext = {
      ...baseContext,
      card: {
        header: { text: 'feedsmith', aside: 'v1.1.0' },
        eyebrow: 'Guides › Parsing',
        title: 'Parsing namespaces',
        byline: 'Test Tosterone',
        description: 'Every tag the parser reads.',
        footer: { text: 'example/repo', aside: 'Page 3' },
      },
      sizes: {
        ...defaultSizes,
        headerTracking: '0.01em',
        eyebrowTracking: '0.02em',
        titleTracking: '0.03em',
        bylineTracking: '0.04em',
        descriptionTracking: '0.05em',
        footerTracking: '0.06em',
        asideTracking: '0.07em',
      },
    }
    const root = render(value)
    const expectedHeader = {
      props: { style: { letterSpacing: '0.01em' } },
    }
    const expectedEyebrow = {
      props: { style: { letterSpacing: '0.02em' } },
    }
    const expectedTitle = {
      props: { style: { letterSpacing: '0.03em' } },
    }
    const expectedByline = {
      props: { style: { letterSpacing: '0.04em' } },
    }
    const expectedDescription = {
      props: { style: { letterSpacing: '0.05em' } },
    }
    const expectedFooter = {
      props: { style: { letterSpacing: '0.06em' } },
    }
    const expectedAside = {
      props: { style: { letterSpacing: '0.07em' } },
    }

    expect(findByText(root, 'feedsmith')).toMatchObject(expectedHeader)
    expect(findByText(root, 'Guides › Parsing')).toMatchObject(expectedEyebrow)
    expect(findByText(root, 'Parsing namespaces')).toMatchObject(expectedTitle)
    expect(findByText(root, 'Test Tosterone')).toMatchObject(expectedByline)
    expect(findByText(root, 'Every tag the parser reads.')).toMatchObject(expectedDescription)
    expect(findByText(root, 'example/repo')).toMatchObject(expectedFooter)
    expect(findByText(root, 'v1.1.0')).toMatchObject(expectedAside)
    expect(findByText(root, 'Page 3')).toMatchObject(expectedAside)
  })

  it('should apply size overrides over the defaults', () => {
    const value: RenderContext = {
      ...baseContext,
      sizes: { ...defaultSizes, titleText: 80, titleWeight: 500, titleTracking: '-0.035em' },
    }
    const expected = {
      props: { style: { fontSize: 80, fontWeight: 500, letterSpacing: '-0.035em' } },
    }

    expect(findByText(render(value), 'Parsing namespaces')).toMatchObject(expected)
  })
})

describe('resolveSizes', () => {
  it('should return the defaults when no sizes are given', () => {
    expect(resolveSizes()).toEqual(defaultSizes)
  })

  it('should read the deprecated railDotStep as railStep', () => {
    const expected = { ...defaultSizes, railStep: 32 }

    expect(resolveSizes({ railDotStep: 32 })).toEqual(expected)
  })

  it('should prefer railStep over the deprecated railDotStep', () => {
    const expected = { ...defaultSizes, railStep: 16 }

    expect(resolveSizes({ railDotStep: 32, railStep: 16 })).toEqual(expected)
  })

  it('should keep the default for a size given as undefined', () => {
    expect(resolveSizes({ cardWidth: undefined })).toEqual(defaultSizes)
  })
})

describe('getFontWeights', () => {
  it('should load the default weights for the default sizes', () => {
    const expected = {
      title: [400, 500, 700],
      description: [400],
      header: [500],
      aside: [500],
      eyebrow: [500],
      byline: [500],
      footer: [500],
    }

    expect(getFontWeights(defaultSizes)).toEqual(expected)
  })

  it('should load the title weights set in the sizes', () => {
    const value = { ...defaultSizes, titleWeight: 600, titleWeightLong: 300 }

    expect(getFontWeights(value).title).toEqual([300, 400, 500, 600, 700])
  })

  it('should load the element weights set in the sizes', () => {
    const value = { ...defaultSizes, eyebrowWeight: 700, descriptionWeight: 300 }
    const expected = {
      title: [400, 500, 700],
      description: [300],
      header: [500],
      aside: [500],
      eyebrow: [700],
      byline: [500],
      footer: [500],
    }

    expect(getFontWeights(value)).toEqual(expected)
  })
})
