const STORAGE_KEY="rentalSettlementV02";
const defaultData={
  unit:"Wrocławska 53A/42",tenant:"",dateFrom:"",dateTo:"",paid:0,
  meters:[
    {name:"Zimna woda i ścieki",start:0,end:0,unit:"m³",rate:14.86},
    {name:"Ciepła woda",start:0,end:0,unit:"m³",rate:28.00},
    {name:"Ogrzewanie",start:0,end:0,unit:"GJ",rate:125.00}
  ],
  fixed:[
    {name:"Utrzymanie nieruchomości wspólnej",amount:0,note:""},
    {name:"Fundusz remontowy",amount:0,note:""},
    {name:"Ciepło - opłata stała",amount:0,note:""},
    {name:"Wywóz śmieci",amount:0,note:""},
    {name:"Legalizacja urządzeń pomiarowych",amount:0,note:""}
  ]
};
let data=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null")||structuredClone(defaultData);
const money=n=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(Number(n)||0);
const num=n=>new Intl.NumberFormat("pl-PL",{maximumFractionDigits:3}).format(Number(n)||0);
const q=s=>document.querySelector(s);
function meterUsage(m){return Math.max(0,Number(m.end||0)-Number(m.start||0))}
function meterCost(m){return meterUsage(m)*Number(m.rate||0)}
function meterTotal(){return data.meters.reduce((s,m)=>s+meterCost(m),0)}
function fixedTotal(){return data.fixed.reduce((s,f)=>s+Number(f.amount||0),0)}
function dueTotal(){return meterTotal()+fixedTotal()}
function balance(){return Number(data.paid||0)-dueTotal()}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function fmtDate(s){if(!s)return"—";const [y,m,d]=s.split("-");return `${d}.${m}.${y}`}
function saveLocal(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function syncTop(){q("#unit").value=data.unit||"";q("#tenant").value=data.tenant||"";q("#dateFrom").value=data.dateFrom||"";q("#dateTo").value=data.dateTo||"";q("#paid").value=Number(data.paid||0)}
function renderMeters(){
 q("#meters").innerHTML=data.meters.map((m,i)=>`<tr>
 <td><input value="${esc(m.name)}" oninput="editMeter(${i},'name',this.value)"></td>
 <td><input type="number" step="0.001" value="${m.start}" oninput="editMeter(${i},'start',this.value)"></td>
 <td><input type="number" step="0.001" value="${m.end}" oninput="editMeter(${i},'end',this.value)"></td>
 <td><b>${num(meterUsage(m))}</b></td>
 <td><input value="${esc(m.unit)}" oninput="editMeter(${i},'unit',this.value)"></td>
 <td><input type="number" step="0.01" value="${m.rate}" oninput="editMeter(${i},'rate',this.value)"></td>
 <td><b>${money(meterCost(m))}</b></td>
 <td><button class="remove" onclick="removeMeter(${i})">Usuń</button></td></tr>`).join("")
}
function renderFixed(){
 q("#fixed").innerHTML=data.fixed.map((f,i)=>`<tr>
 <td><input value="${esc(f.name)}" oninput="editFixed(${i},'name',this.value)"></td>
 <td><input type="number" step="0.01" value="${f.amount}" oninput="editFixed(${i},'amount',this.value)"></td>
 <td><input value="${esc(f.note||"")}" oninput="editFixed(${i},'note',this.value)"></td>
 <td><button class="remove" onclick="removeFixed(${i})">Usuń</button></td></tr>`).join("")
}
function renderTotals(){
 q("#meterTotal").textContent=money(meterTotal());q("#fixedTotal").textContent=money(fixedTotal());q("#dueTotal").textContent=money(dueTotal());q("#paidTotal").textContent=money(data.paid);
 const b=balance(),card=q(".result-card");card.classList.remove("due","refund");
 if(b<-.005){q("#balance").textContent=money(Math.abs(b));q("#balanceText").textContent="Do dopłaty przez najemcę";card.classList.add("due")}
 else if(b>.005){q("#balance").textContent=money(b);q("#balanceText").textContent="Zwrot dla najemcy";card.classList.add("refund")}
 else{q("#balance").textContent=money(0);q("#balanceText").textContent="Rozliczone na zero"}
}
function renderSummary(){
 const b=balance();let cls="zero",txt="Rozliczone na zero.";
 if(b<-.005){cls="due";txt=`Do dopłaty przez najemcę: ${money(Math.abs(b))}`}
 if(b>.005){cls="refund";txt=`Zwrot dla najemcy: ${money(b)}`}
 const ml=data.meters.map(m=>`<div>${esc(m.name)}: ${num(meterUsage(m))} ${esc(m.unit)} × ${money(m.rate)}</div><div>${money(meterCost(m))}</div>`).join("");
 const fl=data.fixed.filter(f=>Number(f.amount||0)!==0).map(f=>`<div>${esc(f.name)}</div><div>${money(f.amount)}</div>`).join("");
 q("#summary").innerHTML=`<div class="summary-box"><p><b>Lokal:</b> ${esc(data.unit||"—")} &nbsp;&nbsp; <b>Najemca:</b> ${esc(data.tenant||"—")}</p>
 <p><b>Okres najmu:</b> ${fmtDate(data.dateFrom)} – ${fmtDate(data.dateTo)}</p><div class="summary-grid">${ml}${fl}
 <div class="total">Razem należne</div><div class="total">${money(dueTotal())}</div><div>Wpłacono przez najemcę</div><div>${money(data.paid)}</div></div>
 <div class="summary-result ${cls}">${txt}</div></div>`
}
function render(){syncTop();renderMeters();renderFixed();renderTotals();renderSummary()}
function update(){saveLocal();renderTotals();renderSummary()}
window.editMeter=(i,k,v)=>{data.meters[i][k]=["start","end","rate"].includes(k)?Number(v):v;update();renderMeters()}
window.removeMeter=i=>{data.meters.splice(i,1);saveLocal();render()}
window.editFixed=(i,k,v)=>{data.fixed[i][k]=k==="amount"?Number(v):v;update();renderFixed()}
window.removeFixed=i=>{data.fixed.splice(i,1);saveLocal();render()}
;["unit","tenant","dateFrom","dateTo","paid"].forEach(id=>q("#"+id).addEventListener("input",e=>{data[id]=id==="paid"?Number(e.target.value):e.target.value;update()}))
q("#addMeterBtn").onclick=()=>{data.meters.push({name:"Nowe medium",start:0,end:0,unit:"",rate:0});saveLocal();render()}
q("#addFixedBtn").onclick=()=>{data.fixed.push({name:"Nowa opłata",amount:0,note:""});saveLocal();render()}
q("#saveBtn").onclick=()=>{saveLocal();alert("Dane zapisane w tej przeglądarce.")}
q("#resetBtn").onclick=()=>{if(confirm("Wyczyścić bieżące rozliczenie?")){data=structuredClone(defaultData);saveLocal();render()}}
q("#exportBtn").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="rozliczenie-najmu.json";a.click()}
q("#importFile").onchange=async e=>{try{data=JSON.parse(await e.target.files[0].text());saveLocal();render();alert("Dane zaimportowane.")}catch{alert("Nieprawidłowy plik JSON.")}}
render();