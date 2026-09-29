const express = require("express");
const router = express.Router();
const pool = require("../config/database");


/* ==========================================================================
   OBTENER OFERTA ACTIVA
========================================================================== */

router.get("/activa", async (req, res) => {

    try {

        const [ofertas] = await pool.query(`
            SELECT
                o.id_oferta,
                o.titulo,
                o.descripcion,
                o.id_producto,
                o.id_producto_acompanamiento,
                o.imagen,
                o.precio_original,
                o.precio_oferta,
                o.activa,
                o.fecha_inicio,
                o.fecha_fin,
                o.fecha_creacion,

                p.nombre AS producto_nombre,

                pa.nombre AS producto_acompanamiento_nombre

            FROM ofertas o

            LEFT JOIN productos p
                ON o.id_producto = p.id_producto

            LEFT JOIN productos pa
                ON o.id_producto_acompanamiento =
                   pa.id_producto

            WHERE o.activa = TRUE

            AND (
                o.fecha_fin IS NULL
                OR o.fecha_fin >= NOW()
            )

            ORDER BY o.fecha_creacion DESC

            LIMIT 1
        `);


        if (ofertas.length === 0) {

            return res.json(null);

        }


        res.json(
            ofertas[0]
        );


    } catch (error) {

        console.error(
            "Error al obtener oferta activa:",
            error
        );


        res.status(500).json({

            mensaje:
                "Error al obtener la oferta.",

            error:
                error.message

        });

    }

});


/* ==========================================================================
   PUBLICAR OFERTA
========================================================================== */

router.post("/", async (req, res) => {

    try {

        const {
            titulo,
            descripcion,
            id_producto,
            id_producto_acompanamiento,
            imagen,
            fecha_fin
        } = req.body;


        if (!titulo || !descripcion) {

            return res.status(400).json({

                mensaje:
                    "El título y la descripción son obligatorios."

            });

        }


        /* ==============================================================
           OBTENER PRECIO DEL PRODUCTO PRINCIPAL
        ============================================================== */

        let precioOriginal = 0;


        if (id_producto) {

            const [producto] =
                await pool.query(

                    `
                    SELECT
                        precio
                    FROM productos
                    WHERE id_producto = ?
                    `,

                    [id_producto]

                );


            if (producto.length > 0) {

                precioOriginal +=
                    Number(
                        producto[0].precio
                    );

            }

        }


        /* ==============================================================
           OBTENER PRECIO DEL PRODUCTO DE ACOMPAÑAMIENTO
        ============================================================== */

        if (id_producto_acompanamiento) {

            const [productoAcompanamiento] =
                await pool.query(

                    `
                    SELECT
                        precio
                    FROM productos
                    WHERE id_producto = ?
                    `,

                    [id_producto_acompanamiento]

                );


            if (
                productoAcompanamiento.length > 0
            ) {

                precioOriginal +=
                    Number(
                        productoAcompanamiento[0].precio
                    );

            }

        }


        /* ==============================================================
           CALCULAR DESCUENTO DEL 15%
        ============================================================== */

        const precioOferta =
            precioOriginal * 0.85;


        /* ==============================================================
           DESACTIVAR OFERTAS ANTERIORES
        ============================================================== */

        await pool.query(`
            UPDATE ofertas
            SET activa = FALSE
            WHERE activa = TRUE
        `);


        /* ==============================================================
           CREAR NUEVA OFERTA
        ============================================================== */

        const [resultado] =
            await pool.query(

                `
                INSERT INTO ofertas (
                    titulo,
                    descripcion,
                    id_producto,
                    id_producto_acompanamiento,
                    imagen,
                    precio_original,
                    precio_oferta,
                    activa,
                    fecha_inicio,
                    fecha_fin
                )

                VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    TRUE,
                    NOW(),
                    ?
                )
                `,

                [

                    titulo.trim(),

                    descripcion.trim(),

                    id_producto || null,

                    id_producto_acompanamiento || null,

                    imagen || null,

                    precioOriginal,

                    precioOferta,

                    fecha_fin || null

                ]

            );


        /* ==============================================================
           OBTENER OFERTA CREADA
        ============================================================== */

        const [oferta] =
            await pool.query(

                `
                SELECT
                    id_oferta,
                    titulo,
                    descripcion,
                    id_producto,
                    id_producto_acompanamiento,
                    imagen,
                    precio_original,
                    precio_oferta,
                    activa,
                    fecha_inicio,
                    fecha_fin,
                    fecha_creacion
                FROM ofertas
                WHERE id_oferta = ?
                `,

                [resultado.insertId]

            );


        res.status(201).json({

            mensaje:
                "Oferta publicada correctamente.",

            oferta:
                oferta[0]

        });


    } catch (error) {

        console.error(
            "Error al publicar oferta:",
            error
        );


        res.status(500).json({

            mensaje:
                "Error al publicar la oferta.",

            error:
                error.message

        });

    }

});


/* ==========================================================================
   DESACTIVAR OFERTA
========================================================================== */

router.delete("/:id", async (req, res) => {

    try {

        const idOferta =
            Number(
                req.params.id
            );


        if (
            Number.isNaN(
                idOferta
            )
        ) {

            return res.status(400).json({

                mensaje:
                    "El ID de la oferta no es válido."

            });

        }


        const [resultado] =
            await pool.query(

                `
                UPDATE ofertas

                SET activa = FALSE

                WHERE id_oferta = ?

                AND activa = TRUE
                `,

                [idOferta]

            );


        if (
            resultado.affectedRows === 0
        ) {

            return res.status(404).json({

                mensaje:
                    "Oferta no encontrada."

            });

        }


        res.json({

            mensaje:
                "Oferta eliminada correctamente."

        });


    } catch (error) {

        console.error(
            "Error al eliminar oferta:",
            error
        );


        res.status(500).json({

            mensaje:
                "Error al eliminar la oferta.",

            error:
                error.message

        });

    }

});


module.exports = router;