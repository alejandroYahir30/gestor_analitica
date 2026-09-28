
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

        let total = 0;


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

                <div class="ventas-vacio">

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
        // HISTORIAL
        // =================================================

        let ventasHTML = "";


        ventas.forEach(venta => {

            ventasHTML += `

                <tr>

                    <td>
                        <span class="venta-id">
                            #${venta.id_venta}
                        </span>
                    </td>


                    <td>
                        <span class="pedido-id">
                            #${venta.id_pedido}
                        </span>
                    </td>


                    <td>
                        ${formatearFecha(
                            venta.fecha_venta
                        )}
                    </td>


                    <td>
                        ${venta.hora_venta}
                    </td>


                    <td class="venta-total">
                        $${Number(
                            venta.total
                        ).toFixed(2)}
                    </td>

                </tr>

            `;

        });


        contenedor.innerHTML = `

            <div class="ventas-panel">

                <div class="ventas-panel-header">

                    <div>

                        <span class="ventas-panel-etiqueta">
                            REGISTRO
                        </span>

                        <h2>
                            Historial de ventas
                        </h2>

                    </div>

                    <p>
                        Operaciones completadas
                    </p>

                </div>


                <div class="ventas-tabla-contenedor">

                    <table class="ventas-tabla">

                        <thead>

                            <tr>

                                <th>
                                    Venta
                                </th>

                                <th>
                                    Pedido
                                </th>

                                <th>
                                    Fecha
                                </th>

                                <th>
                                    Hora
                                </th>

                                <th>
                                    Total
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${ventasHTML}

                        </tbody>

                    </table>

                </div>

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

            <div class="ventas-vacio">

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

