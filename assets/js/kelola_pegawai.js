// ===== KELOLA PEGAWAI PAGE (SDM only) =====
let kpPage = 1;
const KP_PER_PAGE = 15;
let kpSearch = '';
let kpFilterTT = '';
let kpFilterStatus = '';
let editingPegawai = null;
let deletingPegawai = null;

function renderKelolaPegawai() {
  const el = document.getElementById('page-kelola-pegawai');
  if (!el) return;

  el.innerHTML = `<div class="fade-in">
    <!-- Toast Container -->
    <div id="kpToast" style="position:fixed; top:20px; right:20px; z-index:9999; display:none; transition:all 0.3s; transform:translateY(-20px); opacity:0">
      <div class="card p-4 shadow-lg border-l-4 flex items-center gap-3" id="kpToastContent" style="min-width:300px; background:white;">
        <div id="kpToastIcon"></div>
        <div class="text-sm font-medium" id="kpToastMsg"></div>
      </div>
    </div>

    <!-- Form Tambah Pegawai -->
    <div class="card p-4 md:p-5 mb-4">
      <h3 class="font-semibold sf-text text-sm mb-4 flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:var(--accent-light)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        </span>
        Tambah Pegawai Baru
      </h3>
      <form id="formTambahPegawai" onsubmit="submitTambahPegawai(event)">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label class="form-label">Nama Lengkap <span style="color:var(--danger)">*</span></label>
            <input class="input text-sm" id="kpNama" required placeholder="Nama pegawai">
          </div>
          <div>
            <label class="form-label">NIK <span style="color:var(--danger)">*</span></label>
            <input class="input text-sm" id="kpNik" required placeholder="N I K">
          </div>
          <div>
            <label class="form-label">Status Pegawai</label>
            <select class="select w-full text-sm" id="kpStatus" onchange="toggleDateInput(this)">
              <option value="Capeg">Capeg</option>
              <option value="Kontrak">Kontrak</option>
              <option value="PKWT">PKWT</option>
              <option value="Tetap">Tetap</option>
              <option disabled>----------</option>
              <option value="Berhenti - Mengundurkan Diri">Berhenti - Mengundurkan Diri</option>
              <option value="Berhenti - Meninggal">Berhenti - Meninggal</option>
              <option value="Berhenti - Pensiun">Berhenti - Pensiun</option>
            </select>
          </div>
          <div id="kpTanggalBerhentiWrap" style="display:none">
            <label class="form-label">Tanggal Berhenti <span style="color:var(--danger)">*</span></label>
            <input type="date" class="input text-sm" id="kpTanggalBerhenti">
          </div>
          <div>
            <label class="form-label">Jenis Kelamin</label>
            <select class="select w-full text-sm" id="kpJK">
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div>
            <label class="form-label">Kelompok Nakes</label>
            <select class="select w-full text-sm" id="kpKelompok">
              <option value="">-- Pilih --</option>
              ${(FILTERS.kelompok_nakes || []).map(v => `<option value="${v}">${v}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Jabatan</label>
            <input class="input text-sm" id="kpJabatan" placeholder="Nama jabatan">
          </div>
          <div>
            <label class="form-label">Struktur Lini</label>
            <select class="select w-full text-sm" id="kpStruktur">
              <option value="">-- Pilih --</option>
              ${(FILTERS.struktur_lini || []).map(v => `<option value="${v}">${v}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Tempat Tugas</label>
            <select class="select w-full text-sm" id="kpTempat">
              <option value="">-- Pilih --</option>
              ${(FILTERS.tempat_tugas || []).map(v => `<option value="${v}">${v}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button type="submit" class="btn-accent btn-sm flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Pegawai
          </button>
          <button type="reset" class="btn-ghost btn-sm" onclick="resetFormTambah();toggleDateInput(document.getElementById('kpStatus'))">Reset</button>
          <span id="kpFormStatus" class="text-xs ml-2"></span>
        </div>
      </form>
    </div>

    <!-- Tabel Pegawai -->
    <div class="card p-4 md:p-5">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div>
          <h3 class="font-semibold sf-text text-sm">Daftar Pegawai (v2)</h3>
          <span class="text-xs" style="color:var(--text2)" id="kpCount">0 pegawai</span>
        </div>
        <div class="flex gap-2">
          <button class="btn-ghost btn-xs flex items-center gap-1" onclick="exportKPPdf()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> PDF
          </button>
          <button class="btn-ghost btn-xs flex items-center gap-1" onclick="exportKPExcel()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="21"/><line x1="16" y1="13" x2="8" y2="21"/></svg> Excel
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <input class="input text-sm" placeholder="Cari nama / NIK..." id="kpSearchInput" value="${kpSearch}" oninput="kpSearch=this.value;kpPage=1;renderKPTable()">
        <select class="select text-sm" onchange="kpFilterTT=this.value;kpPage=1;renderKPTable()">
          <option value="">Semua Tempat Tugas</option>
          ${(FILTERS.tempat_tugas || []).map(v => `<option value="${v}" ${kpFilterTT === v ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
        <select class="select text-sm" onchange="kpFilterStatus=this.value;kpPage=1;renderKPTable()">
          <option value="">Status: Aktif</option>
          <option value="Berhenti">Status: Berhenti</option>
          <option disabled>----------</option>
          ${(FILTERS.status_pegawai || []).map(v => `<option value="${v}" ${kpFilterStatus === v ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </div>
      <div class="tbl-wrap">
        <table class="tbl">
          <thead id="kpThead"></thead>
          <tbody id="kpTbody"></tbody>
        </table>
      </div>
      <div class="flex items-center justify-between p-3 border-t" style="border-color:var(--border)" id="kpPagination"></div>
    </div>
  </div>

  <!-- Edit Modal -->
  <div class="modal-overlay" id="kpEditModal">
    <div class="modal-card" id="kpEditCard" style="max-width:600px">
      <div class="modal-header">
        <h3 class="font-semibold sf-text text-sm">Edit Data Pegawai</h3>
        <button class="btn-ghost btn-sm p-1" onclick="closeKPEditModal()">&times;</button>
      </div>
      <div class="modal-body">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="form-label">Nama Lengkap</label>
            <input class="input text-sm" id="kpEditNama">
          </div>
          <div>
            <label class="form-label">NIK</label>
            <input class="input text-sm" id="kpEditNik">
          </div>
          <div>
            <label class="form-label">Status Pegawai</label>
            <select class="select w-full text-sm" id="kpEditStatus" onchange="toggleDateInput(this, 'kpEditTanggalBerhentiWrap')">
              <option value="Capeg">Capeg</option>
              <option value="Kontrak">Kontrak</option>
              <option value="PKWT">PKWT</option>
              <option value="Tetap">Tetap</option>
              <option disabled>----------</option>
              <option value="Berhenti - Mengundurkan Diri">Berhenti - Mengundurkan Diri</option>
              <option value="Berhenti - Meninggal">Berhenti - Meninggal</option>
              <option value="Berhenti - Pensiun">Berhenti - Pensiun</option>
            </select>
          </div>
          <div id="kpEditTanggalBerhentiWrap" style="display:none">
            <label class="form-label">Tanggal Berhenti</label>
            <input type="date" class="input text-sm" id="kpEditTanggalBerhenti">
          </div>
          <div>
            <label class="form-label">Jenis Kelamin</label>
            <select class="select w-full text-sm" id="kpEditJK">
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div>
            <label class="form-label">Kelompok Nakes</label>
            <input class="input text-sm" id="kpEditKelompok">
          </div>
          <div>
            <label class="form-label">Jabatan</label>
            <input class="input text-sm" id="kpEditJabatan">
          </div>
          <div>
            <label class="form-label">Struktur Lini</label>
            <input class="input text-sm" id="kpEditStruktur">
          </div>
          <div>
            <label class="form-label">Tempat Tugas</label>
            <input class="input text-sm" id="kpEditTempat">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost btn-sm" onclick="closeKPEditModal()">Batal</button>
        <button class="btn-accent btn-sm" onclick="saveKPEdit()">Simpan Perubahan</button>
      </div>
    </div>
  </div>

  <!-- Delete Modal -->
  <div class="modal-overlay" id="kpDeleteModal">
    <div class="modal-card" id="kpDeleteCard" style="max-width:420px">
      <div class="modal-header">
        <h3 class="font-semibold sf-text text-sm" style="color:var(--danger)">Hapus Pegawai</h3>
        <button class="btn-ghost btn-sm p-1" onclick="closeKPDeleteModal()">&times;</button>
      </div>
      <div class="modal-body">
        <p class="text-sm" id="kpDeleteText">Yakin ingin menghapus pegawai ini?</p>
        <div class="mt-3 p-3 rounded-xl text-xs" style="background:rgba(220,38,38,0.06); color:var(--danger)">
          ⚠️ Data aktivitas pegawai ini juga akan ikut terhapus dan tidak dapat dikembalikan.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost btn-sm" onclick="closeKPDeleteModal()">Batal</button>
        <button class="btn-sm" style="background:var(--danger);color:white;border:none;border-radius:10px;padding:8px 20px;cursor:pointer" onclick="confirmKPDelete()">Hapus</button>
      </div>
    </div>
  </div>`;

  renderKPTable();
}

// Helper for resigned status
// Helper for resigned status
const RESIGNED_STATUSES = ['Berhenti - Mengundurkan Diri', 'Berhenti - Meninggal', 'Berhenti - Pensiun'];

function getFilteredKP() {
  const q = kpSearch.toLowerCase();
  return DB.pegawai.filter(p => {
    if (kpFilterTT && p.tempat_tugas !== kpFilterTT) return false;
    
    const isResigned = RESIGNED_STATUSES.includes(p.status_pegawai);

    // Filter Status Logic
    if (kpFilterStatus === 'Berhenti') {
      // Show ONLY Resigned if filter is 'Berhenti'
      if (!isResigned) return false;
    } else {
      // Default: Exclude Resigned unless specific match or empty
      if (isResigned) return false;
      if (kpFilterStatus && p.status_pegawai !== kpFilterStatus) return false;
    }

    if (q && !p.nama.toLowerCase().includes(q) && !String(p.nik).includes(q)) return false;
    return true;
  });
}

function renderKPTable() {
  const list = getFilteredKP();
  const total = list.length;
  const start = (kpPage - 1) * KP_PER_PAGE;
  const paged = list.slice(start, start + KP_PER_PAGE);
  const totalPages = Math.ceil(total / KP_PER_PAGE) || 1;

  document.getElementById('kpCount').textContent = `${total} pegawai`;

  const tbody = document.getElementById('kpTbody');
  const thead = document.getElementById('kpThead');
  if (!tbody || !thead) return;

  thead.innerHTML = `<tr>
    <th>No</th>
    <th>Nama</th>
    <th class="hide-mobile">NIK</th>
    <th class="hide-mobile">Status</th>
    ${kpFilterStatus === 'Berhenti' || RESIGNED_STATUSES.includes(kpFilterStatus) ? '<th class="hide-mobile">Tanggal Berhenti</th>' : ''}
    <th class="hide-mobile">J/K</th>
    <th class="hide-mobile">Kelompok</th>
    <th class="hide-mobile">Tempat Tugas</th>
    <th>Aksi</th>
  </tr>`;

  tbody.innerHTML = paged.map((p, i) => `
    <tr>
      <td class="text-xs" style="color:var(--text2)">${start + i + 1}</td>
      <td>
        <div class="font-medium text-sm">${escHtml(p.nama)}</div>
        <div class="text-xs md:hidden" style="color:var(--text2)">${escHtml(p.nik)} · ${p.jk === 'L' ? 'L' : 'P'}</div>
      </td>
      <td class="text-xs hide-mobile">${escHtml(p.nik)}</td>
      <td class="hide-mobile"><span class="badge ${p.status_pegawai === 'Tetap' ? 'badge-dark' : 'badge-gold'} text-xs">${escHtml(p.status_pegawai)}</span></td>
      ${kpFilterStatus === 'Berhenti' || RESIGNED_STATUSES.includes(kpFilterStatus) ? '<td class="text-xs hide-mobile">' + escHtml(p.tanggal_berhenti || '-') + '</td>' : ''}
      <td class="hide-mobile"><span class="badge ${p.jk === 'L' ? 'badge-dark' : 'badge-gold'} text-xs">${p.jk === 'L' ? 'L' : 'P'}</span></td>
      <td class="text-xs hide-mobile">${escHtml(p.kelompok_nakes)}</td>
      <td class="text-xs hide-mobile">${escHtml(p.tempat_tugas)}</td>
      <td>
        <div class="flex items-center gap-1">
          <button class="action-btn action-edit" onclick="openKPEditModal(${p.id})" title="Edit">✏️</button>
          <button class="action-btn action-delete" onclick="openKPDeleteModal(${p.id})" title="Hapus">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Pagination
  const pagEl = document.getElementById('kpPagination');
  if (pagEl) {
    pagEl.innerHTML = `
      <span class="text-xs" style="color:var(--text2)">Hal. ${kpPage}/${totalPages} · ${total} data</span>
      <div class="flex gap-1">
        <button class="btn-ghost btn-sm text-xs px-3" ${kpPage <= 1 ? 'disabled' : ''} onclick="kpPage--;renderKPTable()">Prev</button>
        ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
          const pg = kpPage <= 3 ? i + 1 : kpPage + i - 2;
          if (pg < 1 || pg > totalPages) return '';
          return `<button class="btn-ghost btn-sm text-xs px-3 hidden sm:inline-flex ${pg === kpPage ? 'bg-green-100 font-semibold' : ''}" onclick="kpPage=${pg};renderKPTable()">${pg}</button>`;
        }).join('')}
        <button class="btn-ghost btn-sm text-xs px-3" ${kpPage >= totalPages ? 'disabled' : ''} onclick="kpPage++;renderKPTable()">Next</button>
      </div>`;
  }
}

// ===== TAMBAH PEGAWAI =====
async function submitTambahPegawai(e) {
  e.preventDefault();
  const nama = document.getElementById('kpNama').value.trim();
  const nik = document.getElementById('kpNik').value.trim();
  if (!nama || !nik) { showKPStatus('Nama dan NIK wajib diisi', 'error'); return; }

  // Check duplicate NIK
  if (DB.pegawai.some(p => String(p.nik) === nik)) {
    showToast('NIK sudah terdaftar!', 'error');
    return;
  }

  const payload = {
    nama,
    nik,
    nik,
    status_pegawai: document.getElementById('kpStatus').value,
    tanggal_berhenti: document.getElementById('kpTanggalBerhenti').value || null,
    jk: document.getElementById('kpJK').value,
    kelompok_nakes: document.getElementById('kpKelompok').value,
    nama_jabatan: document.getElementById('kpJabatan').value.trim(),
    struktur_lini: document.getElementById('kpStruktur').value,
    tempat_tugas: document.getElementById('kpTempat').value
  };

  try {
    const res = await fetch('api/data.php?action=add_pegawai', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      // Add to local DB
      DB.pegawai.push(json.data);
      resetFormTambah();
      renderKPTable();
      showToast('✓ Pegawai berhasil ditambahkan!', 'success');
    } else {
      showToast(json.message || 'Gagal menambahkan', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

function resetFormTambah() {
  document.getElementById('formTambahPegawai')?.reset();
}

function showToast(msg, type) {
  const toast = document.getElementById('kpToast');
  const content = document.getElementById('kpToastContent');
  const msgEl = document.getElementById('kpToastMsg');
  const iconEl = document.getElementById('kpToastIcon');
  
  if (!toast) return;

  msgEl.textContent = msg;
  content.style.borderColor = type === 'success' ? 'var(--success)' : 'var(--danger)';
  iconEl.innerHTML = type === 'success' 
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>';

  toast.style.display = 'block';
  // Trigger reflow
  void toast.offsetWidth;
  
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';

  setTimeout(() => {
    toast.style.transform = 'translateY(-20px)';
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; }, 300);
  }, 3000);
}

// ===== EDIT PEGAWAI =====
function openKPEditModal(id) {
  const p = DB.pegawai.find(pg => pg.id === id);
  if (!p) return;
  editingPegawai = id;

  document.getElementById('kpEditNama').value = p.nama || '';
  document.getElementById('kpEditNik').value = p.nik || '';
  
  // Handle legacy status mapping
  let st = p.status_pegawai || 'Tetap';
  if(['Mengundurkan Diri', 'Meninggal', 'Pensiun'].includes(st)) {
    st = 'Berhenti - ' + st;
  }
  const statusEl = document.getElementById('kpEditStatus');
  statusEl.value = st;
  
  document.getElementById('kpEditJK').value = p.jk || 'L';
  document.getElementById('kpEditKelompok').value = p.kelompok_nakes || '';
  document.getElementById('kpEditJabatan').value = p.nama_jabatan || '';
  document.getElementById('kpEditStruktur').value = p.struktur_lini || '';
  document.getElementById('kpEditTempat').value = p.tempat_tugas || '';
  
  // Set date value
  document.getElementById('kpEditTanggalBerhenti').value = p.tanggal_berhenti || '';
  
  // Toggle visibility immediately
  toggleDateInput(statusEl, 'kpEditTanggalBerhentiWrap');

  document.getElementById('kpEditModal').classList.add('open');
  document.getElementById('kpEditCard').classList.add('open');
}

function closeKPEditModal() {
  document.getElementById('kpEditModal').classList.remove('open');
  document.getElementById('kpEditCard').classList.remove('open');
  editingPegawai = null;
}

async function saveKPEdit() {
  if (!editingPegawai) return;

  const payload = {
    id: editingPegawai,
    nama: document.getElementById('kpEditNama').value.trim(),
    nik: document.getElementById('kpEditNik').value.trim(),
    status_pegawai: document.getElementById('kpEditStatus').value,
    tanggal_berhenti: document.getElementById('kpEditTanggalBerhenti').value || null,
    jk: document.getElementById('kpEditJK').value,
    kelompok_nakes: document.getElementById('kpEditKelompok').value.trim(),
    nama_jabatan: document.getElementById('kpEditJabatan').value.trim(),
    struktur_lini: document.getElementById('kpEditStruktur').value.trim(),
    tempat_tugas: document.getElementById('kpEditTempat').value.trim()
  };

  try {
    const res = await fetch('api/data.php?action=edit_pegawai', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.success) {
      // Update local DB
      const idx = DB.pegawai.findIndex(p => p.id === editingPegawai);
      if (idx !== -1) {
        Object.assign(DB.pegawai[idx], payload);
      }
      closeKPEditModal();
      renderKPTable();
      showToast('✓ Data pegawai berhasil diperbarui!', 'success');
    } else {
      showToast(json.message || 'Gagal menyimpan perubahan', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

// ===== HAPUS PEGAWAI =====
function openKPDeleteModal(id) {
  const p = DB.pegawai.find(pg => pg.id === id);
  if (!p) return;
  deletingPegawai = id;

  document.getElementById('kpDeleteText').textContent =
    `Yakin ingin menghapus pegawai "${p.nama}" (NIK: ${p.nik})?`;
  document.getElementById('kpDeleteModal').classList.add('open');
  document.getElementById('kpDeleteCard').classList.add('open');
}

function closeKPDeleteModal() {
  document.getElementById('kpDeleteModal').classList.remove('open');
  document.getElementById('kpDeleteCard').classList.remove('open');
  deletingPegawai = null;
}

async function confirmKPDelete() {
  if (!deletingPegawai) return;

  try {
    const res = await fetch('api/data.php?action=delete_pegawai', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id: deletingPegawai })
    });
    const json = await res.json();
    if (json.success) {
      // Remove from local DB
      DB.pegawai = DB.pegawai.filter(p => p.id !== deletingPegawai);
      closeKPDeleteModal();
      renderKPTable();
      showToast('✓ Pegawai berhasil dihapus', 'success');
    } else {
      showToast(json.message || 'Gagal menghapus', 'error');
    }
  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  }
}

function toggleDateInput(selectEl, wrapperId = 'kpTanggalBerhentiWrap') {
  const val = selectEl.value;
  const wrap = document.getElementById(wrapperId);
  if (!wrap) return;
  
  if (RESIGNED_STATUSES.includes(val)) {
    wrap.style.display = 'block';
    const input = wrap.querySelector('input');
    if(input) input.required = true;
  } else {
    wrap.style.display = 'none';
    const input = wrap.querySelector('input');
    if(input) {
      input.required = false;
      input.value = ''; 
    }
  }
}

function exportKPExcel() {
  const data = getFilteredKP();
  if(!data.length) { showToast('Tidak ada data untuk diexport', 'error'); return; }
  
  // Check if we should show 'Tanggal Berhenti'
  const hasResigned = data.some(p => RESIGNED_STATUSES.includes(p.status_pegawai));

  const rows = data.map((p, i) => {
    const r = {
      No: i+1,
      Nama: p.nama,
      NIK: p.nik,
      Status: p.status_pegawai,
    };
    if(hasResigned) r['Tanggal Berhenti'] = p.tanggal_berhenti || '-';
    
    r.JK = p.jk;
    r.Jabatan = p.nama_jabatan;
    r.Tempat = p.tempat_tugas;
    return r;
  });
  
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pegawai");
  XLSX.writeFile(wb, "Data_Pegawai.xlsx");
}

function exportKPPdf() {
  const data = getFilteredKP();
  if(!data.length) { showToast('Tidak ada data', 'error'); return; }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
  const pageW = 297, pageH = 210;
  const margin = 14;

  // Header similar to export.js
  doc.setFont("helvetica","bold");doc.setFontSize(13);
  doc.text("LAPORAN DATA PEGAWAI", pageW/2, 18, {align:"center"});
  doc.setFontSize(11);
  doc.text("RSI SITI KHADIJAH PALEMBANG", pageW/2, 24, {align:"center"});
  doc.setFontSize(9);doc.setFont("helvetica","normal");
  doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID')}`, pageW/2, 30, {align:"center"});
  doc.setLineWidth(0.5);doc.line(margin, 34, pageW-margin, 34);

  // Columns & Body
  const hasResigned = data.some(p => RESIGNED_STATUSES.includes(p.status_pegawai));
  
  const heads = [['No', 'Nama', 'NIK', 'Status']];
  if(hasResigned) heads[0].push('Tgl Berhenti');
  heads[0].push('L/P', 'Jabatan', 'Tempat Tugas');

  const body = data.map((p, i) => {
    const row = [i+1, p.nama, p.nik, p.status_pegawai];
    if(hasResigned) row.push(p.tanggal_berhenti||'-');
    row.push(p.jk, p.nama_jabatan, p.tempat_tugas);
    return row;
  });
  
  doc.autoTable({
    head: heads,
    body: body,
    startY: 38,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [20,83,45], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
    margin: { left: margin, right: margin }
  });
  
  // Signature
  const finalY = doc.lastAutoTable.finalY + 15;
  // Check if page break needed
  if(finalY > pageH - 40) { doc.addPage(); finalY = 20; }
  
  const leftSig = 70, rightSig = 220;

  doc.setFontSize(9);doc.setFont("helvetica","normal");
  doc.text("Mengetahui,",leftSig,finalY,{align:"center"});
  doc.text("Kabag SDM",leftSig,finalY+5,{align:"center"});
  doc.line(leftSig-30,finalY+32,leftSig+30,finalY+32);
  doc.setFont("helvetica","bold");
  doc.text("Dewi Nashrulloh SKM.M.Kes",leftSig,finalY+38,{align:"center"});

  doc.setFont("helvetica","normal");
  doc.text("Kasubag Kepegawaian",rightSig,finalY,{align:"center"});
  doc.line(rightSig-30,finalY+32,rightSig+30,finalY+32);
  doc.setFont("helvetica","bold");
  doc.text("Rahmawati SH",rightSig,finalY+38,{align:"center"});
  
  doc.save("Data_Pegawai.pdf");
}
