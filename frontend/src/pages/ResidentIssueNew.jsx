import { data, flash } from '../lib/page.js';
import { enumLabel, enumOptions } from '../lib/enums.js';
import { PageHead, Card, Flash, Button, Field, Textarea, Select, Input, TableWrap, Csrf } from '../components/ui.jsx';

export const name = 'resident-issue-new';
export const title = 'Report an Issue';

export default function ResidentIssueNew() {
  const d = data;
  const suggestion = d.suggestion || null;

  return (
    <>
      <PageHead title="Report an Issue"
                sub="Submit with a category, description and optional photo. You will get a tracking number."
                back={{ href: '/resident/issues', label: 'My Issues' }} />

      <Flash flash={flash} />

      {suggestion && (
        <Card title="AI suggestion" icon="sparkles"
              sub={`Predicted category preselected below — change it if it's wrong.`}>
          <p style={{ marginBottom: 12 }}>
            <strong>{enumLabel('IssueCategory', suggestion.predictedCategory)}</strong>
            {' '}<span className="muted">(confidence {suggestion.confidencePct}%)</span>
          </p>
          {suggestion.neighbors && suggestion.neighbors.length > 0 && (
            <TableWrap>
              <thead>
                <tr><th>Ref</th><th>Category</th><th>Score</th></tr>
              </thead>
              <tbody>
                {suggestion.neighbors.map((nb, i) => (
                  <tr key={i}>
                    <td className="mono">{nb.refNumber}</td>
                    <td>{enumLabel('IssueCategory', nb.category)}</td>
                    <td className="num">{Number(nb.score).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Card>
      )}

      <Card>
        <form method="post" action="/resident/issues" encType="multipart/form-data">
          <Csrf />
          <Field label="Description" htmlFor="description"
                 hint="Describe the problem, including the location and how long it has been happening." full>
            <Textarea id="description" name="description" rows={5} required defaultValue={d.description} />
          </Field>
          <Field label="Category" htmlFor="category">
            <Select id="category" name="category" required
                    options={enumOptions('IssueCategory')}
                    defaultValue={suggestion?.predictedCategory || ''} />
          </Field>
          <Field label="Photo (optional)" htmlFor="photo">
            <Input id="photo" type="file" name="photo" accept="image/*" />
          </Field>
          <div className="btn-row">
            <Button type="submit" variant="ghost" icon="sparkles"
                    formAction="/resident/issues/suggest"
                    formEncType="application/x-www-form-urlencoded">Suggest category with AI</Button>
            <Button type="submit" variant="primary" icon="send">Submit issue</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
