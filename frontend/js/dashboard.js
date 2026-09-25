const API_URL = "http://localhost:3000/api";

let graficaVentasDia = null;
let graficaProductos = null;
let graficaHora = null;

async function cargarDashboard() {

try {

    const respuesta = await fetch(
        `${API_URL}/estadisticas/resumen`
    );

    if (!respuesta.ok) {
        throw new Error("No se pudieron obtener las estadísticas");
    }

    const estadisticas = await respuesta.json();

    document.getElementById("ventas-totales").textContent =
        `$${Number(estadisticas.ventas_totales).toFixed(2)}`;

    document.getElementById("cantidad-pedidos").textContent =
        estadisticas.cantidad_pedidos;

    document.getElementById("producto-mas-vendido").textContent =
        estadisticas.producto_mas_vendido
            ? `${estadisticas.producto_mas_vendido.nombre} (${estadisticas.producto_mas_vendido.cantidad})`
            : "Sin datos";

    document.getElementById("dia-mas-ventas").textContent =
        estadisticas.dia_mas_ventas
            ? formatearFecha(estadisticas.dia_mas_ventas.fecha)
            : "Sin datos";

    crearGraficaVentasPorDia(
        estadisticas.ventas_por_dia
    );

    crearGraficaProductos(
        estadisticas.productos_mas_vendidos
    );

    crearGraficaHora(
        estadisticas.hora_mayor_demanda
    );

} catch (error) {

    console.error(
        "Error al cargar dashboard:",
        error
    );

}

}

function crearGraficaVentasPorDia(datos) {

const canvas =
    document.getElementById("grafica-ventas-dia");

if (!canvas) {
    return;
}

const contexto =
    canvas.getContext("2d");

if (graficaVentasDia) {
    graficaVentasDia.destroy();
}

graficaVentasDia = new Chart(
    contexto,
    {
        type: "line",

        data: {
            labels: datos.map(
                dato => formatearFecha(dato.fecha)
            ),

            datasets: [
                {
                    label: "Ventas",

                    data: datos.map(
                        dato => Number(dato.total)
                    ),

                    tension: 0.3,

                    fill: false
                }
            ]
        },

        options: {
            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: true
                }
            }
        }
    }
);

}

function crearGraficaProductos(datos) {

const canvas =
    document.getElementById("grafica-productos");

if (!canvas) {
    return;
}

const contexto =
    canvas.getContext("2d");

if (graficaProductos) {
    graficaProductos.destroy();
}

graficaProductos = new Chart(
    contexto,
    {
        type: "bar",

        data: {
            labels: datos.map(
                producto => producto.nombre
            ),

            datasets: [
                {
                    label: "Unidades vendidas",

                    data: datos.map(
                        producto => Number(producto.cantidad)
                    )
                }
            ]
        },

        options: {
            indexAxis: "y",

            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: true
                }
            }
        }
    }
);

}

function crearGraficaHora(horaMayorDemanda) {

const canvas =
    document.getElementById("grafica-hora");

if (!canvas) {
    return;
}

const contexto =
    canvas.getContext("2d");

if (graficaHora) {
    graficaHora.destroy();
}

if (!horaMayorDemanda) {
    return;
}

const hora =
    Number(horaMayorDemanda.hora);

const cantidad =
    Number(horaMayorDemanda.cantidad);

const horaTexto =
    `${hora.toString().padStart(2, "0")}:00`;

graficaHora = new Chart(
    contexto,
    {
        type: "bar",

        data: {
            labels: [horaTexto],

            datasets: [
                {
                    label: "Ventas realizadas",

                    data: [cantidad]
                }
            ]
        },

        options: {
            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: true
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    }
);

}

function formatearFecha(fecha) {

const fechaLocal =
    new Date(fecha);

return fechaLocal.toLocaleDateString(
    "es-MX",
    {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }
);

}

function generarAnalisisLocal(estadisticas) {

const resultado =
    document.getElementById("resultado-analisis");

if (!resultado) {
    return;
}

const producto =
    estadisticas.producto_mas_vendido;

const hora =
    estadisticas.hora_mayor_demanda;

const ventas =
    Number(estadisticas.ventas_totales);

const pedidos =
    Number(estadisticas.cantidad_pedidos);

let html = "";

html += "<h3>Resumen</h3>";

html += `
    <p>
        Café Nébula registra
        <strong>${pedidos}</strong>
        pedidos completados con ventas por
        <strong>$${ventas.toFixed(2)}</strong>.
    </p>
`;

if (producto) {

    html += `
        <p>
            El producto con mayor movimiento es
            <strong>${producto.nombre}</strong>,
            con <strong>${producto.cantidad}</strong>
            unidades vendidas.
        </p>
    `;

}

if (hora) {

    html += `
        <p>
            La mayor demanda registrada ocurre alrededor de las
            <strong>${hora.hora}:00</strong>,
            con <strong>${hora.cantidad}</strong>
            ventas.
        </p>
    `;

}

html += "<h3>Recomendaciones</h3>";

html += `
    <ul>
        <li>Mantener disponible el producto con mayor movimiento.</li>
        <li>Revisar el inventario antes del horario de mayor demanda.</li>
        <li>Analizar la combinación de productos vendidos para crear promociones.</li>
    </ul>
`;

html += "<h3>Promoción sugerida</h3>";

if (producto) {

    html += `
        <p>
            Crear una promoción que combine
            <strong>${producto.nombre}</strong>
            con un producto de acompañamiento,
            como un producto de panadería.
        </p>
    `;

} else {

    html += `
        <p>
            Se necesitan más ventas registradas
            para generar una promoción específica.
        </p>
    `;

}

resultado.innerHTML = html;

}

document.addEventListener(
"DOMContentLoaded",
() => {

    cargarDashboard();

    const boton =
        document.getElementById("btn-analizar");

    if (boton) {

        boton.addEventListener(
            "click",
            async () => {

                boton.disabled = true;

                boton.textContent =
                    "Analizando...";

                try {

                    const respuesta =
                        await fetch(
                            `${API_URL}/estadisticas/resumen`
                        );

                    if (!respuesta.ok) {
                        throw new Error(
                            "No se pudieron obtener los datos"
                        );
                    }

                    const estadisticas =
                        await respuesta.json();

                    generarAnalisisLocal(
                        estadisticas
                    );

                } catch (error) {

                    console.error(
                        "Error al generar análisis:",
                        error
                    );

                    const resultado =
                        document.getElementById(
                            "resultado-analisis"
                        );

                    resultado.innerHTML = `
                        <p>
                            No fue posible generar el análisis.
                            Verifica que el servidor esté funcionando.
                        </p>
                    `;

                } finally {

                    boton.disabled = false;

                    boton.textContent =
                        "Generar análisis";

                }

            }
        );

    }

}

);