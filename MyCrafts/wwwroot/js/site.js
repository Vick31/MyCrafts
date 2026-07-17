// Aplica el tema guardado antes de renderizar para evitar parpadeo
(function aplicarTemaInicial() {
    if (localStorage.getItem('tema') === 'oscuro') {
        document.documentElement.setAttribute('data-tema', 'oscuro');
    }
})();

let manualidades = [];

async function cargarManualidades() {
    const contenedor = document.getElementById('contenedorGaleria');

    if (!contenedor) return;

    const cargando = document.getElementById('cargando');
    const verTodas = document.getElementById('verTodas');

    // Si el contenedor define data-cantidad, la consulta solo trae esa cantidad (las mas recientes)
    const cantidad = parseInt(contenedor.dataset.cantidad);
    const hayCantidad = !isNaN(cantidad);

    const url = hayCantidad
        ? `/api/manualidades?cantidad=${cantidad}`
        : '/api/manualidades';

    // Mostrar el indicador de carga mientras se hace la peticion
    if (cargando) cargando.style.display = 'flex';
    if (verTodas) verTodas.style.display = 'none';
    contenedor.innerHTML = '';

    try {
        const respuesta = await fetch(url);

        if (!respuesta.ok) throw new Error('Error en la peticion');

        manualidades = (await respuesta.json()) || [];

        manualidades.forEach((m, i) => {
            contenedor.innerHTML += `
            <div class="card" data-index="${i}">
                <img src="${m.imagenBase64}" >

                <div class="info">
                    <span class="categoria">  ${m.categoria} </span>
                    <h3> ${m.titulo} </h3>
                    <p> ${m.descripcion} </p>
                </div>
            </div>
            `;
        });

        // Al hacer click en una tarjeta se abre el detalle ampliado
        contenedor.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                abrirModal(Number(card.dataset.index));
            });
        });

        // El boton "Ver todas" aparece si se pidio un limite y llegaron suficientes como para que haya mas
        if (verTodas) {
            verTodas.style.display =
                (hayCantidad && manualidades.length >= cantidad) ? 'inline-block' : 'none';
        }
    } catch (error) {
        manualidades = [];
        contenedor.innerHTML =
            '<p class="galeria-error">No se pudieron cargar las manualidades. Intenta de nuevo.</p>';
    } finally {
        // Ocultar el indicador de carga siempre, haya exito o error
        if (cargando) cargando.style.display = 'none';
    }
}

function abrirModal(index) {
    const m = manualidades[index];

    if (!m) return;

    document.getElementById('modalImg').src = m.imagenBase64;
    document.getElementById('modalImg').alt = m.titulo;
    document.getElementById('modalCategoria').textContent = m.categoria;
    document.getElementById('modalTitulo').textContent = m.titulo;
    document.getElementById('modalDescripcion').textContent = m.descripcion;

    const fecha = new Date(m.fechaCreacion);

    document.getElementById('modalFecha').textContent =
        (m.fechaCreacion && fecha.getFullYear() > 1)
            ? fecha.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
            : '';

    const modal = document.getElementById('modal');
    modal.classList.add('abierto');
    document.body.style.overflow = 'hidden';
}

function cerrarModal() {
    document.getElementById('modal').classList.remove('abierto');
    document.body.style.overflow = '';
}

function alternarTema() {
    const html = document.documentElement;
    const esOscuro = html.getAttribute('data-tema') === 'oscuro';

    if (esOscuro) {
        html.removeAttribute('data-tema');
        localStorage.setItem('tema', 'claro');
    } else {
        html.setAttribute('data-tema', 'oscuro');
        localStorage.setItem('tema', 'oscuro');
    }

    actualizarIconoTema();
}

function actualizarIconoTema() {
    const btn = document.getElementById('btnTema');

    if (!btn) return;

    const esOscuro = document.documentElement.getAttribute('data-tema') === 'oscuro';
    btn.textContent = esOscuro ? '☀️' : '🌙';
}

document.addEventListener('DOMContentLoaded', () => {
    cargarManualidades();

    // Boton de cambio de tema (claro / oscuro)
    const btnTema = document.getElementById('btnTema');

    if (btnTema) {
        actualizarIconoTema();
        btnTema.addEventListener('click', alternarTema);
    }

    // En movil, cerrar el menu desplegable al hacer click en un enlace de seccion
    const menuToggle = document.getElementById('menu-toggle');

    if (menuToggle) {
        document.querySelectorAll('nav a').forEach(enlace => {
            enlace.addEventListener('click', () => {
                menuToggle.checked = false;
            });
        });
    }

    const modal = document.getElementById('modal');

    if (modal) {
        document.getElementById('modalCerrar').addEventListener('click', cerrarModal);

        // Cerrar al hacer click fuera del contenido
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModal();
        });

        // Cerrar con la tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') cerrarModal();
        });
    }
});
