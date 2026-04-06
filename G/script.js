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
    } else { if(grid) grid.innerHTML = '<p style="color:#f44;">No advance times available.</p>'; }
  } catch (err) { if(grid) grid.innerHTML = '<p style="color:#f44;">Error fetching advance draw times.</p>'; }
};

window.closeAdvanceModal = function() {
  const modal = document.getElementById('advanceModal');
  if (modal) modal.style.display = 'none';
};

window.confirmAdvanceDraw = function() {
  const sels = document.querySelectorAll('.adv_slot_cb:checked');
  advanceTimeVal = Array.from(sels).map(cb => cb.value);
  updateStats();
  closeAdvanceModal();
};

window.openCancelModal = function() {
  const modal = document.getElementById('cancelBetModal');
  if (modal) modal.style.display = 'flex';
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
    } else { if(tbody) tbody.innerHTML = '<tr><td colspan="7">No tickets found.</td></tr>'; }
  } catch(e) { if(tbody) tbody.innerHTML = '<tr><td colspan="7">Error loading history.</td></tr>'; }
};

window.cancelTicket = async function(id) {
  if(!confirm(`Are you sure you want to cancel ticket ${id}?`)) return;
  try {
    const res = await API.cancleTicket(id);
    if(res.status) {
      alert("Ticket cancelled successfully.");
      if (window.fetchCancelHistory) window.fetchCancelHistory();
      const refreshBtn = document.getElementById('hdrRefresh');
      if (refreshBtn) refreshBtn.click();
    } else { alert(res.message || "Failed to cancel ticket."); }
  } catch(e) { alert("Error cancelling ticket."); }
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
    } else { if(tbody) tbody.innerHTML = '<tr><td colspan="6">No tickets found.</td></tr>'; }
  } catch(e) { if(tbody) tbody.innerHTML = '<tr><td colspan="6">Error loading history.</td></tr>'; }
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
    if(res && res.status) {
      const ticketObj = {
        barcode: res.barcode || '0000000000',
        username: user.username,
        record_date: new Date().toISOString().split('T')[0],
        draw_time: advanceTimeVal.length > 0 ? advanceTimeVal[0] : (document.getElementById('hdrTime')?.textContent || ''),
        tck_time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        qty: payloadQty,
        amount: payloadAmount
      };
      const betLines = [];
      for (let code in allBets) {
        if (allBets[code] > 0) { betLines.push({ num: code.substring(1), qty: allBets[code] }); }
      }
      generateReprintTicket(ticketObj, betLines);
      clearSelections();
      advanceTimeVal = [];
      const refreshBtn = document.getElementById('hdrRefresh');
      if (refreshBtn) refreshBtn.click();
    } else { alert("Error: " + (res.message || "Failed to place bet.")); }
  } catch (err) { alert("Error placing bet."); }
}

document.addEventListener('DOMContentLoaded', async () => {
  document.body.classList.add('body-G');
  const wrapper = document.querySelector('.app-wrapper');
  if (wrapper) wrapper.classList.add('layout-g');
  buildSidebar(config.btns);
  buildGGrid();
  const playBtn = document.getElementById('playBtn');
  if (playBtn) playBtn.onclick = playG;
  const powerBtn = document.querySelector('.power-btn');
  if (powerBtn) powerBtn.onclick = () => { const m = document.getElementById('logoutModal'); if(m) m.style.display='flex'; };
  window.closeLogoutModal = () => { const m = document.getElementById('logoutModal'); if (m) m.style.display = 'none'; };
  window.confirmLogout = async () => { sessionStorage.removeItem('user'); window.location.href = '../index.html'; };

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
  if (refreshBtn)  refreshBtn.onclick = getBalance;
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

  const syncTimer = async () => {
    try {
      const res = await API.timer();
      if(res.success && res.time) countdown1 = parseInt(res.time);
    } catch(e) { console.error('Timer API Error:', e); }
  };
  syncTimer();

  updateClock();
  setInterval(updateClock, 1000);
  setInterval(updateCountdowns, 1000);
});

window.openReprintModal = async function() {
  const modal = document.getElementById('reprintModal');
  if (modal) {
    modal.style.display = 'flex';
    const body = document.getElementById('reprintHistoryBody');
    if(body) body.innerHTML = '<tr><td colspan="6" style="padding:20px; color:#fff;">Loading...</td></tr>';
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const username = user ? user.username : 'anil';
    const today = new Date().toISOString().split('T')[0];
    try {
      const res = await API.betHistory(username, today);
      if(body) {
        if(res && res.status === true && res.tickets && res.tickets.length > 0) {
          body.innerHTML = res.tickets.map(t => `
            <tr>
              <td>${t.id}</td>
              <td style="color:#0f0;">${t.barcode}</td>
              <td>${t.draw_times}</td>
              <td>${t.qty}</td>
              <td>${t.amount}</td>
              <td><button onclick="directReprint('${t.barcode}')" style="background:#ed1c24; color:#fff; border:none; padding:4px 10px; border-radius:4px; cursor:pointer;">REPRINT</button></td>
            </tr>`).join('');
        } else { body.innerHTML = '<tr><td colspan="6">No bets found.</td></tr>'; }
      }
    } catch (e) { if(body) body.innerHTML = '<tr><td colspan="6">Error.</td></tr>'; }
  }
};

window.directReprint = async function(barcode) {
  const userStr = sessionStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const username = user ? user.username : 'anil';
  try {
    const res = await API.reprintTicket(barcode, username);
    if(res && res.status === true && res.tickets && res.tickets.length > 0) {
      generateReprintTicket(res.tickets[0], res.tickets[0].bet_lines);
    } else { alert("Ticket not found."); }
  } catch (err) { alert("Reprint failed."); }
};

window.closeReprintModal = function() {
  const modal = document.getElementById('reprintModal');
  if (modal) modal.style.display = 'none';
};

function generateReprintTicket(ticket, lines) {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, ticket.barcode, { format: "CODE128", width: 1.5, height: 40, displayValue: false, margin: 0 });
  const barcodeData = canvas.toDataURL("image/png");

  const printWindow = window.open('', '_blank', 'width=400,height=800');
  let betLinesHtml = '';
  if(lines && Array.isArray(lines)) {
    lines.forEach(line => {
      const numVal = parseInt(line.num);
      const letter = LETTERS[Math.floor(numVal / 10)] || '';
      const fullNum = letter + String(numVal).padStart(2, '0');
      betLinesHtml += `<tr>
          <td style="font-size: 16px; font-weight: bold; padding: 4px 0; border-bottom: 1px solid #ddd; text-align:left;">${fullNum}</td>
          <td style="font-size: 16px; font-weight: bold; padding: 4px 0; border-bottom: 1px solid #ddd; text-align:right;">${line.qty}</td>
        </tr>`;
    });
  }

  const content = `
    <html>
      <head>
        <title>PLATINUM LOTTERY</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { font-family: 'Courier New', Courier, monospace; width: 74mm; margin: 0; padding: 4mm; color: #000; }
          .container { border: 2px solid #000; padding: 5px; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px; }
          .brand { font-size: 26px; font-weight: 900; letter-spacing: 2px; }
          .sub { font-size: 14px; font-weight: bold; }
          .info-sec { font-size: 12px; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
          .row { display: flex; justify-content: space-between; }
          .bet-table { width: 100%; border-collapse: collapse; }
          .total-box { background: #000; color: #fff; padding: 8px; margin-top: 10px; display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; }
          .footer { text-align: center; margin-top: 15px; font-size: 11px; border-top: 1px solid #000; padding-top: 8px; }
          .bc-box { text-align: center; margin: 10px 0; }
          .bc-img { width: 100%; max-height: 50px; }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        <div class="container">
          <div class="header">
            <div class="brand">PLATINUM</div>
            <div class="sub">GREEN WIN GAME</div>
          </div>
          <div class="info-sec">
            <div class="row"><b>ID:</b> <span>${ticket.username}</span></div>
            <div class="row"><b>DATE:</b> <span>${ticket.record_date}</span></div>
            <div class="row"><b>DRAW:</b> <span>${ticket.draw_time}</span></div>
            <div class="row"><b>TIME:</b> <span>${ticket.tck_time}</span></div>
          </div>
          <table class="bet-table">
            <thead>
              <tr style="border-bottom:2px solid #000;">
                <th style="text-align:left;">NUMBER</th>
                <th style="text-align:right;">QTY</th>
              </tr>
            </thead>
            <tbody>${betLinesHtml}</tbody>
          </table>
          <div class="total-box"><span>TOTAL:</span><span>Rs. ${ticket.amount}.00</span></div>
          <div class="bc-box">
            <div style="font-weight:bold; letter-spacing:2px;">${ticket.barcode}</div>
            <img class="bc-img" src="${barcodeData}" />
          </div>
          <div class="footer">
            <div>**********</div>
            <div>GOOD LUCK - PLAY AGAIN</div>
          </div>
        </div>
      </body>
    </html>
  `;
  printWindow.document.write(content);
  printWindow.document.close();
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'F2') { e.preventDefault(); openReprintModal(); }
});