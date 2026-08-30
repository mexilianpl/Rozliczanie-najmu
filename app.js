const K="rozliczenie-v05";
const base={
  lokal:"Wrocławska 53A/42",
  najemca:"",
  od:"2026-03-01",
  do:"2026-08-31",
  mies:6,
  zwStart:43.088, zwEnd:62.33,
  cwStart:42.237, cwEnd:55.12,
  coStart:10.463, coEnd:10.619,
  stawki:{wodaScieki:14.86,podgrzanie:28,co:125},
  zaliczki:{wodaScieki:63.90,podgrzanie:61.60,co:62.50},
  prad:0,szkody:0,kaucja:0
};
let d=JSON.parse(localStorage.getItem(K)||"null")||structuredClone(base);
const $=x=>document.getElementById(x);
const money=x=>new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN"}).format(+x||0);
const num=x=>new Intl.NumberFormat("pl-PL",{minimumFractionDigits:0,maximumFractionDigits:3}).format(+x||0);
function zw(){return Math.max(0,(+d.zwEnd||0)-(+d.zwStart||0))}
function cw(){return Math.max(0,(+d.cwEnd||0)-(+d.cwStart||0))}
function co(){return Math.max(0,(+d.coEnd||0)-(+d.coStart||0))}
function rows(){
  const totalWater=zw()+cw();
  return [
    {
      n:"Woda + odprowadzenie ścieków",
      opis:`Zimna woda ${num(zw())} m³ + ciepła woda ${num(cw())} m³ = ${num(totalWater)} m³`,
      sub:"Opłata obejmuje całą wodę pobraną w lokalu oraz odprowadzenie tej ilości do kanalizacji.",
      st:d.stawki.wodaScieki,
      koszt:totalWater*d.stawki.wodaScieki,
      zal:d.zaliczki.wodaScieki,
      unit:"zł/m³"
    },
    {
      n:"Podgrzanie ciepłej wody",
      opis:`Ciepła woda ${num(cw())} m³`,
      sub:"Ta sama ilość z licznika ciepłej wody jest dodatkowo rozliczana za jej podgrzanie.",
      st:d.stawki.podgrzanie,
      koszt:cw()*d.stawki.podgrzanie,
      zal:d.zaliczki.podgrzanie,
      unit:"zł/m³"
    },
    {
      n:"Centralne ogrzewanie – opłata zmienna",
      opis:`Zużycie ogrzewania ${num(co())} GJ`,
      sub:"Koszt według różnicy pomiędzy stanem końcowym i bazowym licznika ogrzewania.",
      st:d.stawki.co,
      koszt:co()*d.stawki.co,
      zal:d.zaliczki.co,
      unit:"zł/GJ"
    }
  ];
}
function save(){localStorage.setItem(K,JSON.stringify(d))}
function render(){
  ["lokal","najemca","od","do","mies","zwStart","zwEnd","cwStart","cwEnd","coStart","coEnd","prad","szkody","kaucja"].forEach(k=>$(k).value=d[k]??"");
  $("zwZuzycie").textContent=num(zw())+" m³";
  $("cwZuzycie").textContent=num(cw())+" m³";
  $("coZuzycie").textContent=num(co())+" GJ";

  $("explain").innerHTML=`
    <div class="note"><b>1. Woda i ścieki</b>
      Liczymy <span class="formula">zimną wodę + ciepłą wodę</span>, ponieważ obie ilości wody są pobierane w lokalu i trafiają do kanalizacji.
      <span class="muted">${num(zw())} m³ + ${num(cw())} m³ = ${num(zw()+cw())} m³</span>
    </div>
    <div class="note"><b>2. Podgrzanie ciepłej wody</b>
      Ciepła woda jest rozliczana drugi raz wyłącznie za <span class="formula">koszt jej podgrzania</span>.
      <span class="muted">${num(cw())} m³ × ${money(d.stawki.podgrzanie).replace("PLN","").trim()}/m³</span>
    </div>`;

  const r=rows();
  $("media").innerHTML=r.map((m,i)=>{
    const zalRaz=(+m.zal||0)*(+d.mies||0), diff=zalRaz-m.koszt;
    const key=["wodaScieki","podgrzanie","co"][i];
    return `<tr>
      <td><b>${m.n}</b></td>
      <td><span class="formula">${m.opis}</span><span class="muted">${m.sub}</span></td>
      <td><input type="number" step=".01" value="${m.st}" oninput="editStawka('${key}',this.value)"><span class="muted">${m.unit}</span></td>
      <td><b>${money(m.koszt)}</b></td>
      <td><input type="number" step=".01" value="${m.zal}" oninput="editZal('${key}',this.value)"></td>
      <td><b>${money(zalRaz)}</b></td>
      <td class="${diff>=0?'pos':'neg'}">${diff>=0?'zwrot ':'dopłata '}${money(Math.abs(diff))}</td>
    </tr>`;
  }).join("");

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
  $("fm").textContent=(wynik>=0?"+ ":"- ")+money(Math.abs(wynik));
  $("fm").className=wynik>=0?"pos":"neg";
  $("fp").textContent="- "+money(d.prad);
  $("fs").textContent="- "+money(d.szkody);
  $("fk").textContent="+ "+money(d.kaucja);
  const fin=(+d.kaucja||0)+wynik-(+d.prad||0)-(+d.szkody||0);
  $("final").textContent=fin>=0?money(fin):"najemca dopłaca "+money(Math.abs(fin));
  $("final").className=fin>=0?"pos":"neg";
}
window.editStawka=(k,v)=>{d.stawki[k]=+v;save();render()}
window.editZal=(k,v)=>{d.zaliczki[k]=+v;save();render()}
["lokal","najemca","od","do"].forEach(k=>$(k).oninput=e=>{d[k]=e.target.value;save()});
["mies","zwStart","zwEnd","cwStart","cwEnd","coStart","coEnd","prad","szkody","kaucja"].forEach(k=>$(k).oninput=e=>{d[k]=+e.target.value;save();render()});
$("save").onclick=()=>{save();alert("Dane zapisane.")};
$("reset").onclick=()=>{if(confirm("Przywrócić dane przykładowe?")){d=structuredClone(base);save();render()}};
$("export").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:"application/json"}));a.download="rozliczenie-najmu-v05.json";a.click()};
render();