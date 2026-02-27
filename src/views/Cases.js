import React, { useState, useMemo } from 'react';
import { T, PRIORITIES, STATUSES, NEXT_STATUS } from '../utils/theme';
import { getPriority, getStatus, getUser, isOverdue, formatDate, formatDT, generateId, now, suggestSOPs } from '../utils/helpers';
import { Card, Badge, Avatar, Btn, Inp, TArea, Sel, Lbl, Modal, Empty } from '../components/UI';

// ── Case Row ──
function CaseRow({ c, users, onClick }) {
  const p = getPriority(c.priority), s = getStatus(c.status), a = getUser(c.assignedTo, users), od = isOverdue(c.dueDate, c.status);
  return (
    <Card onClick={onClick} style={{ marginBottom: '6px' }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '3px', height: '36px', borderRadius: '2px', backgroundColor: p.color, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13.5px', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {c.title} {od && <Badge color={T.err} bg={T.errBg} small>Overdue</Badge>}
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge color={s.color} bg={s.bg} small>{s.label}</Badge>
            <Badge color={p.color} bg={p.bg} small>{p.label}</Badge>
            <span style={{ fontSize: '11.5px', color: T.textMut }}>{c.category}</span>
            {c.dueDate && <span style={{ fontSize: '11.5px', color: od ? T.err : T.textMut }}>📅 {formatDate(c.dueDate)}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {c.comments.length > 0 && <span style={{ fontSize: '11px', color: T.textMut }}>💬 {c.comments.length}</span>}
          {a && <Avatar user={a} size="sm" />}
        </div>
      </div>
    </Card>
  );
}

// ── New Case Form ──
function CaseForm({ categories, users, onSubmit, onClose }) {
  const [f, sF] = useState({ title: '', description: '', category: '', priority: 'medium', assignedTo: '', dueDate: '' });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div><Lbl>Title *</Lbl><Inp value={f.title} onChange={v => sF({...f, title: v})} placeholder="Brief description of the issue" /></div>
      <div><Lbl>Description</Lbl><TArea value={f.description} onChange={v => sF({...f, description: v})} placeholder="Detailed description..." rows={3} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div><Lbl>Category *</Lbl><Sel value={f.category} onChange={v => sF({...f, category: v})} placeholder="Select" options={categories.map(c=>({value:c,label:c}))} style={{width:'100%'}} /></div>
        <div><Lbl>Priority</Lbl><Sel value={f.priority} onChange={v => sF({...f, priority: v})} options={PRIORITIES} style={{width:'100%'}} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div><Lbl>Assign To</Lbl><Sel value={f.assignedTo} onChange={v => sF({...f, assignedTo: v})} placeholder="Unassigned" options={users.filter(u=>u.role!=='viewer').map(u=>({value:u.id,label:u.name}))} style={{width:'100%'}} /></div>
        <div><Lbl>Due Date</Lbl><Inp type="date" value={f.dueDate} onChange={v => sF({...f, dueDate: v})} /></div>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
        <Btn v="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => { if (f.title && f.category) onSubmit(f); }} disabled={!f.title || !f.category}>Create Case</Btn>
      </div>
    </div>
  );
}

// ── Case Detail ──
function CaseDetail({ caseData, cases, users, sops, curUser, canEdit, onUpdate, onAddComment, onDelete, onBack, onOpenAI, onViewSOP }) {
  const c = cases.find(x => x.id === caseData.id) || caseData;
  const [newCmt, setNewCmt] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const p = getPriority(c.priority), s = getStatus(c.status), od = isOverdue(c.dueDate, c.status);
  const suggested = suggestSOPs(c, sops);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMut, display: 'flex', padding: '4px', fontSize: '18px' }}>←</button>
        <h2 style={{ fontSize: '18px', fontWeight: 750, margin: 0, flex: 1 }}>{c.title}</h2>
        <Btn v="accent" s="sm" icon={<span>✨</span>} onClick={() => onOpenAI(c)}>AI Help</Btn>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        <Badge color={s.color} bg={s.bg}>{s.label}</Badge>
        <Badge color={p.color} bg={p.bg}>{p.label}</Badge>
        <Badge color={T.textSec} bg={T.surfAlt}>{c.category}</Badge>
        {od && <Badge color={T.err} bg={T.errBg}>⚠ Overdue</Badge>}
      </div>

      <p style={{ fontSize: '14px', color: T.textSec, lineHeight: 1.6, margin: '0 0 20px', whiteSpace: 'pre-wrap' }}>{c.description || 'No description.'}</p>

      {/* Suggested SOPs */}
      {suggested.length > 0 && (
        <Card style={{ marginBottom: '16px', borderLeft: `3px solid ${T.pri}` }}>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: T.pri, marginBottom: '8px' }}>✨ Suggested SOPs</div>
            {suggested.map(sp => (
              <div key={sp.id} onClick={() => onViewSOP(sp)} style={{ padding: '6px 0', cursor: 'pointer', fontSize: '13px', color: T.pri, fontWeight: 600 }}>
                🔗 {sp.title} <span style={{ color: T.textMut, fontWeight: 400 }}>v{sp.version}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Meta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div><Lbl>Assigned To</Lbl>
          {canEdit ? <Sel value={c.assignedTo || ''} onChange={v => onUpdate(c.id, { assignedTo: v || null, status: v && c.status === 'open' ? 'assigned' : c.status })} placeholder="Unassigned" options={users.filter(u=>u.role!=='viewer').map(u=>({value:u.id,label:u.name}))} style={{width:'100%'}} /> : <div style={{ fontSize: '13px', padding: '6px 0' }}>{getUser(c.assignedTo, users)?.name || 'Unassigned'}</div>}
        </div>
        <div><Lbl>Due Date</Lbl>
          {canEdit ? <Inp type="date" value={c.dueDate || ''} onChange={v => onUpdate(c.id, { dueDate: v || null })} /> : <div style={{ fontSize: '13px', padding: '6px 0' }}>{formatDate(c.dueDate)}</div>}
        </div>
      </div>

      {/* Status transitions */}
      {(canEdit || curUser.id === c.assignedTo) && NEXT_STATUS[c.status]?.length > 0 && (
        <div style={{ padding: '14px', backgroundColor: T.surfAlt, borderRadius: T.rad, marginBottom: '20px', border: `1px solid ${T.borderLt}` }}>
          <Lbl>Update Status</Lbl>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
            {NEXT_STATUS[c.status].map(ns => { const st = getStatus(ns); return <Btn key={ns} v="secondary" s="sm" icon={<span>✓</span>} onClick={() => onUpdate(c.id, { status: ns })}>{st.label}</Btn>; })}
          </div>
        </div>
      )}

      {/* Comments */}
      <h3 style={{ fontSize: '14px', fontWeight: 750, margin: '0 0 12px' }}>💬 Comments ({c.comments.length})</h3>
      {c.comments.map(cm => { const au = getUser(cm.userId, users); return (
        <div key={cm.id} style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <Avatar user={au} />
          <div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 650 }}>{au?.name}</span>
              <span style={{ fontSize: '11px', color: T.textMut }}>{formatDT(cm.createdAt)}</span>
            </div>
            <p style={{ fontSize: '13.5px', color: T.textSec, margin: '3px 0 0', lineHeight: 1.5 }}>
              {cm.text.split(/(@\w+ \w+)/g).map((pt, i) => pt.startsWith('@') ? <span key={i} style={{ color: T.pri, fontWeight: 650 }}>{pt}</span> : pt)}
            </p>
          </div>
        </div>
      );})}

      {/* New comment */}
      {curUser.role !== 'viewer' && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', position: 'relative' }}>
          <Avatar user={curUser} />
          <div style={{ flex: 1 }}>
            <TArea value={newCmt} onChange={setNewCmt} placeholder="Add a comment... Type @ to mention" rows={2} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <Btn v="ghost" s="sm" onClick={() => setShowMentions(!showMentions)}>@ Mention</Btn>
              <Btn s="sm" onClick={() => { if (newCmt.trim()) { onAddComment(c.id, newCmt); setNewCmt(''); }}} disabled={!newCmt.trim()}>Post</Btn>
            </div>
            {showMentions && (
              <div style={{ position: 'absolute', bottom: '100%', left: '38px', backgroundColor: T.surface, border: `1px solid ${T.border}`, borderRadius: T.rad, boxShadow: T.shadowMd, padding: '4px', zIndex: 10 }}>
                {users.map(u => (
                  <div key={u.id} onClick={() => { setNewCmt(p => p + `@${u.name} `); setShowMentions(false); }}
                    style={{ padding: '7px 10px', cursor: 'pointer', borderRadius: '6px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '7px' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = T.surfAlt}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Avatar user={u} size="sm" />{u.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Cases View ──
export default function Cases({ cases, users, sops, categories, curUser, selCase, setSelCase, onCreateCase, onUpdateCase, onAddComment, onDeleteCase, onOpenAI, onViewSOP }) {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', assignee: '' });

  const canEdit = curUser.role === 'admin' || curUser.role === 'manager';

  const filtered = useMemo(() => cases.filter(c => {
    if (search && !`${c.title} ${c.description}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.status && c.status !== filters.status) return false;
    if (filters.priority && c.priority !== filters.priority) return false;
    if (filters.category && c.category !== filters.category) return false;
    if (filters.assignee && c.assignedTo !== filters.assignee) return false;
    return true;
  }), [cases, search, filters]);

  if (selCase) {
    return <CaseDetail caseData={selCase} cases={cases} users={users} sops={sops} curUser={curUser} canEdit={canEdit}
      onUpdate={onUpdateCase} onAddComment={onAddComment} onDelete={onDeleteCase}
      onBack={() => setSelCase(null)} onOpenAI={onOpenAI} onViewSOP={onViewSOP} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Cases</h1>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Btn v="ghost" s="sm" onClick={() => setShowFilters(!showFilters)}>🔽 Filters</Btn>
          {canEdit && <Btn s="sm" icon={<span>+</span>} onClick={() => setShowNew(true)}>New Case</Btn>}
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <Inp value={search} onChange={setSearch} placeholder="🔍  Search cases..." />
      </div>

      {showFilters && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '6px', marginBottom: '12px', padding: '12px', backgroundColor: T.surfAlt, borderRadius: T.rad, border: `1px solid ${T.borderLt}` }}>
          <Sel value={filters.status} onChange={v => setFilters({...filters, status: v})} placeholder="All Status" options={STATUSES} style={{width:'100%'}} />
          <Sel value={filters.priority} onChange={v => setFilters({...filters, priority: v})} placeholder="All Priority" options={PRIORITIES} style={{width:'100%'}} />
          <Sel value={filters.category} onChange={v => setFilters({...filters, category: v})} placeholder="All Categories" options={categories.map(c=>({value:c,label:c}))} style={{width:'100%'}} />
          <Btn v="ghost" s="sm" onClick={() => setFilters({ status:'', priority:'', category:'', assignee:'' })}>Clear</Btn>
        </div>
      )}

      {filtered.length === 0 ? <Empty icon="📋" title="No cases found" desc="Adjust filters or create a new case" /> :
        filtered.map(c => <CaseRow key={c.id} c={c} users={users} onClick={() => setSelCase(c)} />)}

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Create New Case">
        <CaseForm categories={categories} users={users} onSubmit={(d) => { onCreateCase(d); setShowNew(false); }} onClose={() => setShowNew(false)} />
      </Modal>
    </div>
  );
}
