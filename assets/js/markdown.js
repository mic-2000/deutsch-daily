/* markdown.js — the inline-only Markdown renderer for AI replies, shared by the planner's AI Lehrer
   chat and the /today wizard's AI tutor. Extracted from planner.html so both render model output
   identically (headings, lists, GFM tables, bold/italic/code, safe links). Security-relevant: every
   piece of content is HTML-escaped (escHtml) BEFORE inline markup is applied, and only
   http(s)/mailto links are emitted. Guarded by tests/markdown.test.js. */

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function inlineMd(s) {
  let h = escHtml(s);
  // Links — only http(s)/mailto are allowed (blocks javascript:/data: injection). Markdown links
  // are parsed first and parked as placeholders so the bare-URL autolinker can't double-wrap them.
  // The placeholder is a NUL sentinel (built via fromCharCode) — it can't occur in escaped text.
  const SEP = String.fromCharCode(0);
  const safeUrl = (u) => /^(https?:\/\/|mailto:)/i.test(u.replace(/&amp;/g, '&')) ? u : null;
  const links = [];
  const park = (anchor) => { links.push(anchor); return SEP + (links.length - 1) + SEP; };
  h = h.replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/gi, (m, text, url) => {
    const safe = safeUrl(url);
    return safe ? park(`<a href="${safe}" target="_blank" rel="noopener noreferrer">${text}</a>`) : m;
  });
  h = h.replace(/(^|[\s(])(https?:\/\/[^\s<]+)/gi, (m, pre, url) => {
    const trail = (url.match(/[.,;:!?)\]]+$/) || [''])[0];
    const clean = url.slice(0, url.length - trail.length);
    return pre + park(`<a href="${clean}" target="_blank" rel="noopener noreferrer">${clean}</a>`) + trail;
  });
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*([^*\n]+)\*/g,  '<em>$1</em>');
  h = h.replace(/`([^`\n]+)`/g,     '<code>$1</code>');
  h = h.replace(new RegExp(SEP + '(\\d+)' + SEP, 'g'), (m, idx) => links[+idx]);
  return h;
}
function renderMdTable(lines) {
  const rows = lines.filter(l => !/^\|[\s\-:|]+\|?$/.test(l.trim()));
  if (!rows.length) return '';
  let out = '<table class="ai-table">';
  rows.forEach((row, idx) => {
    const cells = row.split('|').slice(1, -1);
    const tag = idx === 0 ? 'th' : 'td';
    out += '<tr>' + cells.map(c => `<${tag}>${inlineMd(c.trim())}</${tag}>`).join('') + '</tr>';
  });
  return out + '</table>';
}
function renderMd(text) {
  const lines = text.split('\n');
  let html = '';
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Table block
    if (line.trimStart().startsWith('|')) {
      const tbl = [];
      while (i < lines.length && lines[i].trimStart().startsWith('|')) { tbl.push(lines[i]); i++; }
      html += renderMdTable(tbl);
      continue;
    }
    // Headings
    const hm = line.match(/^(#{1,4}) (.+)$/);
    if (hm) {
      const lvl = Math.min(hm[1].length + 2, 6);
      html += `<h${lvl} class="ai-h">${inlineMd(hm[2])}</h${lvl}>`;
      i++; continue;
    }
    // HR
    if (/^---+$/.test(line.trim())) { html += '<hr class="ai-hr">'; i++; continue; }
    // Unordered list
    if (/^[-*•] /.test(line)) {
      let items = '';
      while (i < lines.length && /^[-*•] /.test(lines[i])) {
        items += '<li>' + inlineMd(lines[i].replace(/^[-*•] /, '')) + '</li>';
        i++;
      }
      html += '<ul class="ai-ul">' + items + '</ul>';
      continue;
    }
    // Ordered list
    if (/^\d+\. /.test(line)) {
      let items = '';
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items += '<li>' + inlineMd(lines[i].replace(/^\d+\. /, '')) + '</li>';
        i++;
      }
      html += '<ol class="ai-ol">' + items + '</ol>';
      continue;
    }
    // Empty line
    if (line.trim() === '') { html += '<div class="ai-br"></div>'; i++; continue; }
    // Paragraph
    html += '<p class="ai-p">' + inlineMd(line) + '</p>';
    i++;
  }
  return html;
}
