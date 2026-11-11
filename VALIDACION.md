# Validación de la demostración

## Pruebas automatizadas

- 15 pruebas unitarias: conversión EUR/COP, filtros, promedio diario, validación de gastos y viajes, semillas independientes, creación vacía e idempotente, conservación del autor, conflicto de versiones, archivo/reactivación, separación de viajes, persistencia e integridad ante errores de almacenamiento.
- Recorrido Playwright en Chromium con pantallas de PC y celular: biblioteca de tres viajes; registro, edición y eliminación; filtros; archivo; creación de otro viaje; recuperación al recargar e independencia de almacenamiento entre visitantes.
- Archivo XLSX descargado realmente desde el navegador y leído con ExcelJS: dos hojas, selección filtrada correcta, montos numéricos y países coincidentes con el filtro.
- Interfaz cargada bajo Content Security Policy y apertura después de desconectar el navegador mediante el service worker.
- Cero solicitudes a servicios externos durante el recorrido.
- Seis capturas generadas desde la demo, incluyendo una vista móvil sin desbordamiento horizontal.

## Separación y publicación

La carpeta de portafolio se creó con archivos seleccionados, sin copiar la base de datos, la configuración del servicio real ni el historial Git de la aplicación personal. La comprobación de publicación revisa los archivos versionables y detecta credenciales, conexiones a producción, respaldos, exportaciones y archivos locales ajenos al proyecto.

## Límites

Las pruebas de pantalla móvil se ejecutan en Chromium con una ventana de tamaño móvil; no sustituyen una prueba en Safari sobre un iPhone físico. La apertura sin conexión requiere una primera visita con conexión y soporte de service workers. El almacenamiento local depende del navegador y no equivale a un respaldo duradero. La prueba no valida sincronización de nube porque esta edición no la implementa.
