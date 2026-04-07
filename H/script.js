let allBets = {};
let currentPage = 'H';
let countdown1 = 379;
let currentRangeIndex = 0;

const config = {
  gamename: 'PLATINUM HIT', ver: 'V-4.0.0.0',
  btns: [
    'SP', { t: 'Cancel\n(F10)', c: '' }, { t: 'Reprint\n(F2)', c: '' },
    { t: 'Advance\nSpot', c: '' }, { t: 'INFO (F3)', c: 'red' },
    { t: 'Result (F4)', c: 'pink' }, 'SP',
    { t: 'Random\nPick', c: 'rand' }, { t: 'fam' }, { t: '3.0.0.0', c: 'ver' }
  ]
};

function switchPage(p) {
  if (p === 'G') window.location.href = '../G/index.html';
  else if (p !== 'H') window.location.href = '../' + p + '/index.html';
}

function buildSidebar(btns) {
  const sb = document.getElementById('rightSb');
  if(!sb) return;
  sb.innerHTML = '';
  btns.forEach(b => {
    if (b === 'SP') {
      const sp = document.createElement('div'); sp.className = 'sb-spacer'; sb.appendChild(sp); return;
    }
    if (b.t === 'fam') {
      const d = document.createElement('div'); d.className = 'sb-family';
      d.innerHTML = '<input type="checkbox" id="sfam"><label for="sfam">FAMILY</label>';
      sb.appendChild(d); return;
    }
    if (b.c === 'ver') {
      const d = document.createElement('div'); d.className = 'sb-ver'; d.textContent = b.t; sb.appendChild(d); return;
    }
    if (b.c === 'rand') {
      const btn = document.createElement('button'); btn.className = 'sb-random'; btn.textContent = b.t;
      sb.appendChild(btn); return; // Random pick logic omitted for H
    }
    const btn = document.createElement('button');
    btn.className = 'sb-btn ' + (b.c || '');
    btn.textContent = b.t;
    if (b.t.includes('Cancel') || b.t.includes('Clear')) btn.onclick = clearSelections;
    if (b.t.includes('Advance')) btn.onclick = openAdvanceModal;
    sb.appendChild(btn);
  });
}

const FAMILY_GROUPS = [
  ['00', '05', '50', '55'],
  ['01', '06', '10', '15', '51', '56', '60', '65'],
  ['02', '07', '20', '25', '52', '57', '70', '75'],
  ['03', '08', '30', '35', '53', '58', '80', '85'],
  ['04', '09', '40', '45', '54', '59', '90', '95'],
  ['11', '16', '61', '66'],
  ['12', '17', '21', '26', '62', '67', '71', '76'],
  ['13', '18', '31', '36', '63', '68', '81', '86'],
  ['14', '19', '41', '46', '64', '69', '91', '96'],
  ['22', '27', '72', '77'],
  ['23', '28', '32', '37', '73', '78', '82', '87'],
  ['24', '29', '42', '47', '74', '79', '92', '97'],
  ['33', '38', '83', '88'],
  ['34', '39', '43', '48', '84', '89', '93', '98'],
  ['44', '49', '94', '99']
];

function getCheckedSidebarIndices() {
  let indices = [currentRangeIndex];
  document.querySelectorAll('.h-range-chk').forEach((chk, idx) => {
      if (chk.checked && !indices.includes(idx)) indices.push(idx);
  });
  return indices;
}

function setGridValueWithFilters(relNum, val) {
  let isOdd = relNum % 2 !== 0;
  let isEven = relNum % 2 === 0;
  let oddChecked = document.querySelector('#chkOdd') ? document.querySelector('#chkOdd').checked : false;
  let evenChecked = document.querySelector('#chkEven') ? document.querySelector('#chkEven').checked : false;
  
  if (val > 0) {
      if ((evenChecked && !isEven) || (oddChecked && !isOdd)) return;
  }

  let indices = getCheckedSidebarIndices();

  indices.forEach(idx => {
      let absNumStr = String(idx * 100 + relNum).padStart(4, '0');
      if (val > 0) allBets[absNumStr] = val;
      else delete allBets[absNumStr];
  });

  let visibleNumStr = String(currentRangeIndex * 100 + relNum).padStart(4, '0');
  let cellInp = document.getElementById('hinp-' + visibleNumStr);
  if (cellInp) {
      cellInp.value = val > 0 ? val : '';
      if (val > 0) cellInp.parentElement.classList.add('sel');
      else cellInp.parentElement.classList.remove('sel');
  }
}

function handleInputApply(relNum, val) {
  let famChecked = document.querySelector('#sfam') && document.querySelector('#sfam').checked;
  let targets = [relNum];
  
  if (famChecked && val > 0) {
      let numStr2D = String(relNum).padStart(2, '0');
      let group = FAMILY_GROUPS.find(g => g.includes(numStr2D));
      if (group) targets = group.map(x => parseInt(x, 10));
  }
  
  targets.forEach(t => setGridValueWithFilters(t, val));
}

function buildHGrid() {
  const rDiv = document.getElementById('hRanges');
  if(!rDiv) return;
  rDiv.innerHTML = '';
  
  const f1 = document.createElement('div');
  f1.className = 'h-rlbl transparent h-filter-top';
  f1.style.gridRow = '1';
  f1.innerHTML = `<label class="fd-chk-box white individual"><input type="checkbox" checked/> Individual</label>`;
  rDiv.appendChild(f1);

  const f2 = document.createElement('div');
  f2.className = 'h-rlbl transparent h-filter-bot';
  f2.style.gridRow = '2';
  f2.innerHTML = `
    <label class="fd-chk-box white mt"><input type="checkbox"/> MT</label>
    <label class="fd-chk-box white all"><input type="checkbox" id="chkAllSidebars"/> All</label>
  `;
  rDiv.appendChild(f2);
 

  setTimeout(() => {
    const chkAll = document.getElementById('chkAllSidebars');
    if (chkAll) {
        chkAll.onchange = (e) => {
            const checked = e.target.checked;
            document.querySelectorAll('.h-range-chk').forEach(cb => {
                cb.checked = checked;
                cb.dispatchEvent(new Event('change'));
            });
        };
    }
  }, 50);

  const rangeTexts = [
    '0000 - 0099', '0100 - 0199', '0200 - 0299', '0300 - 0399', '0400 - 0499',
    '0500 - 0599', '0600 - 0699', '0700 - 0799', '0800 - 0899', '0900 - 0999'
  ];
  rangeTexts.forEach((txt, i) => {
    const d = document.createElement('div');
    d.className = 'h-rlbl' + (i === currentRangeIndex ? ' on' : '');
    d.style.gridRow = (i + 3).toString();
    d.innerHTML = `<input type="checkbox" class="h-range-chk"/> <span style="cursor:pointer;">${txt}</span>`;
    
    d.querySelector('span').onclick = () => {
      document.querySelectorAll('.h-rlbl').forEach(el => el.classList.remove('on'));
      d.classList.add('on');
      currentRangeIndex = i;
      renderHGridNumbers();
    };

    d.querySelector('input').onchange = (e) => {
      const checked = e.target.checked;
      const startNum = i * 100;
      const masterStart = currentRangeIndex * 100;
      for (let n = 0; n < 100; n++) {
        const targetV = String(startNum + n).padStart(4, '0');
        const masterV = String(masterStart + n).padStart(4, '0');
        if (checked && allBets[masterV] > 0) {
            allBets[targetV] = allBets[masterV];
        } else if (!checked) {
            delete allBets[targetV];
        }
      }
      if (currentRangeIndex === i) renderHGridNumbers();
      updateStats();
    };
    rDiv.appendChild(d);
  });

  const mDiv = document.getElementById('hMiddleBoxes');
  if(mDiv) {
    mDiv.innerHTML = '';
    const boxOdd = document.createElement('div');
    boxOdd.className = 'h-mbox'; boxOdd.style.gridRow = '1';
    boxOdd.innerHTML = `<label class="fd-chk-box blue" style="width:100%; height:100%; cursor:pointer;"><input type="checkbox" id="chkOdd"/> Odd</label>`;
    boxOdd.querySelector('input').onchange = (e) => {
        if (e.target.checked) document.getElementById('chkEven').checked = false;
    };
    mDiv.appendChild(boxOdd);

    const boxEven = document.createElement('div');
    boxEven.className = 'h-mbox'; boxEven.style.gridRow = '2';
    boxEven.innerHTML = `<label class="fd-chk-box blue" style="width:100%; height:100%; cursor:pointer;"><input type="checkbox" id="chkEven"/> Even</label>`;
    boxEven.querySelector('input').onchange = (e) => {
        if (e.target.checked) document.getElementById('chkOdd').checked = false;
    };
    mDiv.appendChild(boxEven);

    for (let i = 0; i < 10; i++) {
      const b = document.createElement('div');
      b.className = 'h-mbox'; b.style.gridRow = (i + 3).toString();
      b.innerHTML = `<input type="text" class="h-row-inp" data-row="${i}" maxlength="3" style="width:100%; height:100%; border:none; background:transparent; text-align:center; color:inherit; outline:none; font-weight:bold; font-size:14px;">`;
      
      b.querySelector('input').oninput = function() {
        let val = parseInt(this.value) || 0;
        for (let c = 0; c < 10; c++) {
            let n = i * 10 + c;
            handleInputApply(n, val);
        }
        updateStats();
      };
      mDiv.appendChild(b);
    }
  }

  const colHdr = document.getElementById('hColHdr');
  if(colHdr) {
    colHdr.innerHTML = '';
    for (let j = 0; j < 10; j++) {
      const h = document.createElement('div'); h.className = 'h-chdr';
      h.innerHTML = `<input type="text" class="h-col-inp" data-col="${j}" maxlength="3" style="width:100%; height:100%; border:none; background:transparent; text-align:center; color:inherit; outline:none; font-weight:bold; font-size:14px;">`;
      
      h.querySelector('input').oninput = function() {
        let val = parseInt(this.value) || 0;
        for (let r = 0; r < 10; r++) {
          let n = r * 10 + j;
          handleInputApply(n, val);
        }
        updateStats();
      };
      colHdr.appendChild(h);
    }
  }

  renderHGridNumbers();

  const qCol = document.getElementById('hQtyCol');
  const pCol = document.getElementById('hPtsCol');
  if(qCol && pCol) {
    qCol.innerHTML = ''; pCol.innerHTML = '';
    for (let i = 0; i < 10; i++) {
      const q = document.createElement('div'); q.className = 'h-qp-cell'; qCol.appendChild(q);
      const p = document.createElement('div'); p.className = 'h-qp-cell'; pCol.appendChild(p);
    }
  }
}

function renderHGridNumbers() {
  const grid = document.getElementById('hGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const startNum = currentRangeIndex * 100;
  
  for (let i = 0; i < 100; i++) {
    const numStr = String(startNum + i).padStart(4, '0');
    const el = document.createElement('div');
    el.className = 'hcell';
    if (allBets[numStr]) el.classList.add('sel');
    
    el.innerHTML = `
      <div class="hcell-num">${numStr}</div>
      <input type="text" id="hinp-${numStr}" maxlength="3" style="width:100%; border:none; background:transparent; text-align:center; color:inherit; font-size:inherit; font-weight:bold; outline:none;" value="${allBets[numStr] || ''}">
    `;
    
    let inp = el.querySelector('input');
    inp.oninput = function() {
        let val = parseInt(this.value) || 0;
        
        let isOdd = i % 2 !== 0;
        let isEven = i % 2 === 0;
        let oddChecked = document.querySelector('#chkOdd') ? document.querySelector('#chkOdd').checked : false;
        let evenChecked = document.querySelector('#chkEven') ? document.querySelector('#chkEven').checked : false;
        
        if (val > 0 && ((evenChecked && !isEven) || (oddChecked && !isOdd))) {
            val = 0; // force clear if invalid input while checking Odd/Even
        }

        handleInputApply(i, val);
        
        // Force sync value natively backwards locally in case it was 0 for invalid blocks
        if (val === 0) {
            this.value = '';
            el.classList.remove('sel');
        } else {
            el.classList.add('sel');
        }
        
        updateStats();
    };

    el.onclick = (e) => {
      if (e.target !== inp) inp.focus();
    };
    grid.appendChild(el);
  }
  document.querySelectorAll('.h-col-inp, .h-row-inp').forEach(inp => inp.value = '');
}

function updateStats() {
  let rangeQty = new Array(10).fill(0);
  let rangePts = new Array(10).fill(0);
  
  let totalSpots = 0;
  let totalQty = 0;
  let totalPts = 0;

  // Calculate totals for the 10 explicit ranges (0000-0099 up to 0900-0999)
  for (let numStr in allBets) {
      if (allBets[numStr] > 0) {
          let num = parseInt(numStr);
          let rangeIdx = Math.floor(num / 100); // 0 to 9
          let qty = allBets[numStr];
          
          if (rangeIdx >= 0 && rangeIdx < 10) {
              rangeQty[rangeIdx] += qty;
              rangePts[rangeIdx] += qty * 10; // Assuming point multiplier is 10 for Pts
          }
          
          totalSpots++;
          totalQty += qty;
          totalPts += qty * 10;
      }
  }

  // Update exactly 10 rows in right sidebar for Qty and Pts to display Range summaries
  const qCol = document.getElementById('hQtyCol');
  const pCol = document.getElementById('hPtsCol');
  if (qCol && pCol) {
      qCol.innerHTML = '';
      pCol.innerHTML = '';
      for (let r = 0; r < 10; r++) {
          const q = document.createElement('div'); q.className = 'h-qp-cell'; q.textContent = rangeQty[r] > 0 ? rangeQty[r] : '0';
          const p = document.createElement('div'); p.className = 'h-qp-cell'; p.textContent = rangePts[r] > 0 ? rangePts[r] : '0';
          qCol.appendChild(q); pCol.appendChild(p);
      }
  }
  
  const spotsEl = document.getElementById('statSpots');
  const prizeEl = document.getElementById('statPrize');
  const totalPtsEl = document.getElementById('statTotalPts');
  
  if (spotsEl) spotsEl.textContent = totalSpots; 
  if (totalPtsEl) totalPtsEl.textContent = totalQty;
  if (prizeEl) prizeEl.textContent = totalPts;
}

function clearSelections() {
  allBets = {};
  document.querySelectorAll('.hcell').forEach(e => e.classList.remove('sel'));
  
  // uncheck checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
  // clear text inputs
  document.querySelectorAll('input[type="text"]').forEach(c => c.value = '');
  
  updateStats();
}

function playH() {
  let hasBets = false;
  for (let val in allBets) {
      if (allBets[val] > 0) hasBets = true;
  }
  if (!hasBets) {
      alert("Please enter some points before playing!");
      return;
  }
  
  alert("Bet Placed Successfully!");
  clearSelections();
}

function updateClock() {
  const n = new Date();
  const pad = x => String(x).padStart(2, '0');
  const dt = document.getElementById('navDatetime');
  if (dt) dt.textContent = `${n.getDate()}/${n.getMonth() + 1}/${n.getFullYear()} | ${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  let h = n.getHours(), ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
  const tm = `${h}:${pad(n.getMinutes())} ${ap}`;
  const ht = document.getElementById('hdrTime'); if (ht) ht.textContent = tm;
}

function updateCountdowns() {
  const box1 = document.getElementById('hdrCountdown');
  if (box1) {
    countdown1 = Math.max(0, countdown1 - 1); if (countdown1 === 0) countdown1 = 600;
    box1.textContent = String(Math.floor(countdown1 / 60)).padStart(2, '0') + ':' + String(countdown1 % 60).padStart(2, '0');
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'F7') { 
    e.preventDefault(); 
    const pb = document.getElementById('playBtn');
    if(pb) pb.click(); 
  }
  if (e.key === 'Escape' || e.key === 'F10') clearSelections();
});

function scaleFonts() {
  const isMobile = window.innerWidth <= 768;
  const elements = document.querySelectorAll('.hcell, .h-rlbl, .h-wnum, .nav-tab, .sb-btn, .sb-random');

  if (isMobile) {
    elements.forEach(el => {
      el.style.fontSize = '';
      if (el.classList.contains('sb-btn') || el.classList.contains('sb-random')) {
        el.style.padding = '';
      }
    });
    return;
  }

  const vh = window.innerHeight;
  const base = 768;
  const s = vh / base;
  const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, Math.round(v)));

  document.querySelectorAll('.hcell').forEach(el => { el.style.fontSize = clamp(11 * s, 9, 20) + 'px'; });
  document.querySelectorAll('.h-rlbl').forEach(el => { el.style.fontSize = clamp(9 * s, 7, 14) + 'px'; });
  document.querySelectorAll('.h-wnum').forEach(el => { el.style.fontSize = clamp(20 * s, 13, 32) + 'px'; });
  document.querySelectorAll('.nav-tab').forEach(el => { el.style.fontSize = clamp(17 * s, 13, 26) + 'px'; });
  document.querySelectorAll('.sb-btn,.sb-random').forEach(el => {
    el.style.fontSize = clamp(11 * s, 9, 18) + 'px';
    el.style.padding = clamp(9 * s, 6, 16) + 'px 4px';
  });
}

window.addEventListener('resize', scaleFonts);

const DESIGN_W = 1366;
const DESIGN_H = 768;

function applyMobileScale() {
  const wrapper = document.querySelector('.app-wrapper');
  if (!wrapper) return;

  const isPortrait = window.innerHeight > window.innerWidth;
  const isMobileW = window.innerWidth <= 600;

  if (isPortrait && isMobileW) {
    const scaleByW = window.innerWidth / DESIGN_W;
    const scaleByH = window.innerHeight / DESIGN_H;
    const scale = Math.min(scaleByW, scaleByH);

    wrapper.style.width = DESIGN_W + 'px';
    wrapper.style.height = DESIGN_H + 'px';
    wrapper.style.transformOrigin = 'top left';
    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.position = 'absolute';
    wrapper.style.top = '0';
    wrapper.style.left = '0';

    document.body.style.height = (DESIGN_H * scale) + 'px';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  } else {
    wrapper.style.width = '';
    wrapper.style.height = '';
    wrapper.style.transform = '';
    wrapper.style.transformOrigin = '';
    wrapper.style.position = '';
    wrapper.style.top = '';
    wrapper.style.left = '';
    document.body.style.height = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }
}

window.addEventListener('resize', applyMobileScale);
window.addEventListener('orientationchange', applyMobileScale);


// ==========================================
// ADVANCE DRAW LOGIC
// ==========================================
let selectedAdvanceDraws = new Set();

function openAdvanceModal() {
  const modal = document.getElementById('advanceModal');
  const grid = document.getElementById('advanceDrawGrid');
  if (!modal || !grid) return;

  grid.innerHTML = '';
  selectedAdvanceDraws.clear();

  const now = new Date();
  for (let i = 1; i <= 16; i++) {
    const drawTime = new Date(now.getTime() + i * 15 * 60000);
    const timeStr = drawTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    
    const item = document.createElement('div');
    item.className = 'draw-item';
    item.innerHTML = `
      <span class="draw-time">${timeStr}</span>
      <span class="draw-label">DRAW #${2000 + i}</span>
    `;
    item.onclick = () => toggleAdvanceDrawSelection(item, timeStr);
    grid.appendChild(item);
  }
  modal.style.display = 'flex';
}

function closeAdvanceModal() {
  const modal = document.getElementById('advanceModal');
  if (modal) modal.style.display = 'none';
}

function toggleAdvanceDrawSelection(element, timeStr) {
  if (selectedAdvanceDraws.has(timeStr)) {
    selectedAdvanceDraws.delete(timeStr);
    element.classList.remove('selected');
  } else {
    selectedAdvanceDraws.add(timeStr);
    element.classList.add('selected');
  }
}

function confirmAdvanceDraw() {
  if (selectedAdvanceDraws.size === 0) {
    alert("Please select at least one future draw!");
    return;
  }
  const draws = Array.from(selectedAdvanceDraws).join(', ');
  alert("Advance Draws Selected: " + draws);
  closeAdvanceModal();
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('body-H');
  const playBtn = document.getElementById('playBtn');
  if (playBtn) playBtn.onclick = playH;

  const powerBtn = document.querySelector('.power-btn');
  if (powerBtn) {
    powerBtn.onclick = () => {
      const modal = document.getElementById('logoutModal');
      if (modal) modal.style.display = 'flex';
    };
  }

  window.closeLogoutModal = function() {
    const modal = document.getElementById('logoutModal');
    if (modal) modal.style.display = 'none';
  };

  window.confirmLogout = function() {
    sessionStorage.removeItem('user');
    window.location.href = '../index.html';
  };

  const getBalance = async () => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    try {
      const res = await API.balance(user.username, null, 'H');
      if (res && res.success && res.data) {
        const limitVal = document.getElementById('hdrLimitValue');
        if (limitVal) limitVal.textContent = res.data.balance;
      }
    } catch (e) { console.error('Balance error:', e); }
  };

  getBalance();
  setInterval(getBalance, 5000);

  buildSidebar(config.btns);
  buildHGrid();
  updateClock();
  scaleFonts();
  applyMobileScale();
  setInterval(updateClock, 1000);
  setInterval(updateCountdowns, 1000);
});
