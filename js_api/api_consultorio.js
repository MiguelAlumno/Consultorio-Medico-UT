// Archivo: js_api/api_consultorio.js

// URL base de tu servidor Node.js
const API_BASE_URL = 'http://localhost:3002/api';

// Función CREATE para guardar la consulta en la Base de Datos
async function guardarConsultaAPI(paqueteDatos) {
    // Recuperamos el token que guardó el Login
    const token = localStorage.getItem('token_doctor');

    try {
        console.log("Enviando datos al servidor...");

        // Hacemos la petición POST a tu servidor
        const respuesta = await fetch(`${API_BASE_URL}/guardar-consulta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Aquí se envía el "gafete"
            },
            body: JSON.stringify(paqueteDatos) // Convertimos el JS a texto JSON
        });

        // Leemos la respuesta de Node.js
        const datosServidor = await respuesta.json();

        // Verificamos si todo salió bien (Status 200)
        if (respuesta.ok) {
            alert("✅ " + datosServidor.mensaje + "\n\nFolio: " + datosServidor.folio);
            
            // ✨ LLAMAMOS A LA FUNCIÓN DE IMPRESIÓN PASÁNDOLE EL FOLIO REAL ✨
            if (typeof generarRecetaImprimible === "function") {
                generarRecetaImprimible(datosServidor.folio);
            }
            
        } else {
            alert("❌ Error de Base de Datos: " + datosServidor.error);
        }

    } catch (error) {
        console.error("Error de conexión:", error);
        alert("❌ No se pudo conectar con el servidor. Verifica que Node.js esté corriendo.");
    }
}