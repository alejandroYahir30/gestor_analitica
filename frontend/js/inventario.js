const API_URL = "http://localhost:3000/api";


// =====================================================
// CARGAR INVENTARIO
// =====================================================

async function cargarInventario() {

    const contenedor =
        document.getElementById("inventario");

    try {

        const respuesta =
            await fetch(`${API_URL}/productos`);


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo obtener el inventario."
            );

        }


        const productos =
            await respuesta.json();


        if (productos.length === 0) {

            contenedor.innerHTML = `

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


        productos.forEach(producto => {

            const stock =
                Number(producto.stock);

            const stockMinimo =
                Number(producto.stock_minimo);


            let estado;
            let claseEstado;


            if (stock <= 0) {

                estado = "Agotado";
                claseEstado = "inventario-agotado";

            } else if (stock <= stockMinimo) {

                estado = "Stock bajo";
                claseEstado = "inventario-bajo";

            } else {

                estado = "Disponible";
                claseEstado = "inventario-disponible";

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
                            class="estado-inventario ${claseEstado}"
                        >
                            ${estado}
                        </span>

                    </div>

                </article>

            `;

        });


        contenedor.innerHTML = `

            <div class="inventario-lista">

                ${productosHTML}

            </div>

        `;


    } catch (error) {

        console.error(
            "Error al cargar inventario:",
            error
        );


        contenedor.innerHTML = `

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
// INICIAR
// =====================================================

cargarInventario();