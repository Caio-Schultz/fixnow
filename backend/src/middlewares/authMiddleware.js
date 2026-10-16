import jwt from 'jsonwebtoken';

function authenticate(req, res, next) {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Envie o cabeçalho "Authorization: Bearer <token>".' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
        });

        req.user = { idUsuario: Number(payload.sub), perfil: payload.perfil };
        next();
    } catch {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
}

function exigePerfil(perfil) {
    return (req, res, next) => {
        if (req.user?.perfil !== perfil) {
            return res
                .status(403)
                .json({ error: 'Ação não permitida.' });
        }

        next();
    };
}

export default { authenticate, exigePerfil };