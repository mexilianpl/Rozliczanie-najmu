
const demo = {
  month: new Date().toISOString().slice(0,7),
  meters: [
    {id:"power",name:"Prąd",unit:"kWh",prev:12450,current:12970,rate:0.6743,icon:"⚡"},
    {id:"cold",name:"Woda zimna",unit:"m³",prev:1258.6,current:1277,rate:10.13,icon:"💧"},
    {id:"hot",name:"Woda ciepła",unit:"m³",prev:845.2,current:857.7,rate:24.20,icon:"♨️"},
    {id:"gas",name:"Gaz",unit:"m³",prev:5632.1,current:5678.2,rate:9.37,icon:"🔥"}
  ],
  tenants: [
    {id:1,unit:"Mieszkanie 1",tenant:"Anna Nowak",people:2,area:45,share:0.25,fixed:192.50,paid:160},
    {id:2,unit:"Mieszkanie 2",tenant:"Piotr Wiśniewski",people:1,area:55,share:0.20,fixed:177.50,paid:0},
    {id:3,unit:"Mieszkanie 3",tenant:"Katarzyna Zielińska",people:2,area:60,share:0.30,fixed:230.00,paid:300},
    {id:4,unit:"Mieszkanie 4",tenant:"Tomasz Lewandowski",people:1,area:50,share:0.25,fixed:185.00,paid:0}
  ]
};
const K="mediaBillingDataV1";
let data=JSON.parse(localStorage.getItem(K)||"null")||structuredClone(demo);
const money=n=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(n);
const num=n=>new Intl.NumberFormat("pl-PL",{maximumFractionDigits:3}).format(n);
function save(){localStorage.setItem(K,JSON.stringify(data));render();}
function meterCost(m){return Math.max(0,m.current-m.prev)*m.rate}
function totalMedia(){return data.meters.reduce((s,m)=>s+meterCost(m),0)}
function tenantBill(t){return totalMedia()*Number(t.share||0)+Number(t.fixed||0)}
function render(){
  document.querySelector("#monthPicker").value=data.month;
  const cards=document.querySelector("#cards");
  cards.innerHTML=data.meters.map(m=>`<div class="card"><div class="label">${m.icon} ${m.name}</div><div class="value">${money(meterCost(m))}</div><div class="sub">Zużycie: ${num(m.current-m.prev)} ${m.unit}</div></div>`).join("")
    +`<div class="card"><div class="label">Σ Łącznie media</div><div class="value">${money(totalMedia())}</div><div class="sub">Wszystkie liczniki</div></div>`;
  document.querySelector("#metersTable").innerHTML=data.meters.map((m,i)=>`<tr><td>${m.icon} <b>${m.name}</b></td><td>${num(m.prev)}</td><td>${num(m.current)}</td><td>${num(m.current-m.prev)} ${m.unit}</td><td>${money(m.rate)}</td><td><b>${money(meterCost(m))}</b></td><td><button class="ghost" onclick="openReading(${i})">Edytuj</button></td></tr>`).join("");
  document.querySelector("#tenantList").innerHTML=data.tenants.map(t=>{let b=tenantBill(t),bal=t.paid-b;return `<div class="tenant-row"><div><strong>${t.unit}</strong><small>${t.tenant} • ${t.people} os. • ${t.area} m²</small></div><div><b>${money(b)}</b><br><span class="badge ${bal>=0?'paid':'due'}">${bal>=0?'Opłacone':'Do zapłaty'}</span></div></div>`}).join("");
  document.querySelector("#billingTable").innerHTML=data.tenants.map(t=>{let media=totalMedia()*t.share,b=tenantBill(t),bal=t.paid-b;return `<tr><td><b>${t.unit}</b></td><td>${t.tenant}</td><td>${money(media)}</td><td>${money(t.fixed)}</td><td><b>${money(b)}</b></td><td>${money(t.paid)}</td><td class="${bal<0?'negative':'positive'}">${money(bal)}</td><td><span class="badge ${bal>=0?'paid':'due'}">${bal>=0?'Opłacone':'Do zapłaty'}</span></td></tr>`}).join("");
  renderTenantEditor();renderMeterEditor();renderPayments();
  document.querySelector("#readingMeter").innerHTML=data.meters.map((m,i)=>`<option value="${i}">${m.name}</option>`).join("");
}
function renderTenantEditor(){
 document.querySelector("#tenantEditor").innerHTML=data.tenants.map((t,i)=>`<div class="editor-row">
 <label>Lokal<input value="${t.unit}" onchange="editTenant(${i},'unit',this.value)"></label>
 <label>Najemca<input value="${t.tenant}" onchange="editTenant(${i},'tenant',this.value)"></label>
 <label>Udział mediów<input type="number" step=".01" value="${t.share}" onchange="editTenant(${i},'share',this.value)"></label>
 <label>Opłaty stałe<input type="number" step=".01" value="${t.fixed}" onchange="editTenant(${i},'fixed',this.value)"></label>
 <label>Wpłacono<input type="number" step=".01" value="${t.paid}" onchange="editTenant(${i},'paid',this.value)"></label>
 <button class="ghost" onclick="removeTenant(${i})">Usuń</button></div>`).join("");
}
function renderMeterEditor(){
 document.querySelector("#meterEditor").innerHTML=data.meters.map((m,i)=>`<div class="editor-row">
 <label>Nazwa<input value="${m.name}" onchange="editMeter(${i},'name',this.value)"></label>
 <label>Jednostka<input value="${m.unit}" onchange="editMeter(${i},'unit',this.value)"></label>
 <label>Poprzedni<input type="number" step=".001" value="${m.prev}" onchange="editMeter(${i},'prev',this.value)"></label>
 <label>Aktualny<input type="number" step=".001" value="${m.current}" onchange="editMeter(${i},'current',this.value)"></label>
 <label>Stawka<input type="number" step=".0001" value="${m.rate}" onchange="editMeter(${i},'rate',this.value)"></label></div>`).join("");
}
function renderPayments(){
 document.querySelector("#paymentsEditor").innerHTML=data.tenants.map((t,i)=>`<div class="editor-row">
 <label>Lokal<input value="${t.unit}" disabled></label><label>Najemca<input value="${t.tenant}" disabled></label>
 <label>Należność<input value="${money(tenantBill(t))}" disabled></label>
 <label>Wpłacono<input type="number" step=".01" value="${t.paid}" onchange="editTenant(${i},'paid',this.value)"></label>
 <label>Saldo<input value="${money(t.paid-tenantBill(t))}" disabled></label></div>`).join("");
}
window.editTenant=(i,k,v)=>{data.tenants[i][k]=["share","fixed","paid"].includes(k)?Number(v):v;save()}
window.editMeter=(i,k,v)=>{data.meters[i][k]=["prev","current","rate"].includes(k)?Number(v):v;save()}
window.removeTenant=i=>{if(confirm("Usunąć lokal?")){data.tenants.splice(i,1);save()}}
window.openReading=i=>{readingMeter.value=i;readingValue.value=data.meters[i].current;readingDialog.showModal()}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav,.view").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.getElementById(b.dataset.view).classList.add("active")});
monthPicker.onchange=e=>{data.month=e.target.value;save()}
newReadingBtn.onclick=()=>{readingMeter.value=0;readingValue.value=data.meters[0].current;readingDialog.showModal()}
readingMeter.onchange=()=>readingValue.value=data.meters[readingMeter.value].current;
saveReading.onclick=e=>{e.preventDefault();data.meters[readingMeter.value].current=Number(readingValue.value);readingDialog.close();save()}
resetDemo.onclick=()=>{if(confirm("Przywrócić przykładowe dane?")){data=structuredClone(demo);save()}}
printBtn.onclick=()=>window.print();
addTenantBtn.onclick=()=>{data.tenants.push({id:Date.now(),unit:"Nowy lokal",tenant:"",people:1,area:0,share:0,fixed:0,paid:0});save()}
exportBtn.onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download=`rozliczenia-${data.month}.json`;a.click()}
importFile.onchange=async e=>{try{data=JSON.parse(await e.target.files[0].text());save();alert("Dane zaimportowane.")}catch{alert("Nieprawidłowy plik JSON.")}}
render();
