const express = require("express");
const router = express.Router();

const pool = require("../config/database");


// =====================================================
// OBTENER TODAS LAS VENTAS
// =====================================================

router.get("/", async (req, res) => {

    try {

        const [ventas] = await pool.query(
            `
            SELECT

                id_venta,

                id_pedido,

                fecha_venta,

                hora_venta,

                total

            FROM ventas

            ORDER BY
                fecha_venta DESC,
                hora_venta DESC
            `
        );


        res.json(ventas);


    } catch (error) {

        console.error(
            "Error al obtener ventas:",
            error
        );


        res.status(500).json({

            mensaje:
                "No fue posible obtener las ventas.",

            error:
                error.message

        });

    }

});


module.exports = router;