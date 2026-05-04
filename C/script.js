const sel = { C: new Map() }; // Changed to Map to store card name and bet amount
let currentPage = "C";
let countdown3 = 208;
let currentQty = 10; // Default QTY

function switchPage(p) {
  if (p === "G") window.location.href = "../G/index.html";
  else if (p !== "C") window.location.href = "../" + p + "/index.html";
}

async function buildCHistory() {
  const hist = document.getElementById("cHistory");
  if (!hist) return;

  const mapping = {
    '1': { img: "../assets/Platinum-Game/Horse.png", emoji: "🐴" },
    '01': { img: "../assets/Platinum-Game/Horse.png", emoji: "🐴" },
    '2': { img: "../assets/Platinum-Game/Football.png", emoji: "⚽" },
    '02': { img: "../assets/Platinum-Game/Football.png", emoji: "⚽" },
    '3': { img: "../assets/Platinum-Game/Sun.png", emoji: "☀️" },
    '03': { img: "../assets/Platinum-Game/Sun.png", emoji: "☀️" },
    '4': { img: "../assets/Platinum-Game/Cow.png", emoji: "🐮" },
    '04': { img: "../assets/Platinum-Game/Cow.png", emoji: "🐮" },
    '5': { img: "../assets/Platinum-Game/Lamp.png", emoji: "🪔" },
    '05': { img: "../assets/Platinum-Game/Lamp.png", emoji: "🪔" },
    '6': { img: "../assets/Platinum-Game/Kite.png", emoji: "🪁" },
    '06': { img: "../assets/Platinum-Game/Kite.png", emoji: "🪁" },
    '7': { img: "../assets/Platinum-Game/Umbrella.png", emoji: "⛱️" },
    '07': { img: "../assets/Platinum-Game/Umbrella.png", emoji: "⛱️" },
    '8': { img: "../assets/Platinum-Game/Rabbit.png", emoji: "🐰" },
    '08': { img: "../assets/Platinum-Game/Rabbit.png", emoji: "🐰" },
    '9': { img: "../assets/Platinum-Game/Pegion.png", emoji: "🕊️" },
    '09': { img: "../assets/Platinum-Game/Pegion.png", emoji: "🕊️" },
    '10': { img: "../assets/Platinum-Game/Butterfly.png", emoji: "🦋" },
    '11': { img: "../assets/Platinum-Game/Tiger.png", emoji: "🐯" },
    '12': { img: "../assets/Platinum-Game/Rose.png", emoji: "🌹" }
  };

  try {
    const res = await window.API.lastTenResults();
    if (res && res.status && res.results) {
      hist.innerHTML = "";
      res.results.forEach((item, index) => {
        const info = mapping[item.result];
        if (!info) return;

        const d = document.createElement("div");
        d.className = "c-hist-item" + (index === 0 ? " sel-hist" : "");
        d.innerHTML = `
          <div class="c-hist-img">
            <img src="${info.img}" alt="${info.emoji}"
              onerror="this.parentNode.innerHTML='<span style=font-size:36px;line-height:1>${info.emoji}</span>'">
          </div>
          <div class="c-hist-time">${item.time}</div>`;
        hist.appendChild(d);
      });
    }
  } catch (err) {
    console.error("Build History Error:", err);
  }
}

function toggleCard(el, name) {
  // Get current bet for this card
  let currentBet = sel.C.get(name) || 0;

  // Add current QTY to bet
  currentBet += currentQty;

  // Update the Map
  sel.C.set(name, currentBet);

  // Add selected class if not already added
  el.classList.add("sel");

  // Update the white box display on card
  const namebox = el.querySelector(".c-namebox");
  if (namebox) {
    namebox.textContent = currentBet;
    namebox.style.display = "flex";
  }

  updateCStats();
}

function updateCStats() {
  // Total Selected spots = how many cards have bets
  const baseSpots = sel.C.size;

  // Calculate total bet amount
  let baseBetAmount = 0;
  sel.C.forEach((amount) => {
    baseBetAmount += amount;
  });

  const drawCount = selectedDraws.size > 0 ? selectedDraws.size : 1;
  const totalSpots = baseSpots * drawCount;
  const totalBetAmount = baseBetAmount * drawCount;

  // Prize pool Contribution = Total bet
  const prizePool = totalBetAmount;

  // Update UI
  const spots = document.getElementById("cSpots");
  if (spots) spots.textContent = totalSpots;

  const prize = document.getElementById("cPrize");
  if (prize) prize.textContent = prizePool;

  // Game service points and Total Points are same as total bet
  const servicePts = document.getElementById("cServicePts");
  if (servicePts) servicePts.textContent = totalBetAmount;

  const totalPts = document.getElementById("cTotalPts");
  if (totalPts) totalPts.textContent = totalBetAmount;
}

function selectQty(btn) {
  // Remove selection from all buttons
  document
    .querySelectorAll(".cqty-btn")
    .forEach((b) => b.classList.remove("sel"));

  // Add selection to clicked button
  btn.classList.add("sel");

  // Get the QTY value from the button
  const qtyText = btn.querySelector(".qty-v").textContent;
  currentQty = parseInt(qtyText);
}

function doubleBets() {
  if (sel.C.size === 0) return;

  sel.C.forEach((amount, name) => {
    const newAmount = amount * 2;
    sel.C.set(name, newAmount);

    // Update UI for the card
    // We need to find the element associated with this name
    const items = document.querySelectorAll(".c-item");
    items.forEach((item) => {
      const img = item.querySelector("img");
      if (img && img.alt === name) {
        const namebox = item.querySelector(".c-namebox");
        if (namebox) {
          namebox.textContent = newAmount;
          namebox.style.display = "flex";
        }
      }
    });
  });

  updateCStats();
}

function clearSelections() {
  sel.C.clear();

  // Remove selected class and clear white boxes
  document.querySelectorAll(".c-item.sel").forEach((e) => {
    e.classList.remove("sel");
    const namebox = e.querySelector(".c-namebox");
    if (namebox) {
      namebox.textContent = "";
      namebox.style.display = "none";
    }
  });

  updateCStats();
}

// Advance Draw Modal
let selectedDraws = new Set(); // Track sellected draws

async function showAdvanceDrawModal() {
    selectedDraws.clear();

    const modal = document.createElement("div");
    modal.className = "modal-overlay";

    let drawItemsHTML = "";

    try {
        const response = await window.API.advancDrawTime();

        if (response.status && response.slots.length > 0) {
            response.slots.forEach((time, index) => {
                drawItemsHTML += `
                    <div class="draw-checkbox-item" onclick="toggleDrawSelection(this, '${time}')">
                        <input type="checkbox" id="draw-${index}" class="draw-checkbox" />
                        <label for="draw-${index}" class="draw-time-label">${time}</label>
                    </div>
                `;
            });
        } else {
            drawItemsHTML = `<p>No draw slots available</p>`;
        }
    } catch (error) {
        console.error("Advance Draw Fetch Error:", error);
        drawItemsHTML = `<p>Failed to load draw slots</p>`;
    }

    modal.innerHTML = `
        <div class="modal-box advance-modal">
            <div class="modal-header">
                <h2>Advance Draw</h2>
                <div style="display:flex; align-items:center; gap:8px;">
                    <label style="color:#fff; font-size:14px; font-family:'Orbitron';">Select Top:</label>
                    <input type="number" id="advCountInput" min="0" style="width:60px; padding:4px; border-radius:4px; text-align:center; border:1px solid #ccc; color:#000; font-weight:bold;" placeholder="0" oninput="window.selectTopAdvance(this.value)">
                </div>
                <button class="modal-close" onclick="closeModal(this)">×</button>
            </div>

            <div class="modal-body">
                <div class="advance-draw-grid">
                    ${drawItemsHTML}
                </div>
            </div>

            <div class="modal-footer">
                <button class="modal-btn-cancel" onclick="closeModal(this)">
                    Close
                </button>

                <button class="modal-btn-confirm" onclick="confirmAdvanceDraw()">
                    OK
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

window.selectTopAdvance = function(numText) {
    const num = parseInt(numText) || 0;
    const items = document.querySelectorAll(".draw-checkbox-item");
    selectedDraws.clear();
    
    items.forEach((item, index) => {
        const checkbox = item.querySelector(".draw-checkbox");
        const time = item.querySelector(".draw-time-label").textContent;
        
        if (index < num) {
            checkbox.checked = true;
            item.classList.add("selected");
            selectedDraws.add(time);
        } else {
            checkbox.checked = false;
            item.classList.remove("selected");
        }
    });

    const countEl = document.getElementById("selectedDrawCount");
    if (countEl) countEl.textContent = selectedDraws.size;
};


function generateTimeSlots() {
  const slots = [];
  const startHour = 14; // 2 PM
  const startMin = 15;
  const endHour = 21; // 9 PM

  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === startHour && m < startMin) continue;
      if (h === endHour && m > 0) break;

      const hour12 = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      const time = `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")}${ampm}`;
      slots.push(time);
    }
  }

  return slots;
}

function toggleDrawSelection(element, time) {
  const checkbox = element.querySelector(".draw-checkbox");

  if (checkbox.checked) {
    // Uncheck
    checkbox.checked = false;
    element.classList.remove("selected");
    selectedDraws.delete(time);
  } else {
    // Check
    checkbox.checked = true;
    element.classList.add("selected");
    selectedDraws.add(time);
  }

  // Update count
  const countEl = document.getElementById("selectedDrawCount");
  if (countEl) countEl.textContent = selectedDraws.size;
}

function confirmAdvanceDraw() {
  if (selectedDraws.size === 0) {
    alert("Please select at least one draw time");
    return;
  }

  const selectedTimes = Array.from(selectedDraws).join(", ");
  showStatusModal("ADVANCE DRAW", `Selected ${selectedDraws.size} draws:\n${selectedTimes}`, "success");

  // Here you can process the selected draws
  console.log("Selected draws:", Array.from(selectedDraws));

  // Close modal
  const modal = document.querySelector(".modal-overlay");
  if (modal) modal.remove();
}

// Cancel Ticket Modal

async function showReprintModal(isReprint = true, selectedDate = null) {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) {
        showStatusModal("LOGIN REQUIRED", "Please Login first.", "error");
        return;
    }

    const user = JSON.parse(userStr);
    const today = new Date().toISOString().split("T")[0];
    const dateToFetch = selectedDate || today;

    let tableRows = "";
    let recordDate = dateToFetch;

    try {
        const response = await window.API.betHistory(user.username, dateToFetch);
        const tickets = response.tickets || response.data || [];
        recordDate = response.record_date || dateToFetch;

        if (response.status && tickets.length > 0) {
            tickets.forEach((item, index) => {
                tableRows += `
                    <tr style="background:#ddd; color: black;">
                        <td style="padding:8px; border:1px solid #b95a5a;">${index + 1}</td>
                        <td style="padding:8px; border:1px solid #c07373;">${item.barcode}</td>
                        <td style="padding:8px; border:1px solid #c07373;">${item.draw_times}</td>
                        <td style="padding:8px; border:1px solid #c07373;">${item.amount}</td>
                        <td style="padding:8px; border:1px solid #c07373;">${item.qty || '0'}</td>
                        <td style="padding:8px; border:1px solid #c07373;">${recordDate}</td>
                        ${isReprint ? `
                        <td style="padding:8px; border:1px solid #c07373;">
                            <button class="modal-btn-confirm" onclick="confirmReprint('${item.barcode}')">
                                Reprint
                            </button>
                        </td>` : ''}
                    </tr>
                `;
            });
        } else {
            tableRows = `
                <tr>
                    <td colspan="${isReprint ? 7 : 6}" style="text-align:center; padding:15px;">
                        No Bet History Found for ${recordDate}
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error("Bet History Error:", error);
        tableRows = `<tr><td colspan="${isReprint ? 7 : 6}" style="text-align:center; padding:15px;">Failed to load history</td></tr>`;
    }

    // Check if modal already exists to just update it
    let modal = document.querySelector(".bet-history-modal-overlay");
    if (modal) {
        modal.querySelector(".modal-body-table").innerHTML = tableRows;
        return;
    }

    modal = document.createElement("div");
    modal.className = "modal-overlay bet-history-modal-overlay";

    modal.innerHTML = `
        <div class="modal-box" style="width: 80%; max-width: 900px;">
            <div class="modal-header">
                <h2>${isReprint ? 'Reprint Ticket' : 'Bet History'}</h2>
                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="date" id="historyDateInput" value="${dateToFetch}" 
                           style="padding:5px; border-radius:4px; border:1px solid #ccc;"
                           onchange="showReprintModal(${isReprint}, this.value)">
                    <button class="modal-close" onclick="closeModal(this)">×</button>
                </div>
            </div>

            <div class="modal-body">
                <table style="width:100%; border-collapse: collapse; background:#f0f0f0; border-radius:5px; overflow:hidden;">
                    <tr style="background:#699bdc;">
                        <th style="padding:8px; border:1px solid #b95a5a; color:black;">Sr.No</th>
                        <th style="padding:8px; border:1px solid #c07373; color:black;">Barcode</th>
                        <th style="padding:8px; border:1px solid #c07373; color:black;">Draw Time</th>
                        <th style="padding:8px; border:1px solid #c07373; color:black;">Play Amt</th>
                        <th style="padding:8px; border:1px solid #c07373; color:black;">Qty</th>
                        <th style="padding:8px; border:1px solid #c07373; color:black;">Date</th>
                        ${isReprint ? '<th style="padding:8px; border:1px solid #c07373; color:black;">Reprint</th>' : ''}
                    </tr>
                    <tbody class="modal-body-table">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

async function betHistoryReprint() {
    await showReprintModal(false);
}

function confirmReprint(barcode) {
    showStatusModal(
        "SUCCESS",
        "Ticket " + barcode + " reprinted successfully!",
        "success"
    );

    const modal = document.querySelector(".modal-overlay");
    if (modal) modal.remove();
}


async function showCancelTicketModal() {
  const userStr = sessionStorage.getItem("user");
  if (!userStr) {
    showStatusModal("LOGIN REQUIRED", "Please Login first.", "error");
    return;
  }

  const user = JSON.parse(userStr);
  const today = new Date().toISOString().split("T")[0];

  let tableRows = "";

  try {
    const response = await window.API.currentDrawBetHistory(user.username);
    const tickets = response.tickets || response.data || [];
    const recordDate = response.record_date || today;

    if (response.status && tickets.length > 0) {
      tickets.forEach((item, index) => {
        tableRows += `
          <tr style="background:#ddd; color: black;">
            <td style="padding:8px; border:1px solid #b95a5a;">${index + 1}</td>
            <td style="padding:8px; border:1px solid #c07373;">${item.barcode || ''}</td>
            <td style="padding:8px; border:1px solid #c07373;">${item.draw_times || ''}</td>
            <td style="padding:8px; border:1px solid #c07373;">${item.amount || ''}</td>
            <td style="padding:8px; border:1px solid #c07373;">${item.qty || '0'}</td>
            <td style="padding:8px; border:1px solid #c07373;">${recordDate}</td>
            <td style="padding:8px; border:1px solid #c07373;">
              <button class="modal-btn-confirm" style="background:#e74c3c; color:#fff; border:none; padding:5px 12px; border-radius:4px; cursor:pointer;" onclick="cancelTicketById(${item.id})">
                Cancel
              </button>
            </td>
          </tr>
        `;
      });
    } else {
      tableRows = `
        <tr>
          <td colspan="7" style="text-align:center; padding:15px;">
            No Current Draw Bets Found
          </td>
        </tr>
      `;
    }
  } catch (error) {
    console.error("Current Draw Bet History Error:", error);
    tableRows = `
      <tr>
        <td colspan="7" style="text-align:center; padding:15px;">
          Failed to load Current Draw Bet History
        </td>
      </tr>
    `;
  }

  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal-box">
      <div class="modal-header">
        <h2>Cancel Tickets</h2>
        <button class="modal-close" onclick="closeModal(this)">×</button>
      </div>
      <div class="modal-body">
        <table style="width:100%; border-collapse: collapse; background:#f0f0f0; border-radius:5px; overflow:hidden;">
          <tr style="background:#699bdc;">
            <th style="padding:8px; border:1px solid #b95a5a; color: black;">Sr.No</th>
            <th style="padding:8px; border:1px solid #c07373; color: black;">Barcode</th>
            <th style="padding:8px; border:1px solid #c07373; color: black;">Draw Time</th>
            <th style="padding:8px; border:1px solid #c07373; color: black;">Play Amt</th>
            <th style="padding:8px; border:1px solid #c07373; color: black;">Qty</th>
            <th style="padding:8px; border:1px solid #c07373; color: black;">Date</th>
            <th style="padding:8px; border:1px solid #c07373; color: black;">Cancel Ticket</th>
          </tr>
          ${tableRows}
        </table>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

async function cancelTicketById(ticketId) {
  if (!confirm("Are you sure you want to cancel this ticket?")) return;

  try {
    const res = await window.API.ticketCancel(ticketId);

    if (res && res.status) {
      showStatusModal("SUCCESS", res.message || "Ticket cancelled successfully!", "success");

      // Close existing cancel modal
      const modal = document.querySelector(".modal-overlay");
      if (modal) modal.remove();

      // Refresh balance
      const userStr = sessionStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        const balanceRes = await API.balance(u.username, null, "C");
        if (balanceRes && balanceRes.success && balanceRes.data) {
          const limitVal = document.getElementById("cLimitVal");
          if (limitVal) limitVal.textContent = balanceRes.data.balance;
        }
      }
    } else {
      showStatusModal("FAILED", res.message || "Failed to cancel ticket.", "error");
    }
  } catch (err) {
    console.error("Cancel Ticket Error:", err);
    showStatusModal("ERROR", "Connection error. Please try again.", "error");
  }
}




function closeModal(btn) {
  const modal = btn.closest(".modal-overlay");
  if (modal) {
    modal.remove();
  }
}




function updateClock() {
  const n = new Date();
  const pad = (x) => String(x).padStart(2, "0");
  const dt = document.getElementById("navDatetime");
  if (dt)
    dt.textContent = `${n.getDate()}/${n.getMonth() + 1}/${n.getFullYear()} | ${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  let h = n.getHours(),
    ap = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  const tm = `${h}:${pad(n.getMinutes())} ${ap}`;
  const ct = document.getElementById("cTime");
  if (ct) ct.textContent = tm;
}

function updateCountdowns() {
  const box3 = document.getElementById("cCountdown");
  if (box3) {
    countdown3 = Math.max(0, countdown3 - 1);
    if (countdown3 === 0) countdown3 = 600;
    box3.textContent =
      String(Math.floor(countdown3 / 60)).padStart(2, "0") +
      ":" +
      String(countdown3 % 60).padStart(2, "0");
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P" || e.key === "F7") {
    e.preventDefault();
    const pb = document.getElementById("playBtn");
    if (pb) pb.click();
  }
  if (e.key === "c" || e.key === "C" || e.key === "Escape") {
    clearSelections();
  }
  if (e.key === "d" || e.key === "D") {
    doubleBets();
  }
  if (e.key === "i" || e.key === "I") {
    betHistoryReprint();
  }
});

const DESIGN_W = 1366;
const DESIGN_H = 768;

function applyMobileScale() {
  const wrapper = document.querySelector(".app-wrapper");
  if (!wrapper) return;

  const isPortrait = window.innerHeight > window.innerWidth;
  const isMobileW = window.innerWidth <= 600;

  if (isPortrait && isMobileW) {
    const scaleByW = window.innerWidth / DESIGN_W;
    const scaleByH = window.innerHeight / DESIGN_H;
    const scale = Math.min(scaleByW, scaleByH);

    wrapper.style.width = DESIGN_W + "px";
    wrapper.style.height = DESIGN_H + "px";
    wrapper.style.transformOrigin = "top left";
    wrapper.style.transform = `scale(${scale})`;
    wrapper.style.position = "absolute";
    wrapper.style.top = "0";
    wrapper.style.left = "0";

    document.body.style.height = DESIGN_H * scale + "px";
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  } else {
    wrapper.style.width = "";
    wrapper.style.height = "";
    wrapper.style.transform = "";
    wrapper.style.transformOrigin = "";
    wrapper.style.position = "";
    wrapper.style.top = "";
    wrapper.style.left = "";
    document.body.style.height = "";
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }
}

  const Timer = async () => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return;
    try {
      const data = await window.API.timer();
      if (data && data.success) {
        // Sync local countdown with server time
        if (data.time !== undefined) {
          countdown3 = parseInt(data.time);
        }

        // Update UI elements if they exist (gracefully handle missing elements)
        const drawTimeEl = document.getElementById("drawTime");
        if (drawTimeEl) drawTimeEl.innerText = data.DrawTime;

        const currDateEl = document.getElementById("CurrentDate");
        if (currDateEl) currDateEl.innerText = data.CurrentDate;

        const currTimeEl = document.getElementById("CurrentTime");
        if (currTimeEl) currTimeEl.innerText = data.CurrentTime;

        const timeEl = document.getElementById("time");
        if (timeEl) timeEl.innerText = data.time;

        console.log("Timer Synced:", data);
      }
    } catch (e) {
      console.error("Timer Sync Error:", e);
    }
  };

  // Sync timer every 10 seconds
  setInterval(Timer, 10000);

async function playC() {
  const userStr = sessionStorage.getItem("user");
  if (!userStr) return showStatusModal("LOGIN REQUIRED", "Please Login to place a bet.", "error");
  const user = JSON.parse(userStr);

  if (sel.C.size === 0) return showStatusModal("EMPTY BET", "Please select at least one card.", "error");

  let all_datas12 = [];
  let totalAmount = 0;
  let totalQty = 0;

  // Mapping card names to numeric values 01-12
  const mapping = {
    'Horse': '01', 'Ball': '02', 'Sun': '03', 'Cow': '04',
    'Lamp': '05', 'Kite': '06', 'Umbrella': '07', 'Rabbit': '08',
    'Dove': '09', 'Butterfly': '10', 'Tiger': '11', 'Rose': '12'
  };

  sel.C.forEach((amount, name) => {
    const code = mapping[name] || name;
    all_datas12.push(`${code}X${amount}`);
    totalAmount += amount;
    totalQty += amount; // making qty equal to amount
  });

  const drawCount = selectedDraws.size > 0 ? selectedDraws.size : 1;
  const payloadAmount = totalAmount * drawCount;
  const payloadQty = totalQty * drawCount;

  const payload = {
    username: user.username,
    all_datas12: all_datas12.join(','),
    total_load_c_amount: payloadAmount,
    total_load_c_qty: payloadQty,
    advancr_draw_time: selectedDraws.size > 0 ? Array.from(selectedDraws) : ""
  };

  try {
    const res = await window.API.insertData(payload);
    if (res && res.status) {
      showStatusModal("SUCCESS", res.message || "Bet placed successfully!", "success");
      
      const barcodes = (res.barcodes && Array.isArray(res.barcodes) && res.barcodes.length > 0) 
                         ? res.barcodes 
                         : (res.barcode ? [res.barcode] : []);

      if (barcodes.length > 0) {
          try {
              const allTicketsToPrint = [];
              for (let bc of barcodes) {
                  const printData = await window.API.printTicket(bc, user.username);
                  if (printData && printData.status && printData.tickets && printData.tickets.length > 0) {
                      printData.tickets.forEach(t => {
                          allTicketsToPrint.push({ ticket: t, lines: t.bet_lines });
                      });
                  }
              }
              if (allTicketsToPrint.length > 0) {
                  printTickets(allTicketsToPrint);
              } else {
                  console.error("Print data empty:", barcodes);
                  alert("Warning: Could not fetch receipt details for printing.");
              }
          } catch(printErr) {
              console.error("Failed to fetch print data:", printErr);
              alert("Warning: Print failed due to connection error.");
          }
      } else {
          console.error("No barcode found in insertData response:", res);
      }

      clearSelections();
      selectedDraws.clear();
      const countEl = document.getElementById("selectedDrawCount");
      if (countEl) countEl.textContent = "0";

      // Refresh balance
      const userStrAfter = sessionStorage.getItem("user");
      if (userStrAfter) {
        const u = JSON.parse(userStrAfter);
        const balanceRes = await API.balance(u.username, null, "C");
        if (balanceRes && balanceRes.success && balanceRes.data) {
          const limitVal = document.getElementById("cLimitVal");
          if (limitVal) limitVal.textContent = balanceRes.data.balance;
        }
      }
    } else {
      showStatusModal("FAILED", res.message || "Failed to place bet.", "error");
    }
  } catch (err) {
    console.error("Play Error:", err);
    showStatusModal("ERROR", "Connection error. Please try again.", "error");
  }
}

function printTickets(ticketsArray) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return alert("Pop-up blocked. Allow pop-ups for printing.");

  const mapping = {
    '01': 'Horse', '02': 'Ball', '03': 'Sun', '04': 'Cow',
    '05': 'Lamp', '06': 'Kite', '07': 'Umbrella', '08': 'Rabbit',
    '09': 'Dove', '10': 'Butterfly', '11': 'Tiger', '12': 'Rose'
  };

  // Map num to actual image file names
  const imageFiles = {
    '01': 'Horse.png', '02': 'Football.png', '03': 'Sun.png', '04': 'Cow.png',
    '05': 'Lamp.png', '06': 'Kite.png', '07': 'Umbrella.png', '08': 'Rabbit.png',
    '09': 'Pegion.png', '10': 'Butterfly.png', '11': 'Tiger.png', '12': 'Rose.png'
  };

  // Convert images to base64 first, then build receipt
  const imagePromises = {};
  Object.keys(imageFiles).forEach(num => {
    imagePromises[num] = new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
          resolve(canvas.toDataURL('image/png'));
        } catch(e) {
          resolve('');
        }
      };
      img.onerror = () => resolve('');
      img.src = '../assets/Platinum-Game/' + imageFiles[num];
    });
  });

  Promise.all(Object.keys(imagePromises).map(k => imagePromises[k].then(v => [k, v])))
    .then(results => {
      const imageDataMap = {};
      results.forEach(([k, v]) => { imageDataMap[k] = v; });

      const ticketsHtml = ticketsArray.map((ticketObj) => {
        const ticket = ticketObj.ticket || ticketObj;
        const lines = ticket.bet_lines || [];
        const barcodeValue = ticket.barcode || 'ERROR';
        const barcodeData = "https://bwipjs-api.metafloor.com/?bcid=code128&text=" + barcodeValue + "&height=10&scale=2&rotate=N&includetext=true";

        const dTime = ticket.draw_times || ticket.draw_time || '--:--';
        const bTime = ticket.bet_time || ticket.tck_time || '--:--';
        const gDate = ticket.record_date || new Date().toISOString().split('T')[0];
        const username = ticket.username || (sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')).username : 'guest');

        // Build bet lines as div cards
        let betCardsHtml = '';
        if (lines && Array.isArray(lines)) {
          const sortedLines = [...lines].sort((a, b) => parseInt(a.num) - parseInt(b.num));
          sortedLines.forEach(line => {
            const numVal = String(line.num).padStart(2, '0');
            const name = mapping[numVal] || numVal;
            const imgSrc = imageDataMap[numVal] || '';
            const imgTag = imgSrc ? `<img src="${imgSrc}" style="width:24px; height:24px; object-fit:contain;" />` : '';
            betCardsHtml += `
              <div style="display:flex; align-items:center; gap:2px; border:1px solid #000; padding:1px 3px;">
                ${imgTag}
                <span style="font-weight:900; font-size:9px;">${line.qty}</span>
              </div>`;
          });
        }

        return `
          <div class="ticket-page" style="text-align:center; font-family:'Courier New', Courier, monospace; width:48mm; margin:0 0 0 5%; padding:2px 4px; background:white; color:black; border:none; page-break-after: always;">
            <h2 style="margin:1px 0; font-size:12px; font-weight:900;">PLATINUM LOTTERY HIT</h2>
            <p style="font-size:7px; margin:0; font-weight:bold;">(Ticket valid for 10 days)</p>
            <div style="border-top:1px dashed #000; margin:3px 0;"></div>
            
            <div style="text-align:left; font-size:8px; line-height:1.3; font-weight:900;">
              <div>Game Date : ${gDate}</div>
              <div>Draw Time : ${dTime}</div>
              <div>Ticket Time : ${bTime}</div>
              <div>Retailer ID : ${username}</div>
              <div>Total Point : ${ticket.amount || 0}</div>
              <div>Total Qty : ${ticket.qty || 0}</div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:2px; margin-top:4px;">
              ${betCardsHtml}
            </div>

            <div style="margin-top:5px; text-align:center;">
              <img src="${barcodeData}" style="width:100%; height:auto;" alt="barcode" />
            </div>
            <div style="border-top:1px dashed #000; margin:4px 0;"></div>
            <div style="font-size:7px; font-weight:bold;">*** THANK YOU & GOOD LUCK ***</div>
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
            @page { size: 58mm auto; margin: 0; }
            body { margin: 0; padding: 0; background: #fff; width: 58mm; }
            @media print { .ticket-page { border-bottom: none; } }
          </style>
        </head>
        <body onload="setTimeout(() => { window.print(); window.close(); }, 1200);">
          ${ticketsHtml}
        </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
    });
}

function showStatusModal(title, message, type) {
  const modal = document.createElement("div");
  modal.className = "status-modal-overlay";
  
  const icon = type === "success" ? "✓" : "✕";
  
  modal.innerHTML = `
    <div class="status-modal-box">
      <div class="status-modal-header ${type}">
        <div class="status-icon">${icon}</div>
        <div class="status-title">${title}</div>
      </div>
      <div class="status-modal-body">
        <div class="status-message">${message}</div>
        <button class="status-btn ${type}" onclick="this.closest('.status-modal-overlay').remove()">OK</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}


window.addEventListener("resize", applyMobileScale);
window.addEventListener("orientationchange", applyMobileScale);

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("body-C");

  const powerBtn = document.querySelector(".power-btn");
  if (powerBtn) {
    powerBtn.onclick = () => {
      sessionStorage.removeItem("user");
      window.location.href = "../index.html";
    };
  }

  // Advance Draw button
  const advBtn = document.querySelector(".c-advbtn");
  if (advBtn) {
    advBtn.onclick = showAdvanceDrawModal;
  }

  // Cancel button
  const cancelBtn = document.querySelector(
    '.cact-btn.gold[onclick*="clearSelections"]',
  );
  if (cancelBtn) {
    cancelBtn.onclick = showCancelTicketModal;
  }

  // Reprint button
  const reprintBtn = document.querySelector(
    '.cact-btn.gold:not([onclick*="clearSelections"])',
  );
  if (reprintBtn) {
    reprintBtn.onclick = showReprintModal;
  }

  // Play button
  const playBtn = document.getElementById("playBtn");
  if (playBtn) {
    playBtn.onclick = playC;
  }

  const getBalance = async () => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    try {
      const res = await API.balance(user.username, null, "C");
      if (res && res.success && res.data) {
        const limitVal = document.getElementById("cLimitVal");
        if (limitVal) limitVal.textContent = res.data.balance;
      }
    } catch (e) {
      console.error("Balance error:", e);
    }
  };

  getBalance();
  setInterval(getBalance, 5000);
  Timer();

  const claimInp = document.querySelector('.c-claim-inp');
  if (claimInp) {
      const processClaim = async () => {
          const barcode = claimInp.value.trim().toUpperCase();
          if (barcode.length !== 10) return;

          const userStr = sessionStorage.getItem('user');
          const user = userStr ? JSON.parse(userStr) : null;
          const username = user ? user.username : 'anil';

          try {
              const res = await window.API.claimTicket({ barcode_number: barcode, username: username });
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
                      if (data.message && data.message.includes("not declared")) {
                        header.style.background = 'linear-gradient(to right, #fa0, #850)';
                      }
                      amountRow.style.display = (data.win_amount && data.win_amount > 0) ? 'flex' : 'none';
                  }
                  modal.style.display = 'flex';
              }
              
              claimInp.value = ''; // clear for next scan
              getBalance();        // refresh balance
          } catch (err) {
              console.error(err);
              alert("Claim failed. Please try again.");
          }
      };

      claimInp.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') processClaim();
      });

      claimInp.addEventListener('input', () => {
          if (claimInp.value.length === 10) processClaim();
      });
  }

  window.closeClaimResultModal = function() {
    document.getElementById('claimResultModal').style.display = 'none';
    if (claimInp) claimInp.focus();
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === 'F8') {
      e.preventDefault();
      if (claimInp) claimInp.focus();
    }
    if (e.key === 'Escape') {
      const modal = document.getElementById('claimResultModal');
      if (modal && modal.style.display === 'flex') {
        window.closeClaimResultModal();
      }
    }
  });

  buildCHistory();
  setInterval(buildCHistory, 10000);
  updateCStats(); 
  updateClock();
  applyMobileScale();
  setInterval(updateClock, 1000);
  setInterval(updateCountdowns, 1000);
});
