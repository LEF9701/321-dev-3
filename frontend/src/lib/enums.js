// Central enum label + tone maps. Templates inject only the enum NAME (e.g.
// "OVERDUE"); the UI derives the human label and the status colour here. This
// mirrors the server enum labels exactly (see model/*.java).

export const ENUMS = {
  Role: {
    RESIDENT:   { label: 'Resident' },
    MANAGEMENT: { label: 'Management' },
    ADMIN:      { label: 'Admin' },
  },
  Language: {
    EN: { label: 'English' },
    ZH: { label: '中文' },
  },
  FeeStatus: {
    PAID:    { label: 'Paid',    tone: 'ok' },
    DUE:     { label: 'Due',     tone: 'warn' },
    OVERDUE: { label: 'Overdue', tone: 'danger' },
  },
  UnitStatus: {
    VACANT:   { label: 'Vacant',   tone: 'muted' },
    OCCUPIED: { label: 'Occupied', tone: 'ok' },
  },
  Channel: {
    SMS:      { label: 'SMS' },
    WHATSAPP: { label: 'WhatsApp' },
    EMAIL:    { label: 'Email' },
    VOICE:    { label: 'Voice Call' },
  },
  Severity: {
    INFO:     { label: 'Info',     tone: 'info' },
    WARNING:  { label: 'Warning',  tone: 'warn' },
    CRITICAL: { label: 'Critical', tone: 'danger' },
  },
  NoticeCategory: {
    EMERGENCY:            { label: 'Emergency',            tone: 'danger' },
    ANNOUNCEMENT:         { label: 'Announcement',         tone: 'brand' },
    MEETING:              { label: 'Meeting / AGM Notice', tone: 'info' },
    FEE_REMINDER:         { label: 'Fee Reminder',         tone: 'warn' },
    SERVICE_INTERRUPTION: { label: 'Service Interruption', tone: 'warn' },
    MAINTENANCE:          { label: 'Maintenance',          tone: 'info' },
    OBSERVATORY:          { label: 'HK Observatory Alert', tone: 'warn' },
    GENERAL:              { label: 'General',              tone: 'muted' },
  },
  DeliveryStatus: {
    PENDING:   { label: 'Pending',   tone: 'muted' },
    SENT:      { label: 'Sent',      tone: 'info' },
    DELIVERED: { label: 'Delivered', tone: 'brand' },
    READ:      { label: 'Read',      tone: 'ok' },
    FAILED:    { label: 'Failed',    tone: 'danger' },
  },
  IssueStatus: {
    SUBMITTED:    { label: 'Submitted',    tone: 'info' },
    UNDER_REVIEW: { label: 'Under Review', tone: 'brand' },
    IN_PROGRESS:  { label: 'In Progress',  tone: 'warn' },
    RESOLVED:     { label: 'Resolved',     tone: 'ok' },
    WITHDRAWN:    { label: 'Withdrawn',    tone: 'muted' },
  },
  IssueCategory: {
    PLUMBING:    { label: 'Plumbing' },
    ELECTRICAL:  { label: 'Electrical' },
    AC_HEATING:  { label: 'Air-con / Heating' },
    SECURITY:    { label: 'Security' },
    COMMON_AREA: { label: 'Common Area' },
    NOISE:       { label: 'Noise' },
    OTHER:       { label: 'Other' },
  },
  IssuePriority: {
    LOW:    { label: 'Low',    tone: 'muted' },
    MEDIUM: { label: 'Medium', tone: 'info' },
    HIGH:   { label: 'High',   tone: 'danger' },
  },
  EmergencyType: {
    FIRE:       { label: 'Fire' },
    TYPHOON:    { label: 'Typhoon' },
    FLOOD:      { label: 'Flood' },
    GAS_LEAK:   { label: 'Gas Leak' },
    STRUCTURAL: { label: 'Structural' },
    OTHER:      { label: 'Other' },
  },
};

// Fixed display order for the issue status stepper.
export const ISSUE_STATUS_ORDER = ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED'];

export function enumLabel(type, name) {
  if (name == null) return '';
  return ENUMS[type]?.[name]?.label ?? String(name);
}
export function enumTone(type, name) {
  return ENUMS[type]?.[name]?.tone ?? 'muted';
}
// [{ value, label }] for building <select> options from an enum.
export function enumOptions(type) {
  return Object.entries(ENUMS[type] || {}).map(([value, v]) => ({ value, label: v.label }));
}
