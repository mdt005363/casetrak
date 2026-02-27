export const DEMO_USERS = [
  { id: 'u1', name: 'Sarah Mitchell', email: 'sarah@store.com', role: 'admin', avatar: 'SM' },
  { id: 'u2', name: 'James Cooper', email: 'james@store.com', role: 'manager', avatar: 'JC' },
  { id: 'u3', name: 'Mike Torres', email: 'mike@store.com', role: 'user', avatar: 'MT' },
  { id: 'u4', name: 'Lisa Chen', email: 'lisa@store.com', role: 'user', avatar: 'LC' },
  { id: 'u5', name: 'Dave Wilson', email: 'dave@store.com', role: 'user', avatar: 'DW' },
  { id: 'u6', name: 'Amy Brooks', email: 'amy@store.com', role: 'viewer', avatar: 'AB' },
];

export const DEMO_CASES = [
  { id: 'c1', title: 'Replace HVAC filter — Warehouse', description: 'Warehouse HVAC unit needs filter replaced. Last changed 3 months ago. Unit on roof above loading dock.', category: 'Equipment Maintenance', priority: 'medium', status: 'in_progress', createdBy: 'u2', assignedTo: 'u3', createdAt: '2026-02-20T09:00:00', dueDate: '2026-02-28', attachments: [], comments: [
    { id: 'cm1', userId: 'u2', text: 'Filter model is 20x25x4 MERV-11. Check supply closet first.', createdAt: '2026-02-20T09:05:00' },
    { id: 'cm2', userId: 'u3', text: '@James Cooper — supply closet is out. Ordering from vendor.', createdAt: '2026-02-21T14:30:00' },
  ]},
  { id: 'c2', title: 'Update lumber pricing on website', description: 'Pressure-treated lumber prices up 8% from distributor. Update all PT lumber SKUs on website and in-store signage.', category: 'Pricing / Inventory', priority: 'high', status: 'assigned', createdBy: 'u2', assignedTo: 'u4', createdAt: '2026-02-22T11:00:00', dueDate: '2026-02-25', attachments: [], comments: [] },
  { id: 'c3', title: 'Fix checkout register #3 — card reader error', description: 'Register 3 card reader showing "Communication Error" intermittently. Happens every ~5th transaction. Rebooting fixes temporarily.', category: 'IT / Website', priority: 'critical', status: 'open', createdBy: 'u2', assignedTo: null, createdAt: '2026-02-25T08:00:00', dueDate: '2026-02-26', attachments: [], comments: [
    { id: 'cm3', userId: 'u2', text: 'Causing long lines. Need someone on this ASAP.', createdAt: '2026-02-25T08:05:00' },
  ]},
  { id: 'c4', title: 'Run ethernet cable to new security camera', description: 'New camera needs Cat6 run from server room to back parking lot entrance. ~150ft.', category: 'Building / Facilities', priority: 'medium', status: 'assigned', createdBy: 'u1', assignedTo: 'u5', createdAt: '2026-02-18T10:00:00', dueDate: '2026-03-05', attachments: [], comments: [] },
  { id: 'c5', title: 'Forklift annual inspection', description: 'Annual OSHA-required forklift inspection due. Contact AccuServ for scheduling.', category: 'Equipment Maintenance', priority: 'high', status: 'completed', createdBy: 'u2', assignedTo: 'u3', createdAt: '2026-02-10T09:00:00', dueDate: '2026-02-20', attachments: [], comments: [
    { id: 'cm4', userId: 'u3', text: 'Inspection completed. Passed. Certificate posted by dock door.', createdAt: '2026-02-19T16:00:00' },
  ]},
  { id: 'c6', title: 'Restock first aid kits', description: 'Monthly check — restock all 4 first aid kits.', category: 'General / Other', priority: 'low', status: 'verified', createdBy: 'u2', assignedTo: 'u4', createdAt: '2026-02-01T08:00:00', dueDate: '2026-02-05', attachments: [], comments: [
    { id: 'cm5', userId: 'u4', text: 'All 4 kits restocked and logged.', createdAt: '2026-02-04T11:00:00' },
  ]},
];

export const DEMO_SOPS = [
  { id: 'sop1', title: 'POS Terminal Troubleshooting', category: 'IT / Website', tags: ['register','card reader','POS','payment'], version: '1.2', versionHistory: [
    { version: '1.0', date: '2025-11-01', changedBy: 'u1', notes: 'Initial creation' },
    { version: '1.1', date: '2026-01-10', changedBy: 'u1', notes: 'Added card reader reset steps' },
    { version: '1.2', date: '2026-02-15', changedBy: 'u1', notes: 'Added network check step' },
  ], estimatedTime: '15-30 min', tools: ['Phillips screwdriver','Spare USB cable','Spare ethernet cable'], safety: ['Unplug power before opening panels','Do not touch internal components while powered'], steps: [
    { order: 1, title: 'Power cycle the terminal', description: 'Turn off, wait 30 seconds, power back on. Check if issue persists.' },
    { order: 2, title: 'Check cable connections', description: 'Inspect USB and ethernet cables. Reseat both ends. Replace if damaged.' },
    { order: 3, title: 'Reset card reader', description: 'Unplug card reader USB, wait 10 seconds, plug back in. Run test transaction.' },
    { order: 4, title: 'Check network connectivity', description: 'Verify register can reach payment gateway. Try pinging 8.8.8.8.' },
    { order: 5, title: 'Contact vendor support', description: 'If issues persist, call POS vendor at (555) 123-4567. Account #HW-2847.' },
  ], suggestions: [], createdBy: 'u1', createdAt: '2025-11-01T10:00:00', updatedAt: '2026-02-15T14:00:00' },
  { id: 'sop2', title: 'HVAC Filter Replacement', category: 'Equipment Maintenance', tags: ['HVAC','filter','air conditioning','maintenance'], version: '1.0', versionHistory: [
    { version: '1.0', date: '2025-12-01', changedBy: 'u1', notes: 'Initial creation' },
  ], estimatedTime: '20-45 min', tools: ['Ladder (8ft min)','New filter','Work gloves','Dust mask'], safety: ['Use proper ladder safety','Wear dust mask','Turn off HVAC before access','Roof access requires buddy system'], steps: [
    { order: 1, title: 'Turn off HVAC unit', description: 'Locate disconnect switch and turn OFF. Verify unit stopped.' },
    { order: 2, title: 'Access filter compartment', description: 'Open filter access panel. Note arrow direction for airflow.' },
    { order: 3, title: 'Remove old filter', description: 'Slide out carefully. Place in trash bag to contain dust.' },
    { order: 4, title: 'Install new filter', description: 'Insert with airflow arrow matching noted direction. Ensure snug fit.' },
    { order: 5, title: 'Close and restart', description: 'Close panel, turn HVAC on, verify operation. Log date on maintenance chart.' },
  ], suggestions: [], createdBy: 'u1', createdAt: '2025-12-01T10:00:00', updatedAt: '2025-12-01T10:00:00' },
  { id: 'sop3', title: 'Forklift Daily Pre-Operation Inspection', category: 'Equipment Maintenance', tags: ['forklift','OSHA','safety','inspection','daily'], version: '1.1', versionHistory: [
    { version: '1.0', date: '2025-10-01', changedBy: 'u1', notes: 'Initial creation' },
    { version: '1.1', date: '2026-01-15', changedBy: 'u1', notes: 'Added tire pressure check' },
  ], estimatedTime: '10 min', tools: ['Inspection checklist form','Tire pressure gauge'], safety: ['Never operate forklift that fails inspection','Report issues to manager','Only certified operators'], steps: [
    { order: 1, title: 'Visual walk-around', description: 'Check for leaks, tire damage, fork condition, visible frame damage.' },
    { order: 2, title: 'Check fluid levels', description: 'Verify hydraulic fluid, oil, and coolant are in normal range.' },
    { order: 3, title: 'Test controls', description: 'Start forklift. Test steering, brakes, horn, lights, backup alarm.' },
    { order: 4, title: 'Test lift mechanism', description: 'Raise/lower forks full range. Tilt mast. Listen for unusual sounds.' },
    { order: 5, title: 'Check tire pressure', description: 'Use gauge for all tires at recommended PSI (check frame label).' },
    { order: 6, title: 'Complete checklist', description: 'Fill out form. Sign, date, place in binder at dock office.' },
  ], suggestions: [], createdBy: 'u1', createdAt: '2025-10-01T10:00:00', updatedAt: '2026-01-15T14:00:00' },
];

export const DEMO_WIKI = [
  { id: 'w1', title: 'How to Close the Register at End of Day', category: 'Store Policies', tags: ['register','closing','cash','end of day','training'], content: `## End of Day Register Closing\n\nEach register must be closed out at end of day by the closing manager or designated cashier.\n\n### Steps\n1. Press Manager Menu > End of Day on POS terminal\n2. Count the cash drawer — record amount on daily count sheet\n3. Compare counted amount to system total\n4. If variance exceeds $5, notify closing manager\n5. Place cash in deposit bag with count sheet\n6. Drop deposit bag in safe\n7. Print Z-report and staple to count sheet copy\n8. Turn off register terminal\n\n### Notes\n- Never leave cash unattended during counting\n- Two-person rule applies for deposits over $500\n- Z-reports must be filed in weekly binder`, version: '1.0', versionHistory: [{ version: '1.0', date: '2025-11-15', changedBy: 'u1', notes: 'Initial article' }], suggestions: [], createdBy: 'u1', createdAt: '2025-11-15T10:00:00', updatedAt: '2025-11-15T10:00:00' },
  { id: 'w2', title: 'Lumber Grading Guide', category: 'Product Knowledge', tags: ['lumber','grades','wood','product'], content: `## Lumber Grading Quick Reference\n\nUse this guide for customer questions and receiving shipments.\n\n### Common Grades\n- **Select / #1**: Minimal knots, best appearance. Premium pricing.\n- **#2 / Standard**: Some knots, good for general construction. Most common.\n- **#3 / Utility**: More imperfections. Budget option, structural use.\n- **Stud Grade**: Specifically graded for wall framing.\n\n### Pressure-Treated Grades\n- **Above Ground (UC3B)**: Decks, fences, general outdoor\n- **Ground Contact (UC4A)**: Posts, landscaping timbers\n- **Fresh Water (UC4B)**: Docks, retaining walls near water\n\n### Tips\n- Always check moisture content on incoming shipments\n- Stack lumber flat with stickers between layers\n- PT lumber needs 2-4 weeks to dry before staining`, version: '1.1', versionHistory: [{ version: '1.0', date: '2025-10-20', changedBy: 'u1', notes: 'Initial' }, { version: '1.1', date: '2026-01-05', changedBy: 'u1', notes: 'Added PT grades' }], suggestions: [], createdBy: 'u1', createdAt: '2025-10-20T10:00:00', updatedAt: '2026-01-05T10:00:00' },
  { id: 'w3', title: 'New Employee Onboarding Checklist', category: 'Training', tags: ['new hire','onboarding','training','HR'], content: `## New Employee First Week\n\n### Day 1\n- Store tour and introductions\n- Review safety procedures and emergency exits\n- Issue name badge, apron, locker assignment\n- POS system login setup\n- Review employee handbook (get signed acknowledgment)\n\n### Day 2-3\n- Shadow experienced employee in department\n- POS register training (practice transactions)\n- Product location walkthrough\n- Forklift safety awareness\n\n### Day 4-5\n- Supervised solo register time\n- Customer service role-play\n- Review return/exchange policy\n- Intro to inventory system\n\n### First Month\n- Complete SafetyFirst online modules\n- Pass register accuracy check (99%+ target)\n- Forklift certification (if applicable)\n- 30-day check-in with manager`, version: '1.0', versionHistory: [{ version: '1.0', date: '2026-01-10', changedBy: 'u1', notes: 'Initial' }], suggestions: [], createdBy: 'u1', createdAt: '2026-01-10T10:00:00', updatedAt: '2026-01-10T10:00:00' },
];

export const DEMO_RECURRING = [
  { id: 'r1', title: 'Forklift daily inspection', category: 'Equipment Maintenance', priority: 'medium', type: 'daily', customDays: null, assignTo: 'u3', nextRun: '2026-02-27', active: true },
  { id: 'r2', title: 'Restock first aid kits', category: 'General / Other', priority: 'low', type: 'monthly', customDays: null, assignTo: 'u4', nextRun: '2026-03-01', active: true },
  { id: 'r3', title: 'Generator maintenance', category: 'Equipment Maintenance', priority: 'high', type: 'custom', customDays: 90, assignTo: 'u5', nextRun: '2026-04-15', active: true },
];

export const DEMO_NOTIFS = [
  { id: 'n1', text: 'Register #3 card reader needs urgent attention', ref: 'c3', read: false, time: '2026-02-25T08:05:00' },
  { id: 'n2', text: 'Lumber pricing update overdue', ref: 'c2', read: false, time: '2026-02-24T09:00:00' },
];
