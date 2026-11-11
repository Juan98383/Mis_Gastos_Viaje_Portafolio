import {equivalents, aggregate, total} from './core.js';
export async function exportTripWorkbook(rows,trip,members,filters={}){
 if(!globalThis.ExcelJS)throw Error('No se pudo cargar el exportador de Excel. Recarga la demo.');
 const person=id=>members.find(m=>m.user_id===id)?.name||'Viajero';
 const wb=new ExcelJS.Workbook();wb.creator='Mis Gastos de Viaje · Demo';wb.created=new Date();
 const sheet=wb.addWorksheet('Detalle de gastos');
 const headers=['Fecha','País','Ciudad','Categoría','Descripción','Monto','Moneda','Equivalente COP','Tasa COP por EUR','Método de pago','Persona que pagó','Usuario que registró','Equivalente EUR','Observaciones'];
 sheet.addRow(headers);
 for(const e of rows){const v=equivalents(e);sheet.addRow([e.date,e.country,e.city,e.category,e.description,Number(e.amount),e.currency,v.COP,Number(e.rate),e.payment,person(e.payer_id),e.created_by_name,v.EUR,e.notes||''])}
 sheet.columns=headers.map((h,i)=>({width:[4,13].includes(i)?38:23}));sheet.views=[{state:'frozen',ySplit:1}];sheet.autoFilter={from:'A1',to:'N'+Math.max(1,rows.length+1)};
 for(const n of [6,8,9,13])sheet.getColumn(n).numFmt=n===8?'"COP" #,##0.00':n===13?'"EUR" #,##0.00':'#,##0.00';
 sheet.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};sheet.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF244D57'}};
 const summary=wb.addWorksheet('Resumen');summary.addRow(['Viaje',trip.name]);summary.addRow(['Datos','Ficticios · Demostración de portafolio']);summary.addRow(['Filtros',JSON.stringify(filters)]);summary.addRow(['Dimensión','Elemento','EUR','COP']);
 for(const [key,title] of [['payer_id','Persona'],['country','País'],['city','Ciudad'],['category','Categoría'],['payment','Método de pago']]){const eur=aggregate(rows,key,'EUR'),cop=aggregate(rows,key,'COP');for(const k of Object.keys(eur))summary.addRow([title,key==='payer_id'?person(k):k,eur[k],cop[k]])}
 summary.addRow(['TOTAL','',total(rows,'EUR'),total(rows,'COP')]);summary.columns=[{width:24},{width:55},{width:24},{width:26}];summary.getColumn(3).numFmt='"EUR" #,##0.00';summary.getColumn(4).numFmt='"COP" #,##0.00';summary.getRow(4).font={bold:true};
 const data=await wb.xlsx.writeBuffer();const url=URL.createObjectURL(new Blob([data],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
 const link=document.createElement('a');link.href=url;link.download='DEMO-'+trip.name.replace(/[^\p{L}\p{N}-]+/gu,'-').slice(0,65)+'.xlsx';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
