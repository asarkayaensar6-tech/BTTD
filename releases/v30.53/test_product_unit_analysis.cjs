const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
const source=html.slice(html.indexOf('function productUnitSales('),html.indexOf('function renderProductUnitAnalysis()'));
const state={products:[{id:'tea',name:'Çay'}]};const saleDateKey=ts=>{const d=ts instanceof Date?ts:new Date(ts),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`};const c={state,Date,Map,Number,String,Math,saleDateKey};vm.createContext(c);vm.runInContext(source,c);
const sales=[
 {businessDate:'2026-09-27',items:[{id:'tea',name:'Çay',qty:3,price:15},{id:'water',name:'Su',qty:2,price:10}]},
 {businessDate:'2026-09-25',items:[{id:'tea',name:'Çay',qty:2,price:15},{id:'water',name:'Su',qty:1,price:10}]},
 {businessDate:'2026-09-21',items:[{id:'tea',name:'Çay',qty:4,price:14}]},
 {businessDate:'2026-09-20',items:[{id:'tea',name:'Çay',qty:5,price:14}]},
 {businessDate:'2026-09-01',items:[{id:'tea',name:'Çay',qty:6,price:13}]},
 {businessDate:'2026-08-31',items:[{id:'tea',name:'Çay',qty:7,price:13}]},
 {businessDate:'2026-01-02',items:[{id:'tea',name:'Çay',qty:8,price:12}]},
 {businessDate:'2025-12-31',items:[{id:'tea',name:'Çay',qty:9,price:12}]},
 {businessDate:'2026-09-26',items:[{id:'tea',name:'Çay',qty:-2,price:15},{id:'bad',name:'Bozuk',qty:'x',price:5}]}
];
const before=JSON.stringify(sales),rows=c.productUnitSales(sales,'2026-09-27'),tea=rows.find(x=>x.key==='id:tea'),water=rows.find(x=>x.key==='id:water');
assert.deepEqual(JSON.parse(JSON.stringify(tea.qty)),{day:3,week:9,month:20,year:35});
assert.deepEqual(JSON.parse(JSON.stringify(water.qty)),{day:2,week:3,month:3,year:3});
assert.equal(tea.name,'Çay','current catalog name is preferred while old sales prices/units are aggregated');

assert.deepEqual(JSON.parse(JSON.stringify(rows.map(x=>x.name))),['Çay','Su'],'products sort by year-to-date units');
assert.deepEqual(JSON.parse(JSON.stringify(c.productUnitSales(sales,'2026-09-20').find(x=>x.key==='id:tea').qty)),{day:5,week:5,month:11,year:26});
assert.deepEqual(JSON.parse(JSON.stringify(c.productUnitSales(sales,'bad'))),[],'invalid anchor date returns no data');
assert.equal(JSON.stringify(sales),before,'analysis never mutates sales');
assert(html.includes('type="date" aria-label="Satış analizi iş günü"'));
assert(html.includes('Hafta, ay ve yıl değerleri seçtiğin gün dahil, dönem başından o güne kadardır.'));
console.log('Product unit analysis: 10 date-window, sort, filtering-input, and immutability checks passed');
