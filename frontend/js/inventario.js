const API_URL_INVENTARIO = "/api";

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

    const idProductoEditar =
        document.getElementById("id-producto-editar");

    const formularioEtiqueta =
        document.getElementById(
            "formulario-producto-etiqueta"
        );

    const formularioTitulo =
        document.getElementById(
            "formulario-producto-titulo"
        );

    const formularioDescripcion =
        document.getElementById(
            "formulario-producto-descripcion"
        );

    const btnGuardar =
        document.querySelector(
            ".btn-guardar-producto"
        );


    let productosActuales = [];


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

        if (idProductoEditar) {
            idProductoEditar.value = "";
        }

        if (formularioEtiqueta) {
            formularioEtiqueta.textContent =
                "NUEVO REGISTRO";
        }

        if (formularioTitulo) {
            formularioTitulo.textContent =
                "Agregar producto";
        }

        if (formularioDescripcion) {
            formularioDescripcion.textContent =
                "El producto se agregará al inventario y estará disponible para los clientes.";
        }

        if (btnGuardar) {
            btnGuardar.textContent =
                "Guardar producto";
        }

        const stockMinimo =
            document.getElementById(
                "stock-minimo-producto"
            );

        if (stockMinimo) {
            stockMinimo.value = 5;
        }

    }


    function prepararFormularioAgregar() {

        if (formulario) {
            formulario.reset();
        }

        if (idProductoEditar) {
            idProductoEditar.value = "";
        }

        if (formularioEtiqueta) {
            formularioEtiqueta.textContent =
                "NUEVO REGISTRO";
        }

        if (formularioTitulo) {
            formularioTitulo.textContent =
                "Agregar producto";
        }

        if (formularioDescripcion) {
            formularioDescripcion.textContent =
                "El producto se agregará al inventario y estará disponible para los clientes.";
        }

        if (btnGuardar) {
            btnGuardar.textContent =
                "Guardar producto";
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
            () => {

                prepararFormularioAgregar();

                mostrarFormulario();

            }
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
    // EDITAR PRODUCTO
    // =====================================================

    function editarProducto(idProducto) {

        const producto =
            productosActuales.find(
                item =>
                    Number(item.id_producto) ===
                    Number(idProducto)
            );


        if (!producto) {

            alert(
                "No se encontró el producto."
            );

            return;

        }


        if (idProductoEditar) {
            idProductoEditar.value =
                producto.id_producto;
        }


        document.getElementById(
            "nombre-producto"
        ).value =
            producto.nombre || "";


        document.getElementById(
            "categoria-producto"
        ).value =
            producto.categoria || "";


        document.getElementById(
            "descripcion-producto"
        ).value =
            producto.descripcion || "";


        document.getElementById(
            "precio-producto"
        ).value =
            producto.precio;


        document.getElementById(
            "stock-producto"
        ).value =
            producto.stock;


        document.getElementById(
            "stock-minimo-producto"
        ).value =
            producto.stock_minimo;


        document.getElementById(
            "imagen-producto"
        ).value =
            producto.imagen || "";


        if (formularioEtiqueta) {
            formularioEtiqueta.textContent =
                "EDICIÓN";
        }


        if (formularioTitulo) {
            formularioTitulo.textContent =
                "Editar producto";
        }


        if (formularioDescripcion) {
            formularioDescripcion.textContent =
                "Modifica la información del producto y guarda los cambios.";
        }


        if (btnGuardar) {
            btnGuardar.textContent =
                "Guardar cambios";
        }


        mostrarFormulario();

    }


    // =====================================================
    // ELIMINAR PRODUCTO
    // =====================================================

    async function eliminarProducto(idProducto) {

        const producto =
            productosActuales.find(
                item =>
                    Number(item.id_producto) ===
                    Number(idProducto)
            );


        if (!producto) {

            alert(
                "No se encontró el producto."
            );

            return;

        }


        const confirmar =
            confirm(
                `¿Seguro que deseas eliminar "${producto.nombre}"?`
            );


        if (!confirmar) {
            return;
        }


        try {

            const respuesta =
                await fetch(
                    `${API_URL_INVENTARIO}/productos/${idProducto}`,
                    {
                        method: "DELETE"
                    }
                );


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.mensaje ||
                    "No fue posible eliminar el producto."
                );

            }


            alert(
                "Producto eliminado correctamente."
            );


            await cargarInventario();


        } catch (error) {

            console.error(
                "Error al eliminar producto:",
                error
            );


            alert(
                "No fue posible eliminar el producto.\n\n" +
                error.message
            );

        }

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


            productosActuales =
                productos;


            mostrarProductosRecientes(
                productos
            );


            if (recientesContenedor) {

                recientesContenedor.style.display =
                    "none";

                btnMostrarRecientes.textContent =
                    "Mostrar";

            }


            if (cantidadProductos) {

                cantidadProductos.textContent =
                    productos.length;

            }


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


                            <div class="inventario-acciones">

                                <button
                                    type="button"
                                    class="btn-editar-producto"
                                    data-id="${producto.id_producto}"
                                >
                                    Editar
                                </button>


                                <button
                                    type="button"
                                    class="btn-eliminar-producto"
                                    data-id="${producto.id_producto}"
                                >
                                    Eliminar
                                </button>

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


            // =================================================
            // EVENTOS EDITAR
            // =================================================

            const botonesEditar =
                document.querySelectorAll(
                    ".btn-editar-producto"
                );


            botonesEditar.forEach(
                boton => {

                    boton.addEventListener(
                        "click",
                        () => {

                            editarProducto(
                                boton.dataset.id
                            );

                        }
                    );

                }
            );


            // =================================================
            // EVENTOS ELIMINAR
            // =================================================

            const botonesEliminar =
                document.querySelectorAll(
                    ".btn-eliminar-producto"
                );


            botonesEliminar.forEach(
                boton => {

                    boton.addEventListener(
                        "click",
                        () => {

                            eliminarProducto(
                                boton.dataset.id
                            );

                        }
                    );

                }
            );


        } catch (error) {

            console.error(
                "Error al cargar inventario:",
                error
            );


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
    // AGREGAR / ACTUALIZAR PRODUCTO
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


                const idEditar =
                    idProductoEditar
                        ? idProductoEditar.value
                        : "";


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
                            ),

                    imagen:
                        datos.get("imagen")
                            .trim()

                };


                try {

                    let respuesta;


                    // =================================================
                    // EDITAR
                    // =================================================

                    if (idEditar) {

                        respuesta =
                            await fetch(
                                `${API_URL_INVENTARIO}/productos/${idEditar}`,
                                {
                                    method: "PUT",

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


                    // =================================================
                    // AGREGAR
                    // =================================================

                    } else {

                        respuesta =
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

                    }


                    const resultado =
                        await respuesta.json();


                    if (!respuesta.ok) {

                        throw new Error(
                            resultado.mensaje ||
                            "No fue posible guardar el producto."
                        );

                    }


                    alert(
                        idEditar
                            ? "Producto actualizado correctamente."
                            : "Producto agregado correctamente."
                    );


                    ocultarFormulario();


                    await cargarInventario();


                } catch (error) {

                    console.error(
                        "Error al guardar producto:",
                        error
                    );


                    alert(
                        "No fue posible guardar el producto.\n\n" +
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