(function(root){
  'use strict';
  function number(value){if(value===null||value===undefined||String(value).trim()==='')return null;var n=Number(value);return Number.isFinite(n)?n:null;}
  function round(value){return Math.round((value+Number.EPSILON)*100)/100;}
  function fixedAmount(price){var m=String(price||'').trim().match(/^£([\d,]+(?:\.\d{1,2})?)$/);return m?number(m[1].replace(/,/g,'')):null;}
  function priceKind(price){return fixedAmount(price)!==null?'fixed':/from/i.test(price)?'from':/£.*(?:to|–|-).*£/.test(price)?'range':'quote';}
  function calculate(lines,settings){
    settings=settings||{};var rate=number(settings.vatRate),profit=number(settings.profitRate)||0,mode=settings.profitMode||'none';
    var invalid=[],unresolved=[],unknownVat=[],entered=0,net=0,cost=0,vat=0,hasVat=false;
    if(rate!==null&&(rate<0||rate>100))invalid.push('VAT rate must be between 0% and 100%.');
    if(profit<0||(mode==='margin'&&profit>=100))invalid.push('Target margin must be below 100%; pricing percentages cannot be negative.');
    var rows=lines.map(function(line){
      var amount=number(line.amount),qty=number(line.quantity),total=null,netValue=null,vatValue=null;
      if(amount===null)unresolved.push(line.id);else if(amount<0||qty===null||qty<=0)invalid.push('Enter a non-negative amount and a positive quantity for '+line.label+'.');
      else{
        total=round(amount*qty);entered=round(entered+total);
        if(line.vatBasis==='none'){netValue=total;vatValue=0;}
        else if((line.vatBasis==='ex'||line.vatBasis==='inc')&&rate!==null&&rate>=0&&rate<=100){netValue=line.vatBasis==='inc'?round(total/(1+rate/100)):total;vatValue=line.vatBasis==='inc'?round(total-netValue):round(netValue*rate/100);hasVat=true;}
        else{unknownVat.push(line.id);if(line.vatBasis==='ex')netValue=total;}
        if(netValue!==null){net=round(net+netValue);if(line.includeProfit!==false)cost=round(cost+netValue);}
        if(vatValue!==null)vat=round(vat+vatValue);
      }
      return Object.assign({},line,{entered:total,net:netValue,vat:vatValue});
    });
    var adjustment=round(mode==='markup'?cost*profit/100:mode==='margin'&&profit<100?cost/(1-profit/100)-cost:0);
    var adjustmentVat=adjustment&&rate!==null&&settings.profitVatBasis==='ex'?round(adjustment*rate/100):0;
    if(adjustment&&settings.profitVatBasis!=='none'&&(rate===null||settings.profitVatBasis!=='ex'))unknownVat.push('pricing-adjustment');
    var complete=lines.length>0&&!unresolved.length&&!unknownVat.length&&!invalid.length;
    return {rows:rows,enteredTotal:entered,netSubtotal:net,costSubtotal:cost,adjustment:adjustment,vatTotal:round(vat+adjustmentVat),total:complete?round(net+adjustment+vat+adjustmentVat):null,unresolved:unresolved,unknownVat:unknownVat,invalid:invalid,complete:complete,vatRate:rate,hasVat:hasVat};
  }
  function money(value){return value===null?'Not priced':'£'+value.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});}
  function draft(lines,settings,brief){
    var result=calculate(lines,settings),out=['SITEWORKS — DRAFT ESTIMATE','Prepared '+new Date().toISOString().slice(0,10),'Planning document; confirm applicability and supplier/network quotes.',''];
    Object.keys(brief||{}).forEach(function(key){if(brief[key])out.push(key+': '+brief[key]);});
    out.push('','ITEMISED COMPONENTS');
    result.rows.forEach(function(x,i){out.push((i+1)+'. '+x.label+' | '+(x.quantity===null?'Quantity unconfirmed':x.quantity)+' × '+money(number(x.amount))+' = '+money(x.entered),'   Type: '+(x.role||'Cost')+'; user-selected amount VAT basis: '+({ex:'Excludes VAT',inc:'Includes VAT',none:'No VAT — user confirmed',unknown:'Not confirmed'}[x.vatBasis]||x.vatBasis)+'; original source: '+(x.originalPrice||'User-entered amount'),'   Provider: '+(x.provider||'User-entered / not confirmed')+'; original source VAT: '+(x.sourceVat||'Not established'),'   Evidence: '+(x.status||'User input')+'; area: '+(x.area||'Not confirmed')+'; effective: '+(x.effectiveDate||'Not recorded')+'; checked: '+(x.checkedDate||'Not recorded'),'   Scope: '+(x.scope||'Confirm inclusions and exclusions.'));(x.sources||[]).forEach(function(s){out.push('   Source: '+s.url)});if(x.amountEdited)out.push('   Amount chosen/edited by the user; source amount is unchanged.');});
    out.push('','Entered amounts subtotal (may mix VAT bases): '+money(result.enteredTotal),'Known net subtotal: '+money(result.netSubtotal),'Pricing method: '+(settings.profitMode||'none')+' '+(settings.profitRate||0)+'% on selected known net cost lines','Pricing adjustment: '+money(result.adjustment),'VAT rate: '+(result.vatRate===null?'Not confirmed':result.vatRate+'% — user-entered assumption; confirm each component'),'Known VAT: '+money(result.vatTotal),'VAT-inclusive draft total: '+(result.total===null?'INCOMPLETE — resolve missing amounts / VAT bases':money(result.total)),'Unpriced components: '+result.unresolved.length+'; unresolved VAT components: '+result.unknownVat.length);
    if(result.invalid.length)out.push(...result.invalid);
    if(settings.warnings&&settings.warnings.length)out.push('','APPLICABILITY / OVERLAP WARNINGS',...settings.warnings);
    out.push('Rounding: each component total, VAT amount and pricing adjustment is rounded to the nearest penny before summing.');
    out.push('','Ranges, starting prices and guides are planning assumptions, not guaranteed customer totals. Check overlapping packages, per-metre charges, civil works, meter/supplier add-ons and broker fees.');
    return out.join('\n');
  }
  var api={number:number,fixedAmount:fixedAmount,priceKind:priceKind,calculate:calculate,draft:draft,money:money};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SiteworksQuote=api;
})(typeof globalThis!=='undefined'?globalThis:this);
