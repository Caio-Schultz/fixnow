import httpError from "./httpError.js";
import documentValidator from "./documentValidator.js";

const IDADE_MINIMA = 18;

// Validações de formato

function validarNome(nome) {
    if (typeof nome !== 'string') {
        throw httpError.httpError(400, 'O nome é obrigatório e deve ser texto.');
    }

    const nomeLimpo = nome.trim();

    if (nomeLimpo.length < 2 || nomeLimpo.length > 100) {
        throw httpError.httpError(400, 'O nome é obrigatório e deve ter entre 2 e 100 caracteres')
    }

    return nomeLimpo;
}

function validarDocumento(documento) {
    if (typeof documento !== 'string') {
        throw httpError.httpError(400, 'O documento é obrigatório e deve ser texto.');
    }

    // Guarda apens os dígitos, sem '.' e '-'.
    const documentoLimpo = documento.replace(/\D/g, '');

    if (!documentValidator.validaCpfCnpj(documentoLimpo)) {
        throw httpError.httpError(400, 'Documento inválido.');
    }

    const tipoDocumento = documentoLimpo.length === 11 ? 'CPF' : 'CPNJ';

    return { documento: documentoLimpo, tipoDocumento };
}

// Validações de Data de Nascimento e de Idade
function isAnoBissexto(ano) {
    // Ano Bissexto: divisível por 4, exceto os divisíveis por 100, a não ser que sejam divisíveis por 400.
    if (ano % 400 === 0) return true;
    if (ano % 100 === 0) return false;
    if (ano % 4 === 0) return true;
    
    return false;
}

function diasDoMes(ano, mes) {
    const dias = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (mes === 2 && isAnoBissexto(ano)) {
        return 29;
    }

    return dias[mes - 1];
}

function calcularIdade(ano, mes, dia) {
    const hoje = new Date();
    const anoHoje = hoje.getFullYear();
    const mesHoje = hoje.getMonth() + 1; // getMonth() conta de 0 a 11
    const diaHoje = hoje.getDate();

    let idade = anoHoje - ano;

    // Se o aniversário deste ano ainda não chegou, tira 1 ano
    if (mesHoje < mes) {
        idade = idade - 1;
    } else if (mesHoje === mes && diaHoje < dia) {
        idade = idade - 1;
    }

    return idade;
}

function validarDataNasc(dataNasc) {
    const mensagemFormato = 'Data de nascimento inválida. Use o formato AAAA-MM-DD.';

    if (typeof dataNasc !== 'string') {
        throw httpError.httpError(400, mensagemFormato);
    }

    // "2000-05-10" vira ["2000", "05", "10"]
    const partes = dataNasc.split('-');

    if (partes.length !== 3 || partes[0].length !== 4 || partes[1].length !== 2 || partes[2].length !== 2) {
        throw httpError.httpError(400, mensagemFormato);
    }

    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    if (!Number.isInteger(ano) || !Number.isInteger(mes) || !Number.isInteger(dia)) {
        throw httpError.httpError(400, mensagemFormato);
    }

    if (ano < 1900 || mes < 1 || mes > 12) {
        throw httpError.httpError(400, mensagemFormato);
    }

    if (dia < 1 || dia > diasDoMes(ano, mes)) {
        throw httpError.httpError(400, mensagemFormato);
    }

    if (calcularIdade(ano, mes, dia) < IDADE_MINIMA) {
        throw httpError.httpError(400, `É necessário ter pelo menos ${IDADE_MINIMA} anos.`);
    }

    return new Date(dataNasc);
}

export default { validarNome, validarDocumento, validarDataNasc };