// Consumo de API da BrasilAPI para captação de dados de endereço cadastrado principalmente de latitude e longitude.

import axios from 'axios';
import httpError from './httpError.js';

const BRASIL_API_CEP_URL = 'https://brasilapi.com.br/api/cep/v2';

async function buscarCep(cep) {
    const cepLimpo = String(cep).replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
        throw httpError.httpError(400, 'CEP inválido. Informe 8 dígitos numéricos.');
    }

    try {
        const { data } = await axios.get(`${BRASIL_API_CEP_URL}/${cepLimpo}`, {
            timeout: 5000,
        });

        const coords = data.location?.coordinates ?? {};
        const latBruta = coords.latitude;
        const lonBruta = coords.longitude;

        const latitude =
            latBruta !== undefined && latBruta !== null && latBruta !== '' ? Number(latBruta) : null;
        const longitude =
            lonBruta !== undefined && lonBruta !== null && lonBruta !== '' ? Number(lonBruta) : null;

        return {
            cep: cepLimpo,
            estado: data.state || null,
            cidade: data.city || null,
            bairro: data.neighborhood || null,
            rua: data.street || null,
            latitude: Number.isNaN(latitude) ? null : latitude,
            longitude: Number.isNaN(longitude) ? null : longitude,
        };
    } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 400) {
            throw httpError.httpError(404, 'CEP não encontrado.');
        }

        throw httpError.httpError(502, 'Não foi possível consultar o CEP no momento. Tente novamente.');
    }
}

export default { buscarCep };