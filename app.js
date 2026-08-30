const K="rozliczenie-v04";
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
const num=x=>new Intl.NumberFormat("pl-PL",{maximumFractionDigits:3}).format(+x||0);
function zw(){return Math.max(0,(+d.zwEnd||0)-(+d.zwStart||0))}
function cw(){return Math.max(0,(+d.cwEnd||0)-(+d.cwStart||0))}
function co(){return Math.max(0,(+d.coEnd||0)-(+d.coStart||0))}
function rows(){
  return [
    {
      n:"Zimna woda i odprowadzenie ścieków",
      pod:`${num(zw())} + ${num(cw())} = ${num(zw()+cw())} m³`,
      st:d.stawki.wodaScieki,
      koszt:(zw()+cw())*d.stawki.wodaScieki,
      zal:d.zaliczki.wodaScieki
    },
    {
      n:"Ciepła woda (podgrzanie)",
      pod:`${num(cw())} m³`,
      st:d.stawki.podgrzanie,
      koszt:cw()*d.stawki.podgrzanie,
      zal:d.zaliczki.podgrzanie
    },
    {
      n:"Centralne ogrzewanie – opłata zmienna",
      pod:`${num(co())} GJ`,
      st:d.stawki.co,
      koszt:co()*d.stawki.co,
      zal:d.zaliczki.co
    }
  ];
}
function save(){localStorage.setItem(K,JSON.stringify(d))}
function render(){
  ["lokal","najemca","od","do","mies","zwStart","zwEnd","cwStart","cwEnd","coStart","coEnd","prad","szkody","kaucja"].forEach(k=>$(k).value=d[k]??"");
  $("zwZuzycie").textContent=num(zw())+" m³";
  $("cwZuzycie").textContent=num(cw())+" m³";
  $("coZuzycie").textContent=num(co())+" GJ";

  const r=rows();
  $("media").innerHTML=r.map((m,i)=>{
    const zalRaz=(+m.zal||0)*(+d.mies||0), diff=zalRaz-m.koszt;
    const key=["wodaScieki","podgrzanie","co"][i];
    return `<tr>
      <td><b>${m.n}</b></td>
      <td>${m.pod}</td>
      <td><input type="number" step=".01" value="${m.st}" oninput="editStawka('${key}',this.value)"></td>
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
$("export").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:"application/json"}));a.download="rozliczenie-najmu-v04.json";a.click()};
render();