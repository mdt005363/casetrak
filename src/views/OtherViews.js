import React, { useState } from 'react';
import { T, PRIORITIES, RECURRENCE_TYPES, ROLES } from '../utils/theme';
import { getPriority, getUser, formatDate, generateId } from '../utils/helpers';
import { Card, Badge, Avatar, Btn, Inp, Sel, Lbl, Modal, Empty } from '../components/UI';

// ═══════════ RECURRING TASKS ═══════════
export function Recurring({ recurring, users, categories, curUser, canEdit, onUpdate, onCreate }) {
  const [showNew, setShowNew] = useState(false);
  const [f, sF] = useState({ title: '', category: '', priority: 'medium', type: 'weekly', customDays: '', assignTo: '' });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Recurring Tasks</h1>
        {canEdit && <Btn s="sm" icon={<span>+</span>} onClick={() => setShowNew(true)}>New Schedule</Btn>}
      </div>

      {recurring.length === 0 ? <Empty icon="🔄" title="No recurring tasks" desc="Schedule regular maintenance" /> :
        recurring.map(r => { const a = getUser(r.assignTo, users); const p = getPriority(r.priority); return (
          <Card key={r.id} style={{ marginBottom: '8px' }}>
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: T.rad, backgroundColor: r.active ? T.priBg : T.surfAlt, color: r.active ? T.pri : T.textMut, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🔄</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 650 }}>{r.title}</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Badge color={p.color} bg={p.bg} small>{p.label}</Badge>
                  <span style={{ fontSize: '11px', color: T.textMut }}>{r.type === 'custom' ? `Every ${r.customDays}d` : r.type} · Next: {formatDate(r.nextRun)}</span>
                  {r.category && <span style={{ fontSize: '11px', color: T.textMut }}>· {r.category}</span>}
                </div>
              </div>
              {a && <Avatar user={a} size="sm" />}
              <Btn v={r.active ? 'success' : 'secondary'} s="sm" onClick={() => onUpdate(r.id, { active: !r.active })}>{r.active ? 'Active' : 'Paused'}</Btn>
            </div>
          </Card>
        );})
      }

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="New Recurring Task">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div><Lbl>Title *</Lbl><Inp value={f.title} onChange={v => sF({...f,title:v})} placeholder="e.g., Forklift daily inspection" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><Lbl>Category</Lbl><Sel value={f.category} onChange={v => sF({...f,category:v})} placeholder="Select" options={categories.map(c=>({value:c,label:c}))} style={{width:'100%'}} /></div>
            <div><Lbl>Priority</Lbl><Sel value={f.priority} onChange={v => sF({...f,priority:v})} options={PRIORITIES} style={{width:'100%'}} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div><Lbl>Recurrence</Lbl><Sel value={f.type} onChange={v => sF({...f,type:v})} options={RECURRENCE_TYPES} style={{width:'100%'}} /></div>
            {f.type === 'custom' && <div><Lbl>Every X days</Lbl><Inp type="number" value={f.customDays} onChange={v => sF({...f,customDays:v})} placeholder="90" /></div>}
            <div><Lbl>Auto-assign</Lbl><Sel value={f.assignTo} onChange={v => sF({...f,assignTo:v})} placeholder="Select" options={users.filter(u=>u.role!=='viewer').map(u=>({value:u.id,label:u.name}))} style={{width:'100%'}} /></div>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Btn v="secondary" onClick={() => setShowNew(false)}>Cancel</Btn>
            <Btn onClick={() => { if (f.title) { onCreate({ ...f, customDays: f.customDays ? parseInt(f.customDays) : null }); setShowNew(false); sF({ title:'', category:'', priority:'medium', type:'weekly', customDays:'', assignTo:'' }); }}} disabled={!f.title}>Create</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════ TEAM ═══════════
export function Team({ users, cases, curUser }) {
  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 16px' }}>Team</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
        {users.map(u => {
          const cnt = cases.filter(c => c.assignedTo === u.id && !['verified'].includes(c.status)).length;
          return (
            <Card key={u.id}><div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar user={u} size="lg" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 650 }}>
                  {u.name}{u.id === curUser.id && <span style={{ fontSize: '11px', color: T.pri, marginLeft: '4px' }}>(You)</span>}
                </div>
                <div style={{ fontSize: '12px', color: T.textMut }}>{u.email}</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '5px' }}>
                  <Badge color={T.pri} bg={T.priBg} small>{ROLES.find(r => r.value === u.role)?.label}</Badge>
                  {u.role !== 'viewer' && <span style={{ fontSize: '11px', color: T.textMut }}>{cnt} active</span>}
                </div>
              </div>
            </div></Card>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════ SETTINGS ═══════════
export function Settings({ users, categories, curUser, setCurUser, setCategories }) {
  const [newCat, setNewCat] = useState('');
  const isAdmin = curUser.role === 'admin';

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 20px' }}>Settings</h1>

      <Card style={{ marginBottom: '14px' }}><div style={{ padding: '18px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 750, margin: '0 0 8px' }}>Switch User (Demo)</h3>
        <p style={{ fontSize: '12.5px', color: T.textMut, margin: '0 0 10px' }}>Test different role permissions</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {users.map(u => <Btn key={u.id} s="sm" v={curUser.id === u.id ? 'primary' : 'secondary'} onClick={() => setCurUser(u)}>{u.name} ({u.role})</Btn>)}
        </div>
      </div></Card>

      <Card><div style={{ padding: '18px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 750, margin: '0 0 10px' }}>Categories</h3>
        {categories.map((c, i) => (
          <div key={c} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', backgroundColor: T.surfAlt, borderRadius: T.radSm, marginBottom: '4px' }}>
            <span style={{ fontSize: '13px' }}>{c}</span>
            {isAdmin && categories.length > 1 && <button onClick={() => setCategories(p => p.filter((_,idx)=>idx!==i))} style={{ background:'none', border:'none', cursor:'pointer', color:T.textMut, fontSize:'16px' }}>×</button>}
          </div>
        ))}
        {isAdmin && <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          <Inp value={newCat} onChange={setNewCat} placeholder="New category" style={{ flex: 1 }} />
          <Btn s="sm" onClick={() => { if (newCat.trim() && !categories.includes(newCat.trim())) { setCategories(p => [...p, newCat.trim()]); setNewCat(''); }}}>Add</Btn>
        </div>}
      </div></Card>
    </div>
  );
}
