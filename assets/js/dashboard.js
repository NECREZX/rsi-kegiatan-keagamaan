// ===== DASHBOARD PAGE =====

let dashFilters = {
  tempat_tugas: "",
  struktur_lini: "",
  kelompok_nakes: "",
  status_pegawai: "",
  tahun: "",
};

function renderDashboard() {
  const el = document.getElementById("page-dashboard");
  const tahunList = FILTERS.tahun || DB.tahun || [];
  const defaultTahun =
    dashFilters.tahun ||
    (tahunList.includes("2026")
      ? "2026"
      : tahunList[tahunList.length - 1] || "2026");
  if (!dashFilters.tahun) dashFilters.tahun = defaultTahun;

  el.innerHTML = `
  <div class="fade-in">
    <!-- Filter Bar -->
    <div class="card p-3 md:p-4 mb-4 md:mb-5">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        <div class="col-span-2 md:col-span-1">
          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Tempat Tugas</label>
          <select class="select w-full text-sm" id="df-tt" onchange="updateDashFilter('tempat_tugas',this.value)">
            <option value="">Semua</option>
            ${FILTERS.tempat_tugas
              .map(
                (v) =>
                  `<option value="${v}" ${
                    dashFilters.tempat_tugas === v ? "selected" : ""
                  }>${v}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="col-span-2 md:col-span-1">
          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Struktur Lini</label>
          <select class="select w-full text-sm" id="df-sl" onchange="updateDashFilter('struktur_lini',this.value)">
            <option value="">Semua</option>
            ${FILTERS.struktur_lini
              .map(
                (v) =>
                  `<option value="${v}" ${
                    dashFilters.struktur_lini === v ? "selected" : ""
                  }>${v}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="col-span-2 md:col-span-1">
          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Kelompok Nakes</label>
          <select class="select w-full text-sm" id="df-kn" onchange="updateDashFilter('kelompok_nakes',this.value)">
            <option value="">Semua</option>
            ${FILTERS.kelompok_nakes
              .map(
                (v) =>
                  `<option value="${v}" ${
                    dashFilters.kelompok_nakes === v ? "selected" : ""
                  }>${v}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="col-span-2 md:col-span-1">
          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Status Pegawai</label>
          <select class="select w-full text-sm" id="df-sp" onchange="updateDashFilter('status_pegawai',this.value)">
            <option value="">Semua</option>
            <option value="Aktif">Semua Aktif</option>
            <option value="Berhenti">Status: Berhenti</option>
            ${FILTERS.status_pegawai
              .map(
                (v) =>
                  `<option value="${v}" ${
                    dashFilters.status_pegawai === v ? "selected" : ""
                  }>${v}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="col-span-1">
          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Tahun</label>
          <select class="select w-full text-sm" id="df-yr" onchange="updateDashFilter('tahun',this.value)">
            ${tahunList
              .map(
                (v) =>
                  `<option value="${v}" ${
                    dashFilters.tahun === v ? "selected" : ""
                  }>${v}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="col-span-1 flex items-end">
          <button class="btn-ghost btn-sm w-full flex items-center justify-center gap-1.5" onclick="resetDashFilters()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.14"/></svg>
            <span class="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-5" id="dashStats"></div>
    
    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-5">
      <div class="card p-4 md:p-5 lg:col-span-2">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
          <h3 class="font-semibold sf-text text-sm md:text-base">Tren Aktivitas Bulanan</h3>
          <div class="flex gap-1 p-1 rounded-lg" style="background:var(--surface2)">
            <button class="tab-btn active text-xs" id="ctab-line" onclick="switchChartType('line')">Line</button>
            <button class="tab-btn text-xs" id="ctab-bar" onclick="switchChartType('bar')">Bar</button>
          </div>
        </div>
        <div class="chart-wrap"><canvas id="dashChartMain"></canvas></div>
      </div>
      <div class="card p-4 md:p-5">
        <h3 class="font-semibold sf-text mb-4 text-sm md:text-base">Distribusi Aktivitas</h3>
        <div class="chart-wrap"><canvas id="dashChartPie"></canvas></div>
      </div>
    </div>
    
    <!-- Bottom: Gender & Status charts -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
      <div class="card p-4 md:p-5">
        <h3 class="font-semibold sf-text mb-4 text-sm md:text-base">Partisipasi per Jenis Kelamin</h3>
        <div class="chart-wrap" style="height:220px"><canvas id="dashChartGender"></canvas></div>
      </div>
      <div class="card p-4 md:p-5">
        <h3 class="font-semibold sf-text mb-4 text-sm md:text-base">Partisipasi per Status Pegawai</h3>
        <div class="chart-wrap" style="height:220px"><canvas id="dashChartStatus"></canvas></div>
      </div>
    </div>
  </div>`;

  updateDashContent();
}

function updateDashFilter(key, val) {
  dashFilters[key] = val;
  updateDashContent();
}

function resetDashFilters() {
  const tahunList = FILTERS.tahun || DB.tahun || [];
  dashFilters = {
    tempat_tugas: "",
    struktur_lini: "",
    kelompok_nakes: "",
    status_pegawai: "",
    tahun: tahunList.includes("2026") ? "2026" : tahunList[0] || "2026",
  };
  renderDashboard();
}

let dashChartType = "line";
function switchChartType(type) {
  dashChartType = type;
  document
    .getElementById("ctab-line")
    .classList.toggle("active", type === "line");
  document
    .getElementById("ctab-bar")
    .classList.toggle("active", type === "bar");
  renderMainChart();
}

function updateDashContent() {
  const tahun = dashFilters.tahun;
  const filtered = filterPegawai(dashFilters);

  let totalMengaji = 0, totalFiqih = 0, totalPHBI = 0;
  filtered.forEach((p) => {
    const d = getPegawaiData(p, tahun);
    totalMengaji += d.mengaji;
    totalFiqih += d.fiqih;
    totalPHBI += d.phbi;
  });

  const statsEl = document.getElementById("dashStats");
  if (statsEl) {
    statsEl.innerHTML = [
      { label: "Total Pegawai", val: filtered.length.toLocaleString("id"), icon: "👥", sub: "Sesuai filter", color: "#14532d", grad: "grad-green", badge: "rgba(20,83,45,0.08)" },
      { label: "Total Mengaji", val: totalMengaji.toLocaleString("id"), icon: "📖", sub: "Kehadiran " + tahun, color: "#16a34a", grad: "grad-emerald", badge: "rgba(22,163,74,0.08)" },
      { label: "Kajian Fiqih", val: totalFiqih.toLocaleString("id"), icon: "🕌", sub: "Kehadiran " + tahun, color: "#0d9488", grad: "grad-teal", badge: "rgba(13,148,136,0.08)" },
      { label: "PHBI", val: totalPHBI.toLocaleString("id"), icon: "🌙", sub: "Kehadiran " + tahun, color: "#65a30d", grad: "grad-lime", badge: "rgba(101,163,13,0.08)" },
    ]
      .map(
        (s) => `
      <div class="card-sm ${s.grad} p-4 md:p-5">
        <div class="flex items-start justify-between mb-2 md:mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style="background:${s.badge}">${s.icon}</div>
          <div class="badge" style="background:${s.badge}; color:${s.color}; font-size:10px; font-weight:700;">${tahun}</div>
        </div>
        <div class="text-2xl md:text-3xl font-bold sf-text mb-0.5" style="color:${s.color}">${s.val}</div>
        <div class="text-xs md:text-sm font-semibold" style="color:${s.color};opacity:0.7">${s.label}</div>
        <div class="text-xs mt-0.5 font-medium" style="color:var(--text3)">${s.sub}</div>
      </div>
    `
      )
      .join("");
  }

  renderMainChart();
  renderPieChart();
  renderGenderChart();
  renderStatusChart();
}

function renderMainChart() {
  const tahun = dashFilters.tahun;
  const filtered = filterPegawai(dashFilters);

  const monthlyData = MONTHS.map((m, i) => {
    const bulan = getMonthNum(i);
    let mengaji = 0, fiqih = 0, phbi = 0;
    filtered.forEach((p) => {
      const d = getPegawaiMonthData(p, tahun, bulan);
      mengaji += parseInt(d.mengaji || 0);
      fiqih += parseInt(d.kajian_fiqih || 0);
      phbi += parseInt(d.phbi || 0);
    });
    return { mengaji, fiqih, phbi };
  });

  makeChart("dashChartMain", dashChartType, MONTHS, [
    { label: "Mengaji", data: monthlyData.map((d) => d.mengaji), backgroundColor: COLORS.mengaji.light, borderColor: COLORS.mengaji.border, fill: dashChartType === "line", tension: 0.4, pointBackgroundColor: COLORS.mengaji.border, borderWidth: 2 },
    { label: "Kajian Fiqih", data: monthlyData.map((d) => d.fiqih), backgroundColor: COLORS.fiqih.light, borderColor: COLORS.fiqih.border, fill: dashChartType === "line", tension: 0.4, pointBackgroundColor: COLORS.fiqih.border, borderWidth: 2 },
    { label: "PHBI", data: monthlyData.map((d) => d.phbi), backgroundColor: COLORS.phbi.light, borderColor: COLORS.phbi.border, fill: dashChartType === "line", tension: 0.4, pointBackgroundColor: COLORS.phbi.border, borderWidth: 2 },
  ]);
}

function renderPieChart() {
  const tahun = dashFilters.tahun;
  const filtered = filterPegawai(dashFilters);
  let totalM = 0, totalF = 0, totalP = 0;
  filtered.forEach((p) => {
    const d = getPegawaiData(p, tahun);
    totalM += d.mengaji;
    totalF += d.fiqih;
    totalP += d.phbi;
  });
  makeChart("dashChartPie", "doughnut", ["Mengaji", "Kajian Fiqih", "PHBI"], [
    { data: [totalM, totalF, totalP], backgroundColor: [COLORS.mengaji.bg, COLORS.fiqih.bg, COLORS.phbi.bg], borderWidth: 3, borderColor: "white" },
  ], { cutout: "65%" });
}

function renderGenderChart() {
  const tahun = dashFilters.tahun;
  const filtered = filterPegawai(dashFilters);
  const byGender = {};
  filtered.forEach((p) => {
    const jk = p.jk || "Lainnya";
    if (!byGender[jk]) byGender[jk] = { mengaji: 0, fiqih: 0, phbi: 0 };
    const d = getPegawaiData(p, tahun);
    byGender[jk].mengaji += d.mengaji;
    byGender[jk].fiqih += d.fiqih;
    byGender[jk].phbi += d.phbi;
  });
  const labels = Object.keys(byGender).map((k) => k === "L" ? "Laki-laki" : k === "P" ? "Perempuan" : k);
  const keys = Object.keys(byGender);
  makeChart("dashChartGender", "bar", labels, [
    { label: "Mengaji", data: keys.map((k) => byGender[k].mengaji), backgroundColor: COLORS.mengaji.bg, borderRadius: 6 },
    { label: "Kajian Fiqih", data: keys.map((k) => byGender[k].fiqih), backgroundColor: COLORS.fiqih.bg, borderRadius: 6 },
    { label: "PHBI", data: keys.map((k) => byGender[k].phbi), backgroundColor: COLORS.phbi.bg, borderRadius: 6 },
  ]);
}

function renderStatusChart() {
  const tahun = dashFilters.tahun;
  const filtered = filterPegawai(dashFilters);
  const byStatus = {};
  filtered.forEach((p) => {
    const st = p.status_pegawai || "Lainnya";
    if (!byStatus[st]) byStatus[st] = { mengaji: 0, fiqih: 0, phbi: 0 };
    const d = getPegawaiData(p, tahun);
    byStatus[st].mengaji += d.mengaji;
    byStatus[st].fiqih += d.fiqih;
    byStatus[st].phbi += d.phbi;
  });
  const labels = Object.keys(byStatus);
  makeChart("dashChartStatus", "bar", labels, [
    { label: "Mengaji", data: labels.map((k) => byStatus[k].mengaji), backgroundColor: COLORS.mengaji.bg, borderRadius: 6 },
    { label: "Kajian Fiqih", data: labels.map((k) => byStatus[k].fiqih), backgroundColor: COLORS.fiqih.bg, borderRadius: 6 },
    { label: "PHBI", data: labels.map((k) => byStatus[k].phbi), backgroundColor: COLORS.phbi.bg, borderRadius: 6 },
  ]);
}
