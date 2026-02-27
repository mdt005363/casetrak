import React, { useState } from 'react';
import { T, PRIORITIES } from '../utils/theme';
import { getUser, formatDate, formatDT, generateId, now } from '../utils/helpers';
import { Card, Badge, Btn, Inp, TArea, Sel, Lbl, Modal, Empty, Avatar } from '../components/UI';

function SOPDetail({ sop, sops, users, curUser, isAdmin, onUpdate, onBack, isMobile }) {
  const [suggestion, setSuggestion] = useState('');
  const s = sops.find(x => x.id === sop.id) || sop;

  const submitSuggestion = () => {
    if (!suggestion.trim()) return;
    const updated = { ...s, suggestions: [...s.suggestions, { id: generateId(), userId: curUser.id, text: suggestion, createdAt: now(), status: 'pending' }] };
    onUpdate(s.id, updated);
    setSuggestion('');
  };

  const handleSuggestion = (sgId, status) => {
    const updated = { ...s, suggestions: s.suggestions.map(x => x.id === sgId ? { ...x, status } : x) };
    onUpdate(s.id, updated);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMut, fontSize: '18px' }}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 750, margin: 0 }}>{s.title}</h2>
          <div style={{ fontSize: '12px', color: T.textMut, marginTop: '2px' }}>v{s.version} · {s.category} · Updated {formatDate(s.updatedAt)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '16px' }}>
        {s.tags.map(t => <Badge key={t} color={T.textSec} bg={T.surfAlt} small>🏷 {t}</Badge>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {s.estimatedTime && <Card><div style={{ padding: '12px 14px', fontSize: '13px' }}>⏱ <strong>Est. Time:</strong> {s.estimatedTime}</div></Card>}
        {s.tools.length > 0 && <Card><div style={{ padding: '12px 14px', fontSize: '13px' }}>
          <div style={{ fontWeight: 650, marginBottom: '6px' }}>🔧 Tools Required</div>
          {s.tools.map((t, i) => <div key={i} style={{ color: T.textSec, paddingLeft: '16px' }}>• {t}</div>)}
        </div></Card>}
        {s.safety.length > 0 && <Card style={{ borderLeft: `3px solid ${T.warn}` }}><div style={{ padding: '12px 14px', fontSize: '13px' }}>
          <div style={{ fontWeight: 650, marginBottom: '6px', color: T.warn }}>🛡 Safety</div>
          {s.safety.map((t, i) => <div key={i} style={{ color: T.textSec, paddingLeft: '16px' }}>⚠ {t}</div>)}
        </div></Card>}
      </div>

      <h3 style={{ fontSize: '14px', fontWeight: 750, margin: '0 0 12px' }}>Steps</h3>
      {s.steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: T.priBg, color: T.pri, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>{step.order}</div>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: '14px', fontWeight: 650 }}>{step.title}</div><p style={{ fontSize: '13px', color: T.textSec, margin: '3px 0 0', lineHeight: 1.5 }}>{step.description}</p></div>
        </div>
      ))}

      <h3 style={{ fontSize: '14px', fontWeight: 750, margin: '24px 0 10px' }}>Version History</h3>
      {s.versionHistory.map((v, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', padding: '6px 0', fontSize: '13px', borderBottom: i < s.versionHistory.length - 1 ? `1px solid ${T.borderLt}` : 'none', flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge color={T.pri} bg={T.priBg} small>v{v.version}</Badge>
          <span style={{ color: T.textMut }}>{formatDate(v.date)}</span>
          <span style={{ color: T.textSec }}>{v.notes}</span>
        </div>
      ))}

      {!isAdmin && (
        <div style={{ marginTop: '24px', padding: '14px', backgroundColor: T.surfAlt, borderRadius: T.rad, border: `1px solid ${T.borderLt}` }}>
          <div style={{ fontSize: '13px', fontWeight: 650, marginBottom: '8px' }}>💡 Suggest an Improvement</div>
          <TArea value={suggestion} onChange={setSuggestion} placeholder="Describe your suggestion..." rows={2} />
          <Btn s="sm" style={{ marginTop: '8px' }} onClick={submitSuggestion} disabled={!suggestion.trim()}>Submit</Btn>
        </div>
      )}

      {isAdmin && s.suggestions.filter(x => x.status === 'pending').length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 750, margin: '0 0 10px' }}>Pending Suggestions ({s.suggestions.filter(x => x.status === 'pending').length})</h3>
          {s.suggestions.filter(x => x.status === 'pending').map(sg => (
            <Card key={sg.id} style={{ marginBottom: '8px' }}>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: '12px', color: T.textMut, marginBottom: '4px' }}>{getUser(sg.userId, users)?.name} · {formatDT(sg.createdAt)}</div>
                <p style={{ fontSize: '13px', color: T.textSec, margin: '0 0 8px' }}>{sg.text}</p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Btn v="success" s="sm" onClick={() => handleSuggestion(sg.id, 'accepted')}>Accept</Btn>
                  <Btn v="danger" s="sm" onClick={() => handleSuggestion(sg.id, 'rejected')}>Reject</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SOPForm({ categories, onSubmit, onClose, isMobile }) {
  const [f, sF] = useState({ title: '', category: '', tags: '', estimatedTime: '', tools: '', safety: '', steps: [{ order: 1, title: '', description: '' }] });
  const addStep = () => sF({ ...f, steps: [...f.steps, { order: f.steps.length + 1, title: '', description: '' }] });
  const updateStep = (i, k, v) => { const s = [...f.steps]; s[i] = { ...s[i], [k]: v }; sF({ ...f, steps: s }); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div><Lbl>SOP Title *</Lbl><Inp value={f.title} onChange={v => sF({...f,title:v})} placeholder="e.g., POS Terminal Troubleshooting" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
        <div><Lbl>Category</Lbl><Sel value={f.category} onChange={v => sF({...f,category:v})} placeholder="Select" options={categories.map(c=>({value:c,label:c}))} style={{width:'100%'}} /></div>
        <div><Lbl>Est. Time</Lbl><Inp value={f.estimatedTime} onChange={v => sF({...f,estimatedTime:v})} placeholder="15-30 min" /></div>
      </div>
      <div><Lbl>Tags (comma-separated)</Lbl><Inp value={f.tags} onChange={v => sF({...f,tags:v})} placeholder="register, POS, troubleshooting" /></div>
      <div><Lbl>Tools (comma-separated)</Lbl><Inp value={f.tools} onChange={v => sF({...f,tools:v})} placeholder="Phillips screwdriver, multimeter" /></div>
      <div><Lbl>Safety Warnings (comma-separated)</Lbl><Inp value={f.safety} onChange={v => sF({...f,safety:v})} placeholder="Unplug power before opening" /></div>
      <div>
        <Lbl>Steps</Lbl>
        {f.steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: T.pri, minWidth: '20px', paddingTop: '10px' }}>{i+1}.</span>
            <div style={{ flex: 1 }}>
              <Inp value={s.title} onChange={v => updateStep(i,'title',v)} placeholder="Step title" style={{ marginBottom: '4px' }} />
              <Inp value={s.description} onChange={v => updateStep(i,'description',v)} placeholder="Step description" />
            </div>
          </div>
        ))}
        <Btn v="ghost" s="sm" onClick={addStep}>+ Add Step</Btn>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Btn v="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => { if (f.title) onSubmit(f); }} disabled={!f.title}>Create SOP</Btn>
      </div>
    </div>
  );
}

export default function SOPs({ sops, users, categories, curUser, selSOP, setSelSOP, onUpdateSOP, onCreateSOP, isMobile }) {
  const [showNew, setShowNew] = useState(false);
  const isAdmin = curUser.role === 'admin';

  if (selSOP) {
    return <SOPDetail sop={selSOP} sops={sops} users={users} curUser={curUser} isAdmin={isAdmin} onUpdate={(id, data) => onUpdateSOP(id, data)} onBack={() => setSelSOP(null)} isMobile={isMobile} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h1 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: 800, margin: 0 }}>{isMobile ? 'SOPs' : 'Standard Operating Procedures'}</h1>
        {isAdmin && <Btn s="sm" icon={<span>+</span>} onClick={() => setShowNew(true)}>New SOP</Btn>}
      </div>

      {sops.length === 0 ? <Empty icon="📋" title="No SOPs yet" desc="Create your first standard procedure" /> :
        sops.map(s => (
          <Card key={s.id} onClick={() => setSelSOP(s)} style={{ marginBottom: '8px' }}>
            <div style={{ padding: isMobile ? '12px' : '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: T.rad, backgroundColor: T.priBg, color: T.pri, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px' }}>📋</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 650 }}>{s.title}</div>
                <div style={{ display: 'flex', gap: '5px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Badge color={T.textSec} bg={T.surfAlt} small>{s.category}</Badge>
                  <span style={{ fontSize: '11px', color: T.textMut }}>v{s.version} · {s.steps.length} steps</span>
                  {isAdmin && s.suggestions.filter(x => x.status === 'pending').length > 0 && (
                    <Badge color={T.acc} bg={T.accBg} small>{s.suggestions.filter(x => x.status === 'pending').length} suggestion(s)</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))
      }

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="Create New SOP" width={640}>
        <SOPForm categories={categories} onSubmit={(d) => { onCreateSOP(d); setShowNew(false); }} onClose={() => setShowNew(false)} isMobile={isMobile} />
      </Modal>
    </div>
  );
}
