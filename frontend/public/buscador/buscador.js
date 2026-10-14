/* Buscador (Ctrl+K) y esfera flotante: el Spotlight de sicac. La página define window.SPOT_* antes de cargarlo. */
/* ======================= Buscador (Ctrl+K) · el Spotlight de sicac ======================= */
(function(){
const SIC={gift:'<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',heart:'<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',mail:'<rect x="2" y="4" width="20" height="16" rx="2.5"/><path d="m22 7-10 6L2 7"/>',pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',star:'<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/>',cubo:'<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',appA:'<path d="M13.2 3.8 6.4 15.5M10.8 3.8l2.3 4M4.6 15.5h14.8M15 10.6l4.2 7.4M7.6 18.4l-1 1.8"/>',layers:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',inbox:'<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',refresh:'<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',updown:'<path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>',list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',chart:'<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',sliders:'<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',book:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',check:'<polyline points="20 6 9 17 4 12"/>',plus:'<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',chev:'<polyline points="9 18 15 12 9 6"/>',x:'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',up:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',down:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',play:'<polygon points="5 3 19 12 5 21 5 3"/>',pause:'<line x1="9" y1="5" x2="9" y2="19"/><line x1="15" y1="5" x2="15" y2="19"/>',alert:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',clock:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',folder:'<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',db:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',ext:'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',search:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',more:'<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',user:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',clip:'<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',calc:'<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="11" x2="8" y2="11.01"/><line x1="12" y1="11" x2="12" y2="11.01"/><line x1="16" y1="11" x2="16" y2="11.01"/><line x1="8" y1="15" x2="8" y2="15.01"/><line x1="12" y1="15" x2="12" y2="15.01"/><line x1="16" y1="15" x2="16" y2="18"/><line x1="8" y1="18" x2="12" y2="18"/>'};

const ic=(n,cls='i')=>`<svg class="${cls}" viewBox="0 0 24 24">${SIC[n]||SIC.doc}</svg>`;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const IMAP={num:'book',paso:'grid',arch:'doc',cta:'calc',caso:'user',ent:'users',cal:'cal',ctl:'shield'};
const SP={q:'',i:0,items:[],cat:null,f:'',hint:false};
const spN=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/<[^>]+>/g,' ');
const spEsc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SP_STOP=new Set('el la los las un una unos unas de del al a en y o u que se su sus es por para con como cuando cual cuales quien donde cuanto cuanta lo le les mi me hay sobre esta este esto son ser fue debe tiene'.split(' '));
const spPregunta=q=>/\?|^\s*(¿|que |qué |como |cómo |cuando |cuándo |quien |quién |donde |dónde |cuanto |cuánto |cuál |cual |por que |por qué |se |hay |puedo |debe )/i.test(q);
const CATS=window.SPOT_CATS||[];const ORD=window.SPOT_ORDER||[];
let IDX=null;
function spIndice(){if(IDX)return IDX;IDX=(window.SPOT_ITEMS?window.SPOT_ITEMS():[]).map(x=>({k:x.g,t:x.t,sub:x.s||'',ic:IMAP[x.ic]||x.ic||'doc',grp:x.c||'',d:x.d||'',dk:x.k||'',kl:x.kl||'',gl:x.gl||'Ir',a:x.a||[],go:x.go,url:x.url||'',href:x.href||'',tl:x.tl||'',ph:x.ph||'',pr:x.pr||0,ext:x.ext||0,av:x.av||null,dc:x.dc||0,nb:x.nb||0,na:x.url?spN(x.xa||[x.t,x.x].join(' ')):'',nt:spN(x.t+(x.ic==='num'?' '+(x.s||''):'')),nx:spN([x.t,x.s,x.k,x.d,x.x,x.c].join(' '))}));return IDX}
const spRecGet=()=>{try{return JSON.parse(localStorage.getItem('spRec')||'[]').slice(0,5)}catch(e){return []}};
const spRecAdd=q=>{q=String(q||'').trim();if(q.length<2)return;try{const L=spRecGet().filter(x=>spN(x)!==spN(q));L.unshift(q);localStorage.setItem('spRec',JSON.stringify(L.slice(0,5)))}catch(e){}};
/* Resalta las palabras buscadas sin importar tildes ni mayúsculas */
function spHL(t,ws){t=String(t||'');if(!ws||!ws.length)return spEsc(t);let n='',m=[];for(let i=0;i<t.length;i++){const c=spN(t[i]);for(const _ of c){n+=_;m.push(i)}}
 const on=new Array(t.length).fill(0);ws.forEach(w=>{if(!w)return;let k=0;while((k=n.indexOf(w,k))>-1){const st=k===0||!/[a-z0-9ñ]/.test(n[k-1]);if(st)for(let z=k;z<k+w.length;z++)on[m[z]]=1;k+=w.length}});
 let o='',a=0;for(let i=0;i<=t.length;i++){if(i===t.length||on[i]!==on[a]){const seg=spEsc(t.slice(a,i));o+=on[a]?`<mark>${seg}</mark>`:seg;a=i}}return o}
/* Fragmento del texto alrededor de la primera palabra encontrada */
function spSnip(t,ws){t=String(t||'');const n=spN(t);let at=-1;(ws||[]).forEach(w=>{const k=n.indexOf(w);if(k>-1&&(at<0||k<at))at=k});if(at<0)at=0;const a=Math.max(0,at-70),b=Math.min(t.length,at+150);
 let s=t.slice(a,b);if(a>0)s='…'+s.replace(/^\S*\s/,'');if(b<t.length)s=s.replace(/\s\S*$/,'')+'…';return spHL(s,ws)}
let VOC=null;window.SPOT_RESET=()=>{IDX=null;VOC=null};const spVoc=()=>{if(VOC)return VOC;const S=new Set();spIndice().forEach(x=>(x.nt+' '+spN(x.sub)).split(/[^a-z0-9ñ]+/).forEach(w=>{if(w.length>=4&&!/\d/.test(w))S.add(w)}));return VOC=[...S]};
function spLev(a,b,mx){if(Math.abs(a.length-b.length)>mx)return mx+1;let p=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const c=[i];let lo=i;for(let j=1;j<=b.length;j++){c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));lo=Math.min(lo,c[j])}if(lo>mx)return mx+1;p=c}return p[b.length]}
/* Si no hay resultados, prueba con la palabra más parecida (errores de tipeo) */
function spCorregir(q){const I=spIndice();let cam=false;const out=spN(q).split(/\s+/).map(w=>{if(w.length<4||/\d/.test(w)||SP_STOP.has(w)||I.some(x=>x.nx.includes(w)))return w;let b=null,bd=3;spVoc().forEach(v=>{const d=spLev(w,v,2);if(d<bd||(d===bd&&b&&v.length<b.length)){bd=d;b=v}});if(b&&bd<=(w.length>6?2:1)){cam=true;return b}return w}).join(' ');return cam?out:null}
function spBuscar(q){const I=spIndice();const nq=spN(q).trim();if(!nq)return [];
 const tk=nq.split(/[^a-z0-9.ñ-]+/).filter(w=>w&&(w.length>1||/\d/.test(w))&&!SP_STOP.has(w));if(!tk.length)return [];
 const preg=spPregunta(q)||tk.length>=3;const need=preg?Math.max(1,Math.ceil(tk.length*.5)):tk.length;
 const st=w=>/\d/.test(w)||w.length<4?w:w.slice(0,w.length<=5?3:w.length-2);const W=tk.map(w=>{const t=st(w);const df=I.filter(x=>x.nx.includes(t)).length;return {t,full:w,idf:Math.log(1+I.length/(1+df))}});
 const TM=spTema(q);const sc=I.map(x=>{let n=0,s=0;W.forEach(({t,full,idf})=>{const inT=x.nt.includes(t),inX=x.nx.includes(t);if(inT||inX){n++;s+=idf*(inT?2.5:1)*(x.nx.includes(full)?1.2:1)}});if(x.nt.startsWith(nq))s+=10;if(x.na&&W.every(w=>x.na.includes(w.full)))s+=x.nb?14:30+x.pr;if(x.ext)s*=.8;if(x.dc)s*=.6;if(x.k==='Recorridos en la norma'){if(TM&&TM.t===x.t){s+=400;n=99}else if(TM)n=-99;else s*=.5}if(x.nt.endsWith(' '+nq)||x.nt===nq)s+=12;return {x,n,s}}).filter(o=>o.n>=need).sort((a,b)=>b.s-a.s||a.x.t.length-b.x.t.length);
 const out=[];const num=/^(reg |rot |rop |ley |art\.? ?)?\d/.test(nq);
 if((preg||num)&&!(!preg&&sc[0]&&sc[0].x.url)){const best=sc.find(o=>o.x.d&&(num?o.x.ic==='book':true));if(best)out.push({...best.x,k:'resp',orig:best.x})}
 const per={};sc.forEach(({x})=>{per[x.k]=(per[x.k]||0)+1;if(per[x.k]<=4)out.push(x)});
 const best={};sc.forEach(({x,s})=>{if(best[x.k]==null)best[x.k]=s});const gi=k=>k==='resp'?-1e9:-best[k]+ORD.indexOf(k)*1e-3;return out.sort((a,b)=>gi(a.k)-gi(b.k))}
function spResp(x){const o=x.orig;const tx=String(o.d).replace(/\s+/g,' ');const p=tx.length>320?tx.slice(0,320).replace(/\s\S*$/,'')+'…':tx;const base=o.dk?o.dk.split(' · ').filter(Boolean):[];
 return `<div class="sp-ans"><div class="sp-ans-h">${ic('book')}<b>${spEsc(o.t)}</b></div><p>${spEsc(p)}</p>${base.length&&o.ic!=='book'?`<div class="sp-base">Según ${base.map(b=>`<span>${spEsc(b)}</span>`).join('')}</div>`:o.ic==='book'?`<div class="sp-base"><span>${spEsc(o.sub)}</span></div>`:''}<div class="sp-ans-f"><span></span><span class="sp-go">${spEsc(o.gl)} ↵</span></div></div>`}
function spPrev(x){if(!x||!x.d)return '';if(x.dc)return `<div class="sp-pn">${spEsc(x.t)}</div><div class="sp-ptx">${spHL(x.d,SP.hw||[])}</div><div class="sp-pk"><kbd>↵</kbd> ${spEsc(x.gl)}</div>`;return `<div class="sp-pn">${spEsc(x.t)}</div><div class="sp-pd">${spEsc(x.sub)}</div>${x.ph?`<div class="sp-ptx sp-ph">${x.ph}</div>`:`<div class="sp-ptx">${spEsc(x.d)}</div>`}<div class="sp-pk"><kbd>↵</kbd> ${spEsc(x.gl)}${x.url?`<a class="sp-src" href="${spEsc(x.url)}" target="_blank" rel="noopener">Fuente oficial ↗</a>`:''}</div>`}
function spCatData(k){const C=CATS.find(c=>c.k===k);const L=spIndice().filter(x=>x.k===C.g).map(x=>({...x,tile:C.tile||'app',ext:C.ext}));const chips=[...new Set(L.map(x=>x.grp).filter(Boolean))].slice(0,7);
 if(C.agrupar){const G=[];L.forEach(x=>{let g=G.find(z=>z[0]===x.grp);if(!g)G.push(g=[x.grp,[]]);g[1].push({...x,sh:1})});return {chips,secs:G,all:L}}
 return {chips,secs:[['Sugerencias',L.slice(0,5)],['Todos',L.slice(5,40)]],all:L}}
function spTile(x,i){const vis=x.av?`<span class="sp-av" style="--h:${x.av[1]}">${spEsc(x.av[0])}</span>`:x.tile==='file'?`<span class="sp-file"><i></i><i></i><i></i><i></i>${x.ext?`<em>${spEsc(x.ext)}</em>`:''}</span>`:`<span class="sp-app">${ic(x.ic||'grid')}</span>`;return `<button class="sp-t ${i===SP.i?'on':''}" data-spi="${i}" style="animation-delay:${Math.min(i,14)*18}ms">${vis}<span class="sp-tn">${spEsc(x.t)}</span>${x.tl?`<span class="sp-ts">${spEsc(x.tl)}</span>`:x.grp&&!x.sh?`<span class="sp-ts">${spEsc(x.grp)}</span>`:''}</button>`}
function spPintar(){const el=$('#spot'),box=$('#spRes');if(!box)return;const q=SP.q;el.classList.toggle('hasq',!!q.trim());el.classList.toggle('incat',!!SP.cat);el.classList.toggle('guia',!!SP.hint&&!SP.cat&&!q.trim());
 const C=CATS.find(c=>c.k===SP.cat);$('#spLead').innerHTML=ic(C?C.ic:'search');$('#spIn').placeholder=C?C.t:(window.SPOT_PH||'Búsqueda');
 const open=SP.hint||!!SP.cat||!!q.trim();el.classList.toggle('open',open);let h='';SP.items=[];
 if(SP.hint&&!SP.cat&&!q.trim()){const rec=spRecGet(),sug=(window.SPOT_SUG||['Reg 81.1','Cuenta especial por consumo','CIC sin herederos','Anexo 3']).filter(x=>!rec.some(r=>spN(r)===spN(x))).slice(0,4);
  const fila=(t,L,icn)=>L.length?`<div class="sp-sh">${t}</div><div class="sp-rec">${L.map(x=>`<button class="sp-rq" data-spq="${spEsc(x)}">${ic(icn)}<span>${spEsc(x)}</span></button>`).join('')}</div>`:'';
  const yo=decodeURIComponent(location.pathname.split('/').pop()),pg=window.SPOT_SOLO?[]:AN_PG.filter(x=>x[0]!==yo);
  const G=(window.SPOT_GUIA&&window.SPOT_GUIA())||[];SP.ng=G.length;
  const gh=G.length?`<div class="sp-sh">¿Qué quieres hacer?</div><div class="sp-guia">${G.map((x,n)=>{SP.items.push(x);return `<button class="sp-g ${x.prin?'prin':''} ${n===SP.i?'on':''}" data-spi="${n}" style="animation-delay:${n*35}ms"><span class="sp-gi">${ic(x.ic||'grid')}</span><span class="sp-gt"><b>${spEsc(x.t)}</b>${x.s?`<span>${spEsc(x.s)}</span>`:''}</span></button>`}).join('')}</div>`:'';
  h=gh+fila('Recientes',rec,'clock')+fila('Sugerencias',sug,'search')+(pg.length?`<div class="sp-sh">Páginas</div><div class="sp-rec">${pg.map(([f,tt,i])=>`<button class="sp-rq pag" data-sppag="${spEsc(f)}">${ic(i)}<span>${spEsc(tt)}</span></button>`).join('')}</div>`:'')+(CATS.length?`<div class="sp-kfila">${CATS.map((c,n)=>`<button data-spcat="${c.k}" title="${spEsc(c.t)}"><kbd>Ctrl ${n+1}</kbd>${spEsc(c.t)}</button>`).join('')}</div>`:'')}
 else if(SP.cat){const D=spCatData(SP.cat);const nq=spN(q).trim();const fil=x=>(!SP.f||x.grp===SP.f)&&(!nq||spN(x.t+' '+(x.sub||'')).includes(nq));
  h=D.chips.length?`<div class="sp-chips">${D.chips.map(c=>`<button class="sp-chip ${SP.f===c?'on':''}" data-spf="${spEsc(c)}">${spEsc(c)}</button>`).join('')}</div>`:'';
  const secs=(nq||SP.f)?[['Resultados',D.all.filter(fil).slice(0,20)]]:D.secs.filter(s=>s[1].length);
  secs.forEach(([t,L])=>{if(!L.length)return;h+=`<div class="sp-sh">${t}</div><div class="sp-grid">${L.map(x=>{SP.items.push(x);return spTile(x,SP.items.length-1)}).join('')}</div>`});
  if(!SP.items.length)h+=`<div class="sp-none">Sin resultados${q.trim()?' para «'+spEsc(q)+'»':''}</div>`}
 else if(q.trim()){let R=spBuscar(q),cq=null;if(!R.length){cq=spCorregir(q);if(cq)R=spBuscar(cq)}SP.items=R;SP.i=Math.min(SP.i,Math.max(0,R.length-1));const HW=spN(cq||q).split(/[^a-z0-9.ñ-]+/).filter(w=>w&&(w.length>1||/\d/.test(w))&&!SP_STOP.has(w));SP.hw=HW;
  if(!R.length)h=`<div class="sp-none">Sin resultados para «${spEsc(q)}»</div>`+(SP.cat?'':`<div class="sp-kfila sp-kfila-c">${CATS.map((c,n)=>`<button data-spcat="${c.k}"><kbd>Ctrl ${n+1}</kbd>${spEsc(c.t)}</button>`).join('')}</div>`);
  else{let g='';if(cq)h=`<div class="sp-corr">Resultados para <b>${spEsc(cq)}</b></div>`;const pv=R.some(x=>x.d&&x.k!=='resp');h+=(pv?'<div class="sp-split">':'')+'<div class="sp-list">'+R.map((x,i)=>{const gh=x.k!==g?`<div class="sp-gh">${spEsc(x.k==='resp'?'Respuesta':x.k)}</div>`:'';g=x.k;if(x.k==='resp')return gh+`<div class="sp-row resp ${i===SP.i?'on':''}" data-spi="${i}">${spResp(x)}</div>`;return gh+`<div class="sp-row ${i===SP.i?'on':''}" data-spi="${i}"><span class="sp-ic">${ic(x.ic||'doc')}</span><span class="sp-tx"><b>${spHL(x.t,HW)}</b><span>${x.dc?spSnip(x.d,HW):spHL(x.sub||'',HW)}</span></span><span class="sp-k">${spEsc(x.kl)}</span></div>`}).join('')+'</div>'+(pv?`<div class="sp-prev" id="spPrev">${spPrev(R[SP.i]&&R[SP.i].k!=='resp'?R[SP.i]:R.find(x=>x.d&&x.k!=='resp'))}</div></div>`:'')}}
 const key=(SP.hint?'h':'')+(SP.cat||'')+'|'+(SP.f||'');box.innerHTML=`<div class="${box.dataset.k!==key?'sp-swap':''}">${h}</div>`;box.dataset.k=key;
 $$('[data-spi]',box).forEach(r=>{r.onmouseenter=()=>{SP.i=+r.dataset.spi;$$('[data-spi]',box).forEach(z=>z.classList.toggle('on',z===r));const pe=$('#spPrev',box),it=SP.items[SP.i];if(pe&&it&&it.d&&it.k!=='resp')pe.innerHTML=spPrev(it)};r.onclick=()=>spIr(+r.dataset.spi)});
 $$('[data-spf]',box).forEach(b=>b.onclick=()=>{SP.f=SP.f===b.dataset.spf?'':b.dataset.spf;SP.i=0;spPintar();$('#spIn').focus()});
 $$('[data-spcat]',box).forEach(b=>b.onclick=()=>spCat(b.dataset.spcat));
 $$('[data-sppag]',box).forEach(b=>b.onclick=()=>{location.href=encodeURI(b.dataset.sppag)});$$('[data-spq]',box).forEach(b=>b.onclick=()=>{const inp=$('#spIn');inp.value=SP.q=b.dataset.spq;SP.i=0;SP.hint=false;spPintar();inp.focus()});
 const on=$('[data-spi].on',box);if(on)on.scrollIntoView({block:'nearest'})}
function spCat(k){SP.cat=SP.cat===k?null:k;SP.f='';SP.q='';SP.i=0;SP.hint=!SP.cat;const inp=$('#spIn');inp.value='';spPintar();inp.focus()}
function spIr(i){const x=SP.items[i];if(!x)return;spTic('clic');window.__spIr=1;setTimeout(()=>{window.__spIr=0},700);if(SP.q.trim())spRecAdd(SP.q);const r=$(`#spRes [data-spi="${i}"]`);if(r){r.classList.remove('sp-press');void r.offsetWidth;r.classList.add('sp-press')}const o=x.k==='resp'?x.orig:x;setTimeout(()=>{spCerrar();setTimeout(()=>{try{o.go()}catch(e){console.error(e)}},200)},170)}
const spTemaGet=()=>'oscuro';function spTemaPon(t){try{localStorage.setItem('spTema2',t)}catch(e){}const el=$('#spot');if(!el)return;el.classList.toggle('claro',t==='claro');const b=$('#spTema');if(b){b.innerHTML=ic(t==='claro'?'moon':'sun');const tp=b.nextElementSibling;if(tp)tp.textContent=t==='claro'?'Búsqueda oscura':'Búsqueda clara'}}
/* Sonido (Web Audio, sin archivos). Toque redondo: seno con un armónico suave, ataque 3 ms, caída exponencial corta,
   paso bajo a 3 kHz (sin energía en la zona áspera de 2-4 kHz), volumen bajo. Suena recién tras el primer clic o tecla. */
const SON={gota:{t:'Gota',f:880,h:2,ha:.12,d:.06,lp:2600,gl:.94},cristal:{t:'Cristal',f:1000,h:2.76,ha:.07,d:.08,lp:3000,gl:1},madera:{t:'Madera',f:800,h:2.4,ha:.16,d:.05,lp:2000,gl:.97}};
const SON_ORD=['gota','cristal','madera','off'];
const spSonV=()=>{try{const v=localStorage.getItem('spSonV');if(v&&SON_ORD.includes(v))return v;return localStorage.getItem('spSon')==='0'?'off':'gota'}catch(e){return 'gota'}};
const spSonOn=()=>spSonV()!=='off';const spSonSet=v=>{try{localStorage.setItem('spSonV',v)}catch(e){}};
let spAC=null;const spACget=()=>{if(!spAC){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;try{spAC=new C()}catch(e){return null}}if(spAC.state==='suspended')spAC.resume().catch(()=>{});return spAC};
['pointerdown','keydown'].forEach(ev=>window.addEventListener(ev,()=>{if(spSonOn())spACget()},{capture:true,passive:true}));
function spNota(a,v,f,t0,dur,vol){const t=a.currentTime+t0,o=a.createOscillator(),o2=a.createOscillator(),g=a.createGain(),g2=a.createGain(),lp=a.createBiquadFilter();
 lp.type='lowpass';lp.frequency.value=v.lp;lp.Q.value=.5;o.type=o2.type='sine';o.frequency.setValueAtTime(f,t);if(v.gl!==1)o.frequency.exponentialRampToValueAtTime(f*v.gl,t+.03);o2.frequency.setValueAtTime(f*v.h,t);g2.gain.value=v.ha;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g);o2.connect(g2);g2.connect(g);g.connect(lp);lp.connect(a.destination);o.start(t);o2.start(t);o.stop(t+dur+.02);o2.stop(t+dur+.02)}
let spTicT=0;
function spTic(tipo,forzar){const k=forzar||spSonV();if(k==='off')return;const a=spAC;if(!a||a.state!=='running')return;const v=SON[k];const q=2/3;
 if(tipo==='tic'){const n=performance.now();if(n-spTicT<300)return;spTicT=n;spNota(a,v,v.f*(1+(Math.random()*2-1)*.025),0,v.d,.05)}
 else if(tipo==='clic')spNota(a,v,v.f*q,0,v.d*1.5,.065);
 else if(tipo==='abrir'){spNota(a,v,v.f*q,0,v.d*1.2,.05);spNota(a,v,v.f,.07,v.d*1.4,.05)}
 else if(tipo==='cerrar'){spNota(a,v,v.f,0,v.d*1.1,.04);spNota(a,v,v.f*q,.07,v.d*1.4,.04)}}
const spSonPinta=()=>{const b=$('#spSon');if(!b)return;const k=spSonV();b.innerHTML=k!=='off'?'<svg class="i" viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>':'<svg class="i" viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>';const tp=b.nextElementSibling;if(tp)tp.textContent=k==='off'?'Sin sonido':'Sonido · '+SON[k].t};
window.spTic=spTic;
/* modo enfoque: con un documento abierto, la esfera y el fondo se quedan quietos */
setInterval(()=>{const v=document.getElementById('spVer');document.body.classList.toggle('sp-foco',!!(v&&v.classList.contains('on')))},250);
/* Cielo del Buscador: campana pentatónica según la posición del clic y un soplo muy suave al arrastrar */
const PENTA=[1,9/8,5/4,3/2,5/3,2,9/4,5/2,3,10/3];let spCampT=0,spSopT=0;
function spSuena(fn){const k=spSonV();if(k==='off')return;const a=spACget();if(!a)return;if(a.state==='running')fn(a,SON[k],k);else a.resume().then(()=>fn(a,SON[k],k)).catch(()=>{})}
/*@est*/function spEstallido(a,t,x,y,k){k=k||'gota';const out=a.createGain(),lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3800;lp.Q.value=.4;out.connect(lp);
 let dst=a.destination;if(a.createStereoPanner){const pn=a.createStereoPanner();pn.pan.value=Math.max(-.4,Math.min(.4,(x-.5)*.8));lp.connect(pn);pn.connect(a.destination)}else lp.connect(a.destination);
 const env=(g,pk,at,dur)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(pk,t+at);g.gain.exponentialRampToValueAtTime(.00008,t+dur)};
 const tono=(f,pk,at,dur,dt)=>{const o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(f,t);if(dt)o.detune.setValueAtTime(dt,t);env(g,pk,at,dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.05)};
 const aire=(pk,at,dur,f0,f1)=>{const W=a.__spRuidoB||(a.__spRuidoB=(()=>{const L=a.sampleRate*3,b=a.createBuffer(1,L,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<L;i++)d[i]=Math.random()*2-1;return b})());
  const n=a.createBufferSource(),bp=a.createBiquadFilter(),g=a.createGain();n.buffer=W;bp.type='bandpass';bp.Q.value=1.2;bp.frequency.setValueAtTime(f0,t);bp.frequency.exponentialRampToValueAtTime(f1,t+dur);env(g,pk,at,dur);n.connect(bp);bp.connect(g);g.connect(out);n.start(t,Math.random());n.stop(t+dur+.05)};
 const h=1+(1-y)*.12;
 if(k==='cristal'){[[1046.5,.008],[1568,.006],[2093,.004],[2637,.0025]].forEach(([f,v],i)=>tono(f*h,v,.05+i*.03,2.2-i*.25,(Math.random()-.5)*8));aire(.0025,.12,1.6,5200,2600)}
 else if(k==='madera'){tono(523.3*h,.009,.08,1.6);tono(784*h,.004,.12,1.3,4);aire(.002,.15,1.2,1800,900)}
 else{aire(.006,.09,1.8,3400,1300);tono(1318.5*h,.0035,.1,1.5,(Math.random()-.5)*10)}}/*@fin*/
/*@pol*/function spGranos(a,t,n,x,vol){const f0=[2093,2349,2637,3136,3520];for(let i=0;i<n;i++){const tt=t+Math.random()*.05,f=f0[Math.floor(Math.random()*f0.length)],g=a.createOscillator(),gg=a.createGain(),d=.06+Math.random()*.05,v=vol*(.6+Math.random()*.4);
 g.type='sine';g.frequency.value=f;gg.gain.setValueAtTime(0,tt);gg.gain.linearRampToValueAtTime(v,tt+.006);gg.gain.exponentialRampToValueAtTime(.00008,tt+d);
 let dst=a.destination;if(a.createStereoPanner){const pp=a.createStereoPanner();pp.pan.value=Math.max(-.5,Math.min(.5,(x-.5)*.9));pp.connect(a.destination);dst=pp}g.connect(gg);gg.connect(dst);g.start(tt);g.stop(tt+d+.02)}}/*@fpol*/
let spPolT=0;window.spPolvoSon=function(v,x){const n=performance.now();if(n-spPolT<90)return;spPolT=n;const k=spSonV();if(k==='off')return;const a=spAC;if(!a||a.state!=='running')return;
 const c=Math.min(2,Math.floor(v/16));if(c<1)return;spGranos(a,a.currentTime,c,x/Math.max(1,innerWidth),.0022)};
window.spCampana=function(x,y){const n=performance.now();if(n-spCampT<350)return;spCampT=n;
 spSuena((a,v,k)=>spEstallido(a,a.currentTime+.005,x/Math.max(1,innerWidth),y/Math.max(1,innerHeight),k))};
window.spSoplo=function(){const n=performance.now();if(n-spSopT<900)return;spSopT=n;
 spSuena(a=>{const L=Math.floor(a.sampleRate*.35),b=a.createBuffer(1,L,a.sampleRate),d=b.getChannelData(0);for(let i=0;i<L;i++)d[i]=Math.random()*2-1;
  const s=a.createBufferSource(),bp=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime;s.buffer=b;bp.type='bandpass';bp.Q.value=.8;bp.frequency.setValueAtTime(700,t);bp.frequency.exponentialRampToValueAtTime(1500,t+.3);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.004,t+.1);g.gain.exponentialRampToValueAtTime(.0001,t+.34);s.connect(bp);bp.connect(g);g.connect(a.destination);s.start(t);s.stop(t+.36)})};

function spAbrir(){let el=$('#spot');if(el&&el.classList.contains('on')&&!el.classList.contains('out')){spCerrar();return}
 if(!el){el=document.createElement('div');el.id='spot';el.className='spot';el.innerHTML=`<div class="sp-stage"><div class="sp-box sp-glass" role="dialog" aria-label="Búsqueda"><div class="sp-in"><span class="sp-lead" id="spLead"></span><input id="spIn" autocomplete="off" spellcheck="false"><button class="sp-x" id="spX" aria-label="Borrar">${ic('x')}</button></div><div class="sp-body"><div><div class="sp-scroll" id="spRes"></div></div></div></div><div class="sp-cats">${CATS.map((c,n)=>`<div class="sp-cw"><button class="sp-cat sp-glass" data-spc="${c.k}" aria-label="${c.t}">${ic(c.ic)}</button><span class="sp-tip">${c.t} · Ctrl+${n+1}</span></div>`).join('')}<div class="sp-cw"><button class="sp-cat sp-glass" id="spSon" aria-label="Sonido"></button><span class="sp-tip">Sonido</span></div><div class="sp-cw"><button class="sp-cat sp-glass" id="spTema" aria-label="Claro u oscuro"></button><span class="sp-tip">Claro u oscuro</span></div></div></div>`;document.body.appendChild(el);
  el.onmousedown=e=>{if(Date.now()-(window.__spT||0)<600)return;if(!e.target.closest('.sp-box,.sp-cat'))spCerrar()};spTemaPon(spTemaGet());$$('[data-spc]',el).forEach(b=>b.onclick=()=>spCat(b.dataset.spc));
  spSonPinta();$('#spSon').onclick=()=>{const k=SON_ORD[(SON_ORD.indexOf(spSonV())+1)%SON_ORD.length];spSonSet(k);spSonPinta();spACget();if(k!=='off')setTimeout(()=>spTic('abrir',k),30);$('#spIn').focus()};$('#spTema').onclick=()=>{spTemaPon(spTemaGet()==='claro'?'oscuro':'claro');$('#spIn').focus()};
  $('#spX').onclick=()=>{if(SP.q){SP.q='';$('#spIn').value=''}else{SP.cat=null;SP.f=''}SP.i=0;SP.hint=!SP.cat;spPintar();$('#spIn').focus()};
  const inp=$('#spIn');inp.oninput=()=>{SP.q=inp.value;SP.i=0;SP.hint=!SP.q&&!SP.cat;spPintar()};
  inp.onkeydown=e=>{const n=SP.items.length;const guia=SP.hint&&!SP.cat&&!SP.q.trim()&&SP.ng;const grid=!!SP.cat||!!guia;const fil=guia?(window.innerWidth<560?2:3):5;
   if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(SP.q){SP.q='';inp.value='';SP.hint=!SP.cat;spPintar()}else if(SP.cat){SP.cat=null;SP.f='';SP.hint=true;spPintar()}else spCerrar();return}
   if(e.key==='Backspace'&&!inp.value&&SP.cat){e.preventDefault();SP.cat=null;SP.f='';SP.hint=true;spPintar();return}
   if(!n)return;const mv=d=>{e.preventDefault();SP.i=(SP.i+d+n)%n;spPintar()};
   if(e.key==='ArrowDown')mv(grid?Math.min(fil,n-SP.i-1)||1:1);else if(e.key==='ArrowUp')mv(grid?-Math.min(fil,SP.i)||-1:-1);else if(grid&&e.key==='ArrowRight'&&!inp.value)mv(1);else if(grid&&e.key==='ArrowLeft'&&!inp.value)mv(-1);else if(e.key==='Enter'){e.preventDefault();spIr(SP.i)}}}
 SP.cat=SP.cat&&!SP.q?SP.cat:null;SP.f='';SP.i=0;SP.hint=!SP.cat;
 window.__spT=Date.now();el.classList.remove('out','open','orbe');void el.offsetWidth;el.classList.add('on');$$('.sp-box,.sp-cat',el).forEach(b=>{b.style.animation='none';void b.offsetWidth;b.style.animation=''});
 const inp=$('#spIn');inp.value=SP.q;SP.hint=!SP.q&&!SP.cat;spPintar();inp.focus();inp.select();setTimeout(()=>inp.focus(),30)}
function spCerrar(){const el=$('#spot');if(!el||!el.classList.contains('on'))return;if(!window.__spIr)spTic('cerrar');try{localStorage.setItem('spQ',SP.q||'')}catch(e){}el.classList.add('out');setTimeout(()=>{el.classList.remove('on','out','open')},190)}
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopPropagation();spAbrir();return}
 const el=$('#spot');if(!el||!el.classList.contains('on'))return;const m=/^Digit([1-9])$/.exec(e.code);if(m&&(e.ctrlKey||e.metaKey)&&!e.altKey&&!e.shiftKey&&CATS[+m[1]-1]){e.preventDefault();e.stopPropagation();spCat(CATS[+m[1]-1].k)}},true);
window.SPOT_FLASH=el=>{if(!el)return;el.scrollIntoView({block:'center',inline:'center',behavior:'smooth'});el.classList.remove('sp-flash');void el.offsetWidth;el.classList.add('sp-flash');setTimeout(()=>el.classList.remove('sp-flash'),1900)};
window.spAbrir=spAbrir;
const bt=document.createElement('button');bt.type='button';bt.className='sp-btn';bt.title='Buscar · Ctrl+K';bt.innerHTML=ic('search');bt.onclick=e=>{e.stopPropagation();spAbrir()};
const slot=document.querySelector(window.SPOT_SLOT||'.top-in');if(slot)slot.appendChild(bt);else{bt.style.cssText='position:fixed;top:12px;right:16px;z-index:59';document.body.appendChild(bt)}

/* Recordar dónde estaba: vista, desplazamiento y última búsqueda */
const spKey='spPos:'+decodeURIComponent(location.pathname.split('/').pop());
let spT=0;const spGuardar=()=>{try{const st=window.SPOT_STATE?window.SPOT_STATE.get():null;localStorage.setItem(spKey,JSON.stringify({st,y:window.scrollY,x:window.scrollX,q:SP.q,cat:SP.cat}));localStorage.setItem('spQ',SP.q||'')}catch(e){}};
window.addEventListener('scroll',()=>{clearTimeout(spT);spT=setTimeout(spGuardar,250)},{passive:true});
window.addEventListener('pagehide',spGuardar);document.addEventListener('visibilitychange',()=>{if(document.hidden)spGuardar()});
document.addEventListener('click',()=>setTimeout(spGuardar,400),true);
const spGo=/#spgo=(\d+)/.exec(location.hash);
(function(){let o=null;try{o=JSON.parse(localStorage.getItem(spKey)||'null')}catch(e){}try{SP.q=localStorage.getItem('spQ')||(o&&o.q)||''}catch(e){}
 if(spGo){history.replaceState(null,'',location.pathname+location.search);setTimeout(()=>{try{const it=window.SPOT_ITEMS()[+spGo[1]];if(it)it.go()}catch(e){console.error(e)}},250);return}
 if(!o)return;
 try{if(o.st&&window.SPOT_STATE)window.SPOT_STATE.set(o.st)}catch(e){console.error(e)}
 SP.cat=CATS.some(c=>c.k===o.cat)?o.cat:null;
 const y=+o.y||0,x=+o.x||0;if(y||x){let n=0;const go=()=>{window.scrollTo(x,y);if(++n<6&&Math.abs(window.scrollY-y)>2)setTimeout(go,120)};setTimeout(go,60)}})();

/* Orbe flotante: abre la búsqueda desde cualquier punto y sigue ahí al pasar a otra página */
const orb=document.createElement('div');orb.setAttribute('role','button');orb.tabIndex=0;orb.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();spVuela()}});orb.className='sp-orb';orb.title='Buscar · Ctrl+K';orb.setAttribute('aria-label','Buscar');orb.innerHTML='<span class="sp-tag">Buscar <kbd>Ctrl K</kbd></span><span class="sp-ondas"><i></i><i></i><i></i><i></i></span><span class="sp-lens"><canvas width="132" height="132"></canvas><b></b></span>';document.body.appendChild(orb);if(window.self!==window.top){orb.style.display='none';document.documentElement.classList.add('sp-embebida')}
/* Esfera sobria: una sola luz azul que se desplaza despacio dentro del vidrio */
(function(){const cv=orb.querySelector('canvas');if(!cv||!cv.getContext)return;const g=cv.getContext('2d'),W=cv.width,C=W/2;
 const quieto=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 let t=Math.random()*50,v=1,vt=1,k=1,kt=1,last=performance.now();orb.__spAnim=(sp,int)=>{vt=Math.min(sp,2.2);kt=Math.min(int,1.3)};
 orb.addEventListener('pointerenter',()=>{vt=1.6;kt=1.15;if(window.spTic)window.spTic('tic');orb.classList.remove('tic');void orb.offsetWidth;orb.classList.add('tic')});orb.addEventListener('pointerleave',()=>{vt=1;kt=1});
 function f(now){const dt=Math.min(64,now-last)/1000;last=now;v+=(vt-v)*.05;k+=(kt-k)*.05;if(!quieto&&!document.body.classList.contains('sp-foco'))t+=dt*v*.35;
  if(!orb.classList.contains('oculto')&&!document.hidden){g.globalCompositeOperation='source-over';const bg=g.createRadialGradient(C*.8,C*.6,0,C,C,C);bg.addColorStop(0,'#3a3e46');bg.addColorStop(.7,'#22252b');bg.addColorStop(1,'#16181c');g.fillStyle=bg;g.fillRect(0,0,W,W);
   const x=C+Math.sin(t)*C*.32,y=C+Math.cos(t*.8)*C*.26+C*.1,r=C*(.7+.06*Math.sin(t*1.7));const gr=g.createRadialGradient(x,y,0,x,y,r);
   gr.addColorStop(0,`rgba(236,206,160,${.95*k})`);gr.addColorStop(.5,`rgba(176,120,70,${.33*k})`);gr.addColorStop(1,'rgba(176,120,70,0)');g.globalCompositeOperation='lighter';g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,7);g.fill()}
  if(!quieto||vt!==1)requestAnimationFrame(f);else setTimeout(()=>requestAnimationFrame(f),500)}requestAnimationFrame(f)})();
try{const p=JSON.parse(localStorage.getItem('spOrb')||'null');if(p&&p.r>=0&&p.b>=0){orb.style.right=Math.min(p.r,innerWidth-70)+'px';orb.style.bottom=Math.min(p.b,innerHeight-70)+'px'}}catch(e){}
try{if(spGo||localStorage.getItem('spLlega')){localStorage.removeItem('spLlega');orb.classList.add('llega');setTimeout(()=>orb.classList.remove('llega'),2600)}}catch(e){}
let od=null;orb.addEventListener('pointerdown',e=>{if(e.button!==0)return;od={x:e.clientX,y:e.clientY,r:parseFloat(getComputedStyle(orb).right),b:parseFloat(getComputedStyle(orb).bottom),m:false};orb.setPointerCapture(e.pointerId)});
orb.addEventListener('pointermove',e=>{if(!od)return;const dx=e.clientX-od.x,dy=e.clientY-od.y;if(!od.m&&Math.hypot(dx,dy)<5)return;od.m=true;orb.classList.add('mueve');orb.style.right=Math.max(8,Math.min(innerWidth-70,od.r-dx))+'px';orb.style.bottom=Math.max(8,Math.min(innerHeight-70,od.b-dy))+'px'});
orb.addEventListener('dblclick',e=>e.preventDefault());orb.addEventListener('pointerup',e=>{if(!od)return;const m=od.m;od=null;orb.classList.remove('mueve');if(m){try{localStorage.setItem('spOrb',JSON.stringify({r:parseFloat(orb.style.right),b:parseFloat(orb.style.bottom)}))}catch(_){}return}spVuela()});
/* La lupa viaja hasta la barra de búsqueda y luego regresa a su sitio */
let spDest=null,spAbierta=false,spVolando=false;
const spDelta=()=>{const a=orb.getBoundingClientRect(),l=$('#spLead');if(!l)return null;const b=l.getBoundingClientRect();return {x:b.left+b.width/2-(a.left+a.width/2),y:b.top+b.height/2-(a.top+a.height/2),s:Math.max(.4,b.width/a.width)}};
/* Clic en la esfera: se hunde un instante y la barra nace desde ella; al cerrar, vuelve a ella */
function spVuela(){if(spVolando)return;spVolando=true;spTic('abrir');if(orb.__spAnim)orb.__spAnim(2,1.3);orb.classList.add('pulsa');
 setTimeout(()=>{orb.classList.remove('pulsa');spAbrir();const el=$('#spot'),bx=el&&$('.sp-box',el);
  if(bx){const a=orb.getBoundingClientRect(),b=bx.getBoundingClientRect();el.style.setProperty('--ox',(a.left+a.width/2-b.left)+'px');el.style.setProperty('--oy',(a.top+a.height/2-b.top)+'px');el.classList.add('orbe')}
  spAbierta=!!el&&el.classList.contains('on');orb.classList.toggle('oculto',spAbierta);spVolando=false;setTimeout(()=>orb.__spAnim&&orb.__spAnim(1,1),600)},90)}
function spRegresa(){orb.classList.remove('oculto','nace');void orb.offsetWidth;orb.classList.add('nace');setTimeout(()=>orb.classList.remove('nace'),700)}
new MutationObserver(()=>{if(spVolando)return;const el=$('#spot');const ab=!!el&&el.classList.contains('on')&&!el.classList.contains('out');if(ab===spAbierta)return;spAbierta=ab;
 if(ab){if(!spDest){const lead=$('#spLead');if(lead){spDest=spDelta()}}orb.classList.add('oculto')}else spRegresa()}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});

/* Búsqueda flotante fuera del navegador (Chrome y Edge): ventana que queda encima de todo */
const spPipOK='documentPictureInPicture' in window;
async function spFlotar(){if(!spPipOK)return;if(window.__spPip&&!window.__spPip.closed){window.__spPip.focus();return}
 let w;try{w=await documentPictureInPicture.requestWindow({width:400,height:560})}catch(e){console.error(e);return}window.__spPip=w;spCerrar();
 const d=w.document;d.title=window.SPOT_TIT||'Búsqueda';const st=d.createElement('style');st.textContent=`*{box-sizing:border-box}body{margin:0;font:13px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;background:#2c2c30;color:#fff;-webkit-font-smoothing:antialiased;height:100vh;display:flex;flex-direction:column}
 .h{display:flex;align-items:center;gap:10px;padding:14px 16px 12px;border-bottom:1px solid rgba(255,255,255,.12)}.h svg{width:20px;height:20px;fill:none;stroke:rgba(255,255,255,.8);stroke-width:2;stroke-linecap:round;flex:none}
 input{flex:1;min-width:0;background:none;border:0;outline:0;color:#fff;font:300 20px/1.2 inherit;font-family:inherit}input::placeholder{color:rgba(255,255,255,.45)}
 .r{flex:1;overflow:auto;padding:6px 8px 12px}.g{font-size:11.5px;font-weight:600;color:rgba(255,255,255,.55);padding:12px 8px 5px}
 .i{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:11px;cursor:pointer}.i.on{background:rgba(255,255,255,.14)}.i svg{width:17px;height:17px;flex:none;margin-top:1px;fill:none;stroke:rgba(255,255,255,.8);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
 .i b{display:block;font-weight:500;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.i span{display:block;font-size:12px;color:rgba(255,255,255,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.i div{min-width:0}
 .e{padding:24px 10px;color:rgba(255,255,255,.55)}.p{font-size:11px;color:rgba(255,255,255,.45);padding:8px 16px;border-top:1px solid rgba(255,255,255,.1)}`;
 d.head.appendChild(st);d.body.innerHTML=`<div class="h">${ic('search','x')}<input placeholder="${spEsc(window.SPOT_PH||'Buscar')}" spellcheck="false" autocomplete="off"></div><div class="r"></div><div class="p">Queda encima de todo · ↵ abre en el navegador</div>`;
 const inp=d.querySelector('input'),R=d.querySelector('.r');let L=[],k=0;
 const pinta=()=>{const q=inp.value;SP.q=q;try{localStorage.setItem('spQ',q)}catch(e){}L=q.trim()?spBuscar(q).filter(x=>x.k!=='resp'):[];k=Math.min(k,Math.max(0,L.length-1));let g='';
  R.innerHTML=!q.trim()?`<div class="e">${spEsc(window.SPOT_PIPH||'')}</div>`:!L.length?`<div class="e">Sin resultados para «${spEsc(q)}»</div>`:L.map((x,i)=>{const h=x.k!==g?`<div class="g">${spEsc(x.k)}</div>`:'';g=x.k;return h+`<div class="i ${i===k?'on':''}" data-i="${i}">${ic(x.ic||'doc','x')}<div><b>${spEsc(x.t)}</b><span>${spEsc(x.sub||'')}</span></div></div>`}).join('');
  const on=R.querySelector('.on');if(on)on.scrollIntoView({block:'nearest'})};
 const ve=i=>{const x=L[i];if(!x)return;if(x.href){window.open(x.href,'_blank')}else{try{window.focus()}catch(e){}try{x.go()}catch(e){console.error(e)}}};
 inp.oninput=()=>{k=0;pinta()};inp.onkeydown=e=>{if(e.key==='ArrowDown'&&L.length){e.preventDefault();k=(k+1)%L.length;pinta()}else if(e.key==='ArrowUp'&&L.length){e.preventDefault();k=(k-1+L.length)%L.length;pinta()}else if(e.key==='Enter'){e.preventDefault();ve(k)}};
 R.onclick=e=>{const r=e.target.closest('.i');if(r)ve(+r.dataset.i)};R.onmousemove=e=>{const r=e.target.closest('.i');if(r&&+r.dataset.i!==k){k=+r.dataset.i;R.querySelectorAll('.i').forEach(z=>z.classList.toggle('on',z===r))}};
 inp.value=SP.q||'';pinta();inp.focus();w.addEventListener('pagehide',()=>{window.__spPip=null;orb.classList.remove('flota')});orb.classList.add('flota')}
window.spFlotar=spFlotar;
if(spPipOK){const fb=document.createElement('button');fb.type='button';fb.className='sp-flotar';fb.title='Mantener la búsqueda flotando encima de todo';fb.innerHTML=`<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5"/><rect x="12" y="11" width="7" height="6" rx="1.2"/></svg><span>Flotar</span>`;orb.appendChild(fb);
 fb.addEventListener('pointerdown',e=>e.stopPropagation());fb.addEventListener('pointerup',e=>e.stopPropagation());fb.addEventListener('click',e=>{e.stopPropagation();spFlotar()})}
function spTema(){return null}
/* Anillo de acciones (clic derecho o mantener presionada la esfera), como el anillo del mouse */
const AN_PG=[];const AN_PG_OLD=[['Recaudación y control Ley 32123.html','Recaudación','chart'],['Flujo del aporte por consumo.html','Flujo','layers'],['Mapa de interoperabilidad Ley 32123.html','Mapa','grid'],['Trámite en la EAF.html','Trámite 3D','cubo']];
window.__spWins=window.__spWins||[];
function spCerrarTodo(){const v=$('#spVer');if(v&&v.classList.contains('on')){v.classList.remove('on');const f=$('#spVerF');if(f)f.removeAttribute('src')}
 spCerrar();try{if(window.__spPip&&!window.__spPip.closed)window.__spPip.close()}catch(e){}
 window.__spWins.forEach(w=>{try{if(w&&!w.closed)w.close()}catch(e){}});window.__spWins=[];
 $$('.pop.on,.pop.show,#pop.on').forEach(p=>p.classList.remove('on','show'))}
function spConCat(k){spAbrir();setTimeout(()=>{if(!CATS.some(c=>c.k===k))return;SP.cat=null;spCat(k)},120)}
function spAnAcciones(){const A=[{t:'Cerrar todo',i:'x',f:spCerrarTodo,c:'cerrar'},{t:'Buscar',i:'search',f:()=>spVuela()}];(window.SPOT_ACCIONES?window.SPOT_ACCIONES():[]).forEach(a=>A.push(a));
 A.push({t:'Sonido',i:'bell',f:()=>{const k=SON_ORD[(SON_ORD.indexOf(spSonV())+1)%SON_ORD.length];spSonSet(k);spSonPinta();if(k!=='off')setTimeout(()=>spTic('abrir',k),30);return k==='off'?'Sonido apagado':'Sonido: '+SON[k].t},keep:1});
 if(spPipOK)A.push({t:'Flotar',i:'copy',f:()=>spFlotar()});
 return A}
function spAnillo(hold){if(window.self!==window.top)return;let r=$('#spAn');if(r)r.remove();const A=spAnAcciones(),n=A.length,R=n>8?122:108;
 const o=orb.getBoundingClientRect(),m=R+56,cx=Math.max(m,Math.min(innerWidth-m,o.left+o.width/2)),cy=Math.max(m,Math.min(innerHeight-m,o.top+o.height/2));
 r=document.createElement('div');r.id='spAn';r.className='sp-an';r.innerHTML=`<div class="sp-an-pista" style="left:${cx}px;top:${cy}px;width:${2*R+70}px;height:${2*R+70}px"></div><div class="sp-an-c sp-glass" style="left:${cx}px;top:${cy}px"><button class="sp-an-x" aria-label="Cerrar el anillo">${ic('x')}</button><span class="sp-an-l"></span></div>`+
  A.map((a,j)=>{const g=-Math.PI/2+j*2*Math.PI/n,x=cx+R*Math.cos(g),y=cy+R*Math.sin(g);return `<button class="sp-an-b sp-glass${a.c?' sp-an-'+a.c:''}" data-j="${j}" style="left:${x}px;top:${y}px;--dx:${cx-x}px;--dy:${cy-y}px;animation-delay:${j*18}ms" aria-label="${spEsc(a.t)}">${ic(a.i)}</button>`}).join('');
 document.body.appendChild(r);orb.classList.add('anillo');spTic('abrir');const L=$('.sp-an-l',r);
 const fuera=()=>{r.classList.add('out');orb.classList.remove('anillo');document.removeEventListener('keydown',kd,true);setTimeout(()=>r.remove(),220)};
 const kd=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();fuera()}};document.addEventListener('keydown',kd,true);
 r.addEventListener('mousedown',e=>{if(e.target===r)fuera()});r.addEventListener('contextmenu',e=>{e.preventDefault();fuera()});$('.sp-an-x',r).onclick=fuera;
 $$('.sp-an-b',r).forEach(b=>{const a=A[+b.dataset.j];b.onmouseenter=b.onfocus=()=>{L.textContent=a.t;r.classList.add('lbl');if(window.spTic)spTic('tic')};b.onmouseleave=b.onblur=()=>{r.classList.remove('lbl')};
  b.onclick=()=>{spTic('clic');if(a.keep){const s=a.f();if(s){L.textContent=s;r.classList.add('lbl')}return}fuera();setTimeout(a.f,140)}});
 setTimeout(()=>{const b=$('.sp-an-b',r);if(b&&!hold)b.focus({preventScroll:true});r.classList.remove('lbl')},60);
 /* gesto: mantener, deslizar hacia la acción y soltar */
 if(hold){let sel=-1;const BS=$$('.sp-an-b',r);const mv=e=>{const dx=e.clientX-cx,dy=e.clientY-cy,d=Math.hypot(dx,dy);let j=-1;if(d>34){let g=Math.atan2(dy,dx)+Math.PI/2;if(g<0)g+=2*Math.PI;j=Math.round(g/(2*Math.PI/n))%n}
   if(j!==sel){if(sel>-1)BS[sel].classList.remove('sel');sel=j;if(j>-1){BS[j].classList.add('sel');L.textContent=A[j].t;r.classList.add('lbl');spTic('tic')}else r.classList.remove('lbl')}};
  const up=()=>{removeEventListener('pointermove',mv,true);removeEventListener('pointerup',up,true);if(sel>-1)BS[sel].click()};
  addEventListener('pointermove',mv,true);addEventListener('pointerup',up,true)}}
window.spAnillo=spAnillo;window.spConCat=spConCat;
orb.addEventListener('contextmenu',e=>{e.preventDefault();e.stopPropagation();spAnillo()});
let anT=null;orb.addEventListener('pointerdown',e=>{if(e.button!==0)return;clearTimeout(anT);orb.classList.add('carga');anT=setTimeout(()=>{orb.classList.remove('carga');if(od&&!od.m){od=null;orb.classList.remove('mueve');spAnillo(1)}},480)});
orb.addEventListener('pointermove',()=>{if(od&&od.m){clearTimeout(anT);orb.classList.remove('carga')}});orb.addEventListener('pointerup',()=>{clearTimeout(anT);orb.classList.remove('carga')},true);
/* "Abrir aparte" abre una ventana que luego "Cerrar todo" puede cerrar */
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('#spVerA');if(!a)return;e.preventDefault();const w=window.open(a.href,'_blank');if(w)window.__spWins.push(w)},true);
})();
