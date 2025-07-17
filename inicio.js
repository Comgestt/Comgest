import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://asxphzxtrnigpoyqnqlt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzeHBoenh0cm5pZ3BveXFucWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MzUzMjUsImV4cCI6MjA2ODIxMTMyNX0.TkJ58gwKxVK-3pa-eqKv35crelcYtj3Rp6nTyLzDz_Y'
);
// 🌙 Modo oscuro
document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// 🧭 Navegación
document.querySelectorAll('.nav-btn[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove("active"));
    document.getElementById(btn.dataset.section)?.classList.add("active");
  });
});

// 🔍 Buscar y filtrar
document.getElementById("searchBar").addEventListener("input", aplicarFiltros);
document.querySelectorAll('#filtroCategoria, #filtroFabricante, #filtroCompatibilidad').forEach(select => {
  select.addEventListener("change", aplicarFiltros);
});

async function aplicarFiltros() {
  const categoria = document.getElementById("filtroCategoria").value;
  const fabricante = document.getElementById("filtroFabricante").value;
  const compatibilidad = document.getElementById("filtroCompatibilidad").value;
  const texto = document.getElementById("searchBar").value.trim();

  let query = supabase.from('componentes').select('*');
  if (categoria) query = query.eq('categoria', categoria);
  if (fabricante) query = query.eq('fabricante', fabricante);
  if (compatibilidad) query = query.eq('compatibilidad', compatibilidad);
  if (texto) query = query.ilike('nombre', `%${texto}%`);

  const { data } = await query;
  renderizarTarjetas(data || []);
}

async function cargarFiltros() {
  const { data } = await supabase.from('componentes').select('categoria,fabricante,compatibilidad');
  const categorias = [...new Set(data.map(c => c.categoria).filter(Boolean))];
  const fabricantes = [...new Set(data.map(c => c.fabricante).filter(Boolean))];
  const compatibilidades = [...new Set(data.map(c => c.compatibilidad).filter(Boolean))];

  document.getElementById("filtroCategoria").innerHTML += categorias.map(c => `<option value="${c}">${c}</option>`).join("");
  document.getElementById("filtroFabricante").innerHTML += fabricantes.map(f => `<option value="${f}">${f}</option>`).join("");
  document.getElementById("filtroCompatibilidad").innerHTML += compatibilidades.map(co => `<option value="${co}">${co}</option>`).join("");
}

// 📦 Renderizar tarjetas
function renderizarTarjetas(lista) {
  const grid = document.getElementById("componentGrid");
  grid.innerHTML = "";

  lista.forEach(comp => {
    const card = document.createElement("div");
    card.className = "componente";
    card.innerHTML = `
      <h4>${comp.nombre}</h4>
      <p><strong>Categoría:</strong> ${comp.categoria}</p>
      <p><strong>Fabricante:</strong> ${comp.fabricante}</p>
      <p><strong>Compatibilidad:</strong> ${comp.compatibilidad}</p>
      <div class="botones-componente">
        <button class="blur-button" onclick="agregarFavorito('${comp.id}')"><i class="ri-heart-line"></i> Fav</button>
        <button class="blur-button" onclick="agregarComparacion('${comp.id}')"><i class="ri-bar-chart-line"></i> Comparar</button>
        <button class="blur-button" onclick="verDetalle('${comp.id}')"><i class="ri-eye-line"></i> Detalle</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ❤️ Favoritos
const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

function agregarFavorito(id) {
  if (!favoritos.includes(id)) {
    favoritos.push(id);
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    mostrarFavoritos();
  }
}

function eliminarFavorito(id) {
  const index = favoritos.indexOf(id);
  if (index !== -1) {
    favoritos.splice(index, 1);
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    mostrarFavoritos();
  }
}

function mostrarFavoritos() {
  const lista = document.getElementById("favoriteList");
  lista.innerHTML = "";
  favoritos.forEach(async id => {
    const { data } = await supabase.from('componentes').select('*').eq('id', id).single();
    if (data) {
      const item = document.createElement("div");
      item.className = "componente";
      item.innerHTML = `
        <h4>${data.nombre}</h4>
        <p><strong>Fabricante:</strong> ${data.fabricante}</p>
        <p><strong>Categoría:</strong> ${data.categoria || "—"}</p>
        <p><strong>Compatibilidad:</strong> ${data.compatibilidad || "—"}</p>
        <div class="botones-componente">
          <button onclick="verDetalle('${data.id}')" class="blur-button"><i class="ri-eye-line"></i> Detalle</button>
          <button onclick="eliminarFavorito('${data.id}')" class="blur-button"><i class="ri-delete-bin-6-line"></i> Eliminar</button>
        </div>
      `;
      lista.appendChild(item);
    }
  });
}

// ⚖️ Comparación
const comparaciones = JSON.parse(localStorage.getItem("comparaciones")) || [];

function agregarComparacion(id) {
  if (comparaciones.length < 2 && !comparaciones.includes(id)) {
    comparaciones.push(id);
    localStorage.setItem("comparaciones", JSON.stringify(comparaciones));
    mostrarComparaciones();
  }
}

function eliminarComparacion(id) {
  const index = comparaciones.indexOf(id);
  if (index !== -1) {
    comparaciones.splice(index, 1);
    localStorage.setItem("comparaciones", JSON.stringify(comparaciones));
    mostrarComparaciones();
  }
}

function mostrarComparaciones() {
  const lista = document.getElementById("compareList");
  lista.innerHTML = "";

  comparaciones.forEach(async id => {
    const { data } = await supabase.from("componentes").select("*").eq("id", id).single();
    if (data) {
      const item = document.createElement("div");
      item.className = "componente";
      item.innerHTML = `
        <h4>${data.nombre}</h4>
        <p><strong>Fabricante:</strong> ${data.fabricante}</p>
        <p><strong>Categoría:</strong> ${data.categoria}</p>
        <p><strong>Compatibilidad:</strong> ${data.compatibilidad}</p>
        <div class="botones-componente">
          <button onclick="verDetalle('${data.id}')" class="blur-button"><i class="ri-eye-line"></i> Detalle</button>
          <button onclick="eliminarComparacion('${data.id}')" class="blur-button"><i class="ri-delete-bin-6-line"></i> Quitar</button>
        </div>
      `;
      lista.appendChild(item);
    }
  });
}

document.getElementById("compararBtn").addEventListener("click", async () => {
  if (comparaciones.length !== 2) {
    alert("Selecciona exactamente dos componentes para comparar.");
    return;
  }

  const tablaContainer = document.getElementById("tablaComparativaContainer");
  tablaContainer.innerHTML = "<p>Cargando comparación...</p>";

  const resultados = await Promise.all(
    comparaciones.map(id =>
      supabase.from("componentes").select("*").eq("id", id).single().then(res => res.data)
    )
  );

  const atributos = [
    "fabricante", "modelo_comercial", "categoria", "compatibilidad",
    "pines", "voltaje", "corriente", "frecuencia", "rango_temperatura", "familia", "usos"
  ];

  let tablaHTML = `<div class="tabla-comparativa"><table>
    <thead><tr><th>Atributo</th>${resultados.map(c => `<th>${c.nombre}</th>`).join("")}</tr></thead>
    <tbody>
      ${atributos.map(attr => `
        <tr>
          <td><strong>${attr.replace(/_/g, " ")}</strong></td>
          ${resultados.map(c => `<td>${c[attr] ?? "—"}</td>`).join("")}
        </tr>
      `).join("")}
    </tbody>
  </table></div>`;

  tablaContainer.innerHTML = tablaHTML;
});

// 🔄 Reemplazo dinámico
document.getElementById("reemplazoBuscar")?.addEventListener("input", async () => {
  const texto = document.getElementById("reemplazoBuscar").value.trim();
  const { data } = await supabase.from("componentes").select("*").ilike("nombre", `%${texto}%`);
  const contenedor = document.getElementById("reemplazoResultados");
  contenedor.innerHTML = "";

  data.forEach(comp => {
    const card = document.createElement("div");
    card.className = "componente";
    card.innerHTML = `
      <h4>${comp.nombre}</h4>
      <p>${comp.fabricante}</p>
      <button class="blur-button" onclick="reemplazarComparacionPorBusqueda(${document.getElementById("reemplazoTarget").value}, '${comp.id}')">
        <i class="ri-refresh-line"></i> Reemplazar
      </button>
    `;
    contenedor.appendChild(card);
  });
});

function reemplazarComparacionPorBusqueda(index, nuevoId) {
  if (comparaciones[index] !== nuevoId && !comparaciones.includes(nuevoId)) {
    comparaciones[index] = nuevoId;
    localStorage.setItem("comparaciones", JSON.stringify(comparaciones));
    mostrarComparaciones();
    document.getElementById("reemplazoBuscar").value = "";
    document.getElementById("reemplazoResultados").innerHTML = "";
  }
}

// 📄 Ver detalle
function verDetalle(id) {
  const panel = document.getElementById("detallePanel");
  supabase.from('componentes').select('*').eq('id', id).single().then(({ data }) => {
    if (data) {
      document.querySelectorAll('.section').forEach(sec => sec.classList.remove("active"));
      document.getElementById("detail").classList.add("active");

      panel.innerHTML = `
        <h4>${data.nombre}</h4>
        <p><strong>Fabricante:</strong> ${data.fabricante}</p>
        <p><strong>Modelo:</strong> ${data.modelo_comercial}</p>
        <p><strong>Categoría:</strong> ${data.categoria}</p>
        <p><strong>Compatibilidad:</strong> ${data.compatibilidad}</p>
        <p><strong>Pines:</strong> ${data.pines ?? "—"}</p>
        <p><strong>Voltaje:</strong> ${data.voltaje ?? "—"}</p>
        <p><strong>Corriente:</strong> ${data.corriente ?? "—"}</p>
        <p><strong>Frecuencia:</strong> ${data.frecuencia ?? "—"}</p>
        <p><strong>Temperatura:</strong> ${data.rango_temperatura ?? "—"}</p>
        <p><strong>Familia:</strong> ${data.familia ?? "—"}</p>
        <p><strong>Usos:</strong> ${data.usos ?? "—"}</p>
        <p><strong>Descripción:</strong> ${data.descripcion ?? "—"}</p>
      `;
    }
  });
}

function volverInicio() {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove("active"));
  document.getElementById("home").classList.add("active");
}

function exportarDetalle() {
  const contenido = document.getElementById("detallePanel").innerHTML;
  const ventana = window.open('', '', 'width=800,height=600');
  ventana.document.write(`
    <html>
      <head><title>Ficha técnica</title></head>
      <body style="font-family:Segoe UI;padding:2rem;">
        ${contenido}
      </body>
    </html>
  `);
  ventana.document.close();
  ventana.print();
}

// 🔧 Modo Taller
function calcularVoltaje() {
  const I = parseFloat(document.getElementById("corrienteOhm").value);
  const R = parseFloat(document.getElementById("resistenciaOhm").value);
  const resultado = document.getElementById("resultadoOhm");
  resultado.textContent = isNaN(I) || isNaN(R) ? "Valores inválidos." : `Voltaje: ${(I * R).toFixed(2)} V`;
}

function calcularResistencia() {
  const input = document.getElementById("resistenciasInput").value;
  const tipo = document.getElementById("resistenciaTipo").value;
  const resultado = document.getElementById("resultadoResistencia");

  const valores = input.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
  if (valores.length === 0) {
    resultado.textContent = "Valores inválidos.";
    return;
  }

  let total;
  if (tipo === "serie") {
    total = valores.reduce((a, b) => a + b, 0);
  } else {
    total = 1 / valores.reduce((a, b) => a + (1 / b), 0);
  }

  resultado.textContent = `Rₜ = ${total.toFixed(2)} Ω`;
}

function calcularCapacitancia() {
  const input = document.getElementById("capacitoresInput").value;
  const tipo = document.getElementById("capacitanciaTipo").value;
  const resultado = document.getElementById("resultadoCapacitancia");

  const valores = input.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
  if (valores.length === 0) {
    resultado.textContent = "Valores inválidos.";
    return;
  }

  const total = tipo === "paralelo"
    ? valores.reduce((a, b) => a + b, 0)
    : 1 / valores.reduce((a, b) => a + (1 / b), 0);

  resultado.textContent = `Cₜ = ${total.toFixed(2)} µF`;
}

function calcularPotencia() {
  const V = parseFloat(document.getElementById("voltajePotencia").value);
  const I = parseFloat(document.getElementById("corrientePotencia").value);
  const resultado = document.getElementById("resultadoPotencia");
  resultado.textContent = isNaN(V) || isNaN(I) ? "Valores inválidos." : `Potencia: ${(V * I).toFixed(2)} W`;
}

function calcularFrecuenciaAngular() {
  const f = parseFloat(document.getElementById("frecuenciaInput").value);
  const resultado = document.getElementById("resultadoFrecuencia");
  resultado.textContent = isNaN(f) ? "Valor inválido." : `ω = ${(2 * Math.PI * f).toFixed(2)} rad/s`;
}

function calcularCodigoColores() {
  const b1 = parseInt(document.getElementById("banda1").value);
  const b2 = parseInt(document.getElementById("banda2").value);
  const mult = parseFloat(document.getElementById("multiplicador").value);
  const resultado = document.getElementById("resultadoColores");

  if (isNaN(b1) || isNaN(b2) || isNaN(mult)) {
    resultado.textContent = "Selecciona todas las bandas.";
    return;
  }

  const valor = ((b1 * 10) + b2) * mult;
  resultado.textContent = valor >= 1000
    ? `Valor: ${(valor / 1000).toFixed(2)} kΩ`
    : `Valor: ${valor.toFixed(2)} Ω`;
}

// 🚀 Inicializar
document.addEventListener("DOMContentLoaded", () => {
  mostrarFavoritos();
  mostrarComparaciones();
  cargarFiltros();
});

// 🌐 Exponer funciones globales
window.agregarFavorito = agregarFavorito;
window.eliminarFavorito = eliminarFavorito;
window.agregarComparacion = agregarComparacion;
window.eliminarComparacion = eliminarComparacion;
window.reemplazarComparacionPorBusqueda = reemplazarComparacionPorBusqueda;
window.verDetalle = verDetalle;
window.volverInicio = volverInicio;
window.exportarDetalle = exportarDetalle;

window.calcularVoltaje = calcularVoltaje;
window.calcularResistencia = calcularResistencia;
window.calcularCapacitancia = calcularCapacitancia;
window.calcularPotencia = calcularPotencia;
window.calcularFrecuenciaAngular = calcularFrecuenciaAngular;
window.calcularCodigoColores = calcularCodigoColores;
