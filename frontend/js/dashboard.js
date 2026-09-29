const API_URL = "/api";

let graficaVentasDia = null;
let graficaProductos = null;
let graficaHora = null;
let graficaAnalisisProductos = null;

let temporizadorOferta = null;


/* ==========================================================================
   CARGAR DASHBOARD
========================================================================== */

async function cargarDashboard() {

    try {

        const respuesta = await fetch(
            `${API_URL}/estadisticas/resumen`
        );

        if (!respuesta.ok) {

            throw new Error(
                "No se pudieron obtener las estadísticas"
            );

        }

        const estadisticas = await respuesta.json();


        /* ==============================================================
           RESUMEN
        ============================================================== */

        document.getElementById(
            "ventas-totales"
        ).textContent =
            `$${Number(
                estadisticas.ventas_totales
            ).toFixed(2)}`;


        document.getElementById(
            "cantidad-pedidos"
        ).textContent =
            estadisticas.cantidad_pedidos;


        document.getElementById(
            "producto-mas-vendido"
        ).textContent =
            estadisticas.producto_mas_vendido
                ? `${estadisticas.producto_mas_vendido.nombre} (${estadisticas.producto_mas_vendido.cantidad})`
                : "Sin datos";


        document.getElementById(
            "dia-mas-ventas"
        ).textContent =
            estadisticas.dia_mas_ventas
                ? formatearFecha(
                    estadisticas.dia_mas_ventas.fecha
                )
                : "Sin datos";


        /* ==============================================================
           GRAFICAS
        ============================================================== */

        crearGraficaVentasPorDia(
            estadisticas.ventas_por_dia
        );

        crearGraficaProductos(
            estadisticas.productos_mas_vendidos
        );

        crearGraficaHora(
            estadisticas.hora_mayor_demanda
        );

    } catch (error) {

        console.error(
            "Error al cargar dashboard:",
            error
        );

    }

}


/* ==========================================================================
   CARGAR OFERTA ACTIVA
========================================================================== */

async function cargarOfertaActiva() {

    const contenedor =
        document.getElementById(
            "oferta-admin-contenido"
        );


    if (!contenedor) {
        return;
    }


    if (temporizadorOferta) {

        clearInterval(
            temporizadorOferta
        );

        temporizadorOferta = null;

    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/ofertas/activa`
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo obtener la oferta activa."
            );

        }


        const oferta =
            await respuesta.json();


        if (!oferta) {

            mostrarOfertaVacia();

            return;

        }


        mostrarOfertaActiva(
            oferta
        );

    } catch (error) {

        console.error(
            "Error al cargar oferta activa:",
            error
        );


        contenedor.innerHTML = `

            <div class="oferta-admin-error">

                <strong>
                    No se pudo cargar la oferta
                </strong>

                <p>
                    Verifica que el servidor
                    esté funcionando correctamente.
                </p>

            </div>

        `;

    }

}


/* ==========================================================================
   MOSTRAR OFERTA VACIA
========================================================================== */

function mostrarOfertaVacia() {

    const contenedor =
        document.getElementById(
            "oferta-admin-contenido"
        );


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML = `

        <div class="oferta-admin-vacia">

            <p>
                No hay una oferta activa actualmente.
            </p>

        </div>

    `;

}


/* ==========================================================================
   MOSTRAR OFERTA ACTIVA
========================================================================== */

function mostrarOfertaActiva(
    oferta
) {

    const contenedor =
        document.getElementById(
            "oferta-admin-contenido"
        );


    if (!contenedor) {
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


    const productoPrincipal =
        oferta.producto_nombre ||
        "Producto principal";


    const productoAcompanamiento =
        oferta.producto_acompanamiento_nombre;


    contenedor.innerHTML = `

        <article class="oferta-admin-card">

            <div class="oferta-admin-info">

                <div class="oferta-admin-cabecera">

                    <div>

                        <span class="oferta-admin-etiqueta">
                            OFERTA ACTIVA
                        </span>

                        <h3>
                            ${oferta.titulo}
                        </h3>

                    </div>

                    <span class="oferta-admin-estado">
                        ACTIVA
                    </span>

                </div>


                <p class="oferta-admin-descripcion">
                    ${oferta.descripcion}
                </p>


                <div class="oferta-admin-productos">

                    <span>
                        ${productoPrincipal}
                    </span>

                    ${
                        productoAcompanamiento
                            ? `
                                <span>
                                    ${productoAcompanamiento}
                                </span>
                            `
                            : ""
                    }

                </div>


                <div class="oferta-admin-precios">

                    <div>

                        <span>
                            Precio normal
                        </span>

                        <strong class="precio-original">
                            $${precioOriginal.toFixed(2)}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Precio de oferta
                        </span>

                        <strong>
                            $${precioOferta.toFixed(2)}
                        </strong>

                    </div>

                </div>

            </div>


            <div class="oferta-admin-control">

                <div class="oferta-admin-contador">

                    <span>
                        TERMINA EN
                    </span>

                    <strong id="contador-oferta">
                        Calculando...
                    </strong>

                </div>


                <button
                    type="button"
                    id="btn-eliminar-oferta"
                    class="btn-eliminar-oferta"
                >
                    Eliminar oferta
                </button>

            </div>

        </article>

    `;


    iniciarContadorOferta(
        oferta.fecha_fin
    );


    const botonEliminar =
        document.getElementById(
            "btn-eliminar-oferta"
        );


    if (botonEliminar) {

        botonEliminar.addEventListener(
            "click",
            () => {

                eliminarOferta(
                    oferta.id_oferta
                );

            }
        );

    }

}


/* ==========================================================================
   CONTADOR DE OFERTA
========================================================================== */

function iniciarContadorOferta(
    fechaFin
) {

    const contador =
        document.getElementById(
            "contador-oferta"
        );


    if (!contador) {
        return;
    }


    if (!fechaFin) {

        contador.textContent =
            "Sin fecha de finalización";

        return;

    }


    function actualizarContador() {

        const ahora =
            new Date();


        const final =
            convertirFechaServidor(
                fechaFin
            );


        const diferencia =
            final.getTime() -
            ahora.getTime();


        if (diferencia <= 0) {

            if (temporizadorOferta) {

                clearInterval(
                    temporizadorOferta
                );

                temporizadorOferta = null;

            }


            contador.textContent =
                "Oferta finalizada";


            setTimeout(
                () => {

                    cargarOfertaActiva();

                },
                1000
            );

            return;

        }


        const segundosTotales =
            Math.floor(
                diferencia / 1000
            );


        const dias =
            Math.floor(
                segundosTotales / 86400
            );


        const horas =
            Math.floor(
                (segundosTotales % 86400) / 3600
            );


        const minutos =
            Math.floor(
                (segundosTotales % 3600) / 60
            );


        const segundos =
            segundosTotales % 60;


        contador.textContent =
            `${dias} días ${horas} h ${minutos} min ${segundos} s`;

    }


    actualizarContador();


    temporizadorOferta =
        setInterval(
            actualizarContador,
            1000
        );

}


/* ==========================================================================
   CONVERTIR FECHA DEL SERVIDOR
========================================================================== */

function convertirFechaServidor(
    fecha
) {

    if (
        typeof fecha !== "string"
    ) {

        return new Date(fecha);

    }


    const fechaNormalizada =
        fecha.includes("T")
            ? fecha
            : fecha.replace(
                " ",
                "T"
            );


    return new Date(
        fechaNormalizada
    );

}


/* ==========================================================================
   ELIMINAR OFERTA
========================================================================== */

async function eliminarOferta(
    idOferta
) {

    const confirmar =
        await confirmarAccion(
            "La oferta dejara de estar activa y ya no aparecera para los clientes."
        );


    if (!confirmar) {
        return;
    }


    const boton =
        document.getElementById(
            "btn-eliminar-oferta"
        );


    if (boton) {

        boton.disabled = true;

        boton.textContent =
            "Eliminando...";

    }


    try {

        const respuesta =
            await fetch(
                `${API_URL}/ofertas/${idOferta}`,
                {
                    method: "DELETE"
                }
            );


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo eliminar la oferta."
            );

        }


        notificacionExito(
            "La oferta fue eliminada correctamente."
        );


        await cargarOfertaActiva();


        const botonPublicar =
            document.getElementById(
                "btn-publicar-oferta"
            );


        if (botonPublicar) {

            botonPublicar.disabled =
                false;

            botonPublicar.textContent =
                "Publicar oferta";

        }

    } catch (error) {

        console.error(
            "Error al eliminar oferta:",
            error
        );


        notificacionError(
            error.message ||
            "No se pudo eliminar la oferta."
        );


        if (boton) {

            boton.disabled =
                false;

            boton.textContent =
                "Eliminar oferta";

        }

    }

}


/* ==========================================================================
   GRAFICA — VENTAS POR DIA
========================================================================== */

function crearGraficaVentasPorDia(
    datos
) {

    const canvas =
        document.getElementById(
            "grafica-ventas-dia"
        );


    if (!canvas) {
        return;
    }


    const contexto =
        canvas.getContext("2d");


    if (graficaVentasDia) {

        graficaVentasDia.destroy();

    }


    graficaVentasDia =
        new Chart(
            contexto,
            {
                type: "line",

                data: {

                    labels:
                        datos.map(
                            dato =>
                                formatearFecha(
                                    dato.fecha
                                )
                        ),

                    datasets: [

                        {
                            label:
                                "Ventas",

                            data:
                                datos.map(
                                    dato =>
                                        Number(
                                            dato.total
                                        )
                                ),

                            tension:
                                0.3,

                            fill:
                                false
                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display:
                                true

                        }

                    }

                }

            }
        );

}


/* ==========================================================================
   GRAFICA — PRODUCTOS MAS VENDIDOS
========================================================================== */

function crearGraficaProductos(
    datos
) {

    const canvas =
        document.getElementById(
            "grafica-productos"
        );


    if (!canvas) {
        return;
    }


    const contexto =
        canvas.getContext("2d");


    if (graficaProductos) {

        graficaProductos.destroy();

    }


    graficaProductos =
        new Chart(
            contexto,
            {
                type: "bar",

                data: {

                    labels:
                        datos.map(
                            producto =>
                                producto.nombre
                        ),

                    datasets: [

                        {
                            label:
                                "Unidades vendidas",

                            data:
                                datos.map(
                                    producto =>
                                        Number(
                                            producto.cantidad
                                        )
                                )

                        }

                    ]

                },

                options: {

                    indexAxis:
                        "y",

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display:
                                true

                        }

                    }

                }

            }
        );

}


/* ==========================================================================
   GRAFICA — DEMANDA POR HORA
========================================================================== */

function crearGraficaHora(
    horaMayorDemanda
) {

    const canvas =
        document.getElementById(
            "grafica-hora"
        );


    if (!canvas) {
        return;
    }


    const contexto =
        canvas.getContext("2d");


    if (graficaHora) {

        graficaHora.destroy();

    }


    if (!horaMayorDemanda) {
        return;
    }


    const hora =
        Number(
            horaMayorDemanda.hora
        );


    const cantidad =
        Number(
            horaMayorDemanda.cantidad
        );


    const horaTexto =
        `${hora
            .toString()
            .padStart(2, "0")}:00`;


    graficaHora =
        new Chart(
            contexto,
            {
                type: "bar",

                data: {

                    labels: [
                        horaTexto
                    ],

                    datasets: [

                        {
                            label:
                                "Ventas realizadas",

                            data: [
                                cantidad
                            ]

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            display:
                                true

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                precision:
                                    0

                            }

                        }

                    }

                }

            }
        );

}


/* ==========================================================================
   PUBLICAR OFERTA
========================================================================== */

async function publicarOferta(
    producto,
    productoAcompanamiento
) {

    if (!producto) {

        notificacionInfo(
            "No hay suficiente información para crear la oferta."
        );

        return;

    }


    const boton =
        document.getElementById(
            "btn-publicar-oferta"
        );


    if (boton) {

        boton.disabled =
            true;

        boton.textContent =
            "Publicando...";

    }


    try {

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


        const productoReal =
            productos.find(
                item =>
                    item.nombre ===
                    producto.nombre
            );


        if (!productoReal) {

            throw new Error(
                `No se encontró el producto ${producto.nombre}.`
            );

        }


        let productoAcompanamientoReal =
            null;


        if (productoAcompanamiento) {

            productoAcompanamientoReal =
                productos.find(
                    item =>
                        item.nombre ===
                        productoAcompanamiento.nombre
                );


            if (!productoAcompanamientoReal) {

                throw new Error(
                    `No se encontró el producto ${productoAcompanamiento.nombre}.`
                );

            }

        }


        const titulo =
            productoAcompanamientoReal
                ? `Combo ${productoReal.nombre} + ${productoAcompanamientoReal.nombre}`
                : `Combo ${productoReal.nombre}`;


        const descripcion =
            productoAcompanamientoReal
                ? `Combinar ${productoReal.nombre} con ${productoAcompanamientoReal.nombre} para crear un combo de consumo rápido.`
                : `Promoción especial con ${productoReal.nombre} como producto principal.`;


        const respuesta =
            await fetch(
                `${API_URL}/ofertas`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            titulo,

                            descripcion,

                            id_producto:
                                productoReal.id_producto,

                            id_producto_acompanamiento:
                                productoAcompanamientoReal
                                    ? productoAcompanamientoReal.id_producto
                                    : null,

                            imagen:
                                productoReal.imagen ||
                                null,

                            fecha_fin:
                                obtenerFinDeSemana()

                        })

                }
            );


        const datos =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje ||
                "No se pudo publicar la oferta."
            );

        }


        notificacionExito(
            "La oferta fue publicada correctamente."
        );


        await cargarOfertaActiva();


        const botonActualizado =
            document.getElementById(
                "btn-publicar-oferta"
            );


        if (botonActualizado) {

            botonActualizado.textContent =
                "Oferta publicada";

            botonActualizado.disabled =
                true;

        }

    } catch (error) {

        console.error(
            "Error al publicar oferta:",
            error
        );


        notificacionError(
            error.message ||
            "No se pudo publicar la oferta."
        );


        if (boton) {

            boton.disabled =
                false;

            boton.textContent =
                "Publicar oferta";

        }

    }

}


/* ==========================================================================
   FECHA DE FINALIZACION DE LA OFERTA
========================================================================== */

function obtenerFinDeSemana() {

    const fecha =
        new Date();


    const dia =
        fecha.getDay();


    let diasHastaDomingo =
        7 - dia;


    if (diasHastaDomingo === 7) {

        diasHastaDomingo =
            0;

    }


    fecha.setDate(
        fecha.getDate() +
        diasHastaDomingo
    );


    fecha.setHours(
        23,
        59,
        59,
        0
    );


    const año =
        fecha.getFullYear();


    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const diaMes =
        String(
            fecha.getDate()
        ).padStart(
            2,
            "0"
        );


    const horas =
        String(
            fecha.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutos =
        String(
            fecha.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const segundos =
        String(
            fecha.getSeconds()
        ).padStart(
            2,
            "0"
        );


    return `${año}-${mes}-${diaMes} ${horas}:${minutos}:${segundos}`;

}


/* ==========================================================================
   ANALISIS INTELIGENTE
========================================================================== */

function generarAnalisisLocal(
    estadisticas
) {

    const resultado =
        document.getElementById(
            "resultado-analisis"
        );


    if (!resultado) {
        return;
    }


    const producto =
        estadisticas.producto_mas_vendido;


    const hora =
        estadisticas.hora_mayor_demanda;


    const ventas =
        Number(
            estadisticas.ventas_totales
        );


    const pedidos =
        Number(
            estadisticas.cantidad_pedidos
        );


    const productos =
        Array.isArray(
            estadisticas.productos_mas_vendidos
        )
            ? estadisticas.productos_mas_vendidos
            : [];


    let productoAcompanamiento =
        null;


    if (productos.length > 1) {

        productoAcompanamiento =
            productos.find(
                item =>
                    producto &&
                    item.nombre !==
                    producto.nombre
            );

    }


    let html = "";


    html += `

        <div class="analisis-dashboard">

            <div class="analisis-metricas">

                <div class="analisis-metrica">

                    <span>
                        PEDIDOS
                    </span>

                    <strong>
                        ${pedidos}
                    </strong>

                    <p>
                        pedidos registrados
                    </p>

                </div>


                <div class="analisis-metrica">

                    <span>
                        VENTAS
                    </span>

                    <strong>
                        $${ventas.toFixed(2)}
                    </strong>

                    <p>
                        ingresos acumulados
                    </p>

                </div>


                <div class="analisis-metrica">

                    <span>
                        PRODUCTO CLAVE
                    </span>

                    <strong>
                        ${
                            producto
                                ? producto.nombre
                                : "Sin datos"
                        }
                    </strong>

                    <p>
                        ${
                            producto
                                ? `${producto.cantidad} unidades vendidas`
                                : "Sin información"
                        }
                    </p>

                </div>

            </div>


            <div class="analisis-principal">

    `;


    if (productos.length > 0) {

        html += `

                <div class="analisis-grafica-card">

                    <div class="analisis-card-header">

                        <div>

                            <span class="analisis-etiqueta">
                                COMPORTAMIENTO
                            </span>

                            <h3>
                                Distribución de productos
                            </h3>

                            <p>
                                Participación de cada producto
                                dentro de las unidades vendidas.
                            </p>

                        </div>

                    </div>


                    <div class="analisis-pastel">

                        <canvas
                            id="grafica-analisis-productos"
                        ></canvas>

                    </div>

                </div>

        `;

    }


    html += `

                <div class="analisis-insight-card">

                    <span class="analisis-etiqueta">
                        PUNTO DE MAYOR ACTIVIDAD
                    </span>

                    <h3>
                        ${
                            hora
                                ? `${hora.hora}:00`
                                : "Sin datos"
                        }
                    </h3>

                    <p class="analisis-insight-numero">

                        ${
                            hora
                                ? `${hora.cantidad} ventas`
                                : "No hay suficientes datos"
                        }

                    </p>

                    <p>

                        ${
                            hora
                                ? "Este es el horario con mayor demanda registrada. Conviene revisar el inventario antes de este periodo."
                                : "Registra más ventas para identificar un horario de mayor demanda."
                        }

                    </p>

                </div>

            </div>


            <div class="analisis-recomendacion">

                <div class="recomendacion-icono">
                    IA
                </div>

                <div class="recomendacion-contenido">

                    <span class="analisis-etiqueta">
                        RECOMENDACIÓN
                    </span>

                    <h3>
                        ${
                            producto
                                ? `Impulsar ${producto.nombre}`
                                : "Generar más datos"
                        }
                    </h3>

                    <p>
                        ${
                            producto
                                ? `El producto con mayor movimiento es ${producto.nombre}, con ${producto.cantidad} unidades vendidas. Se recomienda mantener suficiente inventario y utilizarlo como producto principal en una promoción.`
                                : "Todavía no existen suficientes datos para identificar un producto principal."
                        }
                    </p>

                </div>

            </div>


            <div class="analisis-promocion">

                <div class="promocion-header">

                    <span class="analisis-etiqueta">
                        OFERTA SUGERIDA
                    </span>

                    <span class="promocion-badge">
                        RECOMENDADA
                    </span>

                </div>


                <h3>

                    ${
                        producto
                            ? productoAcompanamiento
                                ? `Combo ${producto.nombre} + ${productoAcompanamiento.nombre}`
                                : `Combo ${producto.nombre}`
                            : "Promoción pendiente"
                    }

                </h3>


                <p>

                    ${
                        producto
                            ? productoAcompanamiento
                                ? `Combinar ${producto.nombre} con ${productoAcompanamiento.nombre} para crear un combo de consumo rápido.`
                                : `Combinar ${producto.nombre} con un producto de acompañamiento, como un producto de panadería.`
                            : "Registra más ventas para generar una promoción específica."
                    }

                </p>


                ${
                    hora
                        ? `

                            <div class="promocion-footer">

                                <span>
                                    Horario sugerido
                                </span>

                                <strong>
                                    ${hora.hora}:00
                                </strong>

                            </div>

                        `
                        : ""
                }


                ${
                    producto
                        ? `

                            <div class="promocion-acciones">

                                <button
                                    type="button"
                                    id="btn-publicar-oferta"
                                    class="btn-publicar-oferta"
                                >
                                    Publicar oferta
                                </button>

                            </div>

                        `
                        : ""
                }

            </div>

        </div>

    `;


    resultado.innerHTML =
        html;


    if (productos.length > 0) {

        crearGraficaAnalisisProductos(
            productos
        );

    }


    const botonPublicar =
        document.getElementById(
            "btn-publicar-oferta"
        );


    if (botonPublicar) {

        botonPublicar.addEventListener(
            "click",
            () => {

                publicarOferta(
                    producto,
                    productoAcompanamiento
                );

            }
        );

    }

}


/* ==========================================================================
   GRAFICA DE PASTEL DEL ANALISIS
========================================================================== */

function crearGraficaAnalisisProductos(
    datos
) {

    const canvas =
        document.getElementById(
            "grafica-analisis-productos"
        );


    if (!canvas) {
        return;
    }


    const contexto =
        canvas.getContext("2d");


    if (graficaAnalisisProductos) {

        graficaAnalisisProductos.destroy();

    }


    graficaAnalisisProductos =
        new Chart(
            contexto,
            {
                type:
                    "doughnut",

                data: {

                    labels:
                        datos.map(
                            producto =>
                                producto.nombre
                        ),

                    datasets: [

                        {

                            data:
                                datos.map(
                                    producto =>
                                        Number(
                                            producto.cantidad
                                        )
                                )

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "62%",

                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                padding:
                                    18

                            }

                        }

                    }

                }

            }
        );

}


/* ==========================================================================
   FORMATEAR FECHA
========================================================================== */

function formatearFecha(
    fecha
) {

    const fechaLocal =
        new Date(fecha);


    return fechaLocal.toLocaleDateString(
        "es-MX",
        {
            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric"
        }
    );

}


/* ==========================================================================
   INICIALIZAR
========================================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarDashboard();

        cargarOfertaActiva();


        const boton =
            document.getElementById(
                "btn-analizar"
            );


        if (boton) {

            boton.addEventListener(
                "click",
                async () => {

                    boton.disabled =
                        true;

                    boton.textContent =
                        "Analizando...";


                    try {

                        const respuesta =
                            await fetch(
                                `${API_URL}/estadisticas/resumen`
                            );


                        if (!respuesta.ok) {

                            throw new Error(
                                "No se pudieron obtener los datos"
                            );

                        }


                        const estadisticas =
                            await respuesta.json();


                        generarAnalisisLocal(
                            estadisticas
                        );


                    } catch (error) {

                        console.error(
                            "Error al generar análisis:",
                            error
                        );


                        const resultado =
                            document.getElementById(
                                "resultado-analisis"
                            );


                        if (resultado) {

                            resultado.innerHTML = `

                                <div class="analisis-error">

                                    <strong>
                                        No se pudo generar el análisis
                                    </strong>

                                    <p>
                                        Verifica que el servidor
                                        esté funcionando correctamente.
                                    </p>

                                </div>

                            `;

                        }

                    } finally {

                        boton.disabled =
                            false;

                        boton.textContent =
                            "Generar análisis";

                    }

                }
            );

        }

    }
);