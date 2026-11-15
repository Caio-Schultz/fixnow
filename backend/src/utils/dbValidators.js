import prisma from '../db/prisma.js';

async function verificarEmailExistente(perfil, email, idIgnorado = null) {
    const tabela = perfil === 'CLIENTE' ? prisma.cliente : prisma.profissional;
    const registro = await tabela.findUnique({ where: { email } });
    
    if (registro) {
        const idRegistro = perfil === 'CLIENTE' ? registro.idCliente : registro.idProfissional;
        if (idRegistro !== idIgnorado) return true; // E-mail pertence a outra pessoa
    }
    return false;
}

async function verificarTelefoneExistente(perfil, telefone, idIgnorado = null) {
    const tabela = perfil === 'CLIENTE' ? prisma.cliente : prisma.profissional;
    // Usamos findFirst porque o telefone não tem restrição @unique no schema
    const registro = await tabela.findFirst({ where: { telefone } });
    
    if (registro) {
        const idRegistro = perfil === 'CLIENTE' ? registro.idCliente : registro.idProfissional;
        if (idRegistro !== idIgnorado) return true; // Telefone pertence a outra pessoa
    }
    return false;
}

async function verificarProfissaoExistente(idProfissao) {
    const profissao = await prisma.profissao.findUnique({ 
        where: { idProfissao: idProfissao } 
    });
    return !!profissao; // Retorna true se encontrou, false se for nulo
}

export default { 
    verificarEmailExistente, 
    verificarTelefoneExistente,
    verificarProfissaoExistente
};