const API_URL = "/api";


// =====================================================
// CARGAR PRODUCTOS
// =====================================================

async function cargarProductos() {

    const contenedor =
        document.getElementById("productos");

    try {

        const respuesta =
            await fetch(`${API_URL}/productos`);

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener los productos."
            );

        }

        const productos =
            await respuesta.json();

        contenedor.innerHTML = "";


        productos.forEach(producto => {

            const tarjeta =
                document.createElement("article");

            tarjeta.classList.add("producto");


            const agotado =
                producto.stock <= 0;


            /*
             * La imagen ahora viene directamente
             * desde la base de datos.
             */
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
                            $${Number(producto.precio).toFixed(2)}
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


            contenedor.appendChild(tarjeta);

        });


        actualizarContadorCarrito();


    } catch (error) {

        console.error(error);

        contenedor.innerHTML = `

            <p>
                No fue posible cargar los productos.
                Verifica que el servidor esté funcionando.
            </p>

        `;

    }

}


// =====================================================
// AGREGAR AL CARRITO
// =====================================================

async function agregarAlCarrito(idProducto) {

    try {

        const respuesta =
            await fetch(`${API_URL}/productos`);

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
                    Number(item.id_producto) ===
                    Number(idProducto)
            );


        if (!producto) {

            alert("Producto no encontrado.");

            return;

        }


        let carrito =
            JSON.parse(
                localStorage.getItem("carrito")
            ) || [];


        const productoExistente =
            carrito.find(
                item =>
                    Number(item.id_producto) ===
                    Number(producto.id_producto)
            );


        if (productoExistente) {

            if (
                productoExistente.cantidad <
                producto.stock
            ) {

                productoExistente.cantidad++;

            } else {

                alert(
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
                    Number(producto.precio),

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
            JSON.stringify(carrito)
        );


        actualizarContadorCarrito();


        alert(
            `${producto.nombre} agregado al carrito.`
        );


    } catch (error) {

        console.error(error);

        alert(
            "No fue posible agregar el producto."
        );

    }

}


// =====================================================
// CONTADOR DEL CARRITO
// =====================================================

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
            localStorage.getItem("carrito")
        ) || [];


    const cantidad =
        carrito.reduce(
            (total, producto) => {

                return total +
                    Number(
                        producto.cantidad || 0
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


// =====================================================
// INICIAR
// =====================================================

cargarProductos();