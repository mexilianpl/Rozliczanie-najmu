const K="rozliczenie-v10";
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
const $=x=>document.getElementById(x);
const money=x=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(+x||0);
const num=x=>new Intl.NumberFormat("pl-PL",{maximumFractionDigits:3}).format(+x||0);
function zw(){return Math.max(0,(+d.zwEnd||0)-(+d.zwStart||0))}
function cw(){return Math.max(0,(+d.cwEnd||0)-(+d.cwStart||0))}
function co(){return Math.max(0,(+d.coEnd||0)-(+d.coStart||0))}
function rows(){
 const tw=zw()+cw();
 return [
  {n:"Woda + odprowadzenie ścieków",opis:`Zimna ${num(zw())} m³ + ciepła ${num(cw())} m³ = ${num(tw)} m³`,sub:"Cała pobrana woda jest podstawą opłaty za wodę i ścieki.",st:d.stawki.wodaScieki,koszt:tw*d.stawki.wodaScieki,zal:d.zaliczki.wodaScieki,unit:"zł/m³",key:"wodaScieki"},
  {n:"Podgrzanie ciepłej wody",opis:`Ciepła woda ${num(cw())} m³`,sub:"Ta sama ilość ciepłej wody jest dodatkowo rozliczana za podgrzanie.",st:d.stawki.podgrzanie,koszt:cw()*d.stawki.podgrzanie,zal:d.zaliczki.podgrzanie,unit:"zł/m³",key:"podgrzanie"},
  {n:"Centralne ogrzewanie – opłata zmienna",opis:`Zużycie ${num(co())} GJ`,sub:"Różnica pomiędzy stanem końcowym i bazowym.",st:d.stawki.co,koszt:co()*d.stawki.co,zal:d.zaliczki.co,unit:"zł/GJ",key:"co"}
 ];
}
function save(){localStorage.setItem(K,JSON.stringify(d))}
function extraTotal(){return d.extras.reduce((s,x)=>s+(+x.qty||0)*(+x.price||0),0)}
function render(){
 ["lokal","najemca","od","do","mies","zwStart","zwEnd","cwStart","cwEnd","coStart","coEnd","kaucja"].forEach(k=>$(k).value=d[k]??"");
 $("zwZuzycie").textContent=num(zw())+" m³";$("cwZuzycie").textContent=num(cw())+" m³";$("coZuzycie").textContent=num(co())+" GJ";
 $("explain").innerHTML=`<div class="note"><b>Woda i ścieki</b>Zimna woda + ciepła woda.<span class="muted">${num(zw())} + ${num(cw())} = ${num(zw()+cw())} m³</span></div><div class="note"><b>Podgrzanie ciepłej wody</b>Ciepła woda jest dodatkowo rozliczana za koszt jej podgrzania.<span class="muted">${num(cw())} m³ × ${money(d.stawki.podgrzanie).replace("PLN","").trim()}/m³</span></div>`;
 const r=rows();
 $("media").innerHTML=r.map(m=>{const zr=m.zal*(+d.mies||0),df=zr-m.koszt;return `<tr><td><b>${m.n}</b></td><td><span class="formula">${m.opis}</span><span class="muted">${m.sub}</span></td><td><input type="number" step=".01" value="${m.st}" oninput="editStawka('${m.key}',this.value)"><span class="muted">${m.unit}</span></td><td><b>${money(m.koszt)}</b></td><td><input type="number" step=".01" value="${m.zal}" oninput="editZal('${m.key}',this.value)"></td><td><b>${money(zr)}</b></td><td class="${df>=0?'pos':'neg'}">${df>=0?'zwrot ':'dopłata '}${money(Math.abs(df))}</td></tr>`}).join("");
 const koszt=r.reduce((a,m)=>a+m.koszt,0),zal=r.reduce((a,m)=>a+m.zal*(+d.mies||0),0),wynik=zal-koszt;
 $("kosztRazem").textContent=$("sc").textContent=money(koszt);$("zalRazem").textContent=$("sz").textContent=money(zal);$("wynikRazem").textContent=(wynik>=0?"zwrot ":"dopłata ")+money(Math.abs(wynik));$("wynikRazem").className=wynik>=0?"pos":"neg";$("sw").textContent=money(Math.abs(wynik));$("sw").className=wynik>=0?"pos":"neg";$("opis").textContent=wynik>=0?"nadpłata – zwrot za media":"niedopłata – do zapłaty";
 $("extras").innerHTML=d.extras.map((x,i)=>`<tr>
 <td><input value="${String(x.name??"").replace(/"/g,"&quot;")}" oninput="editExtra(${i},'name',this.value)"></td>
 <td><input type="number" step=".01" min="0" value="${x.qty}" oninput="editExtra(${i},'qty',this.value)"></td>
 <td><input type="number" step=".01" min="0" value="${x.price}" oninput="editExtra(${i},'price',this.value)"></td>
 <td><b id="extraTotal_${i}">${money((+x.qty||0)*(+x.price||0))}</b></td>
 <td class="no-print"><button class="remove" onclick="removeExtra(${i})">Usuń</button></td>
</tr>`).join("");
 const ext=extraTotal();$("extrasTotal").textContent=money(ext);
 $("fk").textContent="+ "+money(d.kaucja);$("fm").textContent=(wynik>=0?"+ ":"- ")+money(Math.abs(wynik));$("fm").className=wynik>=0?"pos":"neg";$("fd").textContent="- "+money(ext);
 const fin=(+d.kaucja||0)+wynik-ext;$("final").textContent=fin>=0?money(fin):"najemca dopłaca "+money(Math.abs(fin));$("final").className=fin>=0?"pos":"neg";
}
window.editStawka=(k,v)=>{d.stawki[k]=+v;save();updateCalculatedOnly()};
window.editZal=(k,v)=>{d.zaliczki[k]=+v;save();updateCalculatedOnly()};
window.editExtra=(i,k,v)=>{
  d.extras[i][k]=(k==="name"?v:+v);
  save();
  if(k!=="name"){
    const cell=document.getElementById(`extraTotal_${i}`);
    if(cell) cell.textContent=money((+d.extras[i].qty||0)*(+d.extras[i].price||0));
    const ext=extraTotal();
    $("extrasTotal").textContent=money(ext);

    const r=rows();
    const koszt=r.reduce((a,m)=>a+m.koszt,0);
    const zal=r.reduce((a,m)=>a+m.zal*(+d.mies||0),0);
    const wynik=zal-koszt;

    $("fd").textContent="- "+money(ext);
    const fin=(+d.kaucja||0)+wynik-ext;
    $("final").textContent=fin>=0?money(fin):"najemca dopłaca "+money(Math.abs(fin));
    $("final").className=fin>=0?"pos":"neg";
  }
};
window.removeExtra=i=>{d.extras.splice(i,1);save();render()};
function addExtraRow(){
  d.extras.push({name:"",qty:1,price:0});
  save();
  render();
}
$("addExtra").onclick=addExtraRow;
$("addExtraTop").onclick=addExtraRow;
["lokal","najemca","od","do"].forEach(k=>$(k).oninput=e=>{d[k]=e.target.value;save()});

function updateCalculatedOnly(){
  $("zwZuzycie").textContent=num(zw())+" m³";
  $("cwZuzycie").textContent=num(cw())+" m³";
  $("coZuzycie").textContent=num(co())+" GJ";

  $("explain").innerHTML=`<div class="note"><b>Woda i ścieki</b>Zimna woda + ciepła woda.<span class="muted">${num(zw())} + ${num(cw())} = ${num(zw()+cw())} m³</span></div><div class="note"><b>Podgrzanie ciepłej wody</b>Ciepła woda jest dodatkowo rozliczana za koszt jej podgrzania.<span class="muted">${num(cw())} m³ × ${money(d.stawki.podgrzanie).replace("PLN","").trim()}/m³</span></div>`;

  const r=rows();
  $("media").innerHTML=r.map(m=>{const zr=m.zal*(+d.mies||0),df=zr-m.koszt;return `<tr><td><b>${m.n}</b></td><td><span class="formula">${m.opis}</span><span class="muted">${m.sub}</span></td><td><input type="number" step=".01" value="${m.st}" oninput="editStawka('${m.key}',this.value)"><span class="muted">${m.unit}</span></td><td><b>${money(m.koszt)}</b></td><td><input type="number" step=".01" value="${m.zal}" oninput="editZal('${m.key}',this.value)"></td><td><b>${money(zr)}</b></td><td class="${df>=0?'pos':'neg'}">${df>=0?'zwrot ':'dopłata '}${money(Math.abs(df))}</td></tr>`}).join("");

  const koszt=r.reduce((a,m)=>a+m.koszt,0);
  const zal=r.reduce((a,m)=>a+m.zal*(+d.mies||0),0);
  const wynik=zal-koszt;

  $("kosztRazem").textContent=$("sc").textContent=money(koszt);
  $("zalRazem").textContent=$("sz").textContent=money(zal);
  $("wynikRazem").textContent=(wynik>=0?"zwrot ":"dopłata ")+money(Math.abs(wynik));
  $("wynikRazem").className=wynik>=0?"pos":"neg";
  $("sw").textContent=money(Math.abs(wynik));
  $("sw").className=wynik>=0?"pos":"neg";
  $("opis").textContent=wynik>=0?"nadpłata – zwrot za media":"niedopłata – do zapłaty";

  const ext=extraTotal();
  $("fk").textContent="+ "+money(d.kaucja);
  $("fm").textContent=(wynik>=0?"+ ":"- ")+money(Math.abs(wynik));
  $("fm").className=wynik>=0?"pos":"neg";
  $("fd").textContent="- "+money(ext);

  const fin=(+d.kaucja||0)+wynik-ext;
  $("final").textContent=fin>=0?money(fin):"najemca dopłaca "+money(Math.abs(fin));
  $("final").className=fin>=0?"pos":"neg";
}

["mies","zwStart","zwEnd","cwStart","cwEnd","coStart","coEnd","kaucja"].forEach(k=>{
  $(k).oninput=e=>{
    d[k]=+e.target.value;
    save();
    updateCalculatedOnly();
  };
});
$("save").onclick=()=>{save();alert("Dane zapisane.")};$("reset").onclick=()=>{if(confirm("Przywrócić dane przykładowe?")){d=structuredClone(base);save();render()}};
$("export").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:"application/json"}));a.download="rozliczenie-najmu-v06.json";a.click()};
$("clearData").onclick=()=>{
  if(confirm("Czy na pewno wyczyścić wszystkie wpisane dane? Tej operacji nie można cofnąć.")){
    d={
      lokal:"",najemca:"",
      od:"",do:"",mies:0,
      zwStart:0,zwEnd:0,
      cwStart:0,cwEnd:0,
      coStart:0,coEnd:0,
      stawki:{wodaScieki:0,podgrzanie:0,co:0},
      zaliczki:{wodaScieki:0,podgrzanie:0,co:0},
      kaucja:0,
      extras:[]
    };
    save();
    render();
  }
};
render();