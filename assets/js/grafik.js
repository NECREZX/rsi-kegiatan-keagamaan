// ===== VISUALISASI GRAFIK PAGE =====
let grafikFilters={tempat_tugas:"",struktur_lini:"",kelompok_nakes:"",status_pegawai:"",tahun:""};
let grafikChartType="bar";

function renderGrafik(){
  const el=document.getElementById("page-grafik");
  const tahunList=FILTERS.tahun||DB.tahun||[];
  if(!grafikFilters.tahun) grafikFilters.tahun=tahunList.includes("2026")?"2026":tahunList[tahunList.length-1]||"2026";
  el.innerHTML=`<div class="fade-in">
    <div class="card p-3 md:p-4 mb-4 md:mb-5">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
        <div><label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Tempat Tugas</label>
          <select class="select w-full text-sm" onchange="updateGrafikFilter('tempat_tugas',this.value)"><option value="">Semua</option>${FILTERS.tempat_tugas.map(v=>`<option value="${v}" ${grafikFilters.tempat_tugas===v?"selected":""}>${v}</option>`).join("")}</select></div>
        <div><label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Struktur Lini</label>
          <select class="select w-full text-sm" onchange="updateGrafikFilter('struktur_lini',this.value)"><option value="">Semua</option>${FILTERS.struktur_lini.map(v=>`<option value="${v}" ${grafikFilters.struktur_lini===v?"selected":""}>${v}</option>`).join("")}</select></div>
        <div><label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Kelompok Nakes</label>
          <select class="select w-full text-sm" onchange="updateGrafikFilter('kelompok_nakes',this.value)"><option value="">Semua</option>${FILTERS.kelompok_nakes.map(v=>`<option value="${v}" ${grafikFilters.kelompok_nakes===v?"selected":""}>${v}</option>`).join("")}</select></div>
        <div><label class="block text-xs font-semibold mb-1.5" style="color:var(--text2)">Tahun</label>
          <select class="select w-full text-sm" onchange="updateGrafikFilter('tahun',this.value)">${tahunList.map(v=>`<option value="${v}" ${grafikFilters.tahun===v?"selected":""}>${v}</option>`).join("")}</select></div>
        <div class="col-span-2 md:col-span-1 flex items-end"><button class="btn-ghost btn-sm w-full" onclick="resetGrafikFilters()">Reset</button></div>
      </div>
    </div>
    <div class="flex gap-1 p-1 rounded-xl mb-4 md:mb-5 w-full sm:w-fit" style="background:var(--surface2)">
      <button class="tab-btn active text-xs sm:text-sm flex-1 sm:flex-initial" id="gtab-bar" onclick="switchGrafikType('bar')">📊 Bar</button>
      <button class="tab-btn text-xs sm:text-sm flex-1 sm:flex-initial" id="gtab-line" onclick="switchGrafikType('line')">📈 Line</button>
      <button class="tab-btn text-xs sm:text-sm flex-1 sm:flex-initial" id="gtab-pie" onclick="switchGrafikType('pie')">🍩 Pie</button>
    </div>
    <div class="card p-4 md:p-5 mb-4"><div class="flex items-center justify-between mb-4"><h3 class="font-semibold sf-text text-sm md:text-base" id="grafikChartTitle">Tren Aktivitas per Bulan</h3><span class="badge badge-gold text-xs" id="grafikYearBadge">${grafikFilters.tahun}</span></div><div class="chart-wrap" style="height:280px"><canvas id="grafikMainChart"></canvas></div></div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4">
      <div class="card p-4 md:p-5"><h3 class="font-semibold sf-text mb-4 text-sm md:text-base">Distribusi per Tempat Tugas</h3><div class="chart-wrap" style="height:240px"><canvas id="grafikTtChart"></canvas></div></div>
      <div class="card p-4 md:p-5"><h3 class="font-semibold sf-text mb-4 text-sm md:text-base">Distribusi per Kelompok Nakes</h3><div class="chart-wrap" style="height:240px"><canvas id="grafikNakesChart"></canvas></div></div>
    </div>
    <div class="card p-4 md:p-5"><h3 class="font-semibold sf-text mb-4 text-sm md:text-base">Perbandingan Antar Tahun</h3><div class="chart-wrap" style="height:260px"><canvas id="grafikYearChart"></canvas></div></div>
  </div>`;
  renderGrafikCharts();
}

function updateGrafikFilter(k,v){grafikFilters[k]=v;const b=document.getElementById("grafikYearBadge");if(b)b.textContent=grafikFilters.tahun;renderGrafikCharts();}
function resetGrafikFilters(){const t=FILTERS.tahun||DB.tahun||[];grafikFilters={tempat_tugas:"",struktur_lini:"",kelompok_nakes:"",status_pegawai:"",tahun:t.includes("2026")?"2026":t[0]||"2026"};renderGrafik();}
function switchGrafikType(type){grafikChartType=type;["bar","line","pie"].forEach(t=>{document.getElementById("gtab-"+t)?.classList.toggle("active",t===type);});renderMainGrafikChart();}

function renderGrafikCharts(){renderMainGrafikChart();renderTtChart();renderNakesChart();renderYearChart();}

function renderMainGrafikChart(){
  const tahun=grafikFilters.tahun,filtered=filterPegawai(grafikFilters);
  if(grafikChartType==="pie"){
    let tM=0,tF=0,tP=0;filtered.forEach(p=>{const d=getPegawaiData(p,tahun);tM+=d.mengaji;tF+=d.fiqih;tP+=d.phbi;});
    makeChart("grafikMainChart","doughnut",["Mengaji","Kajian Fiqih","PHBI"],[{data:[tM,tF,tP],backgroundColor:[COLORS.mengaji.bg,COLORS.fiqih.bg,COLORS.phbi.bg],borderWidth:4,borderColor:"white"}],{cutout:"60%"});return;
  }
  const md=MONTHS.map((m,i)=>{const b=getMonthNum(i);let mg=0,fq=0,ph=0;filtered.forEach(p=>{const d=getPegawaiMonthData(p,tahun,b);mg+=parseInt(d.mengaji||0);fq+=parseInt(d.kajian_fiqih||0);ph+=parseInt(d.phbi||0);});return{mg,fq,ph};});
  const t=grafikChartType;
  makeChart("grafikMainChart",t,MONTHS,[
    {label:"Mengaji",data:md.map(d=>d.mg),backgroundColor:t==="bar"?COLORS.mengaji.bg:COLORS.mengaji.light,borderColor:COLORS.mengaji.border,fill:t==="line",tension:.4,borderWidth:2,borderRadius:t==="bar"?6:0},
    {label:"Kajian Fiqih",data:md.map(d=>d.fq),backgroundColor:t==="bar"?COLORS.fiqih.bg:COLORS.fiqih.light,borderColor:COLORS.fiqih.border,fill:t==="line",tension:.4,borderWidth:2,borderRadius:t==="bar"?6:0},
    {label:"PHBI",data:md.map(d=>d.ph),backgroundColor:t==="bar"?COLORS.phbi.bg:COLORS.phbi.light,borderColor:COLORS.phbi.border,fill:t==="line",tension:.4,borderWidth:2,borderRadius:t==="bar"?6:0}
  ]);
}

function renderTtChart(){
  const tahun=grafikFilters.tahun,filtered=filterPegawai(grafikFilters),byTt={};
  filtered.forEach(p=>{const tt=p.tempat_tugas||"Lainnya";if(!byTt[tt])byTt[tt]=0;byTt[tt]+=getPegawaiData(p,tahun).total;});
  const sorted=Object.entries(byTt).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const colors=sorted.map((_,i)=>`hsl(${35+i*18},${60-i*2}%,${45+i*2}%)`);
  makeChart("grafikTtChart","bar",sorted.map(s=>s[0]),[{label:"Total",data:sorted.map(s=>s[1]),backgroundColor:colors,borderRadius:6}],{legendPos:"top"});
}

function renderNakesChart(){
  const tahun=grafikFilters.tahun,filtered=filterPegawai(grafikFilters),byN={};
  filtered.forEach(p=>{const n=p.kelompok_nakes||"Lainnya";if(!byN[n])byN[n]=0;byN[n]+=getPegawaiData(p,tahun).total;});
  const labels=Object.keys(byN),colors=labels.map((_,i)=>`hsl(${30+i*25},${55+i*3}%,${42+i*4}%)`);
  makeChart("grafikNakesChart","doughnut",labels,[{data:Object.values(byN),backgroundColor:colors,borderWidth:3,borderColor:"white"}],{cutout:"50%"});
}

function renderYearChart(){
  const allYears=DB.tahun||FILTERS.tahun||[],filtered=filterPegawai(grafikFilters);
  const yd=allYears.map(yr=>{let m=0,f=0,p=0;filtered.forEach(pg=>{const d=getPegawaiData(pg,yr);m+=d.mengaji;f+=d.fiqih;p+=d.phbi;});return{yr,m,f,p};});
  makeChart("grafikYearChart","bar",yd.map(d=>d.yr),[
    {label:"Mengaji",data:yd.map(d=>d.m),backgroundColor:COLORS.mengaji.bg,borderRadius:6},
    {label:"Kajian Fiqih",data:yd.map(d=>d.f),backgroundColor:COLORS.fiqih.bg,borderRadius:6},
    {label:"PHBI",data:yd.map(d=>d.p),backgroundColor:COLORS.phbi.bg,borderRadius:6}
  ]);
}
