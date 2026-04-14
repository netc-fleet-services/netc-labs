// Full unit converter — Length, Weight, Temperature, Volume, Speed.

const CATEGORIES = {
  Length: {
    units: ['Kilometer', 'Meter', 'Centimeter', 'Millimeter', 'Mile', 'Yard', 'Foot', 'Inch', 'Nautical Mile'],
    base: 'Meter',
    toBase: {
      'Kilometer': 1000, 'Meter': 1, 'Centimeter': 0.01, 'Millimeter': 0.001,
      'Mile': 1609.344, 'Yard': 0.9144, 'Foot': 0.3048, 'Inch': 0.0254, 'Nautical Mile': 1852
    }
  },
  Weight: {
    units: ['Kilogram', 'Gram', 'Milligram', 'Pound', 'Ounce', 'Metric Ton', 'Short Ton'],
    base: 'Gram',
    toBase: {
      'Kilogram': 1000, 'Gram': 1, 'Milligram': 0.001,
      'Pound': 453.59237, 'Ounce': 28.349523, 'Metric Ton': 1e6, 'Short Ton': 907185
    }
  },
  Temperature: {
    units: ['Celsius', 'Fahrenheit', 'Kelvin'],
    special: true
  },
  Volume: {
    units: ['Liter', 'Milliliter', 'Gallon (US)', 'Quart (US)', 'Pint (US)', 'Cup (US)', 'Fluid Oz (US)', 'Cubic Meter'],
    base: 'Milliliter',
    toBase: {
      'Liter': 1000, 'Milliliter': 1, 'Gallon (US)': 3785.41, 'Quart (US)': 946.353,
      'Pint (US)': 473.176, 'Cup (US)': 236.588, 'Fluid Oz (US)': 29.5735, 'Cubic Meter': 1e6
    }
  },
  Speed: {
    units: ['km/h', 'm/s', 'mph', 'ft/s', 'Knot'],
    base: 'm/s',
    toBase: { 'km/h': 1/3.6, 'm/s': 1, 'mph': 0.44704, 'ft/s': 0.3048, 'Knot': 0.514444 }
  }
};

function convert(value, from, to, catName) {
  if (from === to) return value;
  const cat = CATEGORIES[catName];

  if (cat.special) {
    // Temperature
    let c;
    if (from === 'Celsius')    c = value;
    else if (from === 'Fahrenheit') c = (value - 32) * 5 / 9;
    else c = value - 273.15;

    if (to === 'Celsius')    return c;
    if (to === 'Fahrenheit') return c * 9 / 5 + 32;
    return c + 273.15;
  }

  return value * cat.toBase[from] / cat.toBase[to];
}

function formatResult(num) {
  if (isNaN(num) || !isFinite(num)) return '—';
  const abs = Math.abs(num);
  if (abs === 0) return '0';
  if (abs < 0.0001 || abs >= 1e10) return num.toExponential(5);
  // Up to 8 significant figures, strip trailing zeros
  return parseFloat(num.toPrecision(8)).toString();
}

export function Tool() {
  const el = document.createElement('div');
  let currentCat = 'Length';

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:1.5rem">
      <div>
        <h2 class="font-headline text-on-surface" style="font-size:1.5rem;margin-bottom:0.25rem">Unit Converter</h2>
        <p class="text-on-surface-muted" style="font-size:0.875rem">
          Real-time conversion across five categories. Results update as you type.
        </p>
      </div>

      <!-- Category tabs -->
      <div>
        <label class="tool-label">Category</label>
        <div id="cat-tabs" style="display:flex;flex-wrap:wrap;gap:0.5rem">
          ${Object.keys(CATEGORIES).map(c =>
            `<button class="category-tab${c === currentCat ? ' active' : ''}" data-cat="${c}">${c}</button>`
          ).join('')}
        </div>
      </div>

      <!-- Conversion row -->
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:0.75rem;align-items:end">
        <div>
          <label class="tool-label">From</label>
          <select id="from-unit" class="tool-select" style="margin-bottom:0.5rem"></select>
          <input id="from-val" type="number" class="tool-input" value="1" placeholder="Value" />
        </div>

        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding-bottom:0.25rem">
          <button id="swap-btn" class="btn-secondary" style="padding:0.5rem;font-size:1rem"
            title="Swap units">⇄</button>
        </div>

        <div>
          <label class="tool-label">To</label>
          <select id="to-unit" class="tool-select" style="margin-bottom:0.5rem"></select>
          <div id="to-result" style="
            min-height:2.75rem;
            padding:0.625rem 0.875rem;
            background-color:var(--surface);
            border:1px solid var(--outline-variant);
            border-radius:0.5rem;
            font-family:'Courier New',monospace;
            font-size:1.1rem;
            font-weight:700;
            color:var(--primary);
            display:flex;align-items:center">
            —
          </div>
        </div>
      </div>

      <!-- Swap button -->
      <button id="swap-btn-full" class="btn-secondary" style="width:100%">⇄ Swap Units</button>

      <!-- Quick-ref table -->
      <div id="quick-ref">
        <div class="tool-section-title">Common Conversions</div>
        <div id="quick-ref-body" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:0.5rem"></div>
      </div>
    </div>
  `;

  const catTabs    = el.querySelector('#cat-tabs');
  const fromUnit   = el.querySelector('#from-unit');
  const toUnit     = el.querySelector('#to-unit');
  const fromVal    = el.querySelector('#from-val');
  const toResult   = el.querySelector('#to-result');
  const swapBtn    = el.querySelector('#swap-btn');
  const swapBtnFull = el.querySelector('#swap-btn-full');
  const quickBody  = el.querySelector('#quick-ref-body');

  const QUICK_REF = {
    Length:      [['1 Mile','1.609 km'],['1 Foot','30.48 cm'],['1 Inch','2.54 cm'],['1 km','0.621 mi']],
    Weight:      [['1 lb','453.6 g'],['1 kg','2.205 lb'],['1 oz','28.35 g'],['1 ton (metric)','2204.6 lb']],
    Temperature: [['0°C','32°F'],['100°C','212°F'],['37°C','98.6°F'],['−40°C','−40°F']],
    Volume:      [['1 Gallon','3.785 L'],['1 Liter','33.81 fl oz'],['1 Cup','240 mL'],['1 Quart','946 mL']],
    Speed:       [['60 mph','96.6 km/h'],['100 km/h','62.1 mph'],['1 knot','1.852 km/h'],['1 m/s','3.6 km/h']]
  };

  function populateUnits() {
    const units = CATEGORIES[currentCat].units;
    [fromUnit, toUnit].forEach((sel, idx) => {
      sel.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
      sel.selectedIndex = idx < units.length - 1 ? idx : 0;
    });
    if (units.length > 1) toUnit.selectedIndex = 1;
  }

  function doConvert() {
    const v = parseFloat(fromVal.value);
    if (isNaN(v)) { toResult.textContent = '—'; return; }
    const r = convert(v, fromUnit.value, toUnit.value, currentCat);
    toResult.textContent = `${formatResult(r)} ${toUnit.value}`;
  }

  function renderQuickRef() {
    quickBody.innerHTML = '';
    (QUICK_REF[currentCat] || []).forEach(([from, to]) => {
      const box = document.createElement('div');
      box.style.cssText = `
        padding:0.625rem 0.875rem;
        background-color:var(--surface);
        border:1px solid var(--outline-variant);
        border-radius:0.5rem;
        font-size:0.8125rem;
        display:flex;justify-content:space-between;gap:0.5rem;
      `;
      box.innerHTML = `
        <span style="color:var(--on-surface-muted)">${from}</span>
        <span style="color:var(--primary);font-weight:600">${to}</span>`;
      quickBody.appendChild(box);
    });
  }

  catTabs.addEventListener('click', e => {
    const btn = e.target.closest('.category-tab');
    if (!btn) return;
    catTabs.querySelectorAll('.category-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCat = btn.dataset.cat;
    populateUnits();
    doConvert();
    renderQuickRef();
  });

  function doSwap() {
    const tmp = fromUnit.value;
    fromUnit.value = toUnit.value;
    toUnit.value = tmp;
    doConvert();
  }

  swapBtn.addEventListener('click', doSwap);
  swapBtnFull.addEventListener('click', doSwap);
  [fromUnit, toUnit, fromVal].forEach(inp => inp.addEventListener('input', doConvert));
  [fromUnit, toUnit].forEach(sel => sel.addEventListener('change', doConvert));

  populateUnits();
  doConvert();
  renderQuickRef();

  return el;
}
