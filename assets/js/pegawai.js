// ===== DATA PEGAWAI PAGE =====

let pegFilters = {
  tempat_tugas: "",
  struktur_lini: "",
  kelompok_nakes: "",
  status_pegawai: "",
  tahun: "",
  bulanDari: "01",
  bulanSampai: "12",
  search: "",
};
let pegSelected = new Set();
let pegPage = 1;
const PEG_PER_PAGE = 20;

function renderPegawai() {
  const el = document.getElementById("page-pegawai");
  const tahunList = FILTERS.tahun || DB.tahun || [];
  if (!pegFilters.tahun)
    pegFilters.tahun = tahunList.includes("2026")
      ? "2026"
      : tahunList[tahunList.length - 1] || "2026";

  el.innerHTML = `
  <div class="fade-in">
    <!-- Filters -->
    <div class="card p-3 md:p-4 mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-2 md:gap-3">
        <div class="sm:col-span-2 lg:col-span-3 xl:col-span-2">
          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Cari Pegawai</label>
          <input class="input text-sm" placeholder="Nama, NIK, Jabatan..." id="peg-search" value="${
            pegFilters.search
          }" oninput="updatePegFilter('search',this.value)">
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Tempat Tugas</label>
          <select class="select w-full text-sm" onchange="updatePegFilter('tempat_tugas',this.value)">
            <option value="">Semua</option>
            ${FILTERS.tempat_tugas
              .map(
                (v) =>
                  `<option value="${v}" ${
                    pegFilters.tempat_tugas === v ? "selected" : ""
                  }>${v}</option>`
              )
              .join("")}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Struktur Lini</label>
          <select class="select w-full text-sm" onchange="updatePegFilter('struktur_lini',this.value)">
            <option value="">Semua</option>
            ${FILTERS.struktur_lini
              .map(
                (v) =>
                  `<option value="${v}" ${
                    pegFilters.struktur_lini === v ? "selected" : ""
                  }>${v}</option>`
              )
              .join("")}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Kelompok Nakes</label>
          <select class="select w-full text-sm" onchange="updatePegFilter('kelompok_nakes',this.value)">
            <option value="">Semua</option>
            ${FILTERS.kelompok_nakes
              .map(
                (v) =>
                  `<option value="${v}" ${
                    pegFilters.kelompok_nakes === v ? "selected" : ""
                  }>${v}</option>`
              )
              .join("")}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Status</label>
          <select class="select w-full text-sm" onchange="updatePegFilter('status_pegawai',this.value)">
            <option value="">Semua (Aktif)</option>
            <option value="Berhenti">Berhenti</option>
            ${FILTERS.status_pegawai
              .map(
                (v) =>
                  `<option value="${v}" ${
                    pegFilters.status_pegawai === v ? "selected" : ""
                  }>${v}</option>`
              )
              .join("")}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Tahun</label>
          <select class="select w-full text-sm" onchange="updatePegFilter('tahun',this.value)">
            ${tahunList
              .map(
                (v) =>
                  `<option value="${v}" ${
                    pegFilters.tahun === v ? "selected" : ""
                  }>${v}</option>`
              )
              .join("")}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Bulan Dari</label>
          <select class="select w-full text-sm" onchange="updatePegFilter('bulanDari',this.value)">
            ${MONTHS_FULL.map((m,i)=>`<option value="${String(i+1).padStart(2,'0')}" ${pegFilters.bulanDari===String(i+1).padStart(2,'0')?'selected':''}>${m}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Bulan Sampai</label>
          <select class="select w-full text-sm" onchange="updatePegFilter('bulanSampai',this.value)">
            ${MONTHS_FULL.map((m,i)=>`<option value="${String(i+1).padStart(2,'0')}" ${pegFilters.bulanSampai===String(i+1).padStart(2,'0')?'selected':''}>${m}</option>`).join('')}
          </select>
        </div>
        <div class="sm:col-span-2 lg:col-span-1 flex items-end">
          <button class="btn-ghost btn-sm w-full flex items-center justify-center gap-1.5" onclick="resetPegFilters()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.14"/></svg>
            <span class="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Action bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
      <div class="flex items-center gap-3">
        <span class="text-xs sm:text-sm" style="color:var(--text2)" id="pegCount">0 pegawai</span>
        <span class="text-xs sm:text-sm" id="pegSelCount" style="color:var(--accent); display:none;"></span>
      </div>
      <div class="flex gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto">
        <button class="btn-ghost btn-sm flex items-center gap-1 text-xs flex-1 sm:flex-initial justify-center" onclick="selectAllPegawai()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          <span class="hidden sm:inline">Pilih Semua</span>
          <span class="sm:hidden">Semua</span>
        </button>
        <button class="btn-ghost btn-sm flex items-center gap-1 text-xs flex-1 sm:flex-initial justify-center" onclick="clearPegSelection()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <span class="hidden sm:inline">Batal Pilih</span>
          <span class="sm:hidden">Batal</span>
        </button>
        <button class="btn-accent btn-sm flex items-center gap-1 text-xs flex-1 sm:flex-initial justify-center" onclick="exportSelectedPdf()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          PDF
        </button>
        <button class="btn-primary btn-sm flex items-center gap-1 text-xs flex-1 sm:flex-initial justify-center" onclick="exportSelectedExcel()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          Excel
        </button>
      </div>
    </div>
    
    <!-- Table -->
    <div class="card">
      <div class="tbl-wrap">
        <table class="tbl" id="pegTable">
          <thead>
            <tr>
              <th style="width:40px"><input type="checkbox" class="cb-custom" id="checkAll" onchange="toggleAllPeg(this.checked)"></th>
              <th style="width:40px" class="hide-mobile">No</th>
              <th>Nama</th>
              <th class="hide-mobile">NIK</th>
              <th class="hide-mobile">Status</th>
              <th class="hide-mobile">J/K</th>
              <th class="hidden md:table-cell">Kelompok</th>
              <th class="hidden lg:table-cell">Jabatan</th>
              <th class="hidden xl:table-cell">Tempat Tugas</th>
              <th>Mengaji</th>
              <th class="hide-mobile">Fiqih</th>
              <th class="hide-mobile">PHBI</th>
              <th>Total</th>
              <th style="width:60px">Aksi</th>
            </tr>
          </thead>
          <tbody id="pegTbody"></tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div class="flex items-center justify-between p-4 border-t" style="border-color:var(--border)" id="pegPagination"></div>
    </div>
  </div>`;

  renderPegTable();
}

function updatePegFilter(key, val) {
  pegFilters[key] = val;
  pegPage = 1;
  pegSelected.clear();
  renderPegTable();
}

function resetPegFilters() {
  const tahunList = FILTERS.tahun || DB.tahun || [];
  pegFilters = {
    tempat_tugas: "",
    struktur_lini: "",
    kelompok_nakes: "",
    status_pegawai: "",
    tahun: tahunList.includes("2026") ? "2026" : tahunList[0] || "2026",
    bulanDari: "01",
    bulanSampai: "12",
    search: "",
  };
  pegPage = 1;
  pegSelected.clear();
  renderPegawai();
}

function getFilteredPegawai() {
  const q = pegFilters.search.toLowerCase();
  const RESIGNED = ['Berhenti - Mengundurkan Diri', 'Berhenti - Meninggal', 'Berhenti - Pensiun'];
  
  return filterPegawai(pegFilters).filter((p) => {
    const isResigned = RESIGNED.includes(p.status_pegawai);
    
    // Logic for 'Berhenti'
    if (pegFilters.status_pegawai === 'Berhenti') {
      if (!isResigned) return false;
    } else {
      // If NOT filtering for 'Berhenti', HIDE them
      if (isResigned) return false;
    }

    if (!q) return true;
    return (
      p.nama.toLowerCase().includes(q) ||
      String(p.nik).includes(q) ||
      p.nama_jabatan.toLowerCase().includes(q)
    );
  });
}

function renderPegTable() {
  const list = getFilteredPegawai();
  const tahun = pegFilters.tahun;
  const total = list.length;
  const start = (pegPage - 1) * PEG_PER_PAGE;
  const paged = list.slice(start, start + PEG_PER_PAGE);

  document.getElementById("pegCount").textContent = `${total.toLocaleString("id")} pegawai`;
  updateSelCount();

  const tbody = document.getElementById("pegTbody");
  if (!tbody) return;

  tbody.innerHTML = paged
    .map((p, i) => {
      // Use range for stats
      const d = getPegawaiDataRange(p, tahun, pegFilters.bulanDari, pegFilters.bulanSampai);
      const isSelected = pegSelected.has(p.id);
      return `
    <tr class="${isSelected ? "bg-green-50" : ""}">
      <td><input type="checkbox" class="cb-custom" ${
        isSelected ? "checked" : ""
      } onchange="togglePeg(${p.id},this.checked)"></td>
      <td class="text-xs hide-mobile" style="color:var(--text2)">${start + i + 1}</td>
      <td>
        <div class="font-medium text-sm leading-tight">${escHtml(p.nama)}</div>
        <div class="text-xs mt-0.5 md:hidden" style="color:var(--text2)">${escHtml(p.status_pegawai)} • ${p.jk}</div>
      </td>
      <td class="text-sm hide-mobile">${escHtml(p.nik)}</td>
      <td class="hide-mobile"><span class="badge ${
        p.status_pegawai === "Tetap" ? "badge-dark" : "badge-gold"
      } text-xs">${escHtml(p.status_pegawai)}</span></td>
      <td class="hide-mobile"><span class="badge ${
        p.jk === "L" ? "badge-dark" : "badge-gold"
      } text-xs">${p.jk === "L" ? "L" : "P"}</span></td>
      <td class="hidden md:table-cell text-xs">${escHtml(p.kelompok_nakes)}</td>
      <td class="hidden lg:table-cell text-xs" style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${escHtml(p.nama_jabatan)}</td>
      <td class="hidden xl:table-cell text-xs">${escHtml(p.tempat_tugas)}</td>
      <td class="text-xs sm:text-sm font-semibold" style="color:var(--accent)">${d.mengaji}</td>
      <td class="text-xs sm:text-sm font-semibold hide-mobile" style="color:var(--primary)">${d.fiqih}</td>
      <td class="text-xs sm:text-sm font-semibold hide-mobile" style="color:#8b5a2b">${d.phbi}</td>
      <td class="text-xs sm:text-sm font-bold">${d.total}</td>
      <td>
        <button class="btn-ghost text-xs px-2 py-1" style="font-size:11px" onclick="openDetailDrawer(${p.id})">Detail</button>
      </td>
    </tr>`;
    })
    .join("");

  // Pagination
  const totalPages = Math.ceil(total / PEG_PER_PAGE);
  const pagEl = document.getElementById("pegPagination");
  if (pagEl) {
    pagEl.innerHTML = `
    <span class="text-xs" style="color:var(--text2)">Hal. ${pegPage}/${totalPages} <span class="hidden sm:inline">· ${total} data</span></span>
    <div class="flex gap-1">
      <button class="btn-ghost btn-sm text-xs px-2 sm:px-3" ${
        pegPage <= 1 ? "disabled" : ""
      } onclick="pegGoPage(${pegPage - 1})"><span class="hidden sm:inline">‹ </span>Prev</button>
      ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        const pg = pegPage <= 3 ? i + 1 : pegPage + i - 2;
        if (pg < 1 || pg > totalPages) return "";
        return `<button class="btn-ghost btn-sm text-xs px-2 sm:px-3 hidden sm:inline-flex ${
          pg === pegPage ? "bg-green-100 font-semibold" : ""
        }" onclick="pegGoPage(${pg})">${pg}</button>`;
      }).join("")}
      <button class="btn-ghost btn-sm text-xs px-2 sm:px-3" ${
        pegPage >= totalPages ? "disabled" : ""
      } onclick="pegGoPage(${pegPage + 1})">Next<span class="hidden sm:inline"> ›</span></button>
    </div>`;
  }

  const checkAll = document.getElementById("checkAll");
  if (checkAll) {
    const pageIds = paged.map((p) => p.id);
    checkAll.checked = pageIds.length > 0 && pageIds.every((id) => pegSelected.has(id));
    checkAll.indeterminate = pageIds.some((id) => pegSelected.has(id)) && !checkAll.checked;
  }
}

function pegGoPage(p) { pegPage = p; renderPegTable(); }

function togglePeg(id, checked) {
  if (checked) pegSelected.add(id);
  else pegSelected.delete(id);
  updateSelCount();
}

function toggleAllPeg(checked) {
  const list = getFilteredPegawai();
  const start = (pegPage - 1) * PEG_PER_PAGE;
  list.slice(start, start + PEG_PER_PAGE).forEach((p) => {
    if (checked) pegSelected.add(p.id);
    else pegSelected.delete(p.id);
  });
  renderPegTable();
}

function selectAllPegawai() {
  getFilteredPegawai().forEach((p) => pegSelected.add(p.id));
  renderPegTable();
}

function clearPegSelection() {
  pegSelected.clear();
  renderPegTable();
}

function updateSelCount() {
  const el = document.getElementById("pegSelCount");
  if (!el) return;
  if (pegSelected.size > 0) {
    el.textContent = `${pegSelected.size} dipilih`;
    el.style.display = "";
  } else {
    el.style.display = "none";
  }
}

function exportSelectedPdf() {
  const ids = pegSelected.size > 0 ? [...pegSelected] : getFilteredPegawai().map((p) => p.id);
  const selected = DB.pegawai.filter((p) => ids.includes(p.id));
  const mStart = pegFilters.bulanDari;
  const mEnd = pegFilters.bulanSampai;
  const periodLabel = mStart === mEnd
    ? `${MONTHS_FULL[parseInt(mStart)-1]} ${pegFilters.tahun}`
    : `${MONTHS_FULL[parseInt(mStart)-1]} - ${MONTHS_FULL[parseInt(mEnd)-1]} ${pegFilters.tahun}`;
  
  exportToPDF(selected, pegFilters.tahun, "Rekap Data Pegawai Terpilih", periodLabel, mStart, mEnd);
}

function exportSelectedExcel() {
  const ids = pegSelected.size > 0 ? [...pegSelected] : getFilteredPegawai().map((p) => p.id);
  const selected = DB.pegawai.filter((p) => ids.includes(p.id));
  const mStart = pegFilters.bulanDari;
  const mEnd = pegFilters.bulanSampai;
  const periodLabel = mStart === mEnd
    ? `${MONTHS_FULL[parseInt(mStart)-1]} ${pegFilters.tahun}`
    : `${MONTHS_FULL[parseInt(mStart)-1]} - ${MONTHS_FULL[parseInt(mEnd)-1]} ${pegFilters.tahun}`;

  exportToExcel(selected, pegFilters.tahun, "Rekap_Pegawai", periodLabel, mStart, mEnd);
}

function escHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
