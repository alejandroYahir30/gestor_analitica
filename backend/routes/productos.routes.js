const express = require("express");
const router = express.Router();
const pool = require("../config/database");


// =====================================================
// OBTENER PRODUCTOS
// =====================================================

router.get("/", async (req, res) => {

    try {

        const [productos] = await pool.query(`
            SELECT
                id_producto,
                nombre,
                categoria,
                descripcion,
                precio,
                stock,
                stock_minimo,
                activo,
                fecha_registro
            FROM productos
            WHERE activo = TRUE
            ORDER BY nombre ASC
        `);


        res.json(productos);


    } catch (error) {

        console.error(
            "Error al obtener productos:",
            error
        );


        res.status(500).json({

            mensaje:
                "Error al obtener los productos",

            error:
                error.message

        });

    }

});


// =====================================================
// AGREGAR PRODUCTO
// =====================================================

router.post("/", async (req, res) => {

    try {

        const {
            nombre,
            categoria,
            descripcion,
            precio,
            stock,
            stock_minimo
        } = req.body;


        // =================================================
        // VALIDAR CAMPOS OBLIGATORIOS
        // =================================================

        if (
            !nombre ||
            !categoria ||
            precio === undefined ||
            stock === undefined
        ) {

            return res.status(400).json({

                mensaje:
                    "Nombre, categoría, precio y stock son obligatorios."

            });

        }


        // =================================================
        // CONVERTIR VALORES
        // =================================================

        const precioNumero =
            Number(precio);


        const stockNumero =
            Number(stock);


        const stockMinimoNumero =
            stock_minimo === undefined ||
            stock_minimo === ""
                ? 5
                : Number(stock_minimo);


        // =================================================
        // VALIDAR PRECIO
        // =================================================

        if (
            Number.isNaN(precioNumero) ||
            precioNumero < 0
        ) {

            return res.status(400).json({

                mensaje:
                    "El precio no es válido."

            });

        }


        // =================================================
        // VALIDAR STOCK
        // =================================================

        if (
            Number.isNaN(stockNumero) ||
            stockNumero < 0
        ) {

            return res.status(400).json({

                mensaje:
                    "El stock no es válido."

            });

        }


        // =================================================
        // VALIDAR STOCK MÍNIMO
        // =================================================

        if (
            Number.isNaN(stockMinimoNumero) ||
            stockMinimoNumero < 0
        ) {

            return res.status(400).json({

                mensaje:
                    "El stock mínimo no es válido."

            });

        }


        // =================================================
        // INSERTAR PRODUCTO
        // =================================================

        const [resultado] =
            await pool.query(
                `
                INSERT INTO productos (
                    nombre,
                    categoria,
                    descripcion,
                    precio,
                    stock,
                    stock_minimo,
                    activo
                )
                VALUES (?, ?, ?, ?, ?, ?, TRUE)
                `,
                [
                    nombre.trim(),
                    categoria.trim(),
                    descripcion
                        ? descripcion.trim()
                        : null,
                    precioNumero,
                    stockNumero,
                    stockMinimoNumero
                ]
            );


        // =================================================
        // OBTENER PRODUCTO RECIÉN CREADO
        // =================================================

        const [producto] =
            await pool.query(
                `
                SELECT
                    id_producto,
                    nombre,
                    categoria,
                    descripcion,
                    precio,
                    stock,
                    stock_minimo,
                    activo,
                    fecha_registro
                FROM productos
                WHERE id_producto = ?
                `,
                [
                    resultado.insertId
                ]
            );


        // =================================================
        // RESPUESTA
        // =================================================

        res.status(201).json({

            mensaje:
                "Producto agregado correctamente.",

            producto:
                producto[0]

        });


    } catch (error) {

        console.error(
            "Error al agregar producto:",
            error
        );


        res.status(500).json({

            mensaje:
                "Error al agregar el producto.",

            error:
                error.message

        });

    }

});


module.exports = router;