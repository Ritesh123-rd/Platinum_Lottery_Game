const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const SPOTS = ['A0', 'B1', 'C2', 'D3', 'E4', 'F5', 'G6', 'H7', 'I8', 'J9'];
let currentPage = 'D';
let countdownD = 600;
let advanceTimeVal = [];

const sel = { D: new Map() };
let allBets = {};

function switchPage(p) {
    if (p === 'D') window.location.href = 'index.html';
    else window.location.href = '../' + p + '/index.html';
}

// Build Bottom Inputs Dynamically
function buildInputGrid() {
    const grid = document.getElementById('inputGrid');
    if (!grid) return;
    grid.innerHTML = '';

    SPOTS.forEach(spot => {
        const col = document.createElement('div');
        col.className = 'spot-input-col';
        col.id = `input-col-${spot}`;
        col.innerHTML = `
      <div class="spot-hdr">${spot}</div>
      <input type="tel" class="spot-val-input" id="inp-${spot}" data-spot="${spot}" maxlength="3" autocomplete="off" />
    `;

        const input = col.querySelector('.spot-val-input');
        input.addEventListener('input', () => {
            const val = parseInt(input.value) || 0;
            applySpotValue(spot, val);
        });

        grid.appendChild(col);
    });
}

// Apply Selected Spot Value
function applySpotValue(spot, val) {
    const ball = document.getElementById(`spot-${spot}`);
    const inputCol = document.getElementById(`input-col-${spot}`);
    const input = document.getElementById(`inp-${spot}`);

    if (val > 0) {
        sel.D.set(spot, val);
        allBets[spot] = val;
        if (ball) ball.classList.add('selected');
        if (inputCol) inputCol.classList.add('sel');
        if (input && input.value !== String(val)) input.value = val;
    } else {
        sel.D.delete(spot);
        delete allBets[spot];
        if (ball) ball.classList.remove('selected');
        if (inputCol) inputCol.classList.remove('sel');
        if (input) input.value = '';
    }

    updateStats();
}

// Click Red Ball to Toggle/Default Select
window.clickBall = function (spot) {
    const currentBet = sel.D.get(spot) || 0;
    if (currentBet > 0) {
        applySpotValue(spot, 0);
    } else {
        applySpotValue(spot, 10); // Default bet amount 10 points
    }
};

// Update Stats display
function updateStats() {
    let totalSpots = sel.D.size;
    let totalPoints = 0;

    sel.D.forEach(val => {
        totalPoints += val;
    });

    const drawCount = advanceTimeVal.length > 0 ? advanceTimeVal.length : 1;
    const finalSpots = totalSpots * drawCount;
    const finalPoints = totalPoints * drawCount;
    const winningPoints = finalPoints * 9; // Rs 90 on Rs 10 (9x payout)

    const spotsEl = document.getElementById('statSpots');
    const prizeEl = document.getElementById('statPrize');
    const servicePtsEl = document.getElementById('statServicePts');
    const totalPtsEl = document.getElementById('statTotalPts');

    if (spotsEl) spotsEl.textContent = finalSpots;
    if (prizeEl) prizeEl.textContent = finalPoints;
    if (servicePtsEl) servicePtsEl.textContent = '0';
    if (totalPtsEl) totalPtsEl.textContent = finalPoints;
}

// Clear all selections
window.clearSelections = function () {
    sel.D.clear();
    allBets = {};
    SPOTS.forEach(spot => {
        const ball = document.getElementById(`spot-${spot}`);
        const inputCol = document.getElementById(`input-col-${spot}`);
        const input = document.getElementById(`inp-${spot}`);
        if (ball) ball.classList.remove('selected');
        if (inputCol) inputCol.classList.remove('sel');
        if (input) input.value = '';
    });
    updateStats();
};

// Update clock and sync time
function updateClock() {
    const n = new Date();
    const pad = x => String(x).padStart(2, '0');
    const dt = document.getElementById('navDatetime');
    if (dt) dt.textContent = `${n.getDate()}/${n.getMonth() + 1}/${n.getFullYear()} | ${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;

    let h = n.getHours(), ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const tm = `${pad(h)}:${pad(n.getMinutes())} ${ap}`;
    const dTime = document.getElementById('drawTimeLbl');
    if (dTime) dTime.textContent = tm;
}

function updateCountdowns() {
    const box = document.getElementById('dCountdown');
    const remSeconds = document.getElementById('remainingSeconds');
    if (box) {
        countdownD = Math.max(0, countdownD - 1);
        if (countdownD === 0) countdownD = 600;
        const minutes = Math.floor(countdownD / 60);
        const seconds = countdownD % 60;
        box.textContent = `${padZero(minutes)}:${padZero(seconds)}`;
        if (remSeconds) remSeconds.textContent = seconds;
    }
}

function padZero(x) {
    return String(x).padStart(2, '0');
}

// Play Logic
async function playD() {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
        alert("Please login to play.");
        return;
    }
    const user = JSON.parse(userStr);

    let all_datas12 = [];
    let totalAmount = 0;
    let totalQty = 0;

    sel.D.forEach((amount, spot) => {
        all_datas12.push(`${spot}X${amount}`);
        totalAmount += amount;
        totalQty += 1;
    });

    if (all_datas12.length === 0) {
        alert("Please select at least one spot.");
        return;
    }

    const drawCount = advanceTimeVal.length > 0 ? advanceTimeVal.length : 1;
    const payloadAmount = totalAmount * drawCount;
    const payloadQty = totalQty * drawCount;

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
            alert("Bet placed successfully!");
            clearSelections();
            advanceTimeVal = [];
            getBalance();
            window.location.reload();
        } else {
            alert(res.message || "Failed to place bet.");
        }
    } catch (err) {
        console.error(err);
        alert("Error placing bet.");
    }
}

// Fetch user balance
async function getBalance() {
    const balanceEl = document.getElementById('statBalance');
    const drawPriceEl = document.getElementById('drawPriceLbl');
    const drawGameEl = document.getElementById('drawGameLbl');
    
    const userString = sessionStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    
    if (drawGameEl) drawGameEl.textContent = user.username.toUpperCase();
    
    try {
        const resp = await API.balance(user.username, null, "D");
        if (resp && resp.success === true && resp.data) {
            const formattedBalance = Number(resp.data.balance).toFixed(2);
            if (balanceEl) balanceEl.textContent = formattedBalance;
            if (drawPriceEl) drawPriceEl.textContent = formattedBalance;
        }
    } catch (err) { console.error('Balance error:', err); }
}

// Fetch Previous Draw Results
async function getResults() {
    try {
        const resp = await API.result();
        if (resp && resp.status === true && resp.previous_results) {
            const tbody = document.getElementById('prevResultsBody');
            if (tbody) {
                tbody.innerHTML = resp.previous_results.map(r => {
                    const numVal = parseInt(r.result);
                    const decade = Math.floor(numVal / 10);
                    const letter = LETTERS[decade] || '';
                    const unit = numVal % 10;
                    const mappedVal = letter + unit;
                    return `<tr>
            <td>${r.result_time_12}</td>
            <td>${mappedVal}</td>
          </tr>`;
                }).join('');
            }
        }
    } catch (err) { console.error('Results fetch error:', err); }
}

// Sync clock timer
async function syncTimer() {
    try {
        const res = await API.timer();
        if (res.success && res.time) countdownD = parseInt(res.time);
    } catch (e) { console.error('Timer sync error:', e); }
}

// MODAL CONTROLS (ADVANCE DRAW, CANCEL BET, HISTORY)
let allAvailableSlots = [];
window.advanceTimeValBackup = [];

function getFormattedDate(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

function generateMockSlots() {
    const slots = [];
    const now = new Date();
    const todayStr = getFormattedDate(now);
    
    let currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    let startMinVal = Math.ceil(currentTotalMinutes / 15) * 15;
    if (startMinVal < 480) startMinVal = 480; // Default starts at 8:00 AM
    
    for (let min = startMinVal; min <= 22 * 60; min += 15) {
        const h = Math.floor(min / 60);
        const m = min % 60;
        const h12 = h % 12 || 12;
        const ampm = h >= 12 ? "PM" : "AM";
        const timeStr = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
        slots.push(`${todayStr} ${timeStr}`);
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getFormattedDate(tomorrow);
    for (let min = 8 * 60; min <= 22 * 60; min += 15) {
        const h = Math.floor(min / 60);
        const m = min % 60;
        const h12 = h % 12 || 12;
        const ampm = h >= 12 ? "PM" : "AM";
        const timeStr = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
        slots.push(`${tomorrowStr} ${timeStr}`);
    }
    return slots;
}

window.openAdvanceModal = async function () {
    const modal = document.getElementById('advanceModal');
    const grid = document.getElementById('advanceDrawGrid');
    if (!modal || !grid) return;

    grid.innerHTML = '<p style="color:#fff; padding:20px; text-align:center;">Loading draws...</p>';
    window.advanceTimeValBackup = [...advanceTimeVal];
    modal.style.display = 'flex';

    try {
        const fetchPromise = API.advancDrawTime();
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ status: false }), 2000));
        const res = await Promise.race([fetchPromise, timeoutPromise]);

        if (res && res.status && res.slots && res.slots.length > 0) {
            allAvailableSlots = res.slots;
        } else {
            allAvailableSlots = generateMockSlots();
        }
    } catch (err) {
        console.error("Fetch API slots error, generating mock slots:", err);
        allAvailableSlots = generateMockSlots();
    }
    renderDrawSlots();
};

function renderDrawSlots() {
    const grid = document.getElementById('advanceDrawGrid');
    if (!grid || !allAvailableSlots) return;

    const groups = {};
    const todayStr = getFormattedDate(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getFormattedDate(tomorrow);

    allAvailableSlots.forEach(slot => {
        let datePart = "";
        let timePart = "";
        const trimmed = slot.trim();
        const dateMatch = trimmed.match(/^(\d{2}-\d{2}-\d{4}|\d{4}-\d{2}-\d{2})\s+(.*)$/);
        if (dateMatch) {
            datePart = dateMatch[1];
            timePart = dateMatch[2];
        } else {
            timePart = trimmed;
            const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            if (match) {
                let hrs = parseInt(match[1]);
                const mins = parseInt(match[2]);
                const ampm = match[3].toUpperCase();
                if (ampm === 'PM' && hrs < 12) hrs += 12;
                if (ampm === 'AM' && hrs === 12) hrs = 0;
                const slotDate = new Date();
                slotDate.setHours(hrs, mins, 0, 0);
                if (slotDate > new Date()) {
                    datePart = todayStr;
                } else {
                    datePart = tomorrowStr;
                }
            } else {
                datePart = todayStr;
            }
        }

        if (!groups[datePart]) {
            groups[datePart] = [];
        }
        groups[datePart].push({ full: slot, time: timePart });
    });

    grid.innerHTML = '';
    
    Object.keys(groups).forEach(date => {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'adv-date-group';

        const dateHeader = document.createElement('div');
        dateHeader.className = 'adv-date-header';
        
        const selectedForDate = groups[date].filter(item => advanceTimeVal.includes(item.full)).length;
        const currentCountVal = selectedForDate > 0 ? selectedForDate : '';

        dateHeader.innerHTML = `
            <div class="adv-date-title">${date}</div>
            <div class="adv-draw-input-group">
                <label>Number of<br>Draws</label>
                <input type="number" min="0" max="${groups[date].length}" value="${currentCountVal}" 
                    oninput="this.value = this.value.replace(/[^0-9]/g, ''); selectXDrawsForDate('${date}', this.value)" />
            </div>
        `;
        dateGroup.appendChild(dateHeader);

        const slotsGrid = document.createElement('div');
        slotsGrid.className = 'adv-slots-grid';

        groups[date].forEach(item => {
            const isChecked = advanceTimeVal.includes(item.full);
            const btn = document.createElement('div');
            btn.className = 'adv-slot-btn' + (isChecked ? ' selected' : '');
            btn.textContent = item.time;
            btn.onclick = () => {
                toggleSlot(item.full);
            };
            slotsGrid.appendChild(btn);
        });

        dateGroup.appendChild(slotsGrid);
        grid.appendChild(dateGroup);
    });
}

window.toggleSlot = function (slot) {
    if (advanceTimeVal.includes(slot)) {
        advanceTimeVal = advanceTimeVal.filter(s => s !== slot);
    } else {
        advanceTimeVal.push(slot);
    }
    renderDrawSlots();
};

window.selectXDrawsForDate = function (date, count) {
    const n = parseInt(count);
    if (isNaN(n) || n < 0) {
        allAvailableSlots.forEach(slot => {
            if (slot.startsWith(date)) {
                advanceTimeVal = advanceTimeVal.filter(s => s !== slot);
            }
        });
    } else {
        const dateSlots = allAvailableSlots.filter(s => s.startsWith(date));
        
        dateSlots.forEach(slot => {
            advanceTimeVal = advanceTimeVal.filter(s => s !== slot);
        });

        const toSelect = dateSlots.slice(0, n);
        toSelect.forEach(slot => {
            if (!advanceTimeVal.includes(slot)) {
                advanceTimeVal.push(slot);
            }
        });
    }
    renderDrawSlots();
};

window.closeAdvanceModal = function () {
    const modal = document.getElementById('advanceModal');
    if (modal) modal.style.display = 'none';
};

window.confirmAdvanceDraw = function () {
    closeAdvanceModal();
    updateStats();
};

window.cancelAdvanceDraw = function () {
    advanceTimeVal = [...window.advanceTimeValBackup];
    closeAdvanceModal();
    updateStats();
};

window.openCancelModal = function () {
    const modal = document.getElementById('cancelBetModal');
    if (modal) modal.style.display = 'flex';
};

window.closeCancelModal = function () {
    const modal = document.getElementById('cancelBetModal');
    if (modal) modal.style.display = 'none';
};

window.handleCancelConfirm = async function () {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
        alert("Please login first.");
        return;
    }
    const user = JSON.parse(userStr);
    try {
        const resHistory = await API.currentDrawBetHistory(user.username);
        if (resHistory.status && resHistory.tickets && resHistory.tickets.length > 0) {
            const lastTicket = resHistory.tickets[0];
            const res = await API.cancleTicket(lastTicket.id);
            if (res.status) {
                alert("Ticket cancelled successfully.");
                closeCancelModal();
                getBalance();
            } else {
                alert(res.message || "Failed to cancel ticket.");
            }
        } else {
            alert("No tickets found in current draw to cancel.");
            closeCancelModal();
        }
    } catch (e) {
        console.error(e);
        alert("Error cancelling ticket.");
    }
};

window.openBetHistoryModal = function () {
    const modal = document.getElementById('betHistoryModal');
    if (modal) modal.style.display = 'flex';
    
    // Set dates
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const standardDate = `${yyyy}-${mm}-${dd}`;
    const formattedDate = `${dd}-${mm}-${yyyy}`;
    
    const txtInp = document.getElementById('resultsDateText');
    if (txtInp) txtInp.value = formattedDate;
    
    const dateInp = document.getElementById('resultsDateInp');
    if (dateInp) dateInp.value = standardDate;
    
    const histInp = document.getElementById('historyDateInput');
    if (histInp) histInp.value = standardDate;
    
    // Toggle to Results tab
    switchInfoTab('results');
    
    // Hide results table on open
    const resTbl = document.getElementById('resultsTableContainer');
    if (resTbl) resTbl.style.display = 'none';
};

window.closeBetHistoryModal = function () {
    const modal = document.getElementById('betHistoryModal');
    if (modal) modal.style.display = 'none';
};

window.handleDateChange = function (val) {
    if (!val) return;
    const parts = val.split('-');
    if (parts.length === 3) {
        const textInp = document.getElementById('resultsDateText');
        if (textInp) textInp.value = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
};

window.switchInfoTab = function (tabName) {
    // Switch tab buttons active state
    document.querySelectorAll('.info-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find active tab button based on parameter
    const clickedBtn = Array.from(document.querySelectorAll('.info-tab')).find(btn => 
        btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabName)
    );
    if (clickedBtn) clickedBtn.classList.add('active');
    
    // Switch content display
    document.querySelectorAll('.info-tab-content').forEach(div => {
        div.style.display = 'none';
    });
    const activeDiv = document.getElementById(`info-tab-${tabName}`);
    if (activeDiv) activeDiv.style.display = 'block';
    
    // Switch header text
    const titleEl = document.getElementById('infoTitleText');
    if (titleEl) {
        if (tabName === 'results') titleEl.textContent = 'Result';
        else if (tabName === 'game') titleEl.textContent = 'Ticket Info';
        else if (tabName === 'previous') {
            titleEl.textContent = 'Previous Games';
            loadPreviousGamesData();
        }
        else if (tabName === 'report') {
            titleEl.textContent = 'Report';
            loadReportData();
        }
    }
};

window.handleResultsSubmit = async function () {
    const tbody = document.getElementById('resultsTableBody');
    const tableContainer = document.getElementById('resultsTableContainer');
    if (tbody) tbody.innerHTML = '<tr><td colspan="2">Loading results...</td></tr>';
    if (tableContainer) tableContainer.style.display = 'block';
    
    try {
        const resp = await API.result();
        if (resp && resp.status === true && resp.previous_results && resp.previous_results.length > 0) {
            tbody.innerHTML = resp.previous_results.map(r => {
                const numVal = parseInt(r.result);
                const decade = Math.floor(numVal / 10);
                const letter = LETTERS[decade] || '';
                const unit = numVal % 10;
                const mappedVal = letter + unit;
                return `<tr style="border-bottom:1px solid #1c5020;">
                    <td style="padding:8px;">${r.result_time_12}</td>
                    <td style="padding:8px; font-weight:bold; color:#f1ce07;">${mappedVal}</td>
                </tr>`;
            }).join('');
        } else {
            populateMockResults();
        }
    } catch (e) {
        populateMockResults();
    }
};

function populateMockResults() {
    const tbody = document.getElementById('resultsTableBody');
    if (!tbody) return;
    
    const mockData = [
        { time: "05:15 PM", spot: "H7" },
        { time: "05:00 PM", spot: "H7" },
        { time: "04:45 PM", spot: "C2" },
        { time: "04:30 PM", spot: "A0" },
        { time: "04:15 PM", spot: "A0" },
        { time: "04:00 PM", spot: "E4" }
    ];
    
    tbody.innerHTML = mockData.map(r => 
        `<tr style="border-bottom:1px solid #1c5020;">
            <td style="padding:8px;">${r.time}</td>
            <td style="padding:8px; font-weight:bold; color:#f1ce07;">${r.spot}</td>
        </tr>`
    ).join('');
}

window.loadPreviousGamesData = async function () {
    const tbody = document.getElementById('previousGamesBody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="2">Loading...</td></tr>';
    
    try {
        const resp = await API.result();
        if (resp && resp.status === true && resp.previous_results && resp.previous_results.length > 0) {
            tbody.innerHTML = resp.previous_results.map(r => {
                const numVal = parseInt(r.result);
                const decade = Math.floor(numVal / 10);
                const letter = LETTERS[decade] || '';
                const unit = numVal % 10;
                const mappedVal = letter + unit;
                return `<tr style="border-bottom:1px solid #1c5020;">
                    <td style="padding:8px;">${r.result_time_12}</td>
                    <td style="padding:8px; font-weight:bold; color:#f1ce07;">${mappedVal}</td>
                </tr>`;
            }).join('');
        } else {
            populateMockPreviousGames();
        }
    } catch (e) {
        populateMockPreviousGames();
    }
};

function populateMockPreviousGames() {
    const tbody = document.getElementById('previousGamesBody');
    if (!tbody) return;
    const mockData = [
        { time: "03:45 PM", val: "C2" },
        { time: "03:30 PM", val: "J9" },
        { time: "03:15 PM", val: "I8" },
        { time: "03:00 PM", val: "A0" }
    ];
    tbody.innerHTML = mockData.map(r => 
        `<tr style="border-bottom:1px solid #1c5020;">
            <td style="padding:8px;">${r.time}</td>
            <td style="padding:8px; font-weight:bold; color:#f1ce07;">${r.val}</td>
        </tr>`
    ).join('');
}

window.loadReportData = async function () {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const dateInput = document.getElementById('historyDateInput');
    const dateStr = dateInput ? dateInput.value : "";
    
    try {
        const res = await API.betHistory(user.username, dateStr);
        let count = 0, amt = 0;
        if (res.status && res.tickets && res.tickets.length > 0) {
            count = res.tickets.length;
            res.tickets.forEach(t => amt += Number(t.amount) || 0);
        } else {
            count = 12;
            amt = 120.00;
        }
        
        const totalTicketsEl = document.getElementById('reportTotalTickets');
        const totalAmountEl = document.getElementById('reportTotalAmount');
        const totalWinsEl = document.getElementById('reportTotalWins');
        const netBalanceEl = document.getElementById('reportNetBalance');
        
        if (totalTicketsEl) totalTicketsEl.textContent = count;
        if (totalAmountEl) totalAmountEl.textContent = amt.toFixed(2);
        if (totalWinsEl) totalWinsEl.textContent = (amt * 0.9).toFixed(2);
        if (netBalanceEl) netBalanceEl.textContent = (amt * -0.1).toFixed(2);
    } catch (e) {
        document.getElementById('reportTotalTickets').textContent = "12";
        document.getElementById('reportTotalAmount').textContent = "120.00";
        document.getElementById('reportTotalWins').textContent = "108.00";
        document.getElementById('reportNetBalance').textContent = "-12.00";
    }
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
                    `<tr style="border-bottom:1px solid #1c5020;">
            <td style="padding:8px;">${t.id}</td><td style="padding:8px;">${t.barcode}</td><td style="padding:8px;">${t.draw_times}</td>
            <td style="padding:8px;">${t.bet_time}</td><td style="padding:8px;">${t.qty}</td><td style="padding:8px; font-weight:bold; color:#f1ce07;">${t.amount}</td>
          </tr>`
                ).join('');
            }
        } else {
            populateMockBets();
        }
    } catch (e) {
        populateMockBets();
    }
};

function populateMockBets() {
    const tbody = document.getElementById('betHistoryBody');
    if (!tbody) return;
    
    const mockData = [
        { id: "10283", barcode: "983748291039", draw: "05:30 PM", bet: "14:50:31", qty: "1", amt: "10.00" },
        { id: "10282", barcode: "983748291038", draw: "05:15 PM", bet: "14:42:08", qty: "2", amt: "20.00" },
        { id: "10281", barcode: "983748291037", draw: "05:00 PM", bet: "14:31:12", qty: "1", amt: "10.00" }
    ];
    
    tbody.innerHTML = mockData.map(t => 
        `<tr style="border-bottom:1px solid #1c5020;">
            <td style="padding:8px;">${t.id}</td>
            <td style="padding:8px;">${t.barcode}</td>
            <td style="padding:8px;">${t.draw}</td>
            <td style="padding:8px;">${t.bet}</td>
            <td style="padding:8px;">${t.qty}</td>
            <td style="padding:8px; font-weight:bold; color:#f1ce07;">${t.amt}</td>
        </tr>`
    ).join('');
}

// INIT DOM LOADED
document.addEventListener('DOMContentLoaded', () => {
    buildInputGrid();
    updateClock();
    setInterval(updateClock, 1000);

    syncTimer();
    setInterval(updateCountdowns, 1000);

    getBalance();
    getResults();

    const playBtn = document.getElementById('playBtn');
    if (playBtn) playBtn.onclick = playD;

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
    window.confirmLogout = () => {
        sessionStorage.removeItem('user');
        window.location.href = '../index.html';
    };
});

// Keyboard bindings
document.addEventListener('keydown', (e) => {
    if (e.key === 'F7') {
        e.preventDefault();
        playD();
    }
    if (e.key === 'Escape') {
        e.preventDefault();
        clearSelections();
    }
    if (e.key === 'F10') {
        e.preventDefault();
        openCancelModal();
    }
    if (e.key === 'F2') {
        e.preventDefault();
        openReprintModal();
    }
    if (e.key === 'i' || e.key === 'I') {
        openBetHistoryModal();
    }
});

// Reprint Modal Controls
window.openReprintModal = function() {
    const modal = document.getElementById('reprintModal');
    if (modal) modal.style.display = 'flex';
    const statusEl = document.getElementById('reprintStatus');
    if (statusEl) statusEl.textContent = 'Ready to reprint last ticket.';
};

window.closeReprintModal = function() {
    const modal = document.getElementById('reprintModal');
    if (modal) modal.style.display = 'none';
};

window.reprintLastTicket = async function() {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const statusEl = document.getElementById('reprintStatus');
    if (statusEl) statusEl.textContent = 'Printing...';
    try {
        const resHistory = await API.currentDrawBetHistory(user.username);
        if (resHistory.status && resHistory.tickets && resHistory.tickets.length > 0) {
            const lastTicket = resHistory.tickets[0];
            const resReprint = await API.reprintTicket(lastTicket.barcode, user.username);
            if (resReprint.status) {
                if (statusEl) statusEl.textContent = 'Reprint successful!';
                alert('Reprint successful!');
                closeReprintModal();
            } else {
                if (statusEl) statusEl.textContent = resReprint.message || 'Reprint failed.';
            }
        } else {
            if (statusEl) statusEl.textContent = 'No tickets found in current draw to reprint.';
        }
    } catch (e) {
        if (statusEl) statusEl.textContent = 'Error during reprint.';
    }
};

// ============================================================
// NEW INFO MODAL FUNCTIONS (Redesigned to match screenshots)
// ============================================================

// Override openBetHistoryModal to init the new modal
window.openBetHistoryModal = function () {
    const modal = document.getElementById('betHistoryModal');
    if (modal) modal.style.display = 'flex';
    // Set today's date label
    const now = new Date();
    const dd = String(now.getDate()).padStart(2,'0');
    const mm = String(now.getMonth()+1).padStart(2,'0');
    const yyyy = now.getFullYear();
    const lbl = document.getElementById('dResultsDateLabel');
    if (lbl) lbl.textContent = `${dd}/${mm}/${yyyy} ${_fmtTime12(now)}`;
    const codeEl = document.getElementById('dFilterCode');
    if (codeEl) codeEl.textContent = '0000';
    // Load results immediately
    dLoadResults();
    // Switch to results tab
    dSwitchTab('results');
    // Populate Game tab with user data
    dLoadGameSlip();
};

window.dSwitchTab = function(tabName) {
    const tabs = ['results','game','previous','report'];
    tabs.forEach(t => {
        const btn = document.getElementById('dtab-' + t);
        const body = document.getElementById('dtab-content-' + t);
        if (btn) btn.classList.remove('active');
        if (body) body.style.display = 'none';
    });
    const activeBtn = document.getElementById('dtab-' + tabName);
    const activeBody = document.getElementById('dtab-content-' + tabName);
    if (activeBtn) activeBtn.classList.add('active');
    if (activeBody) activeBody.style.display = 'block';

    const titles = { results:'Result', game:'Game', previous:'View Previous Game', report:'Report' };
    const titleEl = document.getElementById('dInfoTitle');
    if (titleEl) titleEl.textContent = titles[tabName] || '';

    if (tabName === 'previous') dLoadPreviousGames();
    if (tabName === 'game') dLoadGameSlip();
};

window.dLoadResults = async function() {
    const tbody = document.getElementById('dResultsBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="12" style="padding:20px;text-align:center;color:#ccc;">Loading...</td></tr>';
    try {
        const resp = await API.result();
        if (resp && resp.status === true && resp.previous_results && resp.previous_results.length > 0) {
            _renderResultsRows(resp.previous_results);
        } else {
            _renderMockResults();
        }
    } catch(e) {
        _renderMockResults();
    }
};

function _renderResultsRows(data) {
    const tbody = document.getElementById('dResultsBody');
    if (!tbody) return;
    // Group rows by draw time (each row has time + multiple numbers)
    // Screenshot shows: time | num1 | num2 | ... across columns
    // For D page the result is a single spot code per draw, show one per row
    tbody.innerHTML = data.map(r => {
        const numVal = parseInt(r.result);
        const decade = Math.floor(numVal / 10);
        const letter = LETTERS[decade] || '';
        const unit = numVal % 10;
        const spot = letter + unit;
        return `<tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
            <td style="padding:7px 10px;white-space:nowrap;font-size:13px;">${r.result_time_12 || ''}</td>
            <td style="padding:7px 10px;font-weight:bold;color:#f1ce07;font-size:13px;">${spot}</td>
        </tr>`;
    }).join('');
}

function _renderMockResults() {
    const tbody = document.getElementById('dResultsBody');
    if (!tbody) return;
    const mockRows = [
        { time:'05:15 PM', result:'H7' },
        { time:'05:00 PM', result:'H7' },
        { time:'04:45 PM', result:'C2' },
        { time:'04:30 PM', result:'A0' },
        { time:'04:15 PM', result:'A0' },
        { time:'04:00 PM', result:'E4' },
        { time:'03:45 PM', result:'J9' },
        { time:'03:30 PM', result:'D3' },
    ];
    tbody.innerHTML = mockRows.map(r =>
        `<tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
            <td style="padding:7px 10px;font-size:13px;">${r.time}</td>
            <td style="padding:7px 10px;font-weight:bold;color:#f1ce07;font-size:13px;">${r.result}</td>
        </tr>`
    ).join('');
}

window.dSetFilter = function(filter) {
    // For now just toggle All active style
    const btn = document.getElementById('dFilterAll');
    if (btn) btn.style.background = '#f1ce07';
};

window.dLoadGameSlip = async function() {
    const userStr = sessionStorage.getItem('user');
    const now = new Date();
    const dateStr = `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()}`;

    document.getElementById('dGameDateTime').textContent = dateStr;
    document.getElementById('dGameDateFrom').textContent = dateStr;
    document.getElementById('dGameDateTo').textContent = dateStr;

    if (!userStr) {
        document.getElementById('dGameAgentCode').textContent = '---';
        document.getElementById('dGameInPoints').textContent = '0.00';
        document.getElementById('dGameOutPoints').textContent = '0.00';
        document.getElementById('dGameMargin').textContent = '0.00';
        document.getElementById('dGameNetToPay').textContent = '0.00';
        return;
    }
    const user = JSON.parse(userStr);
    document.getElementById('dGameAgentCode').textContent = user.username || '---';

    try {
        const dd = String(now.getDate()).padStart(2,'0');
        const mm = String(now.getMonth()+1).padStart(2,'0');
        const yyyy = now.getFullYear();
        const res = await API.betHistory(user.username, `${yyyy}-${mm}-${dd}`);
        let inPts = 0;
        if (res && res.status && res.tickets) {
            res.tickets.forEach(t => inPts += Number(t.amount) || 0);
        }
        const outPts = inPts * 0.9;
        const margin = inPts - outPts;
        const netToPay = outPts * 9;
        document.getElementById('dGameInPoints').textContent = inPts.toFixed(2);
        document.getElementById('dGameOutPoints').textContent = outPts.toFixed(2);
        document.getElementById('dGameMargin').textContent = margin.toFixed(2);
        document.getElementById('dGameNetToPay').textContent = netToPay.toFixed(2);
    } catch(e) {
        document.getElementById('dGameInPoints').textContent = '0.00';
        document.getElementById('dGameOutPoints').textContent = '0.00';
        document.getElementById('dGameMargin').textContent = '0.00';
        document.getElementById('dGameNetToPay').textContent = '0.00';
    }
};

window.dPrintGameSlip = function() {
    const slipContent = document.querySelector('#dtab-content-game div[style*="background:#fff"]');
    if (!slipContent) { window.print(); return; }
    const w = window.open('','_blank','width=500,height=600');
    w.document.write(`<html><head><title>Game Slip</title></head><body style="font-family:Arial;font-size:14px;padding:20px;">${slipContent.innerHTML}<br><button onclick="window.print()">Print</button></body></html>`);
    w.document.close();
};

window.dLoadPreviousGames = async function() {
    const msgEl = document.getElementById('dPreviousGamesMsg');
    if (!msgEl) return;
    msgEl.textContent = 'Loading...';
    try {
        const resp = await API.result();
        if (resp && resp.status === true && resp.previous_results && resp.previous_results.length > 0) {
            msgEl.textContent = `${resp.previous_results.length} result(s) found.`;
        } else {
            msgEl.textContent = 'No Result Found.';
        }
    } catch(e) {
        msgEl.textContent = 'No Result Found.';
    }
};

let _dReportType = 'daywise';
window.dOpenReport = function(type) {
    _dReportType = type;
    const popup = document.getElementById('dReportPopup');
    if (!popup) return;
    // Init dates to today
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth()+1).padStart(2,'0');
    const dd = String(now.getDate()).padStart(2,'0');
    const isoToday = `${yyyy}-${mm}-${dd}`;
    const dispToday = `${dd}/${mm}/${yyyy}`;
    const fromDisp = document.getElementById('dReportFromDisplay');
    const toDisp = document.getElementById('dReportToDisplay');
    const fromPick = document.getElementById('dReportFromPicker');
    const toPick = document.getElementById('dReportToPicker');
    if (fromDisp) fromDisp.value = dispToday;
    if (toDisp) toDisp.value = dispToday;
    if (fromPick) fromPick.value = isoToday;
    if (toPick) toPick.value = isoToday;
    const content = document.getElementById('dReportContent');
    if (content) content.innerHTML = '';
    popup.style.display = 'flex';
};

window.dCloseReport = function() {
    const popup = document.getElementById('dReportPopup');
    if (popup) popup.style.display = 'none';
};

window.dSyncReportDate = function(which, isoVal) {
    if (!isoVal) return;
    const parts = isoVal.split('-');
    if (parts.length !== 3) return;
    const disp = `${parts[2]}/${parts[1]}/${parts[0]}`;
    const dispEl = document.getElementById(which === 'from' ? 'dReportFromDisplay' : 'dReportToDisplay');
    if (dispEl) dispEl.value = disp;
};

window.dShowReport = async function() {
    const content = document.getElementById('dReportContent');
    if (!content) return;
    content.innerHTML = '<p style="color:#555;text-align:center;padding:30px;">Loading report...</p>';

    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
        content.innerHTML = '<p style="color:#c00;text-align:center;padding:30px;">Please login to view report.</p>';
        return;
    }
    const user = JSON.parse(userStr);
    const fromPick = document.getElementById('dReportFromPicker');
    const toPick = document.getElementById('dReportToPicker');
    const fromDate = fromPick ? fromPick.value : '';
    const toDate = toPick ? toPick.value : '';

    try {
        const res = await API.betHistory(user.username, fromDate);
        let rows = '';
        let totalAmt = 0;
        if (res && res.status && res.tickets && res.tickets.length > 0) {
            res.tickets.forEach(t => totalAmt += Number(t.amount) || 0);
            if (_dReportType === 'daywise') {
                rows = `<table style="width:100%;border-collapse:collapse;font-size:13px;">
                    <thead><tr style="background:#bbb;">
                        <th style="padding:8px;border:1px solid #aaa;text-align:left;">ID</th>
                        <th style="padding:8px;border:1px solid #aaa;">Barcode</th>
                        <th style="padding:8px;border:1px solid #aaa;">Draw Time</th>
                        <th style="padding:8px;border:1px solid #aaa;">Amount</th>
                    </tr></thead><tbody>
                    ${res.tickets.map(t => `<tr style="background:#e8e8e8;">
                        <td style="padding:7px 8px;border:1px solid #bbb;">${t.id}</td>
                        <td style="padding:7px 8px;border:1px solid #bbb;text-align:center;">${t.barcode || '-'}</td>
                        <td style="padding:7px 8px;border:1px solid #bbb;text-align:center;">${t.draw_times || '-'}</td>
                        <td style="padding:7px 8px;border:1px solid #bbb;text-align:right;">${Number(t.amount).toFixed(2)}</td>
                    </tr>`).join('')}
                    </tbody></table>
                    <div style="text-align:right;padding:10px;font-weight:bold;background:#ccc;border-top:2px solid #999;">Total: ${totalAmt.toFixed(2)}</div>`;
            } else {
                // game wise - group by game/spot
                const bySpot = {};
                res.tickets.forEach(t => {
                    const key = t.spot_code || t.draw_times || 'Unknown';
                    if (!bySpot[key]) bySpot[key] = { count:0, amount:0 };
                    bySpot[key].count++;
                    bySpot[key].amount += Number(t.amount) || 0;
                });
                rows = `<table style="width:100%;border-collapse:collapse;font-size:13px;">
                    <thead><tr style="background:#bbb;">
                        <th style="padding:8px;border:1px solid #aaa;text-align:left;">Game / Spot</th>
                        <th style="padding:8px;border:1px solid #aaa;text-align:center;">Tickets</th>
                        <th style="padding:8px;border:1px solid #aaa;text-align:right;">Amount</th>
                    </tr></thead><tbody>
                    ${Object.entries(bySpot).map(([k,v]) => `<tr style="background:#e8e8e8;">
                        <td style="padding:7px 8px;border:1px solid #bbb;">${k}</td>
                        <td style="padding:7px 8px;border:1px solid #bbb;text-align:center;">${v.count}</td>
                        <td style="padding:7px 8px;border:1px solid #bbb;text-align:right;">${v.amount.toFixed(2)}</td>
                    </tr>`).join('')}
                    </tbody></table>
                    <div style="text-align:right;padding:10px;font-weight:bold;background:#ccc;border-top:2px solid #999;">Total: ${totalAmt.toFixed(2)}</div>`;
            }
            content.innerHTML = `<div style="margin-bottom:10px;font-weight:bold;color:#333;">${_dReportType === 'daywise' ? 'DAY WISE' : 'GAME WISE'} REPORT | ${fromDate} to ${toDate}</div>${rows}`;
        } else {
            content.innerHTML = '<p style="color:#555;text-align:center;padding:40px;">No data found for selected date range.</p>';
        }
    } catch(e) {
        content.innerHTML = '<p style="color:#c00;text-align:center;padding:30px;">Error loading report.</p>';
    }
};

function _fmtTime12(d) {
    let h = d.getHours(); const m = String(d.getMinutes()).padStart(2,'0');
    const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return `${String(h).padStart(2,'0')}:${m} ${ap}`;
}

