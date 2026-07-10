export const LEAD_STATUSES = [
  'NEW',
  'PROCESSING',
  'MEASURING',
  'PROJECT_READY',
  'SIGNED',
  'CANCELLED'
];

export function isLeadStatus(value) {
  return LEAD_STATUSES.includes(value);
}
