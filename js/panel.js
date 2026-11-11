/**
 * PANEL.JS - AutoTech
 * Lógica del Dashboard y separación por roles:
 * - Rol 'Cliente': visualiza únicamente sus citas.
 * - Rol 'Administrador': gestiona todas las citas, cambia estados y elimina.
 */

function inicializarPanel() {
    const seccionLogin = document.getElementById("seccionLogin");
    const seccionDashboard = document.getElementById("seccionDashboard");
    const perfilInfo = document.getElementById("perfilInfo");
    const vistaCliente = document.getElementById("vistaCliente");
    const vistaAdmin = document.getElementById("vistaAdmin");

    if (!seccionLogin || !seccionDashboard) return;

    const sesion = obtenerSesion();

    if (!sesion) {
        // No hay sesión activa: mostrar formulario de login
        seccionLogin.classList.remove("d-none");
        seccionDashboard.classList.add("d-none");
        return;
    }

    // Hay sesión activa: mostrar panel
    seccionLogin.classList.add("d-none");
    seccionDashboard.classList.remove("d-none");

    if (perfilInfo) {
        perfilInfo.innerHTML = `
            <div class="d-flex align-items-center gap-3 flex-wrap">
                <i class="bi bi-person-circle text-warning display-6"></i>
                <div>
                    <h5 class="fw-bold mb-1">
                        ${sesion.nombre} 
                        <span class="badge ${sesion.rol === 'Administrador' ? 'bg-danger' : 'bg-primary'}">${sesion.rol}</span>
                    </h5>
                    <div class="text-muted small">
                        <span class="me-3"><i class="bi bi-envelope"></i> ${sesion.email}</span>
                        ${sesion.telefono ? `<span><i class="bi bi-telephone"></i> ${sesion.telefono}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Separar vistas por rol
    if (sesion.rol === "Administrador") {
        if (vistaCliente) vistaCliente.classList.add("d-none");
        if (vistaAdmin) vistaAdmin.classList.remove("d-none");
        pintarCitasAdmin();
    } else {
        if (vistaCliente) vistaCliente.classList.remove("d-none");
        if (vistaAdmin) vistaAdmin.classList.add("d-none");
        pintarCitasCliente(sesion.email);
    }
}

// 1. VISTA CLIENTE: Pintar solo sus citas en la tabla de cliente
function pintarCitasCliente(emailUsuario) {
    const tbodyCliente = document.getElementById("tbodyCliente");
    if (!tbodyCliente) return;

    const citas = obtenerCitas();
    const misCitas = citas.filter(c => c.email.toLowerCase() === emailUsuario.toLowerCase());

    if (misCitas.length === 0) {
        tbodyCliente.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    <i class="bi bi-calendar-x display-6 d-block mb-2 text-warning"></i>
                    No tienes citas registradas actualmente.<br>
                    <a href="agendar.html" class="btn btn-warning btn-sm fw-bold mt-2">Agendar Mi Primera Cita</a>
                </td>
            </tr>
        `;
        return;
    }

    tbodyCliente.innerHTML = misCitas.map(c => `
        <tr>
            <td class="fw-bold">${c.id}</td>
            <td>
                <div class="fw-semibold">${c.marca} ${c.modelo} (${c.anio})</div>
                <small class="badge bg-secondary">${c.placa}</small>
            </td>
            <td>
                <div class="small">${c.servicios.join(", ")}</div>
                <small class="text-muted fst-italic">${c.observaciones}</small>
            </td>
            <td class="small text-nowrap">
                <div>${c.fecha}</div>
                <div class="text-muted">${c.hora}</div>
            </td>
            <td>
                <span class="badge ${obtenerBadgeEstado(c.estado)}">${c.estado}</span>
            </td>
        </tr>
    `).join("");
}

// 2. VISTA ADMINISTRADOR: Tabla completa con controles de edición y borrado
function pintarCitasAdmin() {
    const tbody = document.getElementById("tbodyAdmin");
    if (!tbody) return;

    const citas = obtenerCitas();

    if (citas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No hay citas registradas en el sistema.</td></tr>`;
        return;
    }

    tbody.innerHTML = citas.map(c => `
        <tr>
            <td class="fw-bold text-nowrap">${c.id}</td>
            <td>
                <div class="fw-semibold">${c.nombre}</div>
                <small class="text-muted">${c.telefono}</small>
            </td>
            <td>
                <div>${c.marca} ${c.modelo}</div>
                <small class="badge bg-secondary">${c.placa}</small>
            </td>
            <td class="small">
                ${c.servicios.join(", ")}
            </td>
            <td class="small text-nowrap">
                <div>${c.fecha}</div>
                <div class="text-muted">${c.hora}</div>
            </td>
            <td>
                <select class="form-select form-select-sm" onchange="cambiarEstado('${c.id}', this.value)">
                    <option value="Pendiente" ${c.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="En proceso" ${c.estado === "En proceso" ? "selected" : ""}>En proceso</option>
                    <option value="Finalizado" ${c.estado === "Finalizado" ? "selected" : ""}>Finalizado</option>
                    <option value="Cancelado" ${c.estado === "Cancelado" ? "selected" : ""}>Cancelado</option>
                </select>
            </td>
            <td class="text-center">
                <button class="btn btn-outline-danger btn-sm" onclick="eliminarCita('${c.id}')" title="Eliminar cita">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

// Función auxiliar para color de etiquetas de estado
function obtenerBadgeEstado(estado) {
    switch (estado) {
        case "Pendiente": return "bg-warning text-dark";
        case "En proceso": return "bg-primary text-white";
        case "Finalizado": return "bg-success text-white";
        case "Cancelado": return "bg-danger text-white";
        default: return "bg-secondary text-white";
    }
}

// Acción Admin: Cambiar estado
function cambiarEstado(id, nuevoEstado) {
    const citas = obtenerCitas();
    const cita = citas.find(c => c.id === id);
    if (cita) {
        cita.estado = nuevoEstado;
        guardarCitas(citas);
        Swal.fire({
            icon: "success",
            title: "Estado Actualizado",
            text: `La cita ${id} ahora está: ${nuevoEstado}`,
            timer: 900,
            showConfirmButton: false
        });
    }
}

// Acción Admin: Eliminar cita
function eliminarCita(id) {
    Swal.fire({
        title: "¿Desea eliminar esta cita?",
        text: `La cita ${id} se borrará definitivamente del sistema.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then((res) => {
        if (res.isConfirmed) {
            let citas = obtenerCitas().filter(c => c.id !== id);
            guardarCitas(citas);
            pintarCitasAdmin();
            Swal.fire({
                icon: "success",
                title: "Cita Eliminada",
                timer: 900,
                showConfirmButton: false
            });
        }
    });
}

// Inicializar al cargar la página si existe seccionDashboard
document.addEventListener("DOMContentLoaded", inicializarPanel);
