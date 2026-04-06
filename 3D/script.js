const sel = { '3D': new Set() };
let currentPage = '3D';
let countdown2 = 761;

function switchPage(p) {
  if (p === 'G') window.location.href = '../G/index.html';
  else if (p !== '3D') window.location.href = '../' + p + '/index.html';
}

function buildS3Digits() {
  const row = document.getElementById('s3Digits');
  if(!row) return;
  row.innerHTML = '';
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].forEach(n => {
    const d = document.createElement('div');
    d.className = 's3-dgt'; d.textContent = n;
    d.onclick = () => {
      d.classList.toggle('sel');
      const k = String(n);
      if (sel['3D'].has(k)) sel['3D'].delete(k); else sel['3D'].add(k);
      updateStats();
    };
    row.appendChild(d);
  });

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

  buildS3Digits();
  updateClock();
  applyMobileScale();
  setInterval(updateClock, 1000);
  setInterval(updateCountdowns, 1000);
});
