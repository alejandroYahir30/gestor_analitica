const express = require("express");
const router = express.Router();

const pool = require("../config/database");


// =====================================================
// CREAR UN NUEVO PEDIDO
// =====================================================

router.post("/", async (req, res) => {

    const { nombre, telefono, productos } = req.body;

    if (!nombre || !productos || productos.length === 0) {

        return res.status(400).json({
            mensaje: "Faltan datos para crear el pedido."
        });

    }

    const conexion = await pool.getConnection();

    try {

        await conexion.beginTransaction();


        // 1. Crear cliente

        const [clienteResult] = await conexion.query(
            `
            INSERT INTO clientes
            (nombre, telefono)
            VALUES (?, ?)
            `,
            [nombre, telefono || null]
        );

        const idCliente = clienteResult.insertId;


        // 2. Obtener información actual de los productos

        const ids = productos.map(
            producto => producto.id_producto
        );

        const [productosDB] = await conexion.query(
            `
            SELECT
                id_producto,
                nombre,
                precio,
                stock
            FROM productos
            WHERE id_producto IN (?)
            AND activo = TRUE
            `,
            [ids]
        );


        if (productosDB.length !== productos.length) {

            throw new Error(
                "Uno o más productos ya no están disponibles."
            );

        }


        // 3. Calcular total

        let total = 0;

        const detalles = [];


        for (const productoPedido of productos) {

            const productoDB = productosDB.find(
                producto =>
                    producto.id_producto === productoPedido.id_producto
            );


            const cantidad =
                Number(productoPedido.cantidad);


            if (
                !Number.isInteger(cantidad) ||
                cantidad <= 0
            ) {

                throw new Error(
                    "Cantidad de producto inválida."
                );

            }


            if (cantidad > productoDB.stock) {

                throw new Error(
                    `No hay suficiente stock de ${productoDB.nombre}.`
                );

            }


            const subtotal =
                Number(productoDB.precio) * cantidad;


            total += subtotal;


            detalles.push({

                id_producto: productoDB.id_producto,

                cantidad,

                precio_unitario: productoDB.precio,

                subtotal

            });

        }


        // 4. Obtener fecha y hora

        const ahora = new Date();

        const fecha =
            ahora.toISOString().split("T")[0];

        const hora =
            ahora.toTimeString().split(" ")[0];


        // 5. Crear pedido

        const [pedidoResult] = await conexion.query(
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


        // 6. Crear detalles del pedido

        for (const detalle of detalles) {

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
                    detalle.precio_unitario,
                    detalle.subtotal
                ]
            );

        }


        await conexion.commit();


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

        const [pedidos] = await pool.query(
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
                ON p.id_cliente = c.id_cliente

            ORDER BY
                p.fecha_pedido DESC,
                p.hora_pedido DESC
            `
        );


        // Obtener los productos de cada pedido

        for (const pedido of pedidos) {

            const [productos] = await pool.query(
                `
                SELECT

                    dp.id_producto,

                    pr.nombre,

                    dp.cantidad,

                    dp.precio_unitario,

                    dp.subtotal

                FROM detalle_pedido dp

                INNER JOIN productos pr
                    ON dp.id_producto = pr.id_producto

                WHERE dp.id_pedido = ?

                ORDER BY dp.id_detalle ASC
                `,
                [pedido.id_pedido]
            );


            pedido.productos = productos;

        }


        res.json(pedidos);


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
        Number(req.params.id);

    const { estado } = req.body;


    const estadosPermitidos = [

        "pendiente",

        "aceptado",

        "en_preparacion",

        "completado",

        "rechazado"

    ];


    if (!Number.isInteger(idPedido)) {

        return res.status(400).json({

            mensaje:
                "ID de pedido inválido."

        });

    }


    if (!estadosPermitidos.includes(estado)) {

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
        // 1. OBTENER EL PEDIDO
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
                [idPedido]
            );


        if (pedidos.length === 0) {

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
            pedido.estado === "completado"
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

        if (estado === "completado") {


            // ---------------------------------------------
            // Verificar que esté en preparación
            // ---------------------------------------------

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


            // ---------------------------------------------
            // Obtener productos del pedido
            // ---------------------------------------------

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
                    [idPedido]
                );


            if (detalles.length === 0) {

                throw new Error(
                    "El pedido no tiene productos."
                );

            }


            // ---------------------------------------------
            // Verificar stock
            // ---------------------------------------------

            for (const detalle of detalles) {

                if (
                    Number(detalle.stock) <
                    Number(detalle.cantidad)
                ) {

                    throw new Error(

                        `No hay suficiente stock de ${detalle.nombre}.`

                    );

                }

            }


            // ---------------------------------------------
            // Descontar inventario
            // ---------------------------------------------

            for (const detalle of detalles) {

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


            // ---------------------------------------------
            // Registrar venta
            // ---------------------------------------------

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