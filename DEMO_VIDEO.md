# Guion para video comercial — Sistema Motos

Video de producto de **30 a 45 segundos** para presentar la demo local de Sistema Motos.
No se graba aquí: este documento es la pauta de captura y montaje.

---

## 1. Preparación antes de grabar

1. Ejecuta el servidor local desde la carpeta del proyecto:
   ```bash
   cd C:/Users/chiqu/SistemaMotos
   python -m http.server 8765
   ```
2. Abre `http://127.0.0.1:8765/` en una ventana limpia del navegador.
3. Ve a **Configuración demo → Restaurar datos de ejemplo** y confirma. Así el video inicia con:
   - 14 motocicletas
   - 9 disponibles
   - 3 reservadas
   - 2 vendidas
   - Valor estimado disponible: `$ 142.300.000 COP`
4. Configura la grabación en **1920 × 1080**, relación 16:9, 30 o 60 fps, zoom del navegador al 100 %.
5. Cierra pestañas personales, notificaciones, DevTools y extensiones. Oculta marcadores y barra de descargas si es posible.
6. Usa un perfil de navegador limpio. El perfil visible es ficticio (**Andrés Mejía · demo**), igual que el negocio **Ruta Motor**.
7. Deja el cursor visible y muévelo con pausas cortas; evita movimientos bruscos.
8. Ten a mano el botón de restaurar datos para repetir tomas sin reiniciar el servidor.

> Todos los datos, precios y fotografías son ilustrativos. No son una oferta comercial ni una valoración real.

---

## 2. Versión maestra de 42 segundos

| Tiempo | Sección | Acción en pantalla | Texto en pantalla / voz en off |
|---|---|---|---|
| 0:00–0:03 | Resumen | Plano fijo del hero y las cinco métricas. | **“Todo tu inventario. En una sola vista.”** |
| 0:03–0:07 | Resumen | Scroll suave hasta “Inventario por categoría”, “Estado del inventario” y actividad reciente. | “Disponibles, reservadas, vendidas y valor estimado, siempre a la vista.” |
| 0:07–0:12 | Inventario | Clic en **Inventario**. En el filtro de precio mínimo escribe `10000000`; luego elige la marca **Yamaha**. | “Filtra por precio, marca, estado o categoría, sin perder lo que estás escribiendo.” |
| 0:12–0:16 | Inventario | Pausa breve en los dos resultados. Clic en **Limpiar filtros**. Escribe `ninja` en la búsqueda y muestra el resultado. Limpia la búsqueda. | “Busca por marca, modelo o referencia en segundos.” |
| 0:16–0:21 | Ficha | Abre la ficha de **Yamaha MT-03**. Recorre precio, año, cilindraje, kilometraje y estado. Clic en **Marcar reservada**. Espera el aviso de guardado. | “Cada moto tiene su ficha completa y su estado actualizado.” |
| 0:21–0:26 | Formulario | Cierra la ficha. Clic en **Agregar motocicleta**. Completa solo los campos visibles con calma (marca, modelo, referencia, año, cilindraje, kilometraje y precio). Guarda. | “Registra una moto nueva con validación de datos desde el primer momento.” |
| 0:26–0:30 | Categorías / Reportes | Ve a **Categorías**, muestra las cinco tarjetas. Entra a **Reportes** y recorre las barras por estado, marca y rango de precio. | “Visualiza tu inventario por estilo y toma decisiones con reportes claros.” |
| 0:30–0:34 | Reportes / Inventario | Clic en **Exportar CSV**. Muestra el aviso de exportación y, si el navegador lo permite, el nombre del archivo descargado. | “Exporta tu inventario a CSV cuando lo necesites.” |
| 0:34–0:38 | Configuración | Abre **Configuración demo**. Muestra “Almacenamiento local: Disponible” y el alcance de la demo. Abre **Restaurar datos de ejemplo** y cancela. | “Los cambios se guardan en este navegador. Sin backend, sin configuración.” |
| 0:38–0:42 | Cierre | Vuelve al **Resumen** o funde a tarjeta final con logo. | **“Sistema Motos. Orden para crecer.”** |

### Cierre en pantalla

- **Sistema Motos**
- *Inventario, fichas, estados y reportes en una sola vista.*
- “Demo local · Datos ilustrativos”

---

## 3. Versión corta de 30 segundos

Si el corte final debe durar 30 s, conserva estas tomas y elimina el formulario completo:

| Tiempo | Toma |
|---|---|
| 0:00–0:03 | Hero y métricas del resumen. |
| 0:03–0:06 | Scroll a gráficos y actividad reciente. |
| 0:06–0:11 | Filtro de precio + marca Yamaha; pausa en resultados. |
| 0:11–0:15 | Búsqueda `ninja` y limpieza. |
| 0:15–0:19 | Ficha MT-03 y cambio a **Reservada**. |
| 0:19–0:23 | Categorías y reportes. |
| 0:23–0:27 | Exportar CSV y aviso de confirmación. |
| 0:27–0:30 | Cierre con logo y mensaje. |

El formulario de alta puede omitirse en 30 s; la validación ya se percibe en la ficha y en los filtros.

---

## 4. Tomas de apoyo para móvil

Graba por separado en **390 × 844** (o 1080 × 2340 vertical si el destino es redes) y úsalo como inserto de 3–4 s:

1. Resumen en una columna, con las métricas en dos columnas.
2. Clic en el menú ☰; se abre la navegación lateral y el fondo se atenúa.
3. Clic en **Inventario**; muestra una tarjeta por fila.
4. Abre una ficha; el diálogo ocupa el ancho disponible y el pie de acciones queda accesible.
5. Cierra el menú con **Escape** o tocando fuera.

No mezcles el clip móvil con el escritorio sin un corte claro o una transición de dispositivo.

---

## 5. Voz en off sugerida (42 s)

> “Todo tu inventario, en una sola vista. Consulta disponibles, reservadas, vendidas y el valor estimado de tu negocio. Filtra por precio, marca, estado o categoría, y busca cualquier moto en segundos. Abre su ficha, revisa sus datos y actualiza su estado. Registra nuevas motos con validación desde el primer momento. Analiza tu inventario por categoría y exporta todo a CSV. Sistema Motos: orden para crecer.”

**Ajuste de tono:** lectura tranquila, cercana y profesional. Evita palabras como “garantizado”, “tiempo real”, “la mejor del mercado” o “sin errores”.

---

## 6. Buenas prácticas de montaje

- Usa cortes secos entre secciones y un fundido corto solo al cierre.
- Mantén el cursor quieto durante las pausas y evita el temblor del puntero.
- No aceleres las escrituras en los filtros: el objetivo es mostrar que el foco se conserva.
- Deja visible cada aviso de guardado al menos un segundo.
- Añade subtítulos incrustados o pista SRT; el video debe entenderse sin audio.
- Música instrumental suave, sin voces, a volumen bajo.
- No muestres el escritorio, archivos personales, DevTools, la barra de descargas ni datos reales.
- Si el navegador bloquea la descarga, no insistas en cámara: muestra el aviso de exportación y corta.
- Si usas la versión móvil, graba en un dispositivo o ventana independiente; no redimensiones en directo.

---

## 7. Después de grabar

1. Restaura los datos desde **Configuración demo** para dejar la demo lista para la siguiente presentación.
2. Detén el servidor con `Ctrl + C` si ya no lo necesitas.
3. Conserva el archivo final como `sistema-motos-demo-30s.mp4` o `sistema-motos-demo-45s.mp4`.
4. Guarda una copia del CSV exportado solo si necesitas mostrar el resultado; no lo incluyas si contiene datos que no quieres publicar.

---

## 8. Mensajes que sí conviene comunicar

- Inventario visual y centralizado.
- Fichas completas por motocicleta.
- Filtros combinables y búsqueda inmediata.
- Estados: disponible, reservada y vendida.
- Reportes y valor estimado disponible.
- Exportación CSV.
- Guardado local en el navegador.
- Demo sin backend ni registro de usuarios.

## 9. Mensajes que conviene evitar

- “Datos en tiempo real” o “sincronización en la nube”.
- “Precios oficiales” o “valoración de mercado”.
- “Funciona sin internet” si se mantienen las fuentes de Google Fonts.
- “Fotos oficiales de cada modelo”: las imágenes son ilustrativas.
- Cualquier promesa de seguridad, respaldo o cumplimiento tributario.
