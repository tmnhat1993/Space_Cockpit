/**
 * Clock - Đồng hồ và ngày tháng
 */

export function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const clockEl = document.getElementById('clock-display');
  const dateEl = document.getElementById('date-display');
  if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;
  if (dateEl) {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    dateEl.textContent = `${days[now.getDay()]} ${String(now.getDate()).padStart(2, '0')}/${months[now.getMonth()]}/${now.getFullYear()}`;
  }
}

export function startClock() {
  setInterval(updateClock, 1000);
  updateClock();
}
