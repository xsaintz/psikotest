// Penggambar bersama untuk preview.html dan index.html: stimulus (teks/tabel/grafik/gambar) dan frame abstrak.
const fmt = v => typeof v === 'number' ? v.toLocaleString('id-ID') : v;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const FILL = f => f === 1 ? '#111' : f === 0.5 ? '#999' : '#fff';

function shape(s) {
  const st = `fill="${FILL(s.f)}" stroke="#111" stroke-width="2"`;
  if (s.t === 'circle') return `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" ${st}/>`;
  if (s.t === 'rect') return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" ${st}/>`;
  if (s.t === 'line') return `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="#111" stroke-width="2.5"/>`;
  if (s.t === 'poly') {
    const pts = [...Array(s.n)].map((_, i) => {
      const a = (-90 + i * 360 / s.n + s.rot) * Math.PI / 180;
      return `${(s.x + s.r * Math.cos(a)).toFixed(2)},${(s.y + s.r * Math.sin(a)).toFixed(2)}`;
    }).join(' ');
    return `<polygon points="${pts}" ${st}/>`;
  }
  if (s.t === 'arrow') {  // menunjuk ke kanan pada rot 0; rot positif = searah jarum jam
    const P = [[-1,-.3],[.15,-.3],[.15,-.7],[1,0],[.15,.7],[.15,.3],[-1,.3]];
    const pts = P.map(([x, y]) => `${(s.x + x * s.r).toFixed(2)},${(s.y + y * s.r).toFixed(2)}`).join(' ');
    return `<polygon points="${pts}" transform="rotate(${s.rot} ${s.x} ${s.y})" ${st}/>`;
  }
  return '';
}
// Gambar figural dan grafik dari web latihan TPP (Paket 7–8): pola arsir + gaya kelasnya, dipasang sekali.
document.head.insertAdjacentHTML('beforeend', `<style>
  .fig { width: 76px; height: 76px; flex: 0 0 auto; }
  .fig-frame { fill: #fff; stroke: #5b4a42; stroke-width: 1.4; }
  .fig-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; margin: 4px 0 12px; }
  .fig-row .fig, .fig-q { width: clamp(58px, 16vw, 100px); height: auto; aspect-ratio: 1 / 1; }
  .fig-q { display: grid; place-items: center; border: 2px dashed #c0392b; border-radius: 4px; color: #c0392b; font: 800 1.6rem sans-serif; }
  .fig-op { font: 800 1.3rem sans-serif; color: #777; }
  .fig-grid { display: grid; grid-template-columns: repeat(3, clamp(64px, 20vw, 92px)); gap: 6px; margin: 4px auto 12px; justify-content: center; }
  .fig-grid .fig, .fig-grid .fig-q { width: 100%; height: auto; aspect-ratio: 1 / 1; }
  svg.chart { width: 100%; height: auto; max-width: 440px; display: block; }
  .ch-l { font: 700 12.5px sans-serif; fill: #3a2a24; }
  .ch-v { font: 600 11px sans-serif; fill: #2a1d1a; }
  .ch-cap { margin: .2em 0 0; font-size: .8rem; color: #777; }
  .stim-html { white-space: normal; }
  .stim-html table { width: 100%; }
  .stim-html caption { text-align: left; font-weight: 700; padding: 0 0 6px; }
</style>`);
addEventListener('DOMContentLoaded', () => document.body.insertAdjacentHTML('beforeend',
  '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><pattern id="arsir" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#fff"/><line x1="0" y1="0" x2="0" y2="6" stroke="#1f1a17" stroke-width="2"/></pattern></defs></svg>'));

const frame = fr => `<svg viewBox="0 0 100 100" role="img"><rect x="2" y="2" width="96" height="96" fill="#fff" stroke="#111" stroke-width="2"/>${fr.map(shape).join('')}</svg>`;

function stimulus(s) {
  if (s.tipe === 'html') return `<div class="stim stim-html">${s.isi}</div>`;  // ponytail: HTML dari data paket sendiri, dipercaya
  if (s.tipe === 'teks') return `<div class="stim">${esc(s.isi)}</div>`;
  if (s.tipe === 'gambar') return `<div class="stim"><b>${esc(s.judul)}</b><br><img src="${esc(s.src)}" alt="${esc(s.judul)}" style="max-width:100%"></div>`;
  if (s.tipe === 'tabel') return `<div class="stim"><b>${esc(s.judul)}</b><div style="overflow-x:auto"><table><tr>${s.kolom.map(c => `<th>${esc(c)}</th>`).join('')}</tr>${s.baris.map(r => `<tr>${r.map(c => `<td>${fmt(c)}</td>`).join('')}</tr>`).join('')}</table></div></div>`;
  if (s.tipe === 'grafik') {  // grafik batang berkelompok
    const W = 560, H = 240, max = Math.max(...s.seri.flatMap(x => x.data)) * 1.1, n = s.seri.length;
    const gw = (W - 60) / s.kategori.length, bw = gw * 0.75 / n, warna = ['#1f4e79', '#e08a1e', '#6aa84f', '#999'];
    let g = '';
    s.kategori.forEach((k, i) => {
      s.seri.forEach((se, j) => {
        const h = se.data[i] / max * (H - 40), x = 50 + i * gw + j * bw + gw * 0.12;
        g += `<rect x="${x}" y="${H - 20 - h}" width="${bw - 2}" height="${h}" fill="${warna[j]}"/><text x="${x + bw / 2 - 1}" y="${H - 24 - h}" font-size="10" text-anchor="middle">${se.data[i]}</text>`;
      });
      g += `<text x="${50 + i * gw + gw / 2}" y="${H - 4}" font-size="12" text-anchor="middle">${esc(k)}</text>`;
    });
    const leg = s.seri.map((se, j) => `<span style="color:${warna[j]}">■</span> ${esc(se.nama)}`).join(' &nbsp; ');
    return `<div class="stim"><b>${esc(s.judul)}</b><br><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px"><line x1="45" y1="${H - 20}" x2="${W}" y2="${H - 20}" stroke="#333"/>${g}</svg><br>${leg}</div>`;
  }
  return '';
}
