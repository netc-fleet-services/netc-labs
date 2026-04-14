// CSV parser that handles quoted fields, escaped quotes, and multiple delimiters.

function parseCSV(text, delimiter) {
  const rows = [];
  let row = [], cell = '', inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cell += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      row.push(cell); cell = '';
    } else if ((ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) && !inQuotes) {
      if (ch === '\r') i++;
      row.push(cell); rows.push(row);
      row = []; cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) { row.push(cell); if (row.some(c => c !== '')) rows.push(row); }
  return rows;
}

function buildTable(rows, hasHeader) {
  const table = document.createElement('table');
  Object.assign(table.style, {
    width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem'
  });

  if (hasHeader && rows.length) {
    const thead = table.createTHead();
    const tr = thead.insertRow();
    rows[0].forEach(cell => {
      const th = document.createElement('th');
      Object.assign(th.style, {
        padding: '0.55rem 0.875rem',
        textAlign: 'left',
        fontWeight: '700',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--on-surface-muted)',
        backgroundColor: 'var(--surface-high)',
        borderBottom: '2px solid var(--outline)',
        whiteSpace: 'nowrap'
      });
      th.textContent = cell;
      tr.appendChild(th);
    });
  }

  const tbody = table.createTBody();
  (hasHeader ? rows.slice(1) : rows).forEach((row, ri) => {
    const tr = tbody.insertRow();
    tr.style.backgroundColor = ri % 2 === 0 ? 'var(--surface-container)' : 'var(--surface)';
    tr.addEventListener('mouseover', () => tr.style.backgroundColor = 'var(--surface-high)');
    tr.addEventListener('mouseout', () => {
      tr.style.backgroundColor = ri % 2 === 0 ? 'var(--surface-container)' : 'var(--surface)';
    });
    row.forEach(cell => {
      const td = tr.insertCell();
      Object.assign(td.style, {
        padding: '0.5rem 0.875rem',
        color: 'var(--on-surface)',
        borderBottom: '1px solid var(--outline-variant)'
      });
      td.textContent = cell;
    });
  });

  return table;
}

const SAMPLE = `name,age,city,role\nAlice,30,Dallas,Engineer\nBob,25,Austin,Designer\nCarol,35,Houston,Manager\nDave,28,San Antonio,Developer`;

export function Tool() {
  const el = document.createElement('div');
  let parsedRows = null;

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:1.5rem">
      <div>
        <h2 class="font-headline text-on-surface" style="font-size:1.5rem;margin-bottom:0.25rem">CSV Formatter</h2>
        <p class="text-on-surface-muted" style="font-size:0.875rem">
          Paste CSV to preview it as a table, then download the cleaned file.
        </p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
        <div>
          <label class="tool-label">Delimiter</label>
          <select id="delimiter" class="tool-select">
            <option value=",">Comma (,)</option>
            <option value="&#9;">Tab</option>
            <option value=";">Semicolon (;)</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>
        <div style="display:flex;align-items:flex-end;padding-bottom:0.125rem">
          <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;
            color:var(--on-surface);cursor:pointer;user-select:none">
            <input type="checkbox" id="has-header" checked class="accent-primary"
              style="width:1rem;height:1rem" />
            First row is header
          </label>
        </div>
      </div>

      <div>
        <label class="tool-label">CSV Input</label>
        <textarea id="csv-input" class="tool-input" rows="8"
          placeholder="name,age,city&#10;Alice,30,Dallas"></textarea>
      </div>

      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button id="parse-btn" class="btn-primary">Parse & Preview</button>
        <button id="sample-btn" class="btn-secondary">Load Sample</button>
        <button id="clear-btn" class="btn-secondary">Clear</button>
      </div>

      <div id="error-box" class="tool-error" style="display:none"></div>

      <div id="result" style="display:none">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.5rem">
          <div class="tool-section-title" style="margin:0">Preview</div>
          <div style="display:flex;align-items:center;gap:0.75rem">
            <span id="row-count" class="text-on-surface-muted" style="font-size:0.75rem"></span>
            <button id="download-btn" class="btn-secondary" style="font-size:0.8rem;padding:0.375rem 0.875rem">
              ↓ Download CSV
            </button>
          </div>
        </div>
        <div id="table-wrap" style="overflow-x:auto;border-radius:0.5rem;
          border:1px solid var(--outline-variant)"></div>
      </div>
    </div>
  `;

  const csvInput   = el.querySelector('#csv-input');
  const delimiter  = el.querySelector('#delimiter');
  const hasHeader  = el.querySelector('#has-header');
  const parseBtn   = el.querySelector('#parse-btn');
  const sampleBtn  = el.querySelector('#sample-btn');
  const clearBtn   = el.querySelector('#clear-btn');
  const errorBox   = el.querySelector('#error-box');
  const result     = el.querySelector('#result');
  const tableWrap  = el.querySelector('#table-wrap');
  const rowCount   = el.querySelector('#row-count');
  const downloadBtn = el.querySelector('#download-btn');

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
    result.style.display = 'none';
  }

  parseBtn.addEventListener('click', () => {
    errorBox.style.display = 'none';
    const text = csvInput.value.trim();
    if (!text) { showError('Please paste some CSV data first.'); return; }

    try {
      parsedRows = parseCSV(text, delimiter.value === '\\t' ? '\t' : delimiter.value);
      if (!parsedRows.length) throw new Error('No rows detected.');

      const dataCount = hasHeader.checked ? parsedRows.length - 1 : parsedRows.length;
      rowCount.textContent = `${dataCount} row${dataCount !== 1 ? 's' : ''}`;
      tableWrap.innerHTML = '';
      tableWrap.appendChild(buildTable(parsedRows, hasHeader.checked));
      result.style.display = 'block';
    } catch (e) {
      showError(`Parse error: ${e.message}`);
    }
  });

  sampleBtn.addEventListener('click', () => {
    csvInput.value = SAMPLE;
    delimiter.value = ',';
    hasHeader.checked = true;
  });

  clearBtn.addEventListener('click', () => {
    csvInput.value = '';
    result.style.display = 'none';
    errorBox.style.display = 'none';
    parsedRows = null;
  });

  downloadBtn.addEventListener('click', () => {
    if (!parsedRows) return;
    const delim = delimiter.value === '\\t' ? '\t' : delimiter.value;
    const csv = parsedRows.map(row =>
      row.map(c => (c.includes(',') || c.includes('"') || c.includes('\n'))
        ? `"${c.replace(/"/g, '""')}"` : c
      ).join(delim)
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'formatted.csv'
    });
    a.click();
    URL.revokeObjectURL(a.href);
  });

  return el;
}
