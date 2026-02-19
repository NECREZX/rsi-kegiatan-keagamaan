<?php
$role = $_SESSION['role'];
$name = $_SESSION['name'];
$isKerohanian = $role === 'kerohanian';
$isSDM = $role === 'sdm';
?>

<!-- ===== SIDEBAR OVERLAY (mobile) ===== -->
<div class="sidebar-overlay" id="sidebarOverlay"></div>

<!-- ===== SIDEBAR ===== -->
<nav class="sidebar no-select" id="sidebar">
  <div class="sidebar-logo">
    <div class="flex items-center gap-3">
      <div class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style="background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.2);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="1.8">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div>
        <div class="text-white font-bold text-sm leading-tight sf-text">Rekap Kegiatan Keagamaan</div>
        <div class="text-xs" style="color: rgba(134,239,172,0.5);">RSI Siti Khadijah Palembang</div>
      </div>
    </div>
  </div>

  <div class="sidebar-nav">
    <div class="nav-section">Utama</div>
    <a onclick="showPage('dashboard')" class="nav-item active" id="nav-dashboard">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>
      Dashboard
    </a>
    <a onclick="showPage('pegawai')" class="nav-item" id="nav-pegawai">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      Data Pegawai
    </a>
    <a onclick="showPage('grafik')" class="nav-item" id="nav-grafik">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      Visualisasi
    </a>
    <a onclick="showPage('top10')" class="nav-item" id="nav-top10">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 12 7s5-3 7.5-3a2.5 2.5 0 0 1 0 5H18"/><path d="M12 7v10"/><path d="M8 21h8"/></svg>
      Top 10
    </a>

    <?php if ($isKerohanian): ?>
    <div class="nav-section">Data</div>
    <a onclick="showPage('input')" class="nav-item" id="nav-input">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      Input Aktivitas
    </a>
    <?php endif; ?>

    <?php if ($isSDM): ?>
    <div class="nav-section">Manajemen</div>
    <a onclick="showPage('kelola-pegawai')" class="nav-item" id="nav-kelola-pegawai">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
      Kelola Pegawai
    </a>
    <?php endif; ?>

    <div class="nav-section">Laporan</div>
    <a onclick="showPage('export')" class="nav-item" id="nav-export">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Export Data
    </a>
  </div>

  <!-- User info at bottom -->
  <div class="sidebar-user">
    <div class="flex items-center gap-3 p-2.5 rounded-xl" style="background: rgba(255,255,255,0.04);">
      <div class="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style="background: var(--green-600); color: white;">
        <?= strtoupper(substr($name, 0, 2)) ?>
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-white text-xs font-semibold truncate"><?= htmlspecialchars($name) ?></div>
        <div class="flex items-center gap-1.5 mt-0.5">
          <span class="pulse-dot"></span>
          <span class="text-xs capitalize" style="color: rgba(134,239,172,0.5);"><?= htmlspecialchars($role) ?></span>
        </div>
      </div>
      <a href="?logout=1" class="p-1.5 rounded-lg hover:bg-white/10 transition-all" style="color: rgba(255,255,255,0.3);" title="Keluar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </a>
    </div>
  </div>
</nav>

<!-- ===== MAIN CONTENT ===== -->
<div class="main-content">
  <!-- Topbar -->
  <header class="topbar">
    <div class="flex items-center gap-3">
      <!-- HAMBURGER BUTTON — visible on mobile only -->
      <button onclick="toggleSidebar()" id="hamburgerBtn" class="p-2 rounded-lg transition-colors" style="display:none; -webkit-tap-highlight-color: transparent; color: var(--text); border: 1px solid var(--border); background: var(--surface);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div>
        <h2 class="font-bold text-base sf-text" id="pageTitle">Dashboard</h2>
        <p class="text-xs font-medium" style="color: var(--text3);" id="pageSub">Rekap Kegiatan Keagamaan</p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="badge badge-gold text-xs"><?= htmlspecialchars($role === 'kerohanian' ? '🕌 Kerohanian' : '📋 SDM') ?></div>
      <div class="hidden md:block text-xs font-medium" style="color: var(--text3);" id="currentDate"></div>
    </div>
  </header>

  <!-- Content area -->
  <div class="p-3 md:p-5 lg:p-6">

    <!-- Loading state -->
    <div id="appLoader" class="flex items-center justify-center py-24">
      <div class="text-center">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-sm font-medium" style="color: var(--text3);">Memuat data...</p>
      </div>
    </div>

    <div class="page-content" id="page-dashboard"></div>
    <div class="page-content" id="page-pegawai"></div>
    <div class="page-content" id="page-grafik"></div>
    <div class="page-content" id="page-top10"></div>
    <?php if ($isKerohanian): ?>
    <div class="page-content" id="page-input"></div>
    <?php endif; ?>
    <?php if ($isSDM): ?>
    <div class="page-content" id="page-kelola-pegawai"></div>
    <?php endif; ?>
    <div class="page-content" id="page-export"></div>

    <footer class="mt-8 text-center text-xs pb-4" style="color:var(--text3)">
      © 2026 RSI Siti Khadijah Palembang<br>
      Developed by <span style="color:var(--accent); font-weight:600">Muhammad Rifqi Thoohaa Anas</span>
    </footer>

  </div>
</div>

<!-- ===== DETAIL DRAWER ===== -->
<div class="drawer-overlay" id="drawerOverlay"></div>
<div class="drawer" id="detailDrawer">
  <div id="drawerContent"></div>
</div>

<script>
const APP_ROLE = '<?= $role ?>';
const IS_KEROHANIAN = APP_ROLE === 'kerohanian';
const IS_SDM = APP_ROLE === 'sdm';

let DB = { pegawai: [], tahun: [], total: 0 };
let FILTERS = { tempat_tugas: [], struktur_lini: [], kelompok_nakes: [], status_pegawai: [], tahun: [] };
let activeCharts = {};

// ====== MOBILE SIDEBAR ======
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    closeSidebar();
  } else {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('sidebar-open');
  }
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
  document.body.classList.remove('sidebar-open');
}

// Overlay click closes sidebar
document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);
document.getElementById('sidebarOverlay').addEventListener('touchstart', function(e) {
  e.preventDefault();
  closeSidebar();
}, { passive: false });

// Show hamburger on mobile
function updateHamburger() {
  const btn = document.getElementById('hamburgerBtn');
  if (btn) btn.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
}
updateHamburger();
window.addEventListener('resize', updateHamburger);

// ====== NAVIGATION ======
const pageTitles = {
  dashboard: ['Dashboard', 'Rekap kegiatan keagamaan'],
  pegawai: ['Data Pegawai', 'Daftar seluruh pegawai'],
  grafik: ['Visualisasi', 'Analisis aktivitas keagamaan'],
  top10: ['Top 10', 'Pegawai paling aktif'],
  input: ['Input Aktivitas', 'Tambah data aktivitas'],
  'kelola-pegawai': ['Kelola Pegawai', 'Tambah, edit, hapus pegawai'],
  export: ['Export Data', 'Unduh laporan']
};

function showPage(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  const navEl = document.getElementById('nav-' + page);
  if (navEl) navEl.classList.add('active');
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  const titles = pageTitles[page] || [page, ''];
  document.getElementById('pageTitle').textContent = titles[0];
  document.getElementById('pageSub').textContent = titles[1];

  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) {
    closeSidebar();
  }

  // Scroll to top
  window.scrollTo(0, 0);

  switch(page) {
    case 'dashboard': renderDashboard(); break;
    case 'pegawai': renderPegawai(); break;
    case 'grafik': renderGrafik(); break;
    case 'top10': renderTop10(); break;
    case 'input': if(IS_KEROHANIAN) renderInput(); break;
    case 'kelola-pegawai': if(IS_SDM) renderKelolaPegawai(); break;
    case 'export': renderExport(); break;
  }
}

// ====== DATA LOADING ======
async function loadData() {
  try {
    const [dataRes, filterRes] = await Promise.all([
      fetch('api/data.php?action=get_all'),
      fetch('api/data.php?action=get_filters')
    ]);
    const dataJson = await dataRes.json();
    const filterJson = await filterRes.json();
    if (dataJson.success) DB = dataJson.data;
    if (filterJson.success) FILTERS = filterJson.data;
    document.getElementById('appLoader').style.display = 'none';
    showPage('dashboard');
  } catch(e) {
    document.getElementById('appLoader').innerHTML = `<div class="text-center"><p style="color:var(--danger)" class="font-medium">Gagal memuat data: ${e.message}</p><button class="btn-ghost btn-sm mt-3" onclick="location.reload()">Coba Lagi</button></div>`;
  }
}

// ====== HELPERS ======
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agust','Sep','Okt','Nop','Des'];
const MONTHS_FULL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function escHtml(str) { const d=document.createElement('div'); d.textContent=str||''; return d.innerHTML; }
function getMonthNum(idx) { return String(idx+1).padStart(2,'0'); }

function getPegawaiData(p, tahun) {
  let mengaji=0, fiqih=0, phbi=0;
  const yData = p.data?.[tahun] || {};
  for(const m of Object.values(yData)) {
    mengaji += parseInt(m.mengaji||0);
    fiqih += parseInt(m.kajian_fiqih||0);
    phbi += parseInt(m.phbi||0);
  }
  return {mengaji, fiqih, phbi, total: mengaji+fiqih+phbi};
}

function getPegawaiDataRange(p, tahun, bulanDari, bulanSampai){
  let mengaji=0, fiqih=0, phbi=0;
  const dari=parseInt(bulanDari);
  const sampai=parseInt(bulanSampai);
  const yData = p.data?.[tahun] || {};
  for(let m=dari; m<=sampai; m++){
    const bln=String(m).padStart(2,'0');
    const md=yData[bln];
    if(md){
      mengaji += parseInt(md.mengaji||0);
      fiqih += parseInt(md.kajian_fiqih||0);
      phbi += parseInt(md.phbi||0);
    }
  }
  return {mengaji, fiqih, phbi, total: mengaji+fiqih+phbi};
}

function getPegawaiMonthData(p, tahun, bulan) {
  return p.data?.[tahun]?.[bulan] || {mengaji:0, kajian_fiqih:0, phbi:0};
}

function filterPegawai(filters={}) {
  return DB.pegawai.filter(p => {
    if(filters.tempat_tugas && p.tempat_tugas !== filters.tempat_tugas) return false;
    if(filters.struktur_lini && p.struktur_lini !== filters.struktur_lini) return false;
    if(filters.kelompok_nakes && p.kelompok_nakes !== filters.kelompok_nakes) return false;
    if(filters.status_pegawai) {
      if(filters.status_pegawai === 'Berhenti') {
        // Match Berhenti-* OR legacy values
        const isResigned = (p.status_pegawai || '').startsWith('Berhenti') || ['Mengundurkan Diri', 'Meninggal', 'Pensiun'].includes(p.status_pegawai);
        if(!isResigned) return false;
      } else if(filters.status_pegawai === 'Aktif') {
        // Exclude resigned
        const isResigned = (p.status_pegawai || '').startsWith('Berhenti') || ['Mengundurkan Diri', 'Meninggal', 'Pensiun'].includes(p.status_pegawai);
        if(isResigned) return false;
      } else {
        if(p.status_pegawai !== filters.status_pegawai) return false;
      }
    }
    return true;
  });
}

function destroyChart(id) {
  if(activeCharts[id]) { activeCharts[id].destroy(); delete activeCharts[id]; }
}

function makeChart(id, type, labels, datasets, opts={}) {
  destroyChart(id);
  const ctx = document.getElementById(id)?.getContext('2d');
  if(!ctx) return;
  activeCharts[id] = new Chart(ctx, {
    type,
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: opts.legendPos || 'bottom', labels: { font: { family: 'Inter', size: 11, weight: '500' }, padding: 14, usePointStyle: true, pointStyleWidth: 10 } },
        tooltip: { backgroundColor: 'rgba(20,83,45,0.92)', titleFont: { family: 'Inter', size: 12, weight: '600' }, bodyFont: { family: 'Inter', size: 11 }, padding: 12, cornerRadius: 10, boxPadding: 4 }
      },
      scales: type !== 'pie' && type !== 'doughnut' ? {
        x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#86a893', maxRotation: 45 } },
        y: { grid: { color: 'rgba(187,247,208,0.4)', drawBorder: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#86a893' } }
      } : undefined,
      ...opts
    }
  });
}

// Chart color scheme — green variations
const COLORS = {
  mengaji: { bg: 'rgba(22,163,74,0.75)', border: '#16a34a', light: 'rgba(22,163,74,0.08)' },
  fiqih: { bg: 'rgba(13,148,136,0.75)', border: '#0d9488', light: 'rgba(13,148,136,0.08)' },
  phbi: { bg: 'rgba(101,163,13,0.75)', border: '#65a30d', light: 'rgba(101,163,13,0.08)' }
};

// Set date
const now = new Date();
const dateEl = document.getElementById('currentDate');
if (dateEl) dateEl.textContent = now.toLocaleDateString('id-ID', {weekday:'long', year:'numeric', month:'long', day:'numeric'});

// ====== DRAWER ======
function openDrawer(html) {
  document.getElementById('drawerContent').innerHTML = html;
  document.getElementById('detailDrawer').classList.add('open');
  document.getElementById('drawerOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  if (window.innerWidth <= 768) document.body.classList.add('drawer-open');
}
function closeDrawer() {
  document.getElementById('detailDrawer').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('open');
  document.body.style.overflow = '';
  document.body.classList.remove('drawer-open');
  ['drawerChartBar','drawerChartLine','drawerChartPie'].forEach(id => destroyChart(id));
}
document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);

loadData();
</script>

<script src="assets/js/dashboard.js?v=<?= time() ?>"></script>
<script src="assets/js/pegawai.js?v=<?= time() ?>"></script>
<script src="assets/js/grafik.js?v=<?= time() ?>"></script>
<script src="assets/js/top10.js?v=<?= time() ?>"></script>
<?php if ($isKerohanian): ?><script src="assets/js/input.js?v=<?= time() ?>"></script><?php endif; ?>
<?php if ($isSDM): ?><script src="assets/js/kelola_pegawai.js?v=<?= time() ?>"></script><?php endif; ?>
<script src="assets/js/export.js?v=<?= time() ?>"></script>
<script src="assets/js/detail.js?v=<?= time() ?>"></script>
