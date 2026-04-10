const sel = { '3D': new Set() };
let currentPage = '3D';
let countdown2 = 761;

function switchPage(p) {
  if (p === 'G') window.location.href = '../G/index.html';
  else if (p !== '3D') window.location.href = '../' + p + '/index.html';
}

function buildS3Digits() {
  const row = document.getElementById('s3Digits');
  const allCbx = document.getElementById('allDigitsCbx');
  if(!row) return;
  row.innerHTML = '';
  
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(n => {
    const d = document.createElement('div');
    d.className = 's3-dgt'; d.textContent = n;
    d.dataset.num = n;
    d.onclick = () => {
      d.classList.toggle('sel');
      const k = String(n);
      if (sel['3D'].has(k)) sel['3D'].delete(k); else sel['3D'].add(k);
      
      // Update ALL checkbox status
      if (allCbx) {
        allCbx.checked = (sel['3D'].size === 10);
      }
      // No more instant generation here
    };
    row.appendChild(d);
  });

  // Handle ALL checkbox toggle
  if (allCbx) {
    allCbx.addEventListener('change', () => {
      sel['3D'].clear();
      const digits = document.querySelectorAll('.s3-dgt');
      if (allCbx.checked) {
        [0,1,2,3,4,5,6,7,8,9].forEach(n => sel['3D'].add(String(n)));
        digits.forEach(d => d.classList.add('sel'));
      } else {
        digits.forEach(d => d.classList.remove('sel'));
      }
    });
  }
  
  // ... rest of the code for results ...

  const res = document.getElementById('s3Results');
  if(res) {
    res.innerHTML = '';
    const times = ['11:45 AM', '11:30 AM', '11:15 AM', '11:00 AM', '10:45 AM', '10:30 AM', '10:15 AM', '10:00 AM', '9:45 AM', '9:30 AM'];
    const gameData = [
      ['C089', 'C124', 'C554', 'C581', 'C472', 'C063', 'C215', 'C255', 'C170', 'C589'],
      ['B871', 'B174', 'B975', 'B353', 'B527', 'B380', 'B436', 'B393', 'B795', 'B516'],
      ['A966', 'A166', 'A234', 'A385', 'A923', 'A237', 'A468', 'A289', 'A025', 'A205']
    ];

    gameData.forEach(rowCodes => {
      const row = document.createElement('div');
      row.className = 's3-res-row';
      rowCodes.forEach((code, i) => {
        const box = document.createElement('div');
        box.className = 's3-res-box';
        box.innerHTML = `<div class="s3-res-time">${times[i]}</div><div class="s3-res-code">${code}</div>`;
        row.appendChild(box);
      });
      res.appendChild(row);
    });
  }
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
  
  // Reset Group Checkboxes (A: checked, B/C: unchecked)
  const inputsBot = document.querySelectorAll('.s3-row-bot input');
  if(inputsBot[0]) inputsBot[0].checked = true;
  if(inputsBot[1]) inputsBot[1].checked = false;
  if(inputsBot[2]) inputsBot[2].checked = false;
  
  // Reset Top Row Checkboxes (Ind: checked, All: unchecked)
  const inputsTop = document.querySelectorAll('.s3-row-top input');
  if(inputsTop[0]) inputsTop[0].checked = true;
  if(inputsTop[2]) inputsTop[2].checked = false;

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

document.addEventListener('keydown', e => {
  if (e.key === 'F7') { 
    e.preventDefault(); 
    const pb = document.getElementById('playBtn');
    if(pb) pb.click(); 
  }
  if (e.key === 'Escape' || e.key === 'F10') clearSelections();
});

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
  const inputsTop = document.querySelectorAll('.s3-row-top input');
  const inputsBot = document.querySelectorAll('.s3-row-bot input');
  const allCbx = inputsTop[2];

  if (allCbx) {
    allCbx.addEventListener('change', () => {
      inputsBot.forEach(cb => { cb.checked = allCbx.checked; });
      document.querySelectorAll('.s3-tbtn').forEach(btn => {
        if (allCbx.checked) {
          btn.classList.add('active');
          const icon = btn.querySelector('.tbtn-check, .tbtn-box');
          if(icon) { icon.className = 'tbtn-check'; icon.textContent = '✓'; }
        } else {
          btn.classList.remove('active');
          const icon = btn.querySelector('.tbtn-check, .tbtn-box');
          if(icon) { icon.className = 'tbtn-box'; icon.textContent = ''; }
          if (btn.querySelector('.s3-tbtn-bot').textContent.trim() === 'Box') {
             btn.classList.add('active');
             if(icon) { icon.className = 'tbtn-check'; icon.textContent = '✓'; }
          }
        }
      });
    });
  }
  
  inputsBot.forEach(cb => {
    cb.addEventListener('change', () => {
      if (!cb.checked && allCbx) allCbx.checked = false;
    });
  });
}

function setupBetTypes() {
  document.querySelectorAll('.s3-tbtn').forEach(btn => {
    btn.onclick = () => {
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
    if(!el) return;
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
const originalUpdateStats = updateStats;
updateStats = function() {
  const n = sel['3D'].size;
  const tickets = document.querySelectorAll('#output .ticket').length;
  const s3s = document.getElementById('s3statSpots');
  const s3p = document.getElementById('s3statPrize');
  const points = document.querySelectorAll('.s3-stat-item .s3-bval')[3]; // Total Points

  if (s3s) s3s.textContent = n + tickets; 
  if (s3p) s3p.textContent = (n + tickets) * 10;
  if (points) points.textContent = (n + tickets) * 10;
};
