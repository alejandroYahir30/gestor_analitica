const API_URL = "http://localhost:3000/api";


// =====================================================
// FORMULARIO DE LOGIN
// =====================================================

const formulario =
    document.getElementById("login-form");

const mensaje =
    document.getElementById("mensaje-login");


formulario.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const usuario =
            document.getElementById("usuario").value.trim();

        const contrasena =
            document.getElementById("contrasena").value;


        mensaje.textContent =
            "Verificando datos...";


        try {

            const respuesta =
                await fetch(
                    `${API_URL}/auth/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            usuario:
                                usuario,

                            contrasena:
                                contrasena

                        })
                    }
                );


            const resultado =
                await respuesta.json();


            if (!respuesta.ok) {

                throw new Error(
                    resultado.mensaje ||
                    "No fue posible iniciar sesión."
                );

            }


            // Guardar información del administrador

            localStorage.setItem(
                "administrador",
                JSON.stringify(
                    resultado.usuario
                )
            );


            mensaje.textContent =
                "Inicio de sesión correcto.";


            // Entrar al panel

            window.location.href =
                "dashboard.html";


        } catch (error) {

            console.error(
                "Error de login:",
                error
            );


            mensaje.textContent =
                error.message;

        }

    }
);