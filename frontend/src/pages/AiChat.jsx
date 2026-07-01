import { data } from '../lib/page.js';
import { PageHead, Card, Badge, Button, Textarea, Csrf, EmptyState, TableWrap } from '../components/ui.jsx';

export const name = 'ai-chat';
export const title = 'AI Assistant';

export default function AiChat() {
  const d = data;
  const result = d.result || null;
  const sources = (result && result.sources) || [];

  const askForm = (
    <Card title="Ask the assistant" icon="sparkles">
      <form method="post" action="/ai/chat">
        <Csrf />
        <Textarea
          name="question"
          rows={2}
          required
          defaultValue={d.question || ''}
          placeholder="e.g. What are the quiet hours? / 裝修可以在甚麼時間進行？"
        />
        <div style={{ marginTop: 12 }}>
          <Button type="submit" variant="primary" icon="send">Ask</Button>
        </div>
      </form>
    </Card>
  );

  return (
    <>
      <PageHead title="AI Assistant" sub="Bylaws & FAQ (FR-8.1)" />

      <div style={{ marginBottom: 16 }}>
        <Badge tone={d.claudeAvailable ? 'brand' : 'muted'}>
          {d.claudeAvailable ? 'Claude (live)' : 'Local / offline (extractive)'}
        </Badge>
        <div className="small muted" style={{ marginTop: 6 }}>
          Ask about estate rules, fees, renovation, noise, fire safety, meetings and more. Answers are retrieved
          from the indexed bylaw / FAQ documents and cited as <code>[doc-k]</code>; if nothing relevant is found,
          the assistant declines rather than guessing.
        </div>
      </div>

      {askForm}

      {result && (
        <>
          <Card title="Answer" icon="sparkles">
            <div className="chat-msg">
              <div className="chat-msg__avatar me">You</div>
              <div className="chat-bubble">{d.question}</div>
            </div>
            <div className="chat-msg">
              <div className="chat-msg__avatar ai">AI</div>
              <div className={result.refused ? 'chat-bubble refused' : 'chat-bubble'}>{result.answer}</div>
            </div>
            {result.mode && (
              <div className="small muted" style={{ marginTop: 4 }}>Generated via {result.mode}</div>
            )}
          </Card>

          {!result.refused && (
            <Card title="Cited sources" icon="file" flush>
              {sources.length === 0
                ? <EmptyState icon="file" title="No sources cited" />
                : (
                  <TableWrap>
                    <thead>
                      <tr><th>Label</th><th>Doc</th><th>Title</th><th className="center">Similarity</th><th>Passage</th></tr>
                    </thead>
                    <tbody>
                      {sources.map((s, i) => (
                        <tr key={i}>
                          <td>{'[' + s.label + ']'}</td>
                          <td className="mono">{s.docCode}</td>
                          <td>{s.title}</td>
                          <td className="center">{Number(s.score).toFixed(2)}</td>
                          <td className="muted small">{s.snippet}</td>
                        </tr>
                      ))}
                    </tbody>
                  </TableWrap>
                )}
            </Card>
          )}
        </>
      )}
    </>
  );
}
