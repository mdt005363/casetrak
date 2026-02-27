import React from 'react';
import { T, AVATAR_COLORS } from '../utils/theme';

// ── Badge ──
export const Badge = ({ color, bg, children, small }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', padding: small ? '1px 7px' : '2px 9px', borderRadius: '6px', fontSize: small ? '11px' : '12px', fontWeight: 650, color, backgroundColor: bg, whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>{children}</span>
);

// ── Avatar ──
export const Avatar = ({ user, size = 'md' }) => {
  const sizes = { sm: 26, md: 32, lg: 42 };
  const s = sizes[size] || size;
  const idx = user ? (user.id.charCodeAt(1) % AVATAR_COLORS.length) : 0;
  const c = AVATAR_COLORS[idx];
  return (
    <div style={{ width: s, height: s, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: c + '18', color: c, fontSize: s * 0.36, fontWeight: 750, flexShrink: 0, border: `2px solid ${T.surface}` }}>
      {user?.avatar || '??'}
    </div>
  );
};

// ── Button ──
export const Btn = ({ children, onClick, v = 'primary', s = 'md', icon, disabled, style: cs }) => {
  const vars = {
    primary: { bg: T.pri, c: '#fff', h: T.priHov, bd: 'none' },
    secondary: { bg: T.surfAlt, c: T.text, h: T.border, bd: `1px solid ${T.border}` },
    ghost: { bg: 'transparent', c: T.textSec, h: T.surfAlt, bd: 'none' },
    danger: { bg: T.errBg, c: T.err, h: '#FBDBE1', bd: 'none' },
    success: { bg: T.okBg, c: T.ok, h: '#C8F0E0', bd: 'none' },
    accent: { bg: T.accBg, c: T.acc, h: '#FFE0D0', bd: 'none' },
  };
  const st = vars[v] || vars.primary;
  const pad = s === 'sm' ? '6px 12px' : s === 'lg' ? '12px 22px' : '8px 16px';
  const fs = s === 'sm' ? '13px' : '14px';
  return (
    <button onClick={onClick} disabled={disabled} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: pad, fontSize: fs, fontWeight: 650, background: st.bg, color: st.c, border: st.bd, borderRadius: T.radSm, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, transition: 'all .15s', fontFamily: "'Outfit',system-ui,sans-serif", WebkitTapHighlightColor: 'transparent', minHeight: '36px', ...cs }}>
      {icon}{children}
    </button>
  );
};

// ── Input ──
export const Inp = ({ value, onChange, placeholder, type = 'text', style: cs, ...p }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ padding: '8px 12px', fontSize: '16px', border: `1.5px solid ${T.border}`, borderRadius: T.radSm, backgroundColor: T.surface, color: T.text, outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: "'Outfit',system-ui,sans-serif", ...cs }}
    onFocus={e => e.target.style.borderColor = T.pri} onBlur={e => e.target.style.borderColor = T.border} {...p} />
);

// ── TextArea ──
export const TArea = ({ value, onChange, placeholder, rows = 3, style: cs }) => (
  <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{ padding: '8px 12px', fontSize: '16px', border: `1.5px solid ${T.border}`, borderRadius: T.radSm, backgroundColor: T.surface, color: T.text, outline: 'none', width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: "'Outfit',system-ui,sans-serif", lineHeight: 1.5, ...cs }}
    onFocus={e => e.target.style.borderColor = T.pri} onBlur={e => e.target.style.borderColor = T.border} />
);

// ── Select ──
export const Sel = ({ value, onChange, options, placeholder, style: cs }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ padding: '8px 30px 8px 10px', fontSize: '16px', border: `1.5px solid ${T.border}`, borderRadius: T.radSm, backgroundColor: T.surface, color: T.text, outline: 'none', cursor: 'pointer', appearance: 'none', fontFamily: "'Outfit',system-ui,sans-serif", backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%239498A8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', ...cs }}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
  </select>
);

// ── Label ──
export const Lbl = ({ children }) => (
  <label style={{ fontSize: '12.5px', fontWeight: 650, color: T.textSec, marginBottom: '3px', display: 'block' }}>{children}</label>
);

// ── Card ──
export const Card = ({ children, style: cs, onClick }) => (
  <div onClick={onClick} style={{ backgroundColor: T.surface, borderRadius: T.radLg, border: `1px solid ${T.borderLt}`, boxShadow: T.shadow, cursor: onClick ? 'pointer' : 'default', transition: 'all .15s', overflow: 'hidden', ...cs }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = T.shadowMd; e.currentTarget.style.borderColor = T.border; }}}
    onMouseLeave={e => { if (onClick) { e.currentTarget.style.boxShadow = T.shadow; e.currentTarget.style.borderColor = T.borderLt; }}}>
    {children}
  </div>
);

// ── Modal (responsive) ──
export const Modal = ({ isOpen, onClose, title, children, width = 580 }) => {
  if (!isOpen) return null;
  const isMob = window.innerWidth <= 768;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(26,29,38,.35)', display: 'flex', alignItems: isMob ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 1000, padding: isMob ? '0' : '16px', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div style={{
        backgroundColor: T.surface,
        borderRadius: isMob ? '16px 16px 0 0' : '16px',
        width: '100%', maxWidth: isMob ? '100%' : width,
        maxHeight: isMob ? '92vh' : '88vh',
        display: 'flex', flexDirection: 'column', boxShadow: T.shadowLg,
      }} onClick={e => e.stopPropagation()}>
        {isMob && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0' }}>
            <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: T.border }} />
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMob ? '14px 18px' : '18px 22px', borderBottom: `1px solid ${T.borderLt}` }}>
          <h2 style={{ fontSize: '17px', fontWeight: 750, color: T.text, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMut, padding: '4px', display: 'flex', fontSize: '18px' }}>✕</button>
        </div>
        <div style={{ padding: isMob ? '16px' : '22px', overflowY: 'auto', flex: 1, paddingBottom: isMob ? 'max(16px, env(safe-area-inset-bottom))' : '22px' }}>{children}</div>
      </div>
    </div>
  );
};

// ── Empty State ──
export const Empty = ({ icon, title, desc }) => (
  <div style={{ textAlign: 'center', padding: '50px 20px', color: T.textMut }}>
    <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>{icon}</div>
    <h3 style={{ fontSize: '15px', fontWeight: 650, color: T.textSec, margin: '0 0 6px' }}>{title}</h3>
    <p style={{ fontSize: '13px', margin: 0 }}>{desc}</p>
  </div>
);
