const map = L.map('map',{worldCopyJump:true,minZoom:2,maxZoom:19,zoomControl:true}).setView([20,0],2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);

const input=document.getElementById('searchInput');
const searchBtn=document.getElementById('searchBtn');
const locateBtn=document.getElementById('locateBtn');
const status=document.getElementById('status');
let marker=null;

function setStatus(text){status.textContent=text;}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

async function searchPlace(){
  const q=input.value.trim();
  if(!q)return;
  setStatus('Searching…');
  try{
    const url='https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(q);
    const response=await fetch(url,{headers:{'Accept-Language':'en'}});
    if(!response.ok)throw new Error('network');
    const results=await response.json();
    if(!results.length){setStatus('Place not found');return;}
    const p=results[0],lat=Number(p.lat),lon=Number(p.lon);
    map.flyTo([lat,lon],Math.max(8,Math.min(13,map.getZoom()+4)),{duration:1.2});
    if(marker)marker.remove();
    marker=L.marker([lat,lon]).addTo(map).bindPopup('<b>'+escapeHtml(p.display_name)+'</b>').openPopup();
    setStatus('Found: '+p.display_name.split(',')[0]);
  }catch(error){setStatus('Search failed — try again');}
}

searchBtn.addEventListener('click',searchPlace);
input.addEventListener('keydown',e=>{if(e.key==='Enter')searchPlace();});
locateBtn.addEventListener('click',()=>{
  if(!navigator.geolocation){setStatus('Location is not supported');return;}
  setStatus('Finding your location…');
  navigator.geolocation.getCurrentPosition(pos=>{
    const {latitude,longitude}=pos.coords;
    map.flyTo([latitude,longitude],13,{duration:1.2});
    if(marker)marker.remove();
    marker=L.marker([latitude,longitude]).addTo(map).bindPopup('<b>Your location</b>').openPopup();
    setStatus('Your location');
  },()=>setStatus('Location permission was not granted'));
});

map.on('zoomend',()=>setStatus('Zoom: '+map.getZoom()));
