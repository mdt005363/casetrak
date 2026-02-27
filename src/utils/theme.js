// Theme & Design Tokens
export const T = {
  bg: '#F0F1F5', surface: '#FFFFFF', surfAlt: '#F7F8FA',
  border: '#E2E4EA', borderLt: '#ECEEF2',
  text: '#1A1D26', textSec: '#5F6578', textMut: '#9498A8',
  pri: '#2D5BFF', priHov: '#1A45E0', priBg: '#EBF0FF',
  acc: '#FF6B35', accBg: '#FFF0EA',
  ok: '#0DA678', okBg: '#E6F7F1',
  warn: '#E5A100', warnBg: '#FFF8E5',
  err: '#E5334E', errBg: '#FDECEF',
  purp: '#7B61FF', purpBg: '#F0EDFF',
  rad: '10px', radSm: '7px', radLg: '14px',
  shadow: '0 1px 3px rgba(26,29,38,.06)',
  shadowMd: '0 4px 16px rgba(26,29,38,.08)',
  shadowLg: '0 12px 40px rgba(26,29,38,.12)',
};

export const PRIORITIES = [
  { value: 'critical', label: 'Critical', color: T.err, bg: T.errBg },
  { value: 'high', label: 'High', color: T.acc, bg: T.accBg },
  { value: 'medium', label: 'Medium', color: T.warn, bg: T.warnBg },
  { value: 'low', label: 'Low', color: T.ok, bg: T.okBg },
];

export const STATUSES = [
  { value: 'open', label: 'Open', color: T.pri, bg: T.priBg },
  { value: 'assigned', label: 'Assigned', color: T.purp, bg: T.purpBg },
  { value: 'in_progress', label: 'In Progress', color: '#0EA5E9', bg: '#E0F2FE' },
  { value: 'completed', label: 'Completed', color: T.ok, bg: T.okBg },
  { value: 'verified', label: 'Verified/Closed', color: T.textMut, bg: T.surfAlt },
];

export const NEXT_STATUS = {
  open: ['assigned'],
  assigned: ['in_progress'],
  in_progress: ['completed'],
  completed: ['verified', 'in_progress'],
  verified: [],
};

export const DEFAULT_CATEGORIES = [
  'IT / Website', 'Equipment Maintenance', 'Pricing / Inventory',
  'Building / Facilities', 'General / Other',
];

export const WIKI_CATEGORIES = [
  'Product Knowledge', 'Store Policies', 'Equipment Guides',
  'Training', 'How-To', 'General',
];

export const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'Standard User' },
  { value: 'viewer', label: 'Viewer' },
];

export const RECURRENCE_TYPES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom (days)' },
];

export const AVATAR_COLORS = ['#2D5BFF','#7B61FF','#FF6B35','#0DA678','#E5A100','#E5334E'];
