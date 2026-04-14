let S = {
  diam: '', length: '', volt: '120', watt: '500',
  sheath: 'ss304', lead: 'fiberglass', stdlead: '',
  leadMat: 'MGT 750°C - 1382°F / 750°C', 
  exit: 'straight_none', fit: 'none',
  protLen: '',
  nptType: 'na', 
  processConn: 'na',
  tcouple: 'none', 
  tcoupleLoc: 'na',
  ground: 'na', 
  sleeving: 'na', 
  seal: 'cement',
  ground: 'no',
  sleeving: 'none'
};

let unitMode = 'in'; // 'in' or 'mm'

const INCH_DIAMS = [
  { frac: '1/8"', dec: '0.125' }, { frac: '1/4"', dec: '0.250' },
  { frac: '5/16"', dec: '0.312' }, { frac: '3/8"', dec: '0.375' },
  { frac: '1/2"', dec: '0.500' }, { frac: '17/32"', dec: '0.531' },
  { frac: '5/8"', dec: '0.625' }, { frac: '11/16"', dec: '0.687' },
  { frac: '3/4"', dec: '0.750' }, { frac: '7/8"', dec: '0.875' },
  { frac: '1"', dec: '1.000' }
];

function getThermocoupleText() {
  if (S.tcouple === 'none') return 'None';

  const type = TCOUPLE_LABELS[S.tcouple] || '';
  const loc = TCOUPLE_LOC_LABELS[S.tcoupleLoc] || '';

  return loc ? `${type} - ${loc}` : (type);
}
const MM_DIAMS = [6, 6.5, 8, 10, 12, 12.5, 13, 14, 15, 16, 17, 19, 20, 21, 25];

function diamDisplay(val) {
  if (!val) return '—';
  if (unitMode === 'mm') return val + ' mm';
  const found = INCH_DIAMS.find(d => d.dec === String(val));
  return found ? found.frac : (val + '"');
}

function renderDiamOptions() {
  const container = document.getElementById('diam-opts');
  if (!container) return;
  container.innerHTML = '';
  
  if (unitMode === 'in') {
    INCH_DIAMS.forEach(d => {
      const opt = document.createElement('div');
      opt.className = `opt ${S.diam === d.dec ? 'selected' : ''}`;
      opt.dataset.group = 'diam';
      opt.dataset.val = d.dec;
      opt.innerHTML = `${d.frac} <span class="sub">${d.dec}"</span>`;
      opt.onclick = function() { selectOpt(this); };
      container.appendChild(opt);
    });
  } else {
    MM_DIAMS.forEach(m => {
      const valStr = String(m);
      const opt = document.createElement('div');
      opt.className = `opt ${S.diam === valStr ? 'selected' : ''}`;
      opt.dataset.group = 'diam';
      opt.dataset.val = valStr;
      opt.innerHTML = `${valStr} <span class="sub">mm</span>`;
      opt.onclick = function() { selectOpt(this); };
      container.appendChild(opt);
    });
  }
}
function handleTCoupleChange() {
  const type = document.getElementById('tcouple-type').value;
  S.tcouple = type;

  const locGroup = document.getElementById('tcouple-loc-group');

  if (type === 'none') {
    locGroup.style.display = 'none';
    S.tcoupleLoc = 'na';
  } else {
    locGroup.style.display = 'block';
    // Grab the current visible value of the location dropdown (e.g., 'disk') 
    // and immediately save it to the state so the image triggers.
    S.tcoupleLoc = document.getElementById('tcouple-loc').value;
  }

  updateCalc();
}

function toggleUnits() {
  const prevMode = unitMode;
  unitMode = unitMode === 'in' ? 'mm' : 'in';

  const btn = document.getElementById('unitToggle');
  if (btn) btn.textContent = unitMode === 'in' ? '⇄ mm' : '⇄ inches';

  // Reset the numeric input field values
  const numFields = [
    { id: 'length-in', key: 'length' },
    { id: 'lead-in',   key: 'stdlead' },
    { id: 'prot-in',   key: 'protLen' }
  ];
  numFields.forEach(({ id, key }) => {
    S[key] = ''; // Clear the saved state
    const el = document.getElementById(id);
    if (el) el.value = ''; // Clear the input box
  });

  // Update "inches" / "mm" unit labels next to inputs
  document.querySelectorAll('.num-unit').forEach(el => {
    if (el.textContent === 'inches' || el.textContent === 'mm') {
      el.textContent = unitMode === 'in' ? 'inches' : 'mm';
    }
  });

  S.diam = ''; // Clear selection on unit swap since catalogs differ
  renderDiamOptions();
  updateDrawing();
  updateVis();
}

// --- Removed LocalStorage loading so it resets to default on reload ---

function saveState() {
  // Keeping this function empty so we don't break other parts of the script
  // localStorage.setItem('heaterDevState', JSON.stringify(S));
}

function syncUIToState() {
  const inputs = { 'length-in': 'length', 'lead-in': 'stdlead', 'prot-in': 'protLen', 'watt-in': 'watt', 'volt-in': 'volt' };
  
  // NEW: Fill the HTML input boxes with your saved state on load
  Object.keys(inputs).forEach(id => {
    const el = document.getElementById(id);
    if (el && S[inputs[id]] !== undefined) {
      el.value = S[inputs[id]];
    }
  });

  // Keep your existing selection logic
  ['diam', 'sheath', 'leadMat', 'lead', 'exit', 'fit'].forEach(group => { 
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

const NPT_LABELS = {
  na: 'NA',
  npt_process: 'NPT Process Fitting',
  flange: 'Flange'
};

const PROCESS_CONN_LABELS = {
  na: 'NA',
  '1/4_npt': '1/4" NPT',
  '3/8_npt': '3/8" NPT',
  '1/2_npt': '1/2" NPT'
};

const TCOUPLE_LABELS = {
  none: 'None',
  type_j: 'Type J',
  type_k: 'Type K'
};

const TCOUPLE_LOC_LABELS = {
  disk: 'Disk End',
  middle_sheath: 'Middle (Sheath Temp)',
  middle_heater: 'Middle (Heater Temp)'
};

const GROUND_LABELS = {
  na: 'No',
  yes: 'Yes'
};

const SLEEVE_LABELS = {
  none: 'No Sleeving',
  both: '1 sleeve over both leads',
  each: '1 sleeve over each lead'
};

const SEAL_LABELS = {
  cement: 'Cement Potting (Standard) - 1800°F 982°C',
  ceramic: 'Ceramic End Piece - 2500°F 1371°C',
  teflon: 'Teflon Seal - 300°F 149°C',
  laval: 'Laval End Piece - 3000°F 1649°C',
  epoxylite: 'Epoxylite Potting - 650°F 343°C',
  epoxy: 'Epoxy Potting - 265°F 129°C',
  silicone: 'Silicone Rubber - 500°F 260°C'
};

const IMAGE_MAP = {
  "none_straight_none": { file: "base-heater.png", coords: { diam: { top: '34%', left: '19%' }, len: { bottom: '35%', left: '31%' }, lead: { top: '50%', right: '30%' } } },
  "none_90_none": { file: "lead-90deg.png", coords: { diam: { top: '13%', left: '30%' }, len: { bottom: '52%', left: '42%' }, lead: { top: '70%', right: '34%' } } },
  "none_straight_braid": { file: "Lead-Straight_SSBraid.png", coords: { diam: { top: '32%', left: '19%' }, len: { bottom: '38%', left: '31%' }, lead: { top: '54%', right: '23%' }, prot: { top: '42%', right: '35%' } } },
  "none_90_braid": { file: "Lead-90deg-SSBraid.png", coords: { diam: { top: '13%', left: '27%' }, len: { bottom: '56%', left: '38%' }, lead: { top: '85%', right: '44%' }, prot: { top: '59%', right: '32.5%' } } },
  "none_straight_armor": { file: "lead-Straight-SSArmor.png", coords: { diam: { top: '32%', left: '14%' }, len: { bottom: '35%', left: '25%' }, lead: { top: '55%', right: '25%' }, prot: { top: '43%', right: '39%' } } },
  "none_90_armor": { file: "lead-90deg-SSArmor.png", coords: { diam: { top: '13%', left: '27%' }, len: { bottom: '56%', left: '38%' }, lead: { top: '85%', right: '44%' }, prot: { top: '59%', right: '32.5%' } }  },
  "none_post": { file: "lead-PostTerminal.png", coords: { diam: { top: '28%', left: '17%' }, len: { bottom: '25%', left: '35%' }, lead: { top: '50%', right: '100%' } } },
  "none_box": { file: "lead-TerminalBox.png", coords: { diam: { top: '24%', left: '16%' }, len: { bottom: '35%', left: '30%' }, lead: { top: '50%', right: '100%' } } },


  "brass_straight_none": { file: "Brass-Straight-noProtection.png", coords: { diam: { top: '32%', left: '14%' }, len: { bottom: '39%', left: '23%' }, lead: { top: '48%', right: '35%' } } },
  "brass_90_none": { file: "Brass-90deg-noProtection.png", coords: { diam: { top: '14%', left: '27%' }, len: { bottom: '57%', left: '33%' }, lead: { top: '70%', right: '37%' } } },
  "brass_straight_braid": { file: "Brass-Straight-SSBraid.png", coords: { diam: { top: '32%', left: '14%' }, len: { bottom: '40%', left: '21%' }, lead: { top: '57%', right: '24%' }, prot: { top: '43%', right: '39%' } } },
  "brass_90_braid": { file: "Brass-90deg-SSBraid.png", coords: { diam: { top: '13%', left: '25%' }, len: { bottom: '58%', left: '32%' }, lead: { top: '85%', right: '44%' }, prot: { top: '59%', right: '32.5%' } } },
  "brass_straight_armor": { file: "Brass-Straight-SSArmor.png", coords: { diam: { top: '33%', left: '13%' }, len: { bottom: '38%', left: '21%' }, lead: { top: '56%', right: '24%' }, prot: { top: '43%', right: '39%' } } },
  "brass_90_armor": { file: "Brass-90deg-SSArmor.png", coords: { diam: { top: '12%', left: '25%' }, len: { bottom: '58%', left: '32%' }, lead: { top: '85%', right: '44%' }, prot: { top: '59%', right: '32.5%' } } },
  "brass_post": { file: "Brass-PostTerminal.png", coords: { diam: { top: '32%', left: '17%' }, len: { bottom: '29%', left: '25%' }, lead: { top: '50%', right: '100%' } } },
  "brass_box": { file: "Brass-TerminalBox.png", coords: { diam: { top: '24%', left: '16%' }, len: { bottom: '38%', left: '25%' }, lead: { top: '50%', right: '100%' } } },


  "stainless_straight_none": { file: "Stainless-Straight-noProtection.png", coords: { diam: { top: '32%', left: '13.5%' }, len: { bottom: '39%', left: '20%' }, lead: { top: '48%', right: '35%' } } },
  "stainless_90_none": { file: "Stainless-90deg-noProtection.png", coords: { diam: { top: '14%', left: '27%' }, len: { bottom: '57%', left: '33%' }, lead: { top: '70%', right: '37%' } } },
  "stainless_straight_braid": { file: "Stainless-Straight-SSBraid.png", coords: { diam: { top: '32%', left: '14%' }, len: { bottom: '40%', left: '20%' }, lead: { top: '57%', right: '24%' }, prot: { top: '43%', right: '39%' } } },
  "stainless_90_braid": { file: "Stainless-90deg-SSBraid.png", coords: { diam: { top: '13%', left: '25%' }, len: { bottom: '58%', left: '32%' }, lead: { top: '85%', right: '44%' }, prot: { top: '59%', right: '32.5%' } } },
  "stainless_straight_armor": { file: "stainless-Straight-SSArmor.png", coords: { diam: { top: '31%', left: '13.5%' }, len: { bottom: '38%', left: '20%' }, lead: { top: '56%', right: '24%' }, prot: { top: '43%', right: '39%' } } },
  "stainless_90_armor": { file: "Stainless-90deg-SSArmor.png", coords: { diam: { top: '12%', left: '25%' }, len: { bottom: '58%', left: '32%' }, lead: { top: '85%', right: '44%' }, prot: { top: '59%', right: '32.5%' } } },
  "stainless_post": { file: "stainless-PostTerminal.png", coords: { diam: { top: '32%', left: '16%' }, len: { bottom: '29%', left: '25%' }, lead: { top: '50%', right: '100%' } } },
  "stainless_box": { file: "stainless-TerminalBox.png", coords: { diam: { top: '24%', left: '15%' }, len: { bottom: '38%', left: '25%' }, lead: { top: '50%', right: '100%' } } },


  "double_straight_none": { file: "Double-Straight-NoProtection.png", coords: { diam: { top: '33%', left: '14%' }, len: { bottom: '40%', left: '20%' }, lead: { top: '48%', right: '35%' } } },
  "double_90_none": { file: "Double-90deg-noProtection.png", coords: { diam: { top: '14%', left: '27%' }, len: { bottom: '57%', left: '33%' }, lead: { top: '70%', right: '37%' } } },
  "double_straight_braid": { file: "double-Straight-SSBraid.png", coords: { diam: { top: '32%', left: '16%' }, len: { bottom: '40%', left: '20%' }, lead: { top: '58%', right: '20%' }, prot: { top: '42%', right: '38%' } } },
  "double_90_braid": { file: "Double-90deg-SSBraid.png", coords: { diam: { top: '13%', left: '25%' }, len: { bottom: '56%', left: '32%' }, lead: { top: '85%', right: '44%' }, prot: { top: '59%', right: '32.5%' } } },
  "double_straight_armor": { file: "Double-Straight-SSArmor.png", coords: { diam: { top: '33%', left: '15%' }, len: { bottom: '38%', left: '20%' }, lead: { top: '56%', right: '24%' }, prot: { top: '43%', right: '39%' } } },
  "double_90_armor": { file: "Double-90deg-SSArmor.png", coords: { diam: { top: '15%', left: '26%' }, len: { bottom: '58%', left: '32%' }, lead: { top: '85%', right: '45.5%' }, prot: { top: '59%', right: '35%' } } },
  "double_post": { file: "Double-PostTerminal.png", coords: { diam: { top: '30%', left: '16%' }, len: { bottom: '32%', left: '22%' }, lead: { top: '50%', right: '100%' } } },
  "double_box": { file: "Double-TerminalBox.png", coords: { diam: { top: '24%', left: '15%' }, len: { bottom: '40%', left: '21%' }, lead: { top: '50%', right: '100%' } } }
};

const TCOUPLE_IMAGE_MAP = {
  disk: "tc-disk.png",
  middle_sheath: "tc-middle-sheath.png",
  middle_heater: "tc-middle-sheath.png"
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
  const readLen = (id) => {
    const el = document.getElementById(id);
    if (!el || el.value === '') return '';
    const raw = parseFloat(el.value);
    if (isNaN(raw)) return '';
    return raw; // Just return the exact number they typedext
  };

  S.length  = readLen('length-in');
  S.stdlead = readLen('lead-in');
  S.protLen = readLen('prot-in');
  if (document.getElementById("watt-in")) S.watt = document.getElementById("watt-in").value;
  if (document.getElementById("volt-in")) S.volt = document.getElementById("volt-in").value;

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
  // Normalize len just for the visual drawing so mm doesn't stretch the SVG infinitely
  const rawLen = parseFloat(S.length) || (unitMode === 'mm' ? 100 : 4);
  const normalizedLen = unitMode === 'mm' ? rawLen / 25.4 : rawLen;
  const w = Math.min(175, Math.max(30, normalizedLen * 12));
  
  const x0 = 20;
  const color = S.sheath ? SHEATH_COLORS[S.sheath] : '#e8622a';

  const body = document.getElementById('h-body');
  if (body) {
    body.setAttribute('width', w);
    body.setAttribute('stroke', color);
  }

  const matVal = S.leadMat || 'Fiberglass 450C - 842F';
  const displayNode = document.getElementById('sv-leadMat');
  if (displayNode) {
    displayNode.textContent = S.leadMat || 'NA';
  }

  const lead = document.getElementById('h-lead');
  if (lead) lead.setAttribute('x', x0 + w);

  const diamStr = S.diam
    ? (unitMode === 'mm' ? S.diam + ' mm' : diamDisplay(S.diam))
    : '—';
  const lenStr = S.length
    ? (unitMode === 'mm' ? S.length + ' mm' : S.length + '"')
    : '—';

  sv('sv-diam', diamStr, !S.diam);
  sv('sv-len',  lenStr,  !S.length);
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

  // --- Thermocouple overlay (SAFE) ---
  const tcImg = document.getElementById('tcOverlay');

  if (tcImg) {
    if (S.tcouple !== 'none' && S.tcoupleLoc !== 'na') {
      const file = TCOUPLE_IMAGE_MAP[S.tcoupleLoc];

      if (file) {
        tcImg.src = `images/${file}`;
        tcImg.style.display = 'block';
      } else {
        tcImg.style.display = 'none';
      }
    } else {
      tcImg.style.display = 'none';
    }
  }

  const labels = {
    diam: document.getElementById("dimDiameter"),
    len:  document.getElementById("dimLength"),
    lead: document.getElementById("dimLead"),
    prot: document.getElementById("dimProt")
  };

  const isProtected = S.exit.includes('braid') || S.exit.includes('armor');

  if (unitMode === 'mm') {
    labels.diam.textContent = S.diam ? S.diam + ' mm' : "DIAMETER";
    labels.len.textContent  = S.length ? S.length + ' mm' : "HEATED LENGTH";
    labels.lead.textContent = S.stdlead ? S.stdlead + ' mm' : "LEAD LENGTH";
    labels.prot.textContent = S.protLen ? S.protLen + ' mm' : "PROT. LENGTH";
  } else {
    labels.diam.textContent = S.diam ? diamDisplay(S.diam) : "DIAMETER";
    labels.len.textContent  = S.length ? S.length + '"' : "HEATED LENGTH";
    labels.lead.textContent = S.stdlead ? S.stdlead + '"' : "LEAD LENGTH";
    labels.prot.textContent = S.protLen ? S.protLen + '"' : "PROT. LENGTH";
  }

  labels.diam.style.display = "block";
  labels.len.style.display  = "block";
  labels.lead.style.display = "block";
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
      <div class="spec-line">
        <span class="sl-lbl">Watt Density:</span> 
        <span class="sl-val">
          ${
            getWattDensity() 
              ? getWattDensity().toFixed(2) + ' W/in²' 
              : 'NA'
          }
        </span>
      </div>

      <div class="spec-line"><span class="sl-lbl">Process Fitting / Connection :</span> 
        <span class="sl-val">
          ${PROCESS_CONN_LABELS[S.processConn] || 'NA'}
        </span>
      </div>

      <div class="spec-line"><span class="sl-lbl">Fitting Options:</span> 
        <span class="sl-val">${FIT_LABELS[S.fit] || 'NA'}</span>
      </div>

      <div class="spec-line"><span class="sl-lbl">Lead Material:</span> 
        <span class="sl-val">${S.leadMat || 'NA'}</span>
      </div>

      <div class="spec-line"><span class="sl-lbl">Exit & Lead Protection:</span> 
        <span class="sl-val">${EXIT_LABELS[S.exit] || 'None'}</span>
      </div>

      <div class="spec-line"><span class="sl-lbl">Internal Thermocouple:</span> 
        <span class="sl-val">${getThermocoupleText()}</span>
      </div>

      <div class="spec-line"><span class="sl-lbl">Ground Wire:</span> 
        <span class="sl-val">${GROUND_LABELS[S.ground] || 'No'}</span>
      </div>

      <div class="spec-line"><span class="sl-lbl">Fiberglass Sleeving:</span> 
        <span class="sl-val">${SLEEVE_LABELS[S.sleeving] || 'No Sleeving'}</span>
      </div>

      <div class="spec-line"><span class="sl-lbl">End Seal / Potting:</span> 
        <span class="sl-val">
          ${SEAL_LABELS[S.seal] || 'Cement Potting (Standard) - 1800°F 982°C'}
        </span>
      </div>
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

function getWattDensity() {
  const W = parseFloat(S.watt);
  let D = parseFloat(S.diam);
  let L = parseFloat(S.length);

  if (!W || !D || !L) return null;

  // Convert mm → inches if needed
  if (unitMode === 'mm') {
    D = D / 25.4;
    L = L / 25.4;
  }

  const wd = W / (Math.PI * D * L);

  return wd;
}

function buildSpecText() {
  const diamStr = S.diam
    ? (unitMode === 'mm' ? S.diam + ' mm' : diamDisplay(S.diam))
    : 'Not set';
  const lenStr = S.length
    ? (unitMode === 'mm' ? S.length + ' mm' : S.length + '"')
    : 'Not set';
  return [
    'CARTRIDGE HEATER — INTERNAL SPECIFICATION',
    '==========================================',
    `  Outer Diameter:  ${diamStr}`,
    `  Heated Length:   ${lenStr}`,
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
      t.textContent = '✓ Spec copied to clipboard';
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }
  });
}

async function downloadDrawingPDF() {
  const btn = document.getElementById('downloadPdfBtn');
  const original = btn ? btn.textContent : '';
  if (btn) btn.textContent = 'Generating…';

  try {
    const stage = document.getElementById('drawingStage');
    const canvas = await html2canvas(stage, {
      scale: 2, // Keeps the resolution high
      useCORS: true,
      backgroundColor: '#f8fafc',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;

    // Grab the actual CSS pixel dimensions of the container
    const pdfWidth = stage.offsetWidth;
    const pdfHeight = stage.offsetHeight;

    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'px', // Force jsPDF to use pixels instead of points
      format: [pdfWidth, pdfHeight]
    });

    // Draw the image using the exact container dimensions
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('cartridge-heater-drawing.pdf');
  } catch(e) {
    console.error('PDF error:', e);
    alert('Could not generate PDF. Please try again.');
  }

  if (btn) btn.textContent = original;
}

const themeToggle = document.getElementById("themeToggle");
themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  themeToggle.textContent = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
});

// Run Init Actions
renderDiamOptions();
syncUIToState();
updateCalc();
makeLabelsDraggable();