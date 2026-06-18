async function cargarManualidades() {
    const respuesta = await fetch('/api/manualidades');

    const manualidades = await respuesta.json();

    const contenedor = document.getElementById('contenedorGaleria');

    contenedor.innerHTML = '';

    manualidades.forEach(m => {
        contenedor.innerHTML += `
        <div class="card">
            <img src="${m.imagenBase64}" >

            <div class="info">
                <span class="categoria">  ${m.categoria} </span>
                <h3> ${m.titulo} </h3>
                <p> ${m.descripcion} </p>
            </div>
        </div>
        `;
    });
}

document.addEventListener(

    'DOMContentLoaded',

    cargarManualidades
);