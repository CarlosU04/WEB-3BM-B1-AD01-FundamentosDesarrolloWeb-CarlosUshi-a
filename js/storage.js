/**
 * STORAGE.JS - AUTOFIX EVOL
 * Manejo de datos iniciales y persistencia con LocalStorage
 */

// 1. Usuarios predeterminados del sistema
const USUARIOS_BASE = [
    { email: "carlos@autofix.com", pass: "123", nombre: "Carlos Ushiña", telefono: "0991234567", rol: "Cliente" },
    { email: "maria@autofix.com", pass: "123", nombre: "María Morales", telefono: "0987654321", rol: "Cliente" },
    { email: "admin@autofix.com", pass: "123", nombre: "Administrador General", telefono: "0990001122", rol: "Administrador" }
];

// 2. Citas iniciales para pruebas
const CITAS_BASE = [
    {
        id: "C-101",
        nombre: "Carlos Ushiña",
        email: "carlos@autofix.com",
        telefono: "0991234567",
        placa: "PBX-4521",
        marca: "Toyota",
        modelo: "Corolla",
        anio: 2021,
        km: 45000,
        tipo: "Preventivo",
        servicios: ["Cambio de Aceite", "Frenos"],
        fecha: "2026-11-20",
        hora: "09:00",
        observaciones: "Revisar frenos delanteros",
        estado: "En proceso"
    },
    {
        id: "C-102",
        nombre: "María Morales",
        email: "maria@autofix.com",
        telefono: "0987654321",
        placa: "PCH-7890",
        marca: "Chevrolet",
        modelo: "Sail",
        anio: 2019,
        km: 82000,
        tipo: "Correctivo",
        servicios: ["Alineación y Balanceo"],
        fecha: "2026-11-22",
        hora: "14:00",
        observaciones: "Vibra el volante",
        estado: "Pendiente"
    }
];

// 3. Métodos para obtener y guardar en LocalStorage
function obtenerUsuarios() {
    return JSON.parse(localStorage.getItem("usuarios")) || USUARIOS_BASE;
}

function obtenerCitas() {
    return JSON.parse(localStorage.getItem("citas")) || CITAS_BASE;
}

function guardarCitas(citas) {
    localStorage.setItem("citas", JSON.stringify(citas));
}

function obtenerSesion() {
    return JSON.parse(localStorage.getItem("sesion_activa"));
}

function guardarSesion(usuario) {
    localStorage.setItem("sesion_activa", JSON.stringify(usuario));
}

function eliminarSesion() {
    localStorage.removeItem("sesion_activa");
}

// Inicializar o actualizar LocalStorage con la nueva configuración
(function sincronizarUsuarios() {
    const guardados = localStorage.getItem("usuarios");
    if (!guardados) {
        localStorage.setItem("usuarios", JSON.stringify(USUARIOS_BASE));
    } else {
        // Asegurar que el usuario admin y usuarios base tengan contraseña 123 y nuevo dominio autofix
        try {
            let lista = JSON.parse(guardados);
            let admin = lista.find(u => u.rol === "Administrador" || u.email.startsWith("admin@"));
            if (admin) {
                admin.email = "admin@autofix.com";
                admin.pass = "123";
                admin.nombre = "Administrador General";
            } else {
                lista.push({ email: "admin@autofix.com", pass: "123", nombre: "Administrador General", telefono: "0990001122", rol: "Administrador" });
            }
            localStorage.setItem("usuarios", JSON.stringify(lista));
        } catch (e) {
            localStorage.setItem("usuarios", JSON.stringify(USUARIOS_BASE));
        }
    }
})();

if (!localStorage.getItem("citas")) {
    localStorage.setItem("citas", JSON.stringify(CITAS_BASE));
}
