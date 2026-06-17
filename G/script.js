const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
let currentPage = 'G';
let countdown1 = 600;
let advanceTimeVal = [];

const sel = { G: new Set() };
let allBets = {};

const config = {
  gamename: 'Green Win Game', ver: 'V-4.0.0.0',
  btns: [
    { t: 'Cancel(F10)', c: '' }, { t: 'Reprint(F2)', c: '' },
    { t: 'Advance', c: '' }, { t: 'INFO (I)', c: 'red' },
    'SP', { t: 'RandomPick', c: 'rand' }, { t: 'fam' }, { t: 'V-4.0.0.0', c: 'ver' }
  ]
};

function showGlobalCustomAlert(msg, type = 'loading') {
  let existing = document.getElementById('globalCustomAlert');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'globalCustomAlert';
  overlay.className = 'custom-alert-overlay';
  
  let botHtml = `<div class="custom-alert-bot"></div>`;

  overlay.innerHTML = `
      <div class="custom-alert-box">
          <div class="custom-alert-top">ALERT</div>
          <div class="custom-alert-msg">${msg}</div>
          ${botHtml}
      </div>
  `;
  document.body.appendChild(overlay);
}

function showStatusModal(title, message, type) {
  let existing = document.getElementById('globalCustomAlert');
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = 'globalCustomAlert';
  modal.className = "custom-alert-overlay";
  
  modal.innerHTML = `
      <div class="custom-alert-box">
          <div class="custom-alert-top">${title}</div>
          <div class="custom-alert-msg">${message}</div>
          <div class="custom-alert-bot">
              <button class="custom-alert-btn" onclick="this.closest('.custom-alert-overlay').remove()">OK</button>
          </div>
      </div>
  `;
  document.body.appendChild(modal);
}

function switchPage(p) {
  if (p === 'G') return;
  showGlobalCustomAlert('Loading ...!');
  setTimeout(() => {
    window.location.href = '../' + p + '/index.html';
  }, 300);
}

function buildSidebar(btns) {
  const sb = document.getElementById('rightSb');
  if (!sb) return;
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
      btn.onclick = randomPick; sb.appendChild(btn); return;
    }
    const btn = document.createElement('button');
    btn.className = 'sb-btn ' + (b.c || '');
    btn.textContent = b.t;
    if (b.t.includes('Cancel')) btn.onclick = openCancelModal;
    if (b.t.includes('Clear')) btn.onclick = clearSelections;
    if (b.t.includes('Advance')) btn.onclick = openAdvanceModal;
    if (b.t.includes('INFO')) btn.onclick = openInfoTabsModal;
    if (b.t.includes('Reprint')) btn.onclick = openReprintModal;
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

function applyValue(code, val, skipFamily = false) {
  const cell = document.querySelector(`.cell-bet[data-code="${code}"]`);
  if (!cell) return;
  if (val > 0) {
    allBets[code] = val;
    cell.value = val;
    cell.parentElement.classList.add('sel');
  } else {
    delete allBets[code];
    cell.value = '';
    cell.parentElement.classList.remove('sel');
  }
  const famBtn = document.getElementById('bbFam');
  const sfamBtn = document.getElementById('sfam');
  const famChecked = (famBtn && famBtn.checked) || (sfamBtn && sfamBtn.checked);
  if (famChecked && !skipFamily && val > 0) {
    const numPart = code.substring(1);
    const group = FAMILY_GROUPS.find(g => g.includes(numPart));
    if (group) {
      group.forEach(nbrStr => {
        if (nbrStr !== numPart) {
          const lIdx = Math.floor(parseInt(nbrStr) / 10);
          const lCode = LETTERS[lIdx] + nbrStr;
          applyValue(lCode, val, true);
        }
      });
    }
  }
}

function buildGGrid() {
  const labels = document.getElementById('gLabels');
  if (labels) {
    labels.innerHTML = '';
    const blank = document.createElement('div');
    blank.className = 'g-lbl-blank';
    labels.appendChild(blank);
    LETTERS.forEach(L => {
      const d = document.createElement('div'); d.className = 'g-lbl';
      d.innerHTML = `<input type="tel" class="lbl-input" placeholder="" maxlength="3" style="display:block;width:100%;height:100%;border:none;background:transparent;text-align:center;color:#fff;outline:none;font-weight:normal;font-family:'Impact',sans-serif;letter-spacing:1px;font-size:16px;padding:0;box-sizing:border-box;cursor:text;position:relative;z-index:2;"/>`;
      const inp = d.querySelector('.lbl-input');
      d.onclick = (e) => { if (e.target !== inp) inp.focus(); };
      inp.oninput = () => {
        const val = parseInt(inp.value) || 0;
        document.querySelectorAll('.cell-bet').forEach(cb => {
          if (cb.dataset.code.startsWith(L)) applyValue(cb.dataset.code, val);
        });
        updateStats();
      };
      labels.appendChild(d);
    });
  }

  const prev = document.getElementById('gPreview');
  if (prev) {
    prev.innerHTML = '';
    for (let i = 0; i < 10; i++) {
      const c = document.createElement('div'); c.className = 'prev-cell';
      c.innerHTML = `<input type="tel" class="prev-input" placeholder="" maxlength="3" style="display:block;width:100%;height:100%;border:none;background:transparent;text-align:center;color:#000;outline:none;font-weight:normal;font-family:'Impact',sans-serif;letter-spacing:1px;font-size:16px;padding:0;box-sizing:border-box;cursor:text;position:relative;z-index:2;"/>`;
      const inp = c.querySelector('.prev-input');
      c.onclick = (e) => { if (e.target !== inp) inp.focus(); };
      inp.oninput = () => {
        const val = parseInt(inp.value) || 0;
        document.querySelectorAll('.cell-bet').forEach(cb => {
          if (cb.dataset.code.endsWith(i)) applyValue(cb.dataset.code, val);
        });
        updateStats();
      };
      prev.appendChild(c);
    }
  }

  const grid = document.getElementById('gGrid');
  if (grid) {
    grid.innerHTML = '';
    LETTERS.forEach(L => {
      for (let i = 0; i <= 9; i++) {
        const n = (LETTERS.indexOf(L) * 10) + i;
        const code = L + String(n).padStart(2, '0');
        const c = document.createElement('div');
        c.className = 'gcell';
        c.innerHTML = `<input type="tel" class="cell-bet" data-code="${code}" placeholder="${code}" maxlength="3" autocomplete="off" style="display:block;width:100%;height:100%;border:none;background:transparent;text-align:center;color:#000;outline:none;font-weight:normal;font-family:'Impact',sans-serif;letter-spacing:1px;font-size:16px;padding:0;box-sizing:border-box;cursor:text;position:relative;z-index:2;"/>`;
        const cellBet = c.querySelector('.cell-bet');
        cellBet.oninput = () => { applyValue(code, parseInt(cellBet.value) || 0); updateStats(); };
        c.onclick = (e) => { if (e.target !== cellBet) cellBet.focus(); };
        grid.appendChild(c);
      }
    });
  }
}

function updateStats() {
  let totalSpots = 0;
  let totalSumPoints = 0;
  let totalAmount = 0;
  for (let code in allBets) {
    const val = allBets[code];
    if (val > 0) {
      totalSpots++;
      totalSumPoints += val;
      totalAmount += val;
    }
  }

  const drawCount = advanceTimeVal.length > 0 ? advanceTimeVal.length : 1;
  const finalSpots = totalSpots * drawCount;
  const finalQty = totalAmount * drawCount;
  const finalPoints = finalQty * 5;

  const spotsEl = document.getElementById('statSpots');
  const prizeEl = document.getElementById('statPrize');
  const serviceEl = document.getElementById('statGameService');
  const totalPointsEl = document.getElementById('statTotalPts');
  
  if (spotsEl) spotsEl.textContent = finalSpots;
  if (prizeEl) prizeEl.textContent = (finalPoints * 0.9).toFixed(2);
  if (serviceEl) serviceEl.textContent = (finalPoints * 0.1).toFixed(2);
  if (totalPointsEl) totalPointsEl.textContent = finalPoints;
}

function clearSelections() {
  allBets = {};
  document.querySelectorAll('.gcell').forEach(e => {
    e.classList.remove('sel');
    const input = e.querySelector('.cell-bet');
    if (input) input.value = '';
  });
  document.querySelectorAll('.lbl-input, .prev-input').forEach(i => i.value = '');
  updateStats();
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

window.randomPick = function() {
  const overlay = document.createElement('div');
  overlay.className = "modal-overlay";
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:2147483647;display:flex;align-items:center;justify-content:center;';
  
  overlay.innerHTML = `
    <div style="background:#b0b8c6; padding:30px 40px; border-radius:4px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.5); font-family:Arial, sans-serif; color:#333; width:500px; border: 2px solid #fff;">
      <h3 style="margin-bottom:30px; font-size:18px; font-weight:bold; color:#333;">RANDOM PICK</h3>
      <div style="display:flex; justify-content:space-between; margin-bottom:30px;">
        <div style="display:flex; flex-direction:column; align-items:center; width:45%;">
          <label style="font-size:14px; margin-bottom:5px; font-weight:bold; color:#444;">Quantity</label>
          <input type="number" id="randQty" value="10" style="width:100%; padding:8px; border:none; font-size:18px; text-align:center; background:#fff; outline:none; font-family:'Times New Roman', serif;" />
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; width:45%;">
          <label style="font-size:14px; margin-bottom:5px; font-weight:bold; color:#444;">Generate Total</label>
          <input type="number" id="randTotal" style="width:100%; padding:8px; border:none; font-size:18px; text-align:center; background:#fff; outline:none; font-family:'Times New Roman', serif;" />
        </div>
      </div>
      <div style="display:flex; justify-content:center; gap:15px;">
        <button id="btnRandOk" style="padding:8px 30px; background:#cddc39; color:#000; border:none; cursor:pointer; font-weight:bold; font-size:14px;">OK</button>
        <button id="btnRandCancel" style="padding:8px 25px; background:#ff5722; color:#fff; border:none; cursor:pointer; font-weight:bold; font-size:14px;">CANCEL</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('btnRandCancel').onclick = () => overlay.remove();
  document.getElementById('btnRandOk').onclick = () => {
    let qtyInput = parseInt(document.getElementById('randQty').value) || 0;
    let totalInput = parseInt(document.getElementById('randTotal').value) || 0;
    
    overlay.remove();
    
    // As per user rule: Quantity = amount per ticket, Generate Total = number of grids
    let amountPerTicket = qtyInput > 0 ? qtyInput : 10;
    let numGrids = totalInput > 0 ? totalInput : (qtyInput > 0 ? qtyInput : 10);
    
    if (numGrids <= 0) return;
    
    const avail = [...document.querySelectorAll('.gcell:not(.sel)')];
    if (avail.length === 0) return;
    
    if (numGrids > avail.length) numGrids = avail.length;

    for (let i = avail.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [avail[i], avail[j]] = [avail[j], avail[i]];
    }
    
    for (let i = 0; i < numGrids; i++) {
      const code = avail[i].querySelector('.cell-bet').dataset.code;
      applyValue(code, amountPerTicket);
    }
    updateStats();
  };
}

let allAvailableSlotsG = [];

window.openAdvanceModal = async function () {
  const modal = document.getElementById('advanceModal');
  const grid = document.getElementById('advanceDrawGrid');
  const inp = document.getElementById('advanceDrawCountInp');
  if (!modal || !grid) return;

  if (inp) inp.value = ''; // Reset input
  grid.innerHTML = '<p style="color:#fff; padding:20px;">Loading...</p>';
  advanceTimeVal = [];
  modal.style.display = 'flex';

  try {
    const res = await API.advancDrawTime();
    if (res.status && res.slots && res.slots.length > 0) {
      allAvailableSlotsG = res.slots;
      renderDrawSlotsG();
    } else {
      grid.innerHTML = '<p style="color:#f44; padding:20px;">No advance times available.</p>';
    }
  } catch (err) {
    console.error("Advance draw fetch error:", err);
    grid.innerHTML = '<p style="color:#f44; padding:20px;">Error fetching advance draw times.</p>';
  }
};

function renderDrawSlotsG() {
  const grid = document.getElementById('advanceDrawGrid');
  if (!grid || !allAvailableSlotsG) return;

  grid.innerHTML = allAvailableSlotsG.map((s) => {
    const isChecked = advanceTimeVal.includes(s);
    return `<label style="display:flex;align-items:center;background:${isChecked ? '#f1ce07' : '#222'};padding:10px;border-radius:6px;gap:8px;color:${isChecked ? '#000' : '#fff'};cursor:pointer;transition:background 0.2s;">
              <input type="checkbox" class="adv_slot_cb" value="${s}" ${isChecked ? 'checked' : ''} onchange="toggleSlotG('${s}', this.checked)">${s}
            </label>`;
  }).join('');
  updateDrawCountUI();
}

window.toggleSlotG = function (slot, isChecked) {
  if (isChecked) {
    if (!advanceTimeVal.includes(slot)) advanceTimeVal.push(slot);
  } else {
    advanceTimeVal = advanceTimeVal.filter(s => s !== slot);
  }
  renderDrawSlotsG();
};

window.selectXDraws = function (count) {
  const n = parseInt(count);
  if (isNaN(n) || n < 0) {
    advanceTimeVal = [];
  } else {
    advanceTimeVal = allAvailableSlotsG.slice(0, n);
  }
  renderDrawSlotsG();
};

function updateDrawCountUI() {
  const countEl = document.getElementById('selectedDrawCount');
  if (countEl) countEl.textContent = advanceTimeVal.length;
}

window.closeAdvanceModal = function () {
  const modal = document.getElementById('advanceModal');
  if (modal) modal.style.display = 'none';
};

window.confirmAdvanceDraw = function () {
  closeAdvanceModal();
  updateStats();
};

window.openCancelModal = function () {
  const modal = document.getElementById('cancelBetModal');
  if (modal) modal.style.display = 'flex';
  const tbody = document.getElementById('cancelHistoryBody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
  if (window.fetchCancelHistory) window.fetchCancelHistory();
};

window.toggleAllAdvance = function (isSelected) {
  const checkboxes = document.querySelectorAll('.adv_slot_cb');
  checkboxes.forEach(cb => cb.checked = isSelected);
}

window.closeCancelModal = function () {
  const modal = document.getElementById('cancelBetModal');
  if (modal) modal.style.display = 'none';
};

window.fetchCancelHistory = async function () {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return;
  const user = JSON.parse(userStr);
  try {
    const res = await API.currentDrawBetHistory(user.username);
    const tbody = document.getElementById('cancelHistoryBody');
    if (res.status && res.tickets && res.tickets.length > 0) {
      if (tbody) {
        tbody.innerHTML = res.tickets.map(t =>
          `<tr>
            <td>${t.id}</td><td>${t.barcode}</td><td>${t.draw_times}</td>
            <td>${t.bet_time}</td><td>${t.qty}</td><td>${t.amount}</td>
            <td><button class="modal-btn secondary" style="padding:4px 8px;font-size:12px;" onclick="cancelTicket('${t.id}')">Cancel</button></td>
          </tr>`
        ).join('');
      }
    } else {
      if (tbody) tbody.innerHTML = '<tr><td colspan="7">No tickets found for current draw.</td></tr>';
    }
  } catch (e) {
    const tbody = document.getElementById('cancelHistoryBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="7">Error loading history.</td></tr>';
  }
};

window.cancelTicket = async function (id) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:2147483647;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:#222;padding:20px 30px;border-radius:12px;text-align:center;color:#fff;border:2px solid #ee1c25;box-shadow:0 10px 30px rgba(0,0,0,0.5);font-family:'Oswald',sans-serif;">
      <h3 style="margin-bottom:10px;color:#ee1c25;font-family:'Orbitron',sans-serif;letter-spacing:1px;">CONFIRM CANCELLATION</h3>
      <p style="margin-bottom:20px;font-size:16px;color:#ddd;">Are you sure you want to cancel ticket <strong style="color:#fff;font-size:18px;">${id}</strong>?</p>
      <div style="display:flex;justify-content:center;gap:15px;">
        <button id="btnNoCancel" style="padding:10px 20px;background:#444;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;font-size:14px;transition:0.3s;">Keep Ticket</button>
        <button id="btnYesCancel" style="padding:10px 20px;background:#ee1c25;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;font-size:14px;transition:0.3s;box-shadow:0 4px 10px rgba(238,28,37,0.3);">Yes, Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('btnNoCancel').onclick = () => overlay.remove();
  document.getElementById('btnYesCancel').onclick = async () => {
    overlay.remove();
    try {
      const res = await API.cancleTicket(id);
      if (res.status) {
        showStatusModal("SUCCESS", "Ticket cancelled successfully.", "success");
        if (window.fetchCancelHistory) window.fetchCancelHistory();
        const refreshBtn = document.getElementById('hdrRefresh');
        if (refreshBtn) refreshBtn.click();
        setTimeout(() => { window.location.reload(); }, 1500);
      } else {
        showStatusModal("CANCEL FAILED", res.message || "Failed to cancel ticket.", "error");
      }
    } catch (e) {
      showStatusModal("ERROR", "Error cancelling ticket.", "error");
    }
  };
};

window.openBetHistoryModal = function () {
  const modal = document.getElementById('betHistoryModal');
  if (modal) modal.style.display = 'flex';
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const input = document.getElementById('historyDateInput');
  if (input) input.value = dateStr;
  if (window.fetchBetHistory) window.fetchBetHistory();
};

window.closeBetHistoryModal = function () {
  const modal = document.getElementById('betHistoryModal');
  if (modal) modal.style.display = 'none';
};

window.fetchBetHistory = async function () {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return;
  const user = JSON.parse(userStr);
  const input = document.getElementById('historyDateInput');
  const dateStr = input ? input.value : "";
  const tbody = document.getElementById('betHistoryBody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

  try {
    const res = await API.betHistory(user.username, dateStr);
    if (res.status && res.tickets && res.tickets.length > 0) {
      if (tbody) {
        tbody.innerHTML = res.tickets.map(t =>
          `<tr>
            <td>${t.id}</td><td>${t.barcode}</td><td>${t.draw_times}</td>
            <td>${t.bet_time}</td><td>${t.qty}</td><td>${t.amount}</td>
          </tr>`
        ).join('');
      }
    } else {
      if (tbody) tbody.innerHTML = '<tr><td colspan="6">No tickets found.</td></tr>';
    }
  } catch (e) {
    if (tbody) tbody.innerHTML = '<tr><td colspan="6">Error loading history.</td></tr>';
  }
};

async function playG() {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return showStatusModal("LOGIN REQUIRED", "Please login to play.", "error");
  const user = JSON.parse(userStr);

  let all_datas12 = [];
  let total_load_c_amount = 0;
  let total_load_c_qty = 0;

  for (let code in allBets) {
    if (allBets[code] > 0) {
      const numCode = code.substring(1);
      all_datas12.push(`${numCode}X${allBets[code]}`);
      total_load_c_amount += allBets[code];
      total_load_c_qty += 1;
    }
  }

  if (all_datas12.length === 0) return showStatusModal("NO BETS", "Please select at least one bet.", "error");

  const drawCount = advanceTimeVal.length > 0 ? advanceTimeVal.length : 1;
  const payloadAmount = total_load_c_amount * drawCount;
  const payloadQty = total_load_c_qty * drawCount;

  const payload = {
    username: user.username,
    all_datas12: all_datas12.join(','),
    total_load_c_amount: payloadAmount,
    total_load_c_qty: payloadQty,
    advancr_draw_time: advanceTimeVal.length > 0 ? advanceTimeVal : ""
  };

  try {
    const res = await API.insertData(payload);
    if (res && res.status) {
      // Very aggressive barcode extraction
      let serverBarcode = '0000000000';
      if (res.barcodes && res.barcodes.length > 0) {
        serverBarcode = res.barcodes[0];
      } else if (res.barcode) {
        serverBarcode = res.barcode;
      } else if (res.barcodee) {
        serverBarcode = res.barcodee;
      } else if (res.tickets && res.tickets[0] && res.tickets[0].barcode) {
        serverBarcode = res.tickets[0].barcode;
      } else if (res.data) {
        if (typeof res.data === 'string' && res.data.length > 5) serverBarcode = res.data;
        else if (res.data.barcode) serverBarcode = res.data.barcode;
      } else {
        // Fallback: search all keys for "barcode"
        for (let key in res) {
          if (key.toLowerCase().includes('barcode')) {
            if (typeof res[key] === 'string' && res[key].length > 5) {
              serverBarcode = res[key];
              break;
            } else if (Array.isArray(res[key]) && res[key].length > 0) {
              serverBarcode = res[key][0];
              break;
            }
          }
        }
      }
      serverBarcode = String(serverBarcode).trim();

      const betLines = [];
      for (let code in allBets) {
        if (allBets[code] > 0) {
          betLines.push({ num: code.substring(1), qty: allBets[code] });
        }
      }

      // AGGRESSIVELY FETCH TICKET DETAILS FROM SERVER FOR PRINTING
      // This ensures the data on the receipt is the final official data from the DB
      const barcodesToPrint = (res.barcodes && res.barcodes.length > 0) ? res.barcodes.join(',') : serverBarcode;

      try {
        const printData = await API.reprintTicket(barcodesToPrint, user.username);
        if (printData && printData.status && printData.tickets && printData.tickets.length > 0) {
          // CONSOLIDATED PRINTING: Print all tickets in one window
          const ticketsToPrint = printData.tickets.map(t => ({ ticket: t, lines: t.bet_lines }));
          printTickets(ticketsToPrint);
        } else {
          // Fallback if reprint API fails: use the aggressive local logic
          console.warn("PrintTickets API fallback triggered");
          printTickets([{
            ticket: {
              barcode: serverBarcode,
              username: user.username,
              record_date: new Date().toISOString().split('T')[0],
              draw_time: advanceTimeVal.length > 0 ? advanceTimeVal[0] : (document.getElementById('hdrTime')?.textContent || ''),
              tck_time: new Date().toLocaleTimeString('en-US', { hour12: false }),
              qty: total_load_c_qty,
              amount: total_load_c_amount
            },
            lines: betLines
          }]);
        }
      } catch (err) {
        console.error("Print fetch failed:", err);
        // Final fallback: local print
        printTickets([{
          ticket: {
            barcode: serverBarcode,
            username: user.username,
            record_date: new Date().toISOString().split('T')[0],
            draw_time: advanceTimeVal.length > 0 ? advanceTimeVal[0] : (document.getElementById('hdrTime')?.textContent || ''),
            tck_time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            qty: total_load_c_qty,
            amount: total_load_c_amount
          },
          lines: betLines
        }]);
      }

      clearSelections();
      advanceTimeVal = [];
      const refreshBtn = document.getElementById('hdrRefresh');
      if (refreshBtn) refreshBtn.click();
      setTimeout(() => { window.location.reload(); }, 1500);
    } else {
      showStatusModal("FAILED", res.message || "Failed to place bet.", "error");
    }
  } catch (err) {
    console.error(err);
    showStatusModal("ERROR", "Error placing bet.", "error");
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  document.body.classList.add('body-G');
  const wrapper = document.querySelector('.app-wrapper');
  if (wrapper) wrapper.classList.add('layout-g');
  const bar = document.getElementById('sharedHeaderBar');
  if (bar) bar.classList.add('premium-hdr');
  const bb = document.getElementById('sharedBottom');
  if (bb) bb.classList.add('g-footer-mode');
  const rsb = document.getElementById('rightSb');
  if (rsb) rsb.classList.add('right-sb-premium', 'g-sidebar-mode');

  buildSidebar(config.btns);
  buildGGrid();

  const playBtn = document.getElementById('playBtn');
  if (playBtn) playBtn.onclick = playG;

  const powerBtn = document.querySelector('.power-btn');
  if (powerBtn) {
    powerBtn.onclick = () => {
      const modal = document.getElementById('logoutModal');
      if (modal) modal.style.display = 'flex';
    };
  }

  window.closeLogoutModal = () => {
    const m = document.getElementById('logoutModal'); if (m) m.style.display = 'none';
  };
  window.confirmLogout = async () => {
    sessionStorage.removeItem('user');
    window.location.href = '../index.html';
  };

  const getBalance = async () => {
    const balanceEl = document.getElementById('statBalance');
    const userString = sessionStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    try {
      const resp = await API.balance(user.username);
      if (resp && resp.success === true && resp.data) {
        if (balanceEl) balanceEl.textContent = Math.floor(resp.data.balance);
      }
    } catch (err) { console.error('Balance error:', err); }
  };

  const refreshBtn = document.getElementById('hdrRefresh');
  if (refreshBtn) refreshBtn.onclick = getBalance;

  getBalance();

  const lastDrawBetAmount = async () => {
    const userString = sessionStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    try {
      const resp = await API.lastDrawBetAmount(user.username);
      if (resp && resp.status === true) {
        const lastAmountEl = document.getElementById('L_Draw_Amount');
        if (lastAmountEl) lastAmountEl.textContent = Math.floor(resp.last_bet_amount || 0);
      }
    } catch (err) { console.error('Last draw error:', err); }
  };

  lastDrawBetAmount();

  const getResult = async () => {
    try {
      const resp = await API.result();
      if (resp && resp.status === true && resp.previous_results) {
        const winnersEl = document.getElementById('hWinners');
        if (winnersEl) {
          let winnersHtml = resp.previous_results.map(r => {
            const numVal = parseInt(r.result);
            const decade = Math.floor(numVal / 10);
            const letter = LETTERS[decade] || '';
            const fullNum = letter + String(numVal).padStart(2, '0');
            return `<div class="h-wnum"><span class="wnum-time">${r.result_time_12}</span> ${fullNum}</div>`;
          }).join('');
          
          // Keep the version label at the end
          winnersHtml += `<div class="h-ver-lbl" id="hdrVer" style="text-align:left;">v-3.5.0.8</div>`;
          winnersEl.innerHTML = winnersHtml;
        }
      }
    } catch (err) { console.error('Result fetch error:', err); }
  };

  getResult();

  const syncTimer = async () => {
    try {
      const res = await API.timer();
      if (res.success && res.time) countdown1 = parseInt(res.time);
    } catch (e) { console.error('Timer API Error:', e); }
  };
  syncTimer();

  updateClock();
  setInterval(updateClock, 1000);
  setInterval(updateCountdowns, 1000);

  window.closeClaimResultModal = () => {
    const modal = document.getElementById('claimResultModal');
    if (modal) modal.style.display = 'none';
  };

  // INITIALIZE CLAIM INPUT LISTENER
  const claimInp = document.querySelector('.bb-cinput');
  if (claimInp) {
      const processClaim = async () => {
          const barcode = claimInp.value.trim().toUpperCase();
          if (barcode.length !== 10) return;

          const userStr = sessionStorage.getItem('user');
          const user = userStr ? JSON.parse(userStr) : null;
          const username = user ? user.username : 'anil';

          try {
              const res = await API.claimTicket(barcode, username);
              const data = Array.isArray(res) ? res[0] : res;
              
              const modal = document.getElementById('claimResultModal');
              const winIcon = document.getElementById('claimWinIcon');
              const winMsg = document.getElementById('claimWinMsg');
              const statusMsg = document.getElementById('claimStatusMsg');
              const resBarcode = document.getElementById('claimResBarcode');
              const resUser = document.getElementById('claimResUser');
              const resNext = document.getElementById('claimResNext');
              const resAmount = document.getElementById('claimResAmount');
              const header = document.getElementById('claimResultHeader');
              const title = document.getElementById('claimTitle');
              const amountRow = document.getElementById('claimResAmountRow');

              if (modal) {
                  resBarcode.textContent = barcode;
                  resUser.textContent = username;
                  resNext.textContent = data.nxt_draw || '-';
                  resAmount.textContent = (data.win_amount || data.amount || '0.00');

                  if (data.status === true || data.status === "true") {
                      winIcon.style.display = 'block';
                      winMsg.style.display = 'block';
                      statusMsg.textContent = data.message || "Winning Ticket!";
                      header.style.background = 'linear-gradient(to right, #00cb00, #006400)';
                      title.textContent = "WINNING TICKET!";
                      amountRow.style.display = 'flex';
                  } else {
                      winIcon.style.display = 'none';
                      winMsg.style.display = 'none';
                      statusMsg.textContent = data.message || "Ticket Status";
                      header.style.background = 'linear-gradient(to right, #ed1c24, #911)';
                      title.textContent = "CLAIM STATUS";
                      // If message specifically says not declared, keep it neutral
                      if (data.message && data.message.includes("not declared")) {
                        header.style.background = 'linear-gradient(to right, #fa0, #850)';
                      }
                      amountRow.style.display = (data.win_amount && data.win_amount > 0) ? 'flex' : 'none';
                  }
                  modal.style.display = 'flex';
              }
              
              claimInp.value = ''; // clear for next scan
              getBalance();        // Correct function call to refresh balance
          } catch (err) {
              console.error(err);
              showStatusModal("CLAIM FAILED", "Claim failed. Please try again.", "error");
          }
      };

      claimInp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') processClaim();
      });

      claimInp.addEventListener('input', () => {
          if (claimInp.value.length === 10) processClaim();
      });
  }

  scaleFonts();
});

window.openReprintModal = async function () {
  const modal = document.getElementById('reprintModal');
  if (modal) {
    modal.style.display = 'flex';
    const body = document.getElementById('reprintHistoryBody');
    if (body) body.innerHTML = '<tr><td colspan="6" style="padding:30px; color:#f0f; font-weight:bold;">Loading history...</td></tr>';
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const username = user ? user.username : 'anil';
    const today = new Date().toISOString().split('T')[0];
    try {
      const res = await API.betHistory(username, today);
      if (body) {
        if (res && res.status === true && res.tickets && res.tickets.length > 0) {
          body.innerHTML = res.tickets.map(t => `
            <tr style="border-bottom:1px solid #222; background:rgba(255,255,255,0.02);">
              <td style="padding:10px;"><input type="checkbox" class="reprint-cb" value="${t.barcode}"></td>
              <td style="padding:10px;">${t.id}</td>
              <td style="padding:10px; color:#0f0; font-weight:bold;">${t.barcode}</td>
              <td style="padding:10px;">${t.draw_times}</td>
              <td style="padding:10px;">${t.qty}</td>
              <td style="padding:10px;">${t.amount}</td>
              <td style="padding:10px;">
                <button onclick="directReprint('${t.barcode}')" style="background:#ed1c24; color:#fff; border:none; padding:4px 12px; border-radius:4px; cursor:pointer; font-weight:bold; font-size:12px;">REPRINT</button>
              </td>
            </tr>`).join('');
        } else {
          body.innerHTML = '<tr><td colspan="6" style="padding:30px; color:#999;">No bets found for today.</td></tr>';
        }
      }
    } catch (e) { if (body) body.innerHTML = '<tr><td colspan="6" style="padding:30px; color:red;">Error loading history.</td></tr>'; }
  }
};

window.directReprint = async function (barcode) {
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const username = user ? user.username : 'anil';
  try {
    const res = await API.reprintTicket(barcode, username);
    if (res && res.status === true && res.tickets && res.tickets.length > 0) {
      printTickets(res.tickets.map(t => ({ ticket: t, lines: t.bet_lines })));
    } else {
      showStatusModal("FAILED", res.message || "Ticket not found.", "error");
    }
  } catch (err) { showStatusModal("ERROR", "Reprint failed.", "error"); }
};

window.toggleAllReprint = function (checked) {
  document.querySelectorAll('.reprint-cb').forEach(cb => cb.checked = checked);
};

window.reprintSelected = async function () {
  const selected = Array.from(document.querySelectorAll('.reprint-cb:checked')).map(cb => cb.value);
  if (selected.length === 0) return showStatusModal("SELECTION EMPTY", "Select at least one ticket.", "error");

  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const username = user ? user.username : 'anil';

  try {
    const barcodesStr = selected.join(',');
    const res = await API.reprintTicket(barcodesStr, username);
    if (res && res.status === true && res.tickets && res.tickets.length > 0) {
      printTickets(res.tickets.map(t => ({ ticket: t, lines: t.bet_lines })));
    } else {
      showStatusModal("ERROR", "Print error.", "error");
    }
  } catch (err) { showStatusModal("ERROR", "Reprint failed.", "error"); }
};

window.handleReprintSubmit = function () {
  const inp = document.getElementById('reprintBarcodeInp');
  if (inp && inp.value.trim()) {
    directReprint(inp.value.trim());
    inp.value = '';
  }
};

window.closeReprintModal = function () {
  const modal = document.getElementById('reprintModal');
  if (modal) modal.style.display = 'none';
};

function printTickets(ticketsArray) {
  if (!ticketsArray || ticketsArray.length === 0) return;

  // Use a hidden iframe for printing instead of window.open to keep user on the same page
  let printFrame = document.getElementById('printFrame');
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'printFrame';
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = 'none';
    printFrame.style.visibility = 'hidden';
    document.body.appendChild(printFrame);
  }

  let ticketsHtml = '';

  ticketsArray.forEach((item, index) => {
    const ticket = item.ticket;
    const lines = item.lines || ticket.bet_lines || [];

    let barcodeValue = ticket.barcode || '0000000000';
    barcodeValue = String(barcodeValue).trim();

    // Create a temporary canvas to get barcode data
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, barcodeValue, {
      format: "CODE128",
      width: 1.4,
      height: 50,
      displayValue: false,
      margin: 3,
      background: "#ffffff",
      lineColor: "#000000"
    });
    const barcodeData = canvas.toDataURL("image/png");

    let betLinesHtml = '';
    if (lines && Array.isArray(lines)) {
      const sortedLines = [...lines].sort((a, b) => parseInt(a.num) - parseInt(b.num));
      sortedLines.forEach(line => {
        const numVal = parseInt(line.num);
        const letter = LETTERS[Math.floor(numVal / 10)] || '';
        const fullNum = letter + String(numVal).padStart(2, '0');
        betLinesHtml += `<tr>
          <td style="text-align:left; padding: 4px 0; font-size: 18px; font-weight:bold;">${fullNum}</td>
          <td style="text-align:right; padding: 4px 0; font-size: 18px; font-weight:bold;">${line.qty}</td>
        </tr>`;
      });
    }

    ticketsHtml += `
      <div class="ticket-page">
        <div class="header">
          <h1>PLATINUM</h1>
          <div>Lottery</div>
        </div>
        
        <div class="info-box">
          <div class="info-row"><span>TERMINAL:</span> <span>${ticket.username}</span></div>
          <div class="info-row"><span>DRAW TIME:</span> <span>${ticket.draw_time || ''}</span></div>
          <div class="info-row"><span>DATE/TIME:</span> <span>${ticket.record_date || ''} ${ticket.tck_time || ''}</span></div>
        </div>

        <table class="bet-table">
          <thead>
            <tr>
              <th style="text-align:left;">NUMBER</th>
              <th style="text-align:right;">QTY</th>
            </tr>
          </thead>
          <tbody>
            ${betLinesHtml}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>QTY:</span> <span>${ticket.qty}</span>
          </div>
          <div class="summary-row final-total">
            <span>TOTAL:</span> <span>${ticket.amount}.00</span>
          </div>
        </div>

        <div class="footer">
          <span class="barcode-num">${barcodeValue}</span>
          <div class="barcode-box">
            <img class="barcode-img" src="${barcodeData}" alt="barcode" />
          </div>
       
        </div>
      </div>
    `;
  });

  const content = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Receipts</title>
      <style>
        @page { size: auto; margin: 0; }
        body { 
          font-family: 'Arial', sans-serif; 
          width: 158px; 
          margin: 0 auto; 
          padding: 0; 
          color: #000 !important; 
          background: #fff;
          line-height: 1.2;
          font-size: 9px;
          text-align: center;
        }
        .ticket-page {
          page-break-after: always;
          padding: 3mm 1mm;
          border-bottom: 1px dashed #000;
          position: relative;
          box-sizing: border-box;
          width: 158px;
          margin: 0 auto;
        }
        .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 4px; }
        .header h1 { margin: 0; font-size: 16px; text-transform: uppercase; font-family: 'Arial Black', sans-serif; letter-spacing: 0.5px; }
        .header div { font-size: 9px; font-weight: bold; }
        
        .info-box { font-size: 8.5px; margin: 3px 0; padding: 3px 0; border-bottom: 1px dashed #aaa; text-align: left; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 1.5px; }
        
        .bet-table { width: 100%; border-collapse: collapse; margin: 4px 0; }
        .bet-table th { text-align: left; font-size: 9px; padding: 3px 0; border-bottom: 1px solid #000; }
        .bet-table td { font-size: 13px; font-weight: bold; padding: 2px 0; }
        
        .summary { margin-top: 4px; border-top: 1px dashed #000; padding-top: 3px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 10px; font-weight: bold; margin-bottom: 1.5px; }
        .final-total { font-size: 14px; font-weight: 900; border-top: 1px solid #000; margin-top: 3px; padding-top: 3px; }
        
        .footer { text-align: center; margin-top: 8px; padding-bottom: 3px; }
        .barcode-num { font-size: 11px; font-weight: 900; letter-spacing: 1px; margin-bottom: 3px; display: block; font-family: 'Arial', sans-serif; }
        .barcode-img { width: 100%; height: auto; display: block; margin: 0 auto; min-height: 30px; }
        .luck-msg { font-size: 9px; font-weight: bold; margin-top: 6px; border-top: 1px dashed #000; padding-top: 6px; text-transform: uppercase; }
        
        @media print {
          .ticket-page { border-bottom: none; }
          body { width: 158px; margin: 0 auto; }
        }
      </style>
    </head>
    <body>
      ${ticketsHtml}
    </body>
    </html>
  `;
  const doc = printFrame.contentWindow.document;
  doc.open();
  doc.write(content);
  doc.close();

  setTimeout(() => {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
  }, 500);
}

document.addEventListener('keydown', (e) => {
  // F7: Play/Bet
  if (e.key === 'F7') {
    e.preventDefault();
    const playBtn = document.getElementById('playBtn');
    if (playBtn) playBtn.click();
  }
  // F2: Reprint
  else if (e.key === 'F2') {
    e.preventDefault();
    openReprintModal();
  }
  // F8: Focus Claim
  else if (e.key === 'F8') {
    e.preventDefault();
    const claimInp = document.querySelector('.bb-cinput');
    if (claimInp) claimInp.focus();
  }
  // F10: Cancel History
  else if (e.key === 'F10') {
    e.preventDefault();
    openCancelModal();
  }
  // I: Info (Bet History)
  else if (e.key === 'i' || e.key === 'I' || e.key === 'F3') {
    e.preventDefault();
    openInfoTabsModal();
  }
  // ESC: Clear
  else if (e.key === 'Escape') {
    e.preventDefault();
    closeClaimResultModal();
    clearSelections();
  }
});

window.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    if (e.target.id) {
      e.target.style.display = 'none';
    } else {
      e.target.remove();
    }
  }
  if (e.target.classList.contains('logout-modal')) {
    e.target.style.display = 'none';
  }
});

// ==========================================
// INFO TABS MODAL (From Reference Image)
// ==========================================
window.openInfoTabsModal = function() {
  const modal = document.getElementById('infoTabsModal');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('infoDateSelectView').style.display = 'flex';
    document.getElementById('infoResultsView').style.display = 'none';
    const dateInp = document.getElementById('infoTabDate');
    if (dateInp && !dateInp.value) {
      dateInp.value = new Date().toISOString().split('T')[0];
    }
  }
};

window.closeInfoTabsModal = function() {
  const modal = document.getElementById('infoTabsModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

window.submitInfoTabDate = function() {
  const dateInp = document.getElementById('infoTabDate').value;
  if(!dateInp) return;
  
  // Format date as dd/mm/yyyy
  const parts = dateInp.split('-');
  if(parts.length !== 3) return;
  const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
  document.getElementById('infoResultsDateLabel').innerText = formattedDate;

  // Show results view
  document.getElementById('infoDateSelectView').style.display = 'none';
  document.getElementById('infoResultsView').style.display = 'block';

  // Populate dummy data to match image exactly
  const tbody = document.getElementById('infoResultsTableBody');
  const dummyResults = [
    { time: '06:27 PM', res: 'B15' },
    { time: '06:02 PM', res: 'G65' },
    { time: '05:57 PM', res: 'B14' },
    { time: '04:52 PM', res: 'B19' },
    { time: '04:27 PM', res: 'O28' },
    { time: '04:02 PM', res: 'A01' },
    { time: '03:57 PM', res: 'H77' },
    { time: '03:52 PM', res: 'B9' }
  ];

  let html = '';
  dummyResults.forEach((r, i) => {
    // Alternating green backgrounds
    const bg = i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.1)';
    html += `
      <tr style="background:${bg}; border-bottom:1px solid #2a4012;">
        <td style="padding: 12px 15px; font-size:14px; width:40%; text-align:right;">${r.time}</td>
        <td style="padding: 12px 15px; font-size:14px; width:60%; text-align:left; padding-left:40px;">${r.res}</td>
      </tr>
    `;
  });
  tbody.innerHTML = html;
};

window.backToInfoDateSelect = function() {
  document.getElementById('infoResultsView').style.display = 'none';
  document.getElementById('infoDateSelectView').style.display = 'flex';
};

function scaleFonts() {
  const isMobile = window.innerWidth <= 768;
  const elements = document.querySelectorAll('.gcell, .g-lbl, .prev-cell, .nav-tab, .sb-btn, .sb-random, .h-wnum');

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

  document.querySelectorAll('.gcell').forEach(el => { 
    el.style.fontSize = clamp(11 * s, 9, 20) + 'px'; 
  });
  document.querySelectorAll('.gcell .cell-code').forEach(el => { 
    el.style.fontSize = clamp(8 * s, 6, 14) + 'px'; 
  });
  document.querySelectorAll('.g-lbl').forEach(el => { 
    el.style.fontSize = clamp(10 * s, 8, 18) + 'px'; 
  });
  document.querySelectorAll('.prev-cell').forEach(el => { 
    el.style.fontSize = clamp(10 * s, 8, 18) + 'px'; 
  });
  document.querySelectorAll('.nav-tab').forEach(el => { 
    el.style.fontSize = clamp(16 * s, 13, 26) + 'px'; 
  });
  document.querySelectorAll('.h-wnum').forEach(el => { 
    el.style.fontSize = clamp(32 * s, 22, 48) + 'px'; 
  });
  document.querySelectorAll('.sb-btn,.sb-random').forEach(el => {
    el.style.fontSize = clamp(11 * s, 9, 18) + 'px';
    el.style.padding = clamp(9 * s, 6, 16) + 'px 4px';
  });
}

window.addEventListener('resize', scaleFonts);
