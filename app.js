const K="rozliczenie-v14";
const base={
  lokal:"Wrocławska 53A/42",najemca:"",
  od:"2026-03-01",do:"2026-08-31",mies:6,
  zwStart:43.088,zwEnd:62.33,
  cwStart:42.237,cwEnd:55.12,
  coStart:10.463,coEnd:10.619,
  stawki:{wodaScieki:14.86,podgrzanie:28,co:125},
  zaliczki:{wodaScieki:63.90,podgrzanie:61.60,co:62.50},
  kaucja:0,
  extras:[
    {name:"Rachunek za prąd",qty:1,price:0},
    {name:"Farba",qty:1,price:0},
    {name:"Wałki / taśmy / materiały",qty:1,price:0}
  ]
};

let d=JSON.parse(localStorage.getItem(K)||"null")||structuredClone(base);
if(!Array.isArray(d.extras)) d.extras=structuredClone(base.extras);

const $=id=>document.getElementById(id);
const money=x=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(+x||0);
const num=x=>new Intl.NumberFormat("pl-PL",{maximumFractionDigits:3}).format(+x||0);
const parseNum=x=>{
  if(typeof x==="number") return Number.isFinite(x)?x:0;
  const s=String(x??"").trim().replace(/\s/g,"").replace(",",".");
  const v=Number(s);
  return Number.isFinite(v)?v:0;
};
const n=parseNum;
const editVal=x=>{
  if(x===null||x===undefined||x==="") return "";
  return String(x).replace(".",",");
};

function save(){localStorage.setItem(K,JSON.stringify(d))}
function zw(){return Math.max(0,n(d.zwEnd)-n(d.zwStart))}
function cw(){return Math.max(0,n(d.cwEnd)-n(d.cwStart))}
function co(){return Math.max(0,n(d.coEnd)-n(d.coStart))}
function extraTotal(){return d.extras.reduce((s,x)=>s+n(x.qty)*n(x.price),0)}

function mediaRows(){
  const totalWater=zw()+cw();
  return [
    {key:"wodaScieki",n:"Woda + odprowadzenie ścieków",desc:`Zimna ${num(zw())} m³ + ciepła ${num(cw())} m³ = ${num(totalWater)} m³`,sub:"Cała pobrana woda jest podstawą opłaty za wodę i ścieki.",unit:"zł/m³",cost:totalWater*n(d.stawki.wodaScieki),adv:n(d.zaliczki.wodaScieki)},
    {key:"podgrzanie",n:"Podgrzanie ciepłej wody",desc:`Ciepła woda ${num(cw())} m³`,sub:"Ta sama ilość ciepłej wody jest dodatkowo rozliczana za podgrzanie.",unit:"zł/m³",cost:cw()*n(d.stawki.podgrzanie),adv:n(d.zaliczki.podgrzanie)},
    {key:"co",n:"Centralne ogrzewanie – opłata zmienna",desc:`Zużycie ${num(co())} GJ`,sub:"Różnica pomiędzy stanem końcowym i bazowym.",unit:"zł/GJ",cost:co()*n(d.stawki.co),adv:n(d.zaliczki.co)}
  ];
}

function buildMediaTable(){
  const rows=[
    {key:"wodaScieki",name:"Woda + odprowadzenie ścieków",unit:"zł/m³"},
    {key:"podgrzanie",name:"Podgrzanie ciepłej wody",unit:"zł/m³"},
    {key:"co",name:"Centralne ogrzewanie – opłata zmienna",unit:"zł/GJ"}
  ];
  $("media").innerHTML=rows.map(r=>`
    <tr>
      <td><b>${r.name}</b></td>
      <td><span class="formula" id="desc_${r.key}"></span><span class="muted" id="sub_${r.key}"></span></td>
      <td>
        <input id="stawka_${r.key}" type="text" inputmode="decimal">
        <span class="muted">${r.unit}</span>
      </td>
      <td><b id="cost_${r.key}"></b></td>
      <td><input id="zal_${r.key}" type="text" inputmode="decimal"></td>
      <td><b id="adv_${r.key}"></b></td>
      <td id="diff_${r.key}"></td>
    </tr>`).join("");

  ["wodaScieki","podgrzanie","co"].forEach(k=>{
    $(`stawka_${k}`).value=editVal(d.stawki[k]??0);
    $(`zal_${k}`).value=editVal(d.zaliczki[k]??0);

    $(`stawka_${k}`).addEventListener("input",e=>{
      d.stawki[k]=e.target.value;
      save();
      recalc();
    });
    $(`zal_${k}`).addEventListener("input",e=>{
      d.zaliczki[k]=e.target.value;
      save();
      recalc();
    });
  });
}

function buildExtras(){
  $("extras").innerHTML=d.extras.map((x,i)=>`
    <tr>
      <td><input id="extra_name_${i}" value="${String(x.name??"").replace(/"/g,"&quot;")}"></td>
      <td><input id="extra_qty_${i}" type="text" inputmode="decimal" value="${editVal(x.qty??0)}"></td>
      <td><input id="extra_price_${i}" type="text" inputmode="decimal" value="${editVal(x.price??0)}"></td>
      <td><b id="extra_total_${i}">${money(n(x.qty)*n(x.price))}</b></td>
      <td class="no-print"><button class="remove" data-remove="${i}">Usuń</button></td>
    </tr>`).join("");

  d.extras.forEach((x,i)=>{
    $(`extra_name_${i}`).addEventListener("input",e=>{d.extras[i].name=e.target.value;save()});
    $(`extra_qty_${i}`).addEventListener("input",e=>{d.extras[i].qty=e.target.value;save();recalcExtras()});
    $(`extra_price_${i}`).addEventListener("input",e=>{d.extras[i].price=e.target.value;save();recalcExtras()});
  });

  document.querySelectorAll("[data-remove]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      d.extras.splice(Number(btn.dataset.remove),1);
      save();
      buildExtras();
      recalc();
    });
  });
  recalcExtras();
}

function recalcExtras(){
  d.extras.forEach((x,i)=>{
    const el=$(`extra_total_${i}`);
    if(el) el.textContent=money(n(x.qty)*n(x.price));
  });
  $("extrasTotal").textContent=money(extraTotal());
  recalcFinalOnly();
}

function recalcFinalOnly(){
  const r=mediaRows();
  const koszt=r.reduce((a,m)=>a+m.cost,0);
  const zal=r.reduce((a,m)=>a+m.adv*n(d.mies),0);
  const wynik=zal-koszt;
  const ext=extraTotal();

  $("fk").textContent="+ "+money(d.kaucja);
  $("fm").textContent=(wynik>=0?"+ ":"- ")+money(Math.abs(wynik));
  $("fm").className=wynik>=0?"pos":"neg";
  $("fd").textContent="- "+money(ext);

  const fin=n(d.kaucja)+wynik-ext;
  $("final").textContent=fin>=0?money(fin):"najemca dopłaca "+money(Math.abs(fin));
  $("final").className=fin>=0?"pos":"neg";
}

function recalc(){
  $("zwZuzycie").textContent=num(zw())+" m³";
  $("cwZuzycie").textContent=num(cw())+" m³";
  $("coZuzycie").textContent=num(co())+" GJ";

  $("explain").innerHTML=`<div class="note"><b>Woda i ścieki</b>Zimna woda + ciepła woda.<span class="muted">${num(zw())} + ${num(cw())} = ${num(zw()+cw())} m³</span></div><div class="note"><b>Podgrzanie ciepłej wody</b>Ciepła woda jest dodatkowo rozliczana za koszt jej podgrzania.<span class="muted">${num(cw())} m³ × ${money(d.stawki.podgrzanie).replace("PLN","").trim()}/m³</span></div>`;

  const r=mediaRows();
  r.forEach(m=>{
    $(`desc_${m.key}`).textContent=m.desc;
    $(`sub_${m.key}`).textContent=m.sub;
    $(`cost_${m.key}`).textContent=money(m.cost);

    const advTotal=m.adv*n(d.mies);
    $(`adv_${m.key}`).textContent=money(advTotal);

    const diff=advTotal-m.cost;
    const de=$(`diff_${m.key}`);
    de.textContent=(diff>=0?"zwrot ":"dopłata ")+money(Math.abs(diff));
    de.className=diff>=0?"pos":"neg";
  });

  const koszt=r.reduce((a,m)=>a+m.cost,0);
  const zal=r.reduce((a,m)=>a+m.adv*n(d.mies),0);
  const wynik=zal-koszt;

  $("kosztRazem").textContent=$("sc").textContent=money(koszt);
  $("zalRazem").textContent=$("sz").textContent=money(zal);
  $("wynikRazem").textContent=(wynik>=0?"zwrot ":"dopłata ")+money(Math.abs(wynik));
  $("wynikRazem").className=wynik>=0?"pos":"neg";
  $("sw").textContent=money(Math.abs(wynik));
  $("sw").className=wynik>=0?"pos":"neg";
  $("opis").textContent=wynik>=0?"nadpłata – zwrot za media":"niedopłata – do zapłaty";

  recalcFinalOnly();
}

function fillStaticInputs(){
  ["lokal","najemca","od","do"].forEach(k=>{$(k).value=d[k]??""});
  ["mies","zwStart","zwEnd","cwStart","cwEnd","coStart","coEnd","kaucja"].forEach(k=>{
    $(k).value=editVal(d[k]??"");
  });
}

function bindStaticInputs(){
  ["lokal","najemca","od","do"].forEach(k=>{
    $(k).addEventListener("input",e=>{d[k]=e.target.value;save()});
  });

  ["mies","zwStart","zwEnd","cwStart","cwEnd","coStart","coEnd","kaucja"].forEach(k=>{
    $(k).addEventListener("input",e=>{
      d[k]=e.target.value;
      save();
      recalc();
    });
  });
}

function addExtraRow(){
  d.extras.push({name:"",qty:1,price:0});
  save();
  buildExtras();
  const last=d.extras.length-1;
  const el=$(`extra_name_${last}`);
  if(el) el.focus();
}

$("addExtra").onclick=addExtraRow;
if($("addExtraTop")) $("addExtraTop").onclick=addExtraRow;

$("save").onclick=()=>{save();alert("Dane zapisane.")};

$("reset").onclick=()=>{
  if(confirm("Przywrócić dane przykładowe?")){
    d=structuredClone(base);
    save();
    fillStaticInputs();
    buildMediaTable();
    buildExtras();
    recalc();
  }
};

$("clearData").onclick=()=>{
  if(confirm("Czy na pewno wyczyścić wszystkie wpisane dane?")){
    d={
      lokal:"",najemca:"",od:"",do:"",mies:0,
      zwStart:0,zwEnd:0,cwStart:0,cwEnd:0,coStart:0,coEnd:0,
      stawki:{wodaScieki:0,podgrzanie:0,co:0},
      zaliczki:{wodaScieki:0,podgrzanie:0,co:0},
      kaucja:0,extras:[]
    };
    save();
    fillStaticInputs();
    buildMediaTable();
    buildExtras();
    recalc();
  }
};

$("export").onclick=()=>{
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:"application/json"}));
  a.download="rozliczenie-najmu-v14.json";
  a.click();
};


function applyImportedData(obj){
  if(!obj || typeof obj!=="object" || Array.isArray(obj)) throw new Error("Nieprawidłowy plik JSON.");
  const next=structuredClone(base);
  ["lokal","najemca","od","do","mies","zwStart","zwEnd","cwStart","cwEnd","coStart","coEnd","kaucja"].forEach(k=>{
    if(Object.prototype.hasOwnProperty.call(obj,k)) next[k]=obj[k];
  });
  if(obj.stawki && typeof obj.stawki==="object"){
    ["wodaScieki","podgrzanie","co"].forEach(k=>{if(Object.prototype.hasOwnProperty.call(obj.stawki,k)) next.stawki[k]=obj.stawki[k]});
  }
  if(obj.zaliczki && typeof obj.zaliczki==="object"){
    ["wodaScieki","podgrzanie","co"].forEach(k=>{if(Object.prototype.hasOwnProperty.call(obj.zaliczki,k)) next.zaliczki[k]=obj.zaliczki[k]});
  }
  next.extras=Array.isArray(obj.extras)?obj.extras.map(x=>({
    name:String(x?.name??""),
    qty:x?.qty??1,
    price:x?.price??0
  })):[];
  d=next;
  save();
  fillStaticInputs();
  buildMediaTable();
  buildExtras();
  recalc();
}

$("importBtn").onclick=()=>$("importFile").click();
$("importFile").addEventListener("change",async e=>{
  const file=e.target.files?.[0];
  if(!file) return;
  try{
    const obj=JSON.parse(await file.text());
    applyImportedData(obj);
    alert("Dane zostały zaimportowane.");
  }catch(err){
    alert("Nie udało się zaimportować pliku JSON: "+err.message);
  }finally{
    e.target.value="";
  }
});

function escapeHtml(s){
  return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function buildPdfReport(){
  const r=mediaRows();
  const koszt=r.reduce((a,m)=>a+m.cost,0);
  const zal=r.reduce((a,m)=>a+m.adv*n(d.mies),0);
  const wynik=zal-koszt;
  const ext=extraTotal();
  const fin=n(d.kaucja)+wynik-ext;

  const mediaHtml=r.map(m=>{
    const advTotal=m.adv*n(d.mies);
    const diff=advTotal-m.cost;
    return `<tr>
      <td>${escapeHtml(m.n)}</td>
      <td>${escapeHtml(m.desc)}</td>
      <td>${money(m.cost)}</td>
      <td>${money(advTotal)}</td>
      <td>${diff>=0?"zwrot ":"dopłata "}${money(Math.abs(diff))}</td>
    </tr>`;
  }).join("");

  const extrasHtml=d.extras.length?d.extras.map(x=>`<tr>
    <td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.qty)}</td><td>${money(n(x.price))}</td><td>${money(n(x.qty)*n(x.price))}</td>
  </tr>`).join(""):`<tr><td colspan="4">Brak dodatkowych kosztów</td></tr>`;

  $("pdfReport").innerHTML=`<div class="pdf-doc">
    <h1>Rozliczenie końcowe najmu</h1>
    <div class="meta">
      <div><b>Lokal:</b> ${escapeHtml(d.lokal)}</div>
      <div><b>Najemca:</b> ${escapeHtml(d.najemca)}</div>
      <div><b>Okres zaliczek:</b> ${escapeHtml(d.od)} – ${escapeHtml(d.do)}</div>
      <div><b>Liczba miesięcy:</b> ${escapeHtml(d.mies)}</div>
    </div>

    <h2>Odczyty liczników</h2>
    <table><thead><tr><th>Licznik</th><th>Stan bazowy</th><th>Stan końcowy</th><th>Zużycie</th></tr></thead><tbody>
      <tr><td>Zimna woda</td><td>${escapeHtml(d.zwStart)}</td><td>${escapeHtml(d.zwEnd)}</td><td>${num(zw())} m³</td></tr>
      <tr><td>Ciepła woda</td><td>${escapeHtml(d.cwStart)}</td><td>${escapeHtml(d.cwEnd)}</td><td>${num(cw())} m³</td></tr>
      <tr><td>Ogrzewanie</td><td>${escapeHtml(d.coStart)}</td><td>${escapeHtml(d.coEnd)}</td><td>${num(co())} GJ</td></tr>
    </tbody></table>

    <h2>Rozliczenie mediów</h2>
    <table><thead><tr><th>Pozycja</th><th>Podstawa</th><th>Koszt</th><th>Zaliczki</th><th>Wynik</th></tr></thead>
    <tbody>${mediaHtml}</tbody>
    <tfoot><tr><th colspan="2">RAZEM</th><th>${money(koszt)}</th><th>${money(zal)}</th><th>${wynik>=0?"zwrot ":"dopłata "}${money(Math.abs(wynik))}</th></tr></tfoot></table>

    <h2>Dodatkowe koszty / potrącenia</h2>
    <table><thead><tr><th>Pozycja</th><th>Ilość</th><th>Cena</th><th>Razem</th></tr></thead><tbody>${extrasHtml}</tbody>
    <tfoot><tr><th colspan="3">SUMA</th><th>${money(ext)}</th></tr></tfoot></table>

    <h2>Podsumowanie</h2>
    <table><tbody>
      <tr><td>Kaucja</td><td>${money(d.kaucja)}</td></tr>
      <tr><td>Rozliczenie mediów</td><td>${wynik>=0?"+ ":"- "}${money(Math.abs(wynik))}</td></tr>
      <tr><td>Dodatkowe koszty</td><td>- ${money(ext)}</td></tr>
    </tbody></table>
    <div class="final-box ${fin>=0?"green":"red"}"><span>${fin>=0?"DO ZWROTU NAJEMCY":"NAJEMCA DOPŁACA"}</span><span>${money(Math.abs(fin))}</span></div>
  </div>`;
}

$("downloadPdf").onclick=()=>{
  buildPdfReport();
  document.body.classList.add("pdf-mode");
  const oldTitle=document.title;
  document.title=`Rozliczenie_${(d.najemca||"najem").replace(/[^\p{L}\p{N}_-]+/gu,"_")}`;
  const cleanup=()=>{
    document.body.classList.remove("pdf-mode");
    document.title=oldTitle;
    window.removeEventListener("afterprint",cleanup);
  };
  window.addEventListener("afterprint",cleanup);
  window.print();
  setTimeout(()=>{ if(document.body.classList.contains("pdf-mode")) cleanup(); },3000);
}

fillStaticInputs();
buildMediaTable();
buildExtras();
bindStaticInputs();
recalc();

document.addEventListener("keydown",e=>{
  if(e.key==="Enter" && e.target && e.target.tagName==="INPUT") e.preventDefault();
});
