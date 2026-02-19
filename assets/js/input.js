
// ===== INPUT AKTIVITAS PAGE — Form + CRUD Table (Kerohanian only) =====
let inputFilters = { tahun: '', bulanDari: '01', bulanSampai: '12', search: '', tempat_tugas: '' };
let inputPage = 1;
const INPUT_PER_PAGE = 15;
let inputTableData = [];
let editingRecord = null;
const RESIGNED_STATUSES = ['Berhenti - Mengundurkan Diri', 'Berhenti - Meninggal', 'Berhenti - Pensiun'];

function renderInput() {
  const el = document.getElementById('page-input');
  const tahunList = FILTERS.tahun || DB.tahun || [];
  const now = new Date();
  if (!inputFilters.tahun) inputFilters.tahun = String(now.getFullYear());
  // Helper for form default
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

  el.innerHTML = `<div class="fade-in">
    <!-- ===== FORM INPUT AKTIVITAS ===== -->
    <div class="card p-4 md:p-5 mb-4">
      <div class="flex items-center gap-2 mb-4">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: var(--accent-light);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        </div>
        <div>
          <h3 class="text-sm font-bold" style="color:var(--text)">Tambah Aktivitas Baru</h3>
          <p class="text-xs" style="color:var(--text3)">Isi formulir untuk menambah data kegiatan keagamaan</p>
        </div>
      </div>

      <form id="formAktivitas" onsubmit="submitAktivitas(event)">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <!-- Pegawai -->
          <div class="md:col-span-2">
            <label class="form-label">Pegawai <span style="color:var(--danger)">*</span></label>
            <div class="custom-select-wrap" id="pegawaiSelectWrap">
              <input type="text" class="input" id="pegawaiSearch" placeholder="Ketik nama atau NIK untuk mencari..." autocomplete="off" onclick="togglePegawaiDropdown(true)" oninput="filterPegawaiDropdown(this.value)">
              <input type="hidden" id="pegawaiId" required>
              <div class="custom-dropdown" id="pegawaiDropdown"></div>
            </div>
          </div>

          <!-- Tahun -->
          <div>
            <label class="form-label">Tahun <span style="color:var(--danger)">*</span></label>
            <select class="select w-full" id="formTahun" required>
              ${tahunList.map(v => `<option value="${v}" ${inputFilters.tahun === v ? 'selected' : ''}>${v}</option>`).join('')}
              ${!tahunList.includes(String(now.getFullYear())) ? `<option value="${now.getFullYear()}" selected>${now.getFullYear()}</option>` : ''}
            </select>
          </div>

          <!-- Bulan -->
          <div>
            <label class="form-label">Bulan <span style="color:var(--danger)">*</span></label>
            <select class="select w-full" id="formBulan" required>
              ${MONTHS_FULL.map((m, i) => `<option value="${String(i + 1).padStart(2, '0')}" ${currentMonth === String(i + 1).padStart(2, '0') ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>

          <!-- Mengaji -->
          <div>
            <label class="form-label">Mengaji</label>
            <div class="input-icon-wrap">
              <div class="input-icon" style="background: ${COLORS.mengaji.light}; color: ${COLORS.mengaji.border};">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <input type="number" class="input pl-12" id="formMengaji" min="0" max="99" value="0" placeholder="0">
            </div>
          </div>

          <!-- Kajian Fiqih -->
          <div>
            <label class="form-label">Kajian Fiqih</label>
            <div class="input-icon-wrap">
              <div class="input-icon" style="background: ${COLORS.fiqih.light}; color: ${COLORS.fiqih.border};">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              </div>
              <input type="number" class="input pl-12" id="formFiqih" min="0" max="99" value="0" placeholder="0">
            </div>
          </div>

          <!-- PHBI -->
          <div>
            <label class="form-label">PHBI</label>
            <div class="input-icon-wrap">
              <div class="input-icon" style="background: ${COLORS.phbi.light}; color: ${COLORS.phbi.border};">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <input type="number" class="input pl-12" id="formPhbi" min="0" max="99" value="0" placeholder="0">
            </div>
          </div>

          <!-- Spacer for alignment on desktop -->
          <div class="hidden md:block"></div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button type="submit" class="btn-accent flex items-center gap-2" id="formSubmitBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
            Simpan Aktivitas
          </button>
          <button type="button" class="btn-ghost btn-sm" onclick="resetForm()">Reset</button>
        </div>
      </form>
      <div id="formStatus" class="mt-3 text-sm font-medium" style="min-height:20px;"></div>
    </div>

    <!-- ===== DATA TABLE ===== -->
    <div class="card">
      <div class="p-3 md:p-4 border-b" style="border-color:var(--border)">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: var(--accent-light);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>
            </div>
            <h3 class="text-sm font-bold" style="color:var(--text)">Data Aktivitas</h3>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-accent btn-sm flex items-center gap-1 text-xs px-2" onclick="exportAktivitasPdf()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Export PDF
            </button>
            <span class="badge badge-gold text-xs" id="inputDataCount">0 data</span>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div>
            <label class="form-label-sm">Tahun</label>
            <select class="select w-full text-sm" id="tblFilterTahun" onchange="updateInputFilter('tahun',this.value)">${tahunList.map(v => `<option value="${v}" ${inputFilters.tahun === v ? 'selected' : ''}>${v}</option>`).join('')}
              ${!tahunList.includes(String(now.getFullYear())) ? `<option value="${now.getFullYear()}" selected>${now.getFullYear()}</option>` : ''}
            </select>
          </div>
          <div>
            <label class="form-label-sm">Bulan Dari</label>
            <select class="select w-full text-sm" id="tblFilterBulanDari" onchange="updateInputFilter('bulanDari',this.value)">
              ${MONTHS_FULL.map((m, i) => `<option value="${String(i + 1).padStart(2, '0')}" ${inputFilters.bulanDari === String(i + 1).padStart(2, '0') ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>
          <div>
             <label class="form-label-sm">Bulan Sampai</label>
             <select class="select w-full text-sm" id="tblFilterBulanSampai" onchange="updateInputFilter('bulanSampai',this.value)">
               ${MONTHS_FULL.map((m, i) => `<option value="${String(i + 1).padStart(2, '0')}" ${inputFilters.bulanSampai === String(i + 1).padStart(2, '0') ? 'selected' : ''}>${m}</option>`).join('')}
             </select>
          </div>
          <div>
            <label class="form-label-sm">Tempat Tugas</label>
            <select class="select w-full text-sm" onchange="updateInputFilter('tempat_tugas',this.value)">
              <option value="">Semua</option>
              ${FILTERS.tempat_tugas.map(v => `<option value="${v}" ${inputFilters.tempat_tugas === v ? 'selected' : ''}>${v}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label-sm">Cari</label>
            <input class="input text-sm" placeholder="Nama / NIK..." value="${inputFilters.search}" oninput="updateInputFilter('search',this.value)">
          </div>
        </div>
      </div>

      <div class="tbl-wrap" id="inputTableWrap">
        <table class="tbl" id="inputTable">
          <thead><tr>
            <th style="width:45px">No</th>
            <th>Nama Pegawai</th>
            <th class="hide-mobile">Tempat Tugas</th>
            <th class="hide-mobile">Bulan</th>
            <th style="width:75px">Mengaji</th>
            <th style="width:75px">Fiqih</th>
            <th style="width:65px">PHBI</th>
            <th style="width:65px">Total</th>
            <th style="width:100px">Aksi</th>
          </tr></thead>
          <tbody id="inputTbody"></tbody>
        </table>
      </div>

      <div class="flex items-center justify-between p-3 md:p-4 border-t" style="border-color:var(--border)" id="inputPagination"></div>
    </div>
  </div>

  <!-- ===== EDIT MODAL ===== -->
  <div class="modal-overlay" id="editModalOverlay" onclick="closeEditModal()"></div>
  <div class="modal-card" id="editModal">
    <div class="modal-header">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background: var(--accent-light);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </div>
        <div>
          <h3 class="text-sm font-bold" style="color:var(--text)">Edit Aktivitas</h3>
          <p class="text-xs" style="color:var(--text3)" id="editModalSub"></p>
        </div>
      </div>
      <button onclick="closeEditModal()" class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style="color:var(--text3)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="modal-body">
      <div class="grid grid-cols-1 gap-3">
        <div>
          <label class="form-label">Pegawai</label>
          <input type="text" class="input" id="editNama" readonly style="background: var(--surface2); cursor:not-allowed;">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="form-label">Tahun</label><input type="text" class="input" id="editTahun" readonly style="background: var(--surface2); cursor:not-allowed;"></div>
          <div><label class="form-label">Bulan</label><input type="text" class="input" id="editBulanLabel" readonly style="background: var(--surface2); cursor:not-allowed;"></div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="form-label">Mengaji</label>
            <input type="number" class="input text-center" id="editMengaji" min="0" max="99">
          </div>
          <div>
            <label class="form-label">Kajian Fiqih</label>
            <input type="number" class="input text-center" id="editFiqih" min="0" max="99">
          </div>
          <div>
            <label class="form-label">PHBI</label>
            <input type="number" class="input text-center" id="editPhbi" min="0" max="99">
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn-ghost btn-sm" onclick="closeEditModal()">Batal</button>
      <button class="btn-accent btn-sm flex items-center gap-1.5" onclick="saveEdit()" id="editSaveBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Simpan Perubahan
      </button>
    </div>
  </div>

  <!-- ===== DELETE CONFIRM MODAL ===== -->
  <div class="modal-overlay" id="deleteModalOverlay" onclick="closeDeleteModal()"></div>
  <div class="modal-card modal-sm" id="deleteModal">
    <div class="modal-body text-center py-6">
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style="background: rgba(220,38,38,0.08);">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </div>
      <h3 class="font-bold text-base mb-1" style="color:var(--text)">Hapus Data?</h3>
      <p class="text-sm" style="color:var(--text3)" id="deleteModalText">Data aktivitas akan dihapus permanen.</p>
    </div>
    <div class="modal-footer justify-center gap-2">
      <button class="btn-ghost btn-sm" onclick="closeDeleteModal()">Batal</button>
      <button class="btn-danger btn-sm flex items-center gap-1.5" onclick="confirmDelete()" id="deleteSaveBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        Hapus
      </button>
    </div>
  </div>`;

  loadInputTableData();
  setupPegawaiDropdownClose();
}

// ====== PEGAWAI SEARCHABLE DROPDOWN ======
let pegawaiDropdownOpen = false;

function togglePegawaiDropdown(show) {
  const dd = document.getElementById('pegawaiDropdown');
  if (!dd) return;
  pegawaiDropdownOpen = show;
  if (show) {
    filterPegawaiDropdown(document.getElementById('pegawaiSearch')?.value || '');
    dd.classList.add('open');
  } else {
    dd.classList.remove('open');
  }
}

function filterPegawaiDropdown(q) {
  const dd = document.getElementById('pegawaiDropdown');
  if (!dd) return;
  q = q.toLowerCase();
  const filtered = DB.pegawai.filter(p =>
    !RESIGNED_STATUSES.includes(p.status_pegawai) && (p.nama.toLowerCase().includes(q) || String(p.nik).includes(q))
  ).slice(0, 50);

  if (filtered.length === 0) {
    dd.innerHTML = '<div class="dd-empty">Pegawai tidak ditemukan</div>';
  } else {
    dd.innerHTML = filtered.map(p =>
      `<div class="dd-item" onclick="selectPegawai(${p.id})">
        <div class="font-medium text-sm">${escHtml(p.nama)}</div>
        <div class="text-xs" style="color:var(--text3)">${escHtml(p.nik)} · ${escHtml(p.tempat_tugas)}</div>
      </div>`
    ).join('');
  }
  dd.classList.add('open');
}

function selectPegawai(id) {
  const p = DB.pegawai.find(pg => pg.id === id);
  if (!p) return;
  document.getElementById('pegawaiSearch').value = p.nama + ' (' + p.nik + ')';
  document.getElementById('pegawaiId').value = id;
  togglePegawaiDropdown(false);
}

function setupPegawaiDropdownClose() {
  document.addEventListener('click', function(e) {
    const wrap = document.getElementById('pegawaiSelectWrap');
    if (wrap && !wrap.contains(e.target)) {
      togglePegawaiDropdown(false);
    }
  });
}

// ====== FORM SUBMIT ======
async function submitAktivitas(e) {
  e.preventDefault();
  const pegawaiId = document.getElementById('pegawaiId').value;
  const tahun = document.getElementById('formTahun').value;
  const bulan = document.getElementById('formBulan').value;
  const mengaji = parseInt(document.getElementById('formMengaji').value || 0);
  const fiqih = parseInt(document.getElementById('formFiqih').value || 0);
  const phbi = parseInt(document.getElementById('formPhbi').value || 0);

  if (!pegawaiId) {
    showFormStatus('Pilih pegawai terlebih dahulu', 'error');
    return;
  }
  if (mengaji + fiqih + phbi === 0) {
    showFormStatus('Isi minimal satu aktivitas', 'error');
    return;
  }

  const btn = document.getElementById('formSubmitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Menyimpan...';

  try {
    const res = await fetch('api/data.php?action=save_aktivitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: parseInt(pegawaiId),
        tahun, bulan,
        aktivitas: { mengaji, kajian_fiqih: fiqih, phbi }
      })
    });
    const json = await res.json();
    if (json.success) {
      // Update local data
      const peg = DB.pegawai.find(pg => pg.id === parseInt(pegawaiId));
      if (peg) {
        if (!peg.data[tahun]) peg.data[tahun] = {};
        if (!peg.data[tahun][bulan]) peg.data[tahun][bulan] = {};
        peg.data[tahun][bulan] = { mengaji, kajian_fiqih: fiqih, phbi };
      }
      showFormStatus('✓ Data aktivitas berhasil disimpan!', 'success');
      resetForm();
      loadInputTableData();
    } else {
      showFormStatus(json.message || 'Gagal menyimpan data', 'error');
    }
  } catch (err) {
    showFormStatus('Error: ' + err.message, 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg> Simpan Aktivitas';
}

function resetForm() {
  document.getElementById('pegawaiSearch').value = '';
  document.getElementById('pegawaiId').value = '';
  document.getElementById('formMengaji').value = 0;
  document.getElementById('formFiqih').value = 0;
  document.getElementById('formPhbi').value = 0;
  togglePegawaiDropdown(false);
}

function showFormStatus(msg, type) {
  const el = document.getElementById('formStatus');
  if (!el) return;
  const colors = { success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)', info: 'var(--accent)' };
  el.style.color = colors[type] || 'var(--text2)';
  el.textContent = msg;
  if (type !== 'info') setTimeout(() => { el.textContent = ''; }, 4000);
}

// ====== TABLE FILTERS ======
function updateInputFilter(k, v) {
  inputFilters[k] = v;
  inputPage = 1;
  loadInputTableData();
}

// ====== TABLE DATA LOADING ======
function loadInputTableData() {
  // Build table from local data (client-side filtering)
  const tahun = inputFilters.tahun;
  const mStart = parseInt(inputFilters.bulanDari);
  const mEnd = parseInt(inputFilters.bulanSampai);
  const q = inputFilters.search.toLowerCase();
  const tempat = inputFilters.tempat_tugas;

  let result = [];
  DB.pegawai.forEach(p => {
    if (RESIGNED_STATUSES.includes(p.status_pegawai)) return;
    if (tempat && p.tempat_tugas !== tempat) return;
    if (q && !p.nama.toLowerCase().includes(q) && !String(p.nik).includes(q)) return;

    if (tahun) {
      const yearData = p.data?.[tahun] || {};
      for (const bln of Object.keys(yearData)) {
        const mVal = parseInt(bln);
        if (mVal < mStart || mVal > mEnd) continue;

        const d = yearData[bln];
        const mengaji = parseInt(d.mengaji || 0);
        const fiqih = parseInt(d.kajian_fiqih || 0);
        const phbi = parseInt(d.phbi || 0);
        if (mengaji + fiqih + phbi > 0) {
          result.push({
            id: p.id, nama: p.nama, nik: p.nik,
            tempat_tugas: p.tempat_tugas,
            tahun, bulan: bln,
            mengaji, kajian_fiqih: fiqih, phbi,
            total: mengaji + fiqih + phbi
          });
        }
      }
    }
  });

  result.sort((a, b) => a.nama.localeCompare(b.nama));
  inputTableData = result;
  renderInputDataTable();
}

function renderInputDataTable() {
  const list = inputTableData;
  const total = list.length;
  const start = (inputPage - 1) * INPUT_PER_PAGE;
  const paged = list.slice(start, start + INPUT_PER_PAGE);
  const tbody = document.getElementById('inputTbody');
  if (!tbody) return;

  // Update count badge
  const countEl = document.getElementById('inputDataCount');
  if (countEl) countEl.textContent = total + ' data';

  if (paged.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center py-8">
      <div style="color:var(--text3)">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="mx-auto mb-2" style="opacity:0.4"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>
        <p class="text-sm font-medium">Belum ada data aktivitas</p>
        <p class="text-xs mt-1">Gunakan form di atas untuk menambah data</p>
      </div>
    </td></tr>`;
  } else {
    tbody.innerHTML = paged.map((r, i) => {
      const bulanLabel = MONTHS[parseInt(r.bulan) - 1] || r.bulan;
      return `<tr>
        <td class="text-xs text-center">${start + i + 1}</td>
        <td>
          <div class="font-medium text-sm">${escHtml(r.nama)}</div>
          <div class="text-xs md:hidden" style="color:var(--text3)">${escHtml(r.tempat_tugas)} · ${bulanLabel}</div>
        </td>
        <td class="text-xs hide-mobile">${escHtml(r.tempat_tugas)}</td>
        <td class="text-xs hide-mobile">${bulanLabel} ${r.tahun}</td>
        <td class="text-center">
          <span class="badge badge-green">${r.mengaji}</span>
        </td>
        <td class="text-center">
          <span class="badge badge-dark">${r.kajian_fiqih}</span>
        </td>
        <td class="text-center">
          <span class="badge badge-gold">${r.phbi}</span>
        </td>
        <td class="text-center font-bold text-sm" style="color:var(--accent)">${r.total}</td>
        <td>
          <div class="flex items-center gap-1">
            <button class="action-btn action-edit" onclick="openEditModal(${r.id},'${r.tahun}','${r.bulan}')" title="Edit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="action-btn action-delete" onclick="openDeleteModal(${r.id},'${r.tahun}','${r.bulan}','${escHtml(r.nama)}')" title="Hapus">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(total / INPUT_PER_PAGE));
  const pagEl = document.getElementById('inputPagination');
  if (pagEl) {
    pagEl.innerHTML = `
      <span class="text-xs" style="color:var(--text3)">Hal. ${inputPage}/${totalPages} · ${total} data</span>
      <div class="flex gap-1">
        <button class="btn-ghost btn-sm text-xs" ${inputPage <= 1 ? 'disabled' : ''} onclick="inputGoPage(${inputPage - 1})">‹ Prev</button>
        <button class="btn-ghost btn-sm text-xs" ${inputPage >= totalPages ? 'disabled' : ''} onclick="inputGoPage(${inputPage + 1})">Next ›</button>
      </div>`;
  }
}

function inputGoPage(p) { inputPage = p; renderInputDataTable(); }

// ====== EDIT MODAL ======
function openEditModal(id, tahun, bulan) {
  const peg = DB.pegawai.find(p => p.id === id);
  if (!peg) return;
  const d = peg.data?.[tahun]?.[bulan] || {};
  editingRecord = { id, tahun, bulan };

  document.getElementById('editNama').value = peg.nama;
  document.getElementById('editTahun').value = tahun;
  document.getElementById('editBulanLabel').value = MONTHS_FULL[parseInt(bulan) - 1] || bulan;
  document.getElementById('editMengaji').value = parseInt(d.mengaji || 0);
  document.getElementById('editFiqih').value = parseInt(d.kajian_fiqih || 0);
  document.getElementById('editPhbi').value = parseInt(d.phbi || 0);
  document.getElementById('editModalSub').textContent = peg.nama + ' — ' + MONTHS_FULL[parseInt(bulan) - 1] + ' ' + tahun;

  document.getElementById('editModal').classList.add('open');
  document.getElementById('editModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('open');
  document.getElementById('editModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  editingRecord = null;
}

async function saveEdit() {
  if (!editingRecord) return;
  const { id, tahun, bulan } = editingRecord;
  const mengaji = parseInt(document.getElementById('editMengaji').value || 0);
  const fiqih = parseInt(document.getElementById('editFiqih').value || 0);
  const phbi = parseInt(document.getElementById('editPhbi').value || 0);

  const btn = document.getElementById('editSaveBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;"></span> Menyimpan...';

  try {
    const res = await fetch('api/data.php?action=save_aktivitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, tahun, bulan, aktivitas: { mengaji, kajian_fiqih: fiqih, phbi } })
    });
    const json = await res.json();
    if (json.success) {
      // Update local data
      const peg = DB.pegawai.find(p => p.id === id);
      if (peg) {
        if (!peg.data[tahun]) peg.data[tahun] = {};
        if (!peg.data[tahun][bulan]) peg.data[tahun][bulan] = {};
        peg.data[tahun][bulan] = { mengaji, kajian_fiqih: fiqih, phbi };
      }
      closeEditModal();
      loadInputTableData();
      showFormStatus('✓ Data berhasil diperbarui!', 'success');
    } else {
      alert(json.message || 'Gagal menyimpan');
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }

  btn.disabled = false;
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Simpan Perubahan';
}

// ====== DELETE MODAL ======
let deleteTarget = null;

function openDeleteModal(id, tahun, bulan, nama) {
  deleteTarget = { id, tahun, bulan };
  const bulanLabel = MONTHS_FULL[parseInt(bulan) - 1] || bulan;
  document.getElementById('deleteModalText').textContent =
    `Hapus data aktivitas "${nama}" bulan ${bulanLabel} ${tahun}?`;
  document.getElementById('deleteModal').classList.add('open');
  document.getElementById('deleteModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('open');
  document.getElementById('deleteModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  deleteTarget = null;
}

async function confirmDelete() {
  if (!deleteTarget) return;
  const { id, tahun, bulan } = deleteTarget;
  const btn = document.getElementById('deleteSaveBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;border-width:2px;"></span> Menghapus...';

  try {
    const res = await fetch('api/data.php?action=delete_aktivitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, tahun, bulan })
    });
    const json = await res.json();
    if (json.success) {
      // Update local data
      const peg = DB.pegawai.find(p => p.id === id);
      if (peg && peg.data?.[tahun]?.[bulan]) {
        delete peg.data[tahun][bulan];
        if (Object.keys(peg.data[tahun]).length === 0) delete peg.data[tahun];
      }
      closeDeleteModal();
      loadInputTableData();
      showFormStatus('✓ Data berhasil dihapus', 'success');
    } else {
      alert(json.message || 'Gagal menghapus');
    }
  } catch (err) {
    alert('Error: ' + err.message);
  }

  btn.disabled = false;
  btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg> Hapus';
}

function exportAktivitasPdf() {
  const tahun = inputFilters.tahun;
  const mStart = parseInt(inputFilters.bulanDari);
  const mEnd = parseInt(inputFilters.bulanSampai);
  const q = inputFilters.search.toLowerCase();
  const tempat = inputFilters.tempat_tugas;

  // Filter Pegawai who match the criteria
  let list = DB.pegawai.filter(p => {
    if (RESIGNED_STATUSES.includes(p.status_pegawai)) return false;
    if (tempat && p.tempat_tugas !== tempat) return false;
    if (q && !p.nama.toLowerCase().includes(q) && !String(p.nik).includes(q)) return false;
    return true;
  });

  // Filter to only include those with activity > 0 in the selected range
  list = list.filter(p => {
    const d = getPegawaiDataRange(p, tahun, inputFilters.bulanDari, inputFilters.bulanSampai);
    return d.total > 0;
  });

  if (list.length === 0) {
    alert("Tidak ada data aktivitas untuk di-export pada periode ini");
    return;
  }

  const periodLabel = mStart === mEnd
    ? `${MONTHS_FULL[mStart - 1]} ${tahun}`
    : `${MONTHS_FULL[mStart - 1]} - ${MONTHS_FULL[mEnd - 1]} ${tahun}`;

  const customSignatures = {
    left: { title: "Kepala Instalasi Kerohanian", name: "Asmujahidin, S.Ag", nik: "022706270" },
    right: { title: "Kepala Urusan Kerohanian", name: "Eviana", nik: "022710434" }
  };

  exportToPDF(list, tahun, "Laporan Aktivitas Kerohanian", periodLabel, inputFilters.bulanDari, inputFilters.bulanSampai, customSignatures);
}
