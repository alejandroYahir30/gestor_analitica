const API_URL = "http://localhost:3000/api";

async function cargarProductos() {
    const contenedor = document.getElementById("productos");

    try {
        const respuesta = await fetch(`${API_URL}/productos`);

        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener los productos.");
        }

        const productos = await respuesta.json();

        contenedor.innerHTML = "";

        productos.forEach(producto => {

            const tarjeta = document.createElement("article");

            tarjeta.classList.add("producto");

            const agotado = producto.stock <= 0;

            tarjeta.innerHTML = `
                <div>
                    <p class="producto-categoria">
                        ${producto.categoria}
                    </p>

                    <h2>
                        ${producto.nombre}
                    </h2>

                    <p class="producto-descripcion">
                        ${producto.descripcion || "Producto de Café Nébula"}
                    </p>
                </div>

                <div class="producto-info">

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

                    ${
                        agotado
                            ? `
                                <button class="btn-agotado" disabled>
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

                </div>
            `;

            contenedor.appendChild(tarjeta);
        });

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

async function agregarAlCarrito(idProducto) {

    try {

        const respuesta = await fetch(`${API_URL}/productos`);

        if (!respuesta.ok) {
            throw new Error("No se pudieron obtener los productos.");
        }

        const productos = await respuesta.json();

        const producto = productos.find(
            item => item.id_producto === idProducto
        );

        if (!producto) {
            alert("Producto no encontrado.");
            return;
        }

        let carrito = JSON.parse(
            localStorage.getItem("carrito")
        ) || [];

        const productoExistente = carrito.find(
            item => item.id_producto === producto.id_producto
        );

        if (productoExistente) {

            if (productoExistente.cantidad < producto.stock) {
                productoExistente.cantidad++;
            } else {
                alert("No hay más unidades disponibles.");
                return;
            }

        } else {

            carrito.push({
                id_producto: producto.id_producto,
                nombre: producto.nombre,
                precio: Number(producto.precio),
                stock: producto.stock,
                cantidad: 1
            });

        }

        localStorage.setItem(
            "carrito",
            JSON.stringify(carrito)
        );

        alert(`${producto.nombre} agregado al carrito.`);

    } catch (error) {

        console.error(error);

        alert("No fue posible agregar el producto.");
    }
}

cargarProductos();