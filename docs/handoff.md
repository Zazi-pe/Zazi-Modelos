# ZAZI catalogs — handoff (living document, last updated November 26, 2026)

Living handoff for the two catalog repos, **Zazi** and **Zazi-Modelos**. The same file lives in both repos at `docs/handoff.md`; whenever it's updated, the copy in the other repo is updated too. It is updated at the end of every Claude Code session (see `CLAUDE.md`).

It replaces the older handoffs (`ZAZI_handoff.md`, `ZAZImodels-handoff.md` and the Nov 4 chat handoff). Section 8 describes the Shopify connection; the Etiquetas handoff covers the Shopify worker and labels.

**Ground truth:** the code in the repos. If this document and the code disagree, trust the code and update this document.

---

## 1. Context and working rules

### Business
- **ZAZI** is a shoe store in Lima, Peru. Its legal entity is SP SHOP S.A.C.
- **Stefano** (Stefano Mateo Portalatino Tapia) works there and is a backend developer. His mother heads the business, so Stefano doesn't control every decision.
- **How customers buy:** they browse a static catalog site, add to a cart saved in the browser, and check out by sending a pre-filled WhatsApp message.
  - **Payment:** Yape (with QR) or cash. Yape and Plin are interoperable in Peru, so the site says **"Yape, Plin o en efectivo"** everywhere (meta description, catalog intro, "Cómo comprar", checkout option "Yape o Plin", WhatsApp message "Yape o Plin"). Transferencia isn't offered at checkout, so it isn't mentioned (Nov 24).
  - **Delivery:** motorizado in Lima, Shalom to all of Peru, pickup at the almacén (Cercado de Lima), or coordinate by WhatsApp.
- **Two catalogs:**
  - **Zazi** (`Zazi-pe/Zazi`): branded sneakers, used as a showcase for new arrivals. Lines: Anda, You, I-RUN.
  - **Zazi-Modelos** (`Zazi-pe/Zazi-Modelos`): ZAZI's own or low-name models, sold more for their look than the brand. Categories: sandalias, botas, botines, zapatillas, zapatos.
- **Status:** both catalogs are **in maintenance**, meaning they aren't being sent to customers yet, so temporary breakage during work is acceptable.
- **Inventory:** moved from BoxHero to Bsale, and in Nov 2026 from Bsale to **Shopify** (Bsale is being shut off). Shopify has one location (the Aljovín store). Linked catalog products read price and stock from Shopify. See section 8.

### How Stefano works (follow these)
- **Language:** he writes to Claude in English. All site and admin copy is Spanish (Peru), and code identifiers and comments are in Spanish.
- **Plan before building.** For big changes, propose a step-by-step plan and ask questions first.
- **Don't add things he didn't ask for.** Copy and reuse existing code and design rather than reinventing.
- **Tools:** since Nov 2026 he works with **Claude Code** (Code tab of the Claude desktop app, Environment: Local; since Nov 25 the `claude` CLI is also installed in `~/.local/bin`, on the PATH via `~/.zshrc`; start it from `~/ClaudeCode/Zazi-pe`, never from the home folder). Plugins/skills on his Mac: **claude-seo** (SEO audits; its Python runtime and Chromium live in `~/Library/Application Support/claude-seo/`) and **Impeccable** (design critique/polish; its design-check hook runs after UI edits). The repos are cloned on his MacBook in `~/ClaudeCode/Zazi-pe/` (`Zazi/`, `Zazi-Modelos/`, `Etiquetas/`). Claude edits the files directly, runs the checks and tests, then commits and pushes with Git. The old chat workarounds (GitHub connector, zips to upload by hand, byte-for-byte checks against GitHub) are no longer needed.
- **Pushing:** small changes can be committed and pushed directly, no approval needed; he tests afterwards and asks for adjustments. Big changes: plan first and get his OK.
- **Photos:** the admin adds product photos from the camera roll and names them itself. Stefano keeps his original photos on his laptop. If photo files are added another way, follow the naming rules in section 2.
- **Testing:** he tests on his iPhone (Brave/Safari) and MacBook. Give short test checklists.
- **Showcases / comparisons (Nov 26, his request):** when he asks for a *showcase* or a *comparison* ("show me how it would look", "compare before/after"), build the **local side-by-side phone showcase** described in section 7 and let him decide before anything is pushed. Not when he asks for changes to be pushed right away: then build, test and push as usual.
- **Never block a sale:** nothing in the checkout is required; missing data is only marked in red (his rule, Nov 26). The Yape QR stays visible so customers can pay right away.
- **Ideas he rejected earlier** (Modelos history; don't bring them back):
  - Blurred sold-out sizes; use the grey strike-through.
  - Photo thumbnails as color swatches.
  - Color-name lists for parsing.
  - Store or contact data inside product data files.
  - Hiding the filter row when there's only one category.
  - Strong token permissions.

---

## 2. Repos, URLs, deploy

| | Zazi | Zazi-Modelos |
|---|---|---|
| Store | https://zazi-pe.github.io/Zazi/ | https://zazi-pe.github.io/Zazi-Modelos/ |
| Admin | https://zazi-pe.github.io/Zazi/admin.html | https://zazi-pe.github.io/Zazi-Modelos/admin.html |
| Last big change | Nov 24 catalog redesign (see `git log`) | same, shared code only |

- Both repos are public, on branch `main`. The account is `Zazi-pe`.
- **Deploy (both repos):** Settings → Pages → Source = **GitHub Actions**. Every push to `main` runs `.github/workflows/publicar.yml`, in **two jobs** (since Nov 20):
  1. `armar`: checkout; `node validar.js` (on errors it stops, and **the last good version stays online**); copy `index.html admin.html productos.json validar.js shopify.js` plus `fotos/` and `img/` into `_site/`; make the WebP copies of the photos (section 4); `configure-pages@v5`; `upload-pages-artifact@v3`.
  2. `publicar` (needs `armar`): `deploy-pages@v4`. In a single job, deploy-pages intermittently failed with "No artifacts named github-pages" (actions/deploy-pages#451; re-running didn't fix it), hence the split.
- After editing the workflow, check the shell of each `run:` step (extract it and run `bash -n`): a missing closing quote once broke both deploys (Nov 20).
- **Timing:** the site updates about 1–2 minutes after a commit. Runs are visible in each repo's Actions tab.

### Files in each repo (identical structure)

```
.github/workflows/publicar.yml   same in both
index.html                       store; SAME FILE in both repos
admin.html                       admin; SAME FILE in both repos
validar.js                       check rules; SAME FILE in both repos
shopify.js                       reads price/sizes from Shopify; SAME FILE in both repos
ESTRUCTURA.md                    short structure reference (Spanish); same in both
CLAUDE.md                        rules for Claude Code; same content in both except the first lines
docs/handoff.md                  this document; same in both
productos.json                   catalog data; DIFFERENT per repo
pendientes.json                  products waiting for photo + swatch, written by Etiquetas' Nuevos modelos; may not exist; DIFFERENT per repo
fotos/                           product photos; different per repo
img/                             favicon.png, logo-zazi.png, logo-zazi-blanco.png, yape-qr.jpg (same in both);
                                 compartir.jpg (link preview, 1200×630; DIFFERENT per repo)
```

- **Local only (git-excluded via `.git/info/exclude`):** `Zazi/zazi-pe.github.io-audit/` (SEO audit report and raw data) and `.impeccable/` (design-checker ignores) in both repos.
- **Zazi `fotos/`:** the original 23 photos in a flat folder, with legacy names such as `fotos/anda-260x-celeste.jpeg`. Some names have accents (`you-cápsula-blanco-rosa.jpeg`, `you-deportivo-blanco-marrón.jpeg`, `i-run-horizon-marrón-crema.jpeg`); they work, but don't rename them without updating `productos.json`.
- **Modelos `fotos/`:** `fotos/botines/botin-pasador-marron.jpeg`.
- **New photos from the admin** go to `fotos/<filtro>/<slug>.jpg` in both.
- **No longer exist** (removed in the unification): Modelos `config.json` and `scripts/generar-productos.js` (the old photo-driven generator), and Zazi's embedded data and base64 images.
- **Rule for code changes:** `index.html`, `admin.html`, `validar.js`, `shopify.js`, `publicar.yml` and `ESTRUCTURA.md` must stay **byte-identical in both repos**. Any change goes to both, verified with `cmp` before pushing.

---

## 3. Data format: `productos.json`

Written by the admin. Each product is on one line, with keys in a fixed order.

```json
{
  "filtros": [["zapatillas","Zapatillas"],["anda","Anda"],["you","You"],["irun","I-RUN"]],
  "productos": [
    {"id":4001,"shopify":{"id":"15503136456925","color":"Gris Lila"},"filtro":"you","linea":"You","nombre":"You Urbano Onda Gris Lila","modelo":"You Urbano Onda","estilo":"Urbana","genero":"mujer","color":"Gris Lila","colores":["#B0A6BE"],"precio":59.9,"tallas":[35,40],"agotadas":["35","36","37","38"],"estado":"disponible","creado":"2026-09-24","foto":"fotos/you-urbano-onda-gris-lila.jpeg","descripcion":"…"}
  ]
}
```

**Key order:** `id, shopify, filtro, linea, nombre, modelo, estilo, genero, pequeno, color, colores, precio, tallas, agotadas, estado, nuevo, creado, foto, descripcion`. Optional fields are omitted when empty: `shopify`, `estilo`, `genero`, `agotadas`, `nuevo` (absent means auto) and `descripcion`.

**One entry per color, one card per model:** `productos.json` keeps one product per color (ids, Shopify links, carts and deep links don't change); the store groups colors by `filtro` + `modelo` at display time (Nov 24).

| Field | Meaning |
|---|---|
| `id` | Unique integer and stable identity, used in deep links `#p<id>` and in carts. Each line takes a block of 1000 (Zazi: Anda 3xxx, You 4xxx, I-RUN 5xxx). A new product gets the highest id in its line's block + 1; a new line opens the next block (minimum 3000). |
| `shopify` | Optional link to Shopify: `{"id": "<Shopify product id>", "color": "<Color option value as in Shopify>", "sku": "<SKU used to connect>"}` (`sku` is only a record of which SKU was scanned; links made before Nov 18 evening don't have it). When present, the store takes **price, sizes and sold-out sizes** from Shopify for that color; the values saved here are only a fallback (refreshed each time the product is saved in the admin). The catalog `color` stays for display, so "Marrón" can link to Shopify's "Marron". Replaced the old empty `sku` field (Nov 18). |
| `filtro` / `linea` | Line or category key (must exist in `filtros`) and its display name. |
| `nombre` / `modelo` / `color` | Full name (model + color, accents allowed; goes in the WhatsApp order and the admin), model without color, and color. **Customers see `modelo`** (cards, product view, cart) with the color on its own line. Our model names stay as they are: a "customer name" field (`nombreCliente`, e.g. "Running Malla Degradé") was built and then dropped on Nov 24 at Stefano's request. **Same `filtro` + same `modelo` = colors of one model** (one card in the grid, swatches in the card and the product view). |
| `estilo` | "Running", "Urbana", "Chunky"… Card grey line (`estilo · color`) and the "Filtros" panel. Model-level. |
| `pequeno` | `true` or absent. "Modelo pequeño" (runs small): the product view's size guide shifts 1 cm down per size (40 = 25.5 cm instead of 26.5 cm) so the customer picks one size up. Model-level (admin checkbox copies it to every color). Any other value is an error. |
| `genero` | `mujer`, `hombre` or `unisex` (unisex appears under both). Drives "Para: Mujer / Hombre" in the "Filtros" panel. Model-level. Required (error) once any product in the catalog has it (both catalogs have it since Nov 24). |
| `colores` | Swatch: 1 hex (solid) or 2 (diagonal split). Empty or invalid shows the color **name as a text chip**. |
| `precio` | Number, or `null` for "Consultar precio" (cart says "Por confirmar"). |
| `tallas` | `[a,b]` (two numbers) is the range a…b; `["36","38"]` lists specific sizes; `["Único"]` is one size ("Talla única"). The admin only writes ranges or `["Único"]`. |
| `agotadas` | Sold-out sizes, as strings. |
| `estado` | `disponible`, `agotado` or `proximamente`. If every size is sold out, the store shows "agotado". |
| `nuevo` | Absent = automatic (shows "Nuevo" for `DIAS_NUEVO` = 14 days after `creado`). `"si"` or `"no"` forces it. Set from the admin (Automático / Sí / No). |
| `creado` | Date the product was added, `YYYY-MM-DD`, set by the admin in Lima time. It controls the "Nuevos" sort, "Nuevo", and the **vitrina (automatic: the newest product with a photo)**. |
| `foto` | Path in the repo. |
| `descripcion` | Shown only where the site setting `descripciones` is on (Zazi). |

**`filtros`:**
- **Zazi:** `[["zapatillas","Zapatillas"],["anda","Anda"],["you","You"],["irun","I-RUN"]]`. "Zapatillas" is intentionally kept unused.
- **Modelos:** `[["sandalias","Sandalias"],["botas","Botas"],["botines","Botines"],["zapatillas","Zapatillas"],["zapatos","Zapatos"]]`.
- **Where they show:** as the main chips ("Todos" plus every line/category with products), as before. On Nov 24 they were briefly moved into the "Filtros" panel and replaced by Mujer / Hombre; Stefano reversed that the same day because customers do look for specific brands. `SITIOS.grupo` ("Marca" / "Categoría") is the row's accessible label.

There is **no `vitrina` field** anymore; the vitrina is always automatic.

---

## 4. Store: `index.html` (shared, about 75 KB)

**Structure:** one file with HTML, CSS and two `<script>` blocks. It is based on the Zazi design (clean sport store, references Gymshark and KHY):
- **Fonts:** Oswald for titles, **Figtree** for text (since Nov 24; it was Inter). Playfair Display (vitrina name) was dropped on Nov 26: the vitrina name is Oswald uppercase and its "MODELO EN VITRINA" label went from 10.5 px to 12 px. The admin also uses Figtree since Nov 26. Gymshark uses "SN Skandia", a commercial font we can't use; Figtree is the closest free one (Google Fonts, weights 400/500/600). Card names are weight 400 and prices 500, like Gymshark.
- **Tokens:** `--tinta #000`, `--papel #fff`, `--piedra #F4F4F4`, `--linea #E6E6E6`, `--gris #767676`, `--fucsia #C11A61` (brand moments only), `--alerta #B3261E`.

**First script (store data):**
- `TIENDA`: nombre "ZAZI", whatsapp "51959161270", instagram and tiktok "zazi.pe", and `yape: { numero: "959 161 270", titular: "Rosario Tapia Carrasco" }`.
- `SITIOS`: per-site differences (table below).
- `DIAS_NUEVO = 14`.
- Rule: store data stays in `index.html`, never in `productos.json`.

| `SITIOS` key | `titulo` (page title) | `carrito` (localStorage key) | `descripciones` | `grupo` (accessible label of the line chips: "Filtrar por …") | `tipo` (words search accepts for every product) |
|---|---|---|---|---|---|
| `zazi` | "ZAZI — Zapatillas Catálogo Oficial" | `zazi-carrito-v1` | true | "Marca" | "zapatilla zapatillas" |
| `zazi-modelos` | (none: keeps "ZAZI — Catálogo Oficial") | `zazi-propios-carrito-v1` | false | "Categoría" | "" |

`titulo` (Nov 25): the deploy step "Título del catálogo" in `publicar.yml` reads `SITIOS` from `index.html` and writes the repo's `titulo` into `<title>` and `og:title` of the published HTML, so Google and link previews see it without JavaScript; the store also sets `document.title` from it (local testing). `precioEnFicha` was removed on Nov 26: both catalogs now show the price under the name in the product view. `datosPortada` (the 100% / 24H / 35-46 stats band) was removed on Nov 24 together with the band: the size claim was false (largest size in stock is 44) and the band pushed the products 2.5 screens down.

- **Which site am I:** the first segment of `location.pathname`, lowercased (`zazi` / `zazi-modelos`). Override with `?sitio=zazi-modelos` for local testing; the default is `zazi`.
- **Separate cart keys** exist because both sites share the `zazi-pe.github.io` origin.

**Second script (logic, an async IIFE):**
- **Shopify (Nov 20, render first):** the store draws the showcase, catalog and cart **right away with the values saved in `productos.json`**, then calls `ZaziShopify.aplicar(PRODUCTOS)` (from `shopify.js`, loaded with `defer`; the code waits for `DOMContentLoaded` if it isn't there yet). When Shopify answers it recomputes "agotado" (`calcularEstados()`, from each product's saved `_estadoGuardado`), drops cart lines whose size sold out, redraws the catalog and cart, and refreshes an open product view keeping the chosen size. **Stefano's rule (Nov 20): the saved data can be shown, but buying waits for Shopify.** While Shopify is being checked (`stockShopify = "verificando"`), a connected product's sizes are disabled with a soft look (class `verificando`, not the sold-out strike), the button says "Verificando stock…", and in the cart "Continuar con el pago" and "Enviar pedido por WhatsApp" are disabled with the same text (the submit handler also refuses). When Shopify answers (`listo`), everything unlocks with the real data. If Shopify fails or takes over 6 s (`fallo`), or a connected product isn't found there (`sinConfirmar`), buying unlocks with the saved data and the product view shows "No pudimos confirmar el stock en este momento; te lo confirmamos por WhatsApp." (so a Shopify outage never blocks sales). Products not connected to Shopify are never locked. Before Nov 20 the page waited for Shopify before drawing anything.
- **Lighter photos (Nov 20):** `publicar.yml` installs `webp` and runs `cwebp -q 82 -m 6 -sharp_yuv -resize 400|800` plus a full-size copy at `-q 85` on every photo into `_site/fotos-web/<same path>-400.webp`, `-800.webp` and `-full.webp` (srcset declares it as `1024w`; quality 75 and a max of 800 px looked pixelated on 3x iPhones, fixed Nov 20) (only in the published site, not in the repo). The store wraps product photos in `<picture>` (`fotoProducto()`, `picture{display:contents}` so the CSS is unchanged) with a WebP `srcset` and `sizes` per place: cards `(max-width: 720px) 50vw, 300px`, showcase `(max-width: 960px) 100vw, 470px`, product view `(max-width: 720px) 100vw, 480px`, cart `96px`. If a WebP copy is missing (local testing, or a conversion failed), `zaziSinWebp()` removes the `<source>` and the original photo shows.
- **Showcase photo** (`pintarVitrina`, the likely LCP image on phones) has `fetchpriority="high"`; cards keep `loading="lazy"`, `decoding="async"` and `width`/`height`. Fonts: every loaded weight is used (checked Nov 20), so none were trimmed.
- **Loading:** `fetch("productos.json?v="+Date.now(), {cache:"no-store"})`. If the load fails, it shows "No pudimos cargar el catálogo…" plus a WhatsApp button; with no products, it shows "Estamos preparando el catálogo…".
- **"Nuevo":** forced by `nuevo` "si"/"no", otherwise within 14 days of `creado`.
- **Hero (Nov 24, short so products show on the first phone screen):** "Te damos la bienvenida a ZAZI." (neutral; it used to say "Bienvenida"). Desktop: one line of copy, "Ver catálogo" and "Escríbenos por WhatsApp". **Phone (Nov 26, from the Impeccable critique):** only the welcome title (the lead and buttons are hidden; the floating WhatsApp button covers contact), the Mi talla buttons are quieter (grey, no border) so the brand chips read first, `main` has 72 px bottom padding and the floating WhatsApp button hides while the "Filtros" panel is open (class `filtros-abiertos` on `<html>`), so it doesn't cover the sort menu. The stats band is gone. **WhatsApp buttons** all read "Escríbenos por WhatsApp" (the floating one keeps "Escríbenos").
- **Vitrina:** the newest product with a photo, labelled "MODELO EN VITRINA" with model + color. **Shown only on screens wider than 720 px** (square, max 360 px); on phones it isn't drawn at all, so its photo isn't downloaded. With no products, the hero becomes text-only (`.hero-solo`).
- **Models (Nov 24):** `armarModelos()` groups products by `filtro` + `modelo` into `MODELOS` (`porClave`, `modeloDe`). Colors inside a model are ordered by number of available sizes (desc), so sold-out colors go last; `m.libres` = sizes available in any color. Re-run after Shopify answers.
- **Filters row:** chips "Todos" + each line (Zazi: Anda / You / I-RUN; Modelos: categories) with products, single choice, plus a "Filtros (n)" button that opens a panel with **Para: Mujer / Hombre** (one at a time, tap again to clear; unisex counts for both) and **Estilo** chips (multi-select, OR), and "Quitar filtros". A group shows only with 2+ options; with no group the button is hidden (Modelos today). On phones the row doesn't wrap (fits 375 px).
- **Mi talla:** a row of size buttons (only sizes in stock somewhere in the catalog, plus the chosen one), scrolls sideways on phones. Choosing a size shows only models with that size available in at least one color, and each card opens on a color that has it. Tapping it again clears it. Saved in `localStorage["zazi-mi-talla"]` (shared by both catalogs; nothing preselected on a first visit).
- **Count:** "16 modelos" counts models, not colors, and follows every filter.
- **Search (`consulta()`, `pasa()`):** per color, every word must match somewhere in full name, model, line, color, style, gender words (unisex = "unisex mujer hombre") and `SITIOS.tipo`. Accent/case-insensitive; words longer than 3 letters lose a final `a/o/as/os/es/s` so negra = negro, blancas = blanco, mujeres = mujer; filler words (de, la, talla, color…) are ignored. A two-digit number is a size: only colors with that size available (it overrides Mi talla). The card shows the first matching color ("blanco 38" opens on the white color with 38).
- **Sort:** "Recomendados" (default) = models with the most available sizes first, then newest; "Nuevos" = newest model first; the price sorts put no-price products last.
- **Cards (one per model, Gymshark style):** a row of photos, one per color (`fotoCard`, each with its own "Nuevo" / "Agotado" / "Próximamente" badge, sold-out photos dimmed) → row of swatches (`cuadritosCard`: max 3 plus "+N", which opens the product view; **20×20 px with a 4 px gap**, the selected one with a 2 px black inset frame and a 2 px white gap, measured from Gymshark; an invisible larger tap area around each) → model name → grey `estilo · color` → price, with a subtle grey "Últimos pares" when the shown color has one size left (`cuerpoCard`). No sizes, no line name. **Sliding (Nov 24, rebuilt the same day):** the photo row is a native horizontal scroller (`scroll-snap-type: x mandatory`, `scroll-snap-stop: always`, hidden scrollbar, `overscroll-behavior-x: contain`), so the browser moves it with the finger as smoothly as Gymshark and vertical page scrolling is untouched. A capture `scroll` listener on the grid switches the card's swatches/text to the color past the halfway point (`mostrarColor`, no redraw of the photos). Tapping a swatch smooth-scrolls to that photo (`irAColor`; colors passed on the way aren't marked). After each redraw, `colocarFoto` puts the row on the shown color. The first version used hand-made pointer events and replaced the whole card, which looked rough on the iPhone. **Slide hint:** once per visit, on touch screens, the first card with several colors "peeks" (its photos move 16% toward the next one and back, 1.1 s) when it's 70% visible (`pistaDeslizar`, re-armed after every redraw; skipped with reduced motion), as on Gymshark. **Photo loading (Nov 25), in turns:** (1) at first each card renders only the shown color's `<img>` (other colors' slides are empty, `data-sin-cargar`); the first 4 cards (`PRIMERAS`) load it eagerly with `fetchpriority="high"`, the rest lazily. (2) After the `load` event (and after every redraw once loaded), `bajarEnFondo` downloads in the background, two at a time, top to bottom: every card's shown photo, then each card's next color (`data-siguiente`, the one the first swipe reaches; Gymshark preloads its second photo the same way), then all other colors. Skipped with Save-Data or a 2G connection. (3) Touching/scrolling a card or tapping a swatch fills that card's photos at once (`cargarFotos`). Preloading the next color *before* load was tried and measured worse (LCP 4.3 s → 6.2 s), so it waits for load. `loading="lazy"` alone didn't help inside the horizontal row (the browser fetched every color). Live measurements (emulated iPhone, CPU 4×, slow 4G): LCP 7.7 s (Nov 24) → 4.3 s; first view ~765 KB; the whole catalog (30 photos, 1.85 MB) is in by ~25 s. Same test on Gymshark's collection page: first paint and LCP 7.8 s, 2.8 MB. **Product view photo:** it uses the bigger `-full` WebP (100–160 KB, too heavy to preload for every product), so `#m-media` gets the card's 800 px photo (already cached) as a background: no grey flash; the sharp image covers it when it arrives. **No focus border:** card photos have no outline (they aren't keyboard-reachable), and when the product view closes after being opened by touch/click, the focus the browser hands back to the card is dropped (keyboard users keep it).
- **Product view** (`<dialog id="modal">`, deep link `#p<id>`):
  - **Header:** `modelo`; under it the style (`estilo`, or the line if there's none; it used to repeat the brand) and the price (both catalogs since Nov 26). Gender is never shown.
  - **Swatches:** the model's colors in the same order as the card; a text chip if there's no hex.
  - **Size grid:** 3 per row. Sold-out sizes are grey with a strike-through and disabled. **No size is preselected (Nov 24)**, except "Talla única"; changing color keeps a size the customer already chose. Under the grid: a small **"Guía de tallas"** link (ruler icon; Nov 26, Gymshark-style after Stefano's review). It opens the **`#guia` window, which slides up from the bottom** like the cart: title "Guía de tallas", a bordered **"Cerrar ✕"** button (bigger than a lone X so it isn't missed; backdrop tap also closes), and a two-column table **Talla | Largo del pie**, centimeters only (no inch/cm switch: inches aren't used in Peru), for **every size 35–47** (35 = 21.5 cm, +1 cm per size; not only the model's sizes). The table shows the header and 7 rows, and scrolls (thin visible scrollbar on desktop, sticky header) to reach the men's sizes. If the model has `pequeno`, every size is 1 cm less (40 = 25.5 cm) and a grey note on top says "<modelo> es un modelo pequeño: esta tabla ya está ajustada, por eso pide una talla más que la de siempre." Under the table: "¿Dudas con tu talla? Escríbenos" (WhatsApp with the product prefilled). A model without numeric sizes (talla única) shows only that line instead of the link. Code: `guiaTallas`, `abrirGuia`, `TALLAS_GUIA`.
  - **Button without a size:** reads "Elige tu talla" (enabled). Tapping it scrolls to the sizes, outlines the free ones in red and shows "Elige una talla para añadirla al carrito." After a size is chosen: "Añadir al carrito - S/ 69.90".
  - **Sticky bar:** if the button's natural spot is below the visible area, it sticks to the bottom. Without a size it's a single full-width "Elige tu talla"; with a size it's "Talla X ⌄" on the left and "Añadir - S/ 69.90" on the right. Tapping "Talla X" auto-scrolls to center the options.
  - **Auto-scroll fix:** adds `padding-bottom` when there isn't enough room, and uses `scrollTo` to a fixed target so repeated taps can't land on "Añadir". Ported from Modelos; it matters when there's no description.
  - **No sizes:** "Consultar por WhatsApp" instead of the add button.
  - **Description** below the button, if enabled for the site.
- **Cart** (`<dialog id="carrito">`, slides up from the bottom):
  - Quantity +/−, remove, "Vaciar carrito" (with confirmation), total.
  - Saved lines are dropped on load if the product, size or sold-out status no longer fits.
  - Lines show the model and "Color · Talla X". **"Quitar" can be undone (Nov 26):** a "Quitaste … · Deshacer" row stays at the top until the next change.
  - Checkout view: **"Tu pedido (N pares)" recap** (Nov 26; model, color · size, price per line, collapsible), delivery fields that depend on the chosen option, "Yape o Plin"/Efectivo (Yape preselected on purpose, with the QR `img/yape-qr.jpg`, always visible: Stefano wants customers able to pay right away), "Envío: se coordina por WhatsApp según tu distrito." under the total, and send via `wa.me/51959161270?text=…`.
  - **Important fields are never required (Stefano's rule, Nov 26: never block a sale).** Name, district/address, phone, DNI and Shalom agency turn red (`.falta-dato`) when left empty after tapping them or when "Enviar" is pressed, and clear as the customer types; the order is sent anyway. Phone opens the number keypad (`inputmode="tel"`), DNI `numeric`.
  - **After sending (Nov 26):** the cart shows "Pedido listo" / "Tu pedido está listo" with a backup "¿No se abrió? Abrir WhatsApp" link (some in-app browsers block `window.open`), "Ya lo envié: vaciar carrito" and "← Volver al carrito".
  - **Order message line:** `• 1 × <modelo> <color>, talla 38 — S/ 69.90` (that is the full `nombre`; if `nombre` was edited to differ from model + color, it's added in parentheses).
- **Link preview (Nov 24):** `og:image` / `twitter:card summary_large_image` point to `img/compartir.jpg` (1200×630, fuchsia band with the white logo + product photos; made with a small Swift/AppKit script since there's no image tool on the Mac). The deploy (`publicar.yml`, step "Dirección completa de la imagen para compartir") rewrites that path to `https://zazi-pe.github.io/<repo>/img/compartir.jpg`, so the shared `index.html` stays identical. Per-product previews for `#p<id>` links are not possible as-is (crawlers don't run JS and never see the `#` part); they would need a small static page per product generated at deploy (e.g. `p/3001.html` with its own `og:image` that redirects to `/#p3001`).
- **Other pieces:** floating WhatsApp button, "Cómo comprar" (3 steps), the fuchsia contact band, and the footer.
- **Known leftover:** `#aviso` / `mostrarAviso()` exist but aren't used, which is harmless.

---

## 5. Admin: `admin.html` (shared, about 50 KB)

**Purpose:** a phone-first panel to edit `productos.json` and photos directly in GitHub, so Stefano no longer needs Claude or code for routine changes.

### Access
- **Token:** a GitHub fine-grained personal access token, scoped to Only select repositories (Zazi-pe/Zazi and Zazi-pe/Zazi-Modelos), with **Contents: Read and write**. Metadata read-only is added automatically.
- **Storage:** saved in `localStorage["zazi-admin-token"]`, shared by both admins on the same browser.
- **One token per device:** "ZAZI admin" for the iPhone and "ZAZI admin MacBook". GitHub shows a token only once; for a new device, create a new token.
- **Login screen:** gives the steps to create a token.
- **Error handling:** 401 means the token expired or is invalid, so it asks for a new one. 403/404 means the token lacks that repo.

### Which catalog am I
Same detection as the store, via a `CATALOGOS` map:
- **Repo:** `Zazi-pe/Zazi` or `Zazi-pe/Zazi-Modelos`.
- **Header title:** "Zazi" or "Modelos", with a link to the other admin.
- **Descriptions field:** hidden in Modelos.
- **Group label:** "Línea" in Zazi, "Categoría" in Modelos.

### Loading
1. `GET /git/ref/heads/main`, then `GET /git/commits/{sha}`.
2. In parallel: `GET /contents/productos.json?ref=…` and `GET /git/trees/{tree}?recursive=1` (the full file list, used for the photo checks).
3. It remembers `st.head` and `st.arbol`.

### Pendientes (products from Nuevos modelos, Nov 19)
- `pendientes.json` (repo root, may not exist) holds products created in Shopify by the Etiquetas page's **Nuevos modelos** with "Agregar también al catálogo" ticked: **one per model + color**, already connected (`shopify {id, color, sku}`), with `filtro`/`linea` (proposed there: Zazi by brand, Modelos by type; a missing one is proposed as a new line), `nombre` (= model name + color, exactly as the sheet's name), `modelo`, `color`, fallback `precio`/`tallas`/`agotadas` from the sheet, and `agregado` (date). Same one-per-line format as `productos.json`. The store never reads it, `validar.js` doesn't check it, and the deploy ignores it.
- The admin loads it in `cargar()` and shows **"Pendientes de publicar (N)" above the normal list** (tag "Pendiente: falta foto y color"). Tapping one opens the editor titled **"Publicar producto"**, button **"Publicar"**, already connected to Shopify; a line that doesn't exist yet comes preselected as "Nueva …". **Photo and color square are required.**
- **Publicar commits immediately**, on its own: `productos.json` (with the new product, next id in its line's block; the new line added to `filtros` if needed), `pendientes.json` without it, and the photo, in one commit ("Catálogo: Publicado: X"). If there are other unpublished edits, it asks to publish or discard them first. If Shopify can't be read at that moment, the pending item's own data is used as fallback.
- A pending item without a Shopify id (shouldn't happen) is resolved by its SKU when opened.
- Pending items are matched by **Shopify id + color (or name)**, not by the object in memory, when publishing or removing; while a publish/remove (and the reload after it) is running, tapping another pending item shows "Espera un momento…". A pending item that is already in `productos.json` (same Shopify id + color, or same name) is hidden and dropped on the next save. (Bug fixed Nov 19: D308 Morado Verde stayed pending after a quick publish-then-open-next.)
- **"Quitar de pendientes"** (red button in the Publicar editor, with a confirm): removes it from `pendientes.json` in its own commit without publishing. For a model created wrong: also delete it in Shopify by hand, then create it again from Nuevos modelos.

### List screen
- Search (multi-word, also over style), line chips, and a "Nuevo" button.
- **Rows, newest first:**
  - Photo, name, price and estado, plus "Nuevo" if it currently shows and "En vitrina" (computed).
  - **Tappable size chips:** tap to mark a size sold out or restock it, the fastest action. **Connected products** show a green "Shopify" tag, their live price and sizes from Shopify, and size chips that can't be tapped (Shopify decides). **Products not connected** show a red "Sin conectar a Shopify" tag; a connected product Shopify no longer has shows red "Shopify: no se encontró".
  - A fuchsia bar on the left marks changed rows.
- **Black bottom bar:** "N cambios sin publicar" with Descartar and Publicar.
- `beforeunload` warns about unpublished changes.

### Editor
A full-screen dialog on phone, centered on desktop. It covers:
- **Photo:** chosen from the camera roll, then center-cropped to 4:5, resized to 800×1000 and saved as JPEG of 220 KB or less (quality steps 0.85 → 0.6).
- **Line/categoría:** existing or a new one.
- **Name fields:** modelo, color, and **"Nombre interno"** (`nombre`, auto-built from modelo + color, editable; goes in the WhatsApp order).
- **For customers (Nov 24):** "Estilo" (`estilo`, free text with suggestions from the styles already used) and **"Para": two checkboxes, Mujer and Hombre** (`genero`; **at least one required to save**; both ticked = `unisex`, which shows under both filters; Nov 26, it used to be three options). Both are model-level: saving one color copies them to every other color with the same line + model (they show as changed rows). A new color ("Añadir otro color") or a pending product takes them from another color of the same model. The name field is labelled "Nombre completo".
- **Swatch:** 1–2 color pickers, auto-filled from any product with the same color name until edited by hand.
- **Price:** a number or "Por confirmar".
- **Sizes:** desde/hasta or talla única, plus a sold-out size grid.
- **Estado:** Disponible / Agotado / Próximamente.
- **"Nuevo":** Automático / Sí / No, with a note like "Agregado el … Muestra Nuevo hasta el …".
- **Description:** Zazi only.
- **Shopify (connection, done once per product):** a product that isn't connected shows red **"Sin conectar a Shopify"** and a field to **type or scan the SKU of any size** of that model and color (Enter or "Conectar"). `ZaziShopify.buscarSku()` finds it through Shopify's public search, and the product shows green **"Conectado a Shopify: <Shopify title> · <color>"** plus "Desde Shopify: S/ 59.90 · tallas 35 al 40 · agotadas: …". While connected, the price, sizes and sold-out fields are hidden; saving copies Shopify's values into the product as a fallback. "Cambiar conexión" shows the SKU field again; "Desconectar" (with confirmation) brings the manual fields back, prefilled. If the connected product or color disappears from the Online Store, the status turns red and asks for a new SKU. (A first version used a dropdown of all Shopify products; Stefano found it unreliable, replaced the same day.)
- **Actions:** "Añadir otro color de este modelo" copies line, model, style, gender, price and sizes; the new color gets connected with its own SKU. "Eliminar producto" asks for confirmation; its photo is deleted from the repo if no other product uses it.
- **New products:** get `creado` = today in Lima time and the next id in their block. The photo is named on save as `fotos/<filtro>/<slug(nombre)>.jpg`, with `-2`, `-3`… added if the name is taken.

### Publish
1. **Check first:** runs `ZaziValidar.validar()` from `validar.js` (loaded with `<script src="validar.js">`) against the data plus the repo file list adjusted for pending uploads and deletions.
   - **Errors:** a dialog "Hay que corregir antes de publicar" lists them, each with "Abrir"; publishing is blocked.
   - **Only warnings:** a dialog lists them with "Publicar de todas formas".
   - **Nothing:** publishes immediately.
2. **Conflict check:** if `main` moved since loading (`ref != st.head`), it refuses with "El catálogo cambió desde otro lugar… toca Descartar".
3. **Uploads:** each new photo becomes a blob (`POST /git/blobs`, base64).
4. **One atomic commit:**
   - `POST /git/trees` with base `st.arbol`, containing `productos.json` (content), the new photo blobs, and `sha:null` deletions for photos no product uses anymore.
   - `POST /git/commits` with parent `st.head`.
   - `PATCH /git/refs/heads/main`.
5. **Commit message:** "Catálogo: N cambios" plus lines like "- Editado: X", "- Nuevo: X", "- Eliminado: X", and "Hecho desde admin.html".
6. **After publishing:** it reloads, and new-photo previews stay available locally. Images that fail to load fall back to `raw.githubusercontent.com/<repo>/main/<path>` while Pages is still rebuilding.

---

## 6. Checks: `validar.js` (shared)

**How it runs:**
- **Browser:** sets `window.ZaziValidar = { validar(datos, archivos|null), tallasDe }`.
- **Node (`node validar.js`):** reads `productos.json`, lists `fotos/`, and prints GitHub annotations `::error::` / `::warning::`. It exits with 1 if there are errors, which fails the deploy.

**Errors (block publishing):**
- productos.json invalid or missing the product list
- an empty or broken product entry
- id invalid or repeated
- empty nombre, or a repeated nombre (normalized)
- empty modelo
- `filtro` not in `filtros`
- no foto, or a foto path not in the repo
- precio not a positive number and not `null`
- no tallas, or a reversed range
- `estado` invalid
- `nuevo` not auto/si/no
- `genero` not mujer/hombre/unisex, or **missing while any other product in the catalog has it** ("once the field exists"; so a catalog that hasn't adopted it, like Modelos today, still passes)
- `estilo` present but not text

**Warnings (publishing allowed):**
- sold-out sizes outside the product's sizes
- disponible but all sizes sold out
- a color with no valid hex (shows as a text chip)
- `creado` missing or invalid
- photos in `fotos/` that no product uses
- no `estilo`, only once some product in the catalog has one
- colors of one model (same `filtro` + `modelo`) with different `estilo` or `genero`

---

## 7. How to work on this (practical)

- **Before starting:** `git pull` in the repo (and in the sibling repo if shared files will change). The admin commits straight to `main` from Stefano's phone, so the remote is often ahead. Pulling also avoids push conflicts.
- **Read the code** from the local folders. `git log` shows recent changes; admin commits look like "Catálogo: N cambios … Hecho desde admin.html".
- **Edit shared files once, then copy:** change `index.html`, `admin.html`, `validar.js`, `shopify.js`, `publicar.yml` or `ESTRUCTURA.md` in one repo, copy the file to the sibling (`../Zazi-Modelos` or `../Zazi`), and confirm with `cmp`. Commit and push both repos.
- **Before every commit:** `node validar.js` must pass (errors would block the deploy anyway).
- **Test locally:**
  - From `~/ClaudeCode/Zazi-pe/` run `python3 -m http.server` and open `http://localhost:8000/Zazi/` or `/Zazi-Modelos/`, so the address-based site detection works (`?sitio=zazi-modelos` also overrides it).
  - Use Playwright (Chromium) for phone (390×844) and desktop (1366×900) screenshots, and compare old and new pixel by pixel when a change should be invisible.
  - Test the admin with a fake GitHub API intercepted by Playwright `route("https://api.github.com/**")`, implementing refs, commits, recursive trees, contents, blobs, trees, commits and ref PATCH over an in-memory file map. Check the published result with `node validar.js`. Without Playwright: a test copy of `admin.html` with a fake `fetch` for `api.github.com` injected before the scripts, served from the scratchpad under a `/Zazi/` path and driven in the browser pane (done Nov 18).
  - `shopify.js` can be run in Node (`require("./shopify.js")`, then `globalThis.ZaziShopify`) against the real store: it's public and read-only.
- **Showcase for comparisons (only when Stefano asks for one; he liked it on Nov 26):** never in the repos. Copy `index.html`, `productos.json`, `shopify.js` twice into a scratchpad folder (`muestra/Zazi/` = today, `muestra/propuesta/Zazi/` = proposal), symlink `fotos/` and `img/`, serve `muestra/` with `python3 -m http.server <port>` and open it in the browser pane. Each proposed change sits behind a class on `<html>` (`c-<name>`), chosen with `?cambios=a,b,c` (none = all on). The page: black header with a "Showcase only · not published" pill; a sticky left panel with Phone/Desktop toggle and one checkbox card per change (title, P0–P3 tag, why, "Try: …"), "All on / All off"; on the right two phone frames (375×740 iframes) "Today — live code" and "Proposal — with the switches on the left" (Desktop: two 1280×840 iframes scaled side by side); below, a summary (scores, what works, what isn't in the proposal). Both frames are fully usable and share the cart. Don't publish it as an Artifact (it imitates the real store). Delete the folder and stop the server when he's done.
- **Speed measurements:** there's no Chrome or ffmpeg on the Mac. Use the Playwright install from claude-seo (`PLAYWRIGHT_BROWSERS_PATH="$HOME/Library/Application Support/claude-seo/ms-playwright" "$HOME/Library/Application Support/claude-seo/.venv/bin/python" script.py`) with an emulated iPhone, CPU ×4 and slow 4G (1.6 Mbps, 150 ms), 3 runs, measuring LCP/FCP/CLS and transfer. Reference (Nov 25, live): LCP 4.3 s, first view ~765 KB, whole catalog in the background by ~25 s; Gymshark's collection page on the same test: 7.8 s, 2.8 MB. Images (share image, video frames) can be made with small Swift/AppKit scripts.
- **Design checks:** `~/.claude/skills/impeccable/scripts/impeccable detect index.html admin.html` (0 findings as of Nov 26). Local ignores in `.impeccable/config.local.json` (git-excluded, both repos): `cramped-padding` in `index.html` and `admin.html` (Stefano confirmed false alarms: Cómo comprar dividers, admin segmented buttons). For URL scans set `IMPECCABLE_BROWSER` to the claude-seo Chromium.
- **After pushing:** the site updates in about 1–2 minutes; runs are visible in each repo's Actions tab. Then give Stefano a short test checklist (iPhone and MacBook).
- **Workflow files** (`.github/workflows/*`) can be edited like any other file now. If GitHub rejects the push for missing permissions, run `gh auth refresh -s workflow` and push again. Make sure the first line of the YAML (a `#` comment or `name:`) is intact; a lost leading `#` once made the workflow invalid.

---

## 8. Future work

### Shopify connection (built Nov 18)

**Setup in Shopify:** the **Online Store is open** (no password) and products are published to both **Online Store** and **Point of Sale**. That lets `shopify.js` use Shopify's public Storefront API **with no token** (`https://y0mdhy-r0.myshopify.com/api/2026-10/graphql.json`). Only products published to the Online Store are visible to it. As of Nov 18, Shopify's admin still reported 12 products not on the Online Store (the first ones alphabetically, none in the catalogs). Stefano plans to improve the Shopify store itself later; for now it just has to be open.

**What's linked (Nov 20):** every Zazi Anda and You product and Modelos' Botín Pasador Marrón (section 10). Anda 260X was renamed **Anda D318** (created in Shopify with Nuevos modelos, product 15520773570781) and its 5 catalog products connected by SKU; the new Anda models (D268, D263, D269, D308) came in through Pendientes. **The real I-RUN models aren't in Shopify yet** (only a generic "Zapatilla I-RUN" with color "-"), so they stay manual until they're loaded; then connect them from the admin.

**Prices changed by the link:** You is S/ 59.90 in Shopify (the 69.90 in the catalog was outdated; Stefano: the You price can change again later, and Shopify is the source). Pasador is S/ 79.00 in Shopify (catalog had 79.90). Sold-out sizes now follow Shopify's stock; You Deportivo Blanco Marrón is sold out in every size, so the store shows it as "Agotado".

**How `shopify.js` works:**
- `aplicar(lista)`: groups linked products by Shopify id (3 per query, to stay under the tokenless complexity limit; ~240 ms for all), reads each product's variants (`availableForSale`, `price`, `selectedOptions`), keeps the variants whose **Color** option matches the link color (accent- and case-insensitive), and sets `precio` (lowest price of that color, `null` if 0), `tallas` (consecutive numbers become a range `[a, b]`; otherwise a list; no Talla option = `["Único"]`) and `agotadas` (sizes with no available variant). Products or colors not found keep their saved values (console warning).
- `buscarSku(sku)`: Shopify's public `search` finds the product that has that SKU (any format, case-insensitive; checked against the variant's exact SKU) and returns `{ id, titulo, color, talla, sku }`. Barcodes aren't searchable in the public API, only SKUs.
- Stock is "available or not" (Storefront gives no counts), summed over Shopify's single location.
- `validar.js`: a `shopify` value must have a numeric `id` and a `color` (error otherwise). The "disponible but all sizes sold out" warning is skipped for linked products, since Shopify decides.

**Not built / ideas (mention, don't build):** connecting I-RUN once it's in Shopify; the Shopify store's own design; showing exact stock counts (would need a Storefront token with inventory access or the worker).

### Next steps (open; ask Stefano before building)
- **Delivery costs** in the checkout ("Total a pagar"): Stefano will send the prices. Today the checkout only says "Envío: se coordina por WhatsApp según tu distrito."
- **SEO (from the Nov 25 audit, score 45/100; report in the local, git-ignored folder `Zazi/zazi-pe.github.io-audit/`):** done: photo loading, Zazi title. Open: canonical link + `og:url`/`og:locale`; `OnlineStore` JSON-LD built from `TIENDA`; descriptive meta description/H1; product pages generated at deploy (`/p/<id>.html` with `Product`/`Offer` schema, which also gives per-product WhatsApp previews); `sitemap.xml` + Google Search Console (needs Stefano's Google account); trust footer (legal name, pickup point, exchange policy); custom domain; Google Business Profile.
- **Photos** (consistent background, no other brands' boxes such as the red DXLU one, more angles): Stefano's to redo. A gallery with several photos per color isn't built.
- **I-RUN in Shopify:** connect each I-RUN product from the admin once the models are loaded in Shopify.
- **Ideas mentioned, not requested:** preselecting Mi talla in the product view; a Zazi-Modelos `titulo` (it keeps "ZAZI — Catálogo Oficial"); the unused `#aviso` toast.

### Decisions already made (don't reopen)
- **Model naming order (Nov 26):** full name = **Marca + Nombre (if it has one) + Código + Estilo + Color**, e.g. "Anda D268 Deportiva Blanco Verde". Gender never goes in the name (a customer of the other gender could be put off); it's only a filter tag. The Shopify product name / catalog `modelo` is the short form **Marca + Nombre (if any) + Código** ("Anda D268"). The full name isn't used anywhere yet (kept for future exports); the catalog keeps its short titles. Existing products are not renamed. Old example: I-RUN Bostep RAVENX had no code, so a name had to be invented; that's what this order avoids.
- **Our model names stay** as card titles (customer-facing renames and the `nombreCliente` field were rejected, Nov 24). Brand/category chips are the main filter row.
- **Checkout never blocks a sale:** important fields are only marked red; the Yape QR stays visible ("pay after we confirm stock" was rejected).
- **Impeccable critique (Nov 26):** score 28/40, shown as a showcase. Approved and built: checkout recap, red marks, "Tu pedido está listo" screen, short phone top, style + price in the product view, one font family / form spacing / one WhatsApp label, cart undo, size guide.
- `estilo` and `genero` were filled for every product on Nov 24 (Zazi: Running for Anda; Urbana / Chunky / Plataforma for You; Trail / Urbana / Plataforma for I-RUN; Mujer except I-RUN Horizon unisex and STEP / RAVENX hombre. Modelos: Botín Pasador = Botín, mujer). Etiquetas' Nuevos modelos sends `estilo` and `genero` in `pendientes.json` when the Excel has them (optional columns Estilo and Género, Nov 26).
- The Yape holder name ("Rosario Tapia Carrasco") was confirmed correct.

### Not discussed yet
- Culqi payment links (Stefano has a Culqi account; an on-site checkout was discussed once, never built; never put a Culqi secret key in the site). Analytics.

---

## 9. History (why things are the way they are)

1. **Zazi (Sept 24 – Oct 1):** built in an earlier chat. It was a single `index.html` with hard-coded data and base64 images, de-branded from a cloned store.
2. **Zazi-Modelos (Sept 30 – Oct):** built in another chat as a photo-driven catalog:
   - Filenames gave model and color; a `config.json` palette and models; a Node generator plus an Action built `productos.json` at deploy, with warnings.
   - It added the price line in the product view, no stats band, and the auto-scroll fix.
3. **This chat (Oct 27 – Nov 4):**
   - **Zazi:** products moved to `productos.json`, images to `img/`, and the admin was built and adopted by Stefano. Also added: multi-word search, and dropping sold-out sizes from saved carts.
   - **First Modelos admin:** built for the old photo and config model, then retired.
   - **Unification:** Stefano decided both catalogs should share **Zazi's structure**, governed by the admin, and differ only in display. That gave the shared `index.html`, `admin.html` and `validar.js`, `creado` / `nuevo`, the automatic vitrina, checks in both the admin and the deploy, and Actions deploy for both.
   - **Modelos conversion:** its config and photos were converted to `productos.json`, so names now have accents ("Botín Pasador Marrón"). `config.json` and `scripts/` were deleted.
   - **Decisions:** vitrina automatic (newest); "Nuevo" 14 days in both; real errors block and minor issues warn; two repos kept with the same URLs; zip-and-upload for big files (no longer needed with Claude Code).
   - **Status at the end:** Stefano tested both admins (publishing, "Nuevo" forcing, size toggles, the error block) and they work. Whether the stores look right on his phone was not confirmed yet.
4. **Move to Claude Code (Nov 11–12):** the repos were cloned to `~/ClaudeCode/Zazi-pe/`, `CLAUDE.md` files were added, and this handoff became a living document in `docs/`.
5. **Shopify (Nov 18):** inventory moved from Bsale to Shopify. The label page's worker was rewritten for Shopify (Etiquetas repo). The catalogs got `shopify.js`, the `shopify` field (replacing `sku`), connect-by-SKU in the admin (a dropdown picker was tried first and replaced), and the 13 You/Pasador products linked. Bsale's catalog plan (worker-served stock, branches, price list 5) was dropped: the stores read Shopify's public API directly.
6. **Nuevos modelos → catalog (Nov 19):** Etiquetas' Nuevos modelos can add the created models to a catalog as pending products (`pendientes.json`); the admin got the Pendientes section, the Publicar flow and "Quitar de pendientes". Anda 260X became Anda D318 in Shopify and was connected; D268, D263, D269 and D308 were published from Pendientes.
7. **Performance (Nov 20):** after a review with the `modern-web-guidance` skill: render first with saved data plus the stock lock (Stefano's rule), WebP copies with `<picture>`, `fetchpriority` on the showcase, and the two-job deploy. Photo quality was raised the same day after Stefano saw pixelation on his iPhone.
8. **Catalog redesign (Nov 24), "browse like Gymshark":** after an audit on an iPhone-sized screen (fast, but hard to tell styles, sizes and what each shoe is). One card per model with square swatches and swipe; no sizes on cards; "Mi talla"; "Filtros" (Para: Mujer / Hombre + Estilo); live model count; forgiving search; "Recomendados" by available sizes + "Nuevos"; no preselected size in the product view ("Elige tu talla") plus a size-help WhatsApp link; short neutral hero without the stats band; consistent payment copy; link preview image. New data fields `estilo` and `genero`. Same day, Stefano kept our model names (the proposed customer names and the `nombreCliente` field were dropped) and brought the brand/category chips back as the main row. The card photo row was rebuilt as a native scroll-snap slider with Gymshark-size swatches and Figtree text after he compared it with Gymshark on his iPhone.
9. **Speed, SEO and tools (Nov 25):** Claude Code CLI and the claude-seo plugin installed; SEO audit (45/100); Zazi title "ZAZI — Zapatillas Catálogo Oficial" (`SITIOS.titulo`, written into the HTML at deploy); card photos load in turns (visible first, the rest in the background) after measuring the slider's cost; the product view shows the card's photo instantly under the sharp one.
10. **Naming, sizes and critique (Nov 26):** model naming order; admin "Para" as two checkboxes (both = unisex); Etiquetas template with optional Estilo / Género (dropdown) / Nombre completo columns; Impeccable critique shown as a side-by-side showcase, then the approved changes built; size guide window (35–47, cm only) with the admin's "Modelo pequeño" checkbox (`pequeno`), all current Anda models marked small; footer contrast and admin font fixed.

---

## 10. Current data (as of Nov 26, 2026; the admin can change it at any time, so the repo is the truth)

### Zazi: 37 products (18 models; Anda D307 and D315 were published from Pendientes), all with `estilo` and `genero`
**Modelo pequeño (Nov 26):** every current Anda model (D318, D268, D263, D269, D308, D315, D307) has `pequeno: true`; every current You and I-RUN model is normal size. Stefano: this describes these specific models, not a rule per brand; new models are ticked (or not) one by one in the admin.
`filtros` also has an `intento` line ("Intento") with no products, a leftover from the first Nuevos modelos test; it doesn't show in the store (chips only appear with products). Ask Stefano before removing it.

| ids | products | source of price and sizes |
|---|---|---|
| 3001–3005 | Anda D318 Azul Rosa / Verde / Morado / Negro / Rosa (the old Anda 260X, renamed and recolored Nov 19) | **Shopify** (product 15520773570781): S/ 69.90 |
| 3006–3012 | Anda D268 Blanco Verde, D263 Blanco Verde, D269 Azul, D308 Blanco / Blanco Morado / Morado Verde / Negro (`creado` 2026-11-19, published from Pendientes) | **Shopify**: S/ 69.90 |
| 3013–3019 | Anda D315 Negro Morado / Rosa / Blanco Morado, Anda D307 Blanco Azul / Blanco Verde / Blanco Rosa / Azul Rosa (published from Pendientes) | **Shopify**: S/ 69.90 |
| 4001–4012 | You Urbano Onda, Chunky Trazo, Deportivo, Cápsula, Urbano Marco, Chunky Relieve (2 colors each) | **Shopify**: S/ 59.90, tallas 35–40 |
| 5001–5006 | I-RUN Horizon (2), STEP Gris Luna, Bostep Majesty Blanco, Urbanas Cloud Blanco Morado, Bostep RAVENX Crema Gris | **Manual** (not in Shopify yet): S/ 99.90, sizes per product |

**Zazi `pendientes.json`:** empty (the 7 Anda D307/D315 colors were published).

### Zazi-Modelos: 1 product, no `pendientes.json`
- **3001** Botín Pasador Marrón: linea Botines, modelo "Botín Pasador", estilo "Botín", genero mujer, color "Marrón", `#8B5A3C`, `creado` 2026-10-01, foto `fotos/botines/botin-pasador-marron.jpeg`, no description.
- **Linked to Shopify** "Pasador" / "Marron": S/ 79.00, tallas 35–39.
