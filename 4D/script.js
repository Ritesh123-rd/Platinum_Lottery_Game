// ==========================================
// ADVANCE DRAW LOGIC (4D)
// ==========================================
let advanceTimeVal = [];

async function openAdvanceModal() {
  const modal = document.getElementById('advanceModal');
  const grid = document.getElementById('advanceDrawGrid');
  if (!modal || !grid) return;

  grid.innerHTML = '<div style="color:white; padding:20px;">Loading draws...</div>';
  advanceTimeVal = [];
  modal.style.display = 'flex';

  try {
    const res = await API.getAdvanceDrawTimes();
    grid.innerHTML = '';
    if (res && res.status === true && Array.isArray(res.slots)) {
      grid.innerHTML = res.slots.map((s) =>
        `<label style="display:flex;align-items:center;background:#222;padding:10px;border-radius:6px;gap:8px;color:#fff;cursor:pointer;">
           <input type="checkbox" class="adv_slot_cb" value="${s}">${s}
        </label>`
      ).join('');
    } else {
      grid.innerHTML = '<p style="color:#ed1c24; padding:20px;">No upcoming draws available.</p>';
    }
  } catch (e) {
    console.error("Advance draw fetch error:", e);
    grid.innerHTML = '<p style="color:#ed1c24; padding:20px;">Error loading draws.</p>';
  }
}

function closeAdvanceModal() {
  const modal = document.getElementById('advanceModal');
  if (modal) modal.style.display = 'none';
}

// No longer needed with checkbox implementation

function confirmAdvanceDraw() {
  const sels = document.querySelectorAll('.adv_slot_cb:checked');
  advanceTimeVal = Array.from(sels).map(cb => cb.value);
  if (advanceTimeVal.length > 0) {
    alert("Advance Draws Selected: " + advanceTimeVal.join(', '));
  }
  closeAdvanceModal();
  updateStats();
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
let latestResults = null;

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
      btn.onclick = randomPick;
      sb.appendChild(btn); return;
    }
    const btn = document.createElement('button');
    btn.className = 'sb-btn ' + (b.c || '');
    btn.textContent = b.t;
    if (b.t.includes('Clear')) btn.onclick = clearSelections;
    if (b.t.includes('Cancel')) btn.onclick = openCancelModal;
    if (b.t.includes('Reprint')) btn.onclick = openReprintModal;
    if (b.t.includes('Advance')) btn.onclick = openAdvanceModal;
    if (b.t.includes('INFO')) btn.onclick = openBetHistoryModal;
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
  
  document.querySelectorAll('.fd-chip-box').forEach((label, idx) => {
     const chk = label.querySelector('input');
     
     // Clicking the label/text area
     label.addEventListener('click', (e) => {
         // Focus on this range regardless of checkbox state
         if (idx === 0) currentMasterStart = 1000;
         else if (idx === 1) currentMasterStart = 3000;
         else if (idx === 2) currentMasterStart = 5000;
         
         // Visual update
         buildFDRangesSidebar();
         renderFDGridItems();
         updateWinnerHeader();
     });

     chk.addEventListener('change', (e) => {
         if (idx === 0) currentMasterStart = 1000;
         else if (idx === 1) currentMasterStart = 3000;
         else if (idx === 2) currentMasterStart = 5000;

         // Build range text from all checked boxes
         let ranges = [];
         let themeColor = "#333"; // Default
         
         const checkedBoxes = document.querySelectorAll('.fd-chip-box input:checked');
         
         checkedBoxes.forEach(cb => {
             const label = cb.parentElement.textContent.trim().split('-')[0];
             ranges.push(label);
             
             // If this one is the current master, use its color
             if (label === String(currentMasterStart)) {
                 if (label === "1000") themeColor = "#ffeb3b";
                 else if (label === "3000") themeColor = "#4caf50";
                 else if (label === "5000") themeColor = "#2196f3";
             }
         });

         // Update Header Title
         const hdrName = document.getElementById('hdrGamename');
         if (hdrName) {
             const rangeStr = ranges.length > 0 ? `(${ranges.join(', ')})` : '(No Range)';
             hdrName.innerHTML = `<div>PLATINUM 4D</div><div style="font-size:0.6em; opacity:0.8;">${rangeStr}</div>`;
         }

         // Update Header Theme Border
         const sharedHdr = document.getElementById('sharedHeaderBar');
         if (sharedHdr) {
             sharedHdr.style.borderLeft = `10px solid ${themeColor}`;
         }

         buildFDRangesSidebar();
         renderFDGridItems();
         updateWinnerHeader();
         
         if (!e.target.checked && checkedBoxes.length === 0) {
             // If nothing is checked, force at least one (optional but usually needed for view)
             e.target.checked = true;
             chk.dispatchEvent(new Event('change'));
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
  const drawCount = advanceTimeVal.length > 0 ? advanceTimeVal.length : 1;
  const grandTotalQty = totalQty * drawCount;
  const grandTotalPts = totalPts * drawCount;

  if (s4s) s4s.textContent = grandTotalQty; 
  if (s4p) s4p.textContent = grandTotalPts;
  
  const spotsEl = document.getElementById('statSpots');
  const prizeEl = document.getElementById('statPrize');
  const totalPtsDisplay = document.querySelector('.main-stats .bb-stat-pod:nth-of-type(2) .bstat:nth-of-type(2) .bval');

  if (spotsEl) spotsEl.textContent = grandTotalQty; 
  if (prizeEl) prizeEl.textContent = grandTotalPts;
  if (totalPtsDisplay) totalPtsDisplay.textContent = grandTotalPts;
}

async function play4D() {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return alert("Please Login");
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
    alert("Please enter some points before playing!");
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
    if (res && (res.status === true || res.status === "true")) {
      alert(res.message || "Bet placed successfully!");
      if (typeof fetchLastTransaction === 'function') fetchLastTransaction();

      // AUTO PRINT LOGIC (Matching H game)
      if (res.barcodes && res.barcodes.length > 0) {
        try {
          const ticketFetchPromises = res.barcodes.map(bc => API.reprintTicket(bc, user.username));
          const results = await Promise.all(ticketFetchPromises);
          const allTickets = [];
          results.forEach(r => {
            if (r && r.status && r.tickets) allTickets.push(...r.tickets);
          });
          if (allTickets.length > 0) printTickets(allTickets);
        } catch (err) {
          console.error("Auto print collection error (4D):", err);
        }
      }

      clearSelections();
      advanceTimeVal = [];
      if (typeof window.getBalance === 'function') window.getBalance();
    } else {
      alert("Failed to place bet. Reason: " + (res ? res.message : "Unknown error"));
    }
  } catch (e) {
    console.error("Bet error:", e);
    alert("System error while placing bet. Check console for details.");
  }
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

// REPRINT LOGIC
function openReprintModal() {
  const modal = document.getElementById('reprintModal');
  if (modal) {
    modal.style.display = 'flex';
    const dateInput = document.getElementById('reprintDateInput');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
    fetchReprintHistory();
  }
}

function closeReprintModal() {
  const modal = document.getElementById('reprintModal');
  if (modal) modal.style.display = 'none';
}

async function fetchReprintHistory() {
  const body = document.getElementById('reprintHistoryBody');
  const dateInput = document.getElementById('reprintDateInput');
  const userStr = sessionStorage.getItem('user');
  if (!body || !dateInput || !userStr) return;
  const user = JSON.parse(userStr);

  body.innerHTML = '<tr><td colspan="6" style="padding:40px; color:#666;">Querying bets...</td></tr>';
  try {
    const res = await API.betHistory(user.username, dateInput.value);
    if (res && res.status === true && Array.isArray(res.tickets)) {
      if (res.tickets.length === 0) {
        body.innerHTML = '<tr><td colspan="6" style="padding:40px; color:#999;">No records for this date.</td></tr>';
        return;
      }
      body.innerHTML = res.tickets.map(t => `
        <tr style="border-bottom:1px solid #222;">
          <td style="padding:12px;">${t.id}</td>
          <td style="padding:12px; font-weight:bold; color:#ed1c24;">${t.barcode}</td>
          <td style="padding:12px;">${t.draw_times}</td>
          <td style="padding:12px;">${t.qty}</td>
          <td style="padding:12px;">${t.amount}</td>
          <td style="padding:12px;">
            <button onclick="handleReprintDirect('${t.barcode}')" style="background:#ed1c24; color:#fff; border:none; padding:5px 15px; border-radius:4px; font-weight:bold; cursor:pointer;">PRINT</button>
          </td>
        </tr>
      `).join('');
    } else { body.innerHTML = '<tr><td colspan="6" style="padding:40px;">No records found.</td></tr>'; }
  } catch (e) {
    console.error("Reprint fetch error:", e);
    body.innerHTML = '<tr><td colspan="6" style="padding:40px;">Error loading data.</td></tr>';
  }
}

async function handleReprintDirect(bc) {
  const userStr = sessionStorage.getItem('user');
  if (!userStr) return;
  const user = JSON.parse(userStr);
  try {
    const res = await API.reprintTicket(bc, user.username);
    if (res && res.status && res.tickets) {
      printTickets(res.tickets);
    } else {
      alert(res.message || "Ticket not found or error.");
    }
  } catch (e) { alert("Reprint failed."); }
}

function printTickets(ticketsArray) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return alert("Pop-up blocked. Allow pop-ups for printing.");

  const ticketsHtml = ticketsArray.map((ticketObj) => {
    const ticket = ticketObj.ticket || ticketObj;
    const lines = ticket.bet_lines || [];
    const barcodeValue = ticket.barcode || 'ERROR';
    const barcodeData = "https://bwipjs-api.metafloor.com/?bcid=code128&text=" + barcodeValue + "&height=10&scale=2&rotate=N&includetext=true";

    const dTime = ticket.draw_times || ticket.draw_time || '--:--';
    const bTime = ticket.bet_time || ticket.tck_time || '--:--';
    const gDate = ticket.record_date || new Date().toISOString().split('T')[0];
    const username = ticket.username || (sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')).username : 'guest');

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
        <h2 style="margin:2px 0; font-size:18px; font-weight:900;">PLATINUM LOTTERY 4D</h2>
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
        <div style="font-size:10px; font-weight:bold;">*** THANK YOU & GOOD LUCK ***</div>
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
    <body onload="setTimeout(() => { window.print(); window.close(); }, 800);">
      ${ticketsHtml}
    </body>
    </html>
  `;
  printWindow.document.write(content);
  printWindow.document.close();
}

async function handleReprintSubmit() {
  const bcInp = document.getElementById('reprintBarcodeInp');
  if (!bcInp || !bcInp.value) return alert("Enter barcode");
  handleReprintDirect(bcInp.value.trim().toUpperCase());
}

// CANCEL LOGIC
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
        body.innerHTML = '<tr><td colspan="6" style="padding:40px; color:#999;">No active tickets for this draw.</td></tr>';
        return;
      }
      body.innerHTML = res.tickets.map(t => `
        <tr style="border-bottom:1px solid #222;">
          <td style="padding:12px;">${t.id}</td>
          <td style="padding:12px; font-weight:bold; color:#ed1c24;">${t.barcode}</td>
          <td style="padding:12px;">${t.draw_times}</td>
          <td style="padding:12px;">${t.qty}</td>
          <td style="padding:12px;">${t.amount}</td>
          <td style="padding:12px;">
            <button onclick="submitCancel('${t.id}')" style="background:#000; color:#ed1c24; border:1px solid #ed1c24; padding:5px 12px; border-radius:4px; font-weight:bold; cursor:pointer;">CANCEL</button>
          </td>
        </tr>
      `).join('');
    } else { body.innerHTML = '<tr><td colspan="6" style="padding:40px;">No bets found.</td></tr>'; }
  } catch (e) { body.innerHTML = '<tr><td colspan="6" style="padding:40px;">Error loading.</td></tr>'; }
}

async function submitCancel(ticketId) {
  const modal = document.getElementById('confirmCancelModal');
  const targetIdEl = document.getElementById('cancelTargetId');
  const finalBtn = document.getElementById('finalCancelBtn');
  
  if (modal && targetIdEl && finalBtn) {
    targetIdEl.textContent = `ID: ${ticketId}`;
    modal.style.display = 'flex';
    
    finalBtn.onclick = async () => {
      finalBtn.disabled = true;
      finalBtn.textContent = "WAIT...";
      try {
        const res = await API.ticketCancel(ticketId);
        if (res && (res.status === true || res.status === "true")) {
          alert(res.message || "Ticket cancelled!");
          closeConfirmCancel();
          fetchCancelHistory();
          if (typeof window.getBalance === 'function') window.getBalance();
        } else {
          alert("Cancel Failed: " + (res.message || "Unknown error"));
        }
      } catch (err) { alert("Error during cancel."); }
      finally {
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

async function fetchGameResults() {
  try {
    const res = await API.result();
    if (res && res.status === true) {
      latestResults = res;
      updateWinnerHeader();
    }
  } catch (e) {
    console.error("Fetch Results Error (4D):", e);
  }
}

function updateWinnerHeader() {
  if (!latestResults || !latestResults.previous_result) return;
  const winnersContainer = document.getElementById('hWinners');
  if (!winnersContainer) return;

  // Split results: "1045, 1139, ..."
  const allWinners = latestResults.previous_result.split(',').map(s => s.trim());
  
  // Filter based on current Master Start (1000, 3000, or 5000)
  const rangePrefix = String(currentMasterStart)[0]; // '1', '3', or '5'
  const filteredWinners = allWinners.filter(w => w.startsWith(rangePrefix));
  
  // Top 10 for that range
  const displayWinners = filteredWinners.slice(0, 10);
  
  // Build HTML
  let html = displayWinners.map(w => `<div class="h-wnum">${w}</div>`).join('');
  
  // Add draw time box
  if (latestResults.previous_draw_time) {
    html += `<div class="h-time-box">${latestResults.previous_draw_time}</div>`;
  }
  
  // Add version label if exists in index.html, else dummy
  html += `<div class="h-ver-lbl" id="hdrVer">${config.ver}</div>`;
  
  winnersContainer.innerHTML = html;
}

function clearSelections() {
  allBets = {};
  renderFDGridItems();
}

function randomPick() {
  const activeGridStart = currentMasterStart + currentRangeIndex * 100;
  const avail = [];
  for (let i = 0; i < 100; i++) {
    const num = String(activeGridStart + i).padStart(4, '0');
    if (!allBets[num]) avail.push(i);
  }
  if (!avail.length) return;
  const relNum = avail[Math.floor(Math.random() * avail.length)];
  const val = Math.floor(Math.random() * 25) + 1; // 1 to 5 qty
  handleInputApply(relNum, val);
  renderFDGridItems();
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

document.addEventListener('keydown', e => {
  if (e.key === 'F7') { 
    e.preventDefault(); 
    const pb = document.getElementById('playBtn');
    if(pb) pb.click(); 
  }
  if (e.key === 'F3') { e.preventDefault(); openBetHistoryModal(); }
  if (e.key === 'F2') { e.preventDefault(); openReprintModal(); }
  if (e.key === 'F10') { e.preventDefault(); openCancelModal(); }
  if (e.key === 'Escape') clearSelections();
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


  const syncTimer = async () => {
    try {
      const res = await API.timer();
      if (res.success && res.time) countdown1 = parseInt(res.time);
    } catch (e) { console.error('Timer API Error:', e); }
  };
  syncTimer();


  getBalance();
  setInterval(getBalance, 5000);
  syncTimer();
  setInterval(syncTimer, 5000);
  buildSidebar(config.btns);
  buildFDGrid();

  const playBtn = document.getElementById('playBtn');
  if (playBtn) playBtn.onclick = play4D;

  updateClock();
  fetchGameResults();
  setInterval(fetchGameResults, 60000); // Update every minute
  scaleFonts();
  applyMobileScale();
  setInterval(updateClock, 1000);
  setInterval(updateCountdowns, 1000);
});
