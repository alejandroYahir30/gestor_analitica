
const API_URL = "/api";

let graficaVentasDia = null;
let graficaProductos = null;
let graficaHora = null;
let graficaAnalisisProductos = null;


/* ==========================================================================
   CARGAR DASHBOARD
========================================================================== */

async function cargarDashboard() {

    try {

        const respuesta = await fetch(
            `${API_URL}/estadisticas/resumen`
        );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron obtener las estadísticas"
            );
        }

        const estadisticas = await respuesta.json();


        /* ==============================================================
           RESUMEN
        ============================================================== */

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
                ? formatearFecha(
                    estadisticas.dia_mas_ventas.fecha
                )
                : "Sin datos";


        /* ==============================================================
           GRÁFICAS PRINCIPALES
        ============================================================== */

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


/* ==========================================================================
   GRÁFICA — VENTAS POR DÍA
========================================================================== */

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


/* ==========================================================================
   GRÁFICA — PRODUCTOS MÁS VENDIDOS
========================================================================== */

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
                            producto =>
                                Number(producto.cantidad)
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


/* ==========================================================================
   GRÁFICA — DEMANDA POR HORA
========================================================================== */

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


/* ==========================================================================
   ANÁLISIS INTELIGENTE
========================================================================== */

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


    const productos =
        Array.isArray(
            estadisticas.productos_mas_vendidos
        )
            ? estadisticas.productos_mas_vendidos
            : [];


    /* ==============================================================
       PRODUCTO DE APOYO PARA LA PROMOCIÓN
    ============================================================== */

    let productoAcompanamiento = null;


    if (productos.length > 1) {

        productoAcompanamiento =
            productos.find(
                item =>
                    producto &&
                    item.nombre !== producto.nombre
            );

    }


    /* ==============================================================
       HTML DEL DASHBOARD
    ============================================================== */

    let html = "";


    html += `
        <div class="analisis-dashboard">

            <div class="analisis-metricas">

                <div class="analisis-metrica">

                    <span>
                        PEDIDOS
                    </span>

                    <strong>
                        ${pedidos}
                    </strong>

                    <p>
                        pedidos registrados
                    </p>

                </div>


                <div class="analisis-metrica">

                    <span>
                        VENTAS
                    </span>

                    <strong>
                        $${ventas.toFixed(2)}
                    </strong>

                    <p>
                        ingresos acumulados
                    </p>

                </div>


                <div class="analisis-metrica">

                    <span>
                        PRODUCTO CLAVE
                    </span>

                    <strong>
                        ${
                            producto
                                ? producto.nombre
                                : "Sin datos"
                        }
                    </strong>

                    <p>
                        ${
                            producto
                                ? `${producto.cantidad} unidades vendidas`
                                : "Sin información"
                        }
                    </p>

                </div>

            </div>
    `;


    /* ==============================================================
       ANÁLISIS PRINCIPAL
    ============================================================== */

    html += `
        <div class="analisis-principal">
    `;


    /* ==============================================================
       GRÁFICA DE DISTRIBUCIÓN
    ============================================================== */

    if (productos.length > 0) {

        html += `
            <div class="analisis-grafica-card">

                <div class="analisis-card-header">

                    <div>

                        <span class="analisis-etiqueta">
                            COMPORTAMIENTO
                        </span>

                        <h3>
                            Distribución de productos
                        </h3>

                        <p>
                            Participación de cada producto
                            dentro de las unidades vendidas.
                        </p>

                    </div>

                </div>


                <div class="analisis-pastel">

                    <canvas
                        id="grafica-analisis-productos"
                    ></canvas>

                </div>

            </div>
        `;

    }


    /* ==============================================================
       DEMANDA
    ============================================================== */

    html += `
        <div class="analisis-insight-card">

            <span class="analisis-etiqueta">
                PUNTO DE MAYOR ACTIVIDAD
            </span>

            <h3>
                ${
                    hora
                        ? `${hora.hora}:00`
                        : "Sin datos"
                }
            </h3>

            <p class="analisis-insight-numero">
                ${
                    hora
                        ? `${hora.cantidad} ventas`
                        : "No hay suficientes datos"
                }
            </p>

            <p>
                ${
                    hora
                        ? "Este es el horario con mayor demanda registrada. Conviene revisar el inventario antes de este periodo."
                        : "Registra más ventas para identificar un horario de mayor demanda."
                }
            </p>

        </div>
    `;


    html += `
        </div>
    `;


    /* ==============================================================
       RECOMENDACIÓN
    ============================================================== */

    html += `
        <div class="analisis-recomendacion">

            <div class="recomendacion-icono">
                IA
            </div>

            <div class="recomendacion-contenido">

                <span class="analisis-etiqueta">
                    RECOMENDACIÓN
                </span>

                <h3>
                    ${
                        producto
                            ? `Impulsar ${producto.nombre}`
                            : "Generar más datos"
                    }
                </h3>

                <p>
                    ${
                        producto
                            ? `El producto con mayor movimiento es ${producto.nombre}, con ${producto.cantidad} unidades vendidas. Se recomienda mantener suficiente inventario y utilizarlo como producto principal en una promoción.`
                            : "Todavía no existen suficientes datos para identificar un producto principal."
                    }
                </p>

            </div>

        </div>
    `;


    /* ==============================================================
       PROMOCIÓN
    ============================================================== */

    html += `
        <div class="analisis-promocion">

            <div class="promocion-header">

                <span class="analisis-etiqueta">
                    OFERTA SUGERIDA
                </span>

                <span class="promocion-badge">
                    RECOMENDADA
                </span>

            </div>

            <h3>
                ${
                    producto
                        ? `Combo ${producto.nombre}`
                        : "Promoción pendiente"
                }
            </h3>

            <p>
                ${
                    producto
                        ? productoAcompanamiento
                            ? `Combinar ${producto.nombre} con ${productoAcompanamiento.nombre} para crear un combo de consumo rápido.`
                            : `Combinar ${producto.nombre} con un producto de acompañamiento, como un producto de panadería.`
                        : "Registra más ventas para generar una promoción específica."
                }
            </p>


            ${
                hora
                    ? `
                        <div class="promocion-footer">

                            <span>
                                Horario sugerido
                            </span>

                            <strong>
                                ${hora.hora}:00
                            </strong>

                        </div>
                    `
                    : ""
            }

        </div>
    `;


    html += `
        </div>
    `;


    resultado.innerHTML = html;


    /* ==============================================================
       CREAR GRÁFICA DE PASTEL
    ============================================================== */

    if (productos.length > 0) {

        crearGraficaAnalisisProductos(
            productos
        );

    }

}


/* ==========================================================================
   GRÁFICA DE PASTEL DEL ANÁLISIS
========================================================================== */

function crearGraficaAnalisisProductos(datos) {

    const canvas =
        document.getElementById(
            "grafica-analisis-productos"
        );

    if (!canvas) {
        return;
    }


    const contexto =
        canvas.getContext("2d");


    if (graficaAnalisisProductos) {
        graficaAnalisisProductos.destroy();
    }


    graficaAnalisisProductos =
        new Chart(
            contexto,
            {
                type: "doughnut",

                data: {

                    labels: datos.map(
                        producto =>
                            producto.nombre
                    ),

                    datasets: [
                        {
                            data: datos.map(
                                producto =>
                                    Number(
                                        producto.cantidad
                                    )
                            )
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "62%",

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {
                                padding: 18
                            }
                        }
                    }
                }
            }
        );

}


/* ==========================================================================
   FECHA
========================================================================== */

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


/* ==========================================================================
   INICIALIZAR
========================================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarDashboard();


        const boton =
            document.getElementById(
                "btn-analizar"
            );


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


                        if (resultado) {

                            resultado.innerHTML = `
                                <div class="analisis-error">

                                    <strong>
                                        No se pudo generar el análisis
                                    </strong>

                                    <p>
                                        Verifica que el servidor
                                        esté funcionando correctamente.
                                    </p>

                                </div>
                            `;

                        }

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

