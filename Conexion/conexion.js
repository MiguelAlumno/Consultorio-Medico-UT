require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sql = require('mssql');

const consultaRoutes = require('../src/routes/consulta.routes.js');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Permite recibir el súper JSON de tu HTML

app.use('/api/consultas', consultaRoutes);

// 1. CONFIGURACIÓN DE SQL SERVER
const dbConfig = {
    user: process.env.DB_USER,          // Lee del .env
    password: process.env.DB_PASSWORD,  // Lee del .env
    server: process.env.DB_SERVER,      // Lee del .env
    database: process.env.DB_NAME,      // Lee del .env
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

// 2. CONEXIÓN A LA BASE DE DATOS
async function conectarDB() {
    try {
        await sql.connect(dbConfig);
        console.log('✅ Conectado exitosamente a SQL Server');
    } catch (error) {
        console.error('❌ Error al conectar a SQL Server:', error);
    }
}
conectarDB();

// 3. RUTA DE PRUEBA
app.get('/', (req, res) => {
    res.send('Microservicio Médico Persona 2 - Corriendo');
});

// 4. RUTA ESTRELLA: Guardar toda la consulta
app.post('/api/guardar-consulta', async (req, res) => {
    try {
        // Recibimos el Súper JSON que armó tu JavaScript en el Frontend
        const { cita_id, paciente_id, perfil_paciente, triage, diagnostico, servicios_realizados, medicamentos_recetados } = req.body;

        // Generamos el Folio de la Receta (Ej: REC-2024-5893)
        const folio_receta = "REC-2026-" + Math.floor(Math.random() * 10000);

        // Convertimos los arreglos a strings JSON para SQL Server
        const jsonServicios = JSON.stringify(servicios_realizados);
        const jsonMedicamentos = JSON.stringify(medicamentos_recetados);

        // INICIAMOS UNA TRANSACCIÓN (Para guardar todo de golpe de forma segura)
        const transaction = new sql.Transaction();
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);

            // PASO A: Actualizar el perfil del paciente (pacientes_info)
            await request.query(`
                UPDATE pacientes_info 
                SET tipo_sangre = '${perfil_paciente.tipo_sangre}', 
                    alergias = '${perfil_paciente.alergias}', 
                    enfermedades_cronicas = '${perfil_paciente.enfermedades_cronicas}'
                WHERE usuario_id = ${paciente_id}
            `);

            // PASO B: Guardar los signos vitales (triage)
            await request.query(`
                INSERT INTO triage (cita_id, motivo_consulta, peso_kg, estatura_cm, temperatura, presion_arterial, ritmo_cardiaco, saturacion_oxigeno)
                VALUES (
                    ${cita_id}, 
                    '${triage.motivo_consulta}', 
                    ${triage.peso_kg || 'NULL'}, 
                    ${triage.estatura_cm || 'NULL'}, 
                    ${triage.temperatura || 'NULL'}, 
                    '${triage.presion_arterial}', 
                    ${triage.ritmo_cardiaco || 'NULL'}, 
                    ${triage.saturacion_oxigeno || 'NULL'}
                )
            `);

            // PASO C: Guardar la consulta y la receta (consultas_recetas)
            await request.query(`
                INSERT INTO consultas_recetas (cita_id, folio_receta, diagnostico, servicios_realizados, medicamentos_recetados)
                VALUES (${cita_id}, '${folio_receta}', '${diagnostico}', '${jsonServicios}', '${jsonMedicamentos}')
            `);

            // PASO D: Cambiar el estado de la cita a 'Completada'
            await request.query(`
                UPDATE citas SET estado = 'Completada' WHERE id = ${cita_id}
            `);

            // SI TODO SALIÓ BIEN, CONFIRMAMOS LA TRANSACCIÓN (Commit)
            await transaction.commit();

            // Respondemos al Frontend
            res.status(200).json({
                mensaje: "¡Consulta guardada con éxito!",
                folio: folio_receta
            });

        } catch (errorTransaccion) {
            // SI HUBO UN ERROR EN CUALQUIER PASO, DESHACEMOS TODO (Rollback)
            await transaction.rollback();
            throw errorTransaccion; // Lanzamos el error al catch principal
        }

    } catch (error) {
        console.error('Error al guardar consulta:', error);
        res.status(500).json({ error: 'Hubo un error interno al guardar la consulta.' });
    }
});

// 5. ENCENDER EL SERVIDOR
const PUERTO = 3002;
app.listen(PUERTO, () => {
    console.log(`🚀 Microservicio Médico escuchando en http://localhost:${PUERTO}`);
});