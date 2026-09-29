const API_URL = "/api";


let carrito =
    JSON.parse(
        localStorage.getItem("carrito")
    ) || [];


/* ==========================================================================
   GUARDAR CARRITO
========================================================================== */

function guardarCarrito() {

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

}


/* ==========================================================================
   OBTENER PRECIO REAL DEL PRODUCTO
========================================================================== */

function obtenerPrecioProducto(producto) {

    if (
        producto.es_oferta &&
        producto.precio_oferta !== undefined &&
        producto.precio_oferta !== null
    ) {

        return Number(
            producto.precio_oferta
        );

    }


    return Number(
        producto.precio
    );

}


/* ==========================================================================
   CAMBIAR CANTIDAD
========================================================================== */

function cambiarCantidad(
    idProducto,
    nuevaCantidad
) {

    const producto =
        carrito.find(
            item =>
                Number(
                    item.id_producto
                ) ===
                Number(
                    idProducto
                )
        );


    if (!producto) {
        return;
    }


    nuevaCantidad =
        Number(
            nuevaCantidad
        );


    if (nuevaCantidad <= 0) {

        eliminarProducto(
            idProducto
        );

        return;

    }


    /*
     * Si es una oferta, la cantidad debe cambiar
     * para todos los productos que pertenecen
     * a esa misma oferta.
     */

    if (
        producto.es_oferta &&
        producto.id_oferta
    ) {

        const productosOferta =
            carrito.filter(
                item =>
                    item.es_oferta &&
                    Number(
                        item.id_oferta
                    ) ===
                    Number(
                        producto.id_oferta
                    )
            );


        for (
            const productoOferta
            of productosOferta
        ) {

            if (
                nuevaCantidad >
                Number(
                    productoOferta.stock
                )
            ) {

                notificacionInfo(
                    "La cantidad supera el stock disponible."
                );


                mostrarCarrito();

                return;

            }

        }


        productosOferta.forEach(
            productoOferta => {

                productoOferta.cantidad =
                    nuevaCantidad;

            }
        );


        guardarCarrito();

        mostrarCarrito();

        return;

    }


    if (
        nuevaCantidad >
        producto.stock
    ) {

        notificacionInfo(
            "La cantidad supera el stock disponible."
        );


        mostrarCarrito();

        return;

    }


    producto.cantidad =
        nuevaCantidad;


    guardarCarrito();

    mostrarCarrito();

}


/* ==========================================================================
   ELIMINAR PRODUCTO
========================================================================== */

function eliminarProducto(
    idProducto
) {

    const producto =
        carrito.find(
            item =>
                Number(
                    item.id_producto
                ) ===
                Number(
                    idProducto
                )
        );


    /*
     * Si el producto pertenece a una oferta,
     * se elimina la oferta completa.
     */

    if (
        producto &&
        producto.es_oferta &&
        producto.id_oferta
    ) {

        const idOferta =
            Number(
                producto.id_oferta
            );


        carrito =
            carrito.filter(
                item =>
                    !(
                        item.es_oferta &&
                        Number(
                            item.id_oferta
                        ) ===
                        idOferta
                    )
            );


    } else {

        carrito =
            carrito.filter(
                item =>
                    Number(
                        item.id_producto
                    ) !==
                    Number(
                        idProducto
                    )
            );

    }


    guardarCarrito();

    mostrarCarrito();

}


/* ==========================================================================
   CALCULAR TOTAL
========================================================================== */

function calcularTotal() {

    return carrito.reduce(
        (
            total,
            producto
        ) => {

            const precio =
                obtenerPrecioProducto(
                    producto
                );


            return (
                total +
                (
                    precio *
                    producto.cantidad
                )
            );

        },
        0
    );

}


/* ==========================================================================
   MOSTRAR CARRITO
========================================================================== */

function mostrarCarrito() {

    const contenedor =
        document.getElementById(
            "carrito"
        );


    const formulario =
        document.getElementById(
            "formulario-pedido"
        );


    /* ==============================================================
       CARRITO VACÍO
    ============================================================== */

    if (
        carrito.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="carrito-vacio">

                <h2>
                    Tu carrito está vacío
                </h2>


                <p>
                    Agrega algunos productos para comenzar tu pedido.
                </p>


                <a
                    href="productos.html"
                    class="btn-agregar"
                >
                    Ver productos
                </a>

            </div>

        `;


        if (formulario) {

            formulario.style.display =
                "none";

        }


        return;

    }


    /* ==============================================================
       MOSTRAR FORMULARIO
    ============================================================== */

    if (formulario) {

        formulario.style.display =
            "block";

    }


    let productosHTML =
        "";


    /*
     * Guardamos aquí las ofertas que ya fueron
     * mostradas para no repetirlas.
     */

    const ofertasMostradas =
        new Set();


    /* ==============================================================
       PRODUCTOS
    ============================================================== */

    carrito.forEach(
        producto => {


            /* ======================================================
               OFERTA
            ====================================================== */

            if (
                producto.es_oferta &&
                producto.id_oferta
            ) {

                const idOferta =
                    Number(
                        producto.id_oferta
                    );


                /*
                 * Si esta oferta ya fue mostrada,
                 * no volvemos a crear otra línea.
                 */

                if (
                    ofertasMostradas.has(
                        idOferta
                    )
                ) {

                    return;

                }


                ofertasMostradas.add(
                    idOferta
                );


                /*
                 * Obtener todos los productos
                 * que pertenecen a esta oferta.
                 */

                const productosOferta =
                    carrito.filter(
                        item =>
                            item.es_oferta &&
                            Number(
                                item.id_oferta
                            ) ===
                            idOferta
                    );


                const cantidad =
                    productosOferta[0].cantidad;


                /*
                 * Nombres de los productos.
                 */

                const nombres =
                    productosOferta
                        .map(
                            item =>
                                item.nombre
                        )
                        .join(" + ");


                /*
                 * Precio normal total de la oferta.
                 */

                const precioNormal =
                    productosOferta.reduce(
                        (
                            total,
                            item
                        ) => {

                            return (
                                total +
                                (
                                    Number(
                                        item.precio
                                    ) *
                                    cantidad
                                )
                            );

                        },
                        0
                    );


                /*
                 * Precio de oferta total.
                 */

                const precioOferta =
                    productosOferta.reduce(
                        (
                            total,
                            item
                        ) => {

                            return (
                                total +
                                (
                                    obtenerPrecioProducto(
                                        item
                                    ) *
                                    cantidad
                                )
                            );

                        },
                        0
                    );


                const subtotal =
                    precioOferta;


                productosHTML += `

                    <div class="item-carrito">

                        <div>

                            <p class="producto-categoria">
                                Oferta especial
                            </p>


                            <h2>
                                ${nombres}
                            </h2>


                            <div class="precio-oferta-carrito">

                                <p
                                    class="precio-normal-carrito"
                                >
                                    $${precioNormal.toFixed(2)}
                                </p>


                                <p
                                    class="precio-especial-carrito"
                                >
                                    $${precioOferta.toFixed(2)}
                                </p>

                            </div>


                            <p>
                                Precio especial por oferta
                            </p>

                        </div>


                        <div class="cantidad-carrito">

                            <label>
                                Cantidad
                            </label>


                            <input
                                type="number"
                                min="1"
                                value="${cantidad}"
                                onchange="
                                    cambiarCantidad(
                                        ${producto.id_producto},
                                        this.value
                                    )
                                "
                            >

                        </div>


                        <div>

                            <p>
                                Subtotal
                            </p>


                            <strong
                                class="subtotal-oferta-carrito"
                            >
                                $${subtotal.toFixed(2)}
                            </strong>

                        </div>


                        <button
                            class="btn-eliminar"
                            onclick="
                                eliminarProducto(
                                    ${producto.id_producto}
                                )
                            "
                        >
                            Eliminar
                        </button>

                    </div>

                `;


                return;

            }


            /* ======================================================
               PRODUCTO NORMAL
            ====================================================== */

            const precioNormal =
                Number(
                    producto.precio
                );


            const precioActual =
                obtenerPrecioProducto(
                    producto
                );


            const subtotal =
                precioActual *
                producto.cantidad;


            productosHTML += `

                <div class="item-carrito">

                    <div>

                        <p class="producto-categoria">
                            Producto
                        </p>


                        <h2>
                            ${producto.nombre}
                        </h2>


                        <p>
                            $${precioNormal.toFixed(2)}
                            por unidad
                        </p>

                    </div>


                    <div class="cantidad-carrito">

                        <label>
                            Cantidad
                        </label>


                        <input
                            type="number"
                            min="1"
                            max="${producto.stock}"
                            value="${producto.cantidad}"
                            onchange="
                                cambiarCantidad(
                                    ${producto.id_producto},
                                    this.value
                                )
                            "
                        >

                    </div>


                    <div>

                        <p>
                            Subtotal
                        </p>


                        <strong>
                            $${subtotal.toFixed(2)}
                        </strong>

                    </div>


                    <button
                        class="btn-eliminar"
                        onclick="
                            eliminarProducto(
                                ${producto.id_producto}
                            )
                        "
                    >
                        Eliminar
                    </button>

                </div>

            `;

        }
    );


    /* ==============================================================
       RESUMEN
    ============================================================== */

    contenedor.innerHTML = `

        <div class="lista-carrito">

            ${productosHTML}

        </div>


        <div class="resumen-carrito">

            <p>
                Total del pedido
            </p>


            <h2>
                $${calcularTotal().toFixed(2)}
            </h2>

        </div>

    `;

}


/* ==========================================================================
   REALIZAR PEDIDO
========================================================================== */

async function realizarPedido() {

    if (
        carrito.length === 0
    ) {

        notificacionInfo(
            "El carrito está vacío."
        );

        return;

    }


    const nombre =
        document
            .getElementById(
                "nombre"
            )
            .value
            .trim();


    const telefono =
        document
            .getElementById(
                "telefono"
            )
            .value
            .trim();


    if (!nombre) {

        notificacionInfo(
            "Ingresa tu nombre."
        );

        return;

    }


    /* ==============================================================
       PREPARAR PRODUCTOS
    ============================================================== */

    const productosPedido =
        carrito.map(
            producto => {

                const productoPedido = {

                    id_producto:
                        producto.id_producto,

                    cantidad:
                        producto.cantidad

                };


                if (
                    producto.es_oferta &&
                    producto.id_oferta
                ) {

                    productoPedido.id_oferta =
                        Number(
                            producto.id_oferta
                        );

                }


                return productoPedido;

            }
        );


    /* ==============================================================
       CREAR PEDIDO
    ============================================================== */

    const pedido = {

        nombre:
            nombre,

        telefono:
            telefono,

        productos:
            productosPedido

    };


    try {

        const respuesta =
            await fetch(
                `${API_URL}/pedidos`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            pedido
                        )

                }
            );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(

                resultado.error ||
                resultado.mensaje ||
                "No fue posible realizar el pedido."

            );

        }


        /* ==========================================================
           PEDIDO ENVIADO
        ========================================================== */

        notificacionExito(

            `Pedido enviado correctamente. ` +
            `Número: #${resultado.id_pedido} · ` +
            `Total: $${Number(
                resultado.total
            ).toFixed(2)} · ` +
            `Estado: ${resultado.estado}`

        );


        /* ==========================================================
           LIMPIAR CARRITO
        ========================================================== */

        localStorage.removeItem(
            "carrito"
        );


        carrito = [];


        /* ==========================================================
           LIMPIAR FORMULARIO
        ========================================================== */

        const formulario =
            document.getElementById(
                "pedido-form"
            );


        if (formulario) {

            formulario.reset();

        }


        mostrarCarrito();


    } catch (error) {

        console.error(
            "Error al realizar pedido:",
            error
        );


        notificacionError(

            `No fue posible realizar el pedido. ${error.message}`

        );

    }

}


/* ==========================================================================
   FORMULARIO
========================================================================== */

const formularioPedido =
    document.getElementById(
        "pedido-form"
    );


if (formularioPedido) {

    formularioPedido.addEventListener(

        "submit",

        async event => {

            event.preventDefault();


            await realizarPedido();

        }

    );

}


/* ==========================================================================
   MOSTRAR CARRITO AL CARGAR
========================================================================== */

mostrarCarrito();