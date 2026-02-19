// ===== EXPORT DATA PAGE =====
let exportFilters={tahun:"",bulanDari:"01",bulanSampai:"12",tempat_tugas:"",kelompok_nakes:"",status_pegawai:""};
let exportMode="all"; // all, active, inactive, selected
let exportSelected=new Set();

function renderExport(){
  const el=document.getElementById("page-export");
  const tahunList=FILTERS.tahun||DB.tahun||[];
  if(!exportFilters.tahun) exportFilters.tahun=tahunList.includes("2026")?"2026":tahunList[tahunList.length-1]||"2026";
  el.innerHTML=`<div class="fade-in">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      ${[
        {mode:"all",icon:"📋",title:"Semua Pegawai",desc:"Export semua data pegawai",color:"var(--primary)"},
        {mode:"active",icon:"✅",title:"Pegawai Aktif",desc:"Pegawai dengan aktivitas > 0",color:"var(--success)"},
        {mode:"inactive",icon:"⚠️",title:"Pegawai Tidak Aktif",desc:"Pegawai tanpa aktivitas",color:"var(--warning)"},
        {mode:"selected",icon:"☑️",title:"Pegawai Terpilih",desc:"Pilih pegawai tertentu",color:"var(--accent)"}
      ].map(c=>`
        <div class="card-sm p-4 cursor-pointer transition-all hover:shadow-md ${exportMode===c.mode?"ring-2 ring-amber-400":""}" onclick="setExportMode('${c.mode}')">
          <div class="text-2xl mb-2">${c.icon}</div>
          <div class="font-semibold text-sm sf-text" style="color:${c.color}">${c.title}</div>
          <div class="text-xs mt-0.5" style="color:var(--text2)">${c.desc}${c.mode==='selected'&&exportSelected.size>0?' <b>('+exportSelected.size+' dipilih)</b>':''}</div>
        </div>
      `).join("")}
    </div>
    <div class="card p-3 md:p-4 mb-4">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        <div><label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Tahun</label>
          <select class="select w-full text-sm" onchange="exportFilters.tahun=this.value;renderExportPreview()">${tahunList.map(v=>`<option value="${v}" ${exportFilters.tahun===v?"selected":""}>${v}</option>`).join("")}</select></div>
        <div><label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Bulan Dari</label>
          <select class="select w-full text-sm" onchange="exportFilters.bulanDari=this.value;renderExportPreview()">${MONTHS_FULL.map((m,i)=>`<option value="${String(i+1).padStart(2,"0")}" ${exportFilters.bulanDari===String(i+1).padStart(2,"0")?"selected":""}>${m}</option>`).join("")}</select></div>
        <div><label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Bulan Sampai</label>
          <select class="select w-full text-sm" onchange="exportFilters.bulanSampai=this.value;renderExportPreview()">${MONTHS_FULL.map((m,i)=>`<option value="${String(i+1).padStart(2,"0")}" ${exportFilters.bulanSampai===String(i+1).padStart(2,"0")?"selected":""}>${m}</option>`).join("")}</select></div>
        <div><label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Tempat Tugas</label>
          <select class="select w-full text-sm" onchange="exportFilters.tempat_tugas=this.value;renderExportPreview()"><option value="">Semua</option>${FILTERS.tempat_tugas.map(v=>`<option value="${v}" ${exportFilters.tempat_tugas===v?"selected":""}>${v}</option>`).join("")}</select></div>
        <div><label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Kelompok</label>
          <select class="select w-full text-sm" onchange="exportFilters.kelompok_nakes=this.value;renderExportPreview()"><option value="">Semua</option>${FILTERS.kelompok_nakes.map(v=>`<option value="${v}" ${exportFilters.kelompok_nakes===v?"selected":""}>${v}</option>`).join("")}</select></div>
        <div class="flex items-end gap-1">
          <button class="btn-accent btn-sm flex-1" onclick="doExportFromPage('pdf')">📄 PDF</button>
          <button class="btn-primary btn-sm flex-1" onclick="doExportFromPage('excel')">📊 Excel</button>
        </div>
      </div>
    </div>
    <div class="card p-4" id="exportPreviewCard">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold sf-text text-sm">Preview Data Export</h3>
        <div class="flex items-center gap-2">
          ${exportMode==='selected'?`<span class="badge badge-green text-xs">${exportSelected.size} terpilih</span>`:''}
          <span class="text-xs" style="color:var(--text2)" id="exportPreviewCount">0 pegawai</span>
        </div>
      </div>
      ${exportMode==='selected'?`
      <div class="mb-3">
        <input type="text" class="input text-sm" placeholder="Cari pegawai untuk dipilih..." id="exportSearchInput" oninput="renderExportPreview()">
      </div>`:''}
      <div class="tbl-wrap" style="max-height:400px">
        <table class="tbl"><thead><tr>
          ${exportMode==="selected"?"<th style='width:40px'><input type='checkbox' class='cb-custom' id='exportCheckAll' onchange='toggleAllExportVisible(this.checked)'></th>":""}
          <th>No</th><th>Nama</th><th class="hide-mobile">NIK</th><th class="hide-mobile">Status</th><th class="hide-mobile">Tempat Tugas</th>
          <th>Mengaji</th><th class="hide-mobile">Fiqih</th><th class="hide-mobile">PHBI</th><th>Total</th>
        </tr></thead><tbody id="exportTbody"></tbody></table>
      </div>
      ${exportMode==='selected'?`<div class="mt-3 p-3 rounded-xl text-xs" style="background:var(--surface2); color:var(--text2)">
        💡 Centang pegawai yang ingin di-export. Pilihan tetap tersimpan meskipun Anda mengubah filter.
      </div>`:''}
    </div>
  </div>`;
  renderExportPreview();
}

function setExportMode(mode){
  exportMode=mode;
  renderExport();
}

function getExportList(){
  const tahun=exportFilters.tahun;
  let list=DB.pegawai.filter(p=>{
    if((p.status_pegawai||'').startsWith('Berhenti')) return false; // Exclude resigned
    if(exportFilters.tempat_tugas&&p.tempat_tugas!==exportFilters.tempat_tugas)return false;
    if(exportFilters.kelompok_nakes&&p.kelompok_nakes!==exportFilters.kelompok_nakes)return false;
    if(exportFilters.status_pegawai&&p.status_pegawai!==exportFilters.status_pegawai)return false;
    return true;
  });
  if(exportMode==="active") list=list.filter(p=>getPegawaiData(p,tahun).total>0);
  else if(exportMode==="inactive") list=list.filter(p=>getPegawaiData(p,tahun).total===0);
  else if(exportMode==="selected"){
    list=DB.pegawai.filter(p=>exportSelected.has(p.id));
  }
  return list;
}

function getExportPeriodLabel(){
  const dari=parseInt(exportFilters.bulanDari);
  const sampai=parseInt(exportFilters.bulanSampai);
  const tahun=exportFilters.tahun;
  if(dari===1 && sampai===12) return `Tahun ${tahun}`;
  if(dari===sampai) return `${MONTHS_FULL[dari-1]} ${tahun}`;
  return `${MONTHS_FULL[dari-1]} - ${MONTHS_FULL[sampai-1]} ${tahun}`;
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

function getPegawaiSingleMonth(p, tahun, bulan){
  const d = p.data?.[tahun]?.[bulan] || {};
  const mengaji=parseInt(d.mengaji||0);
  const fiqih=parseInt(d.kajian_fiqih||0);
  const phbi=parseInt(d.phbi||0);
  return {mengaji, fiqih, phbi, total: mengaji+fiqih+phbi};
}

function getActiveMonths(){
  const dari=parseInt(exportFilters.bulanDari);
  const sampai=parseInt(exportFilters.bulanSampai);
  const months=[];
  for(let m=dari;m<=sampai;m++) months.push(m);
  return months;
}

function renderExportPreview(){
  const tahun=exportFilters.tahun;
  const searchEl=document.getElementById('exportSearchInput');
  const searchQ=(searchEl?searchEl.value:'').toLowerCase();

  let list;
  if(exportMode==="selected"){
    list=DB.pegawai.filter(p=>{
      if((p.status_pegawai||'').startsWith('Berhenti')) return false; // Exclude resigned
      if(exportFilters.tempat_tugas&&p.tempat_tugas!==exportFilters.tempat_tugas)return false;
      if(exportFilters.kelompok_nakes&&p.kelompok_nakes!==exportFilters.kelompok_nakes)return false;
      if(searchQ&&!p.nama.toLowerCase().includes(searchQ)&&!String(p.nik).includes(searchQ))return false;
      return true;
    });
  } else { list=getExportList(); }

  document.getElementById("exportPreviewCount").textContent=`${list.length} pegawai`;
  const tbody=document.getElementById("exportTbody");if(!tbody)return;

  const displayList = exportMode==='selected' ? list : list.slice(0,100);
  const remaining = exportMode==='selected' ? 0 : Math.max(0, list.length - 100);

  tbody.innerHTML=displayList.map((p,i)=>{
    const d=getPegawaiDataRange(p,tahun,exportFilters.bulanDari,exportFilters.bulanSampai);
    return`<tr class="${exportMode==='selected'&&exportSelected.has(p.id)?'bg-green-50':''}">
      ${exportMode==="selected"?`<td><input type="checkbox" class="cb-custom" ${exportSelected.has(p.id)?"checked":""} onchange="toggleExportSel(${p.id},this.checked)"></td>`:""}
      <td class="text-xs">${i+1}</td>
      <td class="text-sm font-medium">${escHtml(p.nama)}</td>
      <td class="text-xs hide-mobile">${escHtml(p.nik)}</td>
      <td class="text-xs hide-mobile">${escHtml(p.status_pegawai)}</td>
      <td class="text-xs hide-mobile">${escHtml(p.tempat_tugas)}</td>
      <td class="text-sm" style="color:var(--accent)">${d.mengaji}</td>
      <td class="text-sm hide-mobile">${d.fiqih}</td>
      <td class="text-sm hide-mobile">${d.phbi}</td>
      <td class="text-sm font-bold">${d.total}</td>
    </tr>`;
  }).join("")+(remaining>0?`<tr><td colspan="10" class="text-xs text-center py-3" style="color:var(--text2)">... dan ${remaining} lainnya</td></tr>`:"");
}

function toggleExportSel(id,checked){
  if(checked) exportSelected.add(id);
  else exportSelected.delete(id);
  const row = document.querySelector(`input[onchange="toggleExportSel(${id},this.checked)"]`)?.closest('tr');
  if(row){
    if(checked) row.classList.add('bg-green-50');
    else row.classList.remove('bg-green-50');
  }
  const badge=document.querySelector('.badge.badge-green');
  if(badge) badge.textContent=exportSelected.size+' terpilih';
}

function toggleAllExportVisible(checked){
  const checkboxes=document.querySelectorAll('#exportTbody .cb-custom');
  checkboxes.forEach(cb=>{
    const match=cb.getAttribute('onchange').match(/toggleExportSel\((\d+)/);
    if(match){
      const id=parseInt(match[1]);
      if(checked) exportSelected.add(id);
      else exportSelected.delete(id);
    }
  });
  renderExportPreview();
}

function doExportFromPage(fmt){
  const list=getExportList();
  if(list.length===0){alert("Tidak ada data untuk di-export");return;}
  const titles={all:"Rekap Semua Pegawai",active:"Rekap Pegawai Aktif",inactive:"Rekap Pegawai Tidak Aktif",selected:"Rekap Pegawai Terpilih"};
  const periodLabel=getExportPeriodLabel();
  if(fmt==="pdf") exportToPDF(list,exportFilters.tahun,titles[exportMode]||"Rekap Data",periodLabel,exportFilters.bulanDari,exportFilters.bulanSampai);
  else exportToExcel(list,exportFilters.tahun,titles[exportMode]||"Rekap_Data",periodLabel,exportFilters.bulanDari,exportFilters.bulanSampai);
}

// ===== PDF EXPORT =====
// Separate table per month, then a grand total table at the end
function exportToPDF(list, tahun, title, periodLabel, mStart, mEnd, customSignatures = null){
  const{jsPDF}=window.jspdf;
  const activeMonths=[];
  for(let m=parseInt(mStart); m<=parseInt(mEnd); m++) activeMonths.push(m);
  const isMultiMonth=activeMonths.length>1;

  // Always A4 Portrait
  const doc=new jsPDF("p","mm","a4");
  const pageW=210;
  const pageH=297;
  const marginL=25, marginR=10; // More space on left
  const centerX=(pageW - marginL - marginR)/2 + marginL; // Visual center

  // ===== HEADER (page 1) =====
  function drawHeader(startY){
    doc.setFont("helvetica","bold");doc.setFontSize(13);
    doc.text("REKAP KEGIATAN KEAGAMAAN",centerX,startY,{align:"center"});
    doc.setFontSize(11);doc.text("RSI SITI KHADIJAH PALEMBANG",centerX,startY+7,{align:"center"});
    doc.setFontSize(9);doc.setFont("helvetica","normal");
    doc.text(`${title}`,centerX,startY+14,{align:"center"});
    doc.text(`Periode: ${periodLabel}`,centerX,startY+19,{align:"center"});
    doc.setLineWidth(0.5);doc.line(marginL,startY+22,pageW-marginR,startY+22);
    return startY+26;
  }

  // Footer on every page
  function drawFooter(){
    doc.setFontSize(7);doc.setFont("helvetica","normal");doc.setTextColor(150);
    doc.text("Rekap Kegiatan Keagamaan - RSI Siti Khadijah Palembang",marginL,pageH-7);
    doc.setTextColor(0);
  }

  // Table headers & column styles (reused)
  const tblHeaders=[["No","Nama","NIK","Status","J/K","Kel. Nakes","Tempat Tugas","Mengaji","Fiqih","PHBI","Total"]];
  const tblColStyles={
    0:{cellWidth:8,halign:'center'},
    1:{cellWidth:30},
    2:{cellWidth:18},
    3:{cellWidth:14},
    4:{cellWidth:8,halign:'center'},
    5:{cellWidth:18},
    6:{cellWidth:22},
    7:{cellWidth:14,halign:'center'},
    8:{cellWidth:12,halign:'center'},
    9:{cellWidth:12,halign:'center'},
    10:{cellWidth:12,halign:'center',fontStyle:'bold'}
  };
  const tblStyles={fontSize:6.5,cellPadding:1.5,font:"helvetica",overflow:'linebreak'};
  const tblHeadStyles={fillColor:[20,83,45],textColor:255,fontStyle:"bold",fontSize:6.5};

  let currentY = drawHeader(18);
  let pageNum = 1;

  // Always one table with aggregated data
  const rows=list.map((p,i)=>{
    const d=getPegawaiDataRange(p,tahun,mStart,mEnd);
    return[i+1,p.nama,p.nik||'',p.status_pegawai||'',p.jk||'',p.kelompok_nakes||'',p.tempat_tugas||'',d.mengaji,d.fiqih,d.phbi,d.total];
  });
  let sumM=0,sumF=0,sumP=0;
  list.forEach(p=>{const d=getPegawaiDataRange(p,tahun,mStart,mEnd);sumM+=d.mengaji;sumF+=d.fiqih;sumP+=d.phbi;});
  rows.push(['','TOTAL','','','','','',sumM,sumF,sumP,sumM+sumF+sumP]);

  doc.autoTable({
    head:tblHeaders,body:rows,startY:currentY,
    styles:tblStyles,
    headStyles:tblHeadStyles,
    alternateRowStyles:{fillColor:[240,253,244]},
    columnStyles:tblColStyles,
    margin:{left:marginL,right:marginR},
    didParseCell:function(data){
      if(data.section==='body' && data.row.index===rows.length-1){
        data.cell.styles.fontStyle='bold';
        data.cell.styles.fillColor=[187,247,208];
      }
    },
    didDrawPage:function(data){
      drawFooter();
      doc.setFontSize(7);doc.setTextColor(150);
      doc.text(`Halaman ${doc.internal.getNumberOfPages()}`,pageW-marginR,pageH-7,{align:"right"});
      doc.setTextColor(0);
    }
  });

  currentY = doc.lastAutoTable.finalY + 20;

  // Signatures — always on same page as last table
  // Calculate specific positions centered in their respective halves (adjusted for margin)
  // Printable width = pageW - marginL - marginR = 175
  // Left Zone Center = marginL + 175/4 = 25 + 43.75 = 68.75
  // Right Zone Center = marginL + 3*175/4 = 25 + 131.25 = 156.25
  const finalY=doc.lastAutoTable.finalY+20;
  const printableW = pageW - marginL - marginR;
  const leftSig = marginL + (printableW * 0.25);
  const rightSig = marginL + (printableW * 0.75);

  const sig = customSignatures || {
    left: { title: "Kabag SDM", name: "Dewi Nashrulloh SKM.M.Kes", nik: null },
    right: { title: "Kasubag Kepegawaian", name: "Rahmawati SH", nik: null }
  };

  doc.setFontSize(9);doc.setFont("helvetica","normal");
  // doc.text("Mengetahui,",leftSig,finalY,{align:"center"}); // Removed as requested
  doc.text(sig.left.title,leftSig,finalY,{align:"center"}); // Adjusted Y position
  doc.setLineWidth(0.3);doc.line(leftSig-30,finalY+27,leftSig+30,finalY+27); // Adjusted line Y
  doc.setFont("helvetica","bold");
  doc.text(sig.left.name,leftSig,finalY+33,{align:"center"}); // Adjusted name Y
  if(sig.left.nik) {
    doc.setFont("helvetica","normal");doc.setFontSize(8);
    doc.text("NIK. "+sig.left.nik,leftSig,finalY+37,{align:"center"}); // Adjusted NIK Y
  }

  doc.setFont("helvetica","normal");doc.setFontSize(9);
  doc.text(sig.right.title,rightSig,finalY,{align:"center"});
  
  doc.line(rightSig-30,finalY+27,rightSig+30,finalY+27); // Adjusted line Y to match left
  doc.setFont("helvetica","bold");
  doc.text(sig.right.name,rightSig,finalY+33,{align:"center"}); // Adjusted name Y to match left
  if(sig.right.nik) {
    doc.setFont("helvetica","normal");doc.setFontSize(8);
    doc.text("NIK. "+sig.right.nik,rightSig,finalY+37,{align:"center"}); // Adjusted NIK Y
  }

  const safeName=title.replace(/\s+/g,"_");
  const periodeFile=periodLabel.replace(/\s+/g,"_");
  doc.save(`${safeName}_${periodeFile}.pdf`);
}

// ===== EXCEL EXPORT =====
function exportToExcel(list,tahun,filename,periodLabel,mStart,mEnd){
  const activeMonths=[];
  for(let m=parseInt(mStart); m<=parseInt(mEnd); m++) activeMonths.push(m);
  const isMultiMonth=activeMonths.length>1;

  const wb=XLSX.utils.book_new();

  if(isMultiMonth){
    // ===== SHEET PER MONTH =====
    activeMonths.forEach(m=>{
      const bulan=String(m).padStart(2,'0');
      const monthLabel=MONTHS_FULL[m-1];
      const sheetName=MONTHS[m-1]+" "+tahun;

      const rows=[
        ["REKAP KEGIATAN KEAGAMAAN - RSI SITI KHADIJAH PALEMBANG"],
        [`Bulan: ${monthLabel} ${tahun}`],
        [],
        ["No","Nama","NIK","Status Pegawai","J/K","Kelompok Nakes","Jabatan","Tempat Tugas","Mengaji","Kajian Fiqih","PHBI","Total"]
      ];
      let sumM=0,sumF=0,sumP=0;
      list.forEach((p,i)=>{
        const d=getPegawaiDataRange(p,tahun,bulan,bulan);
        rows.push([i+1,p.nama,p.nik||'',p.status_pegawai||'',p.jk||'',p.kelompok_nakes||'',p.nama_jabatan||'',p.tempat_tugas||'',d.mengaji,d.fiqih,d.phbi,d.total]);
        sumM+=d.mengaji;sumF+=d.fiqih;sumP+=d.phbi;
      });
      rows.push(["","SUBTOTAL","","","","","","",sumM,sumF,sumP,sumM+sumF+sumP]);

      const ws=XLSX.utils.aoa_to_sheet(rows);
      ws["!merges"]=[{s:{r:0,c:0},e:{r:0,c:11}},{s:{r:1,c:0},e:{r:1,c:11}}];
      ws["!cols"]=[{wch:5},{wch:30},{wch:20},{wch:12},{wch:5},{wch:15},{wch:25},{wch:20},{wch:10},{wch:12},{wch:8},{wch:8}];
      XLSX.utils.book_append_sheet(wb,ws,sheetName);
    });

    // ===== SUMMARY SHEET =====
    const sumRows=[
      ["REKAP KEGIATAN KEAGAMAAN - RSI SITI KHADIJAH PALEMBANG"],
      [`REKAPITULASI TOTAL - Periode: ${periodLabel}`],
      [],
      ["No","Nama","NIK","Status Pegawai","J/K","Kelompok Nakes","Jabatan","Tempat Tugas","Mengaji","Kajian Fiqih","PHBI","Total"]
    ];
    let grandM=0,grandF=0,grandP=0;
    list.forEach((p,i)=>{
      const d=getPegawaiDataRange(p,tahun,mStart,mEnd);
      sumRows.push([i+1,p.nama,p.nik||'',p.status_pegawai||'',p.jk||'',p.kelompok_nakes||'',p.nama_jabatan||'',p.tempat_tugas||'',d.mengaji,d.fiqih,d.phbi,d.total]);
      grandM+=d.mengaji;grandF+=d.fiqih;grandP+=d.phbi;
    });
    sumRows.push(["","GRAND TOTAL","","","","","","",grandM,grandF,grandP,grandM+grandF+grandP]);

    const ws2=XLSX.utils.aoa_to_sheet(sumRows);
    ws2["!merges"]=[{s:{r:0,c:0},e:{r:0,c:11}},{s:{r:1,c:0},e:{r:1,c:11}}];
    ws2["!cols"]=[{wch:5},{wch:30},{wch:20},{wch:12},{wch:5},{wch:15},{wch:25},{wch:20},{wch:10},{wch:12},{wch:8},{wch:8}];
    XLSX.utils.book_append_sheet(wb,ws2,"TOTAL");

  } else {
    // ===== SINGLE MONTH EXCEL =====
    const rows=[
      ["REKAP KEGIATAN KEAGAMAAN - RSI SITI KHADIJAH PALEMBANG"],
      [`${filename} - Periode: ${periodLabel}`],
      [],
      ["No","Nama","NIK","Status Pegawai","J/K","Kelompok Nakes","Jabatan","Tempat Tugas","Mengaji","Kajian Fiqih","PHBI","Total"]
    ];
    let sumM=0,sumF=0,sumP=0;
    list.forEach((p,i)=>{
      const d=getPegawaiDataRange(p,tahun,mStart,mEnd);
      rows.push([i+1,p.nama,p.nik||'',p.status_pegawai||'',p.jk||'',p.kelompok_nakes||'',p.nama_jabatan||'',p.tempat_tugas||'',d.mengaji,d.fiqih,d.phbi,d.total]);
      sumM+=d.mengaji;sumF+=d.fiqih;sumP+=d.phbi;
    });
    rows.push(["","TOTAL","","","","","","",sumM,sumF,sumP,sumM+sumF+sumP]);

    const ws=XLSX.utils.aoa_to_sheet(rows);
    ws["!merges"]=[{s:{r:0,c:0},e:{r:0,c:11}},{s:{r:1,c:0},e:{r:1,c:11}}];
    ws["!cols"]=[{wch:5},{wch:30},{wch:20},{wch:12},{wch:5},{wch:15},{wch:25},{wch:20},{wch:10},{wch:12},{wch:8},{wch:8}];
    XLSX.utils.book_append_sheet(wb,ws,"Rekap");
  }

  const safeName=filename.replace(/\s+/g,"_");
  const periodeFile=periodLabel.replace(/\s+/g,"_");
  XLSX.writeFile(wb,`${safeName}_${periodeFile}.xlsx`);
}
