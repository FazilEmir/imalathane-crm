import { useState, useMemo, useEffect, useCallback, useRef } from "react";

/* ━━━ STORAGE KEYS ━━━ */
const STORAGE_KEYS = {
  customers: "crm:customers",
  orders: "crm:orders",
  payments: "crm:payments",
  materials: "crm:materials",
  finishedGoods: "crm:finishedGoods",
  prodLog: "crm:prodLog",
  initialized: "crm:initialized",
};

/* ━━━ DEFAULT DATA (first-time only) ━━━ */
const DEF_PRODUCTS = [
  { id: "p1", name: "Cilt Şapı", unit: "Adet", defaultPrice: 45 },
  { id: "p2", name: "Mini Kantaşı", unit: "Adet", defaultPrice: 12 },
  { id: "p3", name: "Kalem Kantaşı", unit: "Adet", defaultPrice: 25 },
  { id: "p4", name: "Rolon Deodorant", unit: "Adet", defaultPrice: 65 },
];

const DEF_MATERIALS = [
  { id:"m1",name:"Cilt Şapı Kutusu",category:"ambalaj",unit:"Adet",stock:0 },
  { id:"m2",name:"Cilt Şapı Kolisi",category:"koli",unit:"Adet",stock:0 },
  { id:"m3",name:"Mini Kantaşı Batırma Çubuğu",category:"hammadde",unit:"Adet",stock:0 },
  { id:"m4",name:"Mini Kantaşı Kapak",category:"hammadde",unit:"Adet",stock:0 },
  { id:"m5",name:"Mini Kantaşı Paketi (24'lük)",category:"ambalaj",unit:"Adet",stock:0 },
  { id:"m6",name:"Mini Kantaşı Kolisi (24 Paketlik)",category:"koli",unit:"Adet",stock:0 },
  { id:"m7",name:"Mini Kantaşı Kolisi (40 Paketlik)",category:"koli",unit:"Adet",stock:0 },
  { id:"m8",name:"Kalem Kantaşı Etiketi",category:"ambalaj",unit:"Adet",stock:0 },
  { id:"m9",name:"Kalem Kantaşı Kutusu (12'lik)",category:"ambalaj",unit:"Adet",stock:0 },
  { id:"m10",name:"Kalem Kantaşı Kolisi",category:"koli",unit:"Adet",stock:0 },
  { id:"m11",name:"Rolon Deodorant Şişesi",category:"ambalaj",unit:"Adet",stock:0 },
  { id:"m12",name:"Rolon Deodorant Kapağı",category:"ambalaj",unit:"Adet",stock:0 },
  { id:"m13",name:"Rolon Deodorant Etiketi",category:"ambalaj",unit:"Adet",stock:0 },
  { id:"m14",name:"Rolon Deodorant Kolisi",category:"koli",unit:"Adet",stock:0 },
];

const DEF_FG = [
  { id:"fg1",name:"Cilt Şapı Kolisi (144'lük)",stock:0,productId:"p1",piecesPerKoli:144 },
  { id:"fg2",name:"Mini Kantaşı Kolisi (24 Pkt)",stock:0,productId:"p2",piecesPerKoli:576 },
  { id:"fg3",name:"Mini Kantaşı Kolisi (40 Pkt)",stock:0,productId:"p2",piecesPerKoli:960 },
  { id:"fg4",name:"Kalem Kantaşı Kolisi (72 Kutu)",stock:0,productId:"p3",piecesPerKoli:864 },
  { id:"fg5",name:"Rolon Deodorant Kolisi (24'lük)",stock:0,productId:"p4",piecesPerKoli:24 },
];

const RECIPES = [
  { id:"r1",name:"Cilt Şapı Kolisi (144'lük)",finishedGoodId:"fg1",desc:"1 koli = 144 adet cilt şapı",materials:[{materialId:"m1",qtyPerUnit:144,label:"Cilt Şapı Kutusu"},{materialId:"m2",qtyPerUnit:1,label:"Cilt Şapı Kolisi"}]},
  { id:"r2",name:"Mini Kantaşı Kolisi (24 Paketlik)",finishedGoodId:"fg2",desc:"1 koli = 24 paket × 24 adet = 576 adet",materials:[{materialId:"m3",qtyPerUnit:576,label:"Batırma Çubuğu"},{materialId:"m4",qtyPerUnit:576,label:"Kapak"},{materialId:"m5",qtyPerUnit:24,label:"Paket (24'lük)"},{materialId:"m6",qtyPerUnit:1,label:"Koli (24 Paketlik)"}]},
  { id:"r3",name:"Mini Kantaşı Kolisi (40 Paketlik)",finishedGoodId:"fg3",desc:"1 koli = 40 paket × 24 adet = 960 adet",materials:[{materialId:"m3",qtyPerUnit:960,label:"Batırma Çubuğu"},{materialId:"m4",qtyPerUnit:960,label:"Kapak"},{materialId:"m5",qtyPerUnit:40,label:"Paket (24'lük)"},{materialId:"m7",qtyPerUnit:1,label:"Koli (40 Paketlik)"}]},
  { id:"r4",name:"Kalem Kantaşı Kolisi (72 Kutuluk)",finishedGoodId:"fg4",desc:"1 koli = 72 kutu × 12 adet = 864 adet",materials:[{materialId:"m8",qtyPerUnit:864,label:"Kalem Kantaşı Etiketi"},{materialId:"m9",qtyPerUnit:72,label:"Kalem Kantaşı Kutusu"},{materialId:"m10",qtyPerUnit:1,label:"Kalem Kantaşı Kolisi"}]},
  { id:"r5",name:"Rolon Deodorant Kolisi (24'lük)",finishedGoodId:"fg5",desc:"1 koli = 24 adet rolon deodorant",materials:[{materialId:"m11",qtyPerUnit:24,label:"Şişe"},{materialId:"m12",qtyPerUnit:24,label:"Kapak"},{materialId:"m13",qtyPerUnit:24,label:"Etiket"},{materialId:"m14",qtyPerUnit:1,label:"Koli"}]},
];

/* ━━━ UTILS ━━━ */
const fmt = n => new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY"}).format(n);
const fmtN = n => new Intl.NumberFormat("tr-TR").format(n);
const fmtD = d => d ? new Date(d).toLocaleDateString("tr-TR") : "-";
const gid = () => Date.now().toString(36) + Math.random().toString(36).substr(2,5);

const STATUS_MAP = {
  beklemede:{label:"Beklemede",color:"#f59e0b"},
  hazirlaniyor:{label:"Hazırlanıyor",color:"#3b82f6"},
  teslim:{label:"Teslim Edildi",color:"#10b981"},
  iptal:{label:"İptal",color:"#ef4444"},
};
const CAT_LABELS = {hammadde:"Hammadde",ambalaj:"Ambalaj",koli:"Koli"};
const CAT_COLORS = {hammadde:"#f59e0b",ambalaj:"#3b82f6",koli:"#8b5cf6"};

const T = {
  bg:"#0f1117",surface:"#1a1d27",surfaceHover:"#22252f",card:"#1e2130",
  border:"#2a2d3a",accent:"#c8a45e",accentDark:"#b08d3e",
  text:"#e8e6e1",textMuted:"#8b8d97",textDim:"#5c5e68",
  success:"#10b981",warning:"#f59e0b",danger:"#ef4444",info:"#3b82f6",purple:"#8b5cf6",
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',sans-serif;background:${T.bg};color:${T.text}}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${T.bg}}::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
input,select,textarea{background:${T.bg};border:1px solid ${T.border};color:${T.text};padding:9px 12px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;transition:border .2s}
input:focus,select:focus,textarea:focus{border-color:${T.accent}}
select option{background:${T.bg};color:${T.text}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
`;

/* ─── Icons ─── */
const Ic = ({d,s=20,c="currentColor"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const IC = {
  dash:<Ic d={<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>}/>,
  users:<Ic d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}/>,
  box:<Ic d={<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>}/>,
  file:<Ic d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>}/>,
  dollar:<Ic d={<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>}/>,
  inv:<Ic d={<><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></>}/>,
  factory:<Ic d={<><path d="M2 20V8l5 4V8l5 4V4h4l6 6v10H2z"/></>}/>,
  plus:<Ic d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}/>,
  edit:<Ic d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>} s={16}/>,
  trash:<Ic d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>} s={16}/>,
  close:<Ic d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}/>,
  search:<Ic d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>} s={18}/>,
  up:<Ic d={<><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>} s={18} c="#10b981"/>,
  down:<Ic d={<><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>} s={18} c="#ef4444"/>,
  warn:<Ic d={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>} s={16} c="#f59e0b"/>,
  check:<Ic d={<><polyline points="20 6 9 17 4 12"/></>} s={16} c="#10b981"/>,
  save:<Ic d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>} s={16}/>,
  reset:<Ic d={<><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></>} s={16}/>,
  db:<Ic d={<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>} s={16}/>,
};

/* ─── Micro Components ─── */
function Btn({children,onClick,icon,variant="primary",small,disabled}){
  const p=variant==="primary";
  return <button disabled={disabled} onClick={onClick} style={{display:"flex",alignItems:"center",gap:7,padding:small?"7px 14px":"9px 18px",borderRadius:9,border:p?"none":`1px solid ${T.border}`,background:p?(disabled?T.textDim:`linear-gradient(135deg,${T.accent},${T.accentDark})`):"transparent",color:p?T.bg:T.textMuted,fontFamily:"'DM Sans',sans-serif",fontSize:small?12:13,fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1,transition:"all .2s",whiteSpace:"nowrap"}}>{icon}{children}</button>;
}
function IB({children,onClick,danger}){return <button onClick={onClick} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:7,padding:7,cursor:"pointer",color:danger?T.danger:T.textMuted,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</button>;}
function FF({label,children,span}){return <div style={{gridColumn:span?`span ${span}`:undefined}}><label style={{fontSize:11,color:T.textMuted,display:"block",marginBottom:5,fontWeight:500}}>{label}</label>{children}</div>;}
function Bdg({text,color}){return <span style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:600,background:`${color}20`,color}}>{text}</span>;}
function Spinner(){return <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",background:T.bg}}><div style={{textAlign:"center"}}><div style={{width:40,height:40,border:`3px solid ${T.border}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 16px"}}/><div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:T.accent,marginBottom:6}}>İMALATHANE CRM</div><div style={{fontSize:12,color:T.textMuted,animation:"pulse 1.5s ease infinite"}}>Veriler yükleniyor...</div></div></div>;}

/* ━━━ PERSISTENT STORAGE HOOK ━━━ */
function usePersistedState(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [loaded, setLoaded] = useState(false);
  const isFirst = useRef(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await window.storage.get(key);
        if (!cancelled && result && result.value) {
          setValue(JSON.parse(result.value));
        }
      } catch (e) {
        // Key not found, use default
      }
      if (!cancelled) setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    if (isFirst.current) { isFirst.current = false; return; }
    const timer = setTimeout(async () => {
      try {
        await window.storage.set(key, JSON.stringify(value));
      } catch (e) {
        console.error("Storage save error:", e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, loaded, key]);

  return [value, setValue, loaded];
}

/* ━━━ MAIN APP ━━━ */
export default function CRM(){
  const [page,setPage]=useState("dashboard");
  const [customers,setCustomers,cLoaded]=usePersistedState(STORAGE_KEYS.customers,[]);
  const [orders,setOrders,oLoaded]=usePersistedState(STORAGE_KEYS.orders,[]);
  const [payments,setPayments,pLoaded]=usePersistedState(STORAGE_KEYS.payments,[]);
  const [materials,setMaterials,mLoaded]=usePersistedState(STORAGE_KEYS.materials,DEF_MATERIALS);
  const [finishedGoods,setFinishedGoods,fgLoaded]=usePersistedState(STORAGE_KEYS.finishedGoods,DEF_FG);
  const [prodLog,setProdLog,plLoaded]=usePersistedState(STORAGE_KEYS.prodLog,[]);
  const [modal,setModal]=useState(null);
  const [sideOpen,setSideOpen]=useState(true);
  const [toast,setToast]=useState(null);
  const [confirmReset,setConfirmReset]=useState(false);
  const [saving,setSaving]=useState(false);

  const allLoaded = cLoaded && oLoaded && pLoaded && mLoaded && fgLoaded && plLoaded;

  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3500);};
  const getMat=(id)=>materials.find(m=>m.id===id);
  const getCust=(id)=>customers.find(c=>c.id===id);
  const getProd=(id)=>DEF_PRODUCTS.find(p=>p.id===id);
  const orderSub=(o)=>o.items.reduce((s,i)=>s+i.qty*i.unitPrice,0);
  const orderKDV=(o)=>{const s=orderSub(o);return o.faturali?s*(1+((o.kdvRate||20)/100)):s;};
  const getCustPrice=(cid,pid)=>{const c=getCust(cid);if(c?.customPrices?.[pid]!==undefined)return c.customPrices[pid];return getProd(pid)?.defaultPrice||0;};

  const openM=(type,data=null)=>setModal({type,data});
  const closeM=()=>setModal(null);

  /* CRUD */
  const saveCust=(c)=>{if(c.id)setCustomers(p=>p.map(x=>x.id===c.id?c:x));else setCustomers(p=>[...p,{...c,id:"c"+gid()}]);closeM();showToast("Müşteri kaydedildi");};
  const delCust=(id)=>{setCustomers(p=>p.filter(c=>c.id!==id));showToast("Müşteri silindi");};

  const saveOrder=(o)=>{if(o.id)setOrders(p=>p.map(x=>x.id===o.id?o:x));else setOrders(p=>[...p,{...o,id:"s"+gid()}]);closeM();showToast("Sipariş kaydedildi");};
  const delOrder=(id)=>{setOrders(p=>p.filter(o=>o.id!==id));showToast("Sipariş silindi");};

  const deductFG=(orderId)=>{
    const order=orders.find(o=>o.id===orderId);if(!order)return;
    let deductions=[];let ok=true;
    for(const item of order.items){
      const fgs=finishedGoods.filter(fg=>fg.productId===item.productId);
      if(!fgs.length){showToast(`${getProd(item.productId)?.name}: hazır koli yok`,"error");return;}
      let rem=item.qty;
      for(const fg of fgs){
        if(rem<=0)break;const need=Math.ceil(rem/fg.piecesPerKoli);const act=Math.min(need,fg.stock);
        if(act>0){deductions.push({fgId:fg.id,qty:act});rem-=act*fg.piecesPerKoli;}
      }
      if(rem>0){showToast(`${getProd(item.productId)?.name}: yeterli koli stoku yok`,"error");ok=false;}
    }
    if(ok){setFinishedGoods(prev=>prev.map(fg=>{const d=deductions.find(x=>x.fgId===fg.id);return d?{...fg,stock:fg.stock-d.qty}:fg;}));showToast("Koliler stoktan düşüldü!");}
  };

  const savePay=(p)=>{if(p.id)setPayments(pr=>pr.map(x=>x.id===p.id?p:x));else setPayments(pr=>[...pr,{...p,id:"od"+gid()}]);closeM();showToast("Ödeme kaydedildi");};
  const delPay=(id)=>{setPayments(p=>p.filter(x=>x.id!==id));showToast("Ödeme silindi");};

  const saveMat=(m)=>{if(m.id)setMaterials(p=>p.map(x=>x.id===m.id?m:x));else setMaterials(p=>[...p,{...m,id:"m"+gid()}]);closeM();showToast("Malzeme kaydedildi");};
  const addStock=(mid,qty)=>{setMaterials(p=>p.map(m=>m.id===mid?{...m,stock:m.stock+qty}:m));showToast("Stok eklendi");};

  const produce=(rid,qty,note)=>{
    const r=RECIPES.find(x=>x.id===rid);if(!r)return;
    for(const rm of r.materials){const mat=getMat(rm.materialId);const need=rm.qtyPerUnit*qty;if(!mat||mat.stock<need){showToast(`Yetersiz: ${rm.label}`,"error");return;}}
    setMaterials(prev=>prev.map(m=>{const rm=r.materials.find(x=>x.materialId===m.id);return rm?{...m,stock:m.stock-(rm.qtyPerUnit*qty)}:m;}));
    setFinishedGoods(prev=>prev.map(fg=>fg.id===r.finishedGoodId?{...fg,stock:fg.stock+qty}:fg));
    setProdLog(prev=>[{id:"pl"+gid(),recipeId:rid,qty,date:new Date().toISOString().slice(0,10),note:note||`${qty} koli ${r.name}`},...prev]);
    showToast(`${qty} koli ${r.name} üretildi!`);closeM();
  };

  const resetAll=async()=>{
    try{
      for(const key of Object.values(STORAGE_KEYS)){try{await window.storage.delete(key)}catch(e){}}
      setCustomers([]);setOrders([]);setPayments([]);setMaterials(DEF_MATERIALS);setFinishedGoods(DEF_FG);setProdLog([]);
      setConfirmReset(false);showToast("Tüm veriler sıfırlandı");
    }catch(e){showToast("Sıfırlama hatası","error");}
  };

  const navItems=[
    {id:"dashboard",label:"Panel",icon:IC.dash},
    {id:"customers",label:"Müşteriler",icon:IC.users,count:customers.length},
    {id:"orders",label:"Siparişler",icon:IC.file,count:orders.length},
    {id:"payments",label:"Ödemeler",icon:IC.dollar,count:payments.length},
    {id:"inventory",label:"Envanter",icon:IC.inv,alert:materials.filter(m=>m.stock<100&&m.stock>0).length||null},
    {id:"production",label:"Üretim",icon:IC.factory},
    {id:"settings",label:"Ayarlar",icon:IC.db},
  ];

  const stats=useMemo(()=>{
    const rev=orders.filter(o=>o.status!=="iptal").reduce((s,o)=>s+orderKDV(o),0);
    const tah=payments.filter(p=>p.type==="tahsilat").reduce((s,p)=>s+(p.faturali?p.amount*(1+((p.kdvRate||20)/100)):p.amount),0);
    const ode=payments.filter(p=>p.type==="odeme").reduce((s,p)=>s+(p.faturali?p.amount*(1+((p.kdvRate||20)/100)):p.amount),0);
    return{customers:customers.length,orders:orders.length,revenue:rev,pending:orders.filter(o=>o.status==="beklemede").length,tahsilat:tah,odeme:ode,totalFG:finishedGoods.reduce((s,f)=>s+f.stock,0),lowMats:materials.filter(m=>m.stock<100&&m.stock>0).length};
  },[orders,payments,customers,finishedGoods,materials]);

  const PP={customers,orders,payments,materials,finishedGoods,prodLog,getCust,getProd,getMat,getCustPrice,orderSub,orderKDV,openM,closeM,saveCust,delCust,saveOrder,delOrder,savePay,delPay,saveMat,addStock,produce,deductFG,showToast,stats,setPage,resetAll,confirmReset,setConfirmReset};

  if(!allLoaded) return <><style>{css}</style><Spinner/></>;

  return(
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:T.bg}}>
      <style>{css}</style>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:20,right:20,zIndex:2000,padding:"12px 20px",borderRadius:10,background:toast.type==="error"?T.danger:T.success,color:"#fff",fontSize:13,fontWeight:600,animation:"fadeIn .2s",boxShadow:"0 4px 20px rgba(0,0,0,.4)",display:"flex",alignItems:"center",gap:8}}>
        {toast.type==="success"?IC.check:IC.warn}{toast.msg}
      </div>}

      {/* Sidebar */}
      <aside style={{width:sideOpen?230:62,transition:"width .3s",background:T.surface,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
        <div style={{padding:sideOpen?"22px 18px 16px":"22px 9px 16px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:9,background:`linear-gradient(135deg,${T.accent},${T.accentDark})`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:16,color:T.bg,flexShrink:0}}>İ</div>
            {sideOpen&&<div><div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:14,color:T.accent}}>İMALATHANE</div><div style={{fontSize:9,color:T.textMuted,letterSpacing:"2px",textTransform:"uppercase"}}>CRM & Envanter</div></div>}
          </div>
        </div>
        <nav style={{flex:1,padding:"12px 8px",display:"flex",flexDirection:"column",gap:2}}>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>setPage(item.id)} style={{display:"flex",alignItems:"center",gap:11,padding:sideOpen?"9px 13px":"9px 11px",borderRadius:8,border:"none",cursor:"pointer",background:page===item.id?`${T.accent}15`:"transparent",color:page===item.id?T.accent:T.textMuted,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:page===item.id?600:400,textAlign:"left",whiteSpace:"nowrap",transition:"all .15s"}}>
              <span style={{flexShrink:0}}>{item.icon}</span>
              {sideOpen&&<span>{item.label}</span>}
              {sideOpen&&item.count>0&&<span style={{marginLeft:"auto",fontSize:10,color:T.textDim}}>{item.count}</span>}
              {sideOpen&&item.alert&&<span style={{marginLeft:"auto",background:`${T.warning}30`,color:T.warning,fontSize:10,padding:"1px 6px",borderRadius:4,fontWeight:700}}>{item.alert}</span>}
            </button>
          ))}
        </nav>
        <div style={{padding:"8px",borderTop:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:4}}>
          <div style={{fontSize:10,color:T.textDim,textAlign:"center",padding:"4px 0"}}>{sideOpen?"Veriler otomatik kaydedilir":"💾"}</div>
          <button onClick={()=>setSideOpen(!sideOpen)} style={{padding:7,borderRadius:6,border:`1px solid ${T.border}`,background:"transparent",color:T.textMuted,cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>{sideOpen?"◁ Daralt":"▷"}</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,overflow:"auto",padding:"26px 30px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          {page==="dashboard"&&<DashP {...PP}/>}
          {page==="customers"&&<CustP {...PP}/>}
          {page==="orders"&&<OrderP {...PP}/>}
          {page==="payments"&&<PayP {...PP}/>}
          {page==="inventory"&&<InvP {...PP}/>}
          {page==="production"&&<ProdP {...PP}/>}
          {page==="settings"&&<SettingsP {...PP}/>}
        </div>
      </main>

      {/* Modal */}
      {modal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={closeM}>
        <div style={{background:T.surface,borderRadius:14,border:`1px solid ${T.border}`,padding:26,maxWidth:660,width:"92%",maxHeight:"88vh",overflowY:"auto",animation:"scaleIn .2s"}} onClick={e=>e.stopPropagation()}>
          {modal.type==="customer"&&<CustForm data={modal.data} onSave={saveCust} onClose={closeM}/>}
          {modal.type==="order"&&<OrderForm data={modal.data} customers={customers} getCustPrice={getCustPrice} onSave={saveOrder} onClose={closeM}/>}
          {modal.type==="payment"&&<PayForm data={modal.data} customers={customers} onSave={savePay} onClose={closeM}/>}
          {modal.type==="material"&&<MatForm data={modal.data} onSave={saveMat} onClose={closeM}/>}
          {modal.type==="addstock"&&<AddStockF mat={modal.data} onAdd={addStock} onClose={closeM}/>}
          {modal.type==="produce"&&<ProduceF materials={materials} getMat={getMat} onProduce={produce} onClose={closeM}/>}
        </div>
      </div>}
    </div>
  );
}

/* ━━━ DASHBOARD ━━━ */
function DashP({stats,orders,getCust,getProd,orderKDV,setPage,finishedGoods,materials}){
  const cards=[{label:"Müşteri",value:stats.customers,color:T.info,icon:"👥"},{label:"Sipariş",value:stats.orders,color:T.accent,icon:"📦"},{label:"Ciro",value:fmt(stats.revenue),color:T.success,icon:"📊"},{label:"Bekleyen",value:stats.pending,color:T.warning,icon:"⏳"}];
  const fin=[{label:"Tahsilat",value:fmt(stats.tahsilat),color:T.success},{label:"Ödeme",value:fmt(stats.odeme),color:T.danger},{label:"Hazır Koli",value:stats.totalFG+" koli",color:T.purple}];
  const recent=[...orders].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  const low=materials.filter(m=>m.stock<100&&m.stock>0);

  if(orders.length===0&&stats.customers===0) return <div style={{animation:"fadeIn .4s"}}>
    <div style={{marginBottom:24}}><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700}}>Hoş Geldiniz!</h1><p style={{color:T.textMuted,marginTop:3,fontSize:13}}>İmalathane CRM & Envanter Sistemi</p></div>
    <div style={{background:T.card,borderRadius:14,border:`1px solid ${T.border}`,padding:"40px 30px",textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16}}>🏭</div>
      <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,marginBottom:8}}>Sisteminiz Kullanıma Hazır</h2>
      <p style={{color:T.textMuted,fontSize:14,maxWidth:500,margin:"0 auto 24px"}}>Verileriniz otomatik olarak kaydedilir. Başlamak için aşağıdaki adımları izleyin:</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,maxWidth:700,margin:"0 auto"}}>
        {[{n:"1",t:"Müşteri Ekleyin",d:"Müşteriler sayfasından ilk müşterinizi ekleyin",p:"customers"},{n:"2",t:"Malzeme Girin",d:"Envanter sayfasından mevcut stokları girin",p:"inventory"},{n:"3",t:"Üretim Yapın",d:"Üretim sayfasından koli hazırlayın",p:"production"},{n:"4",t:"Sipariş Alın",d:"Siparişler sayfasından sipariş oluşturun",p:"orders"}].map(s=>(
          <button key={s.n} onClick={()=>setPage(s.p)} style={{background:T.surface,borderRadius:10,border:`1px solid ${T.border}`,padding:"18px 16px",cursor:"pointer",textAlign:"left",transition:"all .2s"}}>
            <div style={{width:28,height:28,borderRadius:7,background:`${T.accent}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:T.accent,marginBottom:10}}>{s.n}</div>
            <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:4}}>{s.t}</div>
            <div style={{fontSize:12,color:T.textMuted}}>{s.d}</div>
          </button>
        ))}
      </div>
    </div>
  </div>;

  return <div style={{animation:"fadeIn .4s"}}>
    <div style={{marginBottom:24}}><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700}}>Gösterge Paneli</h1><p style={{color:T.textMuted,marginTop:3,fontSize:13}}>İmalathane CRM & Envanter</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:18}}>
      {cards.map((c,i)=><div key={i} style={{background:T.card,borderRadius:12,padding:"18px 16px",border:`1px solid ${T.border}`,animation:`fadeIn .4s ease ${i*.06}s both`}}><div style={{display:"flex",justifyContent:"space-between"}}><div><div style={{fontSize:11,color:T.textMuted,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>{c.label}</div><div style={{fontSize:22,fontWeight:700,color:c.color}}>{c.value}</div></div><div style={{fontSize:24}}>{c.icon}</div></div></div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginBottom:22}}>
      {fin.map((c,i)=><div key={i} style={{background:T.card,borderRadius:12,padding:"14px 16px",border:`1px solid ${T.border}`,borderLeft:`3px solid ${c.color}`}}><div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>{c.label}</div><div style={{fontSize:19,fontWeight:700,color:c.color}}>{c.value}</div></div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:low.length?"2fr 1fr":"1fr",gap:14,marginBottom:18}}>
      <div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,overflow:"hidden"}}>
        <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><h3 style={{fontSize:14,fontWeight:600}}>Son Siparişler</h3><button onClick={()=>setPage("orders")} style={{background:"transparent",border:"none",color:T.accent,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>Tümü →</button></div>
        {recent.length===0?<div style={{padding:20,textAlign:"center",color:T.textDim,fontSize:13}}>Henüz sipariş yok</div>:
        <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{["Tarih","Müşteri","Tutar","Fatura","Durum"].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:10,color:T.textDim,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600}}>{h}</th>)}</tr></thead>
        <tbody>{recent.map(o=>{const st=STATUS_MAP[o.status];return <tr key={o.id} style={{borderBottom:`1px solid ${T.border}08`}}>
          <td style={{padding:"11px 13px",fontSize:12}}>{fmtD(o.date)}</td>
          <td style={{padding:"11px 13px",fontSize:12,fontWeight:500}}>{getCust(o.customerId)?.name||"-"}</td>
          <td style={{padding:"11px 13px",fontSize:12,fontWeight:600}}>{fmt(orderKDV(o))}</td>
          <td style={{padding:"11px 13px"}}><Bdg text={o.faturali?"Faturalı":"Faturasız"} color={o.faturali?T.info:T.textDim}/></td>
          <td style={{padding:"11px 13px"}}><Bdg text={st.label} color={st.color}/></td>
        </tr>;})}</tbody></table>}
      </div>
      {low.length>0&&<div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,overflow:"hidden"}}>
        <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:7}}>{IC.warn}<h3 style={{fontSize:14,fontWeight:600,color:T.warning}}>Düşük Stok</h3></div>
        <div style={{padding:"10px 14px",display:"flex",flexDirection:"column",gap:6}}>{low.map(m=><div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderRadius:7,background:T.surface}}><span style={{fontSize:11}}>{m.name}</span><span style={{fontSize:12,fontWeight:700,color:m.stock<20?T.danger:T.warning}}>{fmtN(m.stock)}</span></div>)}</div>
      </div>}
    </div>
    <div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,padding:"16px 18px"}}>
      <h3 style={{fontSize:14,fontWeight:600,marginBottom:12,display:"flex",alignItems:"center",gap:7}}>{IC.box} Hazır Koliler</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:8}}>
        {finishedGoods.map(fg=><div key={fg.id} style={{padding:"10px 14px",borderRadius:8,background:T.surface,border:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11}}>{fg.name}</span><span style={{fontSize:15,fontWeight:700,color:fg.stock>0?T.success:T.danger}}>{fg.stock}</span></div>)}
      </div>
    </div>
  </div>;
}

/* ━━━ CUSTOMERS ━━━ */
function CustP({customers,openM,delCust,getCustPrice}){
  const [search,setSearch]=useState("");const [exp,setExp]=useState(null);
  const filtered=customers.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.city?.toLowerCase().includes(search.toLowerCase()));
  return <div style={{animation:"fadeIn .4s"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700}}>Müşteriler</h1><p style={{color:T.textMuted,fontSize:13,marginTop:3}}>{customers.length} kayıtlı</p></div><Btn onClick={()=>openM("customer")} icon={IC.plus}>Yeni Müşteri</Btn></div>
    {customers.length>0&&<div style={{position:"relative",marginBottom:14}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}>{IC.search}</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Müşteri ara..." style={{width:"100%",paddingLeft:38}}/></div>}
    {customers.length===0?<div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,padding:"40px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>👥</div><p style={{color:T.textMuted,fontSize:14}}>Henüz müşteri eklenmemiş. İlk müşterinizi ekleyin!</p></div>:
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {filtered.map((c,i)=><div key={c.id} style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,overflow:"hidden",animation:`fadeIn .3s ease ${i*.04}s both`}}>
        <div style={{padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,flex:1}}>
            <div style={{width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,${T.accent}30,${T.accent}10)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:T.accent}}>{c.name[0]}</div>
            <div><div style={{fontWeight:600,fontSize:14}}>{c.name}</div><div style={{fontSize:11,color:T.textMuted,marginTop:1}}>{[c.contact,c.city,c.phone].filter(Boolean).join(" · ")}</div></div>
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            <button onClick={()=>setExp(exp===c.id?null:c.id)} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 11px",color:T.textMuted,cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>{exp===c.id?"Gizle":"Fiyatlar"}</button>
            <IB onClick={()=>openM("customer",c)}>{IC.edit}</IB>
            <IB onClick={()=>{if(confirm("Bu müşteriyi silmek istediğinize emin misiniz?"))delCust(c.id)}} danger>{IC.trash}</IB>
          </div>
        </div>
        {exp===c.id&&<div style={{borderTop:`1px solid ${T.border}`,padding:"12px 18px",background:`${T.bg}60`}}>
          <div style={{fontSize:11,color:T.textMuted,marginBottom:7,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px"}}>Ürün Bazlı Fiyatlar</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:5}}>
            {DEF_PRODUCTS.map(p=>{const custom=c.customPrices?.[p.id];return <div key={p.id} style={{padding:"7px 11px",borderRadius:7,background:T.surface,border:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12}}>{p.name}</span><span style={{fontSize:13,fontWeight:600,color:custom!==undefined?T.accent:T.textMuted}}>{fmt(getCustPrice(c.id,p.id))}{custom!==undefined&&<span style={{fontSize:9,color:T.success,marginLeft:3}}>ÖZEL</span>}</span></div>;})}
          </div>
        </div>}
      </div>)}
    </div>}
  </div>;
}

/* ━━━ ORDERS ━━━ */
function OrderP({orders,getCust,getProd,orderSub,orderKDV,openM,deductFG,delOrder}){
  const [filter,setFilter]=useState("all");
  const sorted=[...(filter==="all"?orders:orders.filter(o=>o.status===filter))].sort((a,b)=>b.date.localeCompare(a.date));
  return <div style={{animation:"fadeIn .4s"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700}}>Siparişler</h1><p style={{color:T.textMuted,fontSize:13,marginTop:3}}>{orders.length} sipariş</p></div><Btn onClick={()=>openM("order")} icon={IC.plus}>Yeni Sipariş</Btn></div>
    {orders.length>0&&<div style={{display:"flex",gap:5,marginBottom:16,flexWrap:"wrap"}}>
      {[{key:"all",label:"Tümü"},...Object.entries(STATUS_MAP).map(([k,v])=>({key:k,label:v.label}))].map(f=><button key={f.key} onClick={()=>setFilter(f.key)} style={{padding:"6px 13px",borderRadius:7,border:`1px solid ${filter===f.key?T.accent:T.border}`,background:filter===f.key?`${T.accent}15`:"transparent",color:filter===f.key?T.accent:T.textMuted,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{f.label}</button>)}
    </div>}
    {orders.length===0?<div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,padding:"40px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>📦</div><p style={{color:T.textMuted,fontSize:14}}>Henüz sipariş yok</p></div>:
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {sorted.map((o,i)=>{const cust=getCust(o.customerId);const st=STATUS_MAP[o.status];const sub=orderSub(o);const tot=orderKDV(o);
      return <div key={o.id} style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,padding:"16px 20px",animation:`fadeIn .3s ease ${i*.04}s both`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
          <div style={{flex:1,minWidth:200}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,flexWrap:"wrap"}}>
              <span style={{fontWeight:600,fontSize:14}}>{cust?.name||"-"}</span>
              <Bdg text={st.label} color={st.color}/>
              <Bdg text={o.paymentType==="pesin"?"Peşin":"Vadeli"} color={o.paymentType==="pesin"?T.success:T.warning}/>
              <Bdg text={o.faturali?"Faturalı":"Faturasız"} color={o.faturali?T.info:T.textDim}/>
              {o.faturali&&<Bdg text={`KDV %${o.kdvRate||20}`} color={T.purple}/>}
            </div>
            <div style={{fontSize:11,color:T.textMuted}}>{fmtD(o.date)}{o.dueDate&&` · Vade: ${fmtD(o.dueDate)}`}{o.note&&` · ${o.note}`}</div>
            <div style={{marginTop:7,display:"flex",flexWrap:"wrap",gap:4}}>{o.items.map((item,j)=><span key={j} style={{padding:"3px 8px",borderRadius:5,fontSize:11,background:T.surface,border:`1px solid ${T.border}`}}>{getProd(item.productId)?.name}: {fmtN(item.qty)} × {fmt(item.unitPrice)}</span>)}</div>
          </div>
          <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
            {o.faturali&&sub!==tot&&<div style={{fontSize:11,color:T.textDim}}>Ara toplam: {fmt(sub)}</div>}
            <div style={{fontSize:19,fontWeight:700,color:T.accent}}>{fmt(tot)}</div>
            <div style={{display:"flex",gap:5}}>
              <Btn small variant="ghost" onClick={()=>deductFG(o.id)}>Stoktan Düş</Btn>
              <IB onClick={()=>openM("order",o)}>{IC.edit}</IB>
              <IB onClick={()=>{if(confirm("Siparişi silmek istediğinize emin misiniz?"))delOrder(o.id)}} danger>{IC.trash}</IB>
            </div>
          </div>
        </div>
      </div>;})}
    </div>}
  </div>;
}

/* ━━━ PAYMENTS ━━━ */
function PayP({payments,getCust,openM,delPay}){
  const [tf,setTf]=useState("all");
  const sorted=[...(tf==="all"?payments:payments.filter(p=>p.type===tf))].sort((a,b)=>b.date.localeCompare(a.date));
  return <div style={{animation:"fadeIn .4s"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700}}>Ödemeler</h1><p style={{color:T.textMuted,fontSize:13,marginTop:3}}>Tahsilat ve ödeme takibi</p></div><Btn onClick={()=>openM("payment")} icon={IC.plus}>Yeni Kayıt</Btn></div>
    {payments.length>0&&<div style={{display:"flex",gap:5,marginBottom:16}}>
      {[{key:"all",label:"Tümü"},{key:"tahsilat",label:"Tahsilatlar"},{key:"odeme",label:"Ödemeler"}].map(f=><button key={f.key} onClick={()=>setTf(f.key)} style={{padding:"6px 13px",borderRadius:7,border:`1px solid ${tf===f.key?T.accent:T.border}`,background:tf===f.key?`${T.accent}15`:"transparent",color:tf===f.key?T.accent:T.textMuted,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{f.label}</button>)}
    </div>}
    {payments.length===0?<div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,padding:"40px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:12}}>💰</div><p style={{color:T.textMuted,fontSize:14}}>Henüz ödeme kaydı yok</p></div>:
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      {sorted.map((p,i)=>{const cust=p.customerId?getCust(p.customerId):null;const isIn=p.type==="tahsilat";const kdv=p.faturali?p.amount*((p.kdvRate||20)/100):0;
      return <div key={p.id} style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,borderLeft:`3px solid ${isIn?T.success:T.danger}`,padding:"14px 18px",animation:`fadeIn .3s ease ${i*.04}s both`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{flex:1,minWidth:200}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
            {isIn?IC.up:IC.down}
            <span style={{fontWeight:600,fontSize:13}}>{isIn?"Tahsilat":"Ödeme"}</span>
            <Bdg text={p.method==="pesin"?"Peşin":"Vadeli"} color={p.method==="pesin"?T.success:T.warning}/>
            <Bdg text={p.faturali?"Faturalı":"Faturasız"} color={p.faturali?T.info:T.textDim}/>
            {p.faturali&&<Bdg text={`KDV %${p.kdvRate||20}`} color={T.purple}/>}
          </div>
          <div style={{fontSize:11,color:T.textMuted}}>{fmtD(p.date)}{cust&&` · ${cust.name}`}{p.dueDate&&` · Vade: ${fmtD(p.dueDate)}`}</div>
          {p.desc&&<div style={{fontSize:11,color:T.textDim,marginTop:2}}>{p.desc}</div>}
          {p.faturali&&kdv>0&&<div style={{fontSize:11,color:T.purple,marginTop:2}}>KDV: {fmt(kdv)} · Toplam: {fmt(p.amount+kdv)}</div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{fontSize:17,fontWeight:700,color:isIn?T.success:T.danger}}>{isIn?"+":"-"}{fmt(p.amount)}</div>
          <IB onClick={()=>openM("payment",p)}>{IC.edit}</IB>
          <IB onClick={()=>{if(confirm("Bu kaydı silmek istediğinize emin misiniz?"))delPay(p.id)}} danger>{IC.trash}</IB>
        </div>
      </div>;})}
    </div>}
  </div>;
}

/* ━━━ INVENTORY ━━━ */
function InvP({materials,finishedGoods,openM}){
  const [tab,setTab]=useState("materials");const [search,setSearch]=useState("");const [cat,setCat]=useState("all");
  const filtered=materials.filter(m=>(cat==="all"||m.category===cat)&&m.name.toLowerCase().includes(search.toLowerCase()));
  return <div style={{animation:"fadeIn .4s"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700}}>Envanter</h1><p style={{color:T.textMuted,fontSize:13,marginTop:3}}>Malzeme ve hazır ürün stokları</p></div><Btn onClick={()=>openM("material")} icon={IC.plus} variant="ghost">Yeni Malzeme</Btn></div>
    <div style={{display:"flex",gap:5,marginBottom:16}}>
      {[{key:"materials",label:"Malzemeler"},{key:"finished",label:"Hazır Koliler"}].map(t=><button key={t.key} onClick={()=>setTab(t.key)} style={{padding:"8px 18px",borderRadius:8,border:`1px solid ${tab===t.key?T.accent:T.border}`,background:tab===t.key?`${T.accent}15`:"transparent",color:tab===t.key?T.accent:T.textMuted,cursor:"pointer",fontSize:13,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{t.label}</button>)}
    </div>
    {tab==="materials"&&<>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{position:"relative",flex:1,minWidth:180}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}>{IC.search}</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Malzeme ara..." style={{width:"100%",paddingLeft:38}}/></div>
        <div style={{display:"flex",gap:3}}>{["all","hammadde","ambalaj","koli"].map(c=><button key={c} onClick={()=>setCat(c)} style={{padding:"6px 11px",borderRadius:7,border:`1px solid ${cat===c?T.accent:T.border}`,background:cat===c?`${T.accent}15`:"transparent",color:cat===c?T.accent:T.textMuted,cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{c==="all"?"Tümü":CAT_LABELS[c]}</button>)}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:10}}>
        {filtered.map((m,i)=>{const low=m.stock>0&&m.stock<100;
        return <div key={m.id} style={{background:T.card,borderRadius:11,border:`1px solid ${low?`${T.warning}40`:T.border}`,padding:"15px 16px",animation:`fadeIn .3s ease ${i*.03}s both`,position:"relative",overflow:"hidden"}}>
          {low&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,background:T.warning}}/>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}><Bdg text={CAT_LABELS[m.category]} color={CAT_COLORS[m.category]}/>{low&&<span style={{fontSize:10,color:T.warning,fontWeight:700}}>⚠ DÜŞÜK</span>}</div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:1}}>{m.name}</div>
              <div style={{fontSize:11,color:T.textDim}}>Birim: {m.unit}</div>
            </div>
            <div style={{textAlign:"right"}}><div style={{fontSize:21,fontWeight:700,color:m.stock===0?T.textDim:low?T.warning:T.success}}>{fmtN(m.stock)}</div><div style={{fontSize:10,color:T.textDim}}>adet</div></div>
          </div>
          <div style={{display:"flex",gap:5,marginTop:10}}>
            <Btn small variant="ghost" onClick={()=>openM("addstock",m)}>+ Stok Ekle</Btn>
            <IB onClick={()=>openM("material",m)}>{IC.edit}</IB>
          </div>
        </div>;})}
      </div>
    </>}
    {tab==="finished"&&<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
      {finishedGoods.map((fg,i)=><div key={fg.id} style={{background:T.card,borderRadius:11,border:`1px solid ${T.border}`,padding:"18px",animation:`fadeIn .3s ease ${i*.06}s both`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,right:0,width:60,height:60,background:`radial-gradient(circle at top right,${T.accent}12,transparent)`}}/>
        <div style={{fontSize:10,color:T.textDim,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:5}}>HAZIR KOLİ</div>
        <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>{fg.name}</div>
        <div style={{fontSize:11,color:T.textMuted,marginBottom:12}}>1 koli = {fmtN(fg.piecesPerKoli)} adet</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div>
            <div style={{fontSize:10,color:T.textDim}}>Stok</div>
            <div style={{fontSize:26,fontWeight:700,color:fg.stock>0?T.success:T.textDim}}>{fg.stock}</div>
            <div style={{fontSize:11,color:T.textMuted}}>= {fmtN(fg.stock*fg.piecesPerKoli)} adet</div>
          </div>
          <Bdg text={fg.stock>5?"Yeterli":fg.stock>0?"Az":"Boş"} color={fg.stock>5?T.success:fg.stock>0?T.warning:T.textDim}/>
        </div>
      </div>)}
    </div>}
  </div>;
}

/* ━━━ PRODUCTION ━━━ */
function ProdP({materials,getMat,openM,prodLog}){
  return <div style={{animation:"fadeIn .4s"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><div><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700}}>Üretim</h1><p style={{color:T.textMuted,fontSize:13,marginTop:3}}>Koli üretimi ve malzeme tüketimi</p></div><Btn onClick={()=>openM("produce")} icon={IC.plus}>Yeni Üretim</Btn></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:12,marginBottom:24}}>
      {RECIPES.map((r,i)=>{
        const maxP=Math.min(...r.materials.map(rm=>{const mat=getMat(rm.materialId);return mat?Math.floor(mat.stock/rm.qtyPerUnit):0;}));
        return <div key={r.id} style={{background:T.card,borderRadius:11,border:`1px solid ${T.border}`,padding:"18px",animation:`fadeIn .3s ease ${i*.06}s both`}}>
          <div style={{fontSize:15,fontWeight:700,marginBottom:3}}>{r.name}</div>
          <div style={{fontSize:12,color:T.textMuted,marginBottom:12}}>{r.desc}</div>
          {r.materials.map(rm=>{const mat=getMat(rm.materialId);const avail=mat?.stock||0;const ok=avail>=rm.qtyPerUnit;
          return <div key={rm.materialId} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${T.border}08`,fontSize:12}}>
            <span style={{color:T.textMuted}}>{rm.label}</span>
            <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{color:T.textDim}}>×{fmtN(rm.qtyPerUnit)}</span><span style={{fontWeight:600,color:ok?T.success:T.danger}}>{fmtN(avail)}</span>{ok?IC.check:IC.warn}</div>
          </div>;})}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}><span style={{fontSize:12,color:T.textMuted}}>Maks:</span><span style={{fontSize:17,fontWeight:700,color:maxP>0?T.success:T.danger}}>{maxP} koli</span></div>
        </div>;
      })}
    </div>
    <div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,overflow:"hidden"}}>
      <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.border}`}}><h3 style={{fontSize:14,fontWeight:600}}>Üretim Geçmişi</h3></div>
      {prodLog.length===0?<div style={{padding:20,textAlign:"center",color:T.textDim,fontSize:13}}>Henüz üretim kaydı yok</div>:
      <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{["Tarih","Reçete","Miktar","Not"].map(h=><th key={h} style={{padding:"9px 13px",textAlign:"left",fontSize:10,color:T.textDim,textTransform:"uppercase",letterSpacing:"1px",fontWeight:600}}>{h}</th>)}</tr></thead>
      <tbody>{prodLog.map(pl=>{const r=RECIPES.find(x=>x.id===pl.recipeId);return <tr key={pl.id} style={{borderBottom:`1px solid ${T.border}08`}}>
        <td style={{padding:"11px 13px",fontSize:12}}>{fmtD(pl.date)}</td>
        <td style={{padding:"11px 13px",fontSize:12,fontWeight:500}}>{r?.name||"-"}</td>
        <td style={{padding:"11px 13px",fontSize:13,fontWeight:700,color:T.success}}>{pl.qty} koli</td>
        <td style={{padding:"11px 13px",fontSize:12,color:T.textMuted}}>{pl.note}</td>
      </tr>;})}</tbody></table>}
    </div>
  </div>;
}

/* ━━━ SETTINGS ━━━ */
function SettingsP({customers,orders,payments,materials,prodLog,resetAll,confirmReset,setConfirmReset}){
  return <div style={{animation:"fadeIn .4s"}}>
    <div style={{marginBottom:22}}><h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700}}>Ayarlar</h1><p style={{color:T.textMuted,fontSize:13,marginTop:3}}>Sistem bilgileri ve veri yönetimi</p></div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:24}}>
      {[{l:"Müşteri",v:customers.length,c:T.info},{l:"Sipariş",v:orders.length,c:T.accent},{l:"Ödeme",v:payments.length,c:T.success},{l:"Malzeme",v:materials.length,c:T.purple},{l:"Üretim Kaydı",v:prodLog.length,c:T.warning}].map((s,i)=>(
        <div key={i} style={{background:T.card,borderRadius:11,border:`1px solid ${T.border}`,padding:"16px",borderLeft:`3px solid ${s.c}`}}>
          <div style={{fontSize:11,color:T.textMuted,marginBottom:4}}>{s.l}</div>
          <div style={{fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div>
          <div style={{fontSize:10,color:T.textDim}}>kayıt</div>
        </div>
      ))}
    </div>

    <div style={{background:T.card,borderRadius:12,border:`1px solid ${T.border}`,padding:"20px",marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>{IC.save}<h3 style={{fontSize:15,fontWeight:600}}>Otomatik Kayıt</h3></div>
      <p style={{fontSize:13,color:T.textMuted,lineHeight:1.6}}>Tüm verileriniz her değişiklikte otomatik olarak kaydedilir. Tarayıcıyı kapatıp açtığınızda verileriniz korunur.</p>
    </div>

    <div style={{background:T.card,borderRadius:12,border:`1px solid ${T.danger}30`,padding:"20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>{IC.reset}<h3 style={{fontSize:15,fontWeight:600,color:T.danger}}>Verileri Sıfırla</h3></div>
      <p style={{fontSize:13,color:T.textMuted,marginBottom:14,lineHeight:1.6}}>Tüm müşteri, sipariş, ödeme, envanter ve üretim verilerini silip sistemi başlangıç durumuna getirir. Bu işlem geri alınamaz!</p>
      {!confirmReset?<Btn variant="ghost" onClick={()=>setConfirmReset(true)} icon={IC.warn}>Verileri Sıfırla</Btn>:
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <span style={{fontSize:13,color:T.danger,fontWeight:600}}>Emin misiniz?</span>
        <Btn small onClick={resetAll}>Evet, Sıfırla</Btn>
        <Btn small variant="ghost" onClick={()=>setConfirmReset(false)}>İptal</Btn>
      </div>}
    </div>
  </div>;
}

/* ━━━ FORMS ━━━ */
function CustForm({data,onSave,onClose}){
  const [f,sF]=useState(data||{name:"",contact:"",phone:"",city:"",taxNo:"",email:"",customPrices:{}});
  const set=(k,v)=>sF({...f,[k]:v});
  const setP=(pid,v)=>{const cp={...f.customPrices};if(v===""||v===undefined)delete cp[pid];else cp[pid]=Number(v);set("customPrices",cp);};
  const valid=f.name.trim().length>0;
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700}}>{data?"Müşteri Düzenle":"Yeni Müşteri"}</h2><button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",color:T.textMuted}}>{IC.close}</button></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}>
      <FF label="Firma Adı *" span={2}><input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Firma adını girin" style={{width:"100%",borderColor:!f.name.trim()&&f.name!==""?T.danger:undefined}}/></FF>
      <FF label="Yetkili Kişi"><input value={f.contact} onChange={e=>set("contact",e.target.value)} style={{width:"100%"}}/></FF>
      <FF label="Telefon"><input value={f.phone} onChange={e=>set("phone",e.target.value)} style={{width:"100%"}}/></FF>
      <FF label="Şehir"><input value={f.city} onChange={e=>set("city",e.target.value)} style={{width:"100%"}}/></FF>
      <FF label="Vergi No"><input value={f.taxNo} onChange={e=>set("taxNo",e.target.value)} style={{width:"100%"}}/></FF>
      <FF label="E-posta" span={2}><input value={f.email} onChange={e=>set("email",e.target.value)} style={{width:"100%"}}/></FF>
    </div>
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:600,color:T.textMuted,marginBottom:7,textTransform:"uppercase",letterSpacing:"1px"}}>Özel Fiyatlar <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>(boş = varsayılan fiyat)</span></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>{DEF_PRODUCTS.map(p=><div key={p.id} style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,flex:1}}>{p.name} <span style={{color:T.textDim,fontSize:10}}>({fmt(p.defaultPrice)})</span></span><input type="number" placeholder={`${p.defaultPrice}`} value={f.customPrices?.[p.id]??""} onChange={e=>setP(p.id,e.target.value)} style={{width:85,textAlign:"right"}}/></div>)}</div>
    </div>
    <div style={{display:"flex",gap:7,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={onClose}>İptal</Btn><Btn disabled={!valid} onClick={()=>onSave(f)}>Kaydet</Btn></div>
  </div>;
}

function OrderForm({data,customers,getCustPrice,onSave,onClose}){
  const [f,sF]=useState(data||{customerId:customers[0]?.id||"",date:new Date().toISOString().slice(0,10),status:"beklemede",items:[{productId:DEF_PRODUCTS[0]?.id||"",qty:1,unitPrice:0}],paymentType:"pesin",dueDate:"",note:"",faturali:false,kdvRate:20});
  const set=(k,v)=>sF({...f,[k]:v});
  const setI=(idx,k,v)=>{const items=[...f.items];items[idx]={...items[idx],[k]:k==="qty"||k==="unitPrice"?Number(v):v};if(k==="productId")items[idx].unitPrice=getCustPrice(f.customerId,v);set("items",items);};
  const handleCust=cid=>{const items=f.items.map(item=>({...item,unitPrice:getCustPrice(cid,item.productId)}));sF({...f,customerId:cid,items});};
  const sub=f.items.reduce((s,i)=>s+i.qty*i.unitPrice,0);
  const kdv=f.faturali?sub*((f.kdvRate||20)/100):0;
  const valid=f.customerId&&f.items.length>0&&f.items.every(i=>i.qty>0);

  if(customers.length===0) return <div><div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700}}>Yeni Sipariş</h2><button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",color:T.textMuted}}>{IC.close}</button></div><div style={{padding:"30px",textAlign:"center",color:T.textMuted}}><div style={{fontSize:32,marginBottom:10}}>👥</div><p>Sipariş oluşturmak için önce müşteri eklemelisiniz.</p></div></div>;

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700}}>{data?"Sipariş Düzenle":"Yeni Sipariş"}</h2><button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",color:T.textMuted}}>{IC.close}</button></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
      <FF label="Müşteri *" span={2}><select value={f.customerId} onChange={e=>handleCust(e.target.value)} style={{width:"100%"}}>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></FF>
      <FF label="Tarih"><input type="date" value={f.date} onChange={e=>set("date",e.target.value)} style={{width:"100%"}}/></FF>
      <FF label="Durum"><select value={f.status} onChange={e=>set("status",e.target.value)} style={{width:"100%"}}>{Object.entries(STATUS_MAP).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></FF>
      <FF label="Ödeme Tipi"><select value={f.paymentType} onChange={e=>set("paymentType",e.target.value)} style={{width:"100%"}}><option value="pesin">Peşin</option><option value="vadeli">Vadeli</option></select></FF>
      {f.paymentType==="vadeli"&&<FF label="Vade Tarihi"><input type="date" value={f.dueDate||""} onChange={e=>set("dueDate",e.target.value)} style={{width:"100%"}}/></FF>}
      <FF label="Fatura"><select value={f.faturali?"evet":"hayir"} onChange={e=>set("faturali",e.target.value==="evet")} style={{width:"100%"}}><option value="hayir">Faturasız</option><option value="evet">Faturalı</option></select></FF>
      {f.faturali&&<FF label="KDV %"><input type="number" value={f.kdvRate||20} onChange={e=>set("kdvRate",Number(e.target.value))} style={{width:"100%"}}/></FF>}
    </div>
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}><span style={{fontSize:11,fontWeight:600,color:T.textMuted,textTransform:"uppercase",letterSpacing:"1px"}}>Ürünler</span><button onClick={()=>set("items",[...f.items,{productId:DEF_PRODUCTS[0]?.id||"",qty:1,unitPrice:0}])} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:6,padding:"3px 9px",color:T.accent,cursor:"pointer",fontSize:11,fontFamily:"'DM Sans',sans-serif"}}>+ Ekle</button></div>
      {f.items.map((item,idx)=><div key={idx} style={{display:"flex",gap:5,alignItems:"flex-end",marginBottom:5}}>
        <div style={{flex:2}}>{idx===0&&<label style={{fontSize:10,color:T.textDim,display:"block",marginBottom:2}}>Ürün</label>}<select value={item.productId} onChange={e=>setI(idx,"productId",e.target.value)} style={{width:"100%"}}>{DEF_PRODUCTS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div style={{flex:1}}>{idx===0&&<label style={{fontSize:10,color:T.textDim,display:"block",marginBottom:2}}>Adet</label>}<input type="number" min={1} value={item.qty} onChange={e=>setI(idx,"qty",e.target.value)} style={{width:"100%"}}/></div>
        <div style={{flex:1}}>{idx===0&&<label style={{fontSize:10,color:T.textDim,display:"block",marginBottom:2}}>Fiyat</label>}<input type="number" value={item.unitPrice} onChange={e=>setI(idx,"unitPrice",e.target.value)} style={{width:"100%"}}/></div>
        <div style={{flex:1,textAlign:"right"}}>{idx===0&&<label style={{fontSize:10,color:T.textDim,display:"block",marginBottom:2}}>Tutar</label>}<div style={{padding:"9px 0",fontSize:12,fontWeight:600,color:T.accent}}>{fmt(item.qty*item.unitPrice)}</div></div>
        {f.items.length>1&&<button onClick={()=>set("items",f.items.filter((_,i)=>i!==idx))} style={{background:"transparent",border:"none",cursor:"pointer",color:T.danger,padding:"9px 2px"}}>{IC.trash}</button>}
      </div>)}
      <div style={{textAlign:"right",marginTop:8,borderTop:`1px solid ${T.border}`,paddingTop:8}}>
        <div style={{fontSize:12,color:T.textMuted}}>Ara Toplam: {fmt(sub)}</div>
        {f.faturali&&<div style={{fontSize:12,color:T.purple,marginTop:1}}>KDV (%{f.kdvRate||20}): {fmt(kdv)}</div>}
        <div style={{fontSize:17,fontWeight:700,color:T.accent,marginTop:3}}>Toplam: {fmt(sub+kdv)}</div>
      </div>
    </div>
    <FF label="Not"><textarea value={f.note||""} onChange={e=>set("note",e.target.value)} rows={2} style={{width:"100%",resize:"vertical"}}/></FF>
    <div style={{display:"flex",gap:7,justifyContent:"flex-end",marginTop:12}}><Btn variant="ghost" onClick={onClose}>İptal</Btn><Btn disabled={!valid} onClick={()=>onSave(f)}>Kaydet</Btn></div>
  </div>;
}

function PayForm({data,customers,onSave,onClose}){
  const [f,sF]=useState(data||{type:"tahsilat",customerId:"",date:new Date().toISOString().slice(0,10),amount:0,method:"pesin",desc:"",dueDate:"",faturali:false,kdvRate:20});
  const set=(k,v)=>sF({...f,[k]:v});
  const kdv=f.faturali?f.amount*((f.kdvRate||20)/100):0;
  const valid=f.amount>0;
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700}}>{data?"Ödeme Düzenle":"Yeni Ödeme"}</h2><button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",color:T.textMuted}}>{IC.close}</button></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:14}}>
      <FF label="İşlem Tipi"><select value={f.type} onChange={e=>set("type",e.target.value)} style={{width:"100%"}}><option value="tahsilat">Tahsilat (Gelen)</option><option value="odeme">Ödeme (Giden)</option></select></FF>
      <FF label="Ödeme Şekli"><select value={f.method} onChange={e=>set("method",e.target.value)} style={{width:"100%"}}><option value="pesin">Peşin</option><option value="vadeli">Vadeli</option></select></FF>
      {f.type==="tahsilat"&&<FF label="Müşteri" span={2}><select value={f.customerId||""} onChange={e=>set("customerId",e.target.value)} style={{width:"100%"}}><option value="">-- Seçiniz --</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></FF>}
      <FF label="Tarih"><input type="date" value={f.date} onChange={e=>set("date",e.target.value)} style={{width:"100%"}}/></FF>
      <FF label="Tutar (₺) *"><input type="number" value={f.amount} onChange={e=>set("amount",Number(e.target.value))} style={{width:"100%"}}/></FF>
      <FF label="Fatura"><select value={f.faturali?"evet":"hayir"} onChange={e=>set("faturali",e.target.value==="evet")} style={{width:"100%"}}><option value="hayir">Faturasız</option><option value="evet">Faturalı</option></select></FF>
      {f.faturali&&<FF label="KDV %"><input type="number" value={f.kdvRate||20} onChange={e=>set("kdvRate",Number(e.target.value))} style={{width:"100%"}}/></FF>}
      {f.method==="vadeli"&&<FF label="Vade Tarihi" span={2}><input type="date" value={f.dueDate||""} onChange={e=>set("dueDate",e.target.value)} style={{width:"100%"}}/></FF>}
      <FF label="Açıklama" span={2}><textarea value={f.desc||""} onChange={e=>set("desc",e.target.value)} rows={2} style={{width:"100%",resize:"vertical"}}/></FF>
    </div>
    {f.faturali&&<div style={{padding:"9px 12px",borderRadius:7,background:`${T.purple}10`,border:`1px solid ${T.purple}30`,marginBottom:12,fontSize:12,color:T.purple}}>KDV: {fmt(kdv)} · Toplam: {fmt(f.amount+kdv)}</div>}
    <div style={{display:"flex",gap:7,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={onClose}>İptal</Btn><Btn disabled={!valid} onClick={()=>onSave(f)}>Kaydet</Btn></div>
  </div>;
}

function MatForm({data,onSave,onClose}){
  const [f,sF]=useState(data||{name:"",category:"hammadde",unit:"Adet",stock:0});
  const set=(k,v)=>sF({...f,[k]:v});
  const valid=f.name.trim().length>0;
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700}}>{data?"Malzeme Düzenle":"Yeni Malzeme"}</h2><button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",color:T.textMuted}}>{IC.close}</button></div>
    <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:14}}>
      <FF label="Malzeme Adı *"><input value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Malzeme adını girin" style={{width:"100%"}}/></FF>
      <FF label="Kategori"><select value={f.category} onChange={e=>set("category",e.target.value)} style={{width:"100%"}}><option value="hammadde">Hammadde</option><option value="ambalaj">Ambalaj</option><option value="koli">Koli</option></select></FF>
      <FF label="Birim"><input value={f.unit} onChange={e=>set("unit",e.target.value)} style={{width:"100%"}}/></FF>
      <FF label="Başlangıç Stok"><input type="number" value={f.stock} onChange={e=>set("stock",Number(e.target.value))} style={{width:"100%"}}/></FF>
    </div>
    <div style={{display:"flex",gap:7,justifyContent:"flex-end"}}><Btn variant="ghost" onClick={onClose}>İptal</Btn><Btn disabled={!valid} onClick={()=>onSave(f)}>Kaydet</Btn></div>
  </div>;
}

function AddStockF({mat,onAdd,onClose}){
  const [qty,setQty]=useState(0);
  return <div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700}}>Stok Ekle</h2><button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",color:T.textMuted}}>{IC.close}</button></div>
    <div style={{padding:"12px 14px",borderRadius:9,background:T.card,border:`1px solid ${T.border}`,marginBottom:14}}><div style={{fontSize:14,fontWeight:600}}>{mat.name}</div><div style={{fontSize:12,color:T.textMuted,marginTop:2}}>Mevcut: <span style={{fontWeight:700,color:T.success}}>{fmtN(mat.stock)}</span> adet</div></div>
    <FF label="Eklenecek Miktar"><input type="number" min={1} value={qty} onChange={e=>setQty(Number(e.target.value))} style={{width:"100%"}} autoFocus/></FF>
    {qty>0&&<div style={{marginTop:8,fontSize:13,color:T.textMuted}}>Yeni stok: <span style={{fontWeight:700,color:T.success}}>{fmtN(mat.stock+qty)}</span> adet</div>}
    <div style={{display:"flex",gap:7,justifyContent:"flex-end",marginTop:14}}><Btn variant="ghost" onClick={onClose}>İptal</Btn><Btn disabled={qty<=0} onClick={()=>{onAdd(mat.id,qty);onClose();}}>Stok Ekle</Btn></div>
  </div>;
}

function ProduceF({materials,getMat,onProduce,onClose}){
  const [rid,setRid]=useState(RECIPES[0].id);
  const [qty,setQty]=useState(1);
  const [note,setNote]=useState("");
  const r=RECIPES.find(x=>x.id===rid);
  const checks=r?r.materials.map(rm=>{const mat=getMat(rm.materialId);const need=rm.qtyPerUnit*qty;const avail=mat?.stock||0;return{...rm,need,avail,ok:avail>=need};}):[];
  const canP=checks.every(c=>c.ok)&&qty>0;
  const maxP=r?Math.min(...r.materials.map(rm=>{const mat=getMat(rm.materialId);return mat?Math.floor(mat.stock/rm.qtyPerUnit):0;})):0;

  return <div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}><h2 style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700}}>Yeni Üretim</h2><button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",color:T.textMuted}}>{IC.close}</button></div>
    <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:14}}>
      <FF label="Üretim Reçetesi"><select value={rid} onChange={e=>setRid(e.target.value)} style={{width:"100%"}}>{RECIPES.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></FF>
      {r&&<div style={{fontSize:12,color:T.textMuted,padding:"5px 11px",borderRadius:7,background:T.card}}>{r.desc} · Maks: <span style={{fontWeight:700,color:maxP>0?T.success:T.danger}}>{maxP} koli</span></div>}
      <FF label="Üretim Miktarı (Koli)"><input type="number" min={1} value={qty} onChange={e=>setQty(Math.max(1,Number(e.target.value)))} style={{width:"100%"}}/></FF>
    </div>
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:600,color:T.textMuted,marginBottom:7,textTransform:"uppercase",letterSpacing:"1px"}}>Malzeme Tüketimi</div>
      {checks.map((c,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 11px",borderRadius:7,background:c.ok?`${T.success}08`:`${T.danger}08`,border:`1px solid ${c.ok?`${T.success}20`:`${T.danger}20`}`,marginBottom:3}}>
        <span style={{fontSize:12}}>{c.label}</span>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:11,color:T.textDim}}>Gerekli: <strong style={{color:T.text}}>{fmtN(c.need)}</strong></span><span style={{fontSize:11,color:T.textDim}}>Mevcut: <strong style={{color:c.ok?T.success:T.danger}}>{fmtN(c.avail)}</strong></span>{c.ok?IC.check:IC.warn}</div>
      </div>)}
    </div>
    <FF label="Not"><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Üretim notu..." style={{width:"100%"}}/></FF>
    {!canP&&qty>0&&<div style={{marginTop:8,padding:"8px 12px",borderRadius:7,background:`${T.danger}10`,border:`1px solid ${T.danger}30`,fontSize:12,color:T.danger}}>Yetersiz malzeme! Maks {maxP} koli üretilebilir.</div>}
    <div style={{display:"flex",gap:7,justifyContent:"flex-end",marginTop:14}}><Btn variant="ghost" onClick={onClose}>İptal</Btn><Btn disabled={!canP} onClick={()=>onProduce(rid,qty,note)}>Üret</Btn></div>
  </div>;
}
