const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const segment=(from,to)=>html.slice(html.indexOf(from),html.indexOf(to,html.indexOf(from)));
const now=new Date(2026,8,27,9),RealDate=Date;
class MockDate extends RealDate{constructor(...args){super(...(args.length?args:[now.valueOf()]))}static now(){return now.valueOf()}}
const state={businessDate:'2026-09-27',products:[{id:'tea',cost:7}],sales:[{total:40,closedAt:new Date(2026,8,27,8).valueOf(),items:[{id:'tea',qty:2,price:20}]}],expenses:[],closedDays:[],tables:[]};
const root={innerHTML:''};
const c={Date:MockDate,state,BtddSafety:{businessDate:x=>x.businessDate},$:()=>root,money:n=>'₺'+Number(n).toFixed(2),esc:String,document:{querySelectorAll:()=>[]},Map,Math,Number,String};
vm.createContext(c);
vm.runInContext(segment('function allSalesForAnalytics()','function drawRevenueChart()')+segment('function analyticsSaleCost(','function getAudioCtx()').split('function renderDashboard()')[0]+segment('function itemUnitCost(','function renderCash()')+segment('function dateKeyFromMs(','function renderCalendarDetail(')+segment('function renderMonthlySales()','function _renderReports()'),c);
assert.equal(c.analyticsSaleCost(state.sales[0]),14,'Missing archived cost falls back to item cost');
assert.equal(c.analyticsSaleCost({...state.sales[0],productCost:null}),14,'Null cost falls back to item cost');
assert.equal(c.analyticsSaleCost({...state.sales[0],productCost:0}),0,'Recorded zero cost remains zero');
assert.equal(c.chartSeries('weekly').at(-1).value,40,'Sunday morning sale appears in current calendar week');
const lastMonday=new Date(2026,8,14,12).valueOf();state.closedDays.push({businessDate:'2026-09-14',sales:[{total:25,closedAt:lastMonday,items:[]}]});
assert.equal(c.chartSeries('weekly').at(-2).value,25,'Previous Monday remains in previous calendar week');
assert.equal(c.chartSeries('weekly').at(-1).value,40,'Previous week sale does not leak into current week');
state.closedDays=[];c.renderMonthlySales();assert(root.innerHTML.includes('Karşılaştırma yok')&&!root.innerHTML.includes('+100%'),'No previous sales is not an invented 100% increase');
state.closedDays.push({businessDate:'2026-08-27',sales:[{total:20,closedAt:new Date(2026,7,27).valueOf(),items:[]}]});
c.renderMonthlySales();assert(root.innerHTML.includes('+100%'),'Compare matching dates when prior period exists');
assert.equal(c.chartPeriodComparison('daily').current,c.chartSeries('daily').reduce((n,x)=>n+x.value,0),'14-day comparison current side matches visible bars');
state.closedDays.push(
 {businessDate:'2026-09-12',total:30,sales:[{total:30,closedAt:new Date(2026,8,12,8).valueOf(),items:[]}]},
 {businessDate:'2026-07-27',total:24,sales:[{total:24,closedAt:new Date(2026,6,27,8).valueOf(),items:[]}]},
 {businessDate:'2025-08-27',total:20,sales:[{total:20,closedAt:new Date(2025,7,27,8).valueOf(),items:[]}]}
);
let cmp=c.chartPeriodComparison('daily');assert.equal(cmp.current,40);assert.equal(cmp.previous,30);assert.equal(Math.round(cmp.changePercent),33);
cmp=c.chartPeriodComparison('weekly');assert.equal(cmp.current,c.chartSeries('weekly').reduce((n,x)=>n+x.value,0));assert.equal(cmp.previous,24);
cmp=c.chartPeriodComparison('monthly');assert.equal(cmp.current,c.chartSeries('monthly').reduce((n,x)=>n+x.value,0));assert.equal(cmp.previous,20);assert.equal(Math.round(cmp.changePercent),470);
state.closedDays=state.closedDays.filter(d=>d.businessDate==='2026-09-14');cmp=c.chartPeriodComparison('daily');assert.equal(cmp.changePercent,null,'No historical revenue avoids a fabricated percent');
console.log('Sales analysis calculations: 15 assertions passed');
