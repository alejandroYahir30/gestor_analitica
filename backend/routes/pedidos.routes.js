const express = require("express");
const router = express.Router();

const pool = require("../config/database");


// =====================================================
// CREAR UN NUEVO PEDIDO
// =====================================================

router.post("/", async (req, res) => {

    const {
        nombre,
        telefono,
        productos
    } = req.body;


    if (
        !nombre ||
        !productos ||
        productos.length === 0
    ) {

        return res.status(400).json({

            mensaje:
                "Faltan datos para crear el pedido."

        });

    }


    const conexion =
        await pool.getConnection();


    try {

        await conexion.beginTransaction();


        // =================================================
        // 1. CREAR CLIENTE
        // =================================================

        const [clienteResult] =
            await conexion.query(
                `
                INSERT INTO clientes
                (nombre, telefono)
                VALUES (?, ?)
                `,
                [
                    nombre,
                    telefono || null
                ]
            );


        const idCliente =
            clienteResult.insertId;


        // =================================================
        // 2. OBTENER IDS DE PRODUCTOS
        // =================================================

        const ids =
            productos.map(
                producto =>
                    Number(
                        producto.id_producto
                    )
            );


        const [productosDB] =
            await conexion.query(
                `
                SELECT
                    id_producto,
                    nombre,
                    precio,
                    stock
                FROM productos
                WHERE id_producto IN (?)
                AND activo = TRUE
                FOR UPDATE
                `,
                [ids]
            );


        if (
            productosDB.length !==
            new Set(ids).size
        ) {

            throw new Error(
                "Uno o más productos ya no están disponibles."
            );

        }


        // =================================================
        // 3. PREPARAR DETALLES
        // =================================================

        let total =
            0;


        const detalles =
            [];


        /*
         * Primero validamos todas las cantidades
         * y obtenemos la información real de MySQL.
         */

        for (
            const productoPedido of productos
        ) {

            const productoDB =
                productosDB.find(
                    producto =>
                        Number(
                            producto.id_producto
                        ) ===
                        Number(
                            productoPedido.id_producto
                        )
                );


            if (!productoDB) {

                throw new Error(
                    "Uno o más productos ya no están disponibles."
                );

            }


            const cantidad =
                Number(
                    productoPedido.cantidad
                );


            if (
                !Number.isInteger(
                    cantidad
                ) ||
                cantidad <= 0
            ) {

                throw new Error(
                    "Cantidad de producto inválida."
                );

            }


            if (
                cantidad >
                Number(
                    productoDB.stock
                )
            ) {

                throw new Error(
                    `No hay suficiente stock de ${productoDB.nombre}.`
                );

            }


            detalles.push({

                id_producto:
                    productoDB.id_producto,

                nombre:
                    productoDB.nombre,

                cantidad:
                    cantidad,

                precio_normal:
                    Number(
                        productoDB.precio
                    ),

                precio_unitario:
                    Number(
                        productoDB.precio
                    ),

                subtotal:
                    Number(
                        productoDB.precio
                    ) * cantidad,

                id_oferta:
                    productoPedido.id_oferta
                        ? Number(
                            productoPedido.id_oferta
                        )
                        : null

            });

        }


        // =================================================
        // 4. APLICAR OFERTAS
        // =================================================

        /*
         * Las ofertas se validan completamente desde
         * la base de datos.
         *
         * Nunca confiamos en el precio enviado por
         * el navegador.
         */

        const idsOfertas =
            [
                ...new Set(
                    detalles
                        .filter(
                            detalle =>
                                detalle.id_oferta
                        )
                        .map(
                            detalle =>
                                detalle.id_oferta
                        )
                )
            ];


        for (
            const idOferta of idsOfertas
        ) {

            const [ofertas] =
                await conexion.query(
                    `
                    SELECT

                        id_oferta,

                        id_producto,

                        id_producto_acompanamiento,

                        precio_original,

                        precio_oferta

                    FROM ofertas

                    WHERE id_oferta = ?

                    AND activa = TRUE

                    AND (
                        fecha_fin IS NULL
                        OR fecha_fin >= NOW()
                    )

                    LIMIT 1
                    `,
                    [idOferta]
                );


            if (
                ofertas.length === 0
            ) {

                throw new Error(
                    "La oferta seleccionada ya no está disponible."
                );

            }


            const oferta =
                ofertas[0];


            const detallePrincipal =
                detalles.find(
                    detalle =>
                        Number(
                            detalle.id_producto
                        ) ===
                        Number(
                            oferta.id_producto
                        ) &&
                        Number(
                            detalle.id_oferta
                        ) ===
                        Number(
                            oferta.id_oferta
                        )
                );


            if (!detallePrincipal) {

                throw new Error(
                    "El producto principal de la oferta no está incluido correctamente."
                );

            }


            // =================================================
            // OFERTA DE UN SOLO PRODUCTO
            // =================================================

            if (
                !oferta.id_producto_acompanamiento
            ) {

                const precioOferta =
                    Number(
                        oferta.precio_oferta
                    );


                if (
                    precioOferta <= 0
                ) {

                    throw new Error(
                        "El precio de la oferta no es válido."
                    );

                }


                detallePrincipal.precio_unitario =
                    precioOferta;


                detallePrincipal.subtotal =
                    precioOferta *
                    detallePrincipal.cantidad;


                continue;

            }


            // =================================================
            // OFERTA DE DOS PRODUCTOS
            // =================================================

            const detalleAcompanamiento =
                detalles.find(
                    detalle =>
                        Number(
                            detalle.id_producto
                        ) ===
                        Number(
                            oferta.id_producto_acompanamiento
                        ) &&
                        Number(
                            detalle.id_oferta
                        ) ===
                        Number(
                            oferta.id_oferta
                        )
                );


            if (
                !detalleAcompanamiento
            ) {

                throw new Error(
                    "La oferta requiere que ambos productos estén incluidos en el pedido."
                );

            }


            const cantidadCombos =
                Math.min(
                    detallePrincipal.cantidad,
                    detalleAcompanamiento.cantidad
                );


            if (
                cantidadCombos <= 0
            ) {

                throw new Error(
                    "La cantidad de la oferta no es válida."
                );

            }


            const precioPrincipalNormal =
                Number(
                    detallePrincipal.precio_normal
                );


            const precioAcompanamientoNormal =
                Number(
                    detalleAcompanamiento.precio_normal
                );


            const precioNormalCombo =
                precioPrincipalNormal +
                precioAcompanamientoNormal;


            const precioOfertaCombo =
                Number(
                    oferta.precio_oferta
                );


            if (
                precioNormalCombo <= 0 ||
                precioOfertaCombo <= 0
            ) {

                throw new Error(
                    "Los precios de la oferta no son válidos."
                );

            }


            /*
             * Repartimos proporcionalmente el precio
             * de la oferta entre los dos productos.
             *
             * Ejemplo:
             *
             * Cappuccino     $48
             * Croissant      $35
             * Normal         $83
             * Oferta         $70.55
             *
             * Cappuccino recibe una parte del descuento.
             * Croissant recibe la otra parte.
             *
             * La suma siempre será exactamente $70.55.
             */

            const precioPrincipalOferta =
                (
                    precioPrincipalNormal /
                    precioNormalCombo
                ) *
                precioOfertaCombo;


            const precioAcompanamientoOferta =
                precioOfertaCombo -
                precioPrincipalOferta;


            // =================================================
            // APLICAR PRECIO DE OFERTA A LOS COMBOS
            // =================================================

            detallePrincipal.subtotal =
                (
                    precioPrincipalOferta *
                    cantidadCombos
                ) +
                (
                    precioPrincipalNormal *
                    (
                        detallePrincipal.cantidad -
                        cantidadCombos
                    )
                );


            detalleAcompanamiento.subtotal =
                (
                    precioAcompanamientoOferta *
                    cantidadCombos
                ) +
                (
                    precioAcompanamientoNormal *
                    (
                        detalleAcompanamiento.cantidad -
                        cantidadCombos
                    )
                );


            /*
             * Para mantener correctamente registrado
             * el precio de cada línea:
             *
             * Si todas las unidades forman parte de la
             * oferta, usamos directamente el precio
             * proporcional.
             *
             * Si hay unidades adicionales fuera del combo,
             * calculamos un precio promedio de la línea.
             */

            detallePrincipal.precio_unitario =
                detallePrincipal.subtotal /
                detallePrincipal.cantidad;


            detalleAcompanamiento.precio_unitario =
                detalleAcompanamiento.subtotal /
                detalleAcompanamiento.cantidad;

        }


        // =================================================
        // 5. CALCULAR TOTAL FINAL
        // =================================================

        total =
            detalles.reduce(
                (
                    acumulado,
                    detalle
                ) => {

                    return (
                        acumulado +
                        Number(
                            detalle.subtotal
                        )
                    );

                },
                0
            );


        /*
         * Redondeamos a dos decimales para evitar
         * diferencias causadas por operaciones decimales.
         */

        total =
            Number(
                total.toFixed(2)
            );


        // =================================================
        // 6. OBTENER FECHA Y HORA
        // =================================================

        const ahora =
            new Date();


        const fecha =
            ahora
                .toISOString()
                .split("T")[0];


        const hora =
            ahora
                .toTimeString()
                .split(" ")[0];


        // =================================================
        // 7. CREAR PEDIDO
        // =================================================

        const [pedidoResult] =
            await conexion.query(
                `
                INSERT INTO pedidos
                (
                    id_cliente,
                    fecha_pedido,
                    hora_pedido,
                    total,
                    estado
                )
                VALUES (?, ?, ?, ?, 'pendiente')
                `,
                [
                    idCliente,
                    fecha,
                    hora,
                    total
                ]
            );


        const idPedido =
            pedidoResult.insertId;


        // =================================================
        // 8. CREAR DETALLES DEL PEDIDO
        // =================================================

        for (
            const detalle of detalles
        ) {

            await conexion.query(
                `
                INSERT INTO detalle_pedido
                (
                    id_pedido,
                    id_producto,
                    cantidad,
                    precio_unitario,
                    subtotal
                )
                VALUES (?, ?, ?, ?, ?)
                `,
                [
                    idPedido,

                    detalle.id_producto,

                    detalle.cantidad,

                    Number(
                        detalle.precio_unitario
                    ).toFixed(2),

                    Number(
                        detalle.subtotal
                    ).toFixed(2)

                ]
            );

        }


        // =================================================
        // 9. CONFIRMAR TRANSACCIÓN
        // =================================================

        await conexion.commit();


        // =================================================
        // 10. RESPUESTA
        // =================================================

        res.status(201).json({

            mensaje:
                "Pedido creado correctamente.",

            id_pedido:
                idPedido,

            total:
                total,

            estado:
                "pendiente"

        });


    } catch (error) {

        await conexion.rollback();


        console.error(
            "Error al crear pedido:",
            error
        );


        res.status(500).json({

            mensaje:
                "No fue posible crear el pedido.",

            error:
                error.message

        });


    } finally {

        conexion.release();

    }

});


// =====================================================
// OBTENER TODOS LOS PEDIDOS CON SUS PRODUCTOS
// =====================================================

router.get("/", async (req, res) => {

    try {

        const [pedidos] =
            await pool.query(
                `
                SELECT

                    p.id_pedido,

                    p.fecha_pedido,

                    p.hora_pedido,

                    p.total,

                    p.estado,

                    c.id_cliente,

                    c.nombre AS cliente,

                    c.telefono

                FROM pedidos p

                INNER JOIN clientes c
                    ON p.id_cliente =
                       c.id_cliente

                ORDER BY

                    p.fecha_pedido DESC,

                    p.hora_pedido DESC
                `
            );


        // =================================================
        // OBTENER PRODUCTOS DE CADA PEDIDO
        // =================================================

        for (
            const pedido of pedidos
        ) {

            const [productos] =
                await pool.query(
                    `
                    SELECT

                        dp.id_producto,

                        pr.nombre,

                        dp.cantidad,

                        dp.precio_unitario,

                        dp.subtotal

                    FROM detalle_pedido dp

                    INNER JOIN productos pr
                        ON dp.id_producto =
                           pr.id_producto

                    WHERE dp.id_pedido = ?

                    ORDER BY
                        dp.id_detalle ASC
                    `,
                    [
                        pedido.id_pedido
                    ]
                );


            pedido.productos =
                productos;

        }


        res.json(
            pedidos
        );


    } catch (error) {

        console.error(
            "Error al obtener pedidos:",
            error
        );


        res.status(500).json({

            mensaje:
                "No fue posible obtener los pedidos.",

            error:
                error.message

        });

    }

});


// =====================================================
// CAMBIAR ESTADO DE UN PEDIDO
// =====================================================

router.put("/:id/estado", async (req, res) => {

    const idPedido =
        Number(
            req.params.id
        );


    const { estado } =
        req.body;


    const estadosPermitidos = [

        "pendiente",

        "aceptado",

        "en_preparacion",

        "completado",

        "rechazado"

    ];


    if (
        !Number.isInteger(
            idPedido
        )
    ) {

        return res.status(400).json({

            mensaje:
                "ID de pedido inválido."

        });

    }


    if (
        !estadosPermitidos.includes(
            estado
        )
    ) {

        return res.status(400).json({

            mensaje:
                "Estado de pedido inválido."

        });

    }


    const conexion =
        await pool.getConnection();


    try {

        await conexion.beginTransaction();


        // =================================================
        // 1. OBTENER PEDIDO
        // =================================================

        const [pedidos] =
            await conexion.query(
                `
                SELECT

                    id_pedido,

                    total,

                    estado

                FROM pedidos

                WHERE id_pedido = ?

                FOR UPDATE
                `,
                [
                    idPedido
                ]
            );


        if (
            pedidos.length === 0
        ) {

            await conexion.rollback();

            return res.status(404).json({

                mensaje:
                    "Pedido no encontrado."

            });

        }


        const pedido =
            pedidos[0];


        // =================================================
        // 2. EVITAR COMPLETAR DOS VECES
        // =================================================

        if (
            pedido.estado ===
            "completado"
        ) {

            await conexion.rollback();

            return res.status(400).json({

                mensaje:
                    "Este pedido ya está completado."

            });

        }


        // =================================================
        // 3. SI SE VA A COMPLETAR
        // =================================================

        if (
            estado ===
            "completado"
        ) {


            // =================================================
            // VERIFICAR ESTADO ANTERIOR
            // =================================================

            if (
                pedido.estado !==
                "en_preparacion"
            ) {

                await conexion.rollback();

                return res.status(400).json({

                    mensaje:
                        "El pedido debe estar en preparación antes de completarlo."

                });

            }


            // =================================================
            // OBTENER PRODUCTOS
            // =================================================

            const [detalles] =
                await conexion.query(
                    `
                    SELECT

                        dp.id_producto,

                        dp.cantidad,

                        dp.precio_unitario,

                        dp.subtotal,

                        p.nombre,

                        p.stock

                    FROM detalle_pedido dp

                    INNER JOIN productos p
                        ON dp.id_producto =
                           p.id_producto

                    WHERE dp.id_pedido = ?

                    FOR UPDATE
                    `,
                    [
                        idPedido
                    ]
                );


            if (
                detalles.length === 0
            ) {

                throw new Error(
                    "El pedido no tiene productos."
                );

            }


            // =================================================
            // VERIFICAR STOCK
            // =================================================

            for (
                const detalle of detalles
            ) {

                if (
                    Number(
                        detalle.stock
                    ) <
                    Number(
                        detalle.cantidad
                    )
                ) {

                    throw new Error(

                        `No hay suficiente stock de ${detalle.nombre}.`

                    );

                }

            }


            // =================================================
            // DESCONTAR INVENTARIO
            // =================================================

            for (
                const detalle of detalles
            ) {

                await conexion.query(
                    `
                    UPDATE productos

                    SET stock =
                        stock - ?

                    WHERE id_producto = ?
                    `,
                    [
                        detalle.cantidad,

                        detalle.id_producto
                    ]
                );

            }


            // =================================================
            // REGISTRAR VENTA
            // =================================================

            const ahora =
                new Date();


            const fecha =
                ahora
                    .toISOString()
                    .split("T")[0];


            const hora =
                ahora
                    .toTimeString()
                    .split(" ")[0];


            await conexion.query(
                `
                INSERT INTO ventas
                (
                    id_pedido,
                    fecha_venta,
                    hora_venta,
                    total
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    idPedido,

                    fecha,

                    hora,

                    pedido.total
                ]
            );

        }


        // =================================================
        // 4. ACTUALIZAR ESTADO
        // =================================================

        await conexion.query(
            `
            UPDATE pedidos

            SET estado = ?

            WHERE id_pedido = ?
            `,
            [
                estado,

                idPedido
            ]
        );


        // =================================================
        // 5. CONFIRMAR TODO
        // =================================================

        await conexion.commit();


        res.json({

            mensaje:
                "Estado actualizado correctamente.",

            id_pedido:
                idPedido,

            estado:
                estado

        });


    } catch (error) {

        await conexion.rollback();


        console.error(
            "Error al cambiar estado:",
            error
        );


        res.status(500).json({

            mensaje:
                "No fue posible cambiar el estado.",

            error:
                error.message

        });


    } finally {

        conexion.release();

    }

});


module.exports = router;