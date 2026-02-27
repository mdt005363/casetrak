// server/db/seed.js
// Run: node db/seed.js
// Populates CaseTrak with demo data

require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function seed() {
  console.log('🌱 Seeding CaseTrak database...\n');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('DELETE FROM notifications');
    await client.query('DELETE FROM case_attachments');
    await client.query('DELETE FROM case_comments');
    await client.query('DELETE FROM sop_suggestions');
    await client.query('DELETE FROM sop_versions');
    await client.query('DELETE FROM sop_steps');
    await client.query('DELETE FROM wiki_suggestions');
    await client.query('DELETE FROM wiki_versions');
    await client.query('DELETE FROM wiki_articles');
    await client.query('DELETE FROM sops');
    await client.query('DELETE FROM cases');
    await client.query('DELETE FROM recurring_tasks');
    await client.query('DELETE FROM categories');
    await client.query('DELETE FROM users');

    // Default password for all demo users
    const hash = await bcrypt.hash('casetrak123', 10);

    // ── USERS ──
    const users = await Promise.all([
      client.query("INSERT INTO users (email, password_hash, name, avatar, role) VALUES ($1,$2,$3,$4,$5) RETURNING id",
        ['sarah@store.com', hash, 'Sarah Mitchell', 'SM', 'admin']),
      client.query("INSERT INTO users (email, password_hash, name, avatar, role) VALUES ($1,$2,$3,$4,$5) RETURNING id",
        ['james@store.com', hash, 'James Cooper', 'JC', 'manager']),
      client.query("INSERT INTO users (email, password_hash, name, avatar, role) VALUES ($1,$2,$3,$4,$5) RETURNING id",
        ['mike@store.com', hash, 'Mike Torres', 'MT', 'user']),
      client.query("INSERT INTO users (email, password_hash, name, avatar, role) VALUES ($1,$2,$3,$4,$5) RETURNING id",
        ['lisa@store.com', hash, 'Lisa Chen', 'LC', 'user']),
      client.query("INSERT INTO users (email, password_hash, name, avatar, role) VALUES ($1,$2,$3,$4,$5) RETURNING id",
        ['dave@store.com', hash, 'Dave Wilson', 'DW', 'user']),
      client.query("INSERT INTO users (email, password_hash, name, avatar, role) VALUES ($1,$2,$3,$4,$5) RETURNING id",
        ['amy@store.com', hash, 'Amy Brooks', 'AB', 'viewer']),
    ]);
    const [sarah, james, mike, lisa, dave, amy] = users.map(r => r.rows[0].id);
    console.log(`✅ ${users.length} users created (password: casetrak123)`);

    // ── CATEGORIES ──
    const cats = ['IT / Website', 'Equipment Maintenance', 'Pricing / Inventory', 'Building / Facilities', 'General / Other'];
    for (let i = 0; i < cats.length; i++) {
      await client.query("INSERT INTO categories (name, sort_order) VALUES ($1, $2)", [cats[i], i]);
    }
    console.log(`✅ ${cats.length} categories created`);

    // ── CASES ──
    const c1 = (await client.query(
      "INSERT INTO cases (title, description, category, priority, status, created_by, assigned_to, due_date, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
      ['Replace HVAC filter — Warehouse', 'Warehouse HVAC unit needs filter replaced. Last changed 3 months ago. Unit on roof above loading dock.', 'Equipment Maintenance', 'medium', 'in_progress', james, mike, '2026-02-28', '2026-02-20T09:00:00Z']
    )).rows[0].id;

    const c2 = (await client.query(
      "INSERT INTO cases (title, description, category, priority, status, created_by, assigned_to, due_date, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
      ['Update lumber pricing on website', 'Pressure-treated lumber prices up 8% from distributor. Update all PT lumber SKUs on website and in-store signage.', 'Pricing / Inventory', 'high', 'assigned', james, lisa, '2026-02-25', '2026-02-22T11:00:00Z']
    )).rows[0].id;

    const c3 = (await client.query(
      "INSERT INTO cases (title, description, category, priority, status, created_by, due_date, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",
      ['Fix checkout register #3 — card reader error', 'Register 3 card reader showing "Communication Error" intermittently. Happens every ~5th transaction. Rebooting fixes temporarily.', 'IT / Website', 'critical', 'open', james, '2026-02-26', '2026-02-25T08:00:00Z']
    )).rows[0].id;

    const c4 = (await client.query(
      "INSERT INTO cases (title, description, category, priority, status, created_by, assigned_to, due_date, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
      ['Run ethernet cable to new security camera', 'New camera needs Cat6 run from server room to back parking lot entrance. ~150ft.', 'Building / Facilities', 'medium', 'assigned', sarah, dave, '2026-03-05', '2026-02-18T10:00:00Z']
    )).rows[0].id;

    const c5 = (await client.query(
      "INSERT INTO cases (title, description, category, priority, status, created_by, assigned_to, due_date, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
      ['Forklift annual inspection', 'Annual OSHA-required forklift inspection due. Contact AccuServ for scheduling.', 'Equipment Maintenance', 'high', 'completed', james, mike, '2026-02-20', '2026-02-10T09:00:00Z']
    )).rows[0].id;

    const c6 = (await client.query(
      "INSERT INTO cases (title, description, category, priority, status, created_by, assigned_to, due_date, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
      ['Restock first aid kits', 'Monthly check — restock all 4 first aid kits.', 'General / Other', 'low', 'verified', james, lisa, '2026-02-05', '2026-02-01T08:00:00Z']
    )).rows[0].id;

    console.log('✅ 6 cases created');

    // ── CASE COMMENTS ──
    await client.query("INSERT INTO case_comments (case_id, user_id, text, created_at) VALUES ($1,$2,$3,$4)", [c1, james, 'Filter model is 20x25x4 MERV-11. Check supply closet first.', '2026-02-20T09:05:00Z']);
    await client.query("INSERT INTO case_comments (case_id, user_id, text, created_at) VALUES ($1,$2,$3,$4)", [c1, mike, '@James Cooper — supply closet is out. Ordering from vendor.', '2026-02-21T14:30:00Z']);
    await client.query("INSERT INTO case_comments (case_id, user_id, text, created_at) VALUES ($1,$2,$3,$4)", [c3, james, 'Causing long lines. Need someone on this ASAP.', '2026-02-25T08:05:00Z']);
    await client.query("INSERT INTO case_comments (case_id, user_id, text, created_at) VALUES ($1,$2,$3,$4)", [c5, mike, 'Inspection completed. Passed. Certificate posted by dock door.', '2026-02-19T16:00:00Z']);
    await client.query("INSERT INTO case_comments (case_id, user_id, text, created_at) VALUES ($1,$2,$3,$4)", [c6, lisa, 'All 4 kits restocked and logged.', '2026-02-04T11:00:00Z']);
    console.log('✅ 5 comments created');

    // ── SOPs ──
    const sop1 = (await client.query(
      "INSERT INTO sops (title, category, tags, version, estimated_time, tools, safety, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
      ['POS Terminal Troubleshooting', 'IT / Website', '{register,"card reader",POS,payment}', '1.2', '15-30 min', '{"Phillips screwdriver","Spare USB cable","Spare ethernet cable"}', '{"Unplug power before opening panels","Do not touch internal components while powered"}', sarah, '2025-11-01T10:00:00Z']
    )).rows[0].id;

    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop1, 1, 'Power cycle the terminal', 'Turn off, wait 30 seconds, power back on. Check if issue persists.']);
    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop1, 2, 'Check cable connections', 'Inspect USB and ethernet cables. Reseat both ends. Replace if damaged.']);
    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop1, 3, 'Reset card reader', 'Unplug card reader USB, wait 10 seconds, plug back in. Run test transaction.']);
    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop1, 4, 'Check network connectivity', 'Verify register can reach payment gateway. Try pinging 8.8.8.8.']);
    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop1, 5, 'Contact vendor support', 'If issues persist, call POS vendor at (555) 123-4567. Account #HW-2847.']);
    await client.query("INSERT INTO sop_versions (sop_id, version, changed_by, notes, date) VALUES ($1,$2,$3,$4,$5)", [sop1, '1.0', sarah, 'Initial creation', '2025-11-01']);
    await client.query("INSERT INTO sop_versions (sop_id, version, changed_by, notes, date) VALUES ($1,$2,$3,$4,$5)", [sop1, '1.1', sarah, 'Added card reader reset steps', '2026-01-10']);
    await client.query("INSERT INTO sop_versions (sop_id, version, changed_by, notes, date) VALUES ($1,$2,$3,$4,$5)", [sop1, '1.2', sarah, 'Added network check step', '2026-02-15']);

    const sop2 = (await client.query(
      "INSERT INTO sops (title, category, tags, version, estimated_time, tools, safety, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
      ['HVAC Filter Replacement', 'Equipment Maintenance', '{HVAC,filter,"air conditioning",maintenance}', '1.0', '20-45 min', '{"Ladder (8ft min)","New filter","Work gloves","Dust mask"}', '{"Use proper ladder safety","Wear dust mask","Turn off HVAC before access","Roof access requires buddy system"}', sarah, '2025-12-01T10:00:00Z']
    )).rows[0].id;

    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop2, 1, 'Turn off HVAC unit', 'Locate disconnect switch and turn OFF. Verify unit stopped.']);
    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop2, 2, 'Access filter compartment', 'Open filter access panel. Note arrow direction for airflow.']);
    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop2, 3, 'Remove old filter', 'Slide out carefully. Place in trash bag to contain dust.']);
    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop2, 4, 'Install new filter', 'Insert with airflow arrow matching noted direction. Ensure snug fit.']);
    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop2, 5, 'Close and restart', 'Close panel, turn HVAC on, verify operation. Log date on maintenance chart.']);
    await client.query("INSERT INTO sop_versions (sop_id, version, changed_by, notes, date) VALUES ($1,$2,$3,$4,$5)", [sop2, '1.0', sarah, 'Initial creation', '2025-12-01']);

    const sop3 = (await client.query(
      "INSERT INTO sops (title, category, tags, version, estimated_time, tools, safety, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id",
      ['Forklift Daily Pre-Operation Inspection', 'Equipment Maintenance', '{forklift,OSHA,safety,inspection,daily}', '1.1', '10 min', '{"Inspection checklist form","Tire pressure gauge"}', '{"Never operate forklift that fails inspection","Report issues to manager","Only certified operators"}', sarah, '2025-10-01T10:00:00Z']
    )).rows[0].id;

    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop3, 1, 'Visual walk-around', 'Check for leaks, tire damage, fork condition, visible frame damage.']);
    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop3, 2, 'Check fluid levels', 'Verify hydraulic fluid, oil, and coolant are in normal range.']);
    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop3, 3, 'Test controls', 'Start forklift. Test steering, brakes, horn, lights, backup alarm.']);
    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop3, 4, 'Test lift mechanism', 'Raise/lower forks full range. Tilt mast. Listen for unusual sounds.']);
    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop3, 5, 'Check tire pressure', 'Use gauge for all tires at recommended PSI (check frame label).']);
    await client.query("INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)", [sop3, 6, 'Complete checklist', 'Fill out form. Sign, date, place in binder at dock office.']);
    await client.query("INSERT INTO sop_versions (sop_id, version, changed_by, notes, date) VALUES ($1,$2,$3,$4,$5)", [sop3, '1.0', sarah, 'Initial creation', '2025-10-01']);
    await client.query("INSERT INTO sop_versions (sop_id, version, changed_by, notes, date) VALUES ($1,$2,$3,$4,$5)", [sop3, '1.1', sarah, 'Added tire pressure check', '2026-01-15']);

    console.log('✅ 3 SOPs created with steps and version history');

    // ── WIKI ──
    const w1 = (await client.query(
      "INSERT INTO wiki_articles (title, category, tags, content, version, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
      ['How to Close the Register at End of Day', 'Store Policies', '{register,closing,cash,"end of day",training}',
       '## End of Day Register Closing\n\nEach register must be closed out at end of day by the closing manager or designated cashier.\n\n### Steps\n1. Press Manager Menu > End of Day on POS terminal\n2. Count the cash drawer — record amount on daily count sheet\n3. Compare counted amount to system total\n4. If variance exceeds $5, notify closing manager\n5. Place cash in deposit bag with count sheet\n6. Drop deposit bag in safe\n7. Print Z-report and staple to count sheet copy\n8. Turn off register terminal\n\n### Notes\n- Never leave cash unattended during counting\n- Two-person rule applies for deposits over $500\n- Z-reports must be filed in weekly binder',
       '1.0', sarah, '2025-11-15T10:00:00Z']
    )).rows[0].id;
    await client.query("INSERT INTO wiki_versions (article_id, version, changed_by, notes, date) VALUES ($1,$2,$3,$4,$5)", [w1, '1.0', sarah, 'Initial article', '2025-11-15']);

    const w2 = (await client.query(
      "INSERT INTO wiki_articles (title, category, tags, content, version, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
      ['Lumber Grading Guide', 'Product Knowledge', '{lumber,grades,wood,product}',
       '## Lumber Grading Quick Reference\n\nUse this guide for customer questions and receiving shipments.\n\n### Common Grades\n- **Select / #1**: Minimal knots, best appearance. Premium pricing.\n- **#2 / Standard**: Some knots, good for general construction. Most common.\n- **#3 / Utility**: More imperfections. Budget option, structural use.\n- **Stud Grade**: Specifically graded for wall framing.\n\n### Pressure-Treated Grades\n- **Above Ground (UC3B)**: Decks, fences, general outdoor\n- **Ground Contact (UC4A)**: Posts, landscaping timbers\n- **Fresh Water (UC4B)**: Docks, retaining walls near water\n\n### Tips\n- Always check moisture content on incoming shipments\n- Stack lumber flat with stickers between layers\n- PT lumber needs 2-4 weeks to dry before staining',
       '1.1', sarah, '2025-10-20T10:00:00Z']
    )).rows[0].id;
    await client.query("INSERT INTO wiki_versions (article_id, version, changed_by, notes, date) VALUES ($1,$2,$3,$4,$5)", [w2, '1.0', sarah, 'Initial', '2025-10-20']);
    await client.query("INSERT INTO wiki_versions (article_id, version, changed_by, notes, date) VALUES ($1,$2,$3,$4,$5)", [w2, '1.1', sarah, 'Added PT grades', '2026-01-05']);

    const w3 = (await client.query(
      "INSERT INTO wiki_articles (title, category, tags, content, version, created_by, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
      ['New Employee Onboarding Checklist', 'Training', '{"new hire",onboarding,training,HR}',
       '## New Employee First Week\n\n### Day 1\n- Store tour and introductions\n- Review safety procedures and emergency exits\n- Issue name badge, apron, locker assignment\n- POS system login setup\n- Review employee handbook (get signed acknowledgment)\n\n### Day 2-3\n- Shadow experienced employee in department\n- POS register training (practice transactions)\n- Product location walkthrough\n- Forklift safety awareness\n\n### Day 4-5\n- Supervised solo register time\n- Customer service role-play\n- Review return/exchange policy\n- Intro to inventory system\n\n### First Month\n- Complete SafetyFirst online modules\n- Pass register accuracy check (99%+ target)\n- Forklift certification (if applicable)\n- 30-day check-in with manager',
       '1.0', sarah, '2026-01-10T10:00:00Z']
    )).rows[0].id;
    await client.query("INSERT INTO wiki_versions (article_id, version, changed_by, notes, date) VALUES ($1,$2,$3,$4,$5)", [w3, '1.0', sarah, 'Initial', '2026-01-10']);

    console.log('✅ 3 wiki articles created');

    // ── RECURRING TASKS ──
    await client.query("INSERT INTO recurring_tasks (title, category, priority, type, assign_to, next_run, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7)", ['Forklift daily inspection', 'Equipment Maintenance', 'medium', 'daily', mike, '2026-02-27', sarah]);
    await client.query("INSERT INTO recurring_tasks (title, category, priority, type, assign_to, next_run, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7)", ['Restock first aid kits', 'General / Other', 'low', 'monthly', lisa, '2026-03-01', sarah]);
    await client.query("INSERT INTO recurring_tasks (title, category, priority, type, custom_days, assign_to, next_run, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", ['Generator maintenance', 'Equipment Maintenance', 'high', 'custom', 90, dave, '2026-04-15', sarah]);
    console.log('✅ 3 recurring tasks created');

    // ── NOTIFICATIONS ──
    await client.query("INSERT INTO notifications (user_id, text, ref_id, ref_type, created_at) VALUES ($1,$2,$3,$4,$5)", [sarah, 'Register #3 card reader needs urgent attention', c3, 'case', '2026-02-25T08:05:00Z']);
    await client.query("INSERT INTO notifications (user_id, text, ref_id, ref_type, created_at) VALUES ($1,$2,$3,$4,$5)", [sarah, 'Lumber pricing update overdue', c2, 'case', '2026-02-24T09:00:00Z']);
    console.log('✅ 2 notifications created');

    await client.query('COMMIT');
    console.log('\n✅ Seed complete!');
    console.log('\n📧 Demo logins (all password: casetrak123):');
    console.log('   sarah@store.com  (Admin)');
    console.log('   james@store.com  (Manager)');
    console.log('   mike@store.com   (User)');
    console.log('   lisa@store.com   (User)');
    console.log('   dave@store.com   (User)');
    console.log('   amy@store.com    (Viewer)');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    console.error(err.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
