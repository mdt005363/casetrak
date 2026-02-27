import React, { useState, useRef, useEffect } from 'react';
import { T } from '../utils/theme';
import { getAIResponse } from '../utils/helpers';
import { Btn, TArea } from '../components/UI';

export default function AIPanel({ isOpen, onClose, sops, wiki, contextCase }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting based on context
      let greeting;
      if (contextCase) {
        greeting = getAIResponse('troubleshoot this', contextCase, sops, wiki);
      } else {
        greeting = getAIResponse('', null, sops, wiki);
      }
      setMessages([{ role: 'ai', text: greeting }]);
    }
  }, [isOpen, contextCase]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    const aiResp = { role: 'ai', text: getAIResponse(input, contextCase, sops, wiki) };
    setMessages(p => [...p, userMsg, aiResp]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight), 100);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: '380px', maxWidth: '100vw',
      backgroundColor: T.surface, borderLeft: `1px solid ${T.borderLt}`, boxShadow: T.shadowLg,
      display: 'flex', flexDirection: 'column', zIndex: 200,
      animation: 'slideInRight .25s ease-out',
    }}>
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

      {/* Header */}
      <div style={{
        padding: '16px 18px', borderBottom: `1px solid ${T.borderLt}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: `linear-gradient(135deg, ${T.priBg}, ${T.purpBg})`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>✨</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 750, color: T.pri }}>AI Assistant</div>
            {contextCase && <div style={{ fontSize: '11px', color: T.textMut }}>Context: {contextCase.title.slice(0, 30)}...</div>}
          </div>
        </div>
        <button onClick={() => { onClose(); setMessages([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.textMut, fontSize: '18px' }}>✕</button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: '14px',
            display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '85%', padding: '10px 14px', borderRadius: '12px',
              backgroundColor: msg.role === 'user' ? T.pri : T.surfAlt,
              color: msg.role === 'user' ? '#fff' : T.text,
              fontSize: '13px', lineHeight: 1.6,
            }}>
              {msg.text.split('\n').map((line, j) => {
                if (line.startsWith('**') || line.includes('**')) {
                  return <div key={j}>{line.replace(/\*\*(.+?)\*\*/g, '⟨$1⟩').split(/⟨(.+?)⟩/).map((part, k) =>
                    k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                  )}</div>;
                }
                if (line.match(/^\d+\./)) return <div key={j} style={{ paddingLeft: '8px' }}>{line}</div>;
                if (line.startsWith('•') || line.startsWith('📋') || line.startsWith('📖') || line.startsWith('🔧') || line.startsWith('🔍') || line.startsWith('⏱') || line.startsWith('⚠')) {
                  return <div key={j}>{line}</div>;
                }
                if (line.trim() === '') return <div key={j} style={{ height: '6px' }} />;
                return <div key={j}>{line}</div>;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.borderLt}` }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }}}
            placeholder="Ask me anything..."
            style={{
              flex: 1, padding: '9px 12px', fontSize: '13px', border: `1.5px solid ${T.border}`,
              borderRadius: '20px', outline: 'none', fontFamily: "'Outfit',system-ui,sans-serif",
            }}
            onFocus={e => e.target.style.borderColor = T.pri}
            onBlur={e => e.target.style.borderColor = T.border}
          />
          <button onClick={send} disabled={!input.trim()} style={{
            width: '36px', height: '36px', borderRadius: '50%', border: 'none',
            backgroundColor: T.pri, color: '#fff', cursor: input.trim() ? 'pointer' : 'not-allowed',
            opacity: input.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>↑</button>
        </div>
      </div>
    </div>
  );
}
