const sel = { '3D': new Set() };
let currentPage = '3D';
let countdown2 = 761;

function switchPage(p) {
  if (p === 'G') window.location.href = '../G/index.html';
  else if (p !== '3D') window.location.href = '../' + p + '/index.html';
}

async function buildResults() {
  const resContainer = document.getElementById('s3Results');
  if (!resContainer) return;

  try {
    const today = new Date().toISOString().split('T')[0];
    const data = await window.API.resultDateWise(today);

    if (data && data.status && data.results) {
      resContainer.innerHTML = '';
      
      const rows = { 'A': [], 'B': [], 'C': [] };
      data.results.forEach(item => {
        const fullResult = item.result; // e.g. "A134, B060, C532"
        const parts = fullResult.split(',');

        parts.forEach(p => {
          const trimmed = p.trim();
          const prefix = trimmed.charAt(0);
          if (rows[prefix]) {
            rows[prefix].push({ time: item.time, code: trimmed });
          }
        });
      });

      ['C', 'B', 'A'].forEach(p => {
        const rowData = rows[p];
        if (rowData.length === 0) return;

        const rowEl = document.createElement('div');
        rowEl.className = 's3-res-row';
        
        // Show last 10 for each row
        rowData.slice(0, 10).forEach(item => {
          const box = document.createElement('div');
          box.className = 's3-res-box';
          box.innerHTML = `<div class="s3-res-time">${item.time}</div><div class="s3-res-code">${item.code}</div>`;
          rowEl.appendChild(box);
        });
        resContainer.appendChild(rowEl);
      });
    }
  } catch (err) {
    console.error('Build Results Error:', err);
  }
}

setInterval(buildResults, 10000);

function buildS3Digits() {
  const row = document.getElementById('s3Digits');
  const allCbx = document.getElementById('allDigitsCbx');
  if (!row) return;
  row.innerHTML = '';

  [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(n => {
    const d = document.createElement('div');
    d.className = 's3-dgt'; d.textContent = n;
    d.dataset.num = n;
    d.onclick = () => {
      d.classList.toggle('sel');
      const k = String(n);
      if (sel['3D'].has(k)) sel['3D'].delete(k); else sel['3D'].add(k);

      if (allCbx) {
        allCbx.checked = (sel['3D'].size === 10);
      }
    };
    row.appendChild(d);
  });

  if (allCbx) {
    allCbx.addEventListener('change', () => {
      sel['3D'].clear();
      const digits = document.querySelectorAll('.s3-dgt');
      if (allCbx.checked) {
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(n => sel['3D'].add(String(n)));
        digits.forEach(d => d.classList.add('sel'));
      } else {
        digits.forEach(d => d.classList.remove('sel'));
      }
    });
  }

  buildResults(); 
}

function updateStats() {
  const n = sel['3D'].size;
  const s3s = document.getElementById('s3statSpots');
  const s3p = document.getElementById('s3statPrize');
  if (s3s) s3s.textContent = n;
  if (s3p) s3p.textContent = n * 10;
}

function clearSelections() {
  sel['3D'].clear();
  document.querySelectorAll('.s3-dgt.sel').forEach(e => e.classList.remove('sel'));
  const output = document.getElementById('output');
  if (output) output.innerHTML = '';

  // Reset Top Row Checkboxes (Ind: checked, others: unchecked)
  const indCbx = document.getElementById('indCbx');
  const multiCbx = document.getElementById('multiCbx');
  const allCbxTop = document.getElementById('allCbxTop');
  if (indCbx) indCbx.checked = true;
  if (multiCbx) multiCbx.checked = false;
  if (allCbxTop) allCbxTop.checked = false;

  // Reset Group Checkboxes (A: checked, B/C: unchecked)
  const cbxA = document.getElementById('cbxA');
  const cbxB = document.getElementById('cbxB');
  const cbxC = document.getElementById('cbxC');
  if (cbxA) cbxA.checked = true;
  if (cbxB) cbxB.checked = false;
  if (cbxC) cbxC.checked = false;

  // Reset Bet Types (Box: active, Others: inactive)
  document.querySelectorAll('.s3-tbtn').forEach(btn => {
    const label = btn.querySelector('.s3-tbtn-bot').textContent.trim();
    const iconBox = btn.querySelector('.tbtn-check, .tbtn-box');
    if (label === 'Box') {
      btn.classList.add('active');
      if (iconBox) { iconBox.className = 'tbtn-check'; iconBox.textContent = '✓'; }
    } else {
      btn.classList.remove('active');
      if (iconBox) { iconBox.className = 'tbtn-box'; iconBox.textContent = ''; }
    }
  });

  updateStats();
}

function updateClock() {
  const n = new Date();
  const pad = x => String(x).padStart(2, '0');
  const dt = document.getElementById('navDatetime');
  if (dt) dt.textContent = `${n.getDate()}/${n.getMonth() + 1}/${n.getFullYear()} | ${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  let h = n.getHours(), ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
  const tm = `${h}:${pad(n.getMinutes())} ${ap}`;
  const s3t = document.getElementById('s3Time'); if (s3t) s3t.textContent = tm;
}

function updateCountdowns() {
  const box2 = document.getElementById('s3Countdown');
  if (box2) {
    countdown2 = Math.max(0, countdown2 - 1); if (countdown2 === 0) countdown2 = 999;
    box2.textContent = String(Math.floor(countdown2 / 60)).padStart(2, '0') + ':' + String(countdown2 % 60).padStart(2, '0');
  }
}

async function showReprintModal(isReprint = true, selectedDate = null) {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return;
  const user = JSON.parse(userStr);

  const today = new Date().toISOString().split("T")[0];
  const dateToFetch = selectedDate || today;

  let tableRows = "";

  try {
    const response = await window.API.betHistory(user.username, dateToFetch);
    const tickets = response.tickets || response.data || [];
    const recordDate = response.record_date || dateToFetch;

    if (response.status && tickets.length > 0) {
      tickets.forEach((item, index) => {
        tableRows += `
          <tr style="background:#222; color: #ddd;">
            <td style="padding:10px; border-bottom:1px solid #444;">${index + 1}</td>
            <td style="padding:10px; border-bottom:1px solid #444;">${item.barcode}</td>
            <td style="padding:10px; border-bottom:1px solid #444;">${item.draw_times}</td>
            <td style="padding:10px; border-bottom:1px solid #444;">${item.amount}</td>
            <td style="padding:10px; border-bottom:1px solid #444;">${item.qty || '0'}</td>
            <td style="padding:10px; border-bottom:1px solid #444;">${recordDate}</td>
            ${isReprint ? `
              <td style="padding:10px; border-bottom:1px solid #444;">
                <button class="nav-tab active" onclick="confirmReprint('${item.barcode}')" style="width:auto; padding:5px 15px; margin:0; font-size:12px;">REPRINT</button>
              </td>
            ` : ''}
          </tr>
        `;
      });
    } else {
      tableRows = `<tr><td colspan="${isReprint ? 7 : 6}" style="padding:20px; text-align:center; color:#666;">No bets found for ${recordDate}.</td></tr>`;
    }
  } catch (error) {
    console.error("Bet History Error:", error);
    tableRows = `<tr><td colspan="${isReprint ? 7 : 6}" style="padding:20px; text-align:center; color:red;">Failed to load history.</td></tr>`;
  }

  // Check if modal already exists to just update it
  let modal = document.querySelector(".reprint-modal-overlay");
  if (modal) {
    modal.querySelector(".history-table tbody").innerHTML = tableRows;
    return;
  }

  modal = document.createElement("div");
  modal.className = "modal-overlay reprint-modal-overlay";
  modal.style.display = "flex";

  modal.innerHTML = `
    <div class="modal-content history-modal" style="width:900px; max-width:95%;">
      <div class="modal-header">
        <div style="display:flex; align-items:center; gap:15px; flex:1;">
          <h2 style="margin:0; font-size:20px;">${isReprint ? 'REPRINT TICKET' : 'BET HISTORY'}</h2>
          <input type="date" id="historyDateInput" value="${dateToFetch}" 
                 style="padding:5px 10px; border-radius:4px; border:1px solid #444; background:#000; color:#0f0;"
                 onchange="showReprintModal(${isReprint}, this.value)">
          ${isReprint ? `
            <div style="display:flex; align-items:center; gap:5px; margin-left:10px; flex:1;">
              <input type="text" id="barcodeSearch" placeholder="ENTER BARCODE..." style="flex:1; padding:6px 12px; border-radius:4px; border:1px solid #444; background:#000; color:#0f0; font-size:14px; outline:none;" />
              <button class="nav-tab active" onclick="confirmReprint(document.getElementById('barcodeSearch').value)" style="width:auto; padding:6px 15px; margin:0;">PRINT</button>
            </div>
          ` : ''}
        </div>
        <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      </div>
      <div class="modal-body" style="max-height: 500px; overflow-y: auto;">
        <table class="history-table" style="width:100%; border-collapse:collapse; color:#ddd; font-size:13px;">
          <thead>
            <tr style="background:#333; color:#f1ce07; text-align:left;">
              <th style="padding:10px; border-bottom:1px solid #444;">Sr.No</th>
              <th style="padding:10px; border-bottom:1px solid #444;">Barcode</th>
              <th style="padding:10px; border-bottom:1px solid #444;">Draw Time</th>
              <th style="padding:10px; border-bottom:1px solid #444;">Amount</th>
              <th style="padding:10px; border-bottom:1px solid #444;">Qty</th>
              <th style="padding:10px; border-bottom:1px solid #444;">Date</th>
              ${isReprint ? '<th style="padding:10px; border-bottom:1px solid #444;">Action</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function confirmReprint(barcode) {
  if (!barcode) return alert('Please enter barcode');
  showStatusModal("SUCCESS", "Ticket " + barcode + " reprinted successfully!", "success");
}

function openReprintModal() { showReprintModal(true); }
function openBetHistoryModal() { showReprintModal(false); }

document.addEventListener('keydown', e => {
  if (e.key === 'F11') {
    e.preventDefault();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }
  if (e.key === 'F7') {
    e.preventDefault();
    const pb = document.getElementById('playBtn');
    if (pb) pb.click();
  }
  if (e.key === 'F2') {
    e.preventDefault();
    openReprintModal();
  }
  if (e.key === 'F10') {
    e.preventDefault();
    openCancelModal();
  }
  if (e.key === 'i' || e.key === 'I') {
    e.preventDefault();
    openBetHistoryModal();
  }
  if (e.key === 'Escape') clearSelections();
});

const DESIGN_W = 1366;
const DESIGN_H = 768;

function applyMobileScale() {
  const wrapper = document.querySelector('.app-wrapper');
  if (!wrapper) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isFullscreen = !!document.fullscreenElement;
  const isPortrait = vh > vw;
  const isMobileW = vw <= 600;
  const needsScale = isFullscreen || (isPortrait && isMobileW);

  if (needsScale) {
    const scaleByW = vw / DESIGN_W;
    const scaleByH = vh / DESIGN_H;
    const scale = Math.min(scaleByW, scaleByH);

    const scaledW = DESIGN_W * scale;
    const scaledH = DESIGN_H * scale;
    const offsetX = (vw - scaledW) / 2;
    const offsetY = (vh - scaledH) / 2;

    wrapper.style.width = DESIGN_W + 'px';
    wrapper.style.height = DESIGN_H + 'px';
    wrapper.style.transformOrigin = 'top left';
    wrapper.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    wrapper.style.position = 'absolute';
    wrapper.style.top = '0';
    wrapper.style.left = '0';

    document.body.style.height = vh + 'px';
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
document.addEventListener('fullscreenchange', applyMobileScale);

document.addEventListener('DOMContentLoaded', () => {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) {
    alert('Session expired. Please login again.');
    window.location.href = '../index.html';
    return;
  }
  
  document.body.classList.add('body-3D');

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

    // Update ID display
    const idEl = document.querySelector('.s3-id-box span');
    if (idEl) idEl.textContent = user.username;

    try {
      const res = await API.balance(user.username, null, '3D');
      if (res && res.success && res.data) {
        const limitVal = document.getElementById('s3LimitVal');
        if (limitVal) limitVal.textContent = res.data.balance;
      }
    } catch (e) { console.error('Balance error:', e); }
  };

  getBalance();
  setInterval(getBalance, 5000);

  buildS3Digits();
  updateClock();
  applyMobileScale();
  setInterval(updateClock, 1000);
  setInterval(updateCountdowns, 1000);

  // New Logic for Add Number, Range, Groups, and Random Pick
  setupBetTypes();
  setupAddNumber();
  setupGroups();
  setupRandomPick();
});

function setupRandomPick() {
  const btn = document.getElementById('randomPickBtn');
  if (btn) {
    btn.onclick = () => {
      // Pick a random quantity of tickets (1 to 10)
      const qty = Math.floor(Math.random() * 10) + 1;
      for (let i = 0; i < qty; i++) {
        let num = "";
        if (sel['3D'].size > 0) {
          const digits = Array.from(sel['3D']);
          for (let j = 0; j < 3; j++) {
            num += digits[Math.floor(Math.random() * digits.length)];
          }
        } else {
          num = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        }
        generateFromInput(num);
      }
    };
  }
}

function setupGroups() {
  const indCbx = document.getElementById('indCbx');
  const multiCbx = document.getElementById('multiCbx');
  const allCbxTop = document.getElementById('allCbxTop');
  const cbxA = document.getElementById('cbxA');
  const cbxB = document.getElementById('cbxB');
  const cbxC = document.getElementById('cbxC');
  const bots = [cbxA, cbxB, cbxC];

  // Logic for Ind. / Multi. / All. (Top Row)
  const setTop = (selected) => {
    indCbx.checked = (selected === 'ind');
    multiCbx.checked = (selected === 'multi');
    allCbxTop.checked = (selected === 'all');
  };

  indCbx.addEventListener('change', () => {
    if (indCbx.checked) {
      setTop('ind');
      // Ensure only one bottom is checked
      let first = true;
      bots.forEach(cb => {
        if (first && cb.checked) first = false;
        else cb.checked = false;
      });
      if (first && cbxA) cbxA.checked = true;
    } else {
      indCbx.checked = true; // Prevent unchecking if it's already active
    }
  });

  multiCbx.addEventListener('change', () => {
    if (multiCbx.checked) setTop('multi');
    else multiCbx.checked = true;
  });

  allCbxTop.addEventListener('change', () => {
    if (allCbxTop.checked) {
      setTop('all');
      bots.forEach(cb => cb.checked = true);
    } else {
      allCbxTop.checked = true;
    }
  });

  // Logic for A / B / C (Bottom Row)
  bots.forEach((cb, idx) => {
    cb.addEventListener('change', () => {
      if (indCbx.checked) {
        // Radio button behavior
        bots.forEach(other => { if (other !== cb) other.checked = false; });
        if (!cb.checked) cb.checked = true; // Keep at least one checked
      } else {
        // Multi or All mode behavior
        const checkedCount = bots.filter(c => c.checked).length;
        if (checkedCount === 0) {
          cb.checked = true; // Keep at least one checked
        } else if (checkedCount === 3) {
          setTop('all');
        } else {
          setTop('multi');
        }
      }
    });
  });
}

function setupBetTypes() {
  document.querySelectorAll('.s3-tbtn').forEach(btn => {
    btn.onclick = () => {
      const activeBtns = document.querySelectorAll('.s3-tbtn.active');
      
      // If clicking an active button AND it's the only one active, don't allow unselecting
      if (btn.classList.contains('active') && activeBtns.length <= 1) {
        return; 
      }

      btn.classList.toggle('active');
      const iconBox = btn.querySelector('.tbtn-check, .tbtn-box');
      if (btn.classList.contains('active')) {
        if (iconBox) { iconBox.className = 'tbtn-check'; iconBox.textContent = '✓'; }
      } else {
        if (iconBox) { iconBox.className = 'tbtn-box'; iconBox.textContent = ''; }
      }
    };
  });
}

function getSelectedBetTypes() {
  const types = [];
  document.querySelectorAll('.s3-tbtn.active').forEach(btn => {
    types.push(btn.querySelector('.s3-tbtn-bot').textContent.trim());
  });
  return types;
}

function getSelectedGroups() {
  const groups = [];
  document.querySelectorAll('.s3-row-bot .s3-cbx input:checked').forEach(cb => {
    const labelText = cb.nextElementSibling ? cb.nextElementSibling.textContent.trim() : '';
    if (labelText) groups.push(labelText);
  });
  return groups.length ? groups : ['A'];
}

function addCard(num, betType, rate = 10, fromGrid = false) {
  const container = document.getElementById('output');
  if (!container) return;
  const groups = getSelectedGroups();

  groups.forEach(group => {
    const card = document.createElement('div');
    card.className = 'ticket' + (fromGrid ? ' from-grid' : '');
    card.dataset.num = num;
    card.dataset.group = group;
    card.dataset.type = betType;
    card.style = "background: #fff; color: #000; padding: 6px; border-radius: 4px; width: 63px; height: 100px; text-align: center; border: 2px solid #000; font-size: 13px; position: relative; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 2px 2px 5px rgba(0,0,0,0.3);";
    card.innerHTML = `
      <div class="fullCode" style="display:none">${group}${num}</div>
      <div style="font-weight: 800; font-size: 18px; margin-bottom: 2px;">${num}</div>
      <div style="font-size: 11px; font-weight: bold; color: #333; line-height: 1;">${group}</div>
      <div style="font-size: 10px; color: #666; margin-bottom: 4px;">${betType}</div>
      <div style="font-weight: 800; color: #d32f2f; border-top: 1px solid #ccc; width: 100%; pt-1;">${rate}</div>
      <div class="remove" style="position: absolute; top: -8px; right: -8px; background: #f44336; color: white; width: 22px; height: 22px; border-radius: 50%; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; border: 1.5px solid #000; font-weight: bold;">X</div>
    `;
    card.querySelector('.remove').onclick = () => {
      card.remove();
      updateStats();
    };
    container.appendChild(card);
    // Auto-scroll to bottom so new tickets are always visible
    if (container.parentElement) {
      container.parentElement.scrollTop = container.parentElement.scrollHeight;
    }
  });
  updateStats();
}

function generateFromInput(baseNum, fromGrid = false) {
  // Check grid filter first (only if something is selected on grid)
  if (!fromGrid && !isValidForGrid(baseNum)) return;

  const betTypes = getSelectedBetTypes();
  const rate = 10;
  betTypes.forEach(type => {
    let displayNum = baseNum;
    if (type === "FP") displayNum = baseNum.slice(0, 2);
    else if (type === "BP") displayNum = baseNum.slice(1);
    else if (type === "SP") displayNum = baseNum[0] + baseNum[2];
    else if (type === "AP") displayNum = baseNum.slice(0, 2);

    if (["Box", "Straight"].includes(type) && baseNum.length !== 3) return;

    addCard(displayNum, type, rate, fromGrid);
  });
}

function generateFromTwoDigits(baseNum) {
  // Check grid filter first
  if (!isValidForGrid(baseNum)) return;

  const betTypes = getSelectedBetTypes();
  const rate = 10;
  betTypes.forEach(type => {
    if (['FP', 'BP', 'SP', 'AP'].includes(type)) {
      addCard(baseNum, type, rate, false);
    }
  });
}

// Ensure manual input listener is clean
function setupAddNumber() {
  const addNumInput = document.getElementById('addNumberInput');
  const rangeFromInput = document.getElementById('rangeFrom');
  const rangeToInput = document.getElementById('rangeTo');

  if (addNumInput) {
    addNumInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.length === 3 && /^\d{3}$/.test(val)) {
        generateFromInput(val);
        e.target.value = '';
      } else if (val.length === 2 && /^\d{2}$/.test(val)) {
        const types = getSelectedBetTypes();
        const hasBox = types.includes('Box');
        const hasStr = types.includes('Straight');
        if (!hasBox && !hasStr && types.length > 0) {
          generateFromTwoDigits(val);
          e.target.value = '';
        }
      }
    });
  }

  [rangeFromInput, rangeToInput].forEach(el => {
    if (!el) return;
    el.addEventListener('input', () => {
      const fVal = rangeFromInput.value;
      const tVal = rangeToInput.value;
      if (!fVal || !tVal) return;
      if ((fVal.length === 2 && tVal.length === 2) || (fVal.length === 3 && tVal.length === 3)) {
        const fromInt = parseInt(fVal, 10);
        const toInt = parseInt(tVal, 10);
        if (isNaN(fromInt) || isNaN(toInt) || fromInt > toInt) return;
        const width = Math.max(fVal.length, tVal.length);

        if (sel['3D'].size > 0) {
          let combinations = generateAllGridPossible(width);
          combinations.forEach(num => {
            const nInt = parseInt(num, 10);
            if (nInt >= fromInt && nInt <= toInt) {
              if (width === 3) generateFromInput(num);
              else generateFromTwoDigits(num);
            }
          });
        } else {
          for (let i = fromInt; i <= toInt; i++) {
            const num = String(i).padStart(width, '0');
            if (width === 3) generateFromInput(num);
            else generateFromTwoDigits(num);
          }
        }
        rangeFromInput.value = '';
        rangeToInput.value = '';
      }
    });
  });
}

// Utility to check if a number matches selected digits
function isValidForGrid(numStr) {
  if (sel['3D'].size === 0) return true; // No filter if none selected
  for (let char of numStr) {
    if (!sel['3D'].has(char)) return false;
  }
  return true;
}

// Generates all possible strings of length 'len' using selected digits
function generateAllGridPossible(len) {
  const digits = Array.from(sel['3D']);
  let results = [];

  function backtrack(current) {
    if (current.length === len) { results.push(current); return; }
    for (let d of digits) {
      backtrack(current + d);
    }
  }

  backtrack("");
  return results;
}

function triggerGridGeneration() {
  // Clear only tickets generated by the grid
  document.querySelectorAll('#output .ticket.from-grid').forEach(t => t.remove());

  const digits = Array.from(sel['3D']).sort();
  if (digits.length < 1) {
    updateStats();
    return;
  }

  let results = [];
  if (digits.length >= 3) {
    getCombinations(digits, 3).forEach(c => results.push(...getPermutations(c)));
  } else if (digits.length === 2) {
    let [a, b] = digits;
    results.push(a + a + b, a + b + a, b + a + a);
    results.push(b + b + a, b + a + b, a + b + b);
  } else if (digits.length === 1) {
    results.push(digits[0] + digits[0] + digits[0]);
  }

  if (digits.length >= 2) {
    digits.forEach(d => {
      digits.forEach(e => {
        if (d !== e) results.push(d + d + e, d + e + d, e + d + d);
      });
    });
  }
  digits.forEach(d => results.push(d + d + d));

  results = [...new Set(results)].sort();
  results.forEach(num => generateFromInput(num, true));
}

// Helpers for Digit Generation
function getCombinations(arr, k) {
  let result = [];
  function helper(start, combo) {
    if (combo.length === k) { result.push(combo.slice()); return; }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }
  helper(0, []);
  return result;
}

function getPermutations(arr) {
  let result = [];
  function permute(path, options) {
    if (options.length === 0) { result.push(path.join("")); return; }
    for (let i = 0; i < options.length; i++) {
      permute([...path, options[i]], options.slice(0, i).concat(options.slice(i + 1)));
    }
  }
  permute([], arr);
  return result;
}

function generateFromInput(baseNum, fromGrid = false) {
  const betTypes = getSelectedBetTypes();
  const rate = 10;
  betTypes.forEach(type => {
    let displayNum = baseNum;
    if (type === "FP") displayNum = baseNum.slice(0, 2);
    else if (type === "BP") displayNum = baseNum.slice(1);
    else if (type === "SP") displayNum = baseNum[0] + baseNum[2];
    else if (type === "AP") displayNum = baseNum.slice(0, 2);

    // Safety check: Box/Straight require 3 digits
    if (["Box", "Straight"].includes(type) && baseNum.length !== 3) return;

    addCard(displayNum, type, rate, fromGrid);
  });
}

function generateFromTwoDigits(baseNum) {
  const betTypes = getSelectedBetTypes();
  const rate = 10;
  betTypes.forEach(type => {
    // Only 2-digit types are valid for 2-digit input
    if (['FP', 'BP', 'SP', 'AP'].includes(type)) {
      addCard(baseNum, type, rate, false); // Manual 2-digit entry
    }
  });
}

// Update updateStats to include tickets
function updateStats() {
  const n = sel['3D'].size;
  const tickets = document.querySelectorAll('#output .ticket').length;
  const s3s = document.getElementById('s3statSpots');
  const s3p = document.getElementById('s3statPrize');
  const points = document.querySelectorAll('.s3-stat-item .s3-bval')[3]; // Total Points

  const drawCount = selectedAdvanceDraws.size > 0 ? selectedAdvanceDraws.size : 1;
  const totalTickets = n + tickets;
  const finalAmount = totalTickets * 10 * drawCount;

  if (s3s) s3s.textContent = totalTickets * drawCount;
  if (s3p) s3p.textContent = finalAmount;
  if (points) points.textContent = finalAmount;
}

// Modal Control Functions
let selectedAdvanceDraws = new Set();

async function openAdvanceModal() {
  const modal = document.getElementById('advanceModal');
  const grid = document.getElementById('advanceDrawGrid');
  if (!modal || !grid) return;

  grid.innerHTML = '<p style="text-align:center; color:#f1ce07;">Loading draws...</p>';
  modal.style.display = 'flex';

  try {
    const res = await window.API.advancDrawTime();
    if (res && res.status && res.slots) {
      grid.innerHTML = '';
      res.slots.forEach((time, index) => {
        const isChecked = selectedAdvanceDraws.has(time);
        const item = document.createElement('div');
        item.className = 'draw-checkbox-item' + (isChecked ? ' selected' : '');
        item.style = "display: flex; align-items: center; gap: 8px; padding: 12px; background: #2a1a4a; border: 2px solid #4a3a6a; border-radius: 8px; cursor: pointer; transition: all 0.3s; color: white;";
        item.innerHTML = `
          <input type="checkbox" ${isChecked ? 'checked' : ''} class="draw-checkbox" style="width:18px; height:18px; cursor:pointer;">
          <span class="draw-time-label" style="font-size:14px; font-weight:600;">${time}</span>
        `;
        item.onclick = (e) => {
          const cb = item.querySelector('.draw-checkbox');
          if (e.target !== cb) cb.checked = !cb.checked;
          
          if (cb.checked) {
            selectedAdvanceDraws.add(time);
            item.classList.add('selected');
            item.style.background = "#5a4a7a";
          } else {
            selectedAdvanceDraws.delete(time);
            item.classList.remove('selected');
            item.style.background = "#2a1a4a";
          }
          const countEl = document.getElementById('selectedDrawCount');
          if (countEl) countEl.textContent = selectedAdvanceDraws.size;
          updateStats();
        };
        grid.appendChild(item);
      });
      const countEl = document.getElementById('selectedDrawCount');
      if (countEl) countEl.textContent = selectedAdvanceDraws.size;
    } else {
      grid.innerHTML = '<p style="text-align:center; color:#aaa;">No advance draws available.</p>';
    }
  } catch (err) {
    grid.innerHTML = '<p style="text-align:center; color:red;">Error loading draws.</p>';
  }
}

function confirmAdvanceDraw() {
  closeAdvanceModal();
}

function closeAdvanceModal() { document.getElementById('advanceModal').style.display = 'none'; }

async function openCancelModal() {
  const modal = document.getElementById('cancelBetModal');
  const tbody = modal.querySelector('.history-table tbody');
  if (!modal || !tbody) return;

  const userStr = sessionStorage.getItem('user');
  if (!userStr) return;
  const user = JSON.parse(userStr);

  modal.style.display = 'flex';
  tbody.innerHTML = '<tr><td colspan="5" style="padding:20px; text-align:center; color:#f1ce07;">Loading bets...</td></tr>';

  try {
    const res = await window.API.currentDrawBetHistory(user.username);
    const tickets = res.tickets || res.data || [];

    if (res.status && tickets.length > 0) {
      tbody.innerHTML = '';
      tickets.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="padding:10px; border-bottom:1px solid #444;">${index + 1}</td>
          <td style="padding:10px; border-bottom:1px solid #444;">${item.barcode}</td>
          <td style="padding:10px; border-bottom:1px solid #444;">${item.draw_times}</td>
          <td style="padding:10px; border-bottom:1px solid #444;">${item.amount}</td>
          <td style="padding:10px; border-bottom:1px solid #444;">
            <button class="nav-tab active" onclick="cancelTicketById(${item.id})" style="width:auto; padding:5px 15px; margin:0; font-size:12px;">CANCEL</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = '<tr><td colspan="5" style="padding:20px; text-align:center; color:#666;">No recent bets found for the current draw.</td></tr>';
    }
  } catch (err) {
    console.error("Fetch Current Bet History Error:", err);
    tbody.innerHTML = '<tr><td colspan="5" style="padding:20px; text-align:center; color:red;">Failed to load bets.</td></tr>';
  }
}

function showStatusModal(title, message, type) {
  const modal = document.createElement("div");
  modal.className = "status-modal-overlay";
  modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:10000; font-family: sans-serif;";
  
  const icon = type === "success" ? "✓" : "✕";
  const iconColor = type === "success" ? "#4caf50" : "#f44336";
  
  modal.innerHTML = `
    <div style="background:#1a1a1a; width:350px; border-radius:12px; overflow:hidden; border:1px solid #333; box-shadow:0 10px 30px rgba(0,0,0,0.5); text-align:center;">
      <div style="padding:30px 20px; background:${type === 'success' ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)'};">
        <div style="font-size:60px; color:${iconColor}; margin-bottom:15px; font-weight:bold;">${icon}</div>
        <div style="font-size:22px; color:#fff; font-weight:bold; margin-bottom:10px; text-transform:uppercase;">${title}</div>
        <div style="font-size:14px; color:#aaa; line-height:1.5;">${message}</div>
      </div>
      <div style="padding:20px; border-top:1px solid #333;">
        <button style="background:${iconColor}; color:#fff; border:none; padding:12px 40px; border-radius:6px; cursor:pointer; font-weight:bold; width:100%; font-size:16px;" onclick="this.closest('.status-modal-overlay').remove()">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function cancelTicketById(id) {
  if (!confirm('Are you sure you want to cancel this ticket?')) return;

  try {
    const res = await window.API.ticketCancel(id);
    if (res && res.status) {
      showStatusModal("SUCCESS", res.message || 'Ticket cancelled successfully!', "success");
      openCancelModal(); // Refresh the list
      
      // Update balance
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        const balRes = await window.API.balance(u.username, null, '3D');
        if (balRes && balRes.success && balRes.data) {
          const limitVal = document.getElementById('s3LimitVal');
          if (limitVal) limitVal.textContent = balRes.data.balance;
        }
      }
    } else {
      showStatusModal("FAILED", res.message || 'Failed to cancel ticket.', "error");
    }
  } catch (err) {
    console.error("Cancel Ticket Error:", err);
    showStatusModal("ERROR", 'Connection error. Please try again.', "error");
  }
}

function closeCancelModal() { document.getElementById('cancelBetModal').style.display = 'none'; }

function openPlayModal() {
  const points = document.querySelectorAll('.s3-stat-item .s3-bval')[3]?.textContent || '0';
  const confirmPts = document.getElementById('confirmTotalPoints');
  if (confirmPts) confirmPts.textContent = points;
  document.getElementById('playModal').style.display = 'flex';
}
function closePlayModal() { document.getElementById('playModal').style.display = 'none'; }

async function confirmPlay() {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return;
  const user = JSON.parse(userStr);

  const tickets = document.querySelectorAll('#output .ticket');
  if (tickets.length === 0) {
    showStatusModal("EMPTY BET", "Please select at least one spot.", "error");
    return;
  }

  const typeMap = {
    'Box': 'BON',
    'Straight': 'STN',
    'FP': 'FPN',
    'BP': 'BPN',
    'SP': 'SPN',
    'AP': 'APN'
  };

  let all_datas12 = [];
  let totalAmount = 0;

  tickets.forEach(t => {
    const num = t.dataset.num;
    const group = t.dataset.group;
    const type = t.dataset.type;
    const prefix = typeMap[type] || 'STN';
    const rate = 10; 
    
    all_datas12.push(`${prefix}${group}${num}X${rate}`);
    totalAmount += rate;
  });

  const payload = {
    username: user.username,
    all_datas12: all_datas12.join(','),
    total_load_c_amount: totalAmount,
    total_load_c_qty: 0,
    advancr_draw_time: selectedAdvanceDraws.size > 0 ? Array.from(selectedAdvanceDraws) : ""
  };

  try {
    const res = await window.API.insertData(payload);
    if (res && res.status) {
      showStatusModal("SUCCESS", res.message || 'Game placed successfully!', "success");
      closePlayModal();
      clearSelections();
      selectedAdvanceDraws.clear(); // Reset advance draws
      
      // Refresh balance
      const balRes = await window.API.balance(user.username, null, '3D');
      if (balRes && balRes.success && balRes.data) {
        const limitVal = document.getElementById('s3LimitVal');
        if (limitVal) limitVal.textContent = balRes.data.balance;
      }
    } else {
      showStatusModal("FAILED", res.message || 'Failed to place game.', "error");
    }
  } catch (err) {
    console.error('Play Error:', err);
    showStatusModal("ERROR", 'Connection error. Please try again.', "error");
  }
}
