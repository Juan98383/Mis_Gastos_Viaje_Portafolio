# Publicar la demo de portafolio

Esta carpeta constituye una aplicación independiente. No requiere base de datos ni variables de entorno.

## Ejecutar localmente

Con Node.js 22 o superior, ejecutar `npm start` y abrir http://127.0.0.1:4173. Para usar otro puerto: `PORT=4174 npm start`.

## Alojar como sitio estático

1. Crear un **sitio nuevo de demostración** en Netlify o un alojamiento estático equivalente.
2. Vincular este repositorio o cargar únicamente el contenido de `dist`.
3. Configurar la carpeta de publicación `dist`, sin comando de compilación.
4. Conservar el manifiesto, el service worker y el directorio `vendor`.
5. Verificar los tres viajes ficticios, los formularios y la descarga de Excel en la dirección nueva.

`netlify.toml` incluye la carpeta de publicación y cabeceras de seguridad. La demo utiliza rutas desde la raíz; en un alojamiento con subcarpeta se necesitaría adaptar esas rutas antes de publicarla.

**No usar el sitio de la aplicación personal ni añadir credenciales de servicios reales.** Este repositorio no realiza migraciones ni despliega automáticamente. GitHub Actions solo ejecuta comprobaciones y pruebas.
