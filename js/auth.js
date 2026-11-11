/**
 * AUTH.JS - AutoTech
 * Control de Inicio/Cierre de Sesión y actualización del Menú (Navbar)
 */

// Botones de acceso rápido para demostración rápida en exposición
function cargarPrueba(tipo) {
    const loginEmail = document.getElementById("loginEmail");
    const loginPass = document.getElementById("loginPass");
    if (!loginEmail || !loginPass) return;

    if (tipo === 'carlos') {
        loginEmail.value = "carlos@autotech.com";
        loginPass.value = "123";
    } else if (tipo === 'maria') {
        loginEmail.value = "maria@autotech.com";
        loginPass.value = "123";
    } else if (tipo === 'admin') {
        loginEmail.value = "admin@autotech.com";
        loginPass.value = "admin";
    }
}

// Cerrar sesión
function cerrarSesion() {
    eliminarSesion();
    renderizarNavbarSesion(); // Restablece el header inmediatamente
    if (typeof Swal !== "undefined") {
        Swal.fire({
            icon: "info",
            title: "Sesión cerrada",
            text: "Has salido del sistema",
            timer: 1000,
            showConfirmButton: false
        }).then(() => {
            window.location.href = "panel.html";
        });
    } else {
        window.location.href = "panel.html";
    }
}

// Actualizar barra de navegación superior en todas las páginas
function renderizarNavbarSesion() {
    const navUsuarioInfo = document.getElementById("navUsuarioInfo");
    if (!navUsuarioInfo) return;

    const sesion = obtenerSesion();
    if (sesion) {
        navUsuarioInfo.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <a href="panel.html" class="btn btn-outline-warning btn-sm fw-semibold">
                    <i class="bi bi-person-check-fill"></i> ${sesion.nombre.split(' ')[0]} (${sesion.rol})
                </a>
                <button class="btn btn-danger btn-sm" onclick="cerrarSesion()" title="Cerrar Sesión">
                    <i class="bi bi-box-arrow-right"></i> Salir
                </button>
            </div>
        `;
    } else {
        navUsuarioInfo.innerHTML = `
            <a href="panel.html" class="btn btn-outline-warning btn-sm">
                <i class="bi bi-person-circle"></i> Iniciar Sesión / Mi Cuenta
            </a>
        `;
    }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", function () {
    renderizarNavbarSesion();

    // Procesar formulario de Login (si estamos en la página panel.html)
    const formLogin = document.getElementById("formLogin");
    if (formLogin) {
        formLogin.addEventListener("submit", function (e) {
            e.preventDefault();

            const email = document.getElementById("loginEmail").value.trim().toLowerCase();
            const pass = document.getElementById("loginPass").value.trim();

            const usuarios = obtenerUsuarios();
            const usuarioValido = usuarios.find(u => u.email === email && u.pass === pass);

            if (usuarioValido) {
                guardarSesion(usuarioValido);
                renderizarNavbarSesion(); // Actualizar el header inmediatamente sin recargar
                Swal.fire({
                    icon: "success",
                    title: `¡Bienvenido, ${usuarioValido.nombre}!`,
                    text: `Rol: ${usuarioValido.rol}`,
                    timer: 1200,
                    showConfirmButton: false
                }).then(() => {
                    renderizarNavbarSesion();
                    if (typeof inicializarPanel === "function") {
                        inicializarPanel();
                    } else {
                        window.location.reload();
                    }
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Acceso Denegado",
                    text: "Correo electrónico o contraseña incorrectos."
                });
            }
        });
    }
});
