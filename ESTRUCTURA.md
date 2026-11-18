# ZAZI — estructura de los catálogos

Los dos repositorios (`Zazi-pe/Zazi` y `Zazi-pe/Zazi-Modelos`) usan **los mismos archivos de código**.
Solo cambian sus datos (`productos.json`, `fotos/`).

| Archivo | Qué es | ¿Igual en los dos? |
|---|---|---|
| `index.html` | La tienda. Reconoce el catálogo por su dirección (`/Zazi/` o `/Zazi-Modelos/`). Datos de la tienda, `SITIOS` y `DIAS_NUEVO` arriba. | Sí |
| `admin.html` | El panel para editar el catálogo. Reconoce el catálogo por su dirección. | Sí |
| `validar.js` | Las reglas de revisión. Las usan el admin (antes de publicar) y GitHub Actions (antes de publicar la tienda). | Sí |
| `shopify.js` | Lee de Shopify el precio, las tallas y las agotadas de los productos conectados. Lo usan la tienda y el admin. | Sí |
| `.github/workflows/publicar.yml` | Revisa `productos.json` y publica en GitHub Pages. Si hay errores, no publica. | Sí |
| `productos.json` | Filtros y productos del catálogo. Lo escribe el admin. | No |
| `fotos/` | Fotos de productos. Las nuevas van en `fotos/<línea>/`. | No |
| `img/` | Logos, favicon y QR de Yape. | Sí |

Para probar en la computadora: `python3 -m http.server` en la carpeta que contiene la del repo y abrir
`http://localhost:8000/Zazi/` (o agregar `?sitio=zazi-modelos` a la dirección).

## productos.json

```json
{
  "filtros": [["anda","Anda"], ["you","You"]],
  "productos": [
    {"id":4001, "shopify":{"id":"15503136456925","color":"Gris Lila"}, "filtro":"you", "linea":"You",
     "nombre":"You Urbano Onda Gris Lila", "modelo":"You Urbano Onda", "color":"Gris Lila", "colores":["#B0A6BE"],
     "precio":59.9, "tallas":[35,40], "agotadas":["35","36"], "estado":"disponible", "creado":"2026-09-24",
     "foto":"fotos/you-urbano-onda-gris-lila.jpeg", "descripcion":"…"}
  ]
}
```

| Campo | Significado |
|---|---|
| `id` | Número único. Cada línea usa un bloque de 1000 (Anda 3000, You 4000…). Sirve para los enlaces `#p3001`. |
| `shopify` | Opcional. Conexión con Shopify: `id` del producto en Shopify y su `color` (como está en Shopify). Si está, el precio, las tallas y las agotadas salen de Shopify; lo guardado aquí queda de respaldo por si Shopify no responde. |
| `filtro` / `linea` | Clave y nombre de la línea o categoría (debe existir en `filtros`). |
| `nombre` / `modelo` / `color` | Nombre completo, modelo sin color y color. Mismo `filtro` + `modelo` = colores del mismo modelo. |
| `colores` | Tono del cuadrito: 1 o 2 hex. Sin tono, se muestra el nombre del color. |
| `precio` | Número, o `null` = "Consultar precio". |
| `tallas` | `[a, b]` = de a hasta b; `["36","38"]` = esas tallas; `["Único"]` = talla única. |
| `agotadas` | Tallas agotadas (texto). Si están todas, el producto se muestra agotado. |
| `estado` | `disponible`, `agotado` o `proximamente`. |
| `nuevo` | Sin el campo = automático (los primeros `DIAS_NUEVO` días desde `creado`); `"si"` o `"no"` lo fuerzan. |
| `creado` | Fecha de alta (AAAA-MM-DD). Ordena "Recomendados", decide "Nuevo" y la vitrina (el más nuevo). |
| `foto` | Ruta de la foto en el repositorio. |
| `descripcion` | Se muestra solo en el catálogo que tiene descripciones (`SITIOS` en `index.html`). |

## Diferencias entre los dos catálogos (`SITIOS` en index.html)

| | Zazi | Zazi-Modelos |
|---|---|---|
| Carrito guardado en | `zazi-carrito-v1` | `zazi-propios-carrito-v1` |
| Datos de la portada (100% / 24H / tallas) | Sí | No |
| Precio debajo del nombre en la ficha | No | Sí |
| Descripciones | Sí | No |

## Revisión (validar.js)

**Errores (no se publica):** sin foto o foto que no existe en el repo, precio no válido, sin tallas o tallas al
revés, nombre repetido, id repetido o no válido, línea que no existe, estado o "nuevo" no válidos.

**Avisos (se puede publicar):** sin tono de color, disponible con todas las tallas agotadas, agotadas que no
están en sus tallas, sin fecha de alta, fotos que ningún producto usa.
