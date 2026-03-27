const idCitaActual = 1;
        const idPacienteActual = 1024;
        let listaMedicamentos =[];
        
        // Simula la tabla catalogo_servicios de tu Base de Datos
        const catalogoServicios =[
            { id: 1, nombre: "Consulta General", costo: 100 },
            { id: 2, nombre: "Lavado de oídos", costo: 80 },
            { id: 3, nombre: "Sutura de herida", costo: 200 },
            { id: 4, nombre: "Inyección", costo: 50 },
            { id: 5, nombre: "Curación", costo: 120 }
        ];

        window.onload = () => {
            renderizarServicios();
        }

        function renderizarServicios() {
            const contenedor = document.getElementById("contenedor-servicios");
            catalogoServicios.forEach(servicio => {
                const div = document.createElement("div");
                div.innerHTML = `
                    <label class="flex items-center space-x-2 bg-gray-50 p-2 border rounded cursor-pointer hover:bg-gray-100">
                        <input type="checkbox" value="${servicio.id}" class="check-servicio h-4 w-4 text-indigo-600 rounded">
                        <span class="text-gray-700 text-xs font-bold">${servicio.nombre} <span class="text-green-600">($${servicio.costo})</span></span>
                    </label>
                `;
                contenedor.appendChild(div);
            });
        }

        function agregarMedicamento() {
            const med = document.getElementById("med-nombre").value;
            const gramaje = document.getElementById("med-gramaje").value;
            const dosis = document.getElementById("med-dosis").value;
            const frec = document.getElementById("med-frecuencia").value;
            const dur = document.getElementById("med-duracion").value;

            if(!med) return alert("Ingrese el nombre del medicamento");

            listaMedicamentos.push({ medicamento: med, gramaje_presentacion: gramaje, dosis, frecuencia: frec, duracion: dur });
            
            document.getElementById("tabla-medicamentos").innerHTML += `
                <tr class="border-b">
                    <td class="p-2 border"><b>${med}</b><br><span class="text-xs text-gray-500">${gramaje}</span></td>
                    <td class="p-2 border">${dosis}</td>
                    <td class="p-2 border">${frec}</td>
                    <td class="p-2 border">${dur}</td>
                    <td class="p-2 border text-center text-red-500 cursor-pointer" onclick="this.parentElement.remove(); listaMedicamentos.pop();"><i class="fas fa-trash"></i></td>
                </tr>
            `;

            // Limpiar campos
            document.querySelectorAll("#med-nombre, #med-gramaje, #med-dosis, #med-frecuencia, #med-duracion").forEach(i => i.value = "");
        }

        function finalizarConsulta() {
            // Recolectar Servicios Cobrados
            const checkboxes = document.querySelectorAll(".check-servicio:checked");
            let serviciosRealizados =[];
            checkboxes.forEach(chk => serviciosRealizados.push(parseInt(chk.value)));

            if(serviciosRealizados.length === 0) {
                return alert("Seleccione al menos un Servicio a Cobrar (Ej. Consulta General).");
            }

            // ARMADO DEL SÚPER JSON PARA LA BASE DE DATOS
            const paqueteFinal = {
                cita_id: idCitaActual,
                paciente_id: idPacienteActual,
                
                // 1. Para actualizar la tabla pacientes_info
                perfil_paciente: {
                    tipo_sangre: document.getElementById("input-sangre").value,
                    alergias: document.getElementById("input-alergias").value,
                    enfermedades_cronicas: document.getElementById("input-cronicas").value
                },

                // 2. Para insertar en la tabla triage
                triage: {
                    motivo_consulta: document.getElementById("input-motivo").value,
                    peso_kg: document.getElementById("input-peso").value,
                    estatura_cm: document.getElementById("input-estatura").value,
                    temperatura: document.getElementById("input-temp").value,
                    presion_arterial: document.getElementById("input-presion").value,
                    ritmo_cardiaco: document.getElementById("input-pulso").value,
                    saturacion_oxigeno: document.getElementById("input-oxigeno").value
                },

                // 3. Para insertar en la tabla consultas_recetas
                diagnostico: document.getElementById("input-diagnostico").value,
                servicios_realizados: serviciosRealizados, // [1, 3]
                medicamentos_recetados: listaMedicamentos  // [{med...}, {med...}]
            };

            guardarConsultaAPI(paqueteFinal);
        }

        // ---------------------------------------------------------
        // MAGIA DE IMPRESIÓN (Corregido)
        // ---------------------------------------------------------

        // Función conectada al nuevo botón gris
        function imprimirBorrador() {
            // Como aún no se guarda en la Base de Datos, no hay folio oficial.
            // Le mandamos la palabra "BORRADOR" para que el doctor sepa.
            generarRecetaImprimible("BORRADOR - SIN GUARDAR");
        }

        // Función para generar e imprimir el PDF/Papel
        function generarRecetaImprimible(folioGenerado) {
            // 1. Llenar los datos del encabezado
            document.getElementById("receta-folio").innerText = folioGenerado;
            
            // Obtenemos la fecha de hoy
            const hoy = new Date();
            document.getElementById("receta-fecha").innerText = hoy.toLocaleDateString('es-MX');

            // 2. Llenar datos del paciente y triage
            document.getElementById("receta-peso").innerText = document.getElementById("input-peso").value || "--";
            document.getElementById("receta-temp").innerText = document.getElementById("input-temp").value || "--";
            document.getElementById("receta-presion").innerText = document.getElementById("input-presion").value || "--";
            
            const diagnosticoActual = document.getElementById("input-diagnostico").value;
            document.getElementById("receta-diagnostico").innerText = diagnosticoActual ? diagnosticoActual : "Sin diagnóstico escrito...";

            // 3. Llenar la lista de medicamentos
            const listaHtml = document.getElementById("receta-lista-medicinas");
            listaHtml.innerHTML = ""; // Limpiar por si había algo antes

            // Si el doctor no recetó nada, ponemos un mensaje
            if(listaMedicamentos.length === 0) {
                listaHtml.innerHTML = `<li><p class="text-gray-500 italic mt-4">No se recetaron medicamentos en esta consulta.</p></li>`;
            } else {
                // Si sí hay medicinas, las pintamos
                listaMedicamentos.forEach(med => {
                    const li = document.createElement("li");
                    li.innerHTML = `
                        <p class="font-bold text-lg text-gray-800">💊 ${med.medicamento} <span class="text-sm text-gray-500 font-normal">(${med.gramaje_presentacion})</span></p>
                        <p class="text-gray-700 ml-5 mb-2">▶ <b>Dosis:</b> ${med.dosis} | <b>Frecuencia:</b> ${med.frecuencia} | <b>Duración:</b> ${med.duracion}</p>
                    `;
                    listaHtml.appendChild(li);
                });
            }

            // 4. Abrir la ventana de impresión (con un pequeño retraso para que cargue el diseño)
            setTimeout(() => {
                window.print();
            }, 500);
        }