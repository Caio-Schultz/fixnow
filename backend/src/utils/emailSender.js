import nodemailer from 'nodemailer';

function criarTransporter() {
    // Se não houver servidor SMTP configurado (ex: ambiente de testes automatizados),
    // usa o transporte em memória do próprio Nodemailer para não falhar por falta de rede.
    if (!process.env.SMTP_HOST) {
        return nodemailer.createTransport({ jsonTransport: true });
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

async function enviarCodigoRecuperacao(destinatario, codigo) {
    const transporter = criarTransporter();

    const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"FixNow" <noreply@fixnow.com>',
        to: destinatario,
        subject: 'FixNow - Código de recuperação de senha',
        text: `Seu código de recuperação de senha é: ${codigo}. Ele expira em 30 minutos.`,
        html: `
            <p>Você solicitou a recuperação da sua senha no <strong>FixNow</strong>.</p>
            <p>Seu código de verificação é: <strong>${codigo}</strong></p>
            <p>Este código é válido por <strong>30 minutos</strong>.</p>
        `,
    });
}

export default { enviarCodigoRecuperacao };