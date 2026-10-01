// Accuracy test for the ask box. Usage (from anywhere):
//   node tools/bench.mjs rows                      which rows the page would send per question
//   node tools/bench.mjs narrow space-bunny-free   scored run through the live relay (trips its rate limit for ~10 min)
//   node tools/bench.mjs full space-bunny-free     same, sending the whole list (known to be less accurate)
import fs from 'fs';
const s=fs.readFileSync(new URL('../price_book.html',import.meta.url),'utf8');
const a=s.indexOf("var CAD="), b=s.indexOf("var CMP=[");
const pk=s.slice(s.indexOf('/*PICK*/'),s.indexOf('/*END*/'));
const {R,pick,lines}=new Function(s.slice(a,b)+"; var CU={D:'Home',C:'Business',B:'Home + business'}, ST={cur:'Current',old:'Older list',unc:'Unconfirmed',quo:'No fixed price'};"+pk+"; return {R,pick,lines};")();
const U='https://siteworks-relay.saumya-siteworks.workers.dev';
const T=[["gas disconnection 90mm pipe East Midlands?","2,391"],["125mm disconnection North London?","3,360"],["Move a gas pipe 6 metres in the North West, total?","1,482"],
["new gas connection West Midlands 5 metres private land","2,783"],["U25 install with housing?","1,202.57"],["180mm gas disconnection East of England","3,837"],
["gas alteration fixed charge East Midlands","679"],["U65 meter removal","573.12"],["new gas connection North West 10 metres customer digs","2,302"],["gas disconnection 63mm West Midlands","1,393"],
["U40 meter removal kitna hai?","423.94"],["disconnect electricity overhead cable london","640"]];
const mode=process.argv[2], models=process.argv.slice(3);
if(mode==='rows'){for(const [q] of T)console.log(pick(q,'').length,'rows <-',q);process.exit()}
for(const model of models){
  let ok=0,time=0;const miss=[];
  for(const [q,exp] of T){
    const context=mode==='full'?lines(R):lines(pick(q,''));const t=Date.now();let rep='';
    try{const res=await fetch(U,{method:'POST',headers:{'Origin':'https://suman1-cpu.github.io','Content-Type':'application/json'},body:JSON.stringify({context,model,messages:[{role:'user',content:q}]})});
      const j=await res.json();rep=j.reply||('ERR '+JSON.stringify(j).slice(0,120))}catch(e){rep='ERR '+e.message}
    time+=Date.now()-t;
    if(rep.replace(/\s/g,'').includes(exp))ok++;else miss.push(q+' => '+rep.slice(0,110));
  }
  console.log(`\n${model} [${mode}]: ${ok}/${T.length} right, avg ${(time/T.length/1000).toFixed(1)}s`);miss.forEach(m=>console.log('  MISS',m));
}
