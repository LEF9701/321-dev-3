import { data } from '../lib/page.js';
import { enumLabel } from '../lib/enums.js';
import { PageHead, Card, Stat, Badge, Bar, EmptyState, TableWrap } from '../components/ui.jsx';

export const name = 'ai-evaluation';
export const title = 'AI Evaluation';

export default function AiEvaluation() {
  const d = data;
  const c = d.classification || {};
  const r = d.retrieval || {};
  const perCategory = c.perCategory || [];
  const examples = c.examples || [];
  const rows = r.rows || [];

  return (
    <>
      <PageHead title="AI Evaluation" sub="k-NN classifier + retrieval metrics (rp.pdf §5)" />

      <Card title="Issue auto-categorisation (FR-8.3)" icon="sparkles">
        <div className="grid grid--3">
          <Stat label="Test examples" value={c.n ?? 0} icon="clipboard" />
          <Stat label="Correct" value={c.correct ?? 0} icon="check" />
          <Stat label="Accuracy" value={(c.accuracyPct ?? 0) + '%'} icon="chart" />
        </div>
        <div className="small muted" style={{ marginTop: 12 }}>
          k={c.k}, train size={c.trainSize} (evaluated on a held-out 25% split)
        </div>
      </Card>

      <Card title="Per-category accuracy" icon="chart" flush>
        {perCategory.length === 0
          ? <EmptyState icon="chart" title="No categories evaluated" />
          : (
            <TableWrap>
              <thead>
                <tr><th>Category</th><th className="num">Test items</th><th className="num">Correct</th><th>Accuracy</th></tr>
              </thead>
              <tbody>
                {perCategory.map((pc, i) => (
                  <tr key={i}>
                    <td>{enumLabel('IssueCategory', pc.category)}</td>
                    <td className="num">{pc.total}</td>
                    <td className="num">{pc.correct}</td>
                    <td><Bar pct={pc.accuracyPct} showLabel /></td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>

      <Card title="Predictions" icon="clipboard" flush>
        {examples.length === 0
          ? <EmptyState icon="clipboard" title="No predictions" />
          : (
            <TableWrap>
              <thead>
                <tr><th>Ref</th><th>Actual</th><th>Predicted</th><th>Result</th></tr>
              </thead>
              <tbody>
                {examples.map((ex, i) => (
                  <tr key={i}>
                    <td className="mono">{ex.refNumber}</td>
                    <td>{enumLabel('IssueCategory', ex.actual)}</td>
                    <td>{ex.predicted ? enumLabel('IssueCategory', ex.predicted) : <span className="muted">—</span>}</td>
                    <td>{ex.correct ? <Badge tone="ok">✓</Badge> : <Badge tone="danger">✗</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>

      <Card title="Retrieval (FR-8.1)" icon="search">
        <div className="grid grid--4">
          <Stat label="Recall@1" value={(r.recall1Pct ?? 0) + '%'} icon="search" />
          <Stat label="Recall@3" value={(r.recall3Pct ?? 0) + '%'} icon="search" />
          <Stat label="Recall@5" value={(r.recall5Pct ?? 0) + '%'} icon="search" />
          <Stat label="MRR" value={Number(r.mrr ?? 0).toFixed(2)} icon="chart" />
        </div>
      </Card>

      <Card title="Retrieval results" icon="search" flush>
        {rows.length === 0
          ? <EmptyState icon="search" title="No questions evaluated" />
          : (
            <TableWrap>
              <thead>
                <tr><th>Question</th><th>Expected doc</th><th className="center">Rank</th><th>Top retrieved</th></tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.question}</td>
                    <td className="mono">{row.expected}</td>
                    <td className="center">{row.rank}</td>
                    <td className="mono small">{row.topDocs}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
      </Card>
    </>
  );
}
