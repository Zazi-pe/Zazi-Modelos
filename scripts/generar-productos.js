#!/usr/bin/env node
/* ============================================================
   Genera productos.json a partir de las fotos en fotos/<categoria>/.

   Regla de nombres de archivo:
     bota-chelsea-negro.jpg              → modelo "bota-chelsea", color "negro"
     bota-chelsea-blanco-gris.jpg        → modelo "bota-chelsea", color "blanco-gris"
     sandalia-plataforma-alta--negro.jpg → modelo "sandalia-plataforma-alta", color "negro"
   (sin "--": las dos primeras palabras son el modelo y el resto es el color;
    con "--": todo lo de antes es el modelo y todo lo de después es el color)

   La fecha de cada producto es la del commit en que se subió la foto.
   Uso:  node scripts/generar-productos.js
   ============================================================ */
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const RAIZ = process.cwd();
const CARPETA = path.join(RAIZ, "fotos");
const CONFIG = path.join(RAIZ, "config.json");
const SALIDA = path.join(RAIZ, "productos.json");
const EXT = /\.(jpe?g|png|webp)$/i;
const EN_ACTIONS = !!process.env.GITHUB_ACTIONS;

let totalAvisos = 0;
function aviso(msg, archivo) {
  totalAvisos++;
  console.log(EN_ACTIONS ? `::warning${archivo ? ` file=${archivo}` : ""}::${msg}` : `AVISO: ${msg}`);
}
function fallo(msg, archivo) {
  console.error(EN_ACTIONS ? `::error${archivo ? ` file=${archivo}` : ""}::${msg}` : `ERROR: ${msg}`);
  process.exit(1);
}

const norm = (t) => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const clave = (t) => norm(t).trim().replace(/[\s_]+/g, "-");
const orden = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const hexValido = (h) => typeof h === "string" && /^#[0-9a-f]{3,8}$/i.test(h);

/* "bota-chelsea-negro" → { modelo: "bota-chelsea", color: "negro" } */
function partirNombre(stem) {
  const s = stem.trim().replace(/[\s_]+/g, "-");
  const i = s.indexOf("--");
  if (i === 0) return null;
  if (i > 0) return { modelo: s.slice(0, i), color: s.slice(i + 2).replace(/^-+|-+$/g, "") };
  const p = s.split(/-+/).filter(Boolean);
  if (!p.length) return null;
  return { modelo: p.slice(0, 2).join("-"), color: p.slice(2).join("-") };
}

/* Fecha en que se subió la foto (primer commit del archivo). Si no hay git, usa la fecha del archivo. */
function fechaDeSubida(rel, abs) {
  try {
    const out = execFileSync(
      "git", ["-c", "core.quotepath=off", "log", "--follow", "--diff-filter=A", "--format=%aI", "--", rel],
      { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
    if (out) { const l = out.split("\n"); return l[l.length - 1]; }
  } catch (e) { /* sin git */ }
  return fs.statSync(abs).mtime.toISOString();
}

/* ---------- 1. Leer las fotos ---------- */
const productos = [];
const ids = new Set();

if (fs.existsSync(CARPETA)) {
  const cats = fs.readdirSync(CARPETA, { withFileTypes: true }).sort((a, b) => orden(a.name, b.name));
  for (const cat of cats) {
    if (cat.name.startsWith(".")) continue;
    if (!cat.isDirectory()) {
      if (EXT.test(cat.name)) aviso(`Foto suelta en fotos/: "${cat.name}". Muévela a una carpeta de categoría (por ejemplo fotos/botas/).`);
      continue;
    }
    const dir = path.join(CARPETA, cat.name);
    const archivos = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => orden(a.name, b.name));
    for (const f of archivos) {
      if (f.name.startsWith(".")) continue;
      const rel = `fotos/${cat.name}/${f.name}`;
      if (f.isDirectory()) { aviso(`Subcarpeta ignorada: ${rel}. Las fotos van directo dentro de fotos/${cat.name}/.`); continue; }
      if (!EXT.test(f.name)) { aviso(`Archivo ignorado (no es jpg, png ni webp): ${rel}`); continue; }

      const stem = f.name.replace(EXT, "");
      if (!/^[a-z0-9]+(?:-{1,2}[a-z0-9]+)*$/.test(stem)) {
        aviso(`Nombre poco recomendable: ${rel}. Funciona, pero conviene usar minúsculas, sin acentos ni espacios.`);
      }
      const partes = partirNombre(stem);
      if (!partes || !partes.modelo) { aviso(`No se pudo leer el nombre: ${rel}. Se ignora.`); continue; }

      const id = `${cat.name}/${stem}`;
      if (ids.has(clave(id))) { aviso(`Foto repetida (mismo nombre con otra extensión): ${rel}. Se ignora.`); continue; }
      ids.add(clave(id));

      productos.push({
        id,
        categoria: cat.name,
        modeloSlug: partes.modelo,
        colorSlug: partes.color,
        claveModelo: `${clave(cat.name)}/${clave(partes.modelo)}`,
        colorClave: clave(partes.color),
        foto: rel,
        fecha: fechaDeSubida(rel, path.join(dir, f.name)),
      });
    }
  }
}

/* ---------- 2. Revisar config.json contra las fotos ---------- */
let config = {};
if (!fs.existsSync(CONFIG)) {
  aviso("No existe config.json: los modelos aparecerán como \"Consultar precio\".");
} else {
  try { config = JSON.parse(fs.readFileSync(CONFIG, "utf8")); }
  catch (e) { fallo(`config.json no es un JSON válido (${e.message}). Revisa comas y comillas.`, "config.json"); }
}

const paleta = {};
Object.entries(config.colores || {}).forEach(([k, v]) => {
  const hex = Array.isArray(v) ? v : [v];
  if (!hex.length || !hex.every(hexValido)) aviso(`config.json: el color "${k}" no tiene un código hex válido (ejemplo: "#1A1A1A").`, "config.json");
  else paleta[clave(k)] = hex;
});
/* Un color de dos palabras ("blanco-gris") se arma solo si ambas están en la paleta. */
function muestraDe(colorClave) {
  if (paleta[colorClave]) return true;
  const w = colorClave.split("-");
  return w.length === 2 && !!paleta[w[0]] && !!paleta[w[1]];
}

const modelos = {};
Object.entries(config.modelos || {}).forEach(([k, v]) => { modelos[clave(k)] = v || {}; });

const modelosConFoto = new Map(); // claveModelo → [productos]
productos.forEach((p) => {
  if (!modelosConFoto.has(p.claveModelo)) modelosConFoto.set(p.claveModelo, []);
  modelosConFoto.get(p.claveModelo).push(p);
});

for (const [k, lista] of modelosConFoto) {
  const m = modelos[k];
  if (!m) { aviso(`Modelo sin configurar: "${k}". Agrega su precio y tallas en config.json (mientras tanto se muestra "Consultar precio").`, "config.json"); continue; }
  if (typeof m.precio !== "number") aviso(`Modelo "${k}": falta el precio (número, por ejemplo 89.90).`, "config.json");
  if (!Array.isArray(m.tallas) || !m.tallas.length) aviso(`Modelo "${k}": faltan las tallas (por ejemplo [35, 40]).`, "config.json");
  if (m.agotadas !== undefined && !Array.isArray(m.agotadas)) aviso(`Modelo "${k}": "agotadas" debe ser una lista, por ejemplo ["36","37"].`, "config.json");
  const coloresDelModelo = new Set(lista.map((p) => p.colorClave));
  Object.entries(m.colores || {}).forEach(([c, ov]) => {
    if (!coloresDelModelo.has(clave(c))) aviso(`Modelo "${k}": config.json menciona el color "${c}" pero no hay foto de ese color.`, "config.json");
    if (ov && ov.hex !== undefined && !(Array.isArray(ov.hex) ? ov.hex : [ov.hex]).every(hexValido)) aviso(`Modelo "${k}", color "${c}": código hex no válido.`, "config.json");
  });
}
Object.keys(modelos).forEach((k) => {
  if (!modelosConFoto.has(k)) aviso(`config.json tiene el modelo "${k}" pero no hay fotos con ese nombre. ¿Error de escritura?`, "config.json");
});

const sinMuestra = new Set();
productos.forEach((p) => {
  if (!p.colorClave) return;
  const ov = modelos[p.claveModelo] && modelos[p.claveModelo].colores;
  const tieneOverride = ov && Object.entries(ov).some(([c, o]) => clave(c) === p.colorClave && o && o.hex);
  if (!tieneOverride && !muestraDe(p.colorClave)) sinMuestra.add(p.colorClave);
});
sinMuestra.forEach((c) => aviso(`Color nuevo sin muestra: "${c}". Agrégalo en "colores" de config.json (por ejemplo "${c}": "#RRGGBB"). Mientras tanto se muestra como texto.`, "config.json"));

/* ---------- 3. Escribir productos.json ---------- */
productos.sort((a, b) => orden(a.id, b.id));
fs.writeFileSync(SALIDA, JSON.stringify({ productos }, null, 2) + "\n");

const cats = new Set(productos.map((p) => p.categoria));
console.log(`productos.json listo: ${productos.length} producto(s) en ${cats.size} categoría(s), ${modelosConFoto.size} modelo(s). Avisos: ${totalAvisos}.`);
