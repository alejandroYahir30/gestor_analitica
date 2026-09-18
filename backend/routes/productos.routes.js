const express = require("express");
const router = express.Router();

const pool = require("../config/database");

// Obtener todos los productos activos
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
                activo
            FROM productos
            WHERE activo = TRUE
            ORDER BY nombre ASC
        `);

        res.json(productos);

    } catch (error) {
        console.error("Error al obtener productos:", error);

        res.status(500).json({
            mensaje: "Error al obtener los productos",
            error: error.message
        });
    }
});

module.exports = router;