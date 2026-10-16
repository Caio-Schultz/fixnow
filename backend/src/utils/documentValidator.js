function validaCpfCnpj(val) {
    // Converte para string e limpa tudo que não for dígito
    const cleanedVal = String(val).replace(/\D/g, '');

    // Verifica CPFs (exatamente 11 dígitos)
    if (cleanedVal.length === 11) {
        // Verifica sequências repetidas (ex: 11111111111) usando Regex
        if (/^(\d)\1+$/.test(cleanedVal)) return false;

        let v1 = 0;
        let v2 = 0;

        // Primeiro dígito CPF
        for (let i = 0, p = 10; i < 9; i++, p--) {
            v1 += parseInt(cleanedVal[i]) * p;
        }
        v1 = (v1 * 10) % 11;
        if (v1 === 10) v1 = 0;
        if (v1 !== parseInt(cleanedVal[9])) return false;

        // Segundo dígito CPF
        for (let i = 0, p = 11; i < 10; i++, p--) {
            v2 += parseInt(cleanedVal[i]) * p;
        }
        v2 = (v2 * 10) % 11;
        if (v2 === 10) v2 = 0;
        
        return v2 === parseInt(cleanedVal[10]);
    } 
    
    // Verifica CNPJs (exatamente 14 dígitos)
    else if (cleanedVal.length === 14) {
        if (/^(\d)\1+$/.test(cleanedVal)) return false;

        let v1 = 0;
        let v2 = 0;

        // Primeiro dígito CNPJ
        for (let i = 0, p1 = 5, p2 = 13; i < 12; i++, p1--, p2--) {
            v1 += parseInt(cleanedVal[i]) * (p1 >= 2 ? p1 : p2);
        }
        v1 = v1 % 11;
        v1 = v1 < 2 ? 0 : 11 - v1;
        if (v1 !== parseInt(cleanedVal[12])) return false;

        // Segundo dígito CNPJ
        for (let i = 0, p1 = 6, p2 = 14; i < 13; i++, p1--, p2--) {
            v2 += parseInt(cleanedVal[i]) * (p1 >= 2 ? p1 : p2);
        }
        v2 = v2 % 11;
        v2 = v2 < 2 ? 0 : 11 - v2;
        
        return v2 === parseInt(cleanedVal[13]);
    }

    // Se não tiver 11 nem 14 dígitos de números puros, é inválido
    return false;
}

export default { validaCpfCnpj };