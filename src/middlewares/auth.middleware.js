// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(403).json({ message: "No se proporcionó un token." });

    try {
        // Verificamos con TU JWT_SECRET (que ahora es igual al de él)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // El controller de tu compañero guarda: { id: user.UsuarioID, rol: user.Rol }
        req.usuario = decoded; 

        // Validamos que sea Médico (él usa 'Medico' en su test.routes)
        if (req.usuario.rol !== 'Medico' && req.usuario.rol !== 'Admin') {
            return res.status(403).json({ message: "Acceso denegado. No eres médico." });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: "Token inválido o expirado." });
    }
};

module.exports = { verificarToken };