import React from 'react';
import { T, ROLES } from '../utils/theme';
import { Avatar } from './UI';

export default function Sidebar({ view, curUser, sideOpen, setSideOpen, goTo, onOpenAI, isMobile }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'cases', label: 'Cases', icon: '📄' },
    { id: 'sops', label: 'SOPs', icon: '📋' },
    { id: 'wiki', label: 'Wiki', icon: '📖' },
    { id: 'recurring', label: 'Recurring', icon: '🔄' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  // Mobile: overlay drawer
  if (isMobile) {
    return (
      <>
        {sideOpen && <div onClick={() => setSideOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,.4)', zIndex: 400, }} />}
        <aside style={{
          position: 'fixed', left: 0, top: 0, bottom: 0, width: '270px',
          backgroundColor: T.surface, zIndex: 500,
          transform: sideOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .25s ease',
          display: 'flex', flexDirection: 'column',
          boxShadow: sideOpen ? T.shadowLg : 'none',
        }}>
          {/* Logo */}
          <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${T.borderLt}`, display: 'flex', alignItems: 'center', gap: '9px' }}>
            <img src="/logo.png" alt="HIO" style={{ width: '34px', height: '34px', borderRadius: '9px', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, lineHeight: 1.2 }}>CaseTrak</div>
              <div style={{ fontSize: '10.5px', color: T.textMut, fontWeight: 500 }}>Store Operations</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
            {navItems.map(n => (
              <button key={n.id} onClick={() => goTo(n.id)} style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px 14px',
                border: 'none', borderRadius: T.radSm, cursor: 'pointer', fontSize: '15px', fontWeight: 600,
                backgroundColor: view === n.id ? T.priBg : 'transparent',
                color: view === n.id ? T.pri : T.textSec,
                transition: '.12s', marginBottom: '2px', fontFamily: "'Outfit',system-ui,sans-serif", textAlign: 'left',
              }}>
                <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>

          {/* AI Button */}
          <div style={{ padding: '8px' }}>
            <button onClick={() => { setSideOpen(false); onOpenAI(); }} style={{
              display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px 14px',
              border: 'none', borderRadius: T.radSm, cursor: 'pointer', fontSize: '14px', fontWeight: 650,
              background: `linear-gradient(135deg, ${T.priBg}, ${T.purpBg})`,
              color: T.pri, fontFamily: "'Outfit',system-ui,sans-serif",
            }}>
              ✨ AI Assistant
            </button>
          </div>

          {/* User */}
          <div style={{ padding: '12px 14px', borderTop: `1px solid ${T.borderLt}`, display: 'flex', alignItems: 'center', gap: '9px' }}>
            <Avatar user={curUser} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{curUser.name}</div>
              <div style={{ fontSize: '10.5px', color: T.textMut }}>{ROLES.find(r => r.value === curUser.role)?.label}</div>
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Desktop: fixed sidebar
  return (
    <aside style={{
      width: '220px', backgroundColor: T.surface, borderRight: `1px solid ${T.borderLt}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${T.borderLt}`, display: 'flex', alignItems: 'center', gap: '9px' }}>
        <img src="/logo.png" alt="HIO" style={{ width: '34px', height: '34px', borderRadius: '9px', objectFit: 'cover' }} />
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, lineHeight: 1.2 }}>CaseTrak</div>
          <div style={{ fontSize: '10.5px', color: T.textMut, fontWeight: 500 }}>Store Operations</div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => goTo(n.id)} style={{
            display: 'flex', alignItems: 'center', gap: '9px', width: '100%', padding: '9px 11px',
            border: 'none', borderRadius: T.radSm, cursor: 'pointer', fontSize: '13.5px', fontWeight: 600,
            backgroundColor: view === n.id ? T.priBg : 'transparent',
            color: view === n.id ? T.pri : T.textSec,
            transition: '.12s', marginBottom: '1px', fontFamily: "'Outfit',system-ui,sans-serif", textAlign: 'left',
          }}
            onMouseEnter={e => { if (view !== n.id) e.currentTarget.style.backgroundColor = T.surfAlt; }}
            onMouseLeave={e => { if (view !== n.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span style={{ fontSize: '16px', width: '22px', textAlign: 'center' }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: '8px' }}>
        <button onClick={onOpenAI} style={{
          display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 12px',
          border: 'none', borderRadius: T.radSm, cursor: 'pointer', fontSize: '13px', fontWeight: 650,
          background: `linear-gradient(135deg, ${T.priBg}, ${T.purpBg})`,
          color: T.pri, fontFamily: "'Outfit',system-ui,sans-serif",
        }}>
          ✨ AI Assistant
        </button>
      </div>
      <div style={{ padding: '12px 14px', borderTop: `1px solid ${T.borderLt}`, display: 'flex', alignItems: 'center', gap: '9px' }}>
        <Avatar user={curUser} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12.5px', fontWeight: 650, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{curUser.name}</div>
          <div style={{ fontSize: '10.5px', color: T.textMut }}>{ROLES.find(r => r.value === curUser.role)?.label}</div>
        </div>
      </div>
    </aside>
  );
}
