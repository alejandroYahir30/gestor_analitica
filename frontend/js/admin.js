const API_URL_ADMIN = "/api";


// =====================================================
// CARGAR PEDIDOS
// =====================================================

async function cargarPedidos() {

    const contenedor =
        document.getElementById("pedidos");

    if (!contenedor) {
        return;
    }

    try {

        const respuesta =
            await fetch(`${API_URL_ADMIN}/pedidos`);

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener los pedidos."
            );

        }

        const pedidos =
            await respuesta.json();


        // =================================================
        // ORDENAR DEL MÁS RECIENTE AL MÁS ANTIGUO
        // =================================================

        pedidos.sort((a, b) => {

            const fechaHoraA =
                new Date(
                    `${a.fecha_pedido}T${a.hora_pedido}`
                );

            const fechaHoraB =
                new Date(
                    `${b.fecha_pedido}T${b.hora_pedido}`
                );

            return fechaHoraB - fechaHoraA;

        });


        // =================================================
        // ACTUALIZAR CONTADORES
        // =================================================

        actualizarContadores(pedidos);


        // =================================================
        // SIN PEDIDOS
        // =================================================

        if (pedidos.length === 0) {

            contenedor.innerHTML = `

                <div class="pedidos-vacio">

                    <div class="vacio-icono">
                        —
                    </div>

                    <h3>
                        No hay pedidos
                    </h3>

                    <p>
                        Todavía no se han recibido pedidos.
                    </p>

                </div>

            `;

            return;

        }


        // =================================================
        // GENERAR PEDIDOS
        // =================================================

        let pedidosHTML = "";


        pedidos.forEach(pedido => {

            let productosHTML = "";


            pedido.productos.forEach(producto => {

                productosHTML += `

                    <div class="pedido-producto">

                        <span class="producto-cantidad">
                            ${producto.cantidad}×
                        </span>

                        <span class="producto-nombre">
                            ${producto.nombre}
                        </span>

                        <strong class="producto-subtotal">
                            $${Number(
                                producto.subtotal
                            ).toFixed(2)}
                        </strong>

                    </div>

                `;

            });


            pedidosHTML += `

                <article class="pedido-fila">

                    <div class="pedido-identificacion">

                        <span class="pedido-numero">
                            #${pedido.id_pedido}
                        </span>

                        <div>

                            <h3>
                                ${pedido.cliente}
                            </h3>

                            <p>
                                ${pedido.telefono ||
                                "Sin teléfono"}
                            </p>

                        </div>

                    </div>


                    <div class="pedido-fecha">

                        <span>
                            ${formatearFecha(
                                pedido.fecha_pedido
                            )}
                        </span>

                        <small>
                            ${pedido.hora_pedido}
                        </small>

                    </div>


                    <div class="pedido-productos">

                        ${productosHTML}

                    </div>


                    <div class="pedido-total">

                        <span>
                            Total
                        </span>

                        <strong>
                            $${Number(
                                pedido.total
                            ).toFixed(2)}
                        </strong>

                    </div>


                    <div class="pedido-estado">

                        <span
                            class="
                                estado-pedido
                                estado-${pedido.estado}
                            "
                        >
                            ${formatearEstado(
                                pedido.estado
                            )}
                        </span>

                    </div>


                    <div class="pedido-acciones">

                        ${generarBotonesEstado(
                            pedido
                        )}

                    </div>

                </article>

            `;

        });


        contenedor.innerHTML =
            pedidosHTML;


    } catch (error) {

        console.error(
            "Error al cargar pedidos:",
            error
        );


        contenedor.innerHTML = `

            <div class="pedidos-error">

                <h3>
                    No fue posible cargar los pedidos
                </h3>

                <p>
                    Verifica que el servidor esté funcionando.
                </p>

            </div>

        `;

    }

}


// =====================================================
// CONTADORES
// =====================================================

function actualizarContadores(pedidos) {

    let pendientes = 0;
    let aceptados = 0;
    let preparacion = 0;
    let finalizados = 0;


    pedidos.forEach(pedido => {

        if (pedido.estado === "pendiente") {
            pendientes++;
        }

        if (pedido.estado === "aceptado") {
            aceptados++;
        }

        if (pedido.estado === "en_preparacion") {
            preparacion++;
        }

        if (
            pedido.estado === "completado" ||
            pedido.estado === "rechazado"
        ) {
            finalizados++;
        }

    });


    const contadorPendientes =
        document.getElementById(
            "contador-pendientes"
        );

    const contadorAceptados =
        document.getElementById(
            "contador-aceptados"
        );

    const contadorPreparacion =
        document.getElementById(
            "contador-preparacion"
        );

    const contadorFinalizados =
        document.getElementById(
            "contador-finalizados"
        );


    if (contadorPendientes) {
        contadorPendientes.textContent =
            pendientes;
    }

    if (contadorAceptados) {
        contadorAceptados.textContent =
            aceptados;
    }

    if (contadorPreparacion) {
        contadorPreparacion.textContent =
            preparacion;
    }

    if (contadorFinalizados) {
        contadorFinalizados.textContent =
            finalizados;
    }

}


// =====================================================
// BOTONES SEGÚN ESTADO
// =====================================================

function generarBotonesEstado(pedido) {

    if (pedido.estado === "pendiente") {

        return `

            <button
                class="btn-accion btn-aceptar"
                onclick="
                    cambiarEstado(
                        ${pedido.id_pedido},
                        'aceptado'
                    )
                "
            >
                Aceptar
            </button>

            <button
                class="btn-accion btn-rechazar"
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


    if (pedido.estado === "aceptado") {

        return `

            <button
                class="btn-accion btn-preparar"
                onclick="
                    cambiarEstado(
                        ${pedido.id_pedido},
                        'en_preparacion'
                    )
                "
            >
                Preparar
            </button>

        `;

    }


    if (pedido.estado === "en_preparacion") {

        return `

            <button
                class="btn-accion btn-completar"
                onclick="
                    cambiarEstado(
                        ${pedido.id_pedido},
                        'completado'
                    )
                "
            >
                Completar
            </button>

        `;

    }


    if (
        pedido.estado === "completado" ||
        pedido.estado === "rechazado"
    ) {

        return `

            <span class="pedido-sin-accion">
                Finalizado
            </span>

        `;

    }


    return "";

}


// =====================================================
// CAMBIAR ESTADO
// =====================================================

async function cambiarEstado(
    idPedido,
    nuevoEstado
) {

    try {

        const respuesta =
            await fetch(
                `${API_URL_ADMIN}/pedidos/${idPedido}/estado`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        estado: nuevoEstado
                    })
                }
            );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.error ||
                resultado.mensaje ||
                "No fue posible actualizar el pedido."
            );

        }


        mostrarNotificacion(
            `Pedido #${idPedido} actualizado. Nuevo estado: ${formatearEstado(nuevoEstado)}`,
            "exito"
        );


        await cargarPedidos();


    } catch (error) {

        console.error(
            "Error al cambiar estado:",
            error
        );


        mostrarNotificacion(
            `No fue posible actualizar el pedido. ${error.message}`,
            "error"
        );

    }

}


// =====================================================
// FORMATEAR ESTADO
// =====================================================

function formatearEstado(estado) {

    const estados = {

        pendiente:
            "Pendiente",

        aceptado:
            "Aceptado",

        en_preparacion:
            "En preparación",

        completado:
            "Completado",

        rechazado:
            "Rechazado"

    };


    return estados[estado] || estado;

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

if (
    document.getElementById("pedidos")
) {

    cargarPedidos();

}