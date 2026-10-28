# Sistema Motos — Demo de inventario

Demo comercial local para organizar, consultar y presentar el inventario de un negocio de motocicletas. Está construida con HTML, CSS y JavaScript sin frameworks, sin backend y sin autenticación.

Todos los datos, precios y fotografías son **ilustrativos**. No representan una oferta comercial, una valoración de mercado ni información de un negocio real.

## Inicio rápido

```bash
cd C:/Users/chiqu/SistemaMotos
python -m http.server 8765
```

Abre `http://127.0.0.1:8765/` en el navegador.

También puedes abrir `index.html` directamente, pero se recomienda el servidor local para que el navegador trate la demo como un origen HTTP estable y para probar la descarga del CSV en las mismas condiciones de la grabación.

## Funcionalidades

- **Resumen** con total, disponibles, reservadas, vendidas y valor estimado de las motos disponibles.
- **Inventario** con tarjetas, vista de tabla, búsqueda y filtros combinables por marca, estado, categoría, precio y cilindraje.
- **Ficha** por motocicleta con precio, año, kilometraje, color, transmisión, estado y descripción.
- **Alta y edición** con validación de campos obligatorios, duplicados, rangos numéricos y longitudes.
- **Cambio de estado** entre disponible, reservada y vendida.
- **Categorías** con conteos calculados desde el inventario actual.
- **Reportes** por estado, marca y rango de precio.
- **Exportación CSV** con encabezados en español, estados legibles, escape de comillas y neutralización de fórmulas.
- **Persistencia local** en `localStorage` con mensajes diferenciados de éxito, fallo de guardado y modo solo sesión.
- **Restauración** de los 14 registros iniciales.
- **Responsive** en escritorio, tableta y móvil, con menú lateral y diálogos adaptados.
- **Accesibilidad**: skip link, navegación por teclado, foco visible, cierre de diálogos con `Escape`, etiquetas ARIA y contraste revisado.

## Datos de demostración

El inventario inicial contiene 14 motocicletas con referencias `SM-2401` a `SM-2414`, marcas y modelos coherentes, precios en COP y estados válidos. Las fotografías están guardadas localmente en `assets/motos/` y el hero en `assets/hero-moto.jpg`; no se consultan servicios externos con clave.

Las imágenes se usarán como material ilustrativo. No se afirma que correspondan exactamente al modelo, color o versión de cada ficha. Si alguna imagen no carga, la interfaz muestra un fallback gráfico con la marca y el modelo.

## Persistencia

- Los cambios se guardan en `localStorage` bajo la clave `sistema-motos-demo-v1`.
- La interfaz solo confirma “guardado en este navegador” cuando `localStorage` respondió correctamente.
- Si el navegador bloquea el almacenamiento, la demo sigue funcionando en la sesión actual y muestra este aviso:
  > Los cambios se aplicaron en esta sesión, pero no se pudieron guardar en el almacenamiento local. Se perderán al recargar.
- La página **Configuración demo** muestra si el almacenamiento local está disponible.
- **Restaurar datos de ejemplo** reemplaza los cambios guardados por los 14 registros iniciales.

## Estructura

```text
index.html          Shell de la aplicación, navegación y diálogo
styles.css          Estilos base y ajustes responsive/accesibles
js/data.js          Inventario inicial y ruta del hero
js/core.js          Filtros, métricas, COP, CSV y validación (también para Node)
js/app.js           Render, eventos, formularios, persistencia y navegación
tests/core.test.cjs Pruebas de lógica y de integridad de datos
assets/motos/       14 fotografías locales
assets/hero-moto.jpg Fotografía principal
DEMO_VIDEO.md       Guion y checklist para grabar el video comercial
```

## Pruebas

```bash
node --check js/app.js
node --check js/core.js
node --check js/data.js
node tests/core.test.cjs
```

La suite valida, entre otros puntos:

- Filtros combinados, búsqueda sin acentos, rangos de precio/cilindraje y año.
- Métricas del tablero y valor estimado solo de motos disponibles.
- Formato COP.
- CSV con BOM, encabezados en español, estados legibles, comillas escapadas y prevención de fórmulas.
- Validación de altas y ediciones: obligatorios, duplicados, negativos, límites, años y categorías.
- Integridad del inventario: 14 registros, IDs y fotos únicos, fotos existentes, fechas y avisos de datos ilustrativos.

Resultado esperado:

```text
core tests passed (14 seed motorcycles, 15 CSV rows)
```

## Verificación en navegador

La demo fue revisada en Chromium con `http://127.0.0.1:8765/`:

- Consola sin errores.
- Las 14 fotografías y el hero cargan localmente.
- Filtros numéricos conservan el foco mientras se escribe.
- Filtros, búsqueda, vista de tabla, categorías, reportes y fichas responden.
- Alta, edición, duplicados y negativos muestran errores junto al campo correspondiente.
- Persistencia comprobada tras recargar.
- Fallo simulado de `localStorage` muestra el mensaje de solo sesión.
- Descarga CSV con 15 líneas y exportación filtrada con una sola moto.
- Sin desbordamiento horizontal en 1920×1080, 1366×768, 768×1024 y 390×844.
- Menú móvil con foco atrapado, cierre con `Escape` y retorno de foco.
- Diálogos con encabezado y pie de acciones siempre accesibles.
- Lighthouse: accesibilidad 100, buenas prácticas 100 y SEO 100.

No se registró el video comercial; el guion está en `DEMO_VIDEO.md`.

## Dependencias

- Navegador moderno con soporte para `<dialog>`, `localStorage` y `Blob`.
- Python 3 (opcional, solo para el servidor local).
- Node.js (solo para ejecutar las pruebas).
- Google Fonts para DM Sans y Manrope. Si no hay conexión, el navegador usa la fuente del sistema.
- Sin backend, base de datos, API con clave ni proceso de compilación.

## Limitaciones

- Los cambios viven únicamente en el navegador y no se sincronizan entre dispositivos.
- No hay usuarios reales, permisos, pagos ni integraciones externas.
- Los precios no se calculan con reglas de negocio ni con valores de mercado.
- Las imágenes son ilustrativas y pueden no coincidir con la versión exacta del modelo.
- La exportación CSV descarga el archivo mediante el navegador; el comportamiento de la barra de descargas depende de cada navegador.
