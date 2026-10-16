import usuarioService from "./usuarioService.js";
import httpError from "../../utils/httpError.js";

async function buscarPorId(req, res) {
    try {
        const dados = await usuarioService.buscarPorId(req.user.idUsuario);
        res.json(dados);
    } catch (error) {
        httpError.httpError(res, error);
    }
}

async function atualizarUsuario(req, res) {
    const { nome } = req.body ?? {};

    if (typeof nome !== 'string') {
        return res.status(400).json({
            error: 'O campo "nome" é obrigatório e deve ser texto.',
        });
    }

    try {
        const resultado = await usuarioService.atualizarNome(req.user.idUsuario, nome);
        res.json(resultado);
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

export default { buscarPorId, atualizarUsuario };