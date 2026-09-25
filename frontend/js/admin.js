const API_URL = "http://localhost:3000/api";


// =====================================================
// CARGAR PEDIDOS
// =====================================================

async function cargarPedidos() {

    const contenedor = document.getElementById("pedidos");

    try {

        const respuesta = await fetch(`${API_URL}/pedidos`);

        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener los pedidos.");
        }

        const pedidos = await respuesta.json();


        // =================================================
        // ORDENAR PEDIDOS
        // MÁS NUEVO PRIMERO
        // MÁS ANTIGUO AL FINAL
        // =================================================

        pedidos.sort((a, b) => {

            const fechaHoraA = new Date(
                `${a.fecha_pedido}T${a.hora_pedido}`
            );

            const fechaHoraB = new Date(
                `${b.fecha_pedido}T${b.hora_pedido}`
            );

            return fechaHoraB - fechaHoraA;

        });


        // =================================================
        // SI NO HAY PEDIDOS
        // =================================================

        if (pedidos.length === 0) {

            contenedor.innerHTML = `

                <div class="carrito-vacio">

                    <h2>
                        No hay pedidos
                    </h2>

                    <p>
                        Todavía no se han recibido pedidos.
                    </p>

                </div>

            `;

            return;
        }


        let pedidosHTML = "";


        // =================================================
        // RECORRER PEDIDOS
        // =================================================

        pedidos.forEach(pedido => {

            let productosHTML = "";


            // =============================================
            // PRODUCTOS DEL PEDIDO
            // =============================================

            pedido.productos.forEach(producto => {

                productosHTML += `

                    <div class="producto-pedido">

                        <strong>
                            ${producto.nombre}
                        </strong>

                        <span>
                            × ${producto.cantidad}
                        </span>

                        <span>
                            $${Number(
                                producto.subtotal
                            ).toFixed(2)}
                        </span>

                    </div>

                `;

            });


            // =============================================
            // TARJETA DEL PEDIDO
            // =============================================

            pedidosHTML += `

                <article class="pedido-admin">


                    <!-- ENCABEZADO -->

                    <div class="pedido-admin-header">

                        <div>

                            <p class="producto-categoria">
                                PEDIDO #${pedido.id_pedido}
                            </p>

                            <h2>
                                ${pedido.cliente}
                            </h2>

                        </div>


                        <span
                            class="estado-pedido estado-${pedido.estado}"
                        >
                            ${formatearEstado(pedido.estado)}
                        </span>

                    </div>



                    <!-- INFORMACIÓN DEL CLIENTE -->

                    <div class="pedido-admin-info">

                        <p>

                            <strong>
                                Teléfono:
                            </strong>

                            ${
                                pedido.telefono ||
                                "No proporcionado"
                            }

                        </p>


                        <p>

                            <strong>
                                Fecha:
                            </strong>

                            ${formatearFecha(
                                pedido.fecha_pedido
                            )}

                        </p>


                        <p>

                            <strong>
                                Hora:
                            </strong>

                            ${pedido.hora_pedido}

                        </p>

                    </div>



                    <!-- PRODUCTOS -->

                    <div class="pedido-productos">

                        <h3>
                            Productos
                        </h3>

                        ${productosHTML}

                    </div>



                    <!-- TOTAL -->

                    <div class="pedido-admin-total">

                        <span>
                            Total
                        </span>

                        <strong>
                            $${Number(
                                pedido.total
                            ).toFixed(2)}
                        </strong>

                    </div>



                    <!-- ACCIONES -->

                    <div class="pedido-acciones">

                        ${generarBotonesEstado(
                            pedido
                        )}

                    </div>


                </article>

            `;

        });


        // =================================================
        // MOSTRAR PEDIDOS
        // =================================================

        contenedor.innerHTML = pedidosHTML;


    } catch (error) {

        console.error(
            "Error al cargar pedidos:",
            error
        );


        contenedor.innerHTML = `

            <div class="carrito-vacio">

                <h2>
                    Error al cargar pedidos
                </h2>

                <p>
                    Verifica que el servidor esté funcionando.
                </p>

            </div>

        `;

    }

}



// =====================================================
// GENERAR BOTONES SEGÚN EL ESTADO
// =====================================================

function generarBotonesEstado(pedido) {


    // =============================================
    // PEDIDO PENDIENTE
    // =============================================

    if (pedido.estado === "pendiente") {

        return `

            <button
                class="btn-estado"
                onclick="
                    cambiarEstado(
                        ${pedido.id_pedido},
                        'aceptado'
                    )
                "
            >
                Aceptar pedido
            </button>


            <button
                class="btn-estado btn-rechazar"
                onclick="
                    cambiarEstado(
                        ${pedido.id_pedido},
                        'rechazado'
                    )
                "
            >
                Rechazar
            </button>

        `;

    }



    // =============================================
    // PEDIDO ACEPTADO
    // =============================================

    if (pedido.estado === "aceptado") {

        return `

            <button
                class="btn-estado"
                onclick="
                    cambiarEstado(
                        ${pedido.id_pedido},
                        'en_preparacion'
                    )
                "
            >
                Comenzar preparación
            </button>

        `;

    }



    // =============================================
    // EN PREPARACIÓN
    // =============================================

    if (pedido.estado === "en_preparacion") {

        return `

            <button
                class="btn-estado"
                onclick="
                    cambiarEstado(
                        ${pedido.id_pedido},
                        'completado'
                    )
                "
            >
                Marcar como completado
            </button>

        `;

    }



    // =============================================
    // PEDIDOS FINALIZADOS
    // =============================================

    if (
        pedido.estado === "completado" ||
        pedido.estado === "rechazado"
    ) {

        return `

            <p class="pedido-finalizado">

                ${
                    pedido.estado === "completado"
                        ? "Pedido completado"
                        : "Pedido rechazado"
                }

            </p>

        `;

    }


    return "";

}



// =====================================================
// CAMBIAR ESTADO DEL PEDIDO
// =====================================================

async function cambiarEstado(
    idPedido,
    nuevoEstado
) {

    try {

        const respuesta = await fetch(
            `${API_URL}/pedidos/${idPedido}/estado`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    estado: nuevoEstado
                })
            }
        );


        const resultado = await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.error ||
                resultado.mensaje ||
                "No fue posible actualizar el pedido."
            );

        }


        alert(
            `Pedido #${idPedido} actualizado.\n\n` +
            `Nuevo estado: ${formatearEstado(
                nuevoEstado
            )}`
        );


        // =============================================
        // VOLVER A CARGAR Y ORDENAR
        // =============================================

        await cargarPedidos();


    } catch (error) {

        console.error(
            "Error al cambiar estado:",
            error
        );


        alert(
            "No fue posible actualizar el pedido.\n\n" +
            error.message
        );

    }

}



// =====================================================
// FORMATEAR ESTADO
// =====================================================

function formatearEstado(estado) {

    const estados = {

        pendiente: "Pendiente",

        aceptado: "Aceptado",

        en_preparacion: "En preparación",

        completado: "Completado",

        rechazado: "Rechazado"

    };


    return estados[estado] || estado;

}



// =====================================================
// FORMATEAR FECHA
// =====================================================

function formatearFecha(fecha) {

    const fechaLocal = new Date(fecha);


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

cargarPedidos();