const $ = (id) => document.getElementById(id);
const searchInput = $('searchInput'), grid = $('deviceGrid');
let devices = [], filtered = [], shown = 18, language = 'en';

const demoDevices = [
 {name:'iPhone 17 Pro',brand:'Apple',type:'phone',processor:'Apple A19 Pro',ram:'12 GB',storage:'256 GB / 512 GB / 1 TB',display:'6.3-inch OLED',year:'2025'},
 {name:'iPhone 16',brand:'Apple',type:'phone',processor:'Apple A18',ram:'8 GB',storage:'128 GB / 256 GB / 512 GB',display:'6.1-inch OLED',year:'2024'},
 {name:'Samsung Galaxy S25 Ultra',brand:'Samsung',type:'phone',processor:'Snapdragon 8 Elite',ram:'12 GB',storage:'256 GB / 512 GB / 1 TB',display:'6.9-inch AMOLED',year:'2025'},
 {name:'Samsung Galaxy A56',brand:'Samsung',type:'phone',processor:'Exynos 1580',ram:'8 GB',storage:'128 GB / 256 GB',display:'6.7-inch AMOLED',year:'2025'},
 {name:'Google Pixel 9 Pro',brand:'Google',type:'phone',processor:'Google Tensor G4',ram:'16 GB',storage:'128 GB / 256 GB / 512 GB / 1 TB',display:'6.3-inch OLED',year:'2024'},
 {name:'Xiaomi 15',brand:'Xiaomi',type:'phone',processor:'Snapdragon 8 Elite',ram:'12 GB',storage:'256 GB / 512 GB',display:'6.36-inch AMOLED',year:'2025'},
 {name:'OnePlus 13',brand:'OnePlus',type:'phone',processor:'Snapdragon 8 Elite',ram:'12 / 16 GB',storage:'256 / 512 GB / 1 TB',display:'6.82-inch AMOLED',year:'2025'},
 {name:'HP EliteBook 840 G6',brand:'HP',type:'laptop',processor:'Intel Core i5 / i7 8th Gen',ram:'Up to 32 GB',storage:'M.2 SSD',display:'14-inch FHD',year:'2019'},
 {name:'HP Pavilion 15',brand:'HP',type:'laptop',processor:'Intel Core / AMD Ryzen options',ram:'Varies by configuration',storage:'SSD / HDD options',display:'15.6-inch',year:'Various'},
 {name:'Dell XPS 13 9340',brand:'Dell',type:'laptop',processor:'Intel Core Ultra',ram:'16 / 32 GB',storage:'512 GB / 1 TB SSD',display:'13.4-inch',year:'2024'},
 {name:'Lenovo ThinkPad T14 Gen 5',brand:'Lenovo',type:'laptop',processor:'Intel Core Ultra / AMD Ryzen PRO',ram:'Varies by configuration',storage:'SSD',display:'14-inch',year:'2024'},
 {name:'MacBook Air 13 M4',brand:'Apple',type:'laptop',processor:'Apple M4',ram:'16 GB unified memory (base)',storage:'256 GB+ SSD',display:'13.6-inch Liquid Retina',year:'2025'}
];

function clean(v){return String(v??'').trim()}
function norm(v){return clean(v).toLowerCase()}
function uniq(arr){return [...new Set(arr.filter(Boolean))].sort((a,b)=>a.localeCompare(b))}
function addDevice(d){if(!d.name)return; const key=norm(d.name)+'|'+d.type;if(!devices.some(x=>x.key===key)){d.key=key;devices.push(d)}}
function applyFilters(){
 const q=norm(searchInput.value), type=$('typeFilter').value, brand=$('brandFilter').value;
 filtered=devices.filter(d=>(type==='all'||d.type===type)&&(brand==='all'||d.brand===brand)&&(!q||[d.name,d.brand,d.processor,d.ram,d.storage,d.display].some(v=>norm(v).includes(q))));
 if($('sortFilter').value==='brand')filtered.sort((a,b)=>(a.brand||'').localeCompare(b.brand||'')||a.name.localeCompare(b.name));
 else filtered.sort((a,b)=>a.name.localeCompare(b.name));
 shown=18;render();
}
function render(){
 $('deviceCount').textContent=devices.length.toLocaleString();
 $('resultsText').textContent=`Showing ${Math.min(shown,filtered.length)} of ${filtered.length} matching devices`;
 grid.innerHTML='';
 if(!filtered.length){grid.innerHTML='<div class="empty-state"><div class="empty-icon">⌕</div><h3>No matching devices</h3><p>Try another model, brand, processor, or clear the filters.</p></div>';$('moreBtn').hidden=true;return}
 filtered.slice(0,shown).forEach(d=>{
  const card=document.createElement('article');card.className='device-card';card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',`View ${d.name} details`);
  card.innerHTML=`<div class="device-top"><span class="device-type">${d.type==='phone'?'SMARTPHONE':'LAPTOP'}</span><span class="device-brand">${esc(d.brand||'Unknown brand')}</span></div><h3>${esc(d.name)}</h3><div class="specs">${[['CPU',d.processor],['RAM',d.ram],['STORAGE',d.storage]].filter(x=>x[1]).slice(0,3).map(x=>`<span class="spec">${esc(x[0])}: ${esc(x[1])}</span>`).join('')}</div><div class="card-foot">View specifications ↗</div>`;
  card.addEventListener('click',()=>showDetails(d));card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showDetails(d)}});
  grid.appendChild(card);
 });
 $('moreBtn').hidden=shown>=filtered.length;
}
function esc(s){return clean(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function showDetails(d){
 const fields=[['Brand',d.brand],['Category',d.type==='phone'?'Smartphone':'Laptop'],['Processor',d.processor],['RAM',d.ram],['Storage',d.storage],['Display',d.display],['Year',d.year]];
 $('detailContent').innerHTML=`<div class="detail-kicker">DEVICE SPECIFICATIONS</div><h2 class="detail-title">${esc(d.name)}</h2><div class="detail-list">${fields.filter(x=>x[1]).map(x=>`<div class="detail-item"><small>${esc(x[0])}</small><strong>${esc(x[1])}</strong></div>`).join('')}</div><p class="notice">Specifications can differ by region and exact configuration. Verify details with the manufacturer before making a purchase.</p>`;
 $('detailDialog').showModal();
}
function refreshBrands(){
 const current=$('brandFilter').value, brands=uniq(devices.map(d=>d.brand));
 $('brandFilter').innerHTML='<option value="all">All brands</option>'+brands.map(b=>`<option value="${esc(b)}">${esc(b)}</option>`).join('');
 if(brands.includes(current))$('brandFilter').value=current;
}
function parseCSV(text){
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'&&quoted&&n==='"'){cell+='"';i++}else if(c==='"'){quoted=!quoted}else if(c===','&&!quoted){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(cell);if(row.some(v=>clean(v)))rows.push(row);row=[];cell=''}else cell+=c}
 row.push(cell);if(row.some(v=>clean(v)))rows.push(row);
 if(!rows.length)return [];
 const headers=rows.shift().map(h=>norm(h).replace(/[^a-z0-9]+/g,'_'));
 return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,clean(r[i])]))).filter(o=>Object.values(o).some(Boolean));
}
function pick(o,keys){for(const k of keys){if(o[k])return o[k]}return ''}
async function loadCSV(url,kind,limit){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),18000);
 try{
  const res=await fetch(url,{signal:controller.signal,cache:'no-store'});if(!res.ok)throw new Error(`HTTP ${res.status}`);
  const data=parseCSV(await res.text()).slice(0,limit);
  data.forEach(o=>{
   const name=pick(o,['model','name','device_name','laptop_name','phone_name','brand_model','product_name','title']);
   const brand=pick(o,['brand','brand_name','manufacturer','company'])||'Unknown';
   if(!name)return;
   const ram=pick(o,['ram','ram_gb','memory','memory_ram','ram_size']);
   const storage=pick(o,['storage','storage_gb','internal_storage','ssd','capacity']);
   const processor=pick(o,['processor','cpu','chipset','processor_name','cpu_model']);
   const display=pick(o,['display','screen','screen_size','display_size']);
   addDevice({name,brand,type:kind,processor,ram,storage,display,year:pick(o,['year','release_year','launch_year'])});
  });
 }finally{clearTimeout(timer)}
}
async function loadDatabase(){
 const state=$('loadState');
 try{
  const urls=[
   ['https://raw.githubusercontent.com/abhinavflac/smartphone-specs-india/main/data/processed/smartphones_cleaned.csv','phone',500],
   ['https://raw.githubusercontent.com/abhinavflac/laptops-specs-dataset/main/data/processed/laptops_cleaned.csv','laptop',300]
  ];
  const outcomes=await Promise.allSettled(urls.map(x=>loadCSV(...x)));
  if(!devices.length)demoDevices.forEach(d=>addDevice({...d}));
  refreshBrands();applyFilters();
  const good=outcomes.filter(x=>x.status==='fulfilled').length;
  state.innerHTML=good===2?'<span class="pulse"></span> Database loaded':good===1?'<span class="pulse"></span> Partial database loaded':'<span class="pulse"></span> Demo records loaded';
  $('sourceText').textContent=good===2?'Community datasets · up to 800 records':good===1?'One public dataset unavailable · fallback records included':'Live data unavailable · showing built-in sample records';
 }catch(err){
  demoDevices.forEach(d=>addDevice({...d}));refreshBrands();applyFilters();
  state.textContent='Sample catalog ready';$('sourceText').textContent='Built-in sample records';
 }
}
searchInput.addEventListener('input',applyFilters);
$('typeFilter').addEventListener('change',applyFilters);$('brandFilter').addEventListener('change',applyFilters);$('sortFilter').addEventListener('change',applyFilters);
$('clearBtn').addEventListener('click',()=>{searchInput.value='';$('typeFilter').value='all';$('brandFilter').value='all';applyFilters();searchInput.focus()});
$('moreBtn').addEventListener('click',()=>{shown+=18;render()});
$('dialogClose').addEventListener('click',()=>$('detailDialog').close());
$('detailDialog').addEventListener('click',e=>{if(e.target===$('detailDialog'))$('detailDialog').close()});
$('langBtn').addEventListener('click',()=>{
 language=language==='en'?'ar':'en';document.body.dir=language==='ar'?'rtl':'ltr';
 $('langBtn').textContent=language==='ar'?'English':'العربية';
 if(language==='ar'){document.querySelector('.hero h1').innerHTML='اكتشف جهازك<br><span>المناسب.</span>';document.querySelector('.hero-copy').textContent='اكتشف الهواتف والحواسيب وابحث حسب الاسم أو العلامة أو المعالج أو الذاكرة.';document.querySelector('.primary-link').innerHTML='اكتشف الأجهزة <span>↓</span>';document.querySelector('#explore h2').textContent='استكشف قاعدة الأجهزة';}
 else{document.querySelector('.hero h1').innerHTML='Find your next<br><span>device.</span>';document.querySelector('.hero-copy').textContent='Explore smartphones and laptops. Search by model, brand, processor, RAM, or storage.';document.querySelector('.primary-link').innerHTML='Explore devices <span>↓</span>';document.querySelector('#explore h2').textContent='Explore the database';}
});
loadDatabase();
