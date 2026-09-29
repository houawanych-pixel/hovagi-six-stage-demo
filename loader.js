const originalFetch=window.fetch.bind(window);
const chunks={"index.wasm": ["engine-0.bin", "engine-1.bin", "engine-2.bin"], "index.pck": ["mission-0.bin", "mission-1.bin", "mission-2.bin", "mission-3.bin"]};
window.fetch=async function(resource,options){
 const url=typeof resource==='string'?resource:resource.url;
 const name=new URL(url,location.href).pathname.split('/').pop();
 if(chunks[name]){
  const parts=await Promise.all(chunks[name].map(async file=>{const r=await originalFetch(new URL(file,location.href),options);if(!r.ok)throw new Error('Game download failed. Please reload.');return new Uint8Array(await r.arrayBuffer());}));
  const all=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let offset=0;for(const p of parts){all.set(p,offset);offset+=p.length;}
  return new Response(all,{headers:{'Content-Type':name.endsWith('.wasm')?'application/wasm':'application/octet-stream'}});
 }
 return originalFetch(resource,options);
};
const full=document.getElementById('fullscreen');full.addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen?.().catch(()=>{});});
if(document.modelContext?.registerTool){try{document.modelContext.registerTool({name:'read_mission_status',description:'Read the current HOVAGI stage, objective, access level, and game state visible in the HUD.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>window.hovagiStatus||{state:'loading'}});}catch(e){console.warn('Mission status tool unavailable');}}
