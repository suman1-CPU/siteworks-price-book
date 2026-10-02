import test from 'node:test';
import assert from 'node:assert/strict';
import Q from '../assets/quote-core.js';
const line=(overrides={})=>({id:'1',label:'Meter removal',amount:211.45,quantity:2,vatBasis:'unknown',includeProfit:true,...overrides});
test('source ranges and quote routes never become exact billable amounts',()=>{
 assert.equal(Q.fixedAmount('£805 to £2,650'),null);assert.equal(Q.fixedAmount('From £4,000'),null);assert.equal(Q.fixedAmount('Quote only'),null);assert.equal(Q.fixedAmount('£1,202.57'),1202.57);
});
test('quantity arithmetic preserves unresolved VAT and unpriced work',()=>{
 const result=Q.calculate([line(),line({id:'2',amount:null})],{});assert.equal(result.enteredTotal,422.9);assert.equal(result.total,null);assert.equal(result.unresolved.length,1);assert.equal(result.unknownVat.length,1);
});
test('markup and margin use net cost, exclude selling fees and apply explicit VAT',()=>{
 const lines=[line({amount:1000,quantity:1,vatBasis:'ex'}),line({id:'fee',amount:150,quantity:1,vatBasis:'none',includeProfit:false})];
 const settings={profitMode:'markup',profitRate:20,vatRate:20,profitVatBasis:'ex'};
 let result=Q.calculate(lines,settings);assert.equal(result.adjustment,200);assert.equal(result.total,1590);
 result=Q.calculate(lines,{...settings,profitMode:'margin'});assert.equal(result.adjustment,250);assert.equal(result.total,1650);
 assert(Q.calculate(lines,{...settings,profitMode:'margin',profitRate:100}).invalid.length);
});
test('inclusive amounts convert using only an explicit rate; mixed unknown bases stay partial',()=>{
 const result=Q.calculate([line({amount:1200,quantity:1,vatBasis:'inc'})],{vatRate:20});assert.equal(result.netSubtotal,1000);assert.equal(result.vatTotal,200);assert.equal(result.total,1200);
 assert.equal(Q.calculate([line({amount:1200,vatBasis:'inc'})],{}).total,null);
});
test('draft export keeps original range, source, user assumption and unresolved components',()=>{
 const text=Q.draft([line({amount:1000,amountEdited:true,originalPrice:'£805 to £2,650',sources:[{url:'https://example.org/tariff'}]})],{}, {Region:'London'});
 assert.match(text,/DRAFT ESTIMATE/);assert.match(text,/£805 to £2,650/);assert.match(text,/https:\/\/example.org\/tariff/);assert.match(text,/INCOMPLETE/);assert.match(text,/edited by the user/);
});
test('line rounding makes displayed component and VAT sums agree with totals',()=>{
 let result=Q.calculate([line({amount:.01,quantity:1.5,vatBasis:'none'}),line({id:'2',amount:.01,quantity:1.5,vatBasis:'none'})],{});assert.equal(result.total,.04);
 result=Q.calculate([line({amount:.03,quantity:1,vatBasis:'ex'}),line({id:'2',amount:.03,quantity:1,vatBasis:'ex'})],{vatRate:20});assert.equal(result.vatTotal,.02);assert.equal(result.total,.08);
 assert(!Q.calculate([line({vatBasis:'none'})],{profitMode:'markup',profitRate:150,profitVatBasis:'none'}).invalid.length);
});
