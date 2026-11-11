import {validExpense, validTrip} from './core.js';
export const DEMO_KEY='travel-portfolio-library-v1';
const copy=value=>JSON.parse(JSON.stringify(value));
export function exampleLibrary(){
 const trips=[
  {id:'demo-europa',name:'España y Francia · Primavera',countries:['España','Francia'],start_date:'2027-03-12',end_date:'2027-03-25',status:'active',rate:4400,revision:1,created_at:'2027-01-02T12:00:00Z'},
  {id:'demo-italia',name:'Italia y Suiza · Verano',countries:['Italia','Suiza'],start_date:'2027-07-05',end_date:'2027-07-17',status:'active',rate:4600,revision:1,created_at:'2027-01-03T12:00:00Z'},
  {id:'demo-colombia',name:'Colombia · Escapada cafetera',countries:['Colombia'],start_date:'2026-09-10',end_date:'2026-09-15',status:'archived',rate:4500,revision:1,created_at:'2026-08-01T12:00:00Z'}
 ];
 const source=[
  ['demo-europa','2027-03-12','España','Madrid','Hospedaje','Hotel cerca del centro',180,'EUR','Tarjeta','demo-a'],
  ['demo-europa','2027-03-13','España','Madrid','Alimentación','Desayuno en la plaza',24,'EUR','Efectivo','demo-b'],
  ['demo-europa','2027-03-14','España','Barcelona','Transporte','Tren a Barcelona',92,'EUR','Tarjeta','demo-a'],
  ['demo-europa','2027-03-15','España','Barcelona','Turismo','Entradas al museo',36,'EUR','Tarjeta','demo-b'],
  ['demo-europa','2027-03-18','Francia','París','Hospedaje','Apartamento por dos noches',310,'EUR','Tarjeta','demo-a'],
  ['demo-europa','2027-03-19','Francia','París','Alimentación','Cena de bienvenida',68,'EUR','Tarjeta','demo-b'],
  ['demo-europa','2027-03-20','Francia','Lyon','Supermercado','Compras para el recorrido',154000,'COP','Efectivo','demo-a'],
  ['demo-europa','2027-03-21','Francia','Lyon','Otros','Consigna de equipaje',12,'EUR','Efectivo','demo-b'],
  ['demo-italia','2027-07-05','Italia','Roma','Hospedaje','Reserva de alojamiento',240,'EUR','Tarjeta','demo-b'],
  ['demo-italia','2027-07-06','Italia','Roma','Turismo','Visita guiada al centro',55,'EUR','Tarjeta','demo-a'],
  ['demo-italia','2027-07-07','Italia','Florencia','Alimentación','Almuerzo en el mercado',32,'EUR','Efectivo','demo-b'],
  ['demo-italia','2027-07-09','Italia','Milán','Transporte','Billetes de tren',76,'EUR','Tarjeta','demo-a'],
  ['demo-italia','2027-07-12','Suiza','Lucerna','Entretenimiento','Paseo por el lago',46,'EUR','Tarjeta','demo-b'],
  ['demo-italia','2027-07-13','Suiza','Zúrich','Compras','Recuerdos del viaje',184000,'COP','Tarjeta','demo-a'],
  ['demo-colombia','2026-09-10','Colombia','Pereira','Transporte','Traslado al alojamiento',65000,'COP','Efectivo','demo-a'],
  ['demo-colombia','2026-09-11','Colombia','Salento','Hospedaje','Cabaña entre montañas',480000,'COP','Tarjeta','demo-b'],
  ['demo-colombia','2026-09-12','Colombia','Salento','Turismo','Recorrido por finca cafetera',90000,'COP','Efectivo','demo-a'],
  ['demo-colombia','2026-09-13','Colombia','Filandia','Alimentación','Almuerzo regional',78000,'COP','Tarjeta','demo-b'],
  ['demo-colombia','2026-09-14','Colombia','Filandia','Compras','Artesanías del pueblo',55000,'COP','Efectivo','demo-a']
 ];
 const expenses=source.map((r,i)=>({id:'sample-'+(i+1),trip_id:r[0],date:r[1],country:r[2],city:r[3],category:r[4],description:r[5],amount:r[6],currency:r[7],payment:r[8],payer_id:r[9],rate:trips.find(t=>t.id===r[0]).rate,created_by:i%2?'demo-b':'demo-a',created_by_name:i%2?'Valeria':'Alex',notes:'Registro ficticio de demostración',created_at:r[1]+'T12:00:00Z',updated_at:r[1]+'T12:00:00Z',version:1}));
 return {schemaVersion:1,trips,expenses};
}
function validate(state){
 if(!state||state.schemaVersion!==1||!Array.isArray(state.trips)||!Array.isArray(state.expenses))throw Error('No se pudo leer la demo guardada. Los datos existentes se conservaron.');
 if(state.trips.some(t=>!validTrip(t)||!['active','archived'].includes(t.status))||state.expenses.some(e=>!validExpense(e)||!state.trips.some(t=>t.id===e.trip_id)))throw Error('La información de demostración guardada no es válida. No se ha reemplazado.');
 return state;
}
// Adaptador local: no importa SDK, no autentica usuarios y no realiza peticiones de red.
export class DemoStore {
 constructor(storage=globalThis.localStorage){this.storage=storage;this.deviceId='portfolio-browser';this.tripId=null;this.trips=[];this.multi=true;this.timer=null;this.generation=0}
 read(){const saved=this.storage.getItem(DEMO_KEY);return saved===null?null:validate(JSON.parse(saved))}
 commit(state){validate(state);this.storage.setItem(DEMO_KEY,JSON.stringify(state));this.trips=copy(state.trips)}
 requireTrip(state,editable=false){const trip=state.trips.find(t=>t.id===this.tripId);if(!trip)throw Error('Abre un viaje primero');if(editable&&trip.status==='archived')throw Error('Este viaje está archivado. Reactívalo para modificar gastos.');return trip}
 async connect(){let state=this.read();if(!state){state=exampleLibrary();this.commit(state)}else this.trips=copy(state.trips);if(!this.tripId||!state.trips.some(t=>t.id===this.tripId))this.tripId=state.trips[0]?.id;return this.snapshot()}
 async listTrips(){const state=this.read();this.trips=copy(state.trips);return this.trips}
 async snapshot(id=this.tripId){const state=this.read();const trip=state?.trips.find(t=>t.id===id);if(!trip)throw Error('El viaje no está disponible');return copy({trip,expenses:state.expenses.filter(e=>e.trip_id===id)})}
 async open(id){const data=await this.snapshot(id);this.stop();this.tripId=id;return data}
 async createTrip(data,label,requestId=null){if(!validTrip(data))throw Error('Revisa los datos del viaje');const state=this.read();const existing=requestId&&state.trips.find(t=>t.request_id===requestId);if(existing)return this.open(existing.id);const trip={...copy(data),id:crypto.randomUUID(),status:'active',revision:0,created_at:new Date().toISOString(),request_id:requestId};state.trips.push(trip);this.commit(state);return this.open(trip.id)}
 async save(data,actor,old=null,importKey=null){
  if(!validExpense(data)||!['demo-a','demo-b'].includes(data.payer_id)||!['Alex','Valeria'].includes(actor))throw Error('Revisa los datos del gasto');
  const state=this.read(),trip=this.requireTrip(state,true),stamp=new Date().toISOString();
  if(old){const index=state.expenses.findIndex(e=>e.id===old.id&&e.trip_id===this.tripId);if(index<0||state.expenses[index].version!==old.version)throw Error('El gasto cambió. Vuelve a abrirlo antes de editar');state.expenses[index]={...state.expenses[index],...copy(data),id:old.id,trip_id:trip.id,created_by:state.expenses[index].created_by,created_by_name:state.expenses[index].created_by_name,created_at:state.expenses[index].created_at,updated_at:stamp,version:old.version+1}}
  else {if(importKey){const exists=state.expenses.find(e=>e.trip_id===trip.id&&e.imported_from===importKey);if(exists)return exists.id}state.expenses.push({...copy(data),id:crypto.randomUUID(),trip_id:trip.id,created_by:actor==='Alex'?'demo-a':'demo-b',created_by_name:actor,created_at:stamp,updated_at:stamp,version:1,imported_from:importKey})}
  trip.revision++;this.commit(state);
 }
 async remove(old){const state=this.read(),trip=this.requireTrip(state,true);const index=state.expenses.findIndex(e=>e.id===old.id&&e.trip_id===trip.id&&e.version===old.version);if(index<0)throw Error('El gasto cambió. Actualiza la lista');state.expenses.splice(index,1);trip.revision++;this.commit(state)}
 async rate(value){if(!Number.isFinite(value)||value<=0||value>1e9)throw Error('Tasa inválida');const state=this.read(),trip=this.requireTrip(state,true);trip.rate=value;trip.revision++;this.commit(state)}
 async setStatus(status){if(!['active','archived'].includes(status))throw Error('Estado inválido');const state=this.read(),trip=this.requireTrip(state);trip.status=status;trip.revision++;this.commit(state);return this.snapshot()}
 async devices(){return []}
 async refresh(){const generation=this.generation;try{await this.listTrips();const data=await this.snapshot();if(generation!==this.generation)return;await this.onChange?.(data);this.onStatus?.('ready')}catch(e){this.onStatus?.('error',e.message)}}
 watch(onChange,onStatus){this.stop();this.onChange=onChange;this.onStatus=onStatus;this.timer=setInterval(()=>this.refresh(),15000);this.timer.unref?.()}
 stop(){this.generation++;if(this.timer)clearInterval(this.timer);this.timer=null}
}
