/* Offline business-day and advisory helpers. No network or automatic financial edits. */
(function(root){
'use strict';
function dateKey(ms){const d=new Date(ms),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`}
function validDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(s||'')))return false;const d=new Date(s+'T12:00:00');return Number.isFinite(+d)&&dateKey(d)===s}
function businessDate(s){return validDate(s.businessDate)?s.businessDate:dateKey(Number(s.dayOpenedAt||s.openedAt)||Date.now())}
function sessionId(s){return String(s.businessSessionId||'legacy-'+Number(s.dayOpenedAt||s.openedAt||0))}
function nextDate(s,now=Date.now()){const d=new Date(businessDate(s)+'T12:00:00');d.setDate(d.getDate()+1);return [dateKey(d),dateKey(now)].sort().pop()}
function normalize(s){s.businessDate=businessDate(s);s.businessSessionId=sessionId(s);return s}
function sameSession(a,b){return sessionId(a)===sessionId(b)&&businessDate(a)===businessDate(b)}
function closedHistoryPreserved(local,server){const ids=new Set((local.closedDays||[]).map(d=>String(d.id)));return(server.closedDays||[]).every(d=>ids.has(String(d.id)))}
function recoverySafe(local,server){return sameSession(local,server)&&closedHistoryPreserved(local,server)}
function productIssue(s,table,id,qty){
 if(!table||!(s.tables||[]).includes(table))return 'Masa değişti; masayı yeniden aç';
 if(!Number.isSafeInteger(qty)||qty<1)return 'Geçerli bir ürün adedi seç';
 const p=(s.products||[]).find(x=>String(x.id)===String(id));
 if(!p||p.active===false)return 'Ürün artık satışa açık değil';
 if(!Number.isFinite(Number(p.price))||Number(p.price)<0)return 'Ürün fiyatını kontrol et';
 if(p.stock!==null&&p.stock!==undefined&&(!Number.isFinite(Number(p.stock))||Number(p.stock)<qty))return 'Yeterli stok yok';
 return '';
}

function productAudit(s){
 const products=Array.isArray(s.products)?s.products:[],issues=[],ids=new Map(),names=new Map();
 let active=0,inactive=0,lowStock=0,outOfStock=0,missingCost=0,belowCost=0,invalidPrice=0,invalidStock=0,missingCategory=0,noVisual=0;
 for(const p of products){
  const isActive=p&&p.active!==false;if(isActive)active++;else inactive++;
  const id=String(p?.id??'').trim(),name=String(p?.name??'').trim(),nameKey=name.toLocaleLowerCase('tr-TR');
  if(id)ids.set(id,(ids.get(id)||0)+1);
  if(nameKey)names.set(nameKey,(names.get(nameKey)||0)+1);
  if(!name)issues.push({level:'error',title:'İsimsiz ürün',text:'Bir ürünün adı boş. Düzenleyip benzersiz bir ad ver.'});
  const price=Number(p?.price);if(!Number.isFinite(price)||price<0){invalidPrice++;issues.push({level:'error',title:'Geçersiz satış fiyatı',text:`${name||'İsimsiz ürün'} satış fiyatını kontrol et.`})}else if(price===0&&isActive){issues.push({level:'warn',title:'Sıfır fiyatlı ürün',text:`${name||'İsimsiz ürün'} satışa açık ama fiyatı 0.`})}
  const cost=Number(p?.cost);if(isActive&&(!Number.isFinite(cost)||cost<=0)){missingCost++;issues.push({level:'warn',title:'Maliyet eksik',text:`${name||'İsimsiz ürün'} için maliyet girilmemiş.`})}
  if(Number.isFinite(cost)&&Number.isFinite(price)&&price>=0&&cost>price&&isActive){belowCost++;issues.push({level:'warn',title:'Maliyetin altında satış',text:`${name||'İsimsiz ürün'}: maliyet ${cost.toFixed(2)}, satış ${price.toFixed(2)}.`})}
  if(p?.stock!==null&&p?.stock!==undefined){const stock=Number(p.stock);if(!Number.isFinite(stock)||stock<0){invalidStock++;issues.push({level:'error',title:'Geçersiz stok',text:`${name||'İsimsiz ürün'} stok değerini kontrol et.`})}else if(isActive&&stock===0){outOfStock++;issues.push({level:'warn',title:'Stok bitti',text:`${name||'İsimsiz ürün'} satışa açık fakat stok 0.`})}else if(isActive&&stock<=5){lowStock++;issues.push({level:'warn',title:'Stok azalıyor',text:`${name||'İsimsiz ürün'}: ${stock} adet kaldı.`})}}
  if(isActive&&!String(p?.category||'').trim()){missingCategory++;issues.push({level:'info',title:'Kategori eksik',text:`${name||'İsimsiz ürün'} için kategori seç.`})}
  if(isActive&&!String(p?.image||'').trim()&&!String(p?.emoji||'').trim())noVisual++;
 }
 const duplicateIds=[...ids].filter(([,n])=>n>1).map(([id,n])=>({id,count:n}));
 const duplicateNames=[...names].filter(([,n])=>n>1).map(([name,n])=>({name,count:n}));
 if(duplicateIds.length)issues.unshift({level:'error',title:'Tekrarlanan ürün kimliği',text:`${duplicateIds.length} ürün kimliği birden fazla kayıtta kullanılıyor.`});
 if(duplicateNames.length)issues.unshift({level:'warn',title:'Aynı isimli ürünler',text:`${duplicateNames.length} ürün adı tekrar ediyor; yanlış ürüne basma riskini kontrol et.`});
 return {total:products.length,active,inactive,lowStock,outOfStock,missingCost,belowCost,invalidPrice,invalidStock,missingCategory,noVisual,duplicateIds,duplicateNames,issues};
}

function operationalMetrics(s){
 const products=Array.isArray(s.products)?s.products:[],sales=Array.isArray(s.sales)?s.sales:[],days=Array.isArray(s.closedDays)?s.closedDays:[],audit=Array.isArray(s.auditLog)?s.auditLog:[];
 const lowMargin=[];for(const p of products){if(p?.active===false)continue;const price=Number(p?.price),cost=Number(p?.cost);if(price>0&&cost>0&&cost<=price){const margin=(price-cost)/price;if(margin<.15)lowMargin.push({id:String(p.id??''),name:String(p.name||'Ürün'),margin,price,cost})}}
 const soldKeys=new Set();const recent=[...days].sort((a,b)=>Number(b?.closedAt||0)-Number(a?.closedAt||0)).slice(0,7);for(const d of recent)for(const sale of d?.sales||[])for(const i of sale?.items||[]){soldKeys.add('id:'+String(i?.id??''));soldKeys.add('name:'+String(i?.name||'').toLocaleLowerCase('tr-TR'))}for(const sale of sales)for(const i of sale?.items||[]){soldKeys.add('id:'+String(i?.id??''));soldKeys.add('name:'+String(i?.name||'').toLocaleLowerCase('tr-TR'))}
 const dormant=recent.length>=3?products.filter(p=>p?.active!==false&&!soldKeys.has('id:'+String(p?.id??''))&&!soldKeys.has('name:'+String(p?.name||'').toLocaleLowerCase('tr-TR'))):[];
 const since=Math.max(0,Number(s.dayOpenedAt||s.openedAt)||0),currentAudit=audit.filter(x=>!since||Number(x?.at||0)>=since),cancelCount=currentAudit.filter(x=>x?.action==='Hesap iptal edildi').length,returnCount=currentAudit.filter(x=>x?.action==='Ürün düşüldü').length;
 const productRevenue=new Map();let revenue=0,units=0,itemRevenue=0;for(const sale of sales){revenue+=Number(sale?.total||0);for(const i of sale?.items||[]){const line=Math.max(0,Number(i?.qty||0))*Math.max(0,Number(i?.price||0)),key=String(i?.name||i?.id||'Ürün');units+=Math.max(0,Number(i?.qty||0));itemRevenue+=line;productRevenue.set(key,(productRevenue.get(key)||0)+line)}}const top=[...productRevenue.entries()].sort((a,b)=>b[1]-a[1])[0]||null,topShare=top&&itemRevenue>0?top[1]/itemRevenue:0;
 return {lowMargin,dormant,cancelCount,returnCount,recentClosedDays:recent.length,revenue,units,itemRevenue,topProduct:top?{name:top[0],revenue:top[1],share:topShare}:null};
}

function insights(s){
 const out=[],products=s.products||[],active=products.filter(p=>p.active!==false),sales=s.sales||[],days=s.closedDays||[],audit=productAudit(s),ops=operationalMetrics(s);
 if(audit.outOfStock||audit.lowStock)out.push({title:'Stok kontrolü',text:`${audit.outOfStock} ürün stokta yok · ${audit.lowStock} ürün kritik seviyede (1–5). Ürünler ekranındaki denetim listesini kontrol et.`,level:'warn'});
 if(audit.missingCost)out.push({title:'Kazanç hesabı eksik olabilir',text:`${audit.missingCost} aktif üründe maliyet sıfır veya eksik. Net kazanç, girilmiş maliyetlere göre hesaplanır.`,level:'warn'});
 if(audit.belowCost)out.push({title:'Maliyetin altında fiyat',text:`${audit.belowCost} aktif ürün maliyetinin altında fiyatlanmış. Ürün Denetimi ekranında ayrıntısı var.`,level:'warn'});
 if(audit.duplicateIds.length||audit.invalidPrice||audit.invalidStock)out.push({title:'Ürün verisi denetimi',text:`Kritik ürün kayıtları bulundu: ${audit.duplicateIds.length} tekrarlı kimlik · ${audit.invalidPrice} geçersiz fiyat · ${audit.invalidStock} geçersiz stok.`,level:'warn'});
 if(audit.duplicateNames.length)out.push({title:'Benzer ürün kayıtları',text:`${audit.duplicateNames.length} ürün adı tekrarlanıyor. Yanlış ürüne basma ihtimaline karşı Ürün Denetimi bölümünü kontrol et.`,level:'info'});
 if(ops.lowMargin.length)out.push({title:'Düşük marjlı ürünler',text:`${ops.lowMargin.length} aktif ürünün brüt ürün marjı %15’in altında. ${ops.lowMargin.slice(0,3).map(x=>x.name+' %'+(x.margin*100).toFixed(0)).join(' · ')}${ops.lowMargin.length>3?' · …':''}`,level:'warn'});
 if(ops.cancelCount+ops.returnCount>=3)out.push({title:'İptal / iade hareketi',text:`Bu iş gününde ${ops.cancelCount} hesap iptali ve ${ops.returnCount} ürün düşme kaydı var. Yanlış basma veya işlem akışını denetlemek için hareket kayıtlarını kontrol et.`,level:'warn'});
 if(ops.dormant.length)out.push({title:'Hareketsiz ürünler',text:`Son ${ops.recentClosedDays} kapanan gün + aktif günde satışı görünmeyen ${ops.dormant.length} aktif ürün var. ${ops.dormant.slice(0,3).map(x=>x.name).join(' · ')}${ops.dormant.length>3?' · …':''}`,level:'info'});
 if(ops.topProduct&&ops.units>=10&&ops.topProduct.share>=.45)out.push({title:'Satış yoğunlaşması',text:`Bugünkü kayıtlı ürün satırları tutarının yaklaşık %${Math.round(ops.topProduct.share*100)}’i ${ops.topProduct.name} ürününden geliyor. Bu oran tahsilat payı değildir; ürün satırlarına dayanır. Stok hazırlığında bu ürüne öncelik verilebilir.`,level:'info'});
 const seen=new Set(),duplicates=new Set();
 for(const sale of [...days.flatMap(d=>d.sales||[]),...sales]){if(sale.id&&seen.has(String(sale.id)))duplicates.add(String(sale.id));if(sale.id)seen.add(String(sale.id))}
 if(duplicates.size)out.push({title:'Tekrarlanan satış kaydı',text:`${duplicates.size} satış kimliği birden fazla yerde bulunuyor. Rapor toplamları etkilenebilir; yedek üzerinden kontrol edilmeli. Kayıtlar otomatik silinmedi.`,level:'warn'});
 if(businessDate(s)<dateKey(Date.now())&&(sales.length||(s.expenses||[]).length||(s.tables||[]).length))out.push({title:'Önceki iş günü hâlâ açık',text:`Aktif iş günü ${businessDate(s)}. Yeni günün satışlarına geçmeden önce gün sonunu kontrol et.`,level:'warn'});
 const recent=[...days].filter(d=>Number.isFinite(Number(d.total))).sort((a,b)=>Number(b.closedAt)-Number(a.closedAt)).slice(0,7);
 if(recent.length>=3){const avg=recent.reduce((n,d)=>n+Number(d.total),0)/recent.length,rev=sales.reduce((n,x)=>n+Number(x.total||0),0);out.push({title:'Son kapanan günlerle karşılaştırma',text:`Aktif iş günü: ${rev.toFixed(2)} TL · Son ${recent.length} kapanan gün ortalaması: ${avg.toFixed(2)} TL. Aktif gün henüz tamamlanmadığı için bu bir tahmin değildir.`,level:'info'})}
 const demand=new Map();for(const sale of sales)for(const item of sale.items||[])demand.set(String(item.id),(demand.get(String(item.id))||0)+Number(item.qty||0));
 const suggested=active.filter(p=>p.stock!==null&&p.stock!==undefined&&(demand.get(String(p.id))||0)>Number(p.stock)).slice(0,5);
 if(suggested.length)out.push({title:'Stok hazırlığı önerisi',text:suggested.map(p=>`${p.name}: aynı miktarda satış tekrarlanırsa en az ${Math.ceil(demand.get(String(p.id))-Number(p.stock))} adet eksik`).join(' · ')+'. Mevcut iş gününün satış adedine dayalıdır.',level:'info'});
 const rev=sales.reduce((n,x)=>n+Number(x.total||0),0),cost=sales.reduce((n,x)=>n+Number(x.productCost||0),0),expense=(s.expenses||[]).reduce((n,x)=>n+Number(x.amount||0),0),net=rev-cost-expense;
 if(rev>0)out.push({title:'Gün içi performans',text:`Ciro ${rev.toFixed(2)} TL · kayıtlı maliyet ve masraflar sonrası net ${net.toFixed(2)} TL · net marj %${((net/rev)*100).toFixed(1)}.`,level:net<0?'warn':'info'});
 if(!out.length)out.push({title:'Kontrol tamamlandı',text:'Stok, maliyet ve tekrarlanan satış kontrollerinde uyarı bulunmadı. Bu kontrol, tüm hesapların doğruluğunu garanti etmez.',level:'info'});
 return out;
}
const api={dateKey,validDate,businessDate,sessionId,nextDate,normalize,sameSession,recoverySafe,productIssue,productAudit,operationalMetrics,insights};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.BtddSafety=api;
})(typeof globalThis!=='undefined'?globalThis:this);
