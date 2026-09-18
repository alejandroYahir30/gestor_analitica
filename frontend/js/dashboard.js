
const API_URL = "http://localhost:3000/api";


// =====================================================
// CARGAR DASHBOARD
// =====================================================

async function cargarDashboard() {

    const ventasTotales =
        document.getElementById("ventas-totales");

    const cantidadPedidos =
        document.getElementById("cantidad-pedidos");

    const productoMasVendido =
        document.getElementById("producto-mas-vendido");

    const diaMasVentas =
        document.getElementById("dia-mas-ventas");


    try {

        // =================================================
        // OBTENER ESTADÍSTICAS
        // =================================================

        const respuesta =
            await fetch(
                `${API_URL}/estadisticas/resumen`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener las estadísticas."
            );

        }


        const estadisticas =
            await respuesta.json();


        // =================================================
        // RESUMEN
        // =================================================

        ventasTotales.textContent =
            `$${Number(
                estadisticas.ventas_totales
            ).toFixed(2)}`;


        cantidadPedidos.textContent =
            estadisticas.cantidad_pedidos;


        if (
            estadisticas.producto_mas_vendido
        ) {

            productoMasVendido.textContent =
                estadisticas
                    .producto_mas_vendido
                    .nombre;

        } else {

            productoMasVendido.textContent =
                "Sin datos";

        }


        if (
            estadisticas.dia_mas_ventas
        ) {

            diaMasVentas.textContent =
                formatearFecha(
                    estadisticas
                        .dia_mas_ventas
                        .fecha
                );

        } else {

            diaMasVentas.textContent =
                "Sin datos";

        }


        // =================================================
        // GRÁFICA DE VENTAS POR DÍA
        // =================================================

        crearGraficaVentasPorDia(
            estadisticas.ventas_por_dia
        );


    } catch (error) {

        console.error(
            "Error al cargar dashboard:",
            error
        );


        ventasTotales.textContent =
            "$0.00";

        cantidadPedidos.textContent =
            "0";

        productoMasVendido.textContent =
            "Sin datos";

        diaMasVentas.textContent =
            "Sin datos";

    }

}


// =====================================================
// CREAR GRÁFICA DE VENTAS POR DÍA
// =====================================================

function crearGraficaVentasPorDia(
    datos
) {

    const canvas =
        document.getElementById(
            "grafica-ventas-dia"
        );


    if (!canvas) {
        return;
    }


    const etiquetas =
        datos.map(
            dato =>
                formatearFecha(
                    dato.fecha
                )
        );


    const valores =
        datos.map(
            dato =>
                dato.total
        );


    new Chart(
        canvas,
        {
            type: "line",

            data: {

                labels:
                    etiquetas,

                datasets: [

                    {

                        label:
                            "Ventas",

                        data:
                            valores,

                        borderWidth:
                            2,

                        tension:
                            0.3,

                        fill:
                            false

                    }

                ]

            },

            options: {

                responsive:
                    true,

                maintainAspectRatio:
                    false,

                plugins: {

                    legend: {

                        display:
                            true

                    }

                },

                scales: {

                    y: {

                        beginAtZero:
                            true,

                        ticks: {

                            callback:
                                function(valor) {

                                    return "$" +
                                        valor;

                                }

                        }

                    }

                }

            }

        }
    );

}


// =====================================================
// FORMATEAR FECHA
// =====================================================

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


// =====================================================
// INICIAR
// =====================================================

cargarDashboard();

