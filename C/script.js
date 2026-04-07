const sel = { C: new Set() };
let currentPage = 'C';
let countdown3 = 208;

function switchPage(p) {
  if (p === 'G') window.location.href = '../G/index.html';
  else if (p !== 'C') window.location.href = '../' + p + '/index.html';
}

function buildCHistory() {
  const hist = document.getElementById('cHistory');
  if(!hist) return;
  const items = [
    { img: '../assets/Platinum-Game/Tiger.png', emoji: '🐯', time: '11:50', sel: true },
    { img: '../assets/Platinum-Game/Tiger.png', emoji: '🐯', time: '11:45' },
    { img: '../assets/Platinum-Game/Butterfly.png', emoji: '🦋', time: '11:40' },
    { img: '../assets/Platinum-Game/Horse.png', emoji: '🐴', time: '11:35' },
    { img: '../assets/Platinum-Game/Kite.png', emoji: '🪁', time: '11:30' },
    { img: '../assets/Platinum-Game/Horse.png', emoji: '🐴', time: '11:25' },
    { img: '../assets/Platinum-Game/Kite.png', emoji: '🪁', time: '11:20' },
    { img: '../assets/Platinum-Game/Football.png', emoji: '⚽', time: '11:15' },
  ];
  hist.innerHTML = '';
  items.forEach(item => {
    const d = document.createElement('div');
    d.className = 'c-hist-item' + (item.sel ? ' sel-hist' : '');
    d.innerHTML = `
      <div class="c-hist-img">
        <img src="${item.img}" alt="${item.emoji}"
          onerror="this.parentNode.innerHTML='<span style=font-size:36px;line-height:1>${item.emoji}</span>'">
      </div>
      <div class="c-hist-time">${item.time}</div>`;
    hist.appendChild(d);
  });
}

function toggleCard(el, name) {
  el.classList.toggle('sel');
  if (el.classList.contains('sel')) sel.C.add(name); else sel.C.delete(name);
  updateCStats();
}

function updateCStats() {
  const spots = document.getElementById('cSpots');
  if(spots) spots.textContent = sel.C.size;
  const prize = document.getElementById('cPrize');
  if(prize) prize.textContent = sel.C.size * 10;
}

function selectQty(btn) {
  document.querySelectorAll('.cqty-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
}

function clearSelections() {
  sel.C.clear();
  document.querySelectorAll('.c-item.sel').forEach(e => e.classList.remove('sel'));
  updateCStats();
}

function updateClock() {
  const n = new Date();
  const pad = x => String(x).padStart(2, '0');
  const dt = document.getElementById('navDatetime');
  if (dt) dt.textContent = `${n.getDate()}/${n.getMonth() + 1}/${n.getFullYear()} | ${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
  let h = n.getHours(), ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12;
  const tm = `${h}:${pad(n.getMinutes())} ${ap}`;
  const ct = document.getElementById('cTime'); if (ct) ct.textContent = tm;
}

function updateCountdowns() {
  const box3 = document.getElementById('cCountdown');
  if (box3) {
    countdown3 = Math.max(0, countdown3 - 1); if (countdown3 === 0) countdown3 = 600;
    box3.textContent = String(Math.floor(countdown3 / 60)).padStart(2, '0') + ':' + String(countdown3 % 60).padStart(2, '0');
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'p' || e.key === 'P' || e.key === 'F7') { 
    e.preventDefault(); 
    const pb = document.getElementById('playBtn');
    if(pb) pb.click(); 
  }
  if (e.key === 'c' || e.key === 'C' || e.key === 'l' || e.key === 'L' || e.key === 'Escape') clearSelections();
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
  document.body.classList.add('body-C');

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
      const res = await API.balance(user.username, null, 'C');
      if (res && res.success && res.data) {
        const limitVal = document.getElementById('cLimitVal');
        if (limitVal) limitVal.textContent = res.data.balance;
      }
    } catch (e) { console.error('Balance error:', e); }
  };

  getBalance();
  setInterval(getBalance, 5000);

  buildCHistory();
  updateClock();
  applyMobileScale();
  setInterval(updateClock, 1000);
  setInterval(updateCountdowns, 1000);
});
