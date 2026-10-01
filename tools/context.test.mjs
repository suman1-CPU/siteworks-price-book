import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../price_book.html',import.meta.url),'utf8');
const data=source.slice(source.indexOf('var CAD='),source.indexOf('var CMP=['));
const picker=source.slice(source.indexOf('/*PICK*/'),source.indexOf('/*END*/'));
const research=JSON.parse(source.match(/var RESEARCH=(.*);\n/)[1]);
const helpers=source.slice(source.indexOf('function phaseUpgrade('),source.indexOf('// Ask box:'));
const {detect,resolveIntent,pick,researchFor}=new Function(data+";var CU={D:'Home',C:'Business',B:'Home + business'},ST={cur:'Current',old:'Older list',unc:'Unconfirmed',quo:'No fixed price'},RESEARCH="+JSON.stringify(research)+';'+picker+helpers+';return {detect,resolveIntent,pick,researchFor}')();
test('screenshot question gets relevant London guide without unrelated tariffs',()=>{
 const q="what's the highest and lowest a tpi can charge for a 3 phase upgrade?";
 assert.equal(detect(q).fuel,'Electricity');assert(detect(q).supply);
 const context=researchFor(q,'');assert.match(context,/£3,000.*£8,000/);assert.match(context,/not an actual|NOT an observed/i);assert.match(context,/electrician247.london/);assert.match(context,/VAT basis not stated/);
 assert(pick(q,'').every(x=>x.f==='Electricity'));assert(!context.includes('U25'));
});
test('phase mention cannot turn different work into conversion budget',()=>{
 for(const q of ['Remove a three-phase electricity meter in London','New commercial three-phase connection in London','Three-phase meter relocation, no supply upgrade','We already have three phase and need a 200A upgrade','Customer needs 100 amps instead of 60 amps. What should I budget?'])assert(!researchFor(q,'').includes('£3,000'),q);
 assert(researchFor('Single phase to 3 phase in London, roughly how much?','').includes('£3,000'));
});
test('South London uses qualified Southern scope, and North London remains separate',()=>{
 const q='Install a U65 with a housing in South London';assert.equal(pick(q,'')[0].num,1392.80);assert.match(pick(q,'')[0].note,/3,357.43/);assert.match(detect(q).areaBasis,/confirm/);
 assert(pick('Upgrade U16 to U40 in South London','').some(x=>x.num===558.76));
 assert.equal(pick('SGN U40 meter removal North London','').length,0);
 assert(pick('Electricity disconnection in North London','').every(x=>x.n==='UK Power Networks'));
});
test('technical scope keeps pipe work, cable type and large supplies separate',()=>{
 assert.equal(pick('Move the gas meter only, leave the pipe alone, South London','')[0].num,188.76);
 assert.equal(pick('Disconnect an intermediate-pressure gas supply in London','').length,0);
 assert(pick('New electricity connection for one small shop in London, under 69 kVA','').every(x=>x.num==null));
 assert.equal(pick('Permanent electric disconnection, over 400 amps, London factory','').length,1);
 assert(pick('Disconnect an underground electricity supply in London','').every(x=>/Underground/.test(x.i)));
 assert.equal(detect('Fit an electricity meter at an existing London business supply').job,'Meter install');
 assert.equal(detect('Change a home credit gas meter to prepayment in South London').job,'Meter install');
 assert(!detect('Does customer digs remove all excavation charges?').jobs.includes('Meter removal'));
 assert(!researchFor('CT metering electricity installation for 250A supply','').includes('£200'));
 const state=resolveIntent('What does Bionic charge for U25 removal?','');assert(researchFor('And their commission?',state).includes('TPI RESEARCH: Bionic'));
});
test('missing location/provider/pressure matches never relax to another tariff',()=>{
 for(const q of ['U25 gas meter removal in Newcastle?','EDF U25 gas meter removal in London?','London electricity meter relocation?','Medium pressure U40 meter removal?'])assert.equal(pick(q,'').length,0,q);
});
test('comparisons keep all requested jobs and sizes',()=>{
 const rows=pick('SGN U40 install vs removal?','');assert(rows.some(x=>x.j==='Meter install'&&x.num===558.76));assert(rows.some(x=>x.j==='Meter removal'&&x.num===423.94));
 const multi=pick('Compare SGN U16 U25 U40 removals','');assert.deepEqual(multi.map(x=>x.num).sort((a,b)=>a-b),[195.94,211.45,423.94]);
});
test('structured followups persist topic and corrections override it',()=>{
 let state=resolveIntent('SGN U16 meter installation with housing','');state=resolveIntent('and U25?',state);state=resolveIntent('and without housing?',state);
 assert.deepEqual(state.providers,['SGN']);assert.equal(state.fuel,'Gas');assert.equal(state.size,'u25');assert(state.jobs.includes('Meter install'));
 const electric=resolveIntent('No, electricity not gas',state);assert.equal(electric.fuel,'Electricity');assert.deepEqual(electric.sizes,[]);
 const region=resolveIntent('That is in Birmingham, not London',resolveIntent('electricity removal London',''));assert.equal(region.unknownArea,'birmingham');
});
test('fuel, job, scope and technical aliases constrain guides and rows',()=>{
 assert.equal(detect('How much for a 200A upgrade?').fuel,'Electricity');assert(detect('Customer needs 100 amps instead of 60 amps').supply);
 assert.equal(detect('U40 removal?').fuel,'Gas');assert.equal(pick('U65 meter removal','')[0].num,573.12);
 const context=researchFor('London electricity disconnection estimate','');assert(context.includes('£805'));assert(!context.includes('£2,157'));
 assert(!researchFor('How much gas disconnection in North West?','').includes('LONDON PLANNING ESTIMATE'));
});
test('inventory exercises every scenario without runtime failure or fuel substitution',()=>{
 const inventory=JSON.parse(readFileSync(new URL('./question-coverage.json',import.meta.url),'utf8'));
 assert(inventory.scenarios.length>=76);
 for(const x of inventory.scenarios){const rows=pick(x.question,x.previous||'');const d=resolveIntent(x.question,x.previous||'');researchFor(x.question,x.previous||'',d);if(d.fuel&&d.fuel!=='Both')assert(rows.every(r=>r.f===d.fuel),x.id);}
});
