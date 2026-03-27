// src/controllers/consulta.controller.js
const sql = require('mssql');

const obtenerHistorialConsultas = async (req, res) => {
    try {
        const idDoctor = req.usuario.id; 

        const request = new sql.Request();
        const resultado = await request.query(`
            SELECT 
                cr.folio_receta,
                c.fecha_hora,
                p.usuario_id AS id_paciente,
                cr.diagnostico,
                cr.servicios_realizados, -- Agregamos esto para la Persona 4 (Caja)
                cr.medicamentos_recetados
            FROM consultas_recetas cr
            INNER JOIN citas c ON cr.cita_id = c.id
            INNER JOIN pacientes_info p ON c.paciente_id = p.usuario_id
            WHERE c.doctor_id = ${idDoctor}
            ORDER BY c.fecha_hora DESC
        `);

        // ✨ AQUÍ ESTÁ EL TRUCO PARA TUS COMPAÑEROS ✨
        // Mapeamos los resultados para convertir los textos JSON en objetos reales
        const consultasFormateadas = resultado.recordset.map(registro => {
            return {
                ...registro,
                // Convertimos el texto de la base de datos a un objeto JS real
                servicios_realizados: JSON.parse(registro.servicios_realizados || "[]"),
                medicamentos_recetados: JSON.parse(registro.medicamentos_recetados || "[]")
            };
        });

        res.status(200).json({
            doctor: req.usuario.nombre,
            total: consultasFormateadas.length,
            consultas: consultasFormateadas
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener el historial." });
    }
};

const obtenerConsultaPorFolio = async (req, res) => {
    const { folio } = req.params;
    try {
        const request = new sql.Request();
        const resultado = await request.query(`
            SELECT cr.*, p.usuario_id 
            FROM consultas_recetas cr
            INNER JOIN citas c ON cr.cita_id = c.id
            INNER JOIN pacientes_info p ON c.paciente_id = p.usuario_id
            WHERE cr.folio_receta = '${folio}'
        `);

        if (resultado.recordset.length === 0) {
            return res.status(404).json({ mensaje: "Folio no encontrado" });
        }

        const receta = resultado.recordset[0];
        res.json({
            ...receta,
            servicios_realizados: JSON.parse(receta.servicios_realizados),
            medicamentos_recetados: JSON.parse(receta.medicamentos_recetados)
        });
    } catch (e) { res.status(500).send(e); }
};

module.exports = { obtenerHistorialConsultas };