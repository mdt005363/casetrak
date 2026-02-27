import React, { useState } from 'react';
import { T, DEFAULT_CATEGORIES } from './utils/theme';
import { generateId, now, suggestSOPs } from './utils/helpers';
import { DEMO_USERS, DEMO_CASES, DEMO_SOPS, DEMO_WIKI, DEMO_RECURRING, DEMO_NOTIFS } from './data/seed';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AIPanel from './components/AIPanel';
import Dashboard from './views/Dashboard';
import Cases from './views/Cases';
import SOPs from './views/SOPs';
import Wiki from './views/Wiki';
import { Recurring, Team, Settings } from './views/OtherViews';

export default function App() {
  const [curUser, setCurUser] = useState(DEMO_USERS[0]);
  const [cases, setCases] = useState(DEMO_CASES);
  const [sops, setSOPs] = useState(DEMO_SOPS);
  const [wiki, setWiki] = useState(DEMO_WIKI);
  const [recurring, setRecurring] = useState(DEMO_RECURRING);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [notifs, setNotifs] = useState(DEMO_NOTIFS);
  const [view, setView] = useState('dashboard');
  const [selCase, setSelCase] = useState(null);
  const [selSOP, setSelSOP] = useState(null);
  const [selWiki, setSelWiki] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiContext, setAiContext] = useState(null);

  const canEdit = curUser.role === 'admin' || curUser.role === 'manager';
  const addNotif = (text, ref) => setNotifs(p => [{ id: generateId(), text, ref, read: false, time: now() }, ...p]);

  const goTo = (v) => { setView(v); setSelCase(null); setSelSOP(null); setSelWiki(null); setSideOpen(false); };
  const openAI = (ctx) => { setAiContext(ctx || null); setShowAI(true); };

  // Case actions
  const createCase = (d) => {
    const c = { ...d, id: generateId(), createdBy: curUser.id, createdAt: now(), attachments: [], comments: [], status: d.assignedTo ? 'assigned' : 'open' };
    setCases(p => [c, ...p]);
    addNotif(`New case: "${c.title}"`, c.id);
    const sg = suggestSOPs(c, sops);
    if (sg.length) setTimeout(() => addNotif(`💡 SOP suggested: ${sg[0].title}`, c.id), 500);
  };
  const updateCase = (id, u) => setCases(p => p.map(c => c.id === id ? { ...c, ...u } : c));
  const addComment = (id, text) => setCases(p => p.map(c => c.id === id ? { ...c, comments: [...c.comments, { id: generateId(), userId: curUser.id, text, createdAt: now() }] } : c));

  // SOP actions
  const createSOP = (d) => {
    const s = { ...d, id: generateId(), tags: d.tags.split(',').map(t => t.trim()).filter(Boolean), tools: d.tools.split(',').map(t => t.trim()).filter(Boolean), safety: d.safety.split(',').map(t => t.trim()).filter(Boolean), version: '1.0', versionHistory: [{ version: '1.0', date: new Date().toISOString().split('T')[0], changedBy: curUser.id, notes: 'Initial creation' }], suggestions: [], createdBy: curUser.id, createdAt: now(), updatedAt: now() };
    setSOPs(p => [s, ...p]);
  };
  const updateSOP = (id, data) => setSOPs(p => p.map(s => s.id === id ? { ...data } : s));

  // Wiki actions
  const createWiki = (d) => {
    const w = { ...d, id: generateId(), tags: d.tags.split(',').map(t => t.trim()).filter(Boolean), version: '1.0', versionHistory: [{ version: '1.0', date: new Date().toISOString().split('T')[0], changedBy: curUser.id, notes: 'Initial article' }], suggestions: [], createdBy: curUser.id, createdAt: now(), updatedAt: now() };
    setWiki(p => [w, ...p]);
  };
  const updateWiki = (id, data) => setWiki(p => p.map(w => w.id === id ? { ...data } : w));

  // Recurring actions
  const createRecurring = (d) => setRecurring(p => [{ ...d, id: generateId(), nextRun: new Date().toISOString().split('T')[0], active: true }, ...p]);
  const updateRecurring = (id, u) => setRecurring(p => p.map(r => r.id === id ? { ...r, ...u } : r));

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard cases={cases} categories={categories} users={DEMO_USERS} onSelectCase={c => { setSelCase(c); setView('cases'); }} onNavigate={goTo} />;
      case 'cases': return <Cases cases={cases} users={DEMO_USERS} sops={sops} categories={categories} curUser={curUser} selCase={selCase} setSelCase={setSelCase} onCreateCase={createCase} onUpdateCase={updateCase} onAddComment={addComment} onDeleteCase={id => { setCases(p => p.filter(c => c.id !== id)); setSelCase(null); }} onOpenAI={openAI} onViewSOP={s => { setSelSOP(s); goTo('sops'); }} />;
      case 'sops': return <SOPs sops={sops} users={DEMO_USERS} categories={categories} curUser={curUser} selSOP={selSOP} setSelSOP={setSelSOP} onUpdateSOP={updateSOP} onCreateSOP={createSOP} />;
      case 'wiki': return <Wiki wiki={wiki} users={DEMO_USERS} curUser={curUser} selWiki={selWiki} setSelWiki={setSelWiki} onUpdateWiki={updateWiki} onCreateWiki={createWiki} onOpenAI={openAI} />;
      case 'recurring': return <Recurring recurring={recurring} users={DEMO_USERS} categories={categories} curUser={curUser} canEdit={canEdit} onUpdate={updateRecurring} onCreate={createRecurring} />;
      case 'team': return <Team users={DEMO_USERS} cases={cases} curUser={curUser} />;
      case 'settings': return <Settings users={DEMO_USERS} categories={categories} curUser={curUser} setCurUser={setCurUser} setCategories={setCategories} />;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar view={view} curUser={curUser} sideOpen={sideOpen} setSideOpen={setSideOpen} goTo={goTo} onOpenAI={() => openAI(null)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar notifs={notifs} setNotifs={setNotifs} showNotifs={showNotifs} setShowNotifs={setShowNotifs} setSideOpen={setSideOpen} cases={cases} onSelectCase={c => { setSelCase(c); setView('cases'); }} onNavigate={goTo} />
        <main style={{ flex: 1, overflowY: 'auto', padding: '22px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
          {renderView()}
        </main>
      </div>
      <AIPanel isOpen={showAI} onClose={() => { setShowAI(false); setAiContext(null); }} sops={sops} wiki={wiki} contextCase={aiContext} />
    </div>
  );
}
