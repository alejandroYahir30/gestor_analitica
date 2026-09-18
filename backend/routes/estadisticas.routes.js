
const express = require("express");
const router = express.Router();

const pool = require("../config/database");


// =====================================================
// RESUMEN GENERAL DE ESTADÍSTICAS
// =====================================================

router.get("/resumen", async (req, res) => {

    try {

        // =================================================
        // 1. VENTAS TOTALES
        // =================================================

        const [ventasTotales] =
            await pool.query(`
                SELECT
                    COALESCE(
                        SUM(total),
                        0
                    ) AS total_ventas
                FROM ventas
            `);


        // =================================================
        // 2. PEDIDOS COMPLETADOS
        // =================================================

        const [pedidosCompletados] =
            await pool.query(`
                SELECT
                    COUNT(*) AS cantidad_pedidos
                FROM pedidos
                WHERE estado = 'completado'
            `);


        // =================================================
        // 3. PRODUCTO MÁS VENDIDO
        // =================================================

        const [productoMasVendido] =
            await pool.query(`
                SELECT

                    p.nombre,

                    SUM(dp.cantidad) AS cantidad_vendida

                FROM detalle_pedido dp

                INNER JOIN pedidos pe
                    ON dp.id_pedido = pe.id_pedido

                INNER JOIN productos p
                    ON dp.id_producto = p.id_producto

                WHERE pe.estado = 'completado'

                GROUP BY
                    p.id_producto,
                    p.nombre

                ORDER BY
                    cantidad_vendida DESC

                LIMIT 1
            `);


        // =================================================
        // 4. DÍA CON MÁS VENTAS
        // =================================================

        const [diaMasVentas] =
            await pool.query(`
                SELECT

                    fecha_venta,

                    SUM(total) AS total_dia

                FROM ventas

                GROUP BY
                    fecha_venta

                ORDER BY
                    total_dia DESC

                LIMIT 1
            `);


        // =================================================
        // 5. HORA DE MAYOR DEMANDA
        // =================================================

        const [horaMayorDemanda] =
            await pool.query(`
                SELECT

                    HOUR(hora_venta) AS hora,

                    COUNT(*) AS cantidad_ventas

                FROM ventas

                GROUP BY
                    HOUR(hora_venta)

                ORDER BY
                    cantidad_ventas DESC

                LIMIT 1
            `);


        // =================================================
        // 6. VENTAS POR DÍA
        // =================================================

        const [ventasPorDia] =
            await pool.query(`
                SELECT

                    fecha_venta,

                    SUM(total) AS total_ventas,

                    COUNT(*) AS cantidad_ventas

                FROM ventas

                GROUP BY
                    fecha_venta

                ORDER BY
                    fecha_venta ASC
            `);


        // =================================================
        // 7. PRODUCTOS MÁS VENDIDOS
        // =================================================

        const [productosMasVendidos] =
            await pool.query(`
                SELECT

                    p.nombre,

                    SUM(dp.cantidad) AS cantidad_vendida,

                    SUM(dp.subtotal) AS total_generado

                FROM detalle_pedido dp

                INNER JOIN pedidos pe
                    ON dp.id_pedido = pe.id_pedido

                INNER JOIN productos p
                    ON dp.id_producto = p.id_producto

                WHERE pe.estado = 'completado'

                GROUP BY
                    p.id_producto,
                    p.nombre

                ORDER BY
                    cantidad_vendida DESC
            `);


        // =================================================
        // 8. DÍAS DE SEMANA VS FIN DE SEMANA
        // =================================================

        const [tipoDia] =
            await pool.query(`
                SELECT

                    CASE

                        WHEN DAYOFWEEK(fecha_venta)
                            IN (1, 7)

                        THEN 'Fin de semana'

                        ELSE 'Día de semana'

                    END AS tipo_dia,

                    SUM(total) AS total_ventas,

                    COUNT(*) AS cantidad_ventas

                FROM ventas

                GROUP BY
                    tipo_dia

                ORDER BY
                    tipo_dia
            `);


        // =================================================
        // RESPUESTA
        // =================================================

        res.json({

            ventas_totales:
                Number(
                    ventasTotales[0].total_ventas
                ),


            cantidad_pedidos:
                Number(
                    pedidosCompletados[0]
                        .cantidad_pedidos
                ),


            producto_mas_vendido:
                productoMasVendido.length > 0
                    ? {

                        nombre:
                            productoMasVendido[0]
                                .nombre,

                        cantidad:
                            Number(
                                productoMasVendido[0]
                                    .cantidad_vendida
                            )

                    }
                    : null,


            dia_mas_ventas:
                diaMasVentas.length > 0
                    ? {

                        fecha:
                            diaMasVentas[0]
                                .fecha_venta,

                        total:
                            Number(
                                diaMasVentas[0]
                                    .total_dia
                            )

                    }
                    : null,


            hora_mayor_demanda:
                horaMayorDemanda.length > 0
                    ? {

                        hora:
                            Number(
                                horaMayorDemanda[0]
                                    .hora
                            ),

                        cantidad:
                            Number(
                                horaMayorDemanda[0]
                                    .cantidad_ventas
                            )

                    }
                    : null,


            ventas_por_dia:
                ventasPorDia.map(venta => ({

                    fecha:
                        venta.fecha_venta,

                    total:
                        Number(
                            venta.total_ventas
                        ),

                    cantidad:
                        Number(
                            venta.cantidad_ventas
                        )

                })),


            productos_mas_vendidos:
                productosMasVendidos.map(producto => ({

                    nombre:
                        producto.nombre,

                    cantidad:
                        Number(
                            producto.cantidad_vendida
                        ),

                    total:
                        Number(
                            producto.total_generado
                        )

                })),


            semana_vs_fin_de_semana:
                tipoDia.map(dia => ({

                    tipo:
                        dia.tipo_dia,

                    total:
                        Number(
                            dia.total_ventas
                        ),

                    cantidad:
                        Number(
                            dia.cantidad_ventas
                        )

                }))

        });


    } catch (error) {

        console.error(
            "Error al obtener estadísticas:",
            error
        );


        res.status(500).json({

            mensaje:
                "No fue posible obtener las estadísticas.",

            error:
                error.message

        });

    }

});


module.exports = router;

