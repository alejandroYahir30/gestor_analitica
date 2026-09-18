const API_URL = "http://localhost:3000/api";


// =====================================================
// CARGAR VENTAS
// =====================================================

async function cargarVentas() {

    const contenedor =
        document.getElementById("ventas");

    const cantidadVentas =
        document.getElementById("cantidad-ventas");

    const totalVentas =
        document.getElementById("total-ventas");


    try {

        const respuesta =
            await fetch(`${API_URL}/ventas`);


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener las ventas."
            );

        }


        const ventas =
            await respuesta.json();


        // =================================================
        // RESUMEN
        // =================================================

        let total =
            0;


        ventas.forEach(venta => {

            total += Number(venta.total);

        });


        cantidadVentas.textContent =
            ventas.length;


        totalVentas.textContent =
            `$${total.toFixed(2)}`;


        // =================================================
        // SIN VENTAS
        // =================================================

        if (ventas.length === 0) {

            contenedor.innerHTML = `

                <div class="carrito-vacio">

                    <h2>
                        No hay ventas registradas
                    </h2>

                    <p>
                        Las ventas aparecerán aquí cuando
                        un pedido sea completado.
                    </p>

                </div>

            `;

            return;
        }


        // =================================================
        // LISTA DE VENTAS
        // =================================================

        let ventasHTML = "";


        ventas.forEach(venta => {

            ventasHTML += `

                <article class="venta-admin">

                    <div>

                        <p class="producto-categoria">
                            VENTA #${venta.id_venta}
                        </p>

                        <h2>
                            Pedido #${venta.id_pedido}
                        </h2>

                    </div>


                    <div class="venta-info">

                        <div>

                            <span>
                                Fecha
                            </span>

                            <strong>
                                ${formatearFecha(
                                    venta.fecha_venta
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Hora
                            </span>

                            <strong>
                                ${venta.hora_venta}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Total
                            </span>

                            <strong>
                                $${Number(
                                    venta.total
                                ).toFixed(2)}
                            </strong>

                        </div>

                    </div>

                </article>

            `;

        });


        contenedor.innerHTML = `

            <div class="ventas-lista">

                ${ventasHTML}

            </div>

        `;


    } catch (error) {

        console.error(
            "Error al cargar ventas:",
            error
        );


        cantidadVentas.textContent =
            "0";


        totalVentas.textContent =
            "$0.00";


        contenedor.innerHTML = `

            <div class="carrito-vacio">

                <h2>
                    Error al cargar ventas
                </h2>

                <p>
                    Verifica que el servidor esté funcionando.
                </p>

            </div>

        `;

    }

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

cargarVentas();