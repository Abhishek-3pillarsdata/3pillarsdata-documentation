import { FileText } from 'lucide-react'
import type { DocKind } from '../../types'
import { getDoc } from '../../data'
import { Card, EmptyState } from '../../components/ui'
import { Markdown, TableOfContents } from '../../components/Markdown'
import { useProject } from './ProjectLayout'

/** Renders docs/projects/<id>/<kind>.md with an "On this page" table of contents. */
export default function ProjectDoc({ kind }: { kind: DocKind }) {
  const project = useProject()
  const doc = getDoc(project.id, kind)

  if (!doc) {
    return (
      <EmptyState
        icon={FileText}
        title="This document hasn't been written yet"
        description={<>Create <code className="font-mono">docs/projects/{project.id}/{kind}.md</code> and it will appear here.</>}
      />
    )
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_220px]">
      <Card className="min-w-0 p-6 sm:p-10">
        <Markdown>{doc.body}</Markdown>
      </Card>
      <aside className="hidden xl:block">
        <TableOfContents markdown={doc.body} />
      </aside>
    </div>
  )
}
