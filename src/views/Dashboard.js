import React, { useMemo } from 'react';
import { T } from '../utils/theme';
import { isOverdue, getPriority, getStatus, getUser, formatDate } from '../utils/helpers';
import { Card, Badge, Avatar } from '../components/UI';

export default function Dashboard({ cases, categories, users, onSelectCase, onNavigate, isMobile }) {
  const stats = useMemo(() => {
    const s = { total: cases.length, open: 0, active: 0, done: 0, overdue: 0, critical: 0, byCat: {}, byUser: {} };
    cases.forEach(c => {
      if (c.status === 'open') s.open++;
      if (['assigned','in_progress'].includes(c.status)) s.active++;
      if (['completed','verified'].includes(c.status)) s.done++;
      if (isOverdue(c.dueDate, c.status)) s.overdue++;
      if (c.priority === 'critical' && c.status !== 'verified') s.critical++;
      s.byCat[c.category] = (s.byCat[c.category] || 0) + 1;
      if (c.assignedTo && c.status !== 'verified') s.byUser[c.assignedTo] = (s.byUser[c.assignedTo] || 0) + 1;
    });
    return s;
  }, [cases]);

  const statCards = [
    { l: 'Total', v: stats.total, c: T.pri, a: T.priBg },
    { l: 'Open', v: stats.open, c: T.pri, a: T.priBg },
    { l: 'Active', v: stats.active, c: '#0EA5E9', a: '#E0F2FE' },
    { l: 'Done', v: stats.done, c: T.ok, a: T.okBg },
    { l: 'Overdue', v: stats.overdue, c: stats.overdue ? T.err : T.textMut, a: stats.overdue ? T.errBg : T.surfAlt },
    { l: 'Critical', v: stats.critical, c: stats.critical ? T.acc : T.textMut, a: stats.critical ? T.accBg : T.surfAlt },
  ];

  return (
    <div>
      <h1 style={{ fontSize: isMobile ? '20px' : '22px', fontWeight: 800, margin: '0 0 16px' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(145px, 1fr))', gap: isMobile ? '8px' : '10px', marginBottom: '20px' }}>
        {statCards.map(s => (
          <div key={s.l} style={{ backgroundColor: T.surface, borderRadius: T.radLg, padding: isMobile ? '12px' : '16px 18px', border: `1px solid ${T.borderLt}`, boxShadow: T.shadow }}>
            <div style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: 700, color: T.textMut, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</div>
            <div style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 800, color: s.c, marginTop: '2px' }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
        {/* By Category */}
        <Card><div style={{ padding: isMobile ? '14px' : '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 750, margin: '0 0 14px' }}>Cases by Category</h3>
          {categories.map(cat => { const cnt = stats.byCat[cat] || 0; return (
            <div key={cat} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '3px' }}>
                <span style={{ color: T.textSec }}>{cat}</span><span style={{ fontWeight: 700 }}>{cnt}</span>
              </div>
              <div style={{ height: '6px', backgroundColor: T.surfAlt, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '3px', backgroundColor: T.pri, width: `${stats.total ? (cnt / stats.total) * 100 : 0}%`, transition: 'width .4s' }} />
              </div>
            </div>
          );})}
        </div></Card>

        {/* Workload */}
        <Card><div style={{ padding: isMobile ? '14px' : '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 750, margin: '0 0 14px' }}>Workload</h3>
          {users.filter(u => u.role !== 'viewer').map(u => { const cnt = stats.byUser[u.id] || 0; return (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Avatar user={u} />
              <div style={{ flex: 1 }}><div style={{ fontSize: '13px', fontWeight: 650 }}>{u.name}</div></div>
              <Badge color={cnt > 2 ? T.warn : T.textSec} bg={cnt > 2 ? T.warnBg : T.surfAlt} small>{cnt} active</Badge>
            </div>
          );})}
        </div></Card>

        {/* Recent Cases */}
        <Card style={{ gridColumn: isMobile ? '1' : '1 / -1' }}><div style={{ padding: isMobile ? '14px' : '18px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 750, margin: '0 0 14px' }}>Recent Cases</h3>
          {cases.slice(0, 5).map(c => {
            const p = getPriority(c.priority), s = getStatus(c.status), a = getUser(c.assignedTo, users), od = isOverdue(c.dueDate, c.status);
            return (
              <Card key={c.id} onClick={() => { onNavigate('cases'); onSelectCase(c); }} style={{ marginBottom: '6px' }}>
                <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '3px', height: '36px', borderRadius: '2px', backgroundColor: p.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {c.title} {od && <Badge color={T.err} bg={T.errBg} small>Overdue</Badge>}
                    </div>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <Badge color={s.color} bg={s.bg} small>{s.label}</Badge>
                      <Badge color={p.color} bg={p.bg} small>{p.label}</Badge>
                      {!isMobile && <span style={{ fontSize: '11.5px', color: T.textMut }}>{c.category}</span>}
                    </div>
                  </div>
                  {a && <Avatar user={a} size="sm" />}
                </div>
              </Card>
            );
          })}
        </div></Card>
      </div>
    </div>
  );
}
