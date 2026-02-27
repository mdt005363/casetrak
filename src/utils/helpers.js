import { PRIORITIES, STATUSES } from './theme';

export const generateId = () => Math.random().toString(36).substr(2, 9);
export const now = () => new Date().toISOString();

export const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDT = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'verified' || status === 'completed') return false;
  return new Date(dueDate) < new Date();
};

export const getPriority = (v) => PRIORITIES.find(p => p.value === v) || PRIORITIES[2];
export const getStatus = (v) => STATUSES.find(s => s.value === v) || STATUSES[0];
export const getUser = (id, users) => users.find(u => u.id === id);

export const suggestSOPs = (caseData, sops) => {
  if (!caseData) return [];
  return sops.filter(s =>
    s.category === caseData.category ||
    s.tags.some(t =>
      caseData.title.toLowerCase().includes(t.toLowerCase()) ||
      caseData.description.toLowerCase().includes(t.toLowerCase())
    )
  );
};

export const getAIResponse = (query, caseData, sops, wiki) => {
  const q = query.toLowerCase();

  const relevantSOPs = sops.filter(s => {
    const str = `${s.title} ${s.tags.join(' ')} ${s.category}`.toLowerCase();
    return q.split(' ').some(w => w.length > 2 && str.includes(w));
  });

  const relevantWiki = wiki.filter(w => {
    const str = `${w.title} ${w.tags.join(' ')} ${w.category} ${w.content}`.toLowerCase();
    return q.split(' ').some(w2 => w2.length > 2 && str.includes(w2));
  });

  if (caseData) {
    const caseSOPs = sops.filter(s =>
      s.category === caseData.category ||
      s.tags.some(t =>
        caseData.title.toLowerCase().includes(t.toLowerCase()) ||
        caseData.description.toLowerCase().includes(t.toLowerCase())
      )
    );

    if (q.includes('troubleshoot') || q.includes('help') || q.includes('fix') || q.includes('solve') || q.includes('what should')) {
      if (caseSOPs.length > 0) {
        const sop = caseSOPs[0];
        return `Based on this case ("${caseData.title}"), I found a relevant SOP:\n\n📋 **${sop.title}** (v${sop.version})\n\nRecommended steps:\n${sop.steps.map((s, i) => `${i + 1}. **${s.title}** — ${s.description}`).join('\n')}\n\n⏱ Estimated time: ${sop.estimatedTime}\n🔧 Tools needed: ${sop.tools.join(', ')}${sop.safety.length ? `\n\n⚠️ Safety: ${sop.safety.join('; ')}` : ''}`;
      }
      return `I don't have a specific SOP for this yet. General troubleshooting for "${caseData.title}":\n\n1. **Document symptoms** — When and how does the issue occur?\n2. **Check the basics** — Power, connections, recent changes\n3. **Isolate the problem** — Can you reproduce it?\n4. **Check related equipment** — Anything else affected?\n5. **Escalate if needed** — Contact the vendor\n\n💡 Consider creating an SOP once this is resolved!`;
    }

    if (q.includes('sop') || q.includes('procedure')) {
      if (caseSOPs.length > 0) {
        return `Found ${caseSOPs.length} SOP(s) for this case:\n\n${caseSOPs.map(s => `📋 **${s.title}** (v${s.version}) — ${s.category}\n   ${s.steps.length} steps · ${s.estimatedTime}`).join('\n\n')}`;
      }
      return `No SOPs match this case yet. Want me to help draft one?`;
    }

    return `I'm here to help with "${caseData.title}". Try:\n\n• "How do I fix this?" — Troubleshooting guidance\n• "Are there any procedures?" — Find related SOPs\n• "What should I do next?" — Suggest next steps\n• "Write an SOP for this" — Draft documentation`;
  }

  if (q.includes('write') && (q.includes('wiki') || q.includes('article'))) {
    return `I can help draft a wiki article! Tell me the topic and I'll create:\n\n## [Title]\n### Overview\n### Details\n### Tips & Notes\n\nWhat subject should I write about?`;
  }

  if (q.includes('write') && q.includes('sop')) {
    return `I can draft an SOP! I'll need:\n\n1. **What task/process?**\n2. **Who performs it?**\n3. **Tools/materials needed?**\n4. **Safety concerns?**\n\nWhat's the procedure for?`;
  }

  if (relevantSOPs.length > 0 || relevantWiki.length > 0) {
    const parts = [];
    if (relevantSOPs.length) parts.push(`📋 **Relevant SOPs:**\n${relevantSOPs.map(s => `• ${s.title} (v${s.version})`).join('\n')}`);
    if (relevantWiki.length) parts.push(`📖 **Relevant Wiki Articles:**\n${relevantWiki.map(w => `• ${w.title}`).join('\n')}`);
    return `Here's what I found:\n\n${parts.join('\n\n')}\n\nWant me to go deeper on any of these?`;
  }

  return `I can help you with:\n\n🔧 **Troubleshooting** — Describe an issue and I'll suggest solutions\n📋 **SOPs** — Find or draft standard procedures\n📖 **Wiki** — Find articles or help write new ones\n🔍 **Search** — Search across all SOPs and wiki articles\n\nWhat would you like help with?`;
};
