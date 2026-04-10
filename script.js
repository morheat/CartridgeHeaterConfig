let S = {
  diam: '', length: '', volt: '120', watt: '500',
  sheath: 'ss304', lead: 'fiberglass', stdlead: '',
  exit: 'straight_none', fit: 'none',
  protLen: '',
  nptType: 'na', 
  processConn: 'na',
  tcouple: 'none', 
  tcoupleLoc: 'na',
  ground: 'na', 
  sleeving: 'na', 
  seal: 'cement'
};

// --- NEW: Load saved state from LocalStorage so it survives browser refresh ---
try {
  const savedState = localStorage.getItem('heaterDevState');
  if (savedState) {
    S = { ...S, ...JSON.parse(savedState) };
  }
} catch(e) { console.error("Could not load state"); }

function saveState() {
  localStorage.setItem('heaterDevState', JSON.stringify(S));
}

function syncUIToState() {
  const inputs = { 'length-in': 'length', 'lead-in': 'stdlead', 'prot-in': 'protLen', 'watt-in': 'watt' };
  for (let [id, key] of Object.entries(inputs)) {
    if (document.getElementById(id)) document.getElementById(id).value = S[key];
  }

  const selects = { 'npt-type': 'nptType', 'process-conn': 'processConn', 'tcouple-type': 'tcouple', 'tcouple-loc': 'tcoupleLoc', 'ground-wire': 'ground', 'fiberglass-sleeve': 'sleeving', 'end-seal': 'seal' };
  for (let [id, key] of Object.entries(selects)) {
    if (document.getElementById(id)) document.getElementById(id).value = S[key];
  }

  ['diam', 'volt', 'sheath', 'lead', 'exit', 'fit'].forEach(group => {
    document.querySelectorAll(`[data-group="${group}"]`).forEach(opt => {
      opt.classList.toggle('selected', opt.dataset.val === S[group]);
    });
  });
}
// --------------------------------------------------------------------------------

function updateCustomSelect(el, stateKey) {
  S[stateKey] = el.value;
  updateCalc();
}

const SHEATH_LABELS = {
  ss304: '304 Stainless Steel', ss316: '316 Stainless Steel',
  incoloy800: 'Incoloy 800', incoloy840: 'Incoloy 840',
  copper: 'Copper', brass: 'Brass', titanium: 'Titanium'
};

const LEAD_LABELS = {
  fiberglass: 'Fibreglass Insulated', ss_braid: 'SS Braided',
  teflon: 'Teflon (PTFE)', conduit: 'Conduit Nipple', hi_temp: 'Hi-Temp Leads'
};

const EXIT_LABELS = {
    straight_none: 'Straight / None',
    '90_none': '90° / None',
    straight_braid: 'Straight / SS Braid',
    '90_braid': '90° / SS Braid',
    straight_armor: 'Straight / SS Armor',
    '90_armor': '90° / SS Armor',
    post: 'Post Terminal',
    box: 'Terminal Box'
};

const FIT_LABELS = {
    none: 'None', stainless: 'Stainless Fitting', brass: 'Brass Fitting', double: 'Double Ended Fitting'
};

const SHEATH_COLORS = {
  ss304: '#378ADD', ss316: '#4caf7d', incoloy800: '#e8622a',
  incoloy840: '#d4522a', copper: '#EF9F27', brass: '#BA7517', titanium: '#888780'
};

const IMAGE_MAP = {
  "none_straight_none": { file: "base-heater.png", coords: { diam: { top: '34%', left: '19%' }, len: { bottom: '35%', left: '31%' }, lead: { top: '50%', right: '30%' } } },
  "none_90_none": { file: "lead-90deg.png", coords: { diam: { top: '28%', left: '36%' }, len: { bottom: '50%', left: '45%' }, lead: { top: '61%', right: '39%' } } },
  "none_straight_braid": { file: "Lead-Straight_SSBraid.png", coords: { diam: { top: '32%', left: '19%' }, len: { bottom: '38%', left: '31%' }, lead: { top: '54%', right: '23%' }, prot: { top: '42%', right: '35%' } } },
  "none_90_braid": { file: "Lead-90deg-SSBraid.png", coords: { diam: { top: '28%', left: '35%' }, len: { bottom: '51%', left: '43%' }, lead: { top: '71%', right: '45.5%' }, prot: { top: '55%', right: '39%' } } },
  "none_straight_armor": { file: "lead-Straight-SSArmor.png", coords: { diam: { top: '34%', left: '17%' }, len: { bottom: '35%', left: '29%' }, lead: { top: '55%', right: '25%' }, prot: { top: '43%', right: '39%' } } },
  "none_90_armor": { file: "lead-90deg-SSArmor.png", coords: { diam: { top: '28%', left: '35%' }, len: { bottom: '51%', left: '43%' }, lead: { top: '71%', right: '45.5%' }, prot: { top: '55%', right: '39%' } }  },
  "none_post": { file: "lead-PostTerminal.png", coords: { diam: { top: '36%', left: '27%' }, len: { bottom: '33%', left: '40%' }, lead: { top: '50%', right: '100%' } } },
  "none_box": { file: "lead-TerminalBox.png", coords: { diam: { top: '30%', left: '26%' }, len: { bottom: '37%', left: '39%' }, lead: { top: '50%', right: '100%' }} },


  "brass_straight_none": { file: "Brass-Straight-noProtection.png", coords: { diam: { top: '32%', left: '15%' }, len: { bottom: '39%', left: '23%' }, lead: { top: '48%', right: '35%' } } },
  "brass_90_none": { file: "Brass-90deg-noProtection.png", coords: { diam: { top: '28%', left: '35%' }, len: { bottom: '52%', left: '40%' }, lead: { top: '61%', right: '41%' } } },
  "brass_straight_braid": { file: "Brass-Straight-SSBraid.png", coords: { diam: { top: '32%', left: '16%' }, len: { bottom: '40%', left: '23%' }, lead: { top: '57%', right: '24%' }, prot: { top: '43%', right: '39%' } } },
  "brass_90_braid": { file: "Brass-90deg-SSBraid.png", coords: { diam: { top: '28%', left: '34%' }, len: { bottom: '52%', left: '40%' }, lead: { top: '72%', right: '46%' }, prot: { top: '55%', right: '39%' } } },
  "brass_straight_armor": { file: "Brass-Straight-SSArmor.png", coords: { diam: { top: '33%', left: '17%' }, len: { bottom: '40%', left: '23%' }, lead: { top: '56%', right: '24%' }, prot: { top: '43%', right: '39%' } } },
  "brass_90_armor": { file: "Brass-90deg-SSArmor.png", coords: { diam: { top: '28%', left: '34%' }, len: { bottom: '52%', left: '40%' }, lead: { top: '72%', right: '46%' }, prot: { top: '55%', right: '39%' } } },
  "brass_post": { file: "Brass-PostTerminal.png", coords: { diam: { top: '36%', left: '27%' }, len: { bottom: '33%', left: '34%' }, lead: { top: '50%', right: '100%' } } },
  "brass_box": { file: "Brass-TerminalBox.png", coords: { diam: { top: '30%', left: '26%' }, len: { bottom: '40%', left: '32%' }, lead: { top: '50%', right: '100%' }} },


  "stainless_straight_none": { file: "Stainless-Straight-noProtection.png", coords: { diam: { top: '33%', left: '16%' }, len: { bottom: '39%', left: '23%' }, lead: { top: '48%', right: '35%' } } },
  "stainless_90_none": { file: "Stainless-90deg-noProtection.png", coords: { diam: { top: '28%', left: '35%' }, len: { bottom: '52%', left: '40%' }, lead: { top: '61%', right: '41%' } } },
  "stainless_straight_braid": { file: "Stainless-Straight-SSBraid.png", coords: { diam: { top: '32%', left: '16%' }, len: { bottom: '40%', left: '23%' }, lead: { top: '57%', right: '24%' }, prot: { top: '43%', right: '39%' } } },
  "stainless_90_braid": { file: "Stainless-90deg-SSBraid.png", coords: { diam: { top: '28%', left: '34%' }, len: { bottom: '52%', left: '40%' }, lead: { top: '72%', right: '46%' }, prot: { top: '55%', right: '39%' } } },
  "stainless_straight_armor": { file: "stainless-Straight-SSArmor.png", coords: { diam: { top: '33%', left: '17%' }, len: { bottom: '40%', left: '23%' }, lead: { top: '56%', right: '24%' }, prot: { top: '43%', right: '39%' } } },
  "stainless_90_armor": { file: "Stainless-90deg-SSArmor.png", coords: { diam: { top: '28%', left: '34%' }, len: { bottom: '52%', left: '40%' }, lead: { top: '72%', right: '46%' }, prot: { top: '55%', right: '39%' } } },
  "stainless_post": { file: "stainless-PostTerminal.png", coords: { diam: { top: '36%', left: '27%' }, len: { bottom: '33%', left: '34%' }, lead: { top: '50%', right: '100%' } } },
  "stainless_box": { file: "stainless-TerminalBox.png", coords: { diam: { top: '32%', left: '25%' }, len: { bottom: '40%', left: '32%' }, lead: { top: '50%', right: '100%' }} },


  "double_straight_none": { file: "Double-Straight-NoProtection.png", coords: { diam: { top: '33%', left: '16%' }, len: { bottom: '40%', left: '22%' }, lead: { top: '48%', right: '35%' } } },
  "double_90_none": { file: "Double-90deg-noProtection.png", coords: { diam: { top: '28%', left: '35%' }, len: { bottom: '52%', left: '39%' }, lead: { top: '61%', right: '41%' } } },
  "double_straight_braid": { file: "double-Straight-SSBraid.png", coords: { diam: { top: '32%', left: '16%' }, len: { bottom: '40%', left: '23%' }, lead: { top: '57%', right: '24%' }, prot: { top: '43%', right: '39%' } } },
  "double_90_braid": { file: "Double-90deg-SSBraid.png", coords: { diam: { top: '28%', left: '34%' }, len: { bottom: '51%', left: '39%' }, lead: { top: '72%', right: '46%' }, prot: { top: '55%', right: '39%' } } },
  "double_straight_armor": { file: "Double-Straight-SSArmor.png", coords: { diam: { top: '33%', left: '17%' }, len: { bottom: '40%', left: '23%' }, lead: { top: '56%', right: '24%' }, prot: { top: '43%', right: '39%' } } },
  "double_90_armor": { file: "Double-90deg-SSArmor.png", coords: { diam: { top: '28%', left: '34%' }, len: { bottom: '52%', left: '40%' }, lead: { top: '72%', right: '46%' }, prot: { top: '55%', right: '39%' } } },
  "double_post": { file: "Double-PostTerminal.png", coords: { diam: { top: '36%', left: '27%' }, len: { bottom: '37%', left: '32%' }, lead: { top: '50%', right: '100%' } } },
  "double_box": { file: "Double-TerminalBox.png", coords: { diam: { top: '32%', left: '25%' }, len: { bottom: '42%', left: '31%' }, lead: { top: '50%', right: '100%' }} }
};

function selectOpt(el) {
  const group = el.dataset.group;
  const val = el.dataset.val;
  
  document.querySelectorAll(`[data-group="${group}"]`).forEach(opt => opt.classList.remove('selected'));
  el.classList.add('selected');
  
  S[group] = val;
  updateCalc(); 
}

function updateCalc() {
  if (document.getElementById("length-in")) S.length = document.getElementById("length-in").value;
  if (document.getElementById("lead-in")) S.stdlead = document.getElementById("lead-in").value;
  if (document.getElementById("prot-in")) S.protLen = document.getElementById("prot-in").value;
  if (document.getElementById("watt-in")) S.watt = document.getElementById("watt-in").value;

  const protGroup = document.getElementById("prot-len-group");
  const isProtected = S.exit.includes('braid') || S.exit.includes('armor');
  
  if (protGroup) {
      protGroup.style.display = isProtected ? "block" : "none";
  }

  saveState(); // Saves to localStorage instantly
  updateVis();
  updateDrawing();
}

function sv(id, val, isEmpty) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = val;
  el.classList.toggle('empty', !!isEmpty);
}

function updateVis() {
  const diam = parseFloat(S.diam) || 0.5;
  const len = S.length || 4;
  const w = Math.min(175, Math.max(30, len * 12));
  const x0 = 20;
  const color = S.sheath ? SHEATH_COLORS[S.sheath] : '#e8622a';

  const body = document.getElementById('h-body');
  if (body) {
    body.setAttribute('width', w);
    body.setAttribute('stroke', color);
  }

  const lead = document.getElementById('h-lead');
  if (lead) lead.setAttribute('x', x0 + w);

  sv('sv-diam', S.diam ? S.diam + '"' : '—', !S.diam);
  sv('sv-len', S.length ? S.length + '"' : '—', !S.length);
  sv('sv-volt', S.volt ? S.volt + 'V' : '—', !S.volt);
  sv('sv-watt', S.watt ? S.watt + 'W' : '—', !S.watt);
  sv('sv-sheath', S.sheath ? SHEATH_LABELS[S.sheath] : '—', !S.sheath);
  sv('sv-lead', S.lead ? LEAD_LABELS[S.lead] : '—', !S.lead);
  sv('sv-exit', EXIT_LABELS[S.exit] || '—', false);
  sv('sv-fit', FIT_LABELS[S.fit] || '—', false);
}

function updateDrawing() {
  const baseImg = document.getElementById('heaterBaseImage');
  const key = `${S.fit}_${S.exit}`;
  const config = IMAGE_MAP[key] || IMAGE_MAP["none_straight_none"];
  
  baseImg.src = `images/${config.file}`;

  const labels = {
    diam: document.getElementById("dimDiameter"),
    len:  document.getElementById("dimLength"),
    lead: document.getElementById("dimLead"),
    prot: document.getElementById("dimProt")
  };

  labels.diam.textContent = S.diam ? S.diam + '"' : "DIAMETER";
  labels.len.textContent  = S.length ? S.length + '"' : "HEATED LENGTH";
  labels.lead.textContent = S.stdlead ? S.stdlead + '"' : "LEAD LENGTH";
  labels.prot.textContent = S.protLen ? S.protLen + '"' : "PROT. LENGTH";

  const isProtected = S.exit.includes('braid') || S.exit.includes('armor');
  labels.prot.style.display = isProtected ? "block" : "none";

  Object.keys(labels).forEach(key => {
    const el = labels[key];
    const pos = config.coords[key];
    if (el && pos) {
      el.style.top = 'auto'; el.style.bottom = 'auto';
      el.style.left = 'auto'; el.style.right = 'auto';
      Object.assign(el.style, pos);
    }
  });

  const specsList = document.getElementById('drawingSpecsList');
  if (specsList) {
    specsList.innerHTML = `
      <div class="spec-line"><span class="sl-lbl">Wattage:</span> <span class="sl-val">${S.watt ? S.watt + 'W' : 'NA'}</span></div>
      <div class="spec-line"><span class="sl-lbl">Voltage:</span> <span class="sl-val">${S.volt ? S.volt + 'V' : 'NA'}</span></div>
      <div class="spec-line"><span class="sl-lbl">NPT Fitting / Flange:</span> <span class="sl-val">NA</span></div>
      <div class="spec-line"><span class="sl-lbl">Process Fitting / Connection:</span> <span class="sl-val">NA</span></div>
      <div class="spec-line"><span class="sl-lbl">Fitting Options:</span> <span class="sl-val">${FIT_LABELS[S.fit] || 'NA'}</span></div>
      <div class="spec-line"><span class="sl-lbl">Exit & Lead Protection:</span> <span class="sl-val">${EXIT_LABELS[S.exit] || 'None'}</span></div>
      <div class="spec-line"><span class="sl-lbl">Lead Material:</span> <span class="sl-val">${LEAD_LABELS[S.lead] || 'NA'}</span></div>
      <div class="spec-line"><span class="sl-lbl">Internal Thermocouple:</span> <span class="sl-val">None</span></div>
      <div class="spec-line"><span class="sl-lbl">Ground Wire:</span> <span class="sl-val">NA</span></div>
      <div class="spec-line"><span class="sl-lbl">Fiberglass Sleeving:</span> <span class="sl-val">NA</span></div>
      <div class="spec-line"><span class="sl-lbl">End Seal / Potting:</span> <span class="sl-val">Cement Potting (Standard) – 1800°F 982°C</span></div>
    `;
  }
}

// --- NEW: Dev tool to easily find coordinates without guessing percentages ---
function makeLabelsDraggable() {
  const helper = document.createElement('div');
  helper.style.cssText = "position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.8); color:#4f8cff; padding:6px 10px; font-family:monospace; font-size:12px; z-index:1000; border-radius:4px; pointer-events:none; display:none;";
  document.getElementById('drawingStage').appendChild(helper);

  ['diam', 'len', 'lead', 'prot'].forEach(key => {
    const idMap = { diam: 'dimDiameter', len: 'dimLength', lead: 'dimLead', prot: 'dimProt' };
    const el = document.getElementById(idMap[key]);
    if (!el) return;

    el.style.cursor = 'move';
    el.style.pointerEvents = 'auto'; // allow mouse actions
    let isDragging = false;

    el.addEventListener('mousedown', (e) => {
      isDragging = true;
      helper.style.display = 'block';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const stage = document.getElementById('drawingStage').getBoundingClientRect();
      let x = e.clientX - stage.left;
      let y = e.clientY - stage.top;

      let leftPct = ((x / stage.width) * 100).toFixed(1) + '%';
      let topPct = ((y / stage.height) * 100).toFixed(1) + '%';

      el.style.left = leftPct;
      el.style.top = topPct;
      el.style.bottom = 'auto';
      el.style.right = 'auto';

      helper.innerHTML = `Copy this to IMAGE_MAP:<br><span style="color:#0f0;">${key}: { top: '${topPct}', left: '${leftPct}' }</span>`;
    });

    document.addEventListener('mouseup', () => {
      if(isDragging) {
         console.log(helper.innerText.replace('Copy this to IMAGE_MAP:\n', ''));
      }
      isDragging = false;
      setTimeout(() => { if(!isDragging) helper.style.display = 'none'; }, 2000);
    });
  });
}
// --------------------------------------------------------------------------------

function buildSpecText() {
  return [
    'CARTRIDGE HEATER — INTERNAL SPECIFICATION',
    '==========================================',
    `  Outer Diameter:  ${S.diam ? S.diam + '"' : 'Not set'}`,
    `  Heated Length:   ${S.length ? S.length + '"' : 'Not set'}`,
    `  Voltage:         ${S.volt ? S.volt + 'V' : 'Not set'}`,
    `  Wattage:         ${S.watt ? S.watt + 'W' : 'Not set'}`,
    `  Sheath:          ${S.sheath ? SHEATH_LABELS[S.sheath] : 'Not set'}`,
    `  Lead Wire:       ${S.lead ? LEAD_LABELS[S.lead] : 'Not set'}`,
    `  Exit Protection: ${EXIT_LABELS[S.exit] || 'None'}`,
    `  Fitting:         ${FIT_LABELS[S.fit] || 'None'}`,
  ].join('\n');
}

function copySpecToClipboard() {
  const text = buildSpecText();
  navigator.clipboard.writeText(text).then(() => {
    const t = document.getElementById('toast');
    if (t) {
      t.textContent = 'Copied to clipboard';
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }
  });
}

const themeToggle = document.getElementById("themeToggle");
themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  themeToggle.textContent = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
});

// Run Init Actions
syncUIToState();
updateCalc();
makeLabelsDraggable();