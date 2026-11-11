/**
 * VALIDACIONES.JS - AutoTech
 * Validaciones avanzadas del formulario de citas, formato de campos y guardado
 */

document.addEventListener("DOMContentLoaded", function () {
    const formCita = document.getElementById("formCita");
    if (!formCita) return;

    // 1. Establecer fecha mínima dinámica (Hoy en adelante, no pasado)
    const inputFecha = document.getElementById("fecha");
    const inputHora = document.getElementById("hora");
    const inputAnio = document.getElementById("anio");
    const inputKm = document.getElementById("km");

    const hoy = new Date();
    const formatoAnio = hoy.getFullYear();
    const mesFormato = String(hoy.getMonth() + 1).padStart(2, '0');
    const diaFormato = String(hoy.getDate()).padStart(2, '0');
    const fechaMinima = `${formatoAnio}-${mesFormato}-${diaFormato}`;

    if (inputFecha) {
        inputFecha.min = fechaMinima;
    }

    // Adaptar dinámicamente las opciones de hora según la fecha elegida
    if (inputFecha && inputHora) {
        inputFecha.addEventListener("change", function () {
            const fechaVal = this.value;
            if (!fechaVal) return;

            const partes = fechaVal.split("-");
            const fechaObj = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
            const diaSemana = fechaObj.getDay(); // 0 = Domingo, 6 = Sábado

            if (diaSemana === 0) {
                Swal.fire({
                    icon: "warning",
                    title: "Taller Cerrado los Domingos",
                    text: "Por favor, selecciona una fecha de Lunes a Sábado."
                });
                this.value = "";
                return;
            }

            // Si es sábado, advertir o deshabilitar horas de la tarde
            const opciones = inputHora.querySelectorAll("option");
            opciones.forEach(opt => {
                if (opt.value === "14:30" || opt.value === "16:00") {
                    opt.disabled = (diaSemana === 6);
                } else {
                    opt.disabled = false;
                }
            });

            if (diaSemana === 6 && (inputHora.value === "14:30" || inputHora.value === "16:00")) {
                inputHora.value = "";
            }
        });
    }

    // 2. Control de salida / recarga accidental si hay campos con datos (Punto 1 solicitado)
    let formularioEnviado = false;

    function tieneDatosIngresados() {
        const nombre = document.getElementById("nombre")?.value.trim() || "";
        const email = document.getElementById("email")?.value.trim() || "";
        const telefono = document.getElementById("telefono")?.value.trim() || "";
        const placa = document.getElementById("placa")?.value.trim() || "";
        const modelo = document.getElementById("modelo")?.value.trim() || "";
        const anio = document.getElementById("anio")?.value.trim() || "";
        const km = document.getElementById("km")?.value.trim() || "";
        const obs = document.getElementById("observaciones")?.value.trim() || "";
        const fecha = document.getElementById("fecha")?.value || "";
        const hayCheckbox = document.querySelectorAll('.chk-servicio:checked').length > 0;

        // Si ya hay sesión iniciada, ignorar nombre y email base
        const sesion = obtenerSesion();
        if (sesion) {
            return Boolean(telefono || placa || modelo || anio || km || obs || fecha || hayCheckbox);
        }

        return Boolean(nombre || email || telefono || placa || modelo || anio || km || obs || fecha || hayCheckbox);
    }

    // Advertencia al recargar o cerrar pestaña
    window.addEventListener("beforeunload", function (e) {
        if (!formularioEnviado && tieneDatosIngresados()) {
            e.preventDefault();
            e.returnValue = "Tienes datos sin guardar en el formulario. ¿Seguro que deseas salir?";
            return e.returnValue;
        }
    });

    // Advertencia al hacer clic en enlaces de navegación dentro de la página
    document.querySelectorAll("a").forEach(enlace => {
        enlace.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (!formularioEnviado && tieneDatosIngresados() && href && !href.startsWith("#") && href !== "javascript:void(0)") {
                e.preventDefault();
                Swal.fire({
                    title: "¿Salir sin guardar?",
                    text: "Estás llenando los datos de tu cita. Si sales o cambias de página perderás la información ingresada.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#ffc107",
                    cancelButtonColor: "#6c757d",
                    confirmButtonText: "Sí, salir",
                    cancelButtonText: "Quedarme"
                }).then((res) => {
                    if (res.isConfirmed) {
                        formularioEnviado = true; // Permite navegar
                        window.location.href = href;
                    }
                });
            }
        });
    });

    // 3. Autocompletar datos si el cliente ya inició sesión
    const sesion = obtenerSesion();
    if (sesion) {
        const inputNombre = document.getElementById("nombre");
        const inputEmail = document.getElementById("email");
        const inputTel = document.getElementById("telefono");
        if (inputNombre) inputNombre.value = sesion.nombre;
        if (inputEmail) inputEmail.value = sesion.email;
        if (inputTel && sesion.telefono) inputTel.value = sesion.telefono;
    }

    // 4. Procesamiento y Validación exhaustiva del Formulario
    formCita.addEventListener("submit", function (e) {
        e.preventDefault();

        // 4.1. Obtener y limpiar valores
        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const telefono = document.getElementById("telefono").value.trim();
        const placa = document.getElementById("placa").value.trim().toUpperCase();
        const marca = document.getElementById("marca").value;
        const modelo = document.getElementById("modelo").value.trim();
        const anioVal = document.getElementById("anio").value.trim();
        const kmVal = document.getElementById("km").value.trim();
        const anio = parseInt(anioVal, 10);
        const km = parseInt(kmVal, 10);
        const fecha = document.getElementById("fecha").value;
        const hora = document.getElementById("hora").value;
        const observaciones = document.getElementById("observaciones").value.trim();

        // Radio button tipo de mantenimiento
        const tipoRadio = document.querySelector('input[name="tipo"]:checked');
        const tipo = tipoRadio ? tipoRadio.value : "";

        // Checkboxes servicios
        const checkboxes = document.querySelectorAll('.chk-servicio:checked');
        const servicios = Array.from(checkboxes).map(cb => cb.value);

        // 4.2. Validación de Nombre (al menos 3 caracteres y solo letras/espacios)
        const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,60}$/;
        if (!regexNombre.test(nombre)) {
            Swal.fire({
                icon: "warning",
                title: "Nombre no válido",
                text: "Ingresa un nombre y apellido válido (solo letras, mínimo 3 caracteres)."
            });
            return;
        }

        // 4.3. Validación de Correo Electrónico
        const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!regexEmail.test(email)) {
            Swal.fire({
                icon: "warning",
                title: "Correo electrónico no válido",
                text: "Por favor, ingresa un correo con formato válido (ejemplo: usuario@correo.com)."
            });
            return;
        }

        // 4.4. Validación de Teléfono Celular (Ecuador: 10 dígitos iniciando con 09)
        const regexTelefono = /^09\d{8}$/;
        if (!regexTelefono.test(telefono)) {
            Swal.fire({
                icon: "warning",
                title: "Teléfono no válido",
                text: "El número debe ser un celular ecuatoriano: 10 dígitos e iniciar con 09 (Ej: 0991234567)."
            });
            return;
        }

        // 4.5. Validación de Placa (Ecuador: 3 letras mayúsculas, guion opcional y 3 o 4 dígitos)
        const regexPlaca = /^[A-Z]{3}-?\d{3,4}$/;
        if (!regexPlaca.test(placa)) {
            Swal.fire({
                icon: "warning",
                title: "Formato de placa inválido",
                text: "La placa debe tener formato ecuatoriano válido (Ejemplo: PBX-1234 o PBX-123)."
            });
            return;
        }

        // 4.6. Validación de Marca y Modelo
        if (!marca) {
            Swal.fire({
                icon: "warning",
                title: "Marca requerida",
                text: "Por favor selecciona la marca de tu vehículo."
            });
            return;
        }

        if (modelo.length < 2) {
            Swal.fire({
                icon: "warning",
                title: "Modelo requerido",
                text: "Ingresa el modelo del vehículo (mínimo 2 caracteres)."
            });
            return;
        }

        // 4.7. Validación de Año (Histórico del automóvil: 1886 primer auto Benz Patent-Motorwagen hasta el año próximo)
        const anioLimiteSuperior = new Date().getFullYear() + 1; // 2027
        const PRIMER_AUTO_HISTORICO = 1886; // Año de invención del automóvil

        if (isNaN(anio) || anio < PRIMER_AUTO_HISTORICO || anio > anioLimiteSuperior) {
            Swal.fire({
                icon: "error",
                title: "Año de fabricación inválido",
                text: `El año del automóvil no puede ser menor a ${PRIMER_AUTO_HISTORICO} (año del primer automóvil registrado en la historia) ni mayor a ${anioLimiteSuperior}.`
            });
            return;
        }

        // 4.8. Validación de Kilometraje (No negativo y límite estándar)
        if (isNaN(km) || km < 0 || km > 1000000) {
            Swal.fire({
                icon: "error",
                title: "Kilometraje inválido",
                text: "El kilometraje no puede ser negativo y debe estar en un rango razonable (0 a 1'000,000 km)."
            });
            return;
        }

        // 4.9. Validación de Servicios (Al menos uno)
        if (servicios.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Selecciona al menos un servicio",
                text: "Debes marcar al menos una casilla de los servicios mecánicos requeridos."
            });
            return;
        }

        // 4.10. Validación de Fecha y Horario Laboral del Taller
        if (!fecha || !hora) {
            Swal.fire({
                icon: "warning",
                title: "Fecha y hora requeridas",
                text: "Por favor selecciona una fecha y una hora para tu cita."
            });
            return;
        }

        const partesFecha = fecha.split("-");
        const fechaCita = new Date(parseInt(partesFecha[0]), parseInt(partesFecha[1]) - 1, parseInt(partesFecha[2]));
        const diaSemana = fechaCita.getDay(); // 0 = Domingo, 6 = Sábado

        // Domingo: Taller cerrado
        if (diaSemana === 0) {
            Swal.fire({
                icon: "error",
                title: "Taller Cerrado los Domingos",
                text: "El taller no labora los días domingos. Por favor selecciona una fecha de lunes a sábado."
            });
            return;
        }

        // Sábado: Horario solo matutino (08:00 a 13:00)
        if (diaSemana === 6 && (hora === "14:30" || hora === "16:00")) {
            Swal.fire({
                icon: "error",
                title: "Horario no laboral para Sábados",
                text: "Los días sábados atendemos únicamente de 08:00 AM a 01:00 PM. Por favor elija un horario matutino."
            });
            return;
        }

        // Validar que no sea una fecha pasada ni una hora ya transcurrida si la fecha es hoy
        const [horasSel, minsSel] = hora.split(":").map(Number);
        const fechaHoraSeleccionada = new Date(parseInt(partesFecha[0]), parseInt(partesFecha[1]) - 1, parseInt(partesFecha[2]), horasSel, minsSel, 0);
        const ahora = new Date();

        if (fechaHoraSeleccionada < ahora) {
            Swal.fire({
                icon: "error",
                title: "Fecha u hora en el pasado",
                text: "No puedes agendar una cita en un día u horario que ya ha transcurrido."
            });
            return;
        }

        // 5. Normalizar formato de placa con guion si el usuario no lo puso (ej: ABC1234 -> ABC-1234)
        let placaNormalizada = placa;
        if (!placaNormalizada.includes("-")) {
            placaNormalizada = placaNormalizada.slice(0, 3) + "-" + placaNormalizada.slice(3);
        }

        // 6. Almacenamiento en LocalStorage
        const usuarios = obtenerUsuarios();
        let usuarioExistente = usuarios.find(u => u.email === email);

        if (!usuarioExistente) {
            // Si el cliente no estaba registrado, lo creamos para permitir su posterior consulta en el panel
            usuarioExistente = {
                nombre: nombre,
                email: email,
                telefono: telefono,
                pass: "123",
                rol: "Cliente"
            };
            usuarios.push(usuarioExistente);
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
        }

        // Si no había sesión activa, iniciamos sesión con el usuario actual para que al ir al panel vea su cita de inmediato
        if (!obtenerSesion()) {
            guardarSesion(usuarioExistente);
        }

        const citas = obtenerCitas();
        const nuevaCita = {
            id: "C-" + Math.floor(100 + Math.random() * 900),
            nombre: nombre,
            email: email,
            telefono: telefono,
            placa: placaNormalizada,
            marca: marca,
            modelo: modelo,
            anio: anio,
            km: km,
            tipo: tipo,
            servicios: servicios,
            fecha: fecha,
            hora: hora,
            observaciones: observaciones || "Ninguna",
            estado: "Pendiente"
        };

        citas.unshift(nuevaCita); // Colocar al principio
        guardarCitas(citas);

        // Desactivar alerta de salida al enviar con éxito
        formularioEnviado = true;

        // 7. Notificación de éxito
        Swal.fire({
            icon: "success",
            title: "¡Cita Agendada Exitosamente!",
            html: `
                <div class="text-start small p-2 bg-light rounded border">
                    <p class="mb-1"><strong>Código de Cita:</strong> <span class="badge bg-warning text-dark">${nuevaCita.id}</span></p>
                    <p class="mb-1"><strong>Propietario:</strong> ${nuevaCita.nombre} (${nuevaCita.telefono})</p>
                    <p class="mb-1"><strong>Vehículo:</strong> ${nuevaCita.marca} ${nuevaCita.modelo} (${nuevaCita.anio}) - Placa: <strong>${nuevaCita.placa}</strong></p>
                    <p class="mb-1"><strong>Fecha y Hora:</strong> ${nuevaCita.fecha} a las ${nuevaCita.hora}</p>
                    <p class="mb-0"><strong>Servicios:</strong> ${nuevaCita.servicios.join(", ")}</p>
                </div>
            `,
            confirmButtonColor: "#ffc107",
            confirmButtonText: "Ver en Mi Panel"
        }).then(() => {
            window.location.href = "panel.html";
        });
    });
});
