const API_URL = "/api";


/* ==========================================================================
   CARGAR PRODUCTOS
========================================================================== */

async function cargarProductos() {

    const contenedor =
        document.getElementById("productos");


    try {

        const respuesta =
            await fetch(
                `${API_URL}/productos`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener los productos."
            );

        }


        const productos =
            await respuesta.json();


        contenedor.innerHTML = "";


        productos.forEach(
            producto => {

                const tarjeta =
                    document.createElement("article");


                tarjeta.classList.add(
                    "producto"
                );


                const agotado =
                    producto.stock <= 0;


                const imagen =
                    producto.imagen ||
                    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85";


                tarjeta.innerHTML = `

                    <div class="producto-imagen">

                        <img
                            src="${imagen}"
                            alt="${producto.nombre}"
                            loading="lazy"
                        >

                    </div>


                    <div class="producto-contenido">

                        <p class="producto-categoria">
                            ${producto.categoria}
                        </p>


                        <h2>
                            ${producto.nombre}
                        </h2>


                        <p class="producto-descripcion">
                            ${
                                producto.descripcion ||
                                "Producto de Café Nébula"
                            }
                        </p>

                    </div>


                    <div class="producto-info">

                        <div>

                            <p class="producto-precio">
                                $${Number(
                                    producto.precio
                                ).toFixed(2)}
                            </p>


                            <p class="producto-stock">

                                ${
                                    agotado
                                        ? "Producto agotado"
                                        : `Disponible: ${producto.stock}`
                                }

                            </p>

                        </div>

                    </div>


                    ${
                        agotado

                            ? `

                                <button
                                    class="btn-agotado"
                                    disabled
                                >
                                    Agotado
                                </button>

                            `

                            : `

                                <button
                                    class="btn-agregar"
                                    onclick="agregarAlCarrito(${producto.id_producto})"
                                >
                                    Agregar al carrito
                                </button>

                            `
                    }

                `;


                contenedor.appendChild(
                    tarjeta
                );

            }
        );


        actualizarContadorCarrito();


    } catch (error) {

        console.error(
            "Error al cargar productos:",
            error
        );


        contenedor.innerHTML = `

            <p>
                No fue posible cargar los productos.
                Verifica que el servidor esté funcionando.
            </p>

        `;

    }

}


/* ==========================================================================
   CARGAR OFERTA ACTIVA
========================================================================== */

async function cargarOfertaActiva() {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/ofertas/activa`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo obtener la oferta."
            );

        }


        const oferta =
            await respuesta.json();


        if (!oferta) {
            return;
        }


        const presentacion =
            document.querySelector(
                ".presentacion"
            );


        if (!presentacion) {
            return;
        }


        const precioOriginal =
            Number(
                oferta.precio_original || 0
            );


        const precioOferta =
            Number(
                oferta.precio_oferta || 0
            );


        const ofertaHTML = `

            <section class="oferta-destacada">

                <div class="oferta-destacada-contenido">

                    <span class="oferta-etiqueta">
                        ESPECIAL DE LA SEMANA
                    </span>


                    <h2>
                        ${oferta.titulo}
                    </h2>


                    <p>
                        ${oferta.descripcion}
                    </p>


                    ${
                        oferta.producto_nombre
                            ? `

                                <div class="oferta-productos">

                                    <span>
                                        ${oferta.producto_nombre}
                                    </span>


                                    ${
                                        oferta.producto_acompanamiento_nombre
                                            ? `

                                                <span>
                                                    +
                                                </span>


                                                <span>
                                                    ${oferta.producto_acompanamiento_nombre}
                                                </span>

                                            `
                                            : ""
                                    }

                                </div>

                            `
                            : ""
                    }


                    ${
                        precioOferta > 0
                            ? `

                                <div class="oferta-precio">

                                    <div class="oferta-precio-anterior">

                                        <span>
                                            Precio normal
                                        </span>


                                        <strong>
                                            $${precioOriginal.toFixed(2)}
                                        </strong>

                                    </div>


                                    <div class="oferta-precio-final">

                                        <span>
                                            Precio especial
                                        </span>


                                        <strong>
                                            $${precioOferta.toFixed(2)}
                                        </strong>

                                    </div>

                                </div>

                            `
                            : ""
                    }


                    <button
                        type="button"
                        class="btn-oferta"
                        onclick="agregarOfertaAlCarrito()"
                    >
                        Agregar oferta al carrito
                    </button>

                </div>


                ${
                    oferta.imagen
                        ? `

                            <div class="oferta-destacada-imagen">

                                <img
                                    src="${oferta.imagen}"
                                    alt="${oferta.titulo}"
                                >

                            </div>

                        `
                        : ""
                }

            </section>

        `;


        presentacion.insertAdjacentHTML(
            "afterend",
            ofertaHTML
        );


    } catch (error) {

        console.error(
            "Error al cargar oferta:",
            error
        );

    }

}


/* ==========================================================================
   AGREGAR OFERTA AL CARRITO
========================================================================== */

async function agregarOfertaAlCarrito() {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/ofertas/activa`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo obtener la oferta."
            );

        }


        const oferta =
            await respuesta.json();


        if (!oferta) {

            notificacionInfo(
                "No hay una oferta disponible."
            );

            return;

        }


        if (!oferta.id_producto) {

            notificacionError(
                "La oferta no tiene un producto válido."
            );

            return;

        }


        const respuestaProductos =
            await fetch(
                `${API_URL}/productos`
            );


        if (!respuestaProductos.ok) {

            throw new Error(
                "No se pudieron obtener los productos."
            );

        }


        const productos =
            await respuestaProductos.json();


        const productoPrincipal =
            productos.find(
                producto =>
                    Number(
                        producto.id_producto
                    ) ===
                    Number(
                        oferta.id_producto
                    )
            );


        if (!productoPrincipal) {

            notificacionError(
                "No se encontró el producto de la oferta."
            );

            return;

        }


        let carrito =
            JSON.parse(
                localStorage.getItem(
                    "carrito"
                )
            ) || [];


        /* ==============================================================
           VERIFICAR STOCK DEL PRODUCTO PRINCIPAL
        ============================================================== */

        if (
            Number(
                productoPrincipal.stock
            ) <= 0
        ) {

            notificacionInfo(
                `${productoPrincipal.nombre} está agotado.`
            );

            return;

        }


        /* ==============================================================
           PRODUCTO DE ACOMPAÑAMIENTO
        ============================================================== */

        let productoAcompanamiento =
            null;


        if (
            oferta.id_producto_acompanamiento
        ) {

            productoAcompanamiento =
                productos.find(
                    producto =>
                        Number(
                            producto.id_producto
                        ) ===
                        Number(
                            oferta.id_producto_acompanamiento
                        )
                );


            if (!productoAcompanamiento) {

                notificacionError(
                    "No se encontró el producto de acompañamiento."
                );

                return;

            }


            if (
                Number(
                    productoAcompanamiento.stock
                ) <= 0
            ) {

                notificacionInfo(
                    `${productoAcompanamiento.nombre} está agotado.`
                );

                return;

            }

        }


        /* ==============================================================
           CALCULAR DESCUENTO DE LA OFERTA
        ============================================================== */

        const precioOriginalOferta =
            Number(
                oferta.precio_original || 0
            );


        const precioOferta =
            Number(
                oferta.precio_oferta || 0
            );


        let precioOfertaPrincipal =
            Number(
                productoPrincipal.precio
            );


        let precioOfertaAcompanamiento =
            productoAcompanamiento
                ? Number(
                    productoAcompanamiento.precio
                )
                : null;


        if (
            productoAcompanamiento &&
            precioOriginalOferta > 0 &&
            precioOferta > 0
        ) {

            const precioPrincipalNormal =
                Number(
                    productoPrincipal.precio
                );


            const precioAcompanamientoNormal =
                Number(
                    productoAcompanamiento.precio
                );


            const totalNormal =
                precioPrincipalNormal +
                precioAcompanamientoNormal;


            if (totalNormal > 0) {

                precioOfertaPrincipal =
                    (
                        precioPrincipalNormal /
                        totalNormal
                    ) *
                    precioOferta;


                precioOfertaAcompanamiento =
                    precioOferta -
                    precioOfertaPrincipal;

            }

        } else if (
            !productoAcompanamiento &&
            precioOferta > 0
        ) {

            precioOfertaPrincipal =
                precioOferta;

        }


        /* ==============================================================
           AGREGAR PRODUCTO PRINCIPAL
        ============================================================== */

        const productoExistente =
            carrito.find(
                item =>
                    Number(
                        item.id_producto
                    ) ===
                    Number(
                        productoPrincipal.id_producto
                    )
            );


        if (productoExistente) {

            if (
                productoExistente.cantidad <
                productoPrincipal.stock
            ) {

                productoExistente.cantidad++;


                productoExistente.es_oferta =
                    true;


                productoExistente.id_oferta =
                    oferta.id_oferta;


                productoExistente.precio_oferta =
                    Number(
                        precioOfertaPrincipal
                    );


            } else {

                notificacionInfo(
                    `No hay más unidades disponibles de ${productoPrincipal.nombre}.`
                );

                return;

            }

        } else {

            carrito.push({

                id_producto:
                    productoPrincipal.id_producto,

                nombre:
                    productoPrincipal.nombre,

                precio:
                    Number(
                        productoPrincipal.precio
                    ),

                precio_oferta:
                    Number(
                        precioOfertaPrincipal
                    ),

                es_oferta:
                    true,

                id_oferta:
                    oferta.id_oferta,

                stock:
                    productoPrincipal.stock,

                imagen:
                    productoPrincipal.imagen,

                cantidad:
                    1

            });

        }


        /* ==============================================================
           AGREGAR PRODUCTO DE ACOMPAÑAMIENTO
        ============================================================== */

        if (
            productoAcompanamiento
        ) {

            const acompanamientoExistente =
                carrito.find(
                    item =>
                        Number(
                            item.id_producto
                        ) ===
                        Number(
                            productoAcompanamiento.id_producto
                        )
                );


            if (acompanamientoExistente) {

                if (
                    acompanamientoExistente.cantidad <
                    productoAcompanamiento.stock
                ) {

                    acompanamientoExistente.cantidad++;


                    acompanamientoExistente.es_oferta =
                        true;


                    acompanamientoExistente.id_oferta =
                        oferta.id_oferta;


                    acompanamientoExistente.precio_oferta =
                        Number(
                            precioOfertaAcompanamiento
                        );

                } else {

                    notificacionInfo(
                        `No hay más unidades disponibles de ${productoAcompanamiento.nombre}.`
                    );

                    return;

                }

            } else {

                carrito.push({

                    id_producto:
                        productoAcompanamiento.id_producto,

                    nombre:
                        productoAcompanamiento.nombre,

                    precio:
                        Number(
                            productoAcompanamiento.precio
                        ),

                    precio_oferta:
                        Number(
                            precioOfertaAcompanamiento
                        ),

                    es_oferta:
                        true,

                    id_oferta:
                        oferta.id_oferta,

                    stock:
                        productoAcompanamiento.stock,

                    imagen:
                        productoAcompanamiento.imagen,

                    cantidad:
                        1

                });

            }

        }


        /* ==============================================================
           GUARDAR CARRITO
        ============================================================== */

        localStorage.setItem(
            "carrito",
            JSON.stringify(
                carrito
            )
        );


        actualizarContadorCarrito();


        notificacionExito(
            "Oferta agregada al carrito."
        );


    } catch (error) {

        console.error(
            "Error al agregar oferta:",
            error
        );


        notificacionError(
            "No fue posible agregar la oferta al carrito."
        );

    }

}


/* ==========================================================================
   IR A PRODUCTOS
========================================================================== */

function irAProductos() {

    const productos =
        document.getElementById(
            "productos"
        );


    if (!productos) {
        return;
    }


    productos.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


/* ==========================================================================
   AGREGAR PRODUCTO NORMAL AL CARRITO
========================================================================== */

async function agregarAlCarrito(
    idProducto
) {

    try {

        const respuesta =
            await fetch(
                `${API_URL}/productos`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener los productos."
            );

        }


        const productos =
            await respuesta.json();


        const producto =
            productos.find(
                item =>
                    Number(
                        item.id_producto
                    ) ===
                    Number(
                        idProducto
                    )
            );


        if (!producto) {

            notificacionError(
                "Producto no encontrado."
            );

            return;

        }


        let carrito =
            JSON.parse(
                localStorage.getItem(
                    "carrito"
                )
            ) || [];


        const productoExistente =
            carrito.find(
                item =>
                    Number(
                        item.id_producto
                    ) ===
                    Number(
                        producto.id_producto
                    )
            );


        if (productoExistente) {

            if (
                productoExistente.cantidad <
                producto.stock
            ) {

                productoExistente.cantidad++;


            } else {

                notificacionInfo(
                    "No hay más unidades disponibles."
                );

                return;

            }

        } else {

            carrito.push({

                id_producto:
                    producto.id_producto,

                nombre:
                    producto.nombre,

                precio:
                    Number(
                        producto.precio
                    ),

                stock:
                    producto.stock,

                imagen:
                    producto.imagen,

                cantidad:
                    1

            });

        }


        localStorage.setItem(
            "carrito",
            JSON.stringify(
                carrito
            )
        );


        actualizarContadorCarrito();


        notificacionExito(
            `${producto.nombre} agregado al carrito.`
        );


    } catch (error) {

        console.error(
            "Error al agregar producto:",
            error
        );


        notificacionError(
            "No fue posible agregar el producto."
        );

    }

}


/* ==========================================================================
   CONTADOR DEL CARRITO
========================================================================== */

function actualizarContadorCarrito() {

    const contador =
        document.getElementById(
            "contador-carrito"
        );


    if (!contador) {
        return;
    }


    const carrito =
        JSON.parse(
            localStorage.getItem(
                "carrito"
            )
        ) || [];


    const cantidad =
        carrito.reduce(
            (
                total,
                producto
            ) => {

                return (
                    total +
                    Number(
                        producto.cantidad ||
                        0
                    )
                );

            },
            0
        );


    contador.textContent =
        cantidad;


    if (cantidad > 0) {

        contador.classList.add(
            "activo"
        );

    } else {

        contador.classList.remove(
            "activo"
        );

    }

}


/* ==========================================================================
   INICIALIZAR
========================================================================== */

cargarProductos();

cargarOfertaActiva();