export default function autenticarFake(req, res, next) {
    req.usuario = { id: Number(req.headers["x-usuario-id"] ?? 1) };
    next();
}