// =====================================================
// PROTECCIÓN DEL PANEL DE ADMINISTRACIÓN
// =====================================================

const administrador =
    localStorage.getItem("administrador");


// =====================================================
// VERIFICAR SESIÓN
// =====================================================

if (!administrador) {

    window.location.href =
        "../admin/login.html";

}