function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function responderErro(res, error) {
    if (error.status) {
        return res.status(error.status).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor.'});
}

export default { httpError, responderErro };