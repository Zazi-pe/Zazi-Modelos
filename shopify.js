/* ============================================================
   ZAZI — precio y tallas desde Shopify
   Lo usan la tienda (index.html) y el admin (admin.html).
   Lee la API pública de la tienda online de Shopify (Storefront API, sin token):
   solo ve los productos publicados en la Tienda online.

   Un producto del catálogo se conecta con "shopify": {"id": "<id del producto>", "color": "<color en Shopify>"}.
   De Shopify salen el precio, las tallas y las tallas agotadas de ese color;
   todo lo demás (foto, nombre, descripción, "Nuevo"…) sigue saliendo de productos.json.
   ============================================================ */
(function (raiz) {
  "use strict";

  const TIENDA = "y0mdhy-r0.myshopify.com";          // dirección .myshopify.com de ZAZI
  const VERSION = "2026-10";
  const URL_API = "https://" + TIENDA + "/api/" + VERSION + "/graphql.json";
  const POR_CONSULTA = 3;                            // productos por consulta (límite de complejidad sin token)
  const ESPERA = 6000;                               // si Shopify no responde en 6 s, se usan los datos guardados

  const norm = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const gid = (id) => "gid://shopify/Product/" + id;
  const numero = (g) => String(g || "").split("/").pop();

  async function graphql(consulta, variables) {
    const control = new AbortController();
    const reloj = setTimeout(() => control.abort(), ESPERA);
    try {
      const r = await fetch(URL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query: consulta, variables: variables || {} }),
        signal: control.signal
      });
      if (!r.ok) throw new Error("Shopify respondió " + r.status);
      const d = await r.json();
      if (d.errors && d.errors.length) throw new Error(d.errors.map((e) => e.message).join("; "));
      return d.data;
    } finally {
      clearTimeout(reloj);
    }
  }

  // Color y talla de una variante (por el nombre de la opción, nunca por el título)
  function opciones(lista) {
    const r = { color: "", talla: "" };
    (lista || []).forEach((o) => {
      const n = norm(o.name);
      if (n === "color") r.color = String(o.value || "").trim();
      else if (n === "talla") r.talla = String(o.value || "").trim();
    });
    return r;
  }

  const CONSULTA_PRODUCTOS = `query($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id title
        variants(first: 100) { nodes { availableForSale price { amount } selectedOptions { name value } } }
      }
    }
  }`;

  /* ids (números como texto) -> Map(id -> { id, titulo, variantes: [{ color, talla, disponible, precio }] })
     Los productos que no están publicados en la Tienda online no aparecen. */
  async function productos(ids) {
    const unicos = [...new Set((ids || []).map(String).filter((id) => /^\d+$/.test(id)))];
    const grupos = [];
    for (let i = 0; i < unicos.length; i += POR_CONSULTA) grupos.push(unicos.slice(i, i + POR_CONSULTA));
    const respuestas = await Promise.all(grupos.map((g) => graphql(CONSULTA_PRODUCTOS, { ids: g.map(gid) })));
    const mapa = new Map();
    respuestas.forEach((d) => ((d && d.nodes) || []).forEach((n) => {
      if (!n || !n.id) return;
      mapa.set(numero(n.id), {
        id: numero(n.id),
        titulo: n.title,
        variantes: ((n.variants && n.variants.nodes) || []).map((v) => {
          const o = opciones(v.selectedOptions);
          return { color: o.color, talla: o.talla, disponible: !!v.availableForSale, precio: Number(v.price && v.price.amount) || 0 };
        })
      });
    }));
    return mapa;
  }

  // Tallas seguidas (35, 36… 40) se guardan como rango [35, 40], igual que en el admin
  function comoTallas(lista) {
    const nums = lista.map(Number);
    if (lista.length > 1 && nums.every((n, i) => Number.isInteger(n) && (i === 0 || n === nums[i - 1] + 1))) return [nums[0], nums[nums.length - 1]];
    return lista;
  }

  /* Datos de un color de un producto de Shopify: { precio, tallas, agotadas }
     o null si el producto no está o no tiene ese color. */
  function datosDe(info, color) {
    if (!info || !color) return null;
    const vs = info.variantes.filter((v) => norm(v.color) === norm(color));
    if (!vs.length) return null;
    let tallas = [];
    const disponibles = new Set();
    vs.forEach((v) => {
      const t = v.talla || "Único";
      if (!tallas.includes(t)) tallas.push(t);
      if (v.disponible) disponibles.add(t);
    });
    if (tallas.every((t) => !isNaN(Number(t)))) tallas.sort((a, b) => Number(a) - Number(b));
    const precios = vs.map((v) => v.precio).filter((n) => n > 0);
    return {
      precio: precios.length ? Math.min(...precios) : null,
      tallas: comoTallas(tallas),
      agotadas: tallas.filter((t) => !disponibles.has(t))
    };
  }

  /* Pone el precio, las tallas y las agotadas de Shopify en los productos conectados.
     Los que no se encuentran en Shopify se quedan con los datos de productos.json.
     Devuelve Map(id del catálogo -> datos aplicados). */
  async function aplicar(lista) {
    const conectados = (lista || []).filter((p) => p && p.shopify && p.shopify.id);
    const aplicados = new Map();
    if (!conectados.length) return aplicados;
    const mapa = await productos(conectados.map((p) => p.shopify.id));
    conectados.forEach((p) => {
      const d = datosDe(mapa.get(String(p.shopify.id)), p.shopify.color);
      if (!d) { console.warn("Shopify: no se encontró " + p.nombre + " (" + p.shopify.id + ", " + p.shopify.color + "); se usan los datos guardados."); return; }
      p.precio = d.precio;
      p.tallas = d.tallas;
      if (d.agotadas.length) p.agotadas = d.agotadas; else delete p.agotadas;
      aplicados.set(p.id, d);
    });
    return aplicados;
  }

  const CONSULTA_LISTA = `query($despues: String) {
    products(first: 100, after: $despues, sortKey: TITLE) {
      pageInfo { hasNextPage endCursor }
      nodes { id title options { name optionValues { name } } }
    }
  }`;

  // Para el admin: todos los productos publicados, por nombre: [{ id, titulo, colores: [...] }]
  async function lista() {
    const salida = [];
    let despues = null;
    for (let pagina = 0; pagina < 20; pagina++) {
      const d = (await graphql(CONSULTA_LISTA, { despues })).products;
      d.nodes.forEach((n) => {
        const op = (n.options || []).find((o) => norm(o.name) === "color");
        salida.push({ id: numero(n.id), titulo: n.title, colores: op ? op.optionValues.map((v) => v.name) : [] });
      });
      if (!d.pageInfo.hasNextPage) break;
      despues = d.pageInfo.endCursor;
    }
    return salida;
  }

  raiz.ZaziShopify = { TIENDA, aplicar, productos, datosDe, lista };
})(typeof window !== "undefined" ? window : globalThis);
