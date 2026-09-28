const API_URL_INVENTARIO = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {

    const formularioPanel =
        document.getElementById("formulario-producto");

    const formulario =
        document.getElementById("form-agregar-producto");

    const btnAgregar =
        document.getElementById("btn-agregar-producto");

    const btnCerrar =
        document.getElementById("btn-cerrar-formulario");

    const btnCancelar =
        document.getElementById("btn-cancelar-producto");

    const btnMostrarRecientes =
        document.getElementById("btn-mostrar-recientes");

    const recientesContenedor =
        document.getElementById("ultimos-productos");

    const cantidadProductos =
        document.getElementById("cantidad-productos");

    const inventarioContenedor =
        document.getElementById("inventario");


    // =====================================================
    // FORMULARIO
    // =====================================================

    function mostrarFormulario() {

        if (!formularioPanel) {
            return;
        }

        formularioPanel.hidden = false;

        formularioPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    function ocultarFormulario() {

        if (!formularioPanel) {
            return;
        }

        formularioPanel.hidden = true;

        if (formulario) {
            formulario.reset();
        }

        const stockMinimo =
            document.getElementById(
                "stock-minimo-producto"
            );

        if (stockMinimo) {
            stockMinimo.value = 5;
        }

    }


    if (btnAgregar) {

        btnAgregar.addEventListener(
            "click",
            mostrarFormulario
        );

    }


    if (btnCerrar) {

        btnCerrar.addEventListener(
            "click",
            ocultarFormulario
        );

    }


    if (btnCancelar) {

        btnCancelar.addEventListener(
            "click",
            ocultarFormulario
        );

    }


    // =====================================================
    // MOSTRAR / OCULTAR PRODUCTOS RECIENTES
    // =====================================================

    if (
        btnMostrarRecientes &&
        recientesContenedor
    ) {

        // Iniciar siempre oculto
        recientesContenedor.style.display =
            "none";

        btnMostrarRecientes.textContent =
            "Mostrar";


        btnMostrarRecientes.addEventListener(
            "click",
            () => {

                if (
                    recientesContenedor.style.display ===
                    "none"
                ) {

                    recientesContenedor.style.display =
                        "flex";

                    btnMostrarRecientes.textContent =
                        "Ocultar";

                } else {

                    recientesContenedor.style.display =
                        "none";

                    btnMostrarRecientes.textContent =
                        "Mostrar";

                }

            }
        );

    }


    // =====================================================
    // CONVERTIR FECHA
    // =====================================================

    function convertirFecha(fechaRegistro) {

        if (!fechaRegistro) {
            return null;
        }

        const fecha =
            new Date(fechaRegistro);

        if (
            Number.isNaN(
                fecha.getTime()
            )
        ) {

            return null;

        }

        return fecha;

    }


    // =====================================================
    // FORMATEAR FECHA
    // =====================================================

    function formatearFecha(fechaRegistro) {

        const fecha =
            convertirFecha(
                fechaRegistro
            );


        if (!fecha) {

            return "Fecha no disponible";

        }


        return fecha.toLocaleDateString(
            "es-MX",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // =====================================================
    // MOSTRAR PRODUCTOS RECIENTES
    // =====================================================

    function mostrarProductosRecientes(productos) {

        if (!recientesContenedor) {
            return;
        }


        const productosRecientes =
            productos
                .filter(
                    producto =>
                        producto.fecha_registro
                )
                .sort(
                    (a, b) =>
                        new Date(
                            b.fecha_registro
                        ) -
                        new Date(
                            a.fecha_registro
                        )
                )
                .slice(0, 3);


        if (
            productosRecientes.length === 0
        ) {

            recientesContenedor.innerHTML = `

                <div class="carrito-vacio">

                    <h2>
                        No hay productos recientes
                    </h2>

                    <p>
                        Los productos nuevos aparecerán aquí.
                    </p>

                </div>

            `;

            return;

        }


        let productosHTML = "";


        productosRecientes.forEach(
            producto => {

                productosHTML += `

                    <article class="producto-reciente">

                        <div class="producto-reciente-info">

                            <p>
                                ${producto.categoria}
                            </p>

                            <h3>
                                ${producto.nombre}
                            </h3>

                            <span>
                                $${Number(
                                    producto.precio
                                ).toFixed(2)}

                                · Stock
                                ${Number(
                                    producto.stock
                                )}
                            </span>

                        </div>


                        <div class="producto-reciente-fecha">

                            <span>
                                Agregado
                            </span>

                            <strong>
                                ${formatearFecha(
                                    producto.fecha_registro
                                )}
                            </strong>

                        </div>

                    </article>

                `;

            }
        );


        recientesContenedor.innerHTML =
            productosHTML;

    }


    // =====================================================
    // CARGAR INVENTARIO
    // =====================================================

    async function cargarInventario() {

        if (!inventarioContenedor) {
            return;
        }


        try {

            const respuesta =
                await fetch(
                    `${API_URL_INVENTARIO}/productos`
                );


            if (!respuesta.ok) {

                throw new Error(
                    "No se pudo obtener el inventario."
                );

            }


            const productos =
                await respuesta.json();


            // =================================================
            // ACTUALIZAR PRODUCTOS RECIENTES
            // =================================================

            mostrarProductosRecientes(
                productos
            );


            // Mantener productos recientes ocultos
            // después de cargar el inventario
            if (recientesContenedor) {

                recientesContenedor.style.display =
                    "none";

                btnMostrarRecientes.textContent =
                    "Mostrar";

            }


            // =================================================
            // ACTUALIZAR CONTADOR
            // =================================================

            if (cantidadProductos) {

                cantidadProductos.textContent =
                    productos.length;

            }


            // =================================================
            // INVENTARIO VACÍO
            // =================================================

            if (
                productos.length === 0
            ) {

                inventarioContenedor.innerHTML = `

                    <div class="carrito-vacio">

                        <h2>
                            Inventario vacío
                        </h2>

                        <p>
                            No hay productos registrados.
                        </p>

                    </div>

                `;

                return;

            }


            // =================================================
            // GENERAR INVENTARIO
            // =================================================

            let productosHTML = "";


            productos.forEach(
                producto => {

                    const stock =
                        Number(
                            producto.stock
                        );


                    const stockMinimo =
                        Number(
                            producto.stock_minimo
                        );


                    let estado;
                    let claseEstado;


                    if (
                        stock <= 0
                    ) {

                        estado =
                            "Agotado";

                        claseEstado =
                            "inventario-agotado";

                    } else if (
                        stock <= stockMinimo
                    ) {

                        estado =
                            "Stock bajo";

                        claseEstado =
                            "inventario-bajo";

                    } else {

                        estado =
                            "Disponible";

                        claseEstado =
                            "inventario-disponible";

                    }


                    productosHTML += `

                        <article class="inventario-producto">

                            <div class="inventario-producto-info">

                                <p class="producto-categoria">
                                    ${producto.categoria}
                                </p>

                                <h2>
                                    ${producto.nombre}
                                </h2>

                                <p>
                                    ${producto.descripcion || ""}
                                </p>

                            </div>


                            <div class="inventario-dato">

                                <span>
                                    Precio
                                </span>

                                <strong>
                                    $${Number(
                                        producto.precio
                                    ).toFixed(2)}
                                </strong>

                            </div>


                            <div class="inventario-dato">

                                <span>
                                    Stock actual
                                </span>

                                <strong>
                                    ${stock}
                                </strong>

                            </div>


                            <div class="inventario-dato">

                                <span>
                                    Stock mínimo
                                </span>

                                <strong>
                                    ${stockMinimo}
                                </strong>

                            </div>


                            <div>

                                <span
                                    class="
                                        estado-inventario
                                        ${claseEstado}
                                    "
                                >
                                    ${estado}
                                </span>

                            </div>

                        </article>

                    `;

                }
            );


            inventarioContenedor.innerHTML = `

                <div class="inventario-lista">

                    ${productosHTML}

                </div>

            `;


        } catch (error) {

            console.error(
                "Error al cargar inventario:",
                error
            );


            if (recientesContenedor) {

                recientesContenedor.innerHTML = `

                    <div class="carrito-vacio">

                        <h2>
                            No se pudieron cargar
                        </h2>

                        <p>
                            Verifica que el servidor esté funcionando.
                        </p>

                    </div>

                `;

            }


            inventarioContenedor.innerHTML = `

                <div class="carrito-vacio">

                    <h2>
                        Error al cargar inventario
                    </h2>

                    <p>
                        Verifica que el servidor esté funcionando.
                    </p>

                </div>

            `;

        }

    }


    // =====================================================
    // AGREGAR PRODUCTO
    // =====================================================

    if (formulario) {

        formulario.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const datos =
                    new FormData(
                        formulario
                    );


                const producto = {

                    nombre:
                        datos.get("nombre")
                            .trim(),

                    categoria:
                        datos.get("categoria")
                            .trim(),

                    descripcion:
                        datos.get("descripcion")
                            .trim(),

                    precio:
                        Number(
                            datos.get("precio")
                        ),

                    stock:
                        Number(
                            datos.get("stock")
                        ),

                    stock_minimo:
                        datos.get("stock_minimo") === ""
                            ? 5
                            : Number(
                                datos.get("stock_minimo")
                            )

                };


                try {

                    const respuesta =
                        await fetch(
                            `${API_URL_INVENTARIO}/productos`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        producto
                                    )
                            }
                        );


                    const resultado =
                        await respuesta.json();


                    if (!respuesta.ok) {

                        throw new Error(
                            resultado.mensaje ||
                            "No fue posible agregar el producto."
                        );

                    }


                    alert(
                        "Producto agregado correctamente."
                    );


                    ocultarFormulario();


                    // Volver a cargar todo
                    await cargarInventario();


                } catch (error) {

                    console.error(
                        "Error al agregar producto:",
                        error
                    );


                    alert(
                        "No fue posible agregar el producto.\n\n" +
                        error.message
                    );

                }

            }
        );

    }


    // =====================================================
    // INICIAR
    // =====================================================

    cargarInventario();

});