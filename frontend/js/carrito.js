const API_URL = "http://localhost:3000/api";

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );
}

function cambiarCantidad(idProducto, nuevaCantidad) {

    const producto = carrito.find(
        item => item.id_producto === idProducto
    );

    if (!producto) return;

    nuevaCantidad = Number(nuevaCantidad);

    if (nuevaCantidad <= 0) {
        eliminarProducto(idProducto);
        return;
    }

    if (nuevaCantidad > producto.stock) {
        alert("La cantidad supera el stock disponible.");
        mostrarCarrito();
        return;
    }

    producto.cantidad = nuevaCantidad;

    guardarCarrito();

    mostrarCarrito();
}

function eliminarProducto(idProducto) {

    carrito = carrito.filter(
        item => item.id_producto !== idProducto
    );

    guardarCarrito();

    mostrarCarrito();
}

function calcularTotal() {

    return carrito.reduce(
        (total, producto) => {

            return total +
                (producto.precio * producto.cantidad);

        },
        0
    );
}

function mostrarCarrito() {

    const contenedor =
        document.getElementById("carrito");

    const formulario =
        document.getElementById("formulario-pedido");

    // Carrito vacío
    if (carrito.length === 0) {

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
            formulario.style.display = "none";
        }

        return;
    }

    // Mostrar formulario
    if (formulario) {
        formulario.style.display = "block";
    }

    let productosHTML = "";

    carrito.forEach(producto => {

        const subtotal =
            producto.precio * producto.cantidad;

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
                        $${producto.precio.toFixed(2)} por unidad
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
    });

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


// =====================================================
// REALIZAR PEDIDO
// =====================================================

async function realizarPedido() {

    if (carrito.length === 0) {

        alert("El carrito está vacío.");

        return;
    }

    const nombre =
        document.getElementById("nombre").value.trim();

    const telefono =
        document.getElementById("telefono").value.trim();


    if (!nombre) {

        alert("Ingresa tu nombre.");

        return;
    }


    const pedido = {

        nombre: nombre,

        telefono: telefono,

        productos: carrito.map(producto => ({

            id_producto: producto.id_producto,

            cantidad: producto.cantidad

        }))

    };


    try {

        const respuesta = await fetch(
            `${API_URL}/pedidos`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(pedido)
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


        // =============================================
        // PEDIDO ENVIADO CORRECTAMENTE
        // =============================================

        alert(
            `¡Pedido enviado correctamente!\n\n` +
            `Número de pedido: #${resultado.id_pedido}\n` +
            `Total: $${Number(resultado.total).toFixed(2)}\n` +
            `Estado: ${resultado.estado}`
        );


        // Limpiar carrito
        localStorage.removeItem("carrito");

        carrito = [];


        // Limpiar formulario
        const formulario =
            document.getElementById("pedido-form");

        if (formulario) {
            formulario.reset();
        }


        mostrarCarrito();


    } catch (error) {

        console.error(
            "Error al realizar pedido:",
            error
        );

        alert(
            `No fue posible realizar el pedido.\n\n${error.message}`
        );
    }
}


// =====================================================
// FORMULARIO
// =====================================================

const formularioPedido =
    document.getElementById("pedido-form");


if (formularioPedido) {

    formularioPedido.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            await realizarPedido();

        }
    );
}


// Mostrar carrito al cargar
mostrarCarrito();