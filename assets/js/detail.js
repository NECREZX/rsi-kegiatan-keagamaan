// ===== DETAIL PEGAWAI DRAWER =====
let detailTahun="";
let detailTab="info";

function openDetailDrawer(id){
  const p=DB.pegawai.find(pg=>pg.id===id);
  if(!p){alert("Pegawai tidak ditemukan");return;}
  const tahunList=DB.tahun||FILTERS.tahun||[];
  if(!detailTahun) detailTahun=tahunList.includes("2026")?"2026":tahunList[tahunList.length-1]||"2026";
  detailTab="info";
  renderDetailDrawer(p);
}

function renderDetailDrawer(p){
  const tahunList=DB.tahun||FILTERS.tahun||[];
  const html=`
  <div class="p-5 md:p-6">
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style="background:var(--accent);color:white">${(p.nama||"?").charAt(0)}</div>
        <div><div class="font-semibold sf-text text-base">${escHtml(p.nama)}</div><div class="text-xs" style="color:var(--text2)">${escHtml(p.nama_jabatan)}</div></div>
      </div>
      <button class="btn-ghost btn-sm p-2" onclick="closeDrawer()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="flex gap-1 p-1 rounded-xl mb-5" style="background:var(--surface2)">
      <button class="tab-btn ${detailTab==="info"?"active":""} text-xs flex-1" onclick="switchDetailTab(${p.id},'info')">ℹ Info</button>
      <button class="tab-btn ${detailTab==="tahunan"?"active":""} text-xs flex-1" onclick="switchDetailTab(${p.id},'tahunan')">📅 Tahunan</button>
      <button class="tab-btn ${detailTab==="bulanan"?"active":""} text-xs flex-1" onclick="switchDetailTab(${p.id},'bulanan')">📆 Bulanan</button>
    </div>
    <div id="detailContent"></div>
    <div class="mt-5 pt-4 border-t flex gap-2" style="border-color:var(--border)">
      <button class="btn-accent btn-sm flex-1 flex items-center justify-center gap-1 text-xs" onclick="exportDetailPDF(${p.id})">📄 Export PDF</button>
    </div>
  </div>`;
  openDrawer(html);
  renderDetailContent(p);
}

function switchDetailTab(id,tab){
  detailTab=tab;
  const p=DB.pegawai.find(pg=>pg.id===id);
  if(p) renderDetailDrawer(p);
}

function renderDetailContent(p){
  const el=document.getElementById("detailContent");if(!el)return;
  switch(detailTab){
    case"info":renderDetailInfo(el,p);break;
    case"tahunan":renderDetailTahunan(el,p);break;
    case"bulanan":renderDetailBulanan(el,p);break;
  }
}

function renderDetailInfo(el,p){
  const tahunList=DB.tahun||[];
  const yearSummary=tahunList.map(y=>{const d=getPegawaiData(p,y);return{year:y,...d};});
  el.innerHTML=`
    <div class="space-y-3 mb-5">
      ${[
        {label:"NIK",val:p.nik},{label:"Status",val:p.status_pegawai},{label:"Jenis Kelamin",val:p.jk==="L"?"Laki-laki":"Perempuan"},
        {label:"Kelompok Nakes",val:p.kelompok_nakes},{label:"Jabatan",val:p.nama_jabatan},
        {label:"Struktur Lini",val:p.struktur_lini},{label:"Tempat Tugas",val:p.tempat_tugas}
      ].map(r=>`<div class="flex justify-between items-center py-2 border-b" style="border-color:var(--border)">
        <span class="text-xs font-medium" style="color:var(--text2)">${r.label}</span>
        <span class="text-sm font-medium text-right">${escHtml(r.val||"-")}</span>
      </div>`).join("")}
    </div>
    <h4 class="font-semibold text-sm mb-3 sf-text">Ringkasan per Tahun</h4>
    <div class="tbl-wrap" style="max-height:300px"><table class="tbl"><thead><tr><th>Tahun</th><th>Mengaji</th><th>Fiqih</th><th>PHBI</th><th>Total</th></tr></thead>
    <tbody>${yearSummary.map(s=>`<tr>
      <td class="text-sm font-medium">${s.year}</td>
      <td class="text-sm" style="color:var(--accent)">${s.mengaji}</td>
      <td class="text-sm">${s.fiqih}</td>
      <td class="text-sm">${s.phbi}</td>
      <td class="text-sm font-bold">${s.total}</td>
    </tr>`).join("")}</tbody></table></div>`;
}

function renderDetailTahunan(el,p){
  const tahunList=DB.tahun||[];
  el.innerHTML=`
    <div class="mb-3"><label class="text-xs font-semibold" style="color:var(--text2)">Tahun</label>
      <select class="select w-full text-sm mt-1" onchange="detailTahun=this.value;renderDetailTahunan(document.getElementById('detailContent'),DB.pegawai.find(pg=>pg.id===${p.id}))">${tahunList.map(v=>`<option value="${v}" ${detailTahun===v?"selected":""}>${v}</option>`).join("")}</select></div>
    <div class="chart-wrap mb-4" style="height:220px"><canvas id="drawerChartBar"></canvas></div>
    <div id="detailYearTable"></div>`;
  const d=getPegawaiData(p,detailTahun);
  const pct=(v,max)=>max>0?Math.round(v/max*100):0;
  const maxTotal=Math.max(d.mengaji,d.fiqih,d.phbi,1);
  document.getElementById("detailYearTable").innerHTML=`
    <div class="space-y-3">
      ${[{label:"Mengaji",val:d.mengaji,color:COLORS.mengaji},{label:"Kajian Fiqih",val:d.fiqih,color:COLORS.fiqih},{label:"PHBI",val:d.phbi,color:COLORS.phbi}].map(r=>`
        <div>
          <div class="flex justify-between text-xs mb-1"><span class="font-medium">${r.label}</span><span style="color:var(--text2)">${r.val} (${pct(r.val,d.total)}%)</span></div>
          <div class="progress"><div class="progress-bar" style="width:${pct(r.val,maxTotal)}%;background:${r.color.border}"></div></div>
        </div>`).join("")}
      <div class="flex justify-between text-sm font-bold pt-2 border-t" style="border-color:var(--border)"><span>Total</span><span>${d.total}</span></div>
    </div>`;
  // Chart
  makeChart("drawerChartBar","bar",["Mengaji","Kajian Fiqih","PHBI"],[{label:"Jumlah Kegiatan",data:[d.mengaji,d.fiqih,d.phbi],backgroundColor:[COLORS.mengaji.bg,COLORS.fiqih.bg,COLORS.phbi.bg],borderRadius:8}],{legendPos:"top"});
}

function renderDetailBulanan(el,p){
  const tahunList=DB.tahun||[];
  el.innerHTML=`
    <div class="grid grid-cols-3 gap-2 mb-3">
      <div><label class="text-xs font-semibold" style="color:var(--text2)">Tahun</label>
        <select class="select w-full text-sm mt-1" id="detBulTahun" onchange="detailTahun=this.value;renderMonthlyContent(${p.id})">${tahunList.map(v=>`<option value="${v}" ${detailTahun===v?"selected":""}>${v}</option>`).join("")}</select></div>
      <div><label class="text-xs font-semibold" style="color:var(--text2)">Dari</label>
        <select class="select w-full text-sm mt-1" id="detBulDari">${MONTHS.map((m,i)=>`<option value="${i}">${m}</option>`).join("")}</select></div>
      <div><label class="text-xs font-semibold" style="color:var(--text2)">Sampai</label>
        <select class="select w-full text-sm mt-1" id="detBulSampai">${MONTHS.map((m,i)=>`<option value="${i}" ${i===11?"selected":""}>${m}</option>`).join("")}</select></div>
    </div>
    <div id="detMonthlyStats" class="grid grid-cols-3 gap-2 mb-3"></div>
    <div class="chart-wrap mb-3" style="height:200px"><canvas id="drawerChartLine"></canvas></div>
    <div class="tbl-wrap" style="max-height:300px" id="detMonthlyTable"></div>`;
  renderMonthlyContent(p.id);
}

function renderMonthlyContent(id){
  const p=DB.pegawai.find(pg=>pg.id===id);if(!p)return;
  const tahun=detailTahun;
  const dari=parseInt(document.getElementById("detBulDari")?.value||0);
  const sampai=parseInt(document.getElementById("detBulSampai")?.value||11);
  const monthRange=[];for(let i=dari;i<=sampai;i++)monthRange.push(i);

  let tM=0,tF=0,tP=0;
  const monthlyData=monthRange.map(i=>{
    const b=getMonthNum(i);const d=getPegawaiMonthData(p,tahun,b);
    const mg=parseInt(d.mengaji||0),fq=parseInt(d.kajian_fiqih||0),ph=parseInt(d.phbi||0);
    tM+=mg;tF+=fq;tP+=ph;
    return{month:MONTHS[i],mengaji:mg,fiqih:fq,phbi:ph,total:mg+fq+ph};
  });

  // Stats
  document.getElementById("detMonthlyStats").innerHTML=[
    {label:"Mengaji",val:tM,color:"var(--accent)"},{label:"Fiqih",val:tF,color:"var(--primary)"},{label:"PHBI",val:tP,color:"#8b5a2b"}
  ].map(s=>`<div class="card-sm p-3 text-center"><div class="text-lg font-bold sf-text" style="color:${s.color}">${s.val}</div><div class="text-xs" style="color:var(--text2)">${s.label}</div></div>`).join("");

  // Chart
  makeChart("drawerChartLine","line",monthlyData.map(d=>d.month),[
    {label:"Mengaji",data:monthlyData.map(d=>d.mengaji),borderColor:COLORS.mengaji.border,backgroundColor:COLORS.mengaji.light,fill:true,tension:.4,borderWidth:2,pointRadius:3},
    {label:"Fiqih",data:monthlyData.map(d=>d.fiqih),borderColor:COLORS.fiqih.border,backgroundColor:COLORS.fiqih.light,fill:true,tension:.4,borderWidth:2,pointRadius:3},
    {label:"PHBI",data:monthlyData.map(d=>d.phbi),borderColor:COLORS.phbi.border,backgroundColor:COLORS.phbi.light,fill:true,tension:.4,borderWidth:2,pointRadius:3}
  ]);

  // Table
  document.getElementById("detMonthlyTable").innerHTML=`<table class="tbl"><thead><tr><th>Bulan</th><th>Mengaji</th><th>Fiqih</th><th>PHBI</th><th>Total</th></tr></thead>
    <tbody>${monthlyData.map(d=>`<tr><td class="text-sm">${d.month}</td><td class="text-sm" style="color:var(--accent)">${d.mengaji}</td><td class="text-sm">${d.fiqih}</td><td class="text-sm">${d.phbi}</td><td class="text-sm font-bold">${d.total}</td></tr>`).join("")}
    <tr style="background:var(--surface2)"><td class="font-bold text-sm">Total</td><td class="font-bold text-sm" style="color:var(--accent)">${tM}</td><td class="font-bold text-sm">${tF}</td><td class="font-bold text-sm">${tP}</td><td class="font-bold text-sm">${tM+tF+tP}</td></tr>
    </tbody></table>`;
}

function exportDetailPDF(id){
  const p=DB.pegawai.find(pg=>pg.id===id);if(!p)return;
  const{jsPDF}=window.jspdf;
  const doc=new jsPDF("p","mm","a4");
  doc.setFont("helvetica","bold");doc.setFontSize(14);
  doc.text("REKAP KEGIATAN KEAGAMAAN",105,15,{align:"center"});
  doc.setFontSize(11);doc.text("RSI SITI KHADIJAH PALEMBANG",105,22,{align:"center"});
  doc.setLineWidth(0.5);doc.line(14,25,196,25);

  doc.setFontSize(10);doc.setFont("helvetica","bold");doc.text("Data Pegawai",14,33);
  doc.setFont("helvetica","normal");doc.setFontSize(9);
  const info=[["Nama",p.nama],["NIK",p.nik],["Status",p.status_pegawai],["Jenis Kelamin",p.jk==="L"?"Laki-laki":"Perempuan"],["Kelompok Nakes",p.kelompok_nakes],["Jabatan",p.nama_jabatan],["Tempat Tugas",p.tempat_tugas]];
  let y=38;info.forEach(([k,v])=>{doc.text(`${k}: ${v||"-"}`,14,y);y+=5;});

  // Yearly data
  y+=3;doc.setFont("helvetica","bold");doc.setFontSize(10);doc.text("Rekap Aktivitas per Tahun",14,y);y+=5;
  const yearHeaders=[["Tahun","Mengaji","Kajian Fiqih","PHBI","Total"]];
  const yearRows=(DB.tahun||[]).map(yr=>{const d=getPegawaiData(p,yr);return[yr,d.mengaji,d.fiqih,d.phbi,d.total];});
  doc.autoTable({head:yearHeaders,body:yearRows,startY:y,styles:{fontSize:8},headStyles:{fillColor:[26,26,46]},columnStyles:{1:{halign:"center"},2:{halign:"center"},3:{halign:"center"},4:{halign:"center",fontStyle:"bold"}}});

  // Monthly data for current year
  y=doc.lastAutoTable.finalY+8;doc.setFont("helvetica","bold");doc.setFontSize(10);doc.text(`Detail Bulanan - ${detailTahun}`,14,y);y+=5;
  const mHeaders=[["Bulan","Mengaji","Kajian Fiqih","PHBI","Total"]];
  const mRows=MONTHS.map((m,i)=>{const b=getMonthNum(i);const d=getPegawaiMonthData(p,detailTahun,b);const mg=parseInt(d.mengaji||0),fq=parseInt(d.kajian_fiqih||0),ph=parseInt(d.phbi||0);return[m,mg,fq,ph,mg+fq+ph];});
  doc.autoTable({head:mHeaders,body:mRows,startY:y,styles:{fontSize:8},headStyles:{fillColor:[26,26,46]},columnStyles:{1:{halign:"center"},2:{halign:"center"},3:{halign:"center"},4:{halign:"center",fontStyle:"bold"}}});

  // Signatures — always on same page as last table
  const sigY=doc.lastAutoTable.finalY+20;
  doc.setFontSize(9);doc.setFont("helvetica","normal");
  doc.text("Mengetahui,",50,sigY,{align:"center"});doc.text("Kabag SDM",50,sigY+5,{align:"center"});
  doc.setLineWidth(0.3);doc.line(20,sigY+32,80,sigY+32);
  doc.setFont("helvetica","bold");doc.text("Dewi Nashrulloh SKM.M.Kes",50,sigY+38,{align:"center"});
  doc.setFont("helvetica","normal");doc.text("Kasubag Kepegawaian",160,sigY,{align:"center"});
  doc.line(130,sigY+32,190,sigY+32);
  doc.setFont("helvetica","bold");doc.text("Rahmawati SH",160,sigY+38,{align:"center"});

  doc.save(`Detail_${p.nama.replace(/\s+/g,"_")}_${detailTahun}.pdf`);
}
