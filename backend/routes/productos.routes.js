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
                imagen,
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
            mensaje: "Error al obtener los productos",
            error: error.message
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
            stock_minimo,
            imagen
        } = req.body;


        if (
            !nombre ||
            !categoria ||
            precio === undefined ||
            stock === undefined ||
            !imagen
        ) {

            return res.status(400).json({
                mensaje:
                    "Nombre, categoría, precio, stock e imagen son obligatorios."
            });

        }


        const precioNumero =
            Number(precio);

        const stockNumero =
            Number(stock);

        const stockMinimoNumero =
            stock_minimo === undefined ||
            stock_minimo === ""
                ? 5
                : Number(stock_minimo);


        if (
            Number.isNaN(precioNumero) ||
            precioNumero < 0
        ) {

            return res.status(400).json({
                mensaje: "El precio no es válido."
            });

        }


        if (
            Number.isNaN(stockNumero) ||
            stockNumero < 0
        ) {

            return res.status(400).json({
                mensaje: "El stock no es válido."
            });

        }


        if (
            Number.isNaN(stockMinimoNumero) ||
            stockMinimoNumero < 0
        ) {

            return res.status(400).json({
                mensaje: "El stock mínimo no es válido."
            });

        }


        const imagenTexto =
            imagen.trim();


        if (!imagenTexto) {

            return res.status(400).json({
                mensaje:
                    "La imagen del producto es obligatoria."
            });

        }


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
                    imagen,
                    activo
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
                `,
                [
                    nombre.trim(),
                    categoria.trim(),
                    descripcion
                        ? descripcion.trim()
                        : null,
                    precioNumero,
                    stockNumero,
                    stockMinimoNumero,
                    imagenTexto
                ]
            );


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
                    imagen,
                    activo,
                    fecha_registro
                FROM productos
                WHERE id_producto = ?
                `,
                [
                    resultado.insertId
                ]
            );


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


// =====================================================
// EDITAR PRODUCTO
// =====================================================

router.put("/:id", async (req, res) => {

    try {

        const idProducto =
            Number(req.params.id);


        if (
            Number.isNaN(idProducto)
        ) {

            return res.status(400).json({
                mensaje:
                    "El ID del producto no es válido."
            });

        }


        const {
            nombre,
            categoria,
            descripcion,
            precio,
            stock,
            stock_minimo,
            imagen
        } = req.body;


        if (
            !nombre ||
            !categoria ||
            precio === undefined ||
            stock === undefined ||
            !imagen
        ) {

            return res.status(400).json({
                mensaje:
                    "Nombre, categoría, precio, stock e imagen son obligatorios."
            });

        }


        const precioNumero =
            Number(precio);

        const stockNumero =
            Number(stock);

        const stockMinimoNumero =
            stock_minimo === undefined ||
            stock_minimo === ""
                ? 5
                : Number(stock_minimo);


        if (
            Number.isNaN(precioNumero) ||
            precioNumero < 0
        ) {

            return res.status(400).json({
                mensaje:
                    "El precio no es válido."
            });

        }


        if (
            Number.isNaN(stockNumero) ||
            stockNumero < 0
        ) {

            return res.status(400).json({
                mensaje:
                    "El stock no es válido."
            });

        }


        if (
            Number.isNaN(stockMinimoNumero) ||
            stockMinimoNumero < 0
        ) {

            return res.status(400).json({
                mensaje:
                    "El stock mínimo no es válido."
            });

        }


        const imagenTexto =
            imagen.trim();


        if (!imagenTexto) {

            return res.status(400).json({
                mensaje:
                    "La imagen del producto es obligatoria."
            });

        }


        const [resultado] =
            await pool.query(
                `
                UPDATE productos
                SET
                    nombre = ?,
                    categoria = ?,
                    descripcion = ?,
                    precio = ?,
                    stock = ?,
                    stock_minimo = ?,
                    imagen = ?
                WHERE id_producto = ?
                AND activo = TRUE
                `,
                [
                    nombre.trim(),
                    categoria.trim(),
                    descripcion
                        ? descripcion.trim()
                        : null,
                    precioNumero,
                    stockNumero,
                    stockMinimoNumero,
                    imagenTexto,
                    idProducto
                ]
            );


        if (
            resultado.affectedRows === 0
        ) {

            return res.status(404).json({
                mensaje:
                    "Producto no encontrado."
            });

        }


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
                    imagen,
                    activo,
                    fecha_registro
                FROM productos
                WHERE id_producto = ?
                `,
                [
                    idProducto
                ]
            );


        res.json({
            mensaje:
                "Producto actualizado correctamente.",
            producto:
                producto[0]
        });


    } catch (error) {

        console.error(
            "Error al editar producto:",
            error
        );

        res.status(500).json({
            mensaje:
                "Error al editar el producto.",
            error:
                error.message
        });

    }

});


// =====================================================
// ELIMINAR PRODUCTO
// =====================================================

router.delete("/:id", async (req, res) => {

    try {

        const idProducto =
            Number(req.params.id);


        if (
            Number.isNaN(idProducto)
        ) {

            return res.status(400).json({
                mensaje:
                    "El ID del producto no es válido."
            });

        }


        const [resultado] =
            await pool.query(
                `
                UPDATE productos
                SET activo = FALSE
                WHERE id_producto = ?
                AND activo = TRUE
                `,
                [
                    idProducto
                ]
            );


        if (
            resultado.affectedRows === 0
        ) {

            return res.status(404).json({
                mensaje:
                    "Producto no encontrado."
            });

        }


        res.json({
            mensaje:
                "Producto eliminado correctamente."
        });


    } catch (error) {

        console.error(
            "Error al eliminar producto:",
            error
        );

        res.status(500).json({
            mensaje:
                "Error al eliminar el producto.",
            error:
                error.message
        });

    }

});


module.exports = router;