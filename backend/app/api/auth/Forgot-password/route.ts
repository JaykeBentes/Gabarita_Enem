import { NextResponse } from 'next/server';
import crypto from 'crypto';
import pool from '../../../../lib/database';
import { sendPasswordResetEmail } from '../../../../lib/mail';

/**
 * Função para lidar com a requisição de verificação CORS (preflight).
 * O navegador a envia antes do POST para pedir permissão.
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

/**
 * Função principal que lida com a lógica de recuperação de senha.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'O campo e-mail é obrigatório' }, { status: 400 });
        }

        const [rows]: [any[], any] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        const user = rows[0];

        if (user) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            const tokenExpiry = new Date(Date.now() + 3600000); 

            await pool.execute(
                'INSERT INTO PasswordResetTokens (userId, token, expiresAt) VALUES (?, ?, ?)',
                [user.id, hashedToken, tokenExpiry]
            );

            await sendPasswordResetEmail(user.email, resetToken);
        }

        return NextResponse.json({ message: "Um link de recuperação foi enviado." });

    } catch (error) {
        console.error("Erro no endpoint /forgot-password:", error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}