# Seguridad y separación de datos

Esta edición es una demo de portafolio con información ficticia y un historial Git nuevo. No contiene la conexión, las sesiones, los respaldos ni el historial de la aplicación personal.

- Los datos se guardan en `travel-portfolio-library-v1` y el perfil en `travel-portfolio-profile-v1`, dentro de LocalStorage del navegador.
- Cada navegador tiene su propia biblioteca. No hay servidor de datos, autenticación ni sincronización entre dispositivos.
- El adaptador de demostración no realiza solicitudes de red. La interfaz y ExcelJS se sirven desde el mismo origen.
- La configuración de alojamiento restringe los recursos y conexiones al mismo origen mediante Content Security Policy.
- No se deben introducir datos personales o financieros reales en esta demostración.
- Un fallo de almacenamiento o un JSON dañado no provoca que la aplicación sustituya los datos guardados por los ejemplos iniciales.
- Las claves de almacenamiento usadas por la aplicación personal no se consultan ni se eliminan.

Los controles de versiones y archivo permiten demostrar flujos de edición, pero no constituyen seguridad frente a alguien con acceso al navegador. LocalStorage puede inspeccionarse y modificarse desde las herramientas de desarrollo.

Antes de publicar: `npm run check:publish`. Se excluyen dependencias, sesiones, exportaciones y respaldos. ExcelJS se distribuye bajo la licencia MIT incluida en `dist/vendor/LICENSE-ExcelJS.txt`; las capturas contienen solo datos ficticios.
