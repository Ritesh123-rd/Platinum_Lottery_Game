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
    { t: 'Advance', c: '' }, { t: 'Bet History', c: 'history-btn' }, { t: 'INFO (I)', c: 'red' },
    'SP', { t: 'RandomPick', c: 'rand' }, { t: 'fam' }, { t: 'V-4.0.0.0', c: 'ver' }
  ]
};

function switchPage(p) {
  if (p === 'G') window.location.href = 'index.html';
  else window.location.href = '../' + p + '/index.html';
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
    if (b.t.includes('History')) btn.onclick = openBetHistoryModal;
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
      d.innerHTML = `<span class="cell-code" style="display:block;font-size:10px;margin-bottom:2px;pointer-events:none;">${L}</span><input type="tel" class="lbl-input" maxlength="3" style="display:block;width:100%;flex:1;border:none;background:transparent;text-align:center;color:#fff;outline:none;font-weight:900;font-size:16px;padding:0;box-sizing:border-box;cursor:text;position:relative;z-index:2;"/>`;
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
      c.innerHTML = `<span class="cell-code" style="display:block;font-size:10px;margin-bottom:2px;pointer-events:none;">${i}</span><input type="tel" class="prev-input" maxlength="3" style="display:block;width:100%;flex:1;border:none;background:transparent;text-align:center;color:#000;outline:none;font-weight:900;font-size:16px;padding:0;box-sizing:border-box;cursor:text;position:relative;z-index:2;"/>`;
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
        c.innerHTML = `<span class="cell-code" style="display:block;font-size:10px;margin-bottom:2px;pointer-events:none;">${code}</span><input type="tel" class="cell-bet" data-code="${code}" maxlength="3" autocomplete="off" style="display:block;width:100%;flex:1;border:none;background:transparent;text-align:center;color:#000;outline:none;font-weight:900;font-size:16px;padding:0;box-sizing:border-box;cursor:text;position:relative;z-index:2;"/>`;
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

  // Apply advance draw multiplier to both qty and amount
  const drawCount = advanceTimeVal.length > 0 ? advanceTimeVal.length : 1;
  const finalSpots = totalSpots * drawCount;
  const finalAmount = totalAmount * drawCount;

  const spotsEl = document.getElementById('statSpots');
  const prizeEl = document.getElementById('statPrize');
  const totalPointsEl = document.getElementById('statTotalPts');
  if (spotsEl) spotsEl.textContent = finalSpots;
  if (prizeEl) prizeEl.textContent = finalAmount;
  if (totalPointsEl) totalPointsEl.textContent = finalAmount;
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

function randomPick() {
  const avail = [...document.querySelectorAll('.gcell:not(.sel)')];
  if (!avail.length) return;
  const pick = avail[Math.floor(Math.random() * avail.length)];
  const code = pick.querySelector('.cell-bet').dataset.code;
  applyValue(code, Math.floor(Math.random() * 100) + 1);
  updateStats();
}

window.openAdvanceModal = async function() {
  const modal = document.getElementById('advanceModal');
  if (modal) modal.style.display = 'flex';
  const grid = document.getElementById('advanceDrawGrid');
  if (grid) grid.innerHTML = '<p style="color:#fff;">Loading...</p>';
  try {
    const res = await API.advancDrawTime();
    if(res.status && res.slots && res.slots.length > 0) {
      if(grid) {
        grid.innerHTML = res.slots.map((s) => 
          `<label style="display:flex;align-items:center;background:#222;padding:10px;border-radius:6px;gap:8px;color:#fff;cursor:pointer;">
             <input type="checkbox" class="adv_slot_cb" value="${s}">${s}
          </label>`
        ).join('');
      }
    } else {
      if(grid) grid.innerHTML = '<p style="color:#f44;">No advance times available.</p>';
    }
  } catch (err) {
    if(grid) grid.innerHTML = '<p style="color:#f44;">Error fetching advance draw times.</p>';
  }
};

window.closeAdvanceModal = function() {
  const modal = document.getElementById('advanceModal');
  if (modal) modal.style.display = 'none';
};

window.confirmAdvanceDraw = function() {
  const sels = document.querySelectorAll('.adv_slot_cb:checked');
  advanceTimeVal = Array.from(sels).map(cb => cb.value);
  if(advanceTimeVal.length > 0) {
    alert("Advance time(s) selected: " + advanceTimeVal.join(', '));
  }
  updateStats(); // Update totals to reflect multiplier
  closeAdvanceModal();
};

window.openCancelModal = function() {
  const modal = document.getElementById('cancelBetModal');
  if (modal) modal.style.display = 'flex';
  const tbody = document.getElementById('cancelHistoryBody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';
  if (window.fetchCancelHistory) window.fetchCancelHistory();
};

window.closeCancelModal = function() {
  const modal = document.getElementById('cancelBetModal');
  if (modal) modal.style.display = 'none';
};

window.fetchCancelHistory = async function() {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return;
  const user = JSON.parse(userStr);
  try {
    const res = await API.currentDrawBetHistory(user.username);
    const tbody = document.getElementById('cancelHistoryBody');
    if(res.status && res.tickets && res.tickets.length > 0) {
      if(tbody) {
        tbody.innerHTML = res.tickets.map(t => 
          `<tr>
            <td>${t.id}</td><td>${t.barcode}</td><td>${t.draw_times}</td>
            <td>${t.bet_time}</td><td>${t.qty}</td><td>${t.amount}</td>
            <td><button class="modal-btn secondary" style="padding:4px 8px;font-size:12px;" onclick="cancelTicket('${t.id}')">Cancel</button></td>
          </tr>`
        ).join('');
      }
    } else {
      if(tbody) tbody.innerHTML = '<tr><td colspan="7">No tickets found for current draw.</td></tr>';
    }
  } catch(e) {
    const tbody = document.getElementById('cancelHistoryBody');
    if(tbody) tbody.innerHTML = '<tr><td colspan="7">Error loading history.</td></tr>';
  }
};

window.cancelTicket = async function(id) {
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
      if(res.status) {
        alert("Ticket cancelled successfully.");
        if (window.fetchCancelHistory) window.fetchCancelHistory();
        const refreshBtn = document.getElementById('hdrRefresh');
        if (refreshBtn) refreshBtn.click();
      } else {
        alert(res.message || "Failed to cancel ticket.");
      }
    } catch(e) {
      alert("Error cancelling ticket.");
    }
  };
};

window.openBetHistoryModal = function() {
  const modal = document.getElementById('betHistoryModal');
  if (modal) modal.style.display = 'flex';
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const input = document.getElementById('historyDateInput');
  if (input) input.value = dateStr;
  if (window.fetchBetHistory) window.fetchBetHistory();
};

window.closeBetHistoryModal = function() {
  const modal = document.getElementById('betHistoryModal');
  if (modal) modal.style.display = 'none';
};

window.fetchBetHistory = async function() {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return;
  const user = JSON.parse(userStr);
  const input = document.getElementById('historyDateInput');
  const dateStr = input ? input.value : "";
  const tbody = document.getElementById('betHistoryBody');
  if(tbody) tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';
  
  try {
    const res = await API.betHistory(user.username, dateStr);
    if(res.status && res.tickets && res.tickets.length > 0) {
      if(tbody) {
        tbody.innerHTML = res.tickets.map(t => 
          `<tr>
            <td>${t.id}</td><td>${t.barcode}</td><td>${t.draw_times}</td>
            <td>${t.bet_time}</td><td>${t.qty}</td><td>${t.amount}</td>
          </tr>`
        ).join('');
      }
    } else {
      if(tbody) tbody.innerHTML = '<tr><td colspan="6">No tickets found.</td></tr>';
    }
  } catch(e) {
    if(tbody) tbody.innerHTML = '<tr><td colspan="6">Error loading history.</td></tr>';
  }
};

async function playG() {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return alert("Please Login");
  const user = JSON.parse(userStr);
  
  let all_datas12 = [];
  let total_load_c_amount = 0;
  let total_load_c_qty = 0;
  
  for (let code in allBets) {
    if (allBets[code] > 0) {
      // Strip the letter prefix (e.g., 'A00' -> '00') for the API
      const numCode = code.substring(1);
      all_datas12.push(`${numCode}X${allBets[code]}`);
      total_load_c_amount += allBets[code];
      total_load_c_qty += 1;
    }
  }
  
  if (all_datas12.length === 0) return alert("Please select at least one bet.");
  
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
    console.log("Insert Data Res:", res);
    if(res && res.status) {
      alert(res.message || "Bet placed successfully!");
      clearSelections();
      advanceTimeVal = []; // reset advance selection
      const refreshBtn = document.getElementById('hdrRefresh');
      if (refreshBtn) refreshBtn.click();
    } else {
      alert("Error: " + (res.message || "Failed to place bet."));
    }
  } catch (err) {
    console.error(err);
    alert("Error placing bet.");
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

    if (!userString) {
      window.location.href = '../index.html';
      return;
    }

    let user;
    try {
      user = JSON.parse(userString);
    } catch(e) {
      window.location.href = '../index.html';
      return;
    }

    const username = user.username;

    if (!username) {
      window.location.href = '../index.html';
      return;
    }

    try {
      const resp = await API.balance(username);
      if (resp && resp.success === true && resp.data) {
        if (balanceEl) balanceEl.textContent = resp.data.balance;
      }
    } catch (err) {
      console.error('Balance fetch error:', err);
    }
  };

  const refreshBtn = document.getElementById('hdrRefresh');
  if (refreshBtn)  refreshBtn.onclick = getBalance;

  getBalance();

  // Sync Timer API initially
  const syncTimer = async () => {
    try {
      const res = await API.timer();
      if(res.success && res.time) {
        countdown1 = parseInt(res.time);
      }
    } catch(e) { console.error('Timer API Error:', e); }
  };
  syncTimer();

  updateClock();
  setInterval(updateClock, 1000);
  setInterval(updateCountdowns, 1000);
});