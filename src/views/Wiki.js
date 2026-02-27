import React, { useState } from 'react';
import { T, WIKI_CATEGORIES } from '../utils/theme';
import { getUser, formatDate, formatDT, generateId, now } from '../utils/helpers';
import { Card, Badge, Btn, Inp, TArea, Sel, Lbl, Modal, Empty } from '../components/UI';

// Simple markdown renderer
function renderMD(txt) {
  return txt.split('\n').map((line, i) => {
    if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '18px', fontWeight: 750, margin: '20px 0 8px' }}>{line.slice(3)}</h2>;
    if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '15px', fontWeight: 700, margin: '16px 0 6px' }}>{line.slice(4)}</h3>;
    if (line.startsWith('- **')) {
      const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
      if (match) return <div key={i} style={{ paddingLeft: '16px', fontSize: '13.5px', color: T.textSec, lineHeight: 1.6 }}>• <strong>{match[1]}</strong>{match[2] ? `: ${match[2]}` : ''}</div>;
    }
    if (line.startsWith('- ')) return <div key={i} style={{ paddingLeft: '16px', fontSize: '13.5px', color: T.textSec, lineHeight: 1.6 }}>• {line.slice(2)}</div>;
    if (line.match(/^\d+\./)) return <div key={i} style={{ paddingLeft: '16px', fontSize: '13.5px', color: T.textSec, lineHeight: 1.6 }}>{line}</div>;
    if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />;
    return <p key={i} style={{ fontSize: '13.5px', color: T.textSec, lineHeight: 1.6, margin: '0 0 4px' }}>{line}</p>;
  });
}

function WikiDetail({ article, wiki, users, curUser, isAdmin, onUpdate, onBack, onOpenAI }) {
  const [suggestion, setSuggestion] = useState('');
  const w = wiki.find(x => x.id === article.id) || article;

  const submitSuggestion = () => {
    if (!suggestion.trim()) return;
    const updated = { ...w, suggestions: [...w.suggestions, { id: generateId(), userId: curUser.id, text: suggestion, createdAt: now(), status: 'pending' }] };
    onUpdate(w.id, updated);
    setSuggestion('');
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMut, fontSize: '18px' }}>←</button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 750, margin: 0 }}>{w.title}</h2>
          <div style={{ fontSize: '12px', color: T.textMut, marginTop: '2px' }}>v{w.version} · {w.category} · Updated {formatDate(w.updatedAt)}</div>
        </div>
        <Btn v="accent" s="sm" icon={<span>✨</span>} onClick={() => onOpenAI(null, w)}>AI Help</Btn>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
        {w.tags.map(t => <Badge key={t} color={T.textSec} bg={T.surfAlt} small>🏷 {t}</Badge>)}
      </div>

      <Card><div style={{ padding: '20px' }}>{renderMD(w.content)}</div></Card>

      <h3 style={{ fontSize: '14px', fontWeight: 750, margin: '24px 0 10px' }}>Version History</h3>
      {w.versionHistory.map((v, i) => (
        <div key={i} style={{ display: 'flex', gap: '10px', padding: '6px 0', fontSize: '13px' }}>
          <Badge color={T.pri} bg={T.priBg} small>v{v.version}</Badge>
          <span style={{ color: T.textMut }}>{formatDate(v.date)}</span>
          <span style={{ color: T.textSec }}>{v.notes}</span>
        </div>
      ))}

      {!isAdmin && (
        <div style={{ marginTop: '24px', padding: '14px', backgroundColor: T.surfAlt, borderRadius: T.rad, border: `1px solid ${T.borderLt}` }}>
          <div style={{ fontSize: '13px', fontWeight: 650, marginBottom: '8px' }}>💡 Suggest an Edit</div>
          <TArea value={suggestion} onChange={setSuggestion} placeholder="Describe your suggestion..." rows={2} />
          <Btn s="sm" style={{ marginTop: '8px' }} onClick={submitSuggestion} disabled={!suggestion.trim()}>Submit</Btn>
        </div>
      )}

      {isAdmin && w.suggestions.filter(x => x.status === 'pending').length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 750, margin: '0 0 10px' }}>Pending Suggestions</h3>
          {w.suggestions.filter(x => x.status === 'pending').map(sg => (
            <Card key={sg.id} style={{ marginBottom: '8px' }}>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: '12px', color: T.textMut }}>{getUser(sg.userId, users)?.name} · {formatDT(sg.createdAt)}</div>
                <p style={{ fontSize: '13px', color: T.textSec, margin: '4px 0 8px' }}>{sg.text}</p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Btn v="success" s="sm" onClick={() => onUpdate(w.id, { ...w, suggestions: w.suggestions.map(x => x.id === sg.id ? { ...x, status: 'accepted' } : x) })}>Accept</Btn>
                  <Btn v="danger" s="sm" onClick={() => onUpdate(w.id, { ...w, suggestions: w.suggestions.map(x => x.id === sg.id ? { ...x, status: 'rejected' } : x) })}>Reject</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function WikiForm({ onSubmit, onClose }) {
  const [f, sF] = useState({ title: '', category: '', tags: '', content: '' });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div><Lbl>Title *</Lbl><Inp value={f.title} onChange={v => sF({...f,title:v})} placeholder="Article title" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div><Lbl>Category</Lbl><Sel value={f.category} onChange={v => sF({...f,category:v})} placeholder="Select" options={WIKI_CATEGORIES.map(c=>({value:c,label:c}))} style={{width:'100%'}} /></div>
        <div><Lbl>Tags (comma-separated)</Lbl><Inp value={f.tags} onChange={v => sF({...f,tags:v})} placeholder="lumber, grades" /></div>
      </div>
      <div><Lbl>Content (Markdown supported)</Lbl><TArea value={f.content} onChange={v => sF({...f,content:v})} placeholder="Write your article..." rows={10} /></div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <Btn v="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => { if (f.title) onSubmit(f); }} disabled={!f.title}>Publish</Btn>
      </div>
    </div>
  );
}

export default function Wiki({ wiki, users, curUser, selWiki, setSelWiki, onUpdateWiki, onCreateWiki, onOpenAI }) {
  const [showNew, setShowNew] = useState(false);
  const isAdmin = curUser.role === 'admin';

  if (selWiki) {
    return <WikiDetail article={selWiki} wiki={wiki} users={users} curUser={curUser} isAdmin={isAdmin} onUpdate={(id, data) => onUpdateWiki(id, data)} onBack={() => setSelWiki(null)} onOpenAI={onOpenAI} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Store Wiki</h1>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Btn v="accent" s="sm" icon={<span>✨</span>} onClick={() => onOpenAI(null, null)}>AI Write</Btn>
          {isAdmin && <Btn s="sm" icon={<span>+</span>} onClick={() => setShowNew(true)}>New Article</Btn>}
        </div>
      </div>

      {wiki.length === 0 ? <Empty icon="📖" title="No articles yet" desc="Start your knowledge base" /> :
        wiki.map(w => (
          <Card key={w.id} onClick={() => setSelWiki(w)} style={{ marginBottom: '8px' }}>
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: T.rad, backgroundColor: T.purpBg, color: T.purp, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px' }}>📖</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 650 }}>{w.title}</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <Badge color={T.purp} bg={T.purpBg} small>{w.category}</Badge>
                  <span style={{ fontSize: '11px', color: T.textMut }}>v{w.version} · Updated {formatDate(w.updatedAt)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))
      }

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="New Wiki Article" width={640}>
        <WikiForm onSubmit={(d) => { onCreateWiki(d); setShowNew(false); }} onClose={() => setShowNew(false)} />
      </Modal>
    </div>
  );
}
