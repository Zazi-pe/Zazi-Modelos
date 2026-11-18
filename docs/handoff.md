# ZAZI catalogs — handoff (living document, last updated November 18, 2026)

Living handoff for the two catalog repos, **Zazi** and **Zazi-Modelos**. The same file lives in both repos at `docs/handoff.md`; whenever it's updated, the copy in the other repo is updated too. It is updated at the end of every Claude Code session (see `CLAUDE.md`).

It replaces the older handoffs (`ZAZI_handoff.md`, `ZAZImodels-handoff.md` and the Nov 4 chat handoff). Section 8 describes the Shopify connection; the Etiquetas handoff covers the Shopify worker and labels.

**Ground truth:** the code in the repos. If this document and the code disagree, trust the code and update this document.

---

## 1. Context and working rules

### Business
- **ZAZI** is a shoe store in Lima, Peru. Its legal entity is SP SHOP S.A.C.
- **Stefano** (Stefano Mateo Portalatino Tapia) works there and is a backend developer. His mother heads the business, so Stefano doesn't control every decision.
- **How customers buy:** they browse a static catalog site, add to a cart saved in the browser, and check out by sending a pre-filled WhatsApp message.
  - **Payment:** Yape (with QR) or cash. Yape and Plin are interoperable in Peru, so "Yape, Plin o transferencia" in "Cómo comprar" is intentional, not a mismatch.
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
- **Tools:** since Nov 2026 he works with **Claude Code** (Code tab of the Claude desktop app, Environment: Local). The repos are cloned on his MacBook in `~/ClaudeCode/Zazi-pe/` (`Zazi/`, `Zazi-Modelos/`, `Etiquetas/`). Claude edits the files directly, runs the checks and tests, then commits and pushes with Git. The old chat workarounds (GitHub connector, zips to upload by hand, byte-for-byte checks against GitHub) are no longer needed.
- **Pushing:** small changes can be committed and pushed directly, no approval needed; he tests afterwards and asks for adjustments. Big changes: plan first and get his OK.
- **Photos:** the admin adds product photos from the camera roll and names them itself. Stefano keeps his original photos on his laptop. If photo files are added another way, follow the naming rules in section 2.
- **Testing:** he tests on his iPhone (Brave/Safari) and MacBook. Give short test checklists.
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
| Latest commit when this was rewritten (Nov 12) | `0272845` | `15e3898` |

- Both repos are public, on branch `main`. The account is `Zazi-pe`.
- **Deploy (both repos):** Settings → Pages → Source = **GitHub Actions**. Every push to `main` runs `.github/workflows/publicar.yml`:
  1. Checkout.
  2. `node validar.js`. On errors it stops, and **the last good version stays online**.
  3. Copy `index.html admin.html productos.json validar.js` plus `fotos/` and `img/` into `_site/`.
  4. Deploy with `configure-pages@v5`, `upload-pages-artifact@v3` and `deploy-pages@v4`.
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
fotos/                           product photos; different per repo
img/                             favicon.png, logo-zazi.png, logo-zazi-blanco.png, yape-qr.jpg; same in both
```

- **Zazi `fotos/`:** 23 photos in a flat folder, with legacy names such as `fotos/anda-260x-celeste.jpeg`. Some names have accents (`you-cápsula-blanco-rosa.jpeg`, `you-deportivo-blanco-marrón.jpeg`, `i-run-horizon-marrón-crema.jpeg`); they work, but don't rename them without updating `productos.json`.
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
    {"id":4001,"shopify":{"id":"15503136456925","color":"Gris Lila"},"filtro":"you","linea":"You","nombre":"You Urbano Onda Gris Lila","modelo":"You Urbano Onda","color":"Gris Lila","colores":["#B0A6BE"],"precio":59.9,"tallas":[35,40],"agotadas":["35","36","37","38"],"estado":"disponible","creado":"2026-09-24","foto":"fotos/you-urbano-onda-gris-lila.jpeg","descripcion":"…"}
  ]
}
```

**Key order:** `id, shopify, filtro, linea, nombre, modelo, color, colores, precio, tallas, agotadas, estado, nuevo, creado, foto, descripcion`. Optional fields are omitted when empty: `shopify`, `agotadas`, `nuevo` (absent means auto) and `descripcion`.

| Field | Meaning |
|---|---|
| `id` | Unique integer and stable identity, used in deep links `#p<id>` and in carts. Each line takes a block of 1000 (Zazi: Anda 3xxx, You 4xxx, I-RUN 5xxx). A new product gets the highest id in its line's block + 1; a new line opens the next block (minimum 3000). |
| `shopify` | Optional link to Shopify: `{"id": "<Shopify product id>", "color": "<Color option value as in Shopify>"}`. When present, the store takes **price, sizes and sold-out sizes** from Shopify for that color; the values saved here are only a fallback (refreshed each time the product is saved in the admin). The catalog `color` stays for display, so "Marrón" can link to Shopify's "Marron". Replaced the old empty `sku` field (Nov 18). |
| `filtro` / `linea` | Line or category key (must exist in `filtros`) and its display name. |
| `nombre` / `modelo` / `color` | Full display name (accents allowed), model without color, and color. **Same `filtro` + same `modelo` = colors of one model** (swatches in the product view). |
| `colores` | Swatch: 1 hex (solid) or 2 (diagonal split). Empty or invalid shows the color **name as a text chip**. |
| `precio` | Number, or `null` for "Consultar precio" (cart says "Por confirmar"). |
| `tallas` | `[a,b]` (two numbers) is the range a…b; `["36","38"]` lists specific sizes; `["Único"]` is one size ("Talla única"). The admin only writes ranges or `["Único"]`. |
| `agotadas` | Sold-out sizes, as strings. |
| `estado` | `disponible`, `agotado` or `proximamente`. If every size is sold out, the store shows "agotado". |
| `nuevo` | Absent = automatic (shows "Nuevo" for `DIAS_NUEVO` = 14 days after `creado`). `"si"` or `"no"` forces it. Set from the admin (Automático / Sí / No). |
| `creado` | Date the product was added, `YYYY-MM-DD`, set by the admin in Lima time. It controls the "Recomendados" order (newest first, ties broken by higher id), "Nuevo", and the **vitrina (automatic: the newest product with a photo)**. |
| `foto` | Path in the repo. |
| `descripcion` | Shown only where the site setting `descripciones` is on (Zazi). |

**`filtros`:**
- **Zazi:** `[["zapatillas","Zapatillas"],["anda","Anda"],["you","You"],["irun","I-RUN"]]`. "Zapatillas" is intentionally kept unused.
- **Modelos:** `[["sandalias","Sandalias"],["botas","Botas"],["botines","Botines"],["zapatillas","Zapatillas"],["zapatos","Zapatos"]]`.
- **How chips show:** a chip appears only if it has products, plus "Todos".

There is **no `vitrina` field** anymore; the vitrina is always automatic.

---

## 4. Store: `index.html` (shared, about 61 KB)

**Structure:** one file with HTML, CSS and two `<script>` blocks. It is based on the Zazi design (clean sport store, references Gymshark and KHY):
- **Fonts:** Oswald for titles, Inter for text, Playfair Display italic for the vitrina name.
- **Tokens:** `--tinta #000`, `--papel #fff`, `--piedra #F4F4F4`, `--linea #E6E6E6`, `--gris #767676`, `--fucsia #C11A61` (brand moments only), `--alerta #B3261E`.

**First script (store data):**
- `TIENDA`: nombre "ZAZI", whatsapp "51959161270", instagram and tiktok "zazi.pe", and `yape: { numero: "959 161 270", titular: "Rosario Tapia Carrasco" }`.
- `SITIOS`: per-site differences (table below).
- `DIAS_NUEVO = 14`.
- Rule: store data stays in `index.html`, never in `productos.json`.

| `SITIOS` key | `carrito` (localStorage key) | `datosPortada` (hero stats band 100% / 24H / 35-46) | `precioEnFicha` (price line under name in product view) | `descripciones` |
|---|---|---|---|---|
| `zazi` | `zazi-carrito-v1` | true | false | true |
| `zazi-modelos` | `zazi-propios-carrito-v1` | false | true | false |

- **Which site am I:** the first segment of `location.pathname`, lowercased (`zazi` / `zazi-modelos`). Override with `?sitio=zazi-modelos` for local testing; the default is `zazi`.
- **Separate cart keys** exist because both sites share the `zazi-pe.github.io` origin.

**Second script (logic, an async IIFE):**
- **Shopify:** right after `productos.json` loads, `ZaziShopify.aplicar(PRODUCTOS)` (from `shopify.js`, loaded in `<head>`) overwrites `precio`, `tallas` and `agotadas` of linked products with Shopify's live data, before the "all sizes sold out → agotado" rule and the cart run. If Shopify fails or takes over 6 s, the saved values stay. Unlinked products work as before.
- **Loading:** `fetch("productos.json?v="+Date.now(), {cache:"no-store"})`. If the load fails, it shows "No pudimos cargar el catálogo…" plus a WhatsApp button; with no products, it shows "Estamos preparando el catálogo…".
- **"Nuevo":** forced by `nuevo` "si"/"no", otherwise within 14 days of `creado`. Sorting goes by date, then id.
- **Vitrina:** the newest product with a photo, labelled "MODELO EN VITRINA". With no products, the hero becomes text-only (`.hero-solo`).
- **Filters:** "Todos" plus the `filtros` entries that have products. The chip counts are hidden by CSS.
- **Search:** multi-word AND, accent and case insensitive, over `nombre + linea`. "you gris" shows only items with both words.
- **Sort:** "Recomendados" is by date. The price sorts put no-price products last.
- **Cards:** photo (4:5, `object-fit:cover`), linea, nombre, price, sizes text, and badges "Nuevo", "Agotado" (greyed) or "Próximamente".
- **Product view** (`<dialog id="modal">`, deep link `#p<id>`):
  - **Header:** name, linea, and the price line if `precioEnFicha`.
  - **Swatches:** every product with the same filtro + modelo, ordered by `creado` then id; a text chip if there's no hex.
  - **Size grid:** 3 per row. Sold-out sizes are grey with a strike-through and disabled. The smallest in-stock size is preselected, and changing color keeps the size when possible.
  - **Sticky bar:** if the button's natural spot is below the visible area, it sticks to the bottom with "Talla X ⌄" on the left and "Añadir - S/ 69.90" on the right. Tapping "Talla X" auto-scrolls to center the options.
  - **Auto-scroll fix:** adds `padding-bottom` when there isn't enough room, and uses `scrollTo` to a fixed target so repeated taps can't land on "Añadir". Ported from Modelos; it matters when there's no description.
  - **No sizes:** "Consultar por WhatsApp" instead of the add button.
  - **Description** below the button, if enabled for the site.
- **Cart** (`<dialog id="carrito">`, slides up from the bottom):
  - Quantity +/−, remove, "Vaciar carrito" (with confirmation), total.
  - Saved lines are dropped on load if the product, size or sold-out status no longer fits.
  - Checkout view: delivery fields that depend on the chosen option, Yape/Efectivo (Yape preselected on purpose, with the QR `img/yape-qr.jpg`), and send via `wa.me/51959161270?text=…`.
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

### List screen
- Search (multi-word), line chips, and a "Nuevo" button.
- **Rows, newest first:**
  - Photo, name, price and estado, plus "Nuevo" if it currently shows and "En vitrina" (computed).
  - **Tappable size chips:** tap to mark a size sold out or restock it, the fastest action. **Linked products** show a green "Shopify" tag, their live price and sizes from Shopify, and size chips that can't be tapped (Shopify decides).
  - A fuchsia bar on the left marks changed rows.
- **Black bottom bar:** "N cambios sin publicar" with Descartar and Publicar.
- `beforeunload` warns about unpublished changes.

### Editor
A full-screen dialog on phone, centered on desktop. It covers:
- **Photo:** chosen from the camera roll, then center-cropped to 4:5, resized to 800×1000 and saved as JPEG of 220 KB or less (quality steps 0.85 → 0.6).
- **Line/categoría:** existing or a new one.
- **Name fields:** modelo, color, and nombre (auto-built from modelo + color, editable).
- **Swatch:** 1–2 color pickers, auto-filled from any product with the same color name until edited by hand.
- **Price:** a number or "Por confirmar".
- **Sizes:** desde/hasta or talla única, plus a sold-out size grid.
- **Estado:** Disponible / Agotado / Próximamente.
- **"Nuevo":** Automático / Sí / No, with a note like "Agregado el … Muestra Nuevo hasta el …".
- **Description:** Zazi only.
- **Producto en Shopify:** a list of every product published in the Online Store, then a color list for the chosen product (preselected when it matches the catalog color). A note shows "Desde Shopify: S/ 59.90 · tallas 35 al 40 · agotadas: …". While linked, the price, sizes and sold-out fields are hidden; saving copies Shopify's values into the product as a fallback. Choosing "Sin conectar" brings the manual fields back, prefilled. Saving a link needs a color; if Shopify can't be read, an unchanged link keeps its saved values.
- **Actions:** "Añadir otro color de este modelo" copies line, model, price, sizes and the Shopify product (color left to choose). "Eliminar producto" asks for confirmation; its photo is deleted from the repo if no other product uses it.
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

**Warnings (publishing allowed):**
- sold-out sizes outside the product's sizes
- disponible but all sizes sold out
- a color with no valid hex (shows as a text chip)
- `creado` missing or invalid
- photos in `fotos/` that no product uses

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
- **After pushing:** the site updates in about 1–2 minutes; runs are visible in each repo's Actions tab. Then give Stefano a short test checklist (iPhone and MacBook).
- **Workflow files** (`.github/workflows/*`) can be edited like any other file now. If GitHub rejects the push for missing permissions, run `gh auth refresh -s workflow` and push again. Make sure the first line of the YAML (a `#` comment or `name:`) is intact; a lost leading `#` once made the workflow invalid.

---

## 8. Future work

### Shopify connection (built Nov 18)

**Setup in Shopify:** the **Online Store is open** (no password) and products are published to both **Online Store** and **Point of Sale**. That lets `shopify.js` use Shopify's public Storefront API **with no token** (`https://y0mdhy-r0.myshopify.com/api/2026-10/graphql.json`). Only products published to the Online Store are visible to it. As of Nov 18, Shopify's admin still reported 12 products not on the Online Store (the first ones alphabetically, none in the catalogs). Stefano plans to improve the Shopify store itself later; for now it just has to be open.

**What's linked (Nov 18):** the 12 You products (Shopify products "You Urbano Onda", "You Chunky Trazo", "You Deportivo", "You Cápsula", "You Urbano Marco", "You Chunky Relieve", same color names) and Modelos' Botín Pasador Marrón (Shopify "Pasador", color "Marron"). **Anda 260X and the real I-RUN models aren't in Shopify yet** (only a generic "Zapatilla I-RUN" with color "-"), so they stay manual until Stefano adds them; then link them from the admin.

**Prices changed by the link:** You is S/ 59.90 in Shopify (the 69.90 in the catalog was outdated; Stefano: the You price can change again later, and Shopify is the source). Pasador is S/ 79.00 in Shopify (catalog had 79.90). Sold-out sizes now follow Shopify's stock; You Deportivo Blanco Marrón is sold out in every size, so the store shows it as "Agotado".

**How `shopify.js` works:**
- `aplicar(lista)`: groups linked products by Shopify id (3 per query, to stay under the tokenless complexity limit; ~240 ms for all), reads each product's variants (`availableForSale`, `price`, `selectedOptions`), keeps the variants whose **Color** option matches the link color (accent- and case-insensitive), and sets `precio` (lowest price of that color, `null` if 0), `tallas` (consecutive numbers become a range `[a, b]`; otherwise a list; no Talla option = `["Único"]`) and `agotadas` (sizes with no available variant). Products or colors not found keep their saved values (console warning).
- `lista()`: every product in the Online Store with its colors, for the admin picker (~1 s).
- Stock is "available or not" (Storefront gives no counts), summed over Shopify's single location.
- `validar.js`: a `shopify` value must have a numeric `id` and a `color` (error otherwise). The "disponible but all sizes sold out" warning is skipped for linked products, since Shopify decides.

**Not built / ideas (mention, don't build):** linking Anda and I-RUN once they're in Shopify; the Shopify store's own design; showing exact stock counts (would need a Storefront token with inventory access or the worker).

### Other
- **Optional, not requested yet** (mention, don't do unasked):
  - checkout fields aren't `required` (for example, a Shalom order can be sent without DNI)
  - no `og:image` or link preview
  - the hero says sizes go up to 46 ("Tallas 35 a 39 mujer, 40 a 46 hombre"), but the largest size in the data is 44
  - `#aviso` dead code
- **Not discussed:** Culqi payment links. Stefano has a Culqi account; an on-site Culqi checkout was discussed once, never built. Never put a Culqi secret key in the site.
- **Not discussed:** analytics, SEO, custom domain.

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
5. **Shopify (Nov 18):** inventory moved from Bsale to Shopify. The label page's worker was rewritten for Shopify (Etiquetas repo). The catalogs got `shopify.js`, the `shopify` field (replacing `sku`), the admin picker, and the 13 You/Pasador products linked. Bsale's catalog plan (worker-served stock, branches, price list 5) was dropped: the stores read Shopify's public API directly.

---

## 10. Current data (as of Nov 18, 2026; the admin can change it at any time, so the repo is the truth)

### Zazi: 23 products, all `disponible`, all with descriptions
Every product has `nuevo` on auto. Anda and You have `creado` 2026-09-24; I-RUN has 2026-09-26. The vitrina is the newest, I-RUN Bostep RAVENX (5006).

| ids | products | source of price and sizes |
|---|---|---|
| 3001–3005 | Anda 260X Celeste / Jade / Morado / Negro / Rosa | **Manual** (not in Shopify): S/ 69.90, tallas 35–39 |
| 4001–4012 | You Urbano Onda, Chunky Trazo, Deportivo, Cápsula, Urbano Marco, Chunky Relieve (2 colors each) | **Shopify** (linked): S/ 59.90 on Nov 18, tallas 35–40, sold-out sizes live |
| 5001–5006 | I-RUN Horizon (2), STEP Gris Luna, Bostep Majesty Blanco, Urbanas Cloud Blanco Morado, Bostep RAVENX Crema Gris | **Manual** (not in Shopify yet): S/ 99.90, sizes per product (RAVENX 40–44 with 41–44 sold out) |

### Zazi-Modelos: 1 product
- **3001** Botín Pasador Marrón: linea Botines, modelo "Botín Pasador", color "Marrón", `#8B5A3C`, `creado` 2026-10-01, foto `fotos/botines/botin-pasador-marron.jpeg`, no description.
- **Linked to Shopify** "Pasador" / "Marron": S/ 79.00, tallas 35–39, sold out 36, 38, 39 on Nov 18.
