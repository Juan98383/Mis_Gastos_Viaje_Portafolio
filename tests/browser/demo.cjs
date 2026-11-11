const {chromium}=require('playwright');
const ExcelJS=require('exceljs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const results=path.join(root,'test-results');fs.mkdirSync(results,{recursive:true});
const captures=process.env.UPDATE_SCREENSHOTS==='1'?path.join(root,'docs/capturas'):results;
fs.mkdirSync(captures,{recursive:true});
const policy="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; worker-src 'self'; manifest-src 'self'";
const server=http.createServer((req,res)=>{try{const p=path.resolve(root,'dist','.'+(req.url==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));if(!p.startsWith(path.join(root,'dist')+path.sep))throw Error();const type={'.html':'text/html','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};res.setHeader('Content-Type',type[path.extname(p)]||'application/octet-stream');res.setHeader('Content-Security-Policy',policy);res.end(fs.readFileSync(p))}catch{res.writeHead(404);res.end()}});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port;
 let browser;try{browser=await chromium.launch({headless:true,...(process.env.TRAVEL_CHROMIUM_PATH?{executablePath:process.env.TRAVEL_CHROMIUM_PATH}:{}),args:['--no-sandbox']})}catch(e){server.close();throw e}
 const errors=[],external=[];
 async function page(viewport){const ctx=await browser.newContext({viewport,acceptDownloads:true});const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));ctx.on('request',r=>{if(!r.url().startsWith(origin+'/')&&!r.url().startsWith('blob:')&&!r.url().startsWith('data:'))external.push(r.url())});p.on('dialog',d=>d.accept());p.setDefaultTimeout(10000);await p.goto(origin,{waitUntil:'networkidle'});await p.getByRole('heading',{name:'España y Francia · Primavera',exact:true}).waitFor();return p}
 const shot=async(p,name)=>{await p.screenshot({path:path.join(captures,name),fullPage:true,animations:'disabled'})};
 try{
 const pc=await page({width:1440,height:1000});
 await pc.getByRole('button',{name:'Todos · 3',exact:true}).click();await shot(pc,'01-viajes.png');
 await pc.locator('article').filter({has:pc.getByRole('heading',{name:'España y Francia · Primavera',exact:true})}).getByRole('button',{name:'Abrir viaje'}).click();await pc.getByText('8 recuerdos registrados',{exact:true}).waitFor();await shot(pc,'02-resumen.png');
 await pc.getByRole('button',{name:'Dashboard',exact:true}).click();await shot(pc,'03-dashboard.png');
 await pc.getByLabel('País',{exact:true}).selectOption('Francia');
 const downloadPromise=pc.waitForEvent('download');await pc.getByRole('button',{name:'Descargar Excel'}).click();const download=await downloadPromise;const xlsxPath=path.join(results,'seleccion-ficticia.xlsx');await download.saveAs(xlsxPath);
 const workbook=new ExcelJS.Workbook();await workbook.xlsx.readFile(xlsxPath);assert.deepEqual(workbook.worksheets.map(w=>w.name),['Detalle de gastos','Resumen']);const detail=workbook.getWorksheet('Detalle de gastos');assert.equal(detail.rowCount,5);assert.equal(typeof detail.getCell('F2').value,'number');for(let i=2;i<=5;i++)assert.equal(detail.getCell('B'+i).value,'Francia');
 await pc.getByRole('button',{name:'Limpiar filtros',exact:true}).click();await pc.getByRole('button',{name:'Historial',exact:true}).click();await shot(pc,'04-historial.png');
 await pc.getByRole('button',{name:'Registrar',exact:true}).click();await pc.getByLabel('Monto',{exact:true}).fill('27.5');await pc.getByLabel('Fecha',{exact:true}).fill('2027-03-22');await pc.getByLabel('País',{exact:true}).selectOption('España');await pc.getByLabel('Ciudad',{exact:true}).fill('Madrid');await pc.getByLabel('Descripción',{exact:true}).fill('Café de prueba ficticio');await shot(pc,'05-registrar-gasto.png');await pc.getByRole('button',{name:'Guardar gasto',exact:true}).click();
 await pc.getByRole('button',{name:'Ver Café de prueba ficticio',exact:true}).click();await pc.getByRole('button',{name:'Editar gasto',exact:true}).click();await pc.getByLabel('Monto',{exact:true}).fill('30');await pc.getByRole('button',{name:'Guardar cambios',exact:true}).click();await pc.getByRole('button',{name:'Ver Café de prueba ficticio',exact:true}).click();await pc.getByRole('button',{name:'Eliminar',exact:true}).click();assert.equal(await pc.getByRole('button',{name:'Ver Café de prueba ficticio',exact:true}).count(),0);
 await pc.getByRole('button',{name:'Mis viajes',exact:true}).first().click();await pc.getByRole('button',{name:'Archivados · 1',exact:true}).click();await pc.getByRole('button',{name:'Consultar viaje'}).click();await pc.getByRole('button',{name:'Registrar',exact:true}).click();await pc.getByRole('heading',{name:'Viaje archivado',exact:true}).waitFor();
 await pc.getByRole('button',{name:'Mis viajes',exact:true}).first().click();await pc.getByRole('button',{name:'Nuevo viaje',exact:true}).click();await pc.getByLabel('Nombre del viaje').fill('Portugal · Ejemplo nuevo');await pc.getByLabel('Fecha de inicio',{exact:true}).fill('2028-05-01');await pc.getByLabel('Fecha de fin',{exact:true}).fill('2028-05-07');await pc.getByLabel('Países',{exact:true}).fill('Portugal');await pc.getByRole('button',{name:'Crear viaje',exact:true}).click();await pc.getByText('0 recuerdos registrados',{exact:true}).waitFor();
 await pc.reload({waitUntil:'networkidle'});await pc.getByRole('heading',{name:'Portugal · Ejemplo nuevo',exact:true}).waitFor();
 const mobile=await page({width:390,height:844});await mobile.getByRole('button',{name:'Todos · 3',exact:true}).click();assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mobile.locator('article').filter({has:mobile.getByRole('heading',{name:'España y Francia · Primavera',exact:true})}).getByRole('button',{name:'Abrir viaje'}).click();await mobile.getByText('8 recuerdos registrados',{exact:true}).waitFor();await mobile.screenshot({path:path.join(captures,'06-celular.png'),fullPage:false,animations:'disabled'});
 await mobile.evaluate(()=>navigator.serviceWorker.ready);await mobile.context().setOffline(true);await mobile.reload({waitUntil:'domcontentloaded'});await mobile.getByRole('heading',{name:'España y Francia · Primavera',exact:true}).waitFor();
 assert.deepEqual(external,[],'La demo no debe consultar servicios externos');assert.deepEqual(errors,[]);
 console.log('Navegador: PC/celular, 3 viajes, CRUD, filtros, XLSX real, archivo, creación vacía, persistencia, aislamiento por visitante y apertura sin conexión: OK. Cero solicitudes externas.');
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(e=>{console.error(e);process.exitCode=1});
