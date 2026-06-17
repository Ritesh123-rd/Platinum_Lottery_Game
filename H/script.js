let allBets = {};
let currentPage = 'H';
let countdown1 = 379;
let currentRangeIndex = 0;

const config = {
  gamename: 'PLATINUM HIT', ver: 'V-4.0.0.0',
  btns: [
    { t: 'Cancel (F10)', c: '' },
    { t: 'Reprint (F2)', c: '' },
    { t: 'Advance Spot', c: '' }, { t: 'INFO (F3)', c: 'red' },
    { t: 'Result (F4)', c: 'pink' }, 'SP', 'SP',
    { t: 'Random Pick', c: 'rand' }, { t: 'fam' }, { t: 'V-3.0.0.0', c: 'ver' }
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

function switchPage(p) {
  if (p === 'H') return;
  showGlobalCustomAlert('Loading ...!');
  setTimeout(() => {
    if (p === 'G') window.location.href = '../G/index.html';
    else window.location.href = '../' + p + '/index.html';
  }, 300);
}

function buildSidebar(btns) {
  const sb = document.getElementById('rightSb');
  if(!sb) return;
  sb.innerHTML = '';
  btns.forEach(b => {
    if (typeof b !== 'object') {
      if (b === 'SP') {
        const sp = document.createElement('div'); sp.className = 'sb-spacer'; sb.appendChild(sp);
      }
      return;
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
      btn.onclick = randomPick;
      sb.appendChild(btn); return;
    }

    const btn = document.createElement('button');
    btn.className = 'sb-btn ' + (b.c || '');
    btn.textContent = b.t;
    
    const txt = b.t || '';
    if (txt.includes('Clear')) btn.onclick = clearSelections;
    if (txt.includes('Cancel')) btn.onclick = openCancelModal;
    if (txt.includes('Advance')) btn.onclick = openAdvanceModal;
    if (txt.includes('Reprint')) btn.onclick = openReprintModal;
    if (txt.includes('INFO')) btn.onclick = openBetHistoryModal;
    if (txt.includes('Random')) btn.onclick = randomPick;
    if (txt.includes('Result')) btn.onclick = openResultModal;
    
    sb.appendChild(btn);
  });
}

function openResultModal() {
  const modal = document.getElementById('resultModal');
  if (modal) {
    modal.style.display = 'flex';
    // Set today's date label
    const now = new Date();
    const lbl = document.getElementById('hResultsDateLabel');
    if (lbl) {
      const pad = x => String(x).padStart(2, '0');
      let h = now.getHours(), ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
      lbl.textContent = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${h}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${ap}`;
    }
    const codeEl = document.getElementById('hFilterCode');
    if (codeEl) {
      codeEl.textContent = String(currentRangeIndex * 100).padStart(4, '0');
    }
    // Load results immediately
    hLoadResults();
    // Switch to results tab
    hSwitchTab('results');
    // Populate Game tab with user data
    hLoadGameSlip();
  }
}

function closeResultModal() {
  const modal = document.getElementById('resultModal');
  if (modal) modal.style.display = 'none';
}

window.hSwitchTab = function(tabName) {
  const tabs = ['results', 'game', 'previous', 'report'];
  tabs.forEach(t => {
    const btn = document.getElementById('htab-' + t);
    const body = document.getElementById('htab-content-' + t);
    if (btn) btn.classList.remove('active');
    if (body) body.style.display = 'none';
  });
  const activeBtn = document.getElementById('htab-' + tabName);
  const activeBody = document.getElementById('htab-content-' + tabName);
  if (activeBtn) activeBtn.classList.add('active');
  if (activeBody) activeBody.style.display = 'block';

  const titles = { results: 'Result', game: 'Game', previous: 'View Previous Game', report: 'Report' };
  const titleEl = document.getElementById('hResultTitle');
  if (titleEl) titleEl.textContent = titles[tabName] || '';

  if (tabName === 'previous') hLoadPreviousGames();
  if (tabName === 'game') hLoadGameSlip();
};

window.hLoadResults = async function() {
  const tbody = document.getElementById('hResultsBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="2" style="padding:20px; text-align:center; color:#ccc;">Loading...</td></tr>';
  try {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth()+1).padStart(2,'0');
    const dd = String(now.getDate()).padStart(2,'0');
    const todayIsoDate = `${yyyy}-${mm}-${dd}`;
    const resp = await API.resultDateWise(todayIsoDate);
    if (resp && resp.status === true && Array.isArray(resp.results) && resp.results.length > 0) {
      tbody.innerHTML = resp.results.map(r => {
        const nums = r.result.split(',').map(n => n.trim());
        const formattedNums = nums.map(n => String(n).padStart(4, '0')).join(' | ') + ' |';
        return `
          <tr style="border-bottom:1px solid rgba(255,255,255,0.15);">
            <td style="padding:10px 15px; font-weight:bold; font-size:16px; color:#fff; text-align:left; width:120px; white-space:nowrap;">${r.time}</td>
            <td style="padding:10px 15px; font-size:16px; color:#fff; text-align:left; font-family:'Oswald', sans-serif; letter-spacing:1px; white-space:nowrap;">${formattedNums}</td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="2" style="padding:30px; text-align:center; color:#aaa;">No results found for today.</td></tr>';
    }
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="2" style="padding:30px; text-align:center; color:#ed1c24;">Error loading results.</td></tr>';
  }
};

window.hSetFilter = function(filter) {
  const btn = document.getElementById('hFilterAll');
  if (btn) btn.style.background = '#f1ce07';
};

window.hLoadGameSlip = async function() {
  const userStr = sessionStorage.getItem('user');
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;

  document.getElementById('hGameDateTime').textContent = dateStr;
  document.getElementById('hGameDateFrom').textContent = dateStr;
  document.getElementById('hGameDateTo').textContent = dateStr;

  if (!userStr) {
    document.getElementById('hGameAgentCode').textContent = '---';
    document.getElementById('hGameInPoints').textContent = '0.00';
    document.getElementById('hGameOutPoints').textContent = '0.00';
    document.getElementById('hGameMargin').textContent = '0.00';
    document.getElementById('hGameNetToPay').textContent = '0.00';
    return;
  }
  const user = JSON.parse(userStr);
  document.getElementById('hGameAgentCode').textContent = user.username || '---';

  try {
    const dd = String(now.getDate()).padStart(2,'0');
    const mm = String(now.getMonth()+1).padStart(2,'0');
    const yyyy = now.getFullYear();
    const res = await API.betHistory(user.username, `${yyyy}-${mm}-${dd}`);
    let inPts = 0;
    let outPts = 0;
    if (res && res.status && res.tickets) {
      res.tickets.forEach(t => {
        inPts += Number(t.amount) || 0;
        outPts += Number(t.win_amt) || 0;
      });
    }
    const margin = inPts * 0.06;
    const netToPay = inPts - margin - outPts;
    document.getElementById('hGameInPoints').textContent = inPts.toFixed(2);
    document.getElementById('hGameOutPoints').textContent = outPts.toFixed(2);
    document.getElementById('hGameMargin').textContent = margin.toFixed(2);
    document.getElementById('hGameNetToPay').textContent = netToPay.toFixed(2);
  } catch(e) {
    document.getElementById('hGameInPoints').textContent = '0.00';
    document.getElementById('hGameOutPoints').textContent = '0.00';
    document.getElementById('hGameMargin').textContent = '0.00';
    document.getElementById('hGameNetToPay').textContent = '0.00';
  }
};

window.hPrintGameSlip = function() {
  const slipContent = document.querySelector('#htab-content-game div[style*="background:#fff"]');
  if (!slipContent) { window.print(); return; }
  const w = window.open('','_blank','width=500,height=600');
  w.document.write(`<html><head><title>Game Slip</title></head><body style="font-family:Arial;font-size:14px;padding:20px;">${slipContent.innerHTML}<br><button onclick="window.print()">Print</button></body></html>`);
  w.document.close();
};

window.hLoadPreviousGames = async function() {
  const msgEl = document.getElementById('hPreviousGamesMsg');
  if (!msgEl) return;
  msgEl.textContent = 'Loading...';
  try {
    const resp = await API.result();
    if (resp && resp.status === true) {
      msgEl.textContent = 'No Result Found.';
    } else {
      msgEl.textContent = 'No Result Found.';
    }
  } catch(e) {
    msgEl.textContent = 'No Result Found.';
  }
};

let _hReportType = 'daywise';
window.hOpenReport = function(type) {
  _hReportType = type;
  const popup = document.getElementById('hReportPopup');
  if (!popup) return;
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2,'0');
  const dd = String(now.getDate()).padStart(2,'0');
  const isoToday = `${yyyy}-${mm}-${dd}`;
  const dispToday = `${dd}/${mm}/${yyyy}`;
  const fromDisp = document.getElementById('hReportFromDisplay');
  const toDisp = document.getElementById('hReportToDisplay');
  const fromPick = document.getElementById('hReportFromPicker');
  const toPick = document.getElementById('hReportToPicker');
  if (fromDisp) fromDisp.value = dispToday;
  if (toDisp) toDisp.value = dispToday;
  if (fromPick) fromPick.value = isoToday;
  if (toPick) toPick.value = isoToday;
  const content = document.getElementById('hReportContent');
  if (content) content.innerHTML = '';
  popup.style.display = 'flex';
};

window.hCloseReport = function() {
  const popup = document.getElementById('hReportPopup');
  if (popup) popup.style.display = 'none';
};

window.hSyncReportDate = function(which, isoVal) {
  if (!isoVal) return;
  const parts = isoVal.split('-');
  if (parts.length !== 3) return;
  const disp = `${parts[2]}/${parts[1]}/${parts[0]}`;
  const dispEl = document.getElementById(which === 'from' ? 'hReportFromDisplay' : 'hReportToDisplay');
  if (dispEl) dispEl.value = disp;
};

window.hShowReport = async function() {
  const content = document.getElementById('hReportContent');
  if (!content) return;
  content.innerHTML = '<p style="color:#555;text-align:center;padding:30px;font-size:18px;">Loading report...</p>';

  const userStr = sessionStorage.getItem('user');
  if (!userStr) {
    content.innerHTML = '<p style="color:#c00;text-align:center;padding:30px;font-size:18px;">Please login to view report.</p>';
    return;
  }
  const user = JSON.parse(userStr);
  const fromPick = document.getElementById('hReportFromPicker');
  const toPick = document.getElementById('hReportToPicker');
  const fromDate = fromPick ? fromPick.value : '';
  const toDate = toPick ? toPick.value : '';

  try {
    const res = await API.betHistory(user.username, fromDate);
    
    // Formatting date to DD/MM/YYYY for the sub-header row or display
    const dParts = fromDate.split('-');
    const displayDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : fromDate;

    if (res && res.status && res.tickets && res.tickets.length > 0) {
      if (_hReportType === 'daywise') {
        const byDate = {};
        res.tickets.forEach(t => {
          const dStr = t.record_date || fromDate;
          if (!byDate[dStr]) {
            byDate[dStr] = { inPoints: 0, outPoints: 0 };
          }
          byDate[dStr].inPoints += Number(t.amount) || 0;
          byDate[dStr].outPoints += Number(t.win_amt) || 0;
        });

        let totalInPoints = 0;
        let totalMargin = 0;
        let totalOutPoints = 0;
        let totalNetToPay = 0;
        let idx = 0;

        const dateRows = Object.entries(byDate).map(([dStr, data]) => {
          const inPts = data.inPoints;
          const margin = inPts * 0.06;
          const outPts = data.outPoints;
          const net = inPts - margin - outPts;

          totalInPoints += inPts;
          totalMargin += margin;
          totalOutPoints += outPts;
          totalNetToPay += net;

          const bg = idx % 2 === 0 ? '#e8e8e8' : '#ffffff';
          idx++;

          return `
            <tr style="background:${bg}; color:#000; border-bottom:1px solid #ccc; font-weight:bold; font-size:16px;">
              <td style="padding:12px 15px; text-align:left; border:1px solid #ccc;">${dStr}</td>
              <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${inPts.toFixed(2)}</td>
              <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${margin.toFixed(2)}</td>
              <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${outPts.toFixed(2)}</td>
              <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${net.toFixed(2)}</td>
            </tr>
          `;
        }).join('');

        content.innerHTML = `
          <table style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif; font-size:16px; border:1px solid #ccc;">
            <thead>
              <tr style="background:#cccccc; color:#000; font-weight:bold;">
                <th style="padding:12px 15px; text-align:left; border:1px solid #aaa; font-size:16px;">DATE</th>
                <th style="padding:12px 15px; text-align:right; border:1px solid #aaa; font-size:16px;">In Points</th>
                <th style="padding:12px 15px; text-align:right; border:1px solid #aaa; font-size:16px;">Margin</th>
                <th style="padding:12px 15px; text-align:right; border:1px solid #aaa; font-size:16px;">Out Points</th>
                <th style="padding:12px 15px; text-align:right; border:1px solid #aaa; font-size:16px;">Net To Pay</th>
              </tr>
            </thead>
            <tbody>
              ${dateRows}
            </tbody>
            <tfoot>
              <tr style="background:#cccccc; color:#000; font-weight:bold; font-size:16px; border-top:2px solid #999;">
                <td style="padding:12px 15px; text-align:left; border:1px solid #ccc;"></td>
                <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${totalInPoints.toFixed(2)}</td>
                <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${totalMargin.toFixed(2)}</td>
                <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${totalOutPoints.toFixed(2)}</td>
                <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${totalNetToPay.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        `;
      } else {
        // Game wise
        const byGame = {};
        
        function getGameName(t) {
          if (t.game_name) return t.game_name;
          if (t.spot_code) return t.spot_code;
          if (t.game) {
            if (t.game === 'G') return 'GREEN';
            if (t.game === 'H') return 'PLATINUM HIT';
            if (t.game === '3D') return 'SPOT 3 A';
            if (t.game === '4D') return 'SPOT 3 B';
            if (t.game === 'C') return 'SPOT 3 C';
            return t.game;
          }
          return 'SPOT 3 A'; // fallback default
        }

        res.tickets.forEach(t => {
          let gName = getGameName(t);
          if (!byGame[gName]) {
            byGame[gName] = { playPoints: 0, winPoints: 0 };
          }
          byGame[gName].playPoints += Number(t.amount) || 0;
          byGame[gName].winPoints += Number(t.win_amt) || 0;
        });

        let totalPlayPoints = 0;
        let totalMargin = 0;
        let totalWinPoints = 0;
        let totalNetPay = 0;
        let idx = 0;

        const gameRows = Object.entries(byGame).map(([name, data]) => {
          const play = data.playPoints;
          const margin = play * 0.06;
          const win = data.winPoints;
          const net = play - margin - win;

          totalPlayPoints += play;
          totalMargin += margin;
          totalWinPoints += win;
          totalNetPay += net;

          const bg = idx % 2 === 0 ? '#e8e8e8' : '#ffffff';
          idx++;

          return `
            <tr style="background:${bg}; color:#000; border-bottom:1px solid #ccc; font-weight:bold; font-size:16px;">
              <td style="padding:12px 15px; text-align:left; border:1px solid #ccc;">${name}</td>
              <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${play.toFixed(2)}</td>
              <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${margin.toFixed(2)}</td>
              <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${win.toFixed(2)}</td>
              <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${net.toFixed(2)}</td>
            </tr>
          `;
        }).join('');

        content.innerHTML = `
          <table style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif; font-size:16px; border:1px solid #ccc;">
            <thead>
              <tr style="background:#cccccc; color:#000; font-weight:bold;">
                <th style="padding:12px 15px; text-align:left; border:1px solid #aaa; font-size:16px;">GAME NAME</th>
                <th style="padding:12px 15px; text-align:right; border:1px solid #aaa; font-size:16px;">PLAY POINTS</th>
                <th style="padding:12px 15px; text-align:right; border:1px solid #aaa; font-size:16px;">MARGIN</th>
                <th style="padding:12px 15px; text-align:right; border:1px solid #aaa; font-size:16px;">WIN POINTS</th>
                <th style="padding:12px 15px; text-align:right; border:1px solid #aaa; font-size:16px;">NET PAY</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background:#ffffff; font-weight:bold;"><td colspan="5" style="padding:12px 15px; text-align:left; color:#0022ff;">${displayDate}</td></tr>
              ${gameRows}
            </tbody>
            <tfoot>
              <tr style="background:#cccccc; color:#000; font-weight:bold; font-size:16px; border-top:2px solid #999;">
                <td style="padding:12px 15px; text-align:left; border:1px solid #ccc;"></td>
                <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${totalPlayPoints.toFixed(2)}</td>
                <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${totalMargin.toFixed(2)}</td>
                <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${totalWinPoints.toFixed(2)}</td>
                <td style="padding:12px 15px; text-align:right; border:1px solid #ccc;">${totalNetPay.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        `;
      }
    } else {
      content.innerHTML = '<p style="color:#555;text-align:center;padding:40px;font-size:18px;">No data found for selected date range.</p>';
    }
  } catch(e) {
    content.innerHTML = '<p style="color:#c00;text-align:center;padding:30px;font-size:18px;">Error loading report.</p>';
  }
};

function randomPick() {
  const startNum = currentRangeIndex * 100;
  const avail = [];
  for (let i = 0; i < 100; i++) {
    const ns = String(startNum + i).padStart(4, '0');
    if (!allBets[ns]) avail.push(i);
  }
  if (!avail.length) return;
  const i = avail[Math.floor(Math.random() * avail.length)];
  const val = Math.floor(Math.random() * 10) + 1; // Pick 1-10 qty
  handleInputApply(i, val);
  renderHGridNumbers();
  updateStats();
}

function openCancelModal() {
  const modal = document.getElementById('cancelModal');
  if (modal) {
    modal.style.display = 'flex';
    fetchCancelHistory();
  }
}

function closeCancelModal() {
  const modal = document.getElementById('cancelModal');
  if (modal) modal.style.display = 'none';
}

async function fetchCancelHistory() {
  const body = document.getElementById('cancelHistoryBody');
  const userStr = sessionStorage.getItem('user');
  if (!body || !userStr) return;
  const user = JSON.parse(userStr);

  body.innerHTML = '<tr><td colspan="6" style="padding:40px; color:#666;">Fetching active bets...</td></tr>';
  try {
    const res = await API.currentDrawBetHistory(user.username);
    if (res && res.status === true && Array.isArray(res.tickets)) {
      if (res.tickets.length === 0) {
        body.innerHTML = '<tr><td colspan="6" style="padding:40px; color:#999;">No active tickets found for this draw.</td></tr>';
        return;
      }
      body.innerHTML = res.tickets.map(t => {
        const dTime = t.draw_times || t.draw_time || '--:--';
        return `
        <tr style="border-bottom:1px solid #222;">
          <td style="padding:12px;">${t.id}</td>
          <td style="padding:12px; font-weight:bold; color:#ed1c24;">${t.barcode}</td>
          <td style="padding:12px;">${dTime}</td>
          <td style="padding:12px;">${t.qty}</td>
          <td style="padding:12px;">${t.amount}</td>
          <td style="padding:12px;">
            <button onclick="submitCancel('${t.id}')" style="background:#000; color:#ed1c24; border:1px solid #ed1c24; padding:5px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">CANCEL</button>
          </td>
        </tr>
      `}).join('');
    } else { body.innerHTML = '<tr><td colspan="6" style="padding:40px;">No bets found.</td></tr>'; }
  } catch (e) { body.innerHTML = '<tr><td colspan="6" style="padding:40px;">Error loading.</td></tr>'; }
}

async function submitCancel(ticketId) {
  if (!ticketId) return;
  const modal = document.getElementById('confirmCancelModal');
  const targetIdEl = document.getElementById('cancelTargetId');
  const finalBtn = document.getElementById('finalCancelBtn');
  
  if (modal && targetIdEl && finalBtn) {
    targetIdEl.textContent = `ID: ${ticketId}`;
    modal.style.display = 'flex';
    
    finalBtn.onclick = async () => {
      finalBtn.disabled = true;
      finalBtn.textContent = "CANCELLING...";
      try {
        const res = await API.ticketCancel(ticketId);
        if (res && (res.status === true || res.status === "true")) {
          showStatusModal("SUCCESS", res.message || "Ticket cancelled successfully!", "success");
          closeConfirmCancel();
          fetchCancelHistory();
          if (typeof window.getBalance === 'function') window.getBalance();
          setTimeout(() => { window.location.reload(); }, 1500);
        } else {
          showStatusModal("CANCEL FAILED", res.message || "Unknown error", "error");
        }
      } catch (err) {
        console.error("Cancel error:", err);
        showStatusModal("ERROR", "Error during cancellation.", "error");
      } finally {
        finalBtn.disabled = false;
        finalBtn.textContent = "YES, CANCEL IT";
      }
    };
  }
}

function closeConfirmCancel() {
  const modal = document.getElementById('confirmCancelModal');
  if (modal) modal.style.display = 'none';
}

async function fetchLatestResult() {
  const container = document.getElementById('hWinners');
  if (!container) return;
  try {
    const res = await API.result();
    console.log("Header Results Response:", res);
    if (res && res.status == true) {
      const rawRes = res.pivious_result || res.previous_result || res.result || "";
      const results = rawRes ? rawRes.split(',').map(n => n.trim()) : [];
      let html = "";
      if (results.length > 0) {
        html = results.map(n => `<div class="h-wnum">${n}</div>`).join('');
      } else {
        html = new Array(10).fill(0).map(() => `<div class="h-wnum">--</div>`).join('');
      }
      
      const drawTime = res.previous_draw_time || res.time || '--:--';
      html += `<div class="h-time-box">${drawTime}</div>`;
      html += `<div class="h-ver-lbl" id="hdrVer">v-3.5.0.8</div>`;
      container.innerHTML = html;
    }
  } catch (e) {
    console.error("Header results fetch error:", e);
  }
}

async function fetchLastTransaction() {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return;
  const user = JSON.parse(userStr);
  const el = document.getElementById('hdrLastTx');
  if (!el) return;

  try {
    const res = await API.lastDrawBetAmount(user.username);
    if (res && res.status == true) {
      el.textContent = res.last_bet_amount || '0';
    }
  } catch (e) {
    console.error("Last tx fetch error:", e);
  }
}

async function handleClaim() {
  const inp = document.getElementById('claimInput');
  if (!inp || !inp.value) return;
  const bc = inp.value.trim().toUpperCase();
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return;
  const user = JSON.parse(userStr);

  try {
    const res = await API.claimTicket({ barcode_number: bc, username: user.username });
    openClaimStatus(res);
    inp.value = '';
    if (typeof window.getBalance === 'function') window.getBalance();
  } catch (e) {
    console.error("Claim error:", e);
    openClaimStatus({ status: false, message: "Connection error" });
  }
}

function openClaimStatus(res) {
  const modal = document.getElementById('claimStatusModal');
  const title = document.getElementById('claimStatusTitle');
  const msg = document.getElementById('claimStatusMessage');
  const icon = document.getElementById('claimStatusIcon');
  const winSection = document.getElementById('claimWinSection');
  const winAmt = document.getElementById('claimWinAmount');
  
  if (!modal) return;
  modal.style.display = 'flex';

  if (res && (res.status === true || res.status === "true")) {
    icon.textContent = "🏆";
    title.textContent = "CONGRATS! WINNER";
    title.style.color = "#0f0";
    msg.textContent = res.message || "Ticket claimed successfully.";
    winSection.style.display = "block";
    winAmt.textContent = res.win_amt || res.winAmount || "---";
  } else {
    icon.textContent = "❌";
    title.textContent = "NOT A WINNER";
    title.style.color = "#ed1c24";
    msg.textContent = res.message || "Better luck next time!";
    winSection.style.display = "none";
  }
}

function closeClaimStatus() {
  const modal = document.getElementById('claimStatusModal');
  if (modal) modal.style.display = 'none';
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
              rangePts[rangeIdx] += qty * 2; // Price is 2
          }
          
          totalSpots++;
          totalQty += qty;
          totalPts += qty * 2; // Price is 2
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
  
  const drawCount = advanceTimeVal.length > 0 ? advanceTimeVal.length : 1;
  const finalSpots = totalSpots * drawCount;
  const finalPoints = totalPts * drawCount;

  const spotsEl = document.getElementById('statSpots');
  const prizeEl = document.getElementById('statPrize');
  const serviceEl = document.getElementById('statGameService');
  const totalPtsEl = document.getElementById('statTotalPts');
  
  if (spotsEl) spotsEl.textContent = finalSpots; 
  if (prizeEl) prizeEl.textContent = (finalPoints * 0.9).toFixed(2);
  if (serviceEl) serviceEl.textContent = (finalPoints * 0.1).toFixed(2);
  if (totalPtsEl) totalPtsEl.textContent = finalPoints;
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

let advanceTimeVal = [];

async function playH() {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return showStatusModal("LOGIN REQUIRED", "Please login to play.", "error");
  const user = JSON.parse(userStr);

  let hasBets = false;
  let betsArr = [];
  let baseQty = 0;
  let baseAmt = 0;

  for (let num in allBets) {
    if (allBets[num] > 0) {
      hasBets = true;
      betsArr.push(`${num}X${allBets[num]}`);
      baseQty++;
      baseAmt += allBets[num];
    }
  }

  if (!hasBets) {
    showStatusModal("NO BETS", "Please enter some points before playing!", "error");
    return;
  }

  const drawCount = advanceTimeVal.length > 0 ? advanceTimeVal.length : 1;
  const totalAmt = baseAmt * drawCount;
  const totalQty = baseQty * drawCount;

  const payload = {
    username: user.username,
    all_datas12: betsArr.join(','),
    total_load_c_amount: totalAmt,
    total_load_c_qty: totalQty,
    advancr_draw_time: advanceTimeVal.length > 0 ? advanceTimeVal : ""
  };

  try {
    const res = await API.insertData(payload);
    if (res && res.status === true) {
      fetchLastTransaction();
      if (res.barcodes && res.barcodes.length > 0) {
        // Collect all tickets to print in a single job
        try {
          const ticketFetchPromises = res.barcodes.map(bc => API.reprintTicket(bc, user.username));
          const results = await Promise.all(ticketFetchPromises);
          const allTickets = [];
          results.forEach(r => {
            if (r && r.status && r.tickets) {
              allTickets.push(...r.tickets);
            }
          });
          if (allTickets.length > 0) {
            printTickets(allTickets);
          }
        } catch (err) {
          console.error("Auto print collection error:", err);
        }
      }
      clearSelections();
      advanceTimeVal = [];
      if (typeof window.getBalance === 'function') window.getBalance();
      setTimeout(() => { window.location.reload(); }, 1500);
    } else {
      showStatusModal("FAILED", res.message || "Failed to place bet.", "error");
    }
  } catch (e) {
    console.error("Bet error:", e);
    showStatusModal("ERROR", "System error while placing bet.", "error");
  }
}

let allAvailableSlotsH = [];

async function openAdvanceModal() {
  const modal = document.getElementById('advanceModal');
  const grid = document.getElementById('advanceDrawGrid');
  const sa = document.getElementById('selectAllDraws');
  const inp = document.getElementById('advanceDrawCountInp');
  if (!modal || !grid) return;

  if (inp) inp.value = ''; // Reset input
  grid.innerHTML = '<div style="color:white; padding:20px;">Loading draws...</div>';
  if (sa) sa.checked = false;
  advanceTimeVal = [];
  modal.style.display = 'flex';

  try {
    const res = await API.advancDrawTime();
    if (res && res.status === true && Array.isArray(res.slots)) {
      allAvailableSlotsH = res.slots;
      renderDrawSlotsH();
    } else {
      grid.innerHTML = '<p style="color:#ed1c24; padding:20px;">No upcoming draws available.</p>';
    }
  } catch (e) {
    console.error("Advance draw fetch error:", e);
    grid.innerHTML = '<p style="color:#ed1c24; padding:20px;">Error loading draws.</p>';
  }
}

function renderDrawSlotsH() {
  const grid = document.getElementById('advanceDrawGrid');
  if (!grid || !allAvailableSlotsH) return;

  grid.innerHTML = allAvailableSlotsH.map((s) => {
    const isChecked = advanceTimeVal.includes(s);
    return `<label style="display:flex;align-items:center;background:${isChecked ? '#ed1c24' : '#222'};padding:10px;border-radius:6px;gap:8px;color:#fff;cursor:pointer;transition:background 0.2s;">
              <input type="checkbox" class="adv_slot_cb" value="${s}" ${isChecked ? 'checked' : ''} onchange="toggleSlotH('${s}', this.checked)">${s}
            </label>`;
  }).join('');
  updateDrawCountUI();
}

window.toggleSlotH = function (slot, isChecked) {
  if (isChecked) {
    if (!advanceTimeVal.includes(slot)) advanceTimeVal.push(slot);
  } else {
    advanceTimeVal = advanceTimeVal.filter(s => s !== slot);
  }
  renderDrawSlotsH();
};

window.selectXDraws = function (count) {
  const n = parseInt(count);
  if (isNaN(n) || n < 0) {
    advanceTimeVal = [];
  } else {
    advanceTimeVal = allAvailableSlotsH.slice(0, n);
  }
  renderDrawSlotsH();
};

function updateDrawCountUI() {
  const countEl = document.getElementById('selectedDrawCount');
  if (countEl) countEl.textContent = advanceTimeVal.length;
}

function toggleSelectAllDraws(isChecked) {
  if (isChecked) {
    advanceTimeVal = [...allAvailableSlotsH];
  } else {
    advanceTimeVal = [];
  }
  renderDrawSlotsH();
}

function closeAdvanceModal() {
  const modal = document.getElementById('advanceModal');
  if (modal) modal.style.display = 'none';
}

function confirmAdvanceDraw() {
  closeAdvanceModal();
  updateStats();
}

async function fetchBetHistory() {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return;
  const user = JSON.parse(userStr);
  const dateInput = document.getElementById('historyDateInput');
  const body = document.getElementById('historyTableBody');
  if (!dateInput || !body) return;

  body.innerHTML = '<tr><td colspan="8" style="padding:40px;">Fetching records...</td></tr>';

  try {
    const res = await API.betHistory(user.username, dateInput.value);
    if (res && res.status === true && Array.isArray(res.tickets)) {
      if (res.tickets.length === 0) {
        body.innerHTML = '<tr><td colspan="8" style="padding:40px; color:#999;">No records found for this date.</td></tr>';
        return;
      }
      body.innerHTML = res.tickets.map(t => {
        const statusClass = t.claim_status === "1" ? "claimed" : "unclaimed";
        const statusText = t.claim_status === "1" ? "CLAIMED" : "PENDING";
        const winColor = parseFloat(t.win_amt) > 0 ? "#0f0" : "#fff";
        return `
          <tr style="border-bottom:1px solid #222;">
            <td style="padding:12px;">${t.id}</td>
            <td style="padding:12px; font-weight:bold; color:#ed1c24;">${t.barcode}</td>
            <td style="padding:12px;">${t.draw_times}</td>
            <td style="padding:12px;">${t.bet_time}</td>
            <td style="padding:12px;">${t.qty}</td>
            <td style="padding:12px;">${t.amount}</td>
            <td style="padding:12px; font-weight:bold; color:${winColor}">${t.win_amt}</td>
            <td style="padding:12px;"><span style="padding:4px 8px; border-radius:4px; font-size:11px; background:${t.claim_status === '1' ? '#060' : '#444'}">${statusText}</span></td>
          </tr>
        `;
      }).join('');
    } else {
      body.innerHTML = '<tr><td colspan="8" style="padding:40px; color:#ed1c24;">Error: ' + (res.message || "Failed to load history") + '</td></tr>';
    }
  } catch (e) {
    body.innerHTML = '<tr><td colspan="8" style="padding:40px; color:#ed1c24;">Connection error.</td></tr>';
  }
}

function openBetHistoryModal() {
  const modal = document.getElementById('betHistoryModal');
  if (modal) {
    modal.style.display = 'flex';
    const dateInput = document.getElementById('historyDateInput');
    if (dateInput && !dateInput.value) {
      const now = new Date();
      dateInput.value = now.toISOString().split('T')[0];
    }
    fetchBetHistory();
  }
}

function closeBetHistoryModal() {
  const modal = document.getElementById('betHistoryModal');
  if (modal) modal.style.display = 'none';
}

// ==========================================
// REPRINT LOGIC (MATCHING G GAME)
// ==========================================
async function openReprintModal() {
  const modal = document.getElementById('reprintModal');
  if (modal) {
    modal.style.display = 'flex';
    const dateInp = document.getElementById('reprintDateInput');
    if (dateInp && !dateInp.value) {
      dateInp.value = new Date().toISOString().split('T')[0];
    }
    fetchReprintHistory();
  }
}

function closeReprintModal() {
  const modal = document.getElementById('reprintModal');
  if (modal) modal.style.display = 'none';
}

async function fetchReprintHistory() {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return;
  const user = JSON.parse(userStr);
  const dateInp = document.getElementById('reprintDateInput');
  const dStr = (dateInp && dateInp.value) ? dateInp.value : new Date().toISOString().split('T')[0];
  const body = document.getElementById('reprintHistoryBody');
  if (!body) return;

  body.innerHTML = '<tr><td colspan="6" style="padding:40px; color:#666;">Loading ' + dStr + '...</td></tr>';
  try {
    const res = await API.betHistory(user.username, dStr);
    if (res && res.status && Array.isArray(res.tickets)) {
      if (res.tickets.length === 0) {
        body.innerHTML = '<tr><td colspan="6" style="padding:40px; color:#999;">No records found.</td></tr>';
        return;
      }
      body.innerHTML = res.tickets.map(t => {
        const dTime = t.draw_times || t.draw_time || '--:--';
        return `
        <tr style="border-bottom:1px solid #222;">
          <td style="padding:12px;">${t.id}</td>
          <td style="padding:12px; font-weight:bold; color:#ed1c24;">${t.barcode}</td>
          <td style="padding:12px;">${dTime}</td>
          <td style="padding:12px;">${t.qty}</td>
          <td style="padding:12px;">${t.amount}</td>
          <td style="padding:12px;">
            <button onclick="directReprint('${t.barcode}')" style="background:#ed1c24; color:#fff; border:none; padding:4px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">REPRINT</button>
          </td>
        </tr>
      `}).join('');
    } else { body.innerHTML = '<tr><td colspan="6" style="padding:40px;">No bets found.</td></tr>'; }
  } catch (e) { body.innerHTML = '<tr><td colspan="6" style="padding:40px;">Error loading.</td></tr>'; }
}

async function handleReprintSubmit() {
  const inp = document.getElementById('reprintBarcodeInp');
  if (!inp || !inp.value) return showStatusModal("EMPTY BARCODE", "Please enter barcode.", "error");
  directReprint(inp.value.trim().toUpperCase());
}

async function directReprint(barcode) {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return;
  const user = JSON.parse(userStr);
  try {
    const res = await API.reprintTicket(barcode, user.username);
    if (res && res.status && res.tickets) {
      printTickets(res.tickets);
    } else {
      showStatusModal("FAILED", res.message || "Ticket not found.", "error");
    }
  } catch (e) { showStatusModal("ERROR", "Reprint failed.", "error"); }
}

function printTickets(ticketsArray) {
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

  const ticketsHtml = ticketsArray.map((ticketObj) => {
    const ticket = ticketObj.ticket || ticketObj;
    const lines = ticket.bet_lines || [];
    const barcodeValue = ticket.barcode || 'ERROR';
    const barcodeData = "https://bwipjs-api.metafloor.com/?bcid=code128&text=" + barcodeValue + "&height=10&scale=2&rotate=N&includetext=true";

    const dTime = ticket.draw_times || ticket.draw_time || '--:--';
    const bTime = ticket.bet_time || ticket.tck_time || '--:--';
    const gDate = ticket.record_date || new Date().toISOString().split('T')[0];
    const username = ticket.username || (sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')).username : 'guest');

    // 3-column table logic matching the Rajshri snippet
    let tableRows = "";
    for (let i = 0; i < lines.length; i += 3) {
      tableRows += `<tr>`;
      for (let j = 0; j < 3; j++) {
        const item = lines[i + j];
        if (item) {
          tableRows += `<td style="border:2px solid #000; padding:4px; text-align:center; font-weight:900;">${item.num}</td><td style="border:2px solid #000; padding:4px; text-align:center; font-weight:900;">${item.qty}</td>`;
        } else {
          tableRows += `<td style="border:2px solid #000; padding:4px;"></td><td style="border:2px solid #000; padding:4px;"></td>`;
        }
      }
      tableRows += `</tr>`;
    }

    return `
      <div class="ticket-page" style="text-align:center; font-family:'Courier New', Courier, monospace; width:72mm; margin:0 auto; padding:5px 12px; background:white; color:black; border:none; page-break-after: always;">
        <h2 style="margin:2px 0; font-size:18px; font-weight:900;">PLATINUM LOTTERY HIT</h2>
        <p style="font-size:11px; margin:0; font-weight:bold;">(Ticket valid for 10 days)</p>
        <div style="border-top:1px dashed #000; margin:6px 0;"></div>
        
        <div style="text-align:left; font-size:12px; line-height:1.5; font-weight:900;">
          <div>Game Date : ${gDate}</div>
          <div>Draw Time : ${dTime}</div>
          <div>Ticket Time : ${bTime}</div>
          <div>Retailer ID : ${username}</div>
          <div>Total Point : ${ticket.amount || 0}</div>
          <div>Total Qty : ${ticket.qty || 0}</div>
        </div>

        <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:13px; border:2px solid #000; font-weight:900;">
          <thead>
            <tr>
              <th style="border:2px solid #000; padding:4px;">Num</th><th style="border:2px solid #000; padding:4px;">Qty</th>
              <th style="border:2px solid #000; padding:4px;">Num</th><th style="border:2px solid #000; padding:4px;">Qty</th>
              <th style="border:2px solid #000; padding:4px;">Num</th><th style="border:2px solid #000; padding:4px;">Qty</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>

        <div style="margin-top:12px; text-align:center;">
          <img src="${barcodeData}" style="width:100%; height:auto;" alt="barcode" />
        </div>
        <div style="border-top:1px dashed #000; margin:12px 0;"></div>
       
      </div>
    `;
  }).join('');

  const content = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Receipts</title>
      <style>
        @page { size: auto; margin: 0; }
        body { margin: 0; background: #fff; }
        @media print { .ticket-page { border-bottom: none; } }
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

function updateClock() {
  const n = new Date();
  const pad = x => String(x).padStart(2, '0');
  const dt = document.getElementById('navDatetime');
  if (dt) dt.textContent = `${n.getDate()}/${n.getMonth() + 1}/${n.getFullYear()} | ${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  let h = n.getHours(), ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
  const tm = `${h}:${pad(n.getMinutes())} ${ap}`;
  const ht = document.getElementById('hdrTime'); if (ht) ht.textContent = tm;
}

const syncTimer = async () => {
  try {
    const data = await API.timer();
    if (data && data.success) {
      countdown1 = parseInt(data.time) || 0;
      const drawTimeEl = document.getElementById('hdrDrawTime');
      if (drawTimeEl) drawTimeEl.textContent = data.DrawTime;
    }
  } catch (e) { console.error('Timer sync error:', e); }
};

function updateCountdowns() {
  const box1 = document.getElementById('hdrCountdown');
  if (box1) {
    if (countdown1 > 0) {
      countdown1--;
    }
    box1.textContent = String(Math.floor(countdown1 / 60)).padStart(2, '0') + ':' + String(countdown1 % 60).padStart(2, '0');
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'F7') { 
    e.preventDefault(); 
    const pb = document.getElementById('playBtn');
    if(pb) pb.click(); 
  }
  if (e.key === 'F8') {
    e.preventDefault();
    const ci = document.getElementById('claimInput');
    if(ci) ci.focus();
  }
  if (e.key === 'F3') {
    e.preventDefault();
    openBetHistoryModal();
  }
  if (e.key === 'F2') {
    e.preventDefault();
    openReprintModal();
  }
  if (e.key === 'F4') {
    e.preventDefault();
    openResultModal();
  }
  if (e.key === 'F10') {
    e.preventDefault();
    openCancelModal();
  }
  if (e.key === 'Escape') clearSelections();
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
  document.querySelectorAll('.h-wnum').forEach(el => { el.style.fontSize = clamp(32 * s, 22, 48) + 'px'; });
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
  } else if (window.innerWidth > 600) {
    const scale = window.innerHeight / 768;
    wrapper.style.width = (window.innerWidth / scale) + "px";
    wrapper.style.height = '768px';
    wrapper.style.transformOrigin = 'top left';
    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.position = 'absolute';
    wrapper.style.top = '0';
    wrapper.style.left = '0';

    document.body.style.height = window.innerHeight + 'px';
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

  window.getBalance = async () => {
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

  window.getBalance();
  setInterval(window.getBalance, 5000);

  syncTimer();
  setInterval(syncTimer, 10000);

  const claimInp = document.getElementById('claimInput');
  if (claimInp) {
    claimInp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleClaim();
    });
    // Auto-claim when 10 characters are typed/scanned (matching G game)
    claimInp.addEventListener('input', (e) => {
      if (e.target.value.length === 10) {
          handleClaim();
      }
    });
  }

  fetchLatestResult();
  setInterval(fetchLatestResult, 30000);
  fetchLastTransaction();

  buildSidebar(config.btns);
  buildHGrid();
  updateClock();
  scaleFonts();
  applyMobileScale();
  setInterval(updateClock, 1000);
  setInterval(updateCountdowns, 1000);
});

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
