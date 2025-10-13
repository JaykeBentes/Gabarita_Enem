import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// 2. Cria a função que vamos chamar para enviar o e-mail
export async function sendPasswordResetEmail(to: string, token: string) {
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;

  // 3. Define o conteúdo do e-mail
  const mailOptions = {
    from: 'Gabarita ENEM <nao-responda@gabaritaenem.com>',
    to: to,
    subject: 'Recuperação de Senha - Gabarita ENEM',
    html: `
      <div style="font-family: sans-serif; text-align: center;">
        <h2>Recuperação de Senha</h2>
        <p>Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:</p>
        <a 
          href="${resetLink}" 
          style="background-color: #7c3aed; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block;"
        >
          Redefinir Senha
        </a>
        <p>Este link irá expirar em 1 hora.</p>
        <p>Se você não solicitou isso, por favor, ignore este e-mail.</p>
      </div>
    `,
  };

  // 4. Envia o e-mail
  await transporter.sendMail(mailOptions);

  console.log(`E-mail de recuperação enviado para: ${to}`);
}