// Run: node tests/test_assistant.cjs [optional baseline helper path]
const assert=require('node:assert/strict'),path=require('node:path');
const H=require(process.argv[2]?path.resolve(process.argv[2]):'../btdd-safety.js');
const tea={id:'tea',name:'Çay',qty:10,price:10},water={id:'water',name:'Su',qty:5,price:20};
const state=sales=>({products:[],closedDays:[],auditLog:[],sales});
let n=0;function test(name,fn){fn();console.log('OK '+name);n++}
test('Lower collection cannot produce a share above 100 percent',()=>{
 const s=state([{total:50,items:[tea]}]),m=H.operationalMetrics(s);
 assert.equal(m.topProduct.share,1);assert.equal(m.revenue,50);assert.equal(m.itemRevenue,100);
});
test('Itemless partial payments do not dilute product mix',()=>{
 const m=H.operationalMetrics(state([{total:100,items:[tea]},{total:900,partial:true,items:[]}]));
 assert.equal(m.topProduct.share,1);assert.equal(m.revenue,1000);
});
test('Different products use their combined line amounts',()=>{
 const m=H.operationalMetrics(state([{total:80,items:[tea,water]}]));
 assert.equal(m.topProduct.share,.5);assert.equal(m.itemRevenue,200);
});
test('Zero collection still has a meaningful recorded product mix',()=>{
 const m=H.operationalMetrics(state([{total:0,items:[tea]}]));assert.equal(m.topProduct.share,1);
});
test('No product lines means no concentration recommendation',()=>{
 const s=state([{total:500,items:[]}]);assert.equal(H.operationalMetrics(s).topProduct,null);
 assert(!H.insights(s).some(x=>x.title==='Satış yoğunlaşması'));
});
test('Zero-priced lines cannot divide by zero',()=>{
 const m=H.operationalMetrics(state([{total:0,items:[{...tea,price:0}]}]));assert.equal(m.topProduct.share,0);
});
test('Explanation names the actual denominator',()=>{
 const x=H.insights(state([{total:50,items:[tea]}])).find(x=>x.title==='Satış yoğunlaşması');
 assert(x.text.includes('%100'));assert(x.text.includes('ürün satırları tutarının'));assert(x.text.includes('tahsilat payı değildir'));
});
test('Advisory calculation never mutates payment or stock data',()=>{
 const s=state([{id:'one',total:50,items:[tea]}]);s.products=[{...tea,stock:42,cost:2}];
 const before=JSON.stringify(s);H.operationalMetrics(s);H.insights(s);assert.equal(JSON.stringify(s),before);
});
console.log(`${n} assistant regression tests passed`);
