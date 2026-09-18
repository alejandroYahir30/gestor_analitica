const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/database");

const productosRoutes = require("./routes/productos.routes");
const pedidosRoutes = require("./routes/pedidos.routes");
const authRoutes = require("./routes/auth.routes");
const ventasRoutes = require("./routes/ventas.routes");
const estadisticasRoutes = require("./routes/estadisticas.routes");

const app = express();
const PORT = 3000;


// =====================================================
// MIDDLEWARES
// =====================================================

app.use(cors());
app.use(express.json());


// =====================================================
// RUTAS DE LA API
// =====================================================

app.use("/api/productos", productosRoutes);

app.use("/api/pedidos", pedidosRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/ventas", ventasRoutes);

app.use(
    "/api/estadisticas",
    estadisticasRoutes
);

// =====================================================
// RUTA PRINCIPAL
// =====================================================

app.get("/", (req, res) => {

    res.json({

        mensaje:
            "Servidor de Analytia funcionando correctamente"

    });

});


// =====================================================
// RUTA PARA PROBAR MYSQL
// =====================================================

app.get("/api/prueba-db", async (req, res) => {

    try {

        const [resultado] = await pool.query(
            "SELECT 1 AS conexion"
        );


        res.json({

            mensaje:
                "Conexión con MySQL exitosa",

            resultado

        });


    } catch (error) {

        console.error(
            "Error de conexión:",
            error
        );


        res.status(500).json({

            mensaje:
                "Error al conectar con MySQL",

            error:
                error.message

        });

    }

});


// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, () => {

    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );

});