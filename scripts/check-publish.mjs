import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const root=path.resolve(new URL('..',import.meta.url).pathname);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>['node_modules','.git','test-results'].includes(e.name)?[]:e.isDirectory()?walk(path.join(dir,e.name)):[path.relative(root,path.join(dir,e.name))])}
let files;try{files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean)}catch{files=walk(root)}
if(!files.length)files=walk(root);
const forbiddenNames=/(^|\/)(\.env(?:\..*)?|\.netlify|\.openai|backups?|respaldos?|node_modules|test-results)(\/|$)|\.(?:sql|dump|backup|har|xlsx|xls|csv|zip)$/i;
const connection=/https?:\/\/[a-z0-9.-]+\.supabase\.(?:co|com)\b/i;
const credential=new RegExp(['sb','(?:secret|publishable)','[A-Za-z0-9_-]{10,}'].join('_')+'|gh[pousr]_[A-Za-z0-9]{20,}|'+String.fromCharCode(45).repeat(5)+'BEGIN [A-Z ]*PRIVATE KEY');
for(const file of files){assert.ok(!forbiddenNames.test(file),'Archivo excluido de publicación: '+file);if(/\.(?:png|webm|ico)$/i.test(file))continue;if(file==='dist/vendor/exceljs-4.4.0.min.js'){assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex'),'7e49da68588e250dbb8bba190d2caa8ab3787cc0284bda1d8b2f805c4df742c9','La biblioteca de terceros cambió');continue}const text=fs.readFileSync(path.join(root,file),'utf8');assert.ok(!connection.test(text),'Conexión real en '+file);assert.ok(!credential.test(text),'Posible credencial en '+file);assert.ok(!/JUAN\s*&\s*SANDRA/i.test(text),'Etiqueta de viajeros reales en '+file)}
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'dist/config.js'),'utf8'),context);assert.deepEqual(JSON.parse(JSON.stringify(context.window.TRAVEL_CONFIG)),{demo:true});
const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');assert.ok(!/https?:\/\//.test(html),'El HTML no debe cargar recursos externos');
const css=fs.readFileSync(path.join(root,'dist/style-v2.css'),'utf8');assert.ok(!/@import|https?:\/\//.test(css),'El CSS no debe cargar recursos externos');
assert.ok(!fs.existsSync(path.join(root,'dist/cloud.js')),'No incluir el adaptador de producción');
for(const file of ['01-viajes.png','02-resumen.png','03-dashboard.png','04-historial.png','05-registrar-gasto.png','06-celular.png'])assert.ok(fs.statSync(path.join(root,'docs/capturas',file)).size>1000,'Falta captura: '+file);
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');for(const match of readme.matchAll(/(?:\]\(|src=")([^\s)"#]+)(?:\)|")/g)){const target=match[1];if(!/^https?:/.test(target))assert.ok(fs.existsSync(path.join(root,target)),'Enlace local roto: '+target)}
console.log('Publicación: '+files.length+' archivos, 6 capturas, configuración de demo y ausencia de credenciales, conexiones reales, respaldos y exportaciones: OK');
