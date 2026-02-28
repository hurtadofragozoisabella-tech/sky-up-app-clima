
// API
const apiKey = "ca5663b459fd4b7a719dae1f985fe016";


// ===============================
// DOM
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    iniciarReloj();

    const inputCiudad = document.getElementById("ciudadInput");
    const botonBuscar = document.getElementById("buscarBtn");
    const modoBtn = document.getElementById("modoBtn");

    // Botón buscar
    botonBuscar.addEventListener("click", buscarClima);

    // Buscar con Enter
    inputCiudad.addEventListener("keyup", function(e){
        if(e.key === "Enter"){
            buscarClima();
        }
    });

    // Modo oscuro
    modoBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        modoBtn.textContent =
            document.body.classList.contains("dark")
            ? "Modo Claro"
            : "Modo Oscuro";
    });

    // Cargar última ciudad guardada
    const ultimaCiudad = localStorage.getItem("ultimaCiudad");
    if(ultimaCiudad){
        inputCiudad.value = ultimaCiudad;
        buscarClima();
    }

});


// ===============================
// Reloj en tiempo real
// ===============================

function iniciarReloj(){

    function actualizar(){
        const ahora = new Date();

        const fecha = ahora.toLocaleDateString("es-MX", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        const hora = ahora.toLocaleTimeString("es-MX");

        document.getElementById("fecha").textContent = fecha;
        document.getElementById("hora").textContent = hora;
    }

    actualizar();
    setInterval(actualizar, 1000);
}


// ===============================
// Buscar clima actual
// ===============================

function buscarClima(){

    const ciudad = document.getElementById("ciudadInput").value.trim();

    if(ciudad === ""){
        alert("Escribe una ciudad");
        return;
    }

    localStorage.setItem("ultimaCiudad", ciudad);

    // CLIMA ACTUAL
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`)
    .then(res => {
        if(!res.ok){
            throw new Error("Ciudad no encontrada");
        }
        return res.json();
    })
    .then(data => {

        document.getElementById("ciudad").textContent = data.name;
        document.getElementById("temperatura").textContent = Math.round(data.main.temp);
        document.getElementById("descripcion").textContent = data.weather[0].description;
        document.getElementById("humedad").textContent = data.main.humidity;
        document.getElementById("viento").textContent = data.wind.speed;
        document.getElementById("sensacion").textContent = Math.round(data.main.feels_like);

        const icono = data.weather[0].icon;
        document.getElementById("iconoClima").src =
            `https://openweathermap.org/img/wn/${icono}@2x.png`;

        obtenerPronostico(ciudad);

    })
    .catch(error => {
        alert("Ciudad no encontrada ❌");
        console.log(error);
    });
}


// ===============================
// Pronóstico 5 días
// ===============================

function obtenerPronostico(ciudad){

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`)
    .then(res => {
        if(!res.ok){
            throw new Error("Error al obtener pronóstico");
        }
        return res.json();
    })
    .then(data => {

        const container = document.getElementById("forecastContainer");
        container.innerHTML = "";

        if(!data.list){
            console.log("No hay datos de forecast");
            return;
        }

        // El API trae 40 registros (cada 3 horas)
        // Tomamos uno cada 8 (cada 24h) → 5 días
        for(let i = 0; i < 40; i += 8){

            const dia = data.list[i];
            const fecha = new Date(dia.dt * 1000);

            const card = document.createElement("div");
            card.classList.add("forecast-card");

            card.innerHTML = `
                <p>${fecha.toLocaleDateString("es-MX",{weekday:"short"})}</p>
                <img src="https://openweathermap.org/img/wn/${dia.weather[0].icon}.png" alt="Icono clima">
                <p>${Math.round(dia.main.temp)}°C</p>
            `;

            container.appendChild(card);
        }

    })
    .catch(error => {
        console.log("Error en pronóstico:", error);
        alert("No se pudo cargar el pronóstico");
    });

}