const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=process.argv[2]?path.resolve(process.argv[2]):path.join(__dirname,'../index.html');
const html=fs.readFileSync(file,'utf8');
const fn=html.slice(html.indexOf('function setSyncStatus(ok,text)'),html.indexOf('function showMobilePin()'));
let count=0;
for(const [online,dirty,pending,conflict,explicit,expected] of [
 [true,true,null,null,null,'Kaydediliyor…'],
 [true,false,{},null,null,'Kaydediliyor…'],
 [false,true,null,null,null,'Cihazda bekliyor'],
 [false,false,{},null,null,'Cihazda bekliyor'],
 [true,false,null,null,null,'Bağlı'],
 [false,false,null,null,null,'Bağlantı Yok'],
 [true,true,null,{},null,'Çakışma var'],
 [false,true,null,{},'PIN gerekli','PIN gerekli']
]){
 const label={},chip={querySelector:()=>label,classList:{toggle(){}},title:''};
 const c={stateDirty:dirty,pendingSyncRequest:pending,syncConflict:conflict,syncOnline:false,lastSyncOkAt:0,renderLastServerAck(){},window:{},document:{body:{classList:{toggle(){}}}},$:()=>chip};
 vm.createContext(c);vm.runInContext(fn,c);c.setSyncStatus(online,explicit);
 assert.equal(label.textContent,expected);
 assert.equal(c.stateDirty,dirty);assert.equal(c.pendingSyncRequest,pending);assert.equal(c.syncConflict,conflict);
 count++;
}
console.log(`${count} sync status transition checks passed`);
