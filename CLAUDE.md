# Zazi-Modelos (catalog: ZAZI's own models)

Store: https://zazi-pe.github.io/Zazi-Modelos/ · Admin: https://zazi-pe.github.io/Zazi-Modelos/admin.html
This site: categories sandalias / botas / botines / zapatillas / zapatos, no product descriptions, category chips as the main filter, cart key `zazi-propios-carrito-v1`.

## Start of every session
1. Run `git pull` first. Stefano edits the catalog from `admin.html`, which commits straight to `main`, so the remote is often ahead.
2. Before any non-trivial task, read `docs/handoff.md`. It has the full background, decisions, the Shopify connection and history. The code is the ground truth; if the handoff and the code disagree, trust the code, tell Stefano, and fix the handoff.

## Business context
- ZAZI is a shoe store in Lima, Peru (SP SHOP S.A.C.). Stefano is a backend developer who works there; his mother heads the business, so he doesn't control every decision.
- Customers browse a static catalog, add to a cart saved in the browser, and check out via a pre-filled WhatsApp message (payment: Yape or cash).
- Two catalog repos share the same code: `Zazi` (branded sneakers: Anda, You, I-RUN) and `Zazi-Modelos` (ZAZI's own models: sandalias, botas, botines, zapatillas, zapatos). Both are local siblings in `~/ClaudeCode/Zazi-pe/`, next to `Etiquetas` (the label page and the Shopify worker).
- Both catalogs are in maintenance (not sent to customers yet), so temporary breakage during work is acceptable.
- Inventory lives in **Shopify** (moved from Bsale in Nov 2026; one Shopify product = one model with all its colors, variants = color + size). Catalog products linked with a `shopify` field get price, sizes and sold-out sizes live from Shopify (`shopify.js`); everything else stays in `productos.json`. The real I-RUN models aren't in Shopify yet, so they stay manual; Anda and You are connected.

## How Stefano works
- He writes in English. All site and admin copy is Spanish (Peru). Code identifiers and comments are in Spanish.
- Plan before building anything big: propose steps and ask the questions that matter first. Small changes can be committed and pushed directly; he tests afterwards.
- Don't add things he didn't ask for. Mention optional ideas; don't build them. Reuse existing code and design rather than reinventing.
- He tests on iPhone (Brave/Safari) and MacBook (Chrome). End changes with a short test checklist.
- Ideas he already rejected (don't bring back): blurred sold-out sizes (use grey strike-through), photo thumbnails as color swatches, color-name lists for parsing, store or contact data inside product data files, hiding the filter row when there's only one category, strong token permissions.

## Critical rules
- **`index.html`, `admin.html`, `validar.js`, `shopify.js`, `.github/workflows/publicar.yml` and `ESTRUCTURA.md` must stay byte-identical in `Zazi` and `Zazi-Modelos`.** Any change to one goes to both (sibling folder `../Zazi-Modelos` or `../Zazi`), committed and pushed in both. Verify with `cmp` before pushing. Site differences belong in the `SITIOS` object in `index.html`, never in diverging files.
- **`docs/handoff.md` is the same document in both repos.** When you update it, copy it to the sibling repo and commit and push both.
- `productos.json` is written by the admin: one product per line (one per color), fixed key order (`id, shopify, filtro, linea, nombre, modelo, estilo, genero, pequeno, color, colores, precio, tallas, agotadas, estado, nuevo, creado, foto, descripcion`). Don't hand-edit it unless asked; if you must, keep that exact format.
- `pendientes.json` (written by the Etiquetas page's Nuevos modelos, one product per line like `productos.json`) holds products waiting for a photo and swatch. The store and `validar.js` ignore it; the admin shows them in "Pendientes de publicar" and publishes them (photo and swatch required) in one commit.
- **One card per model:** the store groups colors by `filtro` + `modelo` at display time; never merge colors in the data (ids, Shopify links, carts and `#p<id>` links depend on one entry per color). `estilo` and `genero` are model-level (the admin copies them to every color). Customers see `modelo` (our own model names stay; Stefano rejected customer-facing renames like "Running Malla Degradé"); `nombre` goes in the WhatsApp order.
- The line/category chips (brands in Zazi) stay as the main filter row; Mujer / Hombre and Estilo live in the "Filtros" panel.
- `genero` (`mujer`/`hombre`/`unisex`) is required once any product in a catalog has it (validator error; both catalogs have it); a missing `estilo` only warns.
- **Model naming order (Stefano, Nov 26):** full name = Marca + Nombre (if it has one) + Código + Estilo + Color (e.g. "Anda D268 Deportiva Blanco Verde"); never the gender (it's only a filter tag; `unisex` counts for Mujer and Hombre). Shopify's product name and the catalog `modelo` are the short form Marca + Nombre (if any) + Código ("Anda D268"). The full name is reference only for now; don't rename existing products.
- The product view never preselects a size (except "Talla única"): the button reads "Elige tu talla" until the customer picks one.
- **Checkout never blocks a sale (Stefano, Nov 26):** empty important fields are only marked in red; nothing is `required`. The Yape QR stays visible.
- Size guide: 35 = 21.5 cm, +1 cm per size; a model with `pequeno: true` (admin checkbox "Modelo pequeño") shifts 1 cm down (40 = 25.5 cm).
- Payment copy is "Yape, Plin o en efectivo" everywhere (checkout option "Yape o Plin"). Don't mention transferencia unless checkout offers it.
- Store and contact data stay in `index.html` (`TIENDA`), never in `productos.json`. The Shopify store address lives in `shopify.js` (shared by store and admin).
- `shopify.js` reads Shopify's public Storefront API **without a token** (it works because the Online Store is open). Products must be published to the Online Store to be visible there; that's the Shopify setting to check if a linked product stops updating.
- **Stock lock (Stefano's rule):** the store draws at once with the saved data, but a connected product can't be chosen, added or sent until Shopify answers ("Verificando stock…"). If Shopify fails, buying unlocks with the saved data and a note says stock is confirmed by WhatsApp. Keep this when touching the store.
- Photos are served as WebP copies made at deploy (`fotos-web/`, 400/800/full, quality 82–85) through `<picture>`, with the original as fallback. Don't lower the quality: q75 looked pixelated on iPhone.
- Run `node validar.js` before every commit. Errors block the deploy.
- Some photo names have accents. Don't rename photos without updating `productos.json`.
- Never write tokens, keys or passwords into any file. The repos are public.

## Deploy and testing
- A push to `main` runs `.github/workflows/publicar.yml` (validate, then GitHub Pages). The site updates in about 1–2 minutes; if validation fails, the last good version stays online.
- Local test: from `~/ClaudeCode/Zazi-pe/` run `python3 -m http.server` and open `/Zazi/` or `/Zazi-Modelos/` (site detection uses the first path segment; `?sitio=zazi-modelos` overrides it).
- Admin changes can be tested with a mocked GitHub API (method in the handoff, section 7): Playwright, or a test copy of `admin.html` with a fake `fetch` injected, served from the scratchpad under a `/Zazi/` path and opened in the browser pane. Shopify reads can hit the real store (read-only, public).

## Updating the handoff (when and how)
**When:** update the handoff as soon as Stefano says anything like "I'll migrate to another chat", "moving to a new session", "let's wrap up", "update the handoff" or "handoff". Do it right away as the last task of the session, without asking for confirmation. Also do it after a big milestone is finished and pushed. If the conversation is getting long, suggest it to him.

**How:**
0. `docs/handoff.md` is the only handoff document. Never create extra handoff or "new chat" files; put everything in that one file so old and new versions can't contradict each other.
1. Edit the existing sections of `docs/handoff.md` (current state, decisions, next steps, open questions) so the document describes the project as it is now. Don't just append a session log, and remove anything that is no longer true.
2. Update the "last updated" date in the title.
3. Move any new permanent rule into this `CLAUDE.md` as well.
4. Never write secret values (tokens, keys, passwords).
5. Commit with a descriptive message and push.
6. Tell Stefano it's done, with a one-line summary of what changed, so he can start the next session.
