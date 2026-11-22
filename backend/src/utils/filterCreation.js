import httpError from "./httpError.js";

function montarFiltroData({ data, mes }) {
    if (data !== undefined && data !== null && data !== "") {
        if (typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
            throw httpError.httpError(400, "O parâmetro data deve estar no formato AAAA-MM-DD.");
        }

        const dataFiltro = new Date(`${data}T00:00:00.000Z`);
        if (Number.isNaN(dataFiltro.getTime()) || dataFiltro.toISOString().slice(0, 10) !== data) {
            throw httpError.httpError(400, "O parâmetro data deve conter uma data válida.");
        }

        return { dataServico: dataFiltro };
    }

    if (mes !== undefined && mes !== null && mes !== "") {
        if (typeof mes !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) {
            throw httpError.httpError(400, "O parâmetro mes deve estar no formato AAAA-MM.");
        }

        const inicio = new Date(`${mes}-01T00:00:00.000Z`);
        const fim = new Date(inicio);
        fim.setUTCMonth(fim.getUTCMonth() + 1);

        return { dataServico: { gte: inicio, lt: fim } };
    }

    return {};
}

export default {
    montarFiltroData
};

