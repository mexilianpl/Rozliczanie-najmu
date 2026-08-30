(()=>{"use strict";
const VERSION="2.0.2", KEY="kalkulatorNajmuV202";
const APARTMENTS={
spokojna:window.APARTMENT_SPOKOJNA,
wroclawska:window.APARTMENT_WROCLAWSKA
};
const HIST=(()=>{
 const map=new Map();
 const add=(apt,rows)=>{for(const row of (rows||[])){if(!map.has(row.period))map.set(row.period,{period:row.period,spokojna:{},wroclawska:{}});map.get(row.period)[apt]=row.data||{}}};
 add("spokojna",window.HISTORY_SPOKOJNA);
 add("wroclawska",window.HISTORY_WROCLAWSKA);
 return [...map.values()].sort((a,b)=>a.period.localeCompare(b.period));
})();
const PLN=x=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(num(x));
const N=x=>new Intl.NumberFormat("pl-PL",{maximumFractionDigits:3}).format(num(x));
const num=x=>{if(typeof x==="number")return Number.isFinite(x)?x:0;const v=Number(String(x??"").replace(/\s/g,"").replace(",","."));return Number.isFinite(v)?v:0};
const val=x=>String(x??"").replace(".",",");
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $=id=>document.getElementById(id);
const latest=(apt)=>[...HIST].reverse().find(r=>r[apt]&&(r[apt].rent||r[apt].admin||r[apt].total))?.[apt]||{};
const latestRecord=[...HIST].reverse().find(r=>r.period)||{period:"2026-08"};
const initialState={
 version:VERSION,
 photos:{spokojna:"",wroclawska:""},
 customRecords:[],
 current:{
   spokojna:clone(APARTMENTS.spokojna.defaultCurrent),
   wroclawska:clone(APARTMENTS.wroclawska.defaultCurrent)
 },
 ads:{
   spokojna:clone(APARTMENTS.spokojna.adDefaults),
   wroclawska:clone(APARTMENTS.wroclawska.adDefaults)
 },
 settlement:{
   apt:"wroclawska",tenant:"Dagmara Nowak i Dawid Wojsław",from:"2026-03-01",to:"2026-08-31",months:6,
   zwStart:43.088,zwEnd:62.33,cwStart:42.237,cwEnd:55.12,coStart:10.463,coEnd:10.619,
   rates:{water:14.86,heatWater:28,heat:125},adv:{water:63.9,heatWater:61.6,heat:62.5},deposit:2400,
   costs:[{name:"Rachunek za prąd",qty:1,price:200},{name:"Papier z taśmą",qty:1,price:7.63},{name:"Folia ochronna",qty:2,price:14.43},{name:"Masa gipsowa mała",qty:1,price:21.13},{name:"Taśmy malarskie",qty:1,price:36.88},{name:"Gąbka do szlifowania 180",qty:1,price:5.08},{name:"Farba biała",qty:1,price:134.31}]
 }
};
let state=load();
function clone(x){return JSON.parse(JSON.stringify(x))}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));return s&&s.version===VERSION?s:clone(initialState)}catch{return clone(initialState)}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){alert("Pamięć przeglądarki jest pełna. Usuń część zdjęć z galerii lub wyeksportuj dane.")}}
function allRecords(){const map=new Map(HIST.map(r=>[r.period,clone(r)]));for(const r of state.customRecords){const base=map.get(r.period)||{period:r.period,spokojna:{},wroclawska:{}};base[r.apartment]=clone(r.data);map.set(r.period,base)}return [...map.values()].sort((a,b)=>a.period.localeCompare(b.period))}
function periodPL(p){if(!p)return"";const [y,m]=p.split("-").map(Number);return new Intl.DateTimeFormat("pl-PL",{month:"long",year:"numeric"}).format(new Date(y,m-1,1))}
function aptLabel(a){return a==="spokojna"?"Spokojna":"Wrocławska"}
function aptTotal(d){return num(d.rent)+num(d.admin)+num(d.gas)+num(d.electricity)+(d.other||[]).reduce((s,x)=>s+num(x.amount),0)}
function setView(name){
 document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));$("view-"+name)?.classList.add("active");
 document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
 const titles={dashboard:["Pulpit","Szybki przegląd obu mieszkań"],spokojna:["Spokojna","Miesięczne rozliczenie mieszkania"],wroclawska:["Wrocławska","Miesięczne rozliczenie mieszkania"],history:["Historia wpłat","Dane przeniesione z wieloletniego arkusza"],settlement:["Rozliczenie końcowe","Media, kaucja i potrącenia"],ads:["Ogłoszenia","Zdjęcia i treść nowego ogłoszenia"],settings:["Ustawienia / dane","Zdjęcia, eksport i kopie bezpieczeństwa"]};
 $("pageTitle").textContent=titles[name]?.[0]||"";$("pageSub").textContent=titles[name]?.[1]||"";
 if(name==="dashboard")renderDashboard();if(name==="history")renderHistory();if(name==="settlement")renderSettlement();if(name==="ads")renderAds();
}
document.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
document.addEventListener("click",e=>{const go=e.target.closest("[data-view-go]");if(go)setView(go.dataset.viewGo);const op=e.target.closest("[data-open]");if(op)setView(op.dataset.open)});
function renderDashboard(){
 for(const apt of ["spokojna","wroclawska"]){
  const d=state.current[apt], cap=apt[0].toUpperCase()+apt.slice(1);
  $("dashPeriod"+cap).textContent=periodPL(d.period);
  const lines=[["Czynsz najmu",d.rent],["Czynsz administracyjny",d.admin],["Gaz",d.gas],["Prąd",d.electricity],["Inne opłaty",(d.other||[]).reduce((s,x)=>s+num(x.amount),0)]];
  $("dashLines"+cap).innerHTML=lines.map(x=>`<div class="money-line"><span>${x[0]}</span><b>${PLN(x[1])}</b></div>`).join("");
  $("dashTotal"+cap).textContent=PLN(aptTotal(d));
  if(state.photos[apt])$("dashPhoto"+cap).style.backgroundImage=`linear-gradient(0deg,#07121a66,#07121a11),url("${state.photos[apt]}")`;
 }
 const rec=allRecords().slice(-8).reverse();
 $("recentHistory").innerHTML=rec.flatMap(r=>["spokojna","wroclawska"].map(a=>({p:r.period,a,d:r[a]}))).filter(x=>x.d&&x.d.total).slice(0,8).map(x=>`<tr><td>${aptLabel(x.a)}</td><td>${periodPL(x.p)}</td><td>${PLN(x.d.rent)}</td><td>${PLN(num(x.d.total)-num(x.d.rent))}</td><td><b>${PLN(x.d.total)}</b></td></tr>`).join("");
}
function renderApartment(apt){
 const el=$("view-"+apt), d=state.current[apt], cap=apt[0].toUpperCase()+apt.slice(1);
 el.innerHTML=`<div class="panel">
 <div class="entry-header"><div class="entry-title"><div class="mini-photo" id="mini_${apt}"></div><div><h2>${aptLabel(apt)}</h2><p>Szybkie rozliczenie miesiąca</p></div></div><b class="entry-total" id="entryTotal_${apt}"></b></div>
 <div class="form-grid" style="margin-top:14px"><label>Miesiąc<input id="period_${apt}" type="month" value="${esc(d.period)}"></label><label>Najemca / najemcy<input id="tenants_${apt}" value="${esc((d.tenants||[]).join(", "))}"></label><label>E-mail<input id="email_${apt}" type="email" value="${esc(d.email||"")}" placeholder="opcjonalnie"></label><label>Telefon / WhatsApp<input id="phone_${apt}" value="${esc(d.phone||"")}" placeholder="np. 501 234 567"></label></div>
 <div class="charge-grid" style="margin-top:14px">
 ${chargeBox(apt,"rent","Czynsz najmu",d.rent,false)}
 ${chargeBox(apt,"admin","Czynsz administracyjny",d.admin,false)}
 ${chargeBox(apt,"gas","Gaz",d.gas,true)}
 ${chargeBox(apt,"electricity","Prąd",d.electricity,true)}
 </div>
 <div class="panel-head" style="margin-top:16px"><div><h3>Inne opłaty</h3><p>Notariusz, korekta, jednorazowe opłaty itd.</p></div><button class="ghost" id="addOther_${apt}">+ Dodaj pozycję</button></div>
 <div class="other-list" id="other_${apt}"></div>
 <div class="entry-actions"><div class="total-box"><span>RAZEM DO WPŁATY</span><b id="bottomTotal_${apt}"></b></div><div class="actions"><button class="ghost" id="loadLast_${apt}">Przywróć poprzedni miesiąc</button><button class="primary" id="saveMonth_${apt}">Zapisz miesiąc</button></div></div>
 </div>`;
 if(state.photos[apt])$("mini_"+apt).style.backgroundImage=`url("${state.photos[apt]}")`;
 bindApartment(apt);renderOther(apt);updateApartmentTotals(apt);
}
function chargeBox(apt,key,label,value,scan){return `<div class="charge"><div class="charge-head"><label>${label}</label>${scan?`<button class="scan" data-scan="${apt}:${key}">📷 Dodaj rachunek</button>`:""}</div><input id="${key}_${apt}" inputmode="decimal" value="${esc(val(value))}"></div>`}
function bindApartment(apt){
 const d=state.current[apt];
 ["period","tenants","email","phone","rent","admin","gas","electricity"].forEach(k=>{
  const el=$(k+"_"+apt);if(!el)return;el.addEventListener("input",()=>{if(k==="tenants")d.tenants=el.value.split(",").map(s=>s.trim()).filter(Boolean);else if(k==="period")d.period=el.value;else d[k]=el.value;save();updateApartmentTotals(apt)});
 });
 $("addOther_"+apt).onclick=()=>{d.other.push({name:"",amount:0});save();renderOther(apt)};
 $("saveMonth_"+apt).onclick=()=>saveMonth(apt);
 $("loadLast_"+apt).onclick=()=>{const r=[...allRecords()].reverse().find(x=>x[apt]&&x[apt].total);if(r){state.current[apt]={period:r.period,tenants:r[apt].tenants||[],email:state.current[apt].email||"",phone:state.current[apt].phone||"",rent:r[apt].rent||0,admin:r[apt].admin||0,gas:r[apt].gas||0,electricity:r[apt].electricity||0,other:clone(r[apt].other||[])};save();renderApartment(apt)}};
 document.querySelectorAll(`[data-scan^="${apt}:"]`).forEach(b=>b.onclick=()=>openBillScanner(...b.dataset.scan.split(":")));
}
function renderOther(apt){
 const d=state.current[apt], el=$("other_"+apt);if(!el)return;
 el.innerHTML=(d.other||[]).map((x,i)=>`<div class="other-row"><label>Nazwa<input id="on_${apt}_${i}" value="${esc(x.name)}"></label><label>Kwota<input id="oa_${apt}_${i}" inputmode="decimal" value="${esc(val(x.amount))}"></label><button class="danger" data-delother="${i}">Usuń</button></div>`).join("")||`<div class="muted">Brak dodatkowych pozycji.</div>`;
 (d.other||[]).forEach((x,i)=>{$("on_"+apt+"_"+i).oninput=e=>{x.name=e.target.value;save()};$("oa_"+apt+"_"+i).oninput=e=>{x.amount=e.target.value;save();updateApartmentTotals(apt)}});
 el.querySelectorAll("[data-delother]").forEach(b=>b.onclick=()=>{d.other.splice(+b.dataset.delother,1);save();renderOther(apt);updateApartmentTotals(apt)});
}
function updateApartmentTotals(apt){const t=aptTotal(state.current[apt]);$("entryTotal_"+apt)&&($("entryTotal_"+apt).textContent=PLN(t));$("bottomTotal_"+apt)&&($("bottomTotal_"+apt).textContent=PLN(t))}
function saveMonth(apt){
 const d=state.current[apt], data={tenants:clone(d.tenants),email:d.email||"",phone:d.phone||"",rent:num(d.rent),admin:num(d.admin),gas:num(d.gas),electricity:num(d.electricity),other:(d.other||[]).map(x=>({name:x.name,amount:num(x.amount)})),total:aptTotal(d)};
 const idx=state.customRecords.findIndex(x=>x.period===d.period&&x.apartment===apt);const row={period:d.period,apartment:apt,data};if(idx>=0)state.customRecords[idx]=row;else state.customRecords.push(row);save();alert("Miesiąc zapisany w historii.");renderDashboard();
}
renderApartment("spokojna");renderApartment("wroclawska");
function renderHistory(){
 const years=[...new Set(allRecords().map(r=>r.period.slice(0,4)))].sort().reverse();if(!$("histYear").dataset.ready){$("histYear").innerHTML=`<option value="all">Wszystkie lata</option>`+years.map(y=>`<option>${y}</option>`).join("");$("histApartment").onchange=renderHistory;$("histYear").onchange=renderHistory;$("histYear").dataset.ready="1"}
 const af=$("histApartment").value,yf=$("histYear").value;const out=[];
 for(const r of allRecords().slice().reverse()){if(yf!=="all"&&!r.period.startsWith(yf))continue;for(const a of ["spokojna","wroclawska"]){if(af!=="all"&&af!==a)continue;const d=r[a];if(!d||(!d.total&&!d.rent&&!d.admin))continue;const other=(d.other||[]).reduce((s,x)=>s+num(x.amount),0);out.push(`<tr><td>${periodPL(r.period)}</td><td>${aptLabel(a)}</td><td>${esc((d.tenants||[]).join(", "))}</td><td>${PLN(d.rent)}</td><td>${PLN(d.admin)}</td><td>${PLN(d.gas)}</td><td>${PLN(d.electricity)}</td><td>${PLN(other)}</td><td><b>${PLN(d.total||aptTotal(d))}</b></td></tr>`)}}
 $("historyBody").innerHTML=out.join("");$("historyInfo").textContent=`${HIST.length} miesięcy szczegółowej historii przeniesionej z Excela + nowe wpisy aplikacji.`;
}


function monthlySettlementPdfFile(apt){
 if(!window.jspdf?.jsPDF) throw new Error("Moduł PDF nie został załadowany.");
 const {jsPDF}=window.jspdf,doc=new jsPDF(),d=state.current[apt],other=(d.other||[]).filter(x=>num(x.amount)!==0);
 doc.setFontSize(17);doc.text("ROZLICZENIE NAJMU",14,16);
 doc.setFontSize(11);doc.text(`Mieszkanie: ${aptLabel(apt)}`,14,25);doc.text(`Okres: ${periodPL(d.period)}`,14,32);
 const body=[["Czynsz najmu",PLN(d.rent)],["Czynsz administracyjny",PLN(d.admin)],["Gaz",PLN(d.gas)],["Prad",PLN(d.electricity)],...other.map(x=>[x.name||"Inna oplata",PLN(x.amount)])];
 doc.autoTable({startY:42,head:[["Pozycja","Kwota"]],body,foot:[["RAZEM DO WPLATY",PLN(aptTotal(d))]]});
 const blob=doc.output("blob"),safe=(aptLabel(apt)+"_"+(d.period||"rozliczenie")).replace(/\s+/g,"_");
 return new File([blob],`Rozliczenie_${safe}.pdf`,{type:"application/pdf"});
}
async function shareMonthlyPdf(apt){
 const file=monthlySettlementPdfFile(apt),d=state.current[apt],title=`Rozliczenie najmu – ${aptLabel(apt)} – ${periodPL(d.period)}`;
 if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
   await navigator.share({title,text:$("sendPreview").value,files:[file]});
   return true;
 }
 return false;
}
function downloadMonthlyPdf(apt){
 const file=monthlySettlementPdfFile(apt),url=URL.createObjectURL(file),a=document.createElement("a");
 a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);return file;
}

let sendApt=null;
function monthlySettlementText(apt){
 const d=state.current[apt], other=(d.other||[]).filter(x=>num(x.amount)!==0);
 const lines=[
   `Rozliczenie najmu – ${aptLabel(apt)}`,
   `Okres: ${periodPL(d.period)}`,
   d.tenants?.length?`Najemca: ${d.tenants.join(", ")}`:"",
   "",
   `Czynsz najmu: ${PLN(d.rent)}`,
   `Czynsz administracyjny: ${PLN(d.admin)}`,
   `Gaz: ${PLN(d.gas)}`,
   `Prąd: ${PLN(d.electricity)}`
 ];
 for(const x of other) lines.push(`${x.name||"Inna opłata"}: ${PLN(x.amount)}`);
 lines.push("",`RAZEM DO WPŁATY: ${PLN(aptTotal(d))}`);
 return lines.join("\n");
}
function openSendModal(apt){
 sendApt=apt;
 const d=state.current[apt];
 $("sendInfo").textContent=`${aptLabel(apt)} • ${periodPL(d.period)}`;
 $("sendPreview").value=monthlySettlementText(apt);
 $("sendModal").classList.add("show");
}
function closeSendModal(){$("sendModal").classList.remove("show")}
document.querySelectorAll("[data-send]").forEach(b=>b.addEventListener("click",e=>{e.stopPropagation();openSendModal(b.dataset.send)}));
$("sendClose").onclick=closeSendModal;
$("copySendText").onclick=async()=>{
 try{await navigator.clipboard.writeText($("sendPreview").value);alert("Treść skopiowana.")}catch{$("sendPreview").select();document.execCommand("copy");alert("Treść skopiowana.")}
};
$("sendEmail").onclick=async()=>{
 if(!sendApt)return;
 try{if(await shareMonthlyPdf(sendApt))return}catch(e){if(e?.name==="AbortError")return}
 const d=state.current[sendApt],subject=`Rozliczenie najmu – ${aptLabel(sendApt)} – ${periodPL(d.period)}`;
 downloadMonthlyPdf(sendApt);
 window.location.href=`mailto:${encodeURIComponent((d.email||"").trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent($("sendPreview").value+"\n\nPDF został pobrany na urządzenie. Dołącz go do wiadomości.")}`;
};
$("sendWhatsApp").onclick=async()=>{
 if(!sendApt)return;
 try{if(await shareMonthlyPdf(sendApt))return}catch(e){if(e?.name==="AbortError")return}
 downloadMonthlyPdf(sendApt);
 const d=state.current[sendApt],phone=String(d.phone||"").replace(/\D/g,""),base=phone?`https://wa.me/${phone.startsWith("48")?phone:"48"+phone}`:"https://wa.me/";
 window.open(`${base}?text=${encodeURIComponent($("sendPreview").value+"\n\nPDF został pobrany — dołącz go do rozmowy.")}`,"_blank","noopener");
};
$("sendMessenger").onclick=async()=>{
 if(!sendApt)return;
 try{if(await shareMonthlyPdf(sendApt))return}catch(e){if(e?.name==="AbortError")return}
 downloadMonthlyPdf(sendApt);
 try{await navigator.clipboard.writeText($("sendPreview").value)}catch{}
 window.open("https://www.messenger.com/","_blank","noopener");
 alert("PDF został pobrany, a treść skopiowana. Wybierz osobę w Messengerze, wklej treść i dołącz PDF.");
};
$("sendShare").onclick=async()=>{
 if(!sendApt)return;
 try{if(await shareMonthlyPdf(sendApt))return}catch(e){if(e?.name==="AbortError")return}
 downloadMonthlyPdf(sendApt);
 alert("Przeglądarka nie obsługuje bezpośredniego udostępniania PDF. Plik został pobrany.");
};

let ocrTarget=null,ocrFileInput=null;
function openBillScanner(apt,key){
 ocrTarget={apt,key};if(!ocrFileInput){ocrFileInput=document.createElement("input");ocrFileInput.type="file";ocrFileInput.accept="image/*";ocrFileInput.onchange=()=>{const f=ocrFileInput.files[0];if(f)runOCR(f);ocrFileInput.value=""}}ocrFileInput.click();
}
async function runOCR(file){
 $("ocrModal").classList.add("show");$("ocrStatus").hidden=false;$("ocrResult").hidden=true;$("ocrStatus").textContent="Rozpoznaję rachunek lokalnie w przeglądarce…";
 try{
  if(!window.Tesseract)throw new Error("Moduł OCR nie został załadowany.");
  const res=await Tesseract.recognize(file,"pol+eng",{logger:m=>{if(m.status==="recognizing text")$("ocrStatus").textContent=`Rozpoznawanie: ${Math.round((m.progress||0)*100)}%`}});
  const text=res.data.text||"", amount=detectAmount(text);$("ocrText").textContent=text;$("ocrAmount").value=amount?val(amount):"";$("ocrStatus").hidden=true;$("ocrResult").hidden=false;
 }catch(e){$("ocrStatus").textContent="Nie udało się odczytać automatycznie: "+e.message}
}
function detectAmount(text){
 const lines=text.split(/\n/).filter(Boolean), re=/(\d{1,6}(?:[ .]\d{3})*[,.]\d{2})\s*(?:zł|zl|PLN)?/gi;
 const priority=lines.filter(l=>/do zap.laty|kwota.*zap|razem|nale.no/i.test(l));const source=priority.length?priority:lines;let vals=[];
 for(const l of source){for(const m of l.matchAll(re)){vals.push(num(m[1].replace(/ /g,"")))}}
 if(!vals.length){for(const m of text.matchAll(re))vals.push(num(m[1].replace(/ /g,"")))}
 return vals.filter(x=>x>0&&x<50000).sort((a,b)=>b-a)[0]||0;
}
$("ocrClose").onclick=$("ocrCancel").onclick=()=>$("ocrModal").classList.remove("show");
$("ocrAccept").onclick=()=>{if(ocrTarget){state.current[ocrTarget.apt][ocrTarget.key]=$("ocrAmount").value;save();renderApartment(ocrTarget.apt);$("ocrModal").classList.remove("show")}};
function su(){const s=state.settlement;return {zw:Math.max(0,num(s.zwEnd)-num(s.zwStart)),cw:Math.max(0,num(s.cwEnd)-num(s.cwStart)),co:Math.max(0,num(s.coEnd)-num(s.coStart))}}
function settlementCalc(){const s=state.settlement,u=su(),water=(u.zw+u.cw)*num(s.rates.water),hw=u.cw*num(s.rates.heatWater),co=u.co*num(s.rates.heat),advW=num(s.adv.water)*num(s.months),advHW=num(s.adv.heatWater)*num(s.months),advCO=num(s.adv.heat)*num(s.months);const cost=water+hw+co,adv=advW+advHW+advCO,res=adv-cost,extra=(s.costs||[]).reduce((z,x)=>z+num(x.qty)*num(x.price),0),fin=num(s.deposit)+res-extra;return{u,rows:[["Woda + odprowadzenie ścieków","water",water,advW],["Podgrzanie ciepłej wody","heatWater",hw,advHW],["Centralne ogrzewanie – opłata zmienna","heat",co,advCO]],cost,adv,res,extra,fin}}
function renderSettlement(){
 const s=state.settlement;const ids={settApt:"apt",settTenant:"tenant",settFrom:"from",settTo:"to",settMonths:"months",settZwStart:"zwStart",settZwEnd:"zwEnd",settCwStart:"cwStart",settCwEnd:"cwEnd",settCoStart:"coStart",settCoEnd:"coEnd",settDeposit:"deposit"};
 for(const [id,k] of Object.entries(ids)){const e=$(id);if(document.activeElement!==e)e.value=k==="apt"?s[k]:val(s[k]);if(!e.dataset.bound){e.oninput=()=>{s[k]=e.value;save();renderSettlement()};e.dataset.bound="1"}}
 const c=settlementCalc();$("settZwUse").textContent=N(c.u.zw)+" m³";$("settCwUse").textContent=N(c.u.cw)+" m³";$("settCoUse").textContent=N(c.u.co)+" GJ";
 $("settWaterExplain").textContent=`${N(c.u.zw)} m³ zimnej + ${N(c.u.cw)} m³ ciepłej = ${N(c.u.zw+c.u.cw)} m³`;$("settHeatWaterExplain").textContent=`${N(c.u.cw)} m³ ciepłej wody jest dodatkowo rozliczane za podgrzanie.`;
 $("settMediaBody").innerHTML=c.rows.map(([n,k,cost,adv])=>{const diff=adv-cost;return `<tr><td>${n}</td><td><input class="rate" data-rate="${k}" value="${val(s.rates[k])}"></td><td>${PLN(cost)}</td><td><input class="rate" data-adv="${k}" value="${val(s.adv[k])}"></td><td>${PLN(adv)}</td><td class="${diff>=0?"positive":"negative"}">${diff>=0?"zwrot ":"dopłata "}${PLN(Math.abs(diff))}</td></tr>`}).join("");
 document.querySelectorAll("[data-rate]").forEach(e=>e.oninput=()=>{s.rates[e.dataset.rate]=e.value;save();renderSettlement()});document.querySelectorAll("[data-adv]").forEach(e=>e.oninput=()=>{s.adv[e.dataset.adv]=e.value;save();renderSettlement()});
 $("settCostTotal").textContent=PLN(c.cost);$("settAdvTotal").textContent=PLN(c.adv);$("settMediaResult").textContent=(c.res>=0?"zwrot ":"dopłata ")+PLN(Math.abs(c.res));$("settMediaResult").className=c.res>=0?"positive":"negative";
 $("settCostsBody").innerHTML=(s.costs||[]).map((x,i)=>`<tr><td><input data-scname="${i}" value="${esc(x.name)}"></td><td><input data-scqty="${i}" value="${val(x.qty)}"></td><td><input data-scprice="${i}" value="${val(x.price)}"></td><td>${PLN(num(x.qty)*num(x.price))}</td><td><button class="danger" data-scdel="${i}">Usuń</button></td></tr>`).join("");
 document.querySelectorAll("[data-scname]").forEach(e=>e.oninput=()=>{s.costs[+e.dataset.scname].name=e.value;save()});document.querySelectorAll("[data-scqty]").forEach(e=>e.onchange=()=>{s.costs[+e.dataset.scqty].qty=e.value;save();renderSettlement()});document.querySelectorAll("[data-scprice]").forEach(e=>e.onchange=()=>{s.costs[+e.dataset.scprice].price=e.value;save();renderSettlement()});document.querySelectorAll("[data-scdel]").forEach(e=>e.onclick=()=>{s.costs.splice(+e.dataset.scdel,1);save();renderSettlement()});
 $("settCostsTotal").textContent=PLN(c.extra);$("settFinal").textContent=PLN(Math.abs(c.fin));$("settFinal").className=c.fin>=0?"positive":"negative";$("settFinalLabel").textContent=c.fin>=0?"do zwrotu najemcy":"najemca dopłaca";
}
$("settAddCost").onclick=()=>{state.settlement.costs.push({name:"",qty:1,price:0});save();renderSettlement()};
$("settImportBtn").onclick=()=>$("settImportFile").click();$("settImportFile").onchange=async e=>{try{const o=JSON.parse(await e.target.files[0].text());state.settlement={...state.settlement,...o};save();renderSettlement();alert("Rozliczenie zaimportowane.")}catch{alert("Nieprawidłowy plik JSON.")}e.target.value=""};
$("settPdf").onclick=()=>downloadSettlementPDF();
function downloadSettlementPDF(){
 if(!window.jspdf?.jsPDF){alert("Moduł PDF nie został załadowany.");return}const {jsPDF}=window.jspdf,doc=new jsPDF(),s=state.settlement,c=settlementCalc();doc.setFontSize(17);doc.text("ROZLICZENIE KONCOWE NAJMU",14,16);doc.setFontSize(10);doc.text(`Najemca: ${s.tenant}`,14,25);doc.text(`Mieszkanie: ${aptLabel(s.apt)}`,14,31);doc.text(`Okres: ${s.from} - ${s.to}`,14,37);
 doc.autoTable({startY:44,head:[["Pozycja","Koszt","Zaliczki","Wynik"]],body:c.rows.map(([n,k,cost,adv])=>[n,PLN(cost),PLN(adv),(adv-cost>=0?"zwrot ":"doplata ")+PLN(Math.abs(adv-cost))]),foot:[["RAZEM",PLN(c.cost),PLN(c.adv),(c.res>=0?"zwrot ":"doplata ")+PLN(Math.abs(c.res))]]});
 doc.autoTable({startY:doc.lastAutoTable.finalY+8,head:[["Potracenie","Ilosc","Cena","Razem"]],body:s.costs.map(x=>[x.name,String(x.qty),PLN(x.price),PLN(num(x.qty)*num(x.price))]),foot:[["SUMA","","",PLN(c.extra)]]});let y=doc.lastAutoTable.finalY+12;doc.setFontSize(13);doc.text(`Kaucja: ${PLN(s.deposit)}`,14,y);doc.setFontSize(16);doc.text(`${c.fin>=0?"DO ZWROTU":"NAJEMCA DOPLACA"}: ${PLN(Math.abs(c.fin))}`,14,y+10);doc.save(`Rozliczenie_${(s.tenant||"najemca").replace(/\W+/g,"_")}.pdf`);
}
function renderAds(){
 const apt=$("adApartment").value||"wroclawska",a=state.ads[apt], fields={adTitle:"title",adRent:"rent",adAdmin:"admin",adDeposit:"deposit",adArea:"area",adFloor:"floor",adAvailable:"available",adPhone:"phone",adDescription:"description"};
 for(const [id,k] of Object.entries(fields)){const e=$(id);if(document.activeElement!==e)e.value=k==="rent"||k==="admin"||k==="deposit"?val(a[k]):a[k]||"";if(!e.dataset.bound){e.oninput=()=>{const aa=state.ads[$("adApartment").value];aa[k]=e.value;save()};e.dataset.bound="1"}}
 renderGallery(apt);
}
$("adApartment").onchange=renderAds;
$("generateAd").onclick=()=>{const apt=$("adApartment").value,a=state.ads[apt];$("adOutput").value=`${a.title}\n\nDo wynajęcia ${apt==="wroclawska"?"mieszkanie przy ul. Wrocławskiej":"mieszkanie przy ul. Spokojnej"}.\n${a.area?`Powierzchnia: ${a.area}. `:""}${a.floor?`Piętro: ${a.floor}. `:""}\n\nCzynsz najmu: ${PLN(a.rent)}\nCzynsz administracyjny: ok. ${PLN(a.admin)}${a.deposit?`\nKaucja: ${PLN(a.deposit)}`:""}${a.available?`\nDostępne od: ${a.available}`:""}\n\n${a.description||""}${a.phone?`\n\nKontakt: ${a.phone}`:""}`};
$("copyAd").onclick=async()=>{try{await navigator.clipboard.writeText($("adOutput").value);alert("Ogłoszenie skopiowane.")}catch{$("adOutput").select();document.execCommand("copy");alert("Ogłoszenie skopiowane.")}};
$("adPhotos").onchange=async e=>{const apt=$("adApartment").value,a=state.ads[apt];for(const f of [...e.target.files].slice(0,8-a.gallery.length)){a.gallery.push(await resizeImage(f,900,.72))}save();renderGallery(apt);e.target.value=""};
function renderGallery(apt){const a=state.ads[apt];$("adGallery").innerHTML=(a.gallery||[]).map((src,i)=>`<div class="gallery-item"><img src="${src}" alt="Zdjęcie mieszkania"><button data-gdel="${i}">×</button></div>`).join("")||`<div class="muted">Brak zdjęć. Dodaj zdjęcia do przyszłego ogłoszenia.</div>`;document.querySelectorAll("[data-gdel]").forEach(b=>b.onclick=()=>{a.gallery.splice(+b.dataset.gdel,1);save();renderGallery(apt)})}
async function resizeImage(file,max=1200,q=.76){return new Promise((resolve,reject)=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{let w=img.width,h=img.height;if(Math.max(w,h)>max){const s=max/Math.max(w,h);w=Math.round(w*s);h=Math.round(h*s)}const c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);URL.revokeObjectURL(url);resolve(c.toDataURL("image/jpeg",q))};img.onerror=reject;img.src=url})}
async function setMainPhoto(apt,file){state.photos[apt]=await resizeImage(file,1000,.72);save();renderDashboard();renderApartment(apt)}
$("photoSpokojna").onchange=e=>e.target.files[0]&&setMainPhoto("spokojna",e.target.files[0]);$("photoWroclawska").onchange=e=>e.target.files[0]&&setMainPhoto("wroclawska",e.target.files[0]);
$("exportApp").onclick=()=>{const data={version:VERSION,state};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="Kalkulator_Najmu_backup.json";a.click()};
$("importAppBtn").onclick=()=>$("importAppFile").click();$("importAppFile").onchange=async e=>{try{const o=JSON.parse(await e.target.files[0].text());state=o.state||o;state.version=VERSION;save();location.reload()}catch{alert("Nieprawidłowy plik.")}};
$("resetApp").onclick=()=>{if(confirm("Przywrócić dane bazowe aplikacji? Nowe lokalne wpisy zostaną usunięte.")){state=clone(initialState);save();location.reload()}};
$("importedCount").textContent=HIST.length;
renderDashboard();renderHistory();renderSettlement();renderAds();
})();