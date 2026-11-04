/* ============================================================
   ZAZI — revisión del catálogo (productos.json)
   Lo usan el admin (antes de publicar) y GitHub Actions (antes de
   publicar la tienda). Errores: bloquean. Avisos: solo informan.
   Uso en la computadora:  node validar.js
   ============================================================ */
(function (raiz) {
  "use strict";

  const ESTADOS = ["disponible", "agotado", "proximamente"];
  const NUEVO = ["auto", "si", "no"];
  const norm = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const hexOk = (h) => typeof h === "string" && /^#[0-9a-f]{3,8}$/i.test(h);

  function tallasDe(p) {
    const t = Array.isArray(p.tallas) ? p.tallas : [];
    if (t.length === 2 && typeof t[0] === "number" && typeof t[1] === "number") {
      const lista = [];
      for (let n = t[0]; n <= t[1] && lista.length <= 60; n++) lista.push(String(n));
      return lista;
    }
    return t.map(String);
  }

  /* datos: el contenido de productos.json
     archivos: lista de rutas que existen en el repositorio (o null si no se sabe) */
  function validar(datos, archivos) {
    const errores = [], avisos = [];
    const err = (p, msg) => errores.push({ id: p ? p.id : null, nombre: p ? p.nombre : "", msg });
    const aviso = (p, msg) => avisos.push({ id: p ? p.id : null, nombre: p ? p.nombre : "", msg });

    if (!datos || typeof datos !== "object") { err(null, "productos.json no tiene el formato esperado."); return { errores, avisos }; }
    const filtros = Array.isArray(datos.filtros) ? datos.filtros : [];
    const productos = Array.isArray(datos.productos) ? datos.productos : null;
    if (!productos) { err(null, "productos.json no tiene la lista de productos."); return { errores, avisos }; }
    const lineas = new Set(filtros.map((f) => Array.isArray(f) ? f[0] : null));
    const existe = archivos ? new Set(archivos) : null;

    const ids = new Map(), nombres = new Map();
    productos.forEach((p) => {
      if (!p || typeof p !== "object") { err(null, "Hay un producto vacío o mal escrito."); return; }
      // identidad
      if (!Number.isInteger(p.id) || p.id <= 0) err(p, "No tiene un número de producto (id) válido.");
      else if (ids.has(p.id)) err(p, "Tiene el mismo número (id " + p.id + ") que " + ids.get(p.id) + ".");
      else ids.set(p.id, p.nombre || "otro producto");
      if (!String(p.nombre || "").trim()) err(p, "No tiene nombre.");
      else {
        const k = norm(p.nombre);
        if (nombres.has(k)) err(p, "Tiene el mismo nombre que otro producto; los clientes no podrían diferenciarlos.");
        else nombres.set(k, p.id);
      }
      if (!String(p.modelo || "").trim()) err(p, "No tiene modelo.");
      if (!lineas.has(p.filtro)) err(p, "Su línea o categoría (" + (p.filtro || "vacía") + ") no existe en los filtros.");

      // foto
      if (!p.foto) err(p, "No tiene foto.");
      else if (existe && !existe.has(p.foto)) err(p, "Su foto no está en el repositorio (" + p.foto + ").");

      // precio
      if (p.precio !== null && !(typeof p.precio === "number" && p.precio > 0)) err(p, "El precio no es válido (debe ser un número o \"por confirmar\").");

      // tallas
      const t = Array.isArray(p.tallas) ? p.tallas : [];
      if (!t.length) err(p, "No tiene tallas.");
      else if (t.length === 2 && typeof t[0] === "number" && typeof t[1] === "number" && t[0] > t[1]) err(p, "Las tallas están al revés (desde " + t[0] + " hasta " + t[1] + ").");
      const lista = tallasDe(p);
      const agotadas = Array.isArray(p.agotadas) ? p.agotadas.map(String) : [];
      const fuera = agotadas.filter((x) => !lista.includes(x));
      if (fuera.length) aviso(p, "Tiene marcadas como agotadas tallas que no vende (" + fuera.join(", ") + ").");

      // estado
      if (!ESTADOS.includes(p.estado)) err(p, "El estado no es válido (" + p.estado + ").");
      else if (p.estado === "disponible" && lista.length && lista.every((x) => agotadas.includes(x))) aviso(p, "Está como disponible, pero todas sus tallas están agotadas (la tienda lo muestra como agotado).");

      // color, nuevo y fecha
      if (p.color && !(Array.isArray(p.colores) && p.colores.some(hexOk))) aviso(p, "No tiene el tono del cuadrito de color (se mostrará el nombre del color).");
      if (p.nuevo !== undefined && !NUEVO.includes(p.nuevo)) err(p, "El valor de \"Nuevo\" no es válido (" + p.nuevo + ").");
      if (!p.creado || isNaN(Date.parse(p.creado))) aviso(p, "No tiene fecha de alta (no podrá salir como Nuevo ni en la vitrina).");
    });

    // fotos que ningún producto usa
    if (existe) {
      const usadas = new Set(productos.map((p) => p && p.foto).filter(Boolean));
      [...existe].filter((r) => r.startsWith("fotos/") && /\.(jpe?g|png|webp)$/i.test(r) && !usadas.has(r))
        .forEach((r) => aviso(null, "La foto " + r + " no la usa ningún producto."));
    }
    return { errores, avisos };
  }

  const api = { validar, tallasDe };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else raiz.ZaziValidar = api;

  /* ---------- node validar.js (GitHub Actions) ---------- */
  if (typeof require !== "undefined" && typeof module !== "undefined" && require.main === module) {
    const fs = require("fs"), path = require("path");
    const listar = (dir) => !fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.name.startsWith(".") ? [] : e.isDirectory() ? listar(path.join(dir, e.name)) : [path.join(dir, e.name).split(path.sep).join("/")]);
    let datos;
    try { datos = JSON.parse(fs.readFileSync("productos.json", "utf8")); }
    catch (e) { console.log("::error::productos.json no es un JSON válido: " + e.message); process.exit(1); }
    const r = validar(datos, listar("fotos"));
    const linea = (x) => (x.nombre ? x.nombre + ": " : "") + x.msg;
    r.avisos.forEach((x) => console.log("::warning::" + linea(x)));
    r.errores.forEach((x) => console.log("::error::" + linea(x)));
    console.log("Revisión: " + (datos.productos || []).length + " producto(s), " + r.errores.length + " error(es), " + r.avisos.length + " aviso(s).");
    process.exit(r.errores.length ? 1 : 0);
  }
})(typeof window !== "undefined" ? window : this);
