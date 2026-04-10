// ==========================================
// ADVANCE DRAW LOGIC (4D) - FIXED
// ==========================================
let selectedAdvanceDraws = new Set();

function openAdvanceModal() {
  const modal = document.getElementById('advanceModal');
  const grid = document.getElementById('advanceDrawGrid'); // HTML wala ID
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
      <span class="draw-label">DRAW #${4000 + i}</span>
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

let allBets = {};
let currentMasterStart = 1000;
let currentRangeIndex = 0;
let currentPage = '4D';
let countdown1 = 379;

const config = {
  gamename: 'PLATINUM 4D', ver: 'V-4.0.0.0',
  btns: [
    { t: 'Cancel\n(F10)', c: '' }, { t: 'Reprint\n(F2)', c: '' },
    { t: 'Advance\nSpot', c: '' }, { t: 'INFO (F3)', c: 'red' },
    { t: 'Result (F4)', c: 'pink' }, { t: 'Screen-\n1', c: 'blue' },
    { t: 'Screen-\n3', c: 'blue' }, { t: 'Random Pick', c: 'rand' }, { t: 'fam' }
  ]
};

function switchPage(p) {
  if (p === 'G') window.location.href = '../G/index.html';
  else if (p !== '4D') window.location.href = '../' + p + '/index.html';
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
      sb.appendChild(btn); return;
    }
    const btn = document.createElement('button');
    btn.className = 'sb-btn ' + (b.c || '');
    btn.textContent = b.t;
    if (b.t.includes('Cancel') || b.t.includes('Clear')) btn.onclick = clearSelections;
    if (b.t.includes('Advance')) btn.onclick = openAdvanceModal;
    sb.appendChild(btn);
  });
}

function getCheckedSidebarIndices() {
  const indices = new Set();
  document.querySelectorAll('.fd-r-box input').forEach((chk, idx) => {
    if (chk.checked) indices.add(idx);
  });
  indices.add(currentRangeIndex); // Always include the range we are currently interacting with
  return Array.from(indices);
}

function setGridValueWithFilters(relNum, val) {
  let isOdd = relNum % 2 !== 0;
  let isEven = relNum % 2 === 0;
  
  let oddChecked = document.getElementById('chkOdd') ? document.getElementById('chkOdd').checked : false;
  let evenChecked = document.getElementById('chkEven') ? document.getElementById('chkEven').checked : false;
  
  if (val > 0) {
      if ((evenChecked && !isEven) || (oddChecked && !isOdd)) return;
  }

  let chipInputs = document.querySelectorAll('.fd-chip-box input');
  let masterStarts = [];
  if (chipInputs[0].checked) masterStarts.push(1000);
  if (chipInputs[1].checked) masterStarts.push(3000);
  if (chipInputs[2].checked) masterStarts.push(5000);

  let indices = getCheckedSidebarIndices();

  masterStarts.forEach(mStart => {
    indices.forEach(idx => {
        let absNum = mStart + idx * 100 + relNum;
        let absNumStr = String(absNum).padStart(4, '0');
        if (val > 0) allBets[absNumStr] = val;
        else delete allBets[absNumStr];
    });
  });

  let visibleNumStr = String(currentMasterStart + currentRangeIndex * 100 + relNum).padStart(4, '0');
  let cellInp = document.getElementById('fdinp-' + visibleNumStr);
  if (cellInp) {
      cellInp.value = val > 0 ? val : '';
      if (val > 0) cellInp.parentElement.parentElement.classList.add('sel');
      else cellInp.parentElement.parentElement.classList.remove('sel');
  }
}

function handleInputApply(relNum, val) {
  let famChecked = document.getElementById('sfam') ? document.getElementById('sfam').checked : false;
  if (!famChecked && document.getElementById('bbFam')) famChecked = document.getElementById('bbFam').checked;

  let targets = [relNum];
  if (famChecked && val > 0) {
      let numStr2D = String(relNum).padStart(2, '0');
      let group = FAMILY_GROUPS.find(g => g.includes(numStr2D));
      if (group) targets = group.map(x => parseInt(x, 10));
  }
  targets.forEach(t => setGridValueWithFilters(t, val));
  updateStats();
}

function buildFDGrid() {
  const cols = 10;
  
  document.querySelectorAll('.fd-chip-box input').forEach((chk, idx) => {
     chk.addEventListener('change', (e) => {
         if (e.target.checked) {
             if (idx === 0) currentMasterStart = 1000;
             else if (idx === 1) currentMasterStart = 3000;
             else if (idx === 2) currentMasterStart = 5000;
             
             buildFDRangesSidebar();
             renderFDGridItems();
         } else {
             // If trying to uncheck, check if at least one other is selected
             const totalChecked = document.querySelectorAll('.fd-chip-box input:checked').length;
             if (totalChecked === 0) {
                 e.target.checked = true; // Force at least one
             }
         }
     });
  });

  const hdr = document.getElementById('fdColHdr');
  if (hdr) {
    hdr.innerHTML = '';
    for (let c = 0; c < cols; c++) {
      const h = document.createElement('div'); h.className = 'fd-chdr';
      h.innerHTML = `<input type="text" class="h-col-inp" data-col="${c}" maxlength="3" style="width:100%; height:100%; border:none; background:transparent; text-align:center; color:inherit; outline:none; font-weight:bold; font-size:14px;">`;
      h.querySelector('input').oninput = function() {
        let val = parseInt(this.value) || 0;
        for (let r = 0; r < 10; r++) {
          let n = r * 10 + c;
          handleInputApply(n, val);
        }
        updateStats();
      };
      hdr.appendChild(h);
    }
  }

  buildFDRangesSidebar();
  renderFDGridItems();

  const allMainChk = document.querySelector('.fd-chk-box.all input');
  if (allMainChk) {
    allMainChk.addEventListener('change', (e) => {
       const isChecked = e.target.checked;
       document.querySelectorAll('.fd-r-box input').forEach(c => {
           c.checked = isChecked;
           c.dispatchEvent(new Event('change')); // Trigger change event to update bets
       });
    });
  }

  const qpArea = document.getElementById('fdQtyPts');
  if (qpArea) {
    qpArea.innerHTML = '';
    for (let i = 0; i < 10; i++) {
      const row = document.createElement('div');
      row.className = 'fd-qp-row';
      row.innerHTML = `<div class="fd-qp-c"></div><div class="fd-qp-c"></div>`;
      qpArea.appendChild(row);
    }
  }
}

function buildFDRangesSidebar() {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K'];
  const rSide = document.getElementById('fdRanges');
  if (rSide) {
    rSide.innerHTML = '';
    for (let i = 0; i < 10; i++) {
      const s = currentMasterStart + i * 100;
      const e = s + 99;
      const rowDiv = document.createElement('div');
      rowDiv.className = 'fd-r-box' + (i === currentRangeIndex ? ' on' : '');
      rowDiv.innerHTML = `
        <input type="checkbox" ${i === currentRangeIndex ? 'checked' : ''} />
        <div class="r-txt" style="cursor:pointer;">
          <span>${s}-${e}</span>
          <span>(${letters[i]})</span>
        </div>
      `;
      
      rowDiv.querySelector('.r-txt').onclick = () => {
         document.querySelectorAll('.fd-r-box').forEach(el => el.classList.remove('on'));
         rowDiv.classList.add('on');
         currentRangeIndex = i;
         renderFDGridItems();
      };

      rowDiv.querySelector('input').onchange = (e) => {
         const checked = e.target.checked;
         const startNum = currentMasterStart + i * 100;
         const activeGridStart = currentMasterStart + currentRangeIndex * 100;

         for (let n = 0; n < 100; n++) {
           const targetV = String(startNum + n).padStart(4, '0');
           const masterV = String(activeGridStart + n).padStart(4, '0');
           if (checked && allBets[masterV] > 0) {
               allBets[targetV] = allBets[masterV];
           } else if (!checked) {
               delete allBets[targetV];
           }
         }
         if (currentRangeIndex === i) renderFDGridItems();
         else updateStats();
      };

      rSide.appendChild(rowDiv);
    }
  }
}

function renderFDGridItems() {
  const grid = document.getElementById('fdGrid');
  if (grid) {
    grid.innerHTML = '';
    const activeGridStart = currentMasterStart + currentRangeIndex * 100;
    
    for (let r = 0; r < 10; r++) {
      const bSide = document.createElement('div'); bSide.className = 'fd-row-b';
      bSide.innerHTML = `<input type="text" class="h-row-inp" maxlength="3" style="width:100%; height:100%; border:none; background:transparent; text-align:center; color:inherit; outline:none; font-weight:bold; font-size:14px;">`;
      bSide.querySelector('input').oninput = function() {
          let val = parseInt(this.value) || 0;
          for (let c = 0; c < 10; c++) {
              let n = r * 10 + c;
              handleInputApply(n, val);
          }
          updateStats();
      };
      grid.appendChild(bSide);

      for (let c = 0; c < 10; c++) {
        const relNum = r * 10 + c;
        const num = String(activeGridStart + relNum).padStart(4, '0');
        const el = document.createElement('div');
        el.className = 'fdcell';
        if (allBets[num]) el.classList.add('sel');
        el.setAttribute('data-num', num);
        el.innerHTML = `
          <div class="fd-num-top">${num}</div>
          <div class="fd-cell-bot">
             <input type="text" id="fdinp-${num}" maxlength="3" style="width:100%; height:100%; border:none; background:transparent; text-align:center; color:inherit; font-size:inherit; font-weight:bold; outline:none;" value="${allBets[num] || ''}">
          </div>
        `;
        let inp = el.querySelector('input');
        inp.oninput = function() {
            let val = parseInt(this.value) || 0;
            let isOdd = relNum % 2 !== 0;
            let isEven = relNum % 2 === 0;
            let oddChecked = document.getElementById('chkOdd') ? document.getElementById('chkOdd').checked : false;
            let evenChecked = document.getElementById('chkEven') ? document.getElementById('chkEven').checked : false;

            if (val > 0 && ((evenChecked && !isEven) || (oddChecked && !isOdd))) {
                val = 0; // Block input if filters are active and don't match
                this.value = ''; // Clear the input field
            }

            handleInputApply(relNum, val);
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
    }
  }
  document.querySelectorAll('.h-col-inp, .h-row-inp').forEach(inp => inp.value = '');
  updateStats();
}

function updateStats() {
  let totalQty = 0;
  let totalPts = 0;

  // Track row-wise stats for the sidebar
  let rangeQty = new Array(10).fill(0);
  let rangePts = new Array(10).fill(0);

  for (let num in allBets) {
      let val = allBets[num];
      if (val > 0) {
          totalQty += 1;
          totalPts += val;
          
          let absNum = parseInt(num);
          let mStart = Math.floor(absNum / 1000) * 1000;
          if (mStart === currentMasterStart) {
              let relInsideMaster = absNum - mStart;
              let rIdx = Math.floor(relInsideMaster / 100);
              if (rIdx >= 0 && rIdx < 10) {
                  rangeQty[rIdx] += 1;
                  rangePts[rIdx] += val;
              }
          }
      }
  }

  const qpEntries = document.querySelectorAll('.fd-qp-row');
  qpEntries.forEach((row, i) => {
      const cells = row.querySelectorAll('.fd-qp-c');
      if (cells.length === 2) {
          cells[0].textContent = rangeQty[i] || '';
          cells[1].textContent = rangePts[i] || '';
      }
  });

  const s4s = document.getElementById('statSpots4D');
  const s4p = document.getElementById('statPrize4D');
  if (s4s) s4s.textContent = totalQty; 
  if (s4p) s4p.textContent = totalPts;
  
  const spotsEl = document.getElementById('statSpots');
  const prizeEl = document.getElementById('statPrize');
  const totalPtsEl = document.querySelector('.main-stats .bb-stat-pod:nth-of-type(2) .bstat:nth-of-type(2) .bval');

  if (spotsEl) spotsEl.textContent = totalQty; 
  if (prizeEl) prizeEl.textContent = totalPts;
  if (totalPtsEl) totalPtsEl.textContent = totalPts;
}

function clearSelections() {
  allBets = {};
  renderFDGridItems();
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
  const elements = document.querySelectorAll('.fdcell, .fd-rlbl, .h-wnum, .nav-tab, .sb-btn, .sb-random');

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

  document.querySelectorAll('.fdcell').forEach(el => { el.style.fontSize = clamp(11 * s, 9, 20) + 'px'; });
  document.querySelectorAll('.fd-rlbl').forEach(el => { el.style.fontSize = clamp(9 * s, 7, 14) + 'px'; });
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

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('body-4D');

  const powerBtn = document.querySelector('.power-btn');
  if (powerBtn) {
    powerBtn.onclick = () => {
      sessionStorage.removeItem('user');
      window.location.href = '../index.html';
    };
  }

  const getBalance = async () => {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    try {
      const res = await API.balance(user.username, null, '4D');
      if (res && res.success && res.data) {
        const limitVal = document.getElementById('hdrLimitValue');
        if (limitVal) limitVal.textContent = res.data.balance;
      }
    } catch (e) { console.error('Balance error:', e); }
  };

  getBalance();
  setInterval(getBalance, 5000);

  buildSidebar(config.btns);
  buildFDGrid();
  updateClock();
  scaleFonts();
  applyMobileScale();
  setInterval(updateClock, 1000);
  setInterval(updateCountdowns, 1000);
});
