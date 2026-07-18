// Marca que hay JS activo (las animaciones de scroll solo se ocultan si esto existe)
document.documentElement.classList.add('js');

// Aplica el tema guardado antes de renderizar para evitar parpadeo
(function aplicarTemaInicial() {
    if (localStorage.getItem('tema') === 'oscuro') {
        document.documentElement.setAttribute('data-tema', 'oscuro');
    }
})();

let manualidades = [];
let observador = null;

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
            const categoria = (m.categoria || '').trim();

            contenedor.innerHTML += `
            <div class="card reveal-fade" data-index="${i}" data-categoria="${categoria}">
                <div class="card-img">
                    <img src="${m.imagenBase64}" >
                    <div class="card-overlay">
                        <span class="ver-detalle">Ver detalle</span>
                    </div>
                </div>

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

        // Chips para filtrar por categoria (solo donde exista el contenedor #filtros)
        construirFiltros();

        // Observar las tarjetas recien creadas para animarlas al aparecer
        observarReveal();

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

function construirFiltros() {
    const filtros = document.getElementById('filtros');

    if (!filtros) return;

    // Lista de categorias unicas (sin vacios), con "Todos" al inicio
    const categorias = ['Todos', ...new Set(
        manualidades
            .map(m => (m.categoria || '').trim())
            .filter(Boolean)
    )];

    filtros.innerHTML = categorias
        .map((cat, i) =>
            `<button class="chip${i === 0 ? ' activo' : ''}" data-cat="${cat}">${cat}</button>`)
        .join('');

    filtros.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            filtros.querySelectorAll('.chip').forEach(c => c.classList.remove('activo'));
            chip.classList.add('activo');
            filtrarGaleria(chip.dataset.cat);
        });
    });
}

function filtrarGaleria(categoria) {
    const contenedor = document.getElementById('contenedorGaleria');

    if (!contenedor) return;

    contenedor.querySelectorAll('.card').forEach(card => {
        const coincide = categoria === 'Todos' || card.dataset.categoria === categoria;
        card.style.display = coincide ? '' : 'none';
    });
}

// Anima los elementos con clase reveal / reveal-fade cuando entran en pantalla
function inicializarObservador() {
    if (!('IntersectionObserver' in window)) return;

    observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('visible');
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.12 });
}

function observarReveal() {
    if (!observador) {
        // Sin soporte de IntersectionObserver: mostrar todo directamente
        document.querySelectorAll('.reveal, .reveal-fade').forEach(el => el.classList.add('visible'));
        return;
    }

    document.querySelectorAll('.reveal:not(.visible), .reveal-fade:not(.visible)')
        .forEach(el => observador.observe(el));
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
    // Animaciones al hacer scroll: preparar el observador y revelar lo estatico visible
    inicializarObservador();
    observarReveal();

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
