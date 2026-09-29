// =====================================================
// CAFÉ NÉBULA — SISTEMA DE NOTIFICACIONES
// =====================================================

function mostrarNotificacion(mensaje, tipo = "info", duracion = 4000) {

    let contenedor =
        document.getElementById("contenedor-notificaciones");

    if (!contenedor) {

        contenedor = document.createElement("div");

        contenedor.id =
            "contenedor-notificaciones";

        contenedor.className =
            "contenedor-notificaciones";

        document.body.appendChild(contenedor);
    }


    const notificacion =
        document.createElement("div");

    notificacion.className =
        `notificacion notificacion-${tipo}`;


    const contenido =
        document.createElement("div");

    contenido.className =
        "notificacion-contenido";


    const texto =
        document.createElement("p");

    texto.className =
        "notificacion-mensaje";

    texto.textContent =
        mensaje;


    const cerrar =
        document.createElement("button");

    cerrar.type =
        "button";

    cerrar.className =
        "notificacion-cerrar";

    cerrar.setAttribute(
        "aria-label",
        "Cerrar notificación"
    );

    cerrar.innerHTML =
        "&times;";


    cerrar.addEventListener(
        "click",
        () => cerrarNotificacion(notificacion)
    );


    contenido.appendChild(texto);

    notificacion.appendChild(contenido);

    notificacion.appendChild(cerrar);

    contenedor.appendChild(notificacion);


    requestAnimationFrame(() => {

        notificacion.classList.add(
            "notificacion-visible"
        );

    });


    const temporizador =
        setTimeout(
            () => cerrarNotificacion(notificacion),
            duracion
        );


    notificacion._temporizador =
        temporizador;
}


// =====================================================
// CERRAR NOTIFICACIÓN
// =====================================================

function cerrarNotificacion(notificacion) {

    if (!notificacion) return;


    if (notificacion._temporizador) {

        clearTimeout(
            notificacion._temporizador
        );

    }


    notificacion.classList.remove(
        "notificacion-visible"
    );


    notificacion.classList.add(
        "notificacion-saliendo"
    );


    setTimeout(() => {

        notificacion.remove();

    }, 300);
}


// =====================================================
// ATAJOS
// =====================================================

function notificacionExito(mensaje) {

    mostrarNotificacion(
        mensaje,
        "exito"
    );

}


function notificacionInfo(mensaje) {

    mostrarNotificacion(
        mensaje,
        "info"
    );

}


function notificacionError(mensaje) {

    mostrarNotificacion(
        mensaje,
        "error"
    );

}

// =====================================================
// MODAL DE CONFIRMACIÓN
// =====================================================

function confirmarAccion(mensaje) {

    return new Promise(resolve => {

        let modal =
            document.getElementById(
                "modal-confirmacion"
            );


        if (!modal) {

            modal =
                document.createElement("div");

            modal.id =
                "modal-confirmacion";

            modal.className =
                "modal-confirmacion";

            modal.innerHTML = `

                <div class="modal-confirmacion-contenido">

                    <div class="modal-confirmacion-texto">

                        <span class="modal-confirmacion-etiqueta">
                            CONFIRMAR ACCIÓN
                        </span>

                        <h2>
                            ¿Deseas continuar?
                        </h2>

                        <p id="modal-confirmacion-mensaje"></p>

                    </div>


                    <div class="modal-confirmacion-acciones">

                        <button
                            type="button"
                            class="modal-btn-cancelar"
                            id="modal-confirmacion-cancelar"
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            class="modal-btn-confirmar"
                            id="modal-confirmacion-aceptar"
                        >
                            Eliminar
                        </button>

                    </div>

                </div>

            `;

            document.body.appendChild(modal);

        }


        const texto =
            document.getElementById(
                "modal-confirmacion-mensaje"
            );

        const btnCancelar =
            document.getElementById(
                "modal-confirmacion-cancelar"
            );

        const btnAceptar =
            document.getElementById(
                "modal-confirmacion-aceptar"
            );


        texto.textContent =
            mensaje;


        modal.classList.add(
            "modal-confirmacion-visible"
        );


        function cerrar(resultado) {

            modal.classList.remove(
                "modal-confirmacion-visible"
            );

            btnCancelar.removeEventListener(
                "click",
                cancelar
            );

            btnAceptar.removeEventListener(
                "click",
                aceptar
            );

            resolve(resultado);

        }


        function cancelar() {
            cerrar(false);
        }


        function aceptar() {
            cerrar(true);
        }


        btnCancelar.addEventListener(
            "click",
            cancelar
        );

        btnAceptar.addEventListener(
            "click",
            aceptar
        );

    });

}