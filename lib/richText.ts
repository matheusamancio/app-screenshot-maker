/**
 * Lightweight rich text for `text` elements.
 *
 * A text element's `text` is stored as a mostly-plain string that may contain a
 * small whitelist of inline `<span style="...">` runs (color / font-size in `em`
 * / font-weight). Newlines stay as `\n` and `[word]` pill markup keeps working.
 * Per-run font-size is in `em` so it scales with the element's base size + zoom.
 *
 * Three transforms:
 *  - htmlToStored: contentEditable innerHTML  -> clean stored string (sanitize)
 *  - storedToEditableHtml: stored -> innerHTML to seed the editor (literal [pills])
 *  - renderRichHtml: stored -> display HTML (escape + pillify + spans pass through)
 */

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/** Keep only color / font-size / font-weight, each value-validated. */
function safeStyle(style: string): string {
  const out: string[] = [];
  for (const decl of style.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const k = decl.slice(0, i).trim().toLowerCase();
    const v = decl.slice(i + 1).trim();
    if (k === 'color' && /^(#[0-9a-fA-F]{3,8}|rgba?\([\d.,\s%]+\))$/.test(v)) out.push(`color:${v}`);
    else if (k === 'font-size' && /^[\d.]+(em|px|%)$/.test(v)) out.push(`font-size:${v}`);
    else if (k === 'font-weight' && /^(\d{3}|bold|normal|bolder|lighter)$/.test(v)) out.push(`font-weight:${v}`);
  }
  return out.join(';');
}

/** contentEditable innerHTML → clean stored string (newlines as \n, safe spans only). */
export function htmlToStored(html: string): string {
  let out = '';
  const stack: ('span' | 'drop' | 'div')[] = [];
  let last = 0;
  const tagRe = /<[^>]+>/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html))) {
    out += decodeEntities(html.slice(last, m.index));
    last = m.index + m[0].length;
    const tag = m[0];
    const lower = tag.toLowerCase();
    if (/^<br\s*\/?>/.test(lower)) {
      out += '\n';
    } else if (/^<div/.test(lower)) {
      if (out && !out.endsWith('\n')) out += '\n';
      stack.push('div');
    } else if (/^<\/div>/.test(lower)) {
      if (stack[stack.length - 1] === 'div') stack.pop();
    } else if (/^<span/.test(lower)) {
      const sm = tag.match(/style\s*=\s*"([^"]*)"/i) || tag.match(/style\s*=\s*'([^']*)'/i);
      const ss = sm ? safeStyle(sm[1]) : '';
      if (ss) { out += `<span style="${ss}">`; stack.push('span'); } else stack.push('drop');
    } else if (/^<\/span>/.test(lower)) {
      if (stack.pop() === 'span') out += '</span>';
    } else if (/^<(b|strong)(\s|>)/.test(lower)) {
      out += '<span style="font-weight:800">';
      stack.push('span');
    } else if (/^<\/(b|strong)>/.test(lower)) {
      if (stack.pop() === 'span') out += '</span>';
    } else if (/^<\//.test(lower)) {
      if (stack.length) { if (stack.pop() === 'span') out += '</span>'; }
    } else {
      stack.push('drop'); // unknown opening tag (e.g. <font>) — drop, keep its text
    }
  }
  out += decodeEntities(html.slice(last));
  while (stack.length) { if (stack.pop() === 'span') out += '</span>'; }
  return out;
}

const SPAN_SPLIT = /(<span style="[^"]*">|<\/span>)/g;

/** Filled pill (matches the pill template look). */
function pill(word: string, color: string, ink: string): string {
  return `<span style="display:inline-block;background:${color};color:${ink};padding:0.04em 0.32em;border-radius:0.26em;line-height:1.04;">${word}</span>`;
}

/** Stored → display HTML: trusted spans pass through; text is escaped, pillified, \n→<br>. */
export function renderRichHtml(stored: string, baseColor: string, pillInk: string): string {
  return stored
    .split(SPAN_SPLIT)
    .map((tok) => {
      if (tok.startsWith('<span') || tok === '</span>') return tok;
      return escapeHtml(tok)
        .replace(/\[([^\]]+)\]/g, (_, w) => pill(w, baseColor, pillInk))
        .replace(/\n/g, '<br>');
    })
    .join('');
}

/** Stored → innerHTML to seed the editor: spans pass through, text escaped (pills stay literal), \n→<br>. */
export function storedToEditableHtml(stored: string): string {
  return stored
    .split(SPAN_SPLIT)
    .map((tok) => {
      if (tok.startsWith('<span') || tok === '</span>') return tok;
      return escapeHtml(tok).replace(/\n/g, '<br>');
    })
    .join('');
}
