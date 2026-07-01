import { data, flash } from '../lib/page.js';
import { enumLabel, enumOptions } from '../lib/enums.js';
import { PageHead, Card, Flash, Alert, Button, Select, TableWrap, Csrf } from '../components/ui.jsx';

export const name = 'resident-preferences';
export const title = 'Communication Preferences';

export default function ResidentPreferences() {
  const d = data;
  const prefs = d.prefs || [];
  const enabled = d.enabledChannels && d.enabledChannels.length ? d.enabledChannels : ['SMS', 'WHATSAPP', 'EMAIL', 'VOICE'];
  const defaultChannel = d.defaultChannel || enabled[0] || 'SMS';

  // Show every channel, but grey out the ones that are switched off.
  const channelOptions = enumOptions('Channel').map((o) => ({
    ...o,
    disabled: !enabled.includes(o.value),
    label: enabled.includes(o.value) ? o.label : `${o.label} (disabled)`,
  }));
  const disabledLabels = enumOptions('Channel').filter((o) => !enabled.includes(o.value)).map((o) => o.label);
  const enabledLabels = enabled.map((c) => enumLabel('Channel', c));

  return (
    <>
      <PageHead title="Communication Preferences"
                sub="Choose your preferred channel and language for each kind of notice. Emergency alerts always override these." />

      <Flash flash={flash} />

      {disabledLabels.length > 0 && (
        <Alert tone="info" icon="bell">
          Only <strong>{enabledLabels.join(', ')}</strong> {enabledLabels.length === 1 ? 'is' : 'are'} currently active.
          {' '}{disabledLabels.join(', ')} {disabledLabels.length === 1 ? 'is' : 'are'} disabled and cannot be selected.
        </Alert>
      )}

      <Card flush>
        <form method="post" action="/resident/preferences">
          <Csrf />
          <TableWrap>
            <thead>
              <tr>
                <th>Notice category</th>
                <th>Channel</th>
                <th>Language</th>
              </tr>
            </thead>
            <tbody>
              {prefs.map((p) => (
                <tr key={p.id}>
                  <td className="strong">{enumLabel('NoticeCategory', p.category)}</td>
                  <td>
                    <Select name={`channel_${p.id}`} options={channelOptions}
                            defaultValue={enabled.includes(p.channel) ? p.channel : defaultChannel} />
                  </td>
                  <td>
                    <Select name={`language_${p.id}`} options={enumOptions('Language')} defaultValue={p.language} />
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <div style={{ padding: 16 }}>
            <Button type="submit" variant="primary" icon="check">Save preferences</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
