import { useState } from 'react';
import { data, flash } from '../lib/page.js';
import { enumLabel, enumOptions } from '../lib/enums.js';
import { PageHead, Card, Button, Field, Input, Textarea, Select, Csrf, Flash, EmptyState, TableWrap } from '../components/ui.jsx';

export const name = 'ai-documents';
export const title = 'AI Documents';

export default function AiDocuments() {
  const d = data;
  const docs = d.docs || [];
  const [editing, setEditing] = useState(null); // open document, null = closed

  return (
    <>
      <PageHead title="AI Documents" sub="Bylaw / FAQ corpus (FR-8.2)" />

      <Flash flash={flash} />

      <Card title="Ingest a document" icon="plus">
        <form method="post" action="/ai/documents">
          <Csrf />

          <div className="form-grid">
            <Field label="Code" htmlFor="code">
              <Input id="code" name="code" placeholder="auto-generated if blank" />
            </Field>
            <Field label="Title" htmlFor="title">
              <Input id="title" name="title" required />
            </Field>
          </div>

          <div className="form-grid">
            <Field label="Language" htmlFor="language">
              <Select id="language" name="language" options={enumOptions('Language')} />
            </Field>
            <Field label="Category" htmlFor="category">
              <Input id="category" name="category" placeholder="e.g. Fees, Noise, Fire safety" />
            </Field>
          </div>

          <Field label="Full content" htmlFor="content" full>
            <Textarea id="content" name="content" rows={6} required
                      placeholder="Paste bylaw clause or FAQ answer here (English and/or 中文)." />
          </Field>

          <Button type="submit" variant="primary" icon="plus">Ingest &amp; index</Button>
        </form>
      </Card>

      <Card title="Indexed documents" icon="doc" flush>
        {docs.length === 0
          ? <EmptyState icon="doc" title="No documents yet">Ingest a bylaw clause or FAQ above to make it queryable.</EmptyState>
          : (
            <TableWrap>
              <thead>
                <tr><th>Code</th><th>Title</th><th>Language</th><th>Category</th><th className="num">Chars</th><th /></tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td className="mono">{doc.code}</td>
                    <td className="strong">{doc.title}</td>
                    <td>{enumLabel('Language', doc.language)}</td>
                    <td>{doc.category || <span className="muted">—</span>}</td>
                    <td className="num">{(doc.content || '').length}</td>
                    <td className="right nowrap">
                      <Button type="button" variant="ghost" size="sm" icon="edit"
                              onClick={() => setEditing(doc)} style={{ marginRight: 6 }}>View / Edit</Button>
                      <form method="post" action={'/ai/documents/' + doc.id + '/delete'} style={{ display: 'inline' }}
                            onSubmit={(e) => { if (!confirm('Remove this document from the index?')) e.preventDefault(); }}>
                        <Csrf />
                        <Button type="submit" variant="danger" size="sm" icon="trash">Delete</Button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>

      {editing && (
        <div
          onClick={() => setEditing(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'grid', placeItems: 'center', zIndex: 100 }}
        >
          <Card
            title="View / Edit document"
            icon="doc"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640, width: '90%', maxHeight: '85vh', overflow: 'auto' }}
          >
            <Field label="Code">
              <div className="mono">{editing.code}</div>
            </Field>

            <form method="post" action={'/ai/documents/' + editing.id}>
              <Csrf />

              <Field label="Title" htmlFor="edit-title">
                <Input id="edit-title" name="title" required defaultValue={editing.title} />
              </Field>

              <Field label="Language" htmlFor="edit-language">
                <Select id="edit-language" name="language" options={enumOptions('Language')} defaultValue={editing.language} />
              </Field>

              <Field label="Category" htmlFor="edit-category">
                <Input id="edit-category" name="category" defaultValue={editing.category || ''} />
              </Field>

              <Field label="Content" htmlFor="edit-content" full>
                <Textarea id="edit-content" name="content" rows={12} required defaultValue={editing.content || ''} />
              </Field>

              <div className="btn-row" style={{ marginTop: 12 }}>
                <Button type="submit" variant="primary" icon="check">Save &amp; re-index</Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
