const express = require("express");
const router = express.Router();

const pool = require("../config/database");


// =====================================================
// INICIAR SESIÓN
// =====================================================

router.post("/login", async (req, res) => {

    const { usuario, contrasena } = req.body;


    // Verificar que lleguen los datos

    if (!usuario || !contrasena) {

        return res.status(400).json({

            mensaje:
                "Ingresa usuario y contraseña."

        });

    }


    try {

        // Buscar usuario en MySQL

        const [usuarios] = await pool.query(
            `
            SELECT
                id_usuario,
                nombre,
                usuario,
                contrasena,
                rol,
                activo
            FROM usuarios
            WHERE usuario = ?
            LIMIT 1
            `,
            [usuario]
        );


        // Usuario no encontrado

        if (usuarios.length === 0) {

            return res.status(401).json({

                mensaje:
                    "Usuario o contraseña incorrectos."

            });

        }


        const administrador =
            usuarios[0];


        // Verificar si está activo

        if (!administrador.activo) {

            return res.status(403).json({

                mensaje:
                    "Este usuario está desactivado."

            });

        }


        // Verificar contraseña

        if (
            administrador.contrasena !==
            contrasena
        ) {

            return res.status(401).json({

                mensaje:
                    "Usuario o contraseña incorrectos."

            });

        }


        // Login correcto

        res.json({

            mensaje:
                "Inicio de sesión correcto.",

            usuario: {

                id_usuario:
                    administrador.id_usuario,

                nombre:
                    administrador.nombre,

                usuario:
                    administrador.usuario,

                rol:
                    administrador.rol

            }

        });


    } catch (error) {

        console.error(
            "Error al iniciar sesión:",
            error
        );


        res.status(500).json({

            mensaje:
                "No fue posible iniciar sesión.",

            error:
                error.message

        });

    }

});


module.exports = router;