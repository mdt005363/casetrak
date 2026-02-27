import React from 'react';
import { T } from '../utils/theme';
import { formatDT } from '../utils/helpers';

export default function Topbar({ notifs, setNotifs, showNotifs, setShowNotifs, setSideOpen, cases, onSelectCase, onNavigate }) {
  const unread = notifs.filter(n => !n.read).length;

  return (
    <header style={{ height: '52px', backgroundColor: T.surface, borderBottom: `1px solid ${T.borderLt}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 40 }}>
      <button onClick={() => setSideOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textSec, padding: '4px', fontSize: '20px' }}>☰</button>
      <div style={{ flex: 1 }} />
      <div style={{ position: 'relative' }}>
        <button onClick={() => setShowNotifs(!showNotifs)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textSec, padding: '6px', position: 'relative', fontSize: '18px' }}>
          🔔
          {unread > 0 && <span style={{ position: 'absolute', top: '0', right: '0', width: '16px', height: '16px', backgroundColor: T.err, color: '#fff', borderRadius: '50%', fontSize: '9.5px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
        </button>

        {showNotifs && (
          <div style={{ position: 'absolute', right: 0, top: '100%', width: '300px', backgroundColor: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radLg, boxShadow: T.shadowLg, zIndex: 200, maxHeight: '360px', overflowY: 'auto' }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.borderLt}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 750 }}>Notifications</span>
              <button onClick={() => setNotifs(p => p.map(n => ({ ...n, read: true })))} style={{ fontSize: '11.5px', color: T.pri, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 650 }}>Mark all read</button>
            </div>
            {notifs.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '12.5px', color: T.textMut }}>No notifications</div>
            ) : notifs.map(n => (
              <div key={n.id} onClick={() => {
                const c = cases.find(x => x.id === n.ref);
                if (c) { onNavigate('cases'); onSelectCase(c); }
                setNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x));
                setShowNotifs(false);
              }} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: `1px solid ${T.borderLt}`, backgroundColor: n.read ? 'transparent' : T.priBg + '40' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = T.surfAlt}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = n.read ? 'transparent' : T.priBg + '40'}
              >
                <div style={{ fontSize: '12.5px', color: T.text, fontWeight: n.read ? 400 : 650 }}>{n.text}</div>
                <div style={{ fontSize: '11px', color: T.textMut, marginTop: '3px' }}>{formatDT(n.time)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
