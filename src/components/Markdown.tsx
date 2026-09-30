import { useEffect } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import { useSearchParams } from 'react-router'
import { ListTree } from 'lucide-react'
import { getHeadings } from '../utils/markdown'
import { cn } from '../utils/format'

export function scrollToHeading(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  el.classList.add('bg-indigo-500/10')
  window.setTimeout(() => el.classList.remove('bg-indigo-500/10'), 1600)
}

// HashRouter owns `#`, so in-page anchors (`#section`) are handled manually.
const components: Components = {
  a({ href = '', children, ...props }) {
    if (href.startsWith('#')) {
      return (
        <a
          href={href}
          onClick={(e) => {
            e.preventDefault()
            scrollToHeading(decodeURIComponent(href.slice(1)))
          }}
          {...props}
        >
          {children}
        </a>
      )
    }
    const external = /^https?:\/\//.test(href)
    return (
      <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} {...props}>
        {children}
      </a>
    )
  },
}

export function Markdown({ children, className }: { children: string; className?: string }) {
  const [params] = useSearchParams()
  const target = params.get('h')

  useEffect(() => {
    if (!target) return
    const t = window.setTimeout(() => scrollToHeading(target), 60)
    return () => window.clearTimeout(t)
  }, [target, children])

  return (
    <div
      className={cn(
        'prose prose-slate max-w-none dark:prose-invert',
        'prose-headings:scroll-mt-24 prose-headings:rounded-md prose-headings:font-semibold prose-headings:tracking-tight prose-headings:transition-colors',
        'prose-h1:text-2xl prose-h2:mt-10 prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2 prose-h2:text-xl dark:prose-h2:border-slate-800',
        'prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline dark:prose-a:text-indigo-400',
        'prose-pre:text-[13px] prose-pre:leading-relaxed prose-table:text-sm prose-img:rounded-lg',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug, [rehypeHighlight, { detect: false, ignoreMissing: true }]]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

export function TableOfContents({ markdown }: { markdown: string }) {
  const headings = getHeadings(markdown)
  if (headings.length < 2) return null
  return (
    <nav aria-label="On this page" className="sticky top-24">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <ListTree className="size-3.5" /> On this page
      </p>
      <ul className="space-y-1 border-l border-slate-200 dark:border-slate-800">
        {headings.map((h) => (
          <li key={h.id}>
            <button
              type="button"
              onClick={() => scrollToHeading(h.id)}
              className={cn(
                '-ml-px block border-l border-transparent py-1 text-left text-sm text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                h.depth === 2 ? 'pl-3' : 'pl-6 text-[13px]',
              )}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
