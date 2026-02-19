// ===== TOP 10 PEGAWAI PAGE =====
let top10Filters={tahun:"",aktivitas:"total",tempat_tugas:"",kelompok_nakes:""};

function renderTop10(){
  const el=document.getElementById("page-top10");
  const tahunList=FILTERS.tahun||DB.tahun||[];
  if(!top10Filters.tahun) top10Filters.tahun=tahunList.includes("2026")?"2026":tahunList[tahunList.length-1]||"2026";
  el.innerHTML=`<div class="fade-in">
    <div class="card p-3 md:p-4 mb-4 md:mb-5">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
        <div><label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Tahun</label>
          <select class="select w-full text-sm" onchange="updateTop10Filter('tahun',this.value)">${tahunList.map(v=>`<option value="${v}" ${top10Filters.tahun===v?"selected":""}>${v}</option>`).join("")}</select></div>
        <div><label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Jenis Aktivitas</label>
          <select class="select w-full text-sm" onchange="updateTop10Filter('aktivitas',this.value)">
            <option value="total" ${top10Filters.aktivitas==="total"?"selected":""}>Total Semua</option>
            <option value="mengaji" ${top10Filters.aktivitas==="mengaji"?"selected":""}>Mengaji</option>
            <option value="kajian_fiqih" ${top10Filters.aktivitas==="kajian_fiqih"?"selected":""}>Kajian Fiqih</option>
            <option value="phbi" ${top10Filters.aktivitas==="phbi"?"selected":""}>PHBI</option>
          </select></div>
        <div><label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Tempat Tugas</label>
          <select class="select w-full text-sm" onchange="updateTop10Filter('tempat_tugas',this.value)"><option value="">Semua</option>${FILTERS.tempat_tugas.map(v=>`<option value="${v}" ${top10Filters.tempat_tugas===v?"selected":""}>${v}</option>`).join("")}</select></div>
        <div><label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Kelompok Nakes</label>
          <select class="select w-full text-sm" onchange="updateTop10Filter('kelompok_nakes',this.value)"><option value="">Semua</option>${FILTERS.kelompok_nakes.map(v=>`<option value="${v}" ${top10Filters.kelompok_nakes===v?"selected":""}>${v}</option>`).join("")}</select></div>
        <div class="col-span-2 md:col-span-1 flex items-end"><button class="btn-ghost btn-sm w-full" onclick="resetTop10Filters()">Reset</button></div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 mb-4">
      <div class="card p-4 md:p-5"><h3 class="font-semibold sf-text mb-4 text-sm md:text-base">🏆 Top 10 Pegawai</h3><div class="chart-wrap" style="height:280px"><canvas id="top10Chart"></canvas></div></div>
      <div class="card p-4 md:p-5"><h3 class="font-semibold sf-text mb-4 text-sm md:text-base">Peringkat</h3><div id="top10List"></div></div>
    </div>
    <div class="card p-4 md:p-5"><h3 class="font-semibold sf-text mb-4 text-sm md:text-base">⚠️ Pegawai Perlu Perhatian (Bottom 10)</h3><div class="tbl-wrap"><table class="tbl" id="bottom10Table"><thead><tr><th>No</th><th>Nama</th><th class="hide-mobile">Tempat Tugas</th><th class="hide-mobile">Kelompok</th><th>Skor</th><th>Aksi</th></tr></thead><tbody id="bottom10Tbody"></tbody></table></div></div>
  </div>`;
  renderTop10Data();
}

function updateTop10Filter(k,v){top10Filters[k]=v;renderTop10Data();}
function resetTop10Filters(){const t=FILTERS.tahun||DB.tahun||[];top10Filters={tahun:t.includes("2026")?"2026":t[0]||"2026",aktivitas:"total",tempat_tugas:"",kelompok_nakes:""};renderTop10();}

function renderTop10Data(){
  const tahun=top10Filters.tahun,akt=top10Filters.aktivitas;
  let list=DB.pegawai.filter(p=>{
    if(top10Filters.tempat_tugas&&p.tempat_tugas!==top10Filters.tempat_tugas)return false;
    if(top10Filters.kelompok_nakes&&p.kelompok_nakes!==top10Filters.kelompok_nakes)return false;
    return true;
  });
  const scored=list.map(p=>{
    const d=getPegawaiData(p,tahun);
    const score=akt==="total"?d.total:akt==="mengaji"?d.mengaji:akt==="kajian_fiqih"?d.fiqih:d.phbi;
    return{...p,score,data_detail:d};
  });
  scored.sort((a,b)=>b.score-a.score);
  const top10=scored.slice(0,10),bottom10=scored.slice(-10).reverse();

  // Chart
  const medals=["🥇","🥈","🥉"];
  const colors=top10.map((_,i)=>`hsl(${40-i*3},${75-i*3}%,${40+i*3}%)`);
  makeChart("top10Chart","bar",top10.map((p,i)=>`${i<3?medals[i]+" ":""}${p.nama.split(" ").slice(0,2).join(" ")}`),[
    {label:akt==="total"?"Total":(akt==="mengaji"?"Mengaji":akt==="kajian_fiqih"?"Kajian Fiqih":"PHBI"),data:top10.map(p=>p.score),backgroundColor:colors,borderRadius:6}
  ],{indexAxis:"y",legendPos:"top"});

  // Rankings list
  const listEl=document.getElementById("top10List");
  if(listEl){
    listEl.innerHTML=top10.map((p,i)=>`
      <div class="flex items-center gap-3 p-2.5 rounded-xl mb-1.5 cursor-pointer hover:bg-green-50 transition-colors" onclick="openDetailDrawer(${p.id})">
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style="background:${i<3?"var(--accent)":"var(--surface2)"};color:${i<3?"white":"var(--text2)"}">${i<3?medals[i]:i+1}</div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm truncate">${escHtml(p.nama)}</div>
          <div class="text-xs" style="color:var(--text2)">${escHtml(p.tempat_tugas)} · ${escHtml(p.kelompok_nakes)}</div>
        </div>
        <div class="text-right flex-shrink-0">
          <div class="font-bold text-sm" style="color:var(--accent)">${p.score}</div>
          <div class="text-xs" style="color:var(--text2)">skor</div>
        </div>
      </div>
    `).join("");
  }

  // Bottom 10
  const btbody=document.getElementById("bottom10Tbody");
  if(btbody){
    btbody.innerHTML=bottom10.map((p,i)=>`
      <tr>
        <td class="text-xs">${scored.length-9+i}</td>
        <td><div class="font-medium text-sm">${escHtml(p.nama)}</div></td>
        <td class="text-xs hide-mobile">${escHtml(p.tempat_tugas)}</td>
        <td class="text-xs hide-mobile">${escHtml(p.kelompok_nakes)}</td>
        <td><span class="badge badge-red text-xs">${p.score}</span></td>
        <td><button class="btn-ghost text-xs px-2 py-1" onclick="openDetailDrawer(${p.id})">Detail</button></td>
      </tr>
    `).join("");
  }
}
