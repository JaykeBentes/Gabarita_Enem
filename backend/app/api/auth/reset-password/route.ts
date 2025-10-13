import { NextResponse } from 'next/server';
import pool from '../../../../lib/database';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {

        const body = await request.json();
        const { token, password } = body;

        // 3. Valida se o token e a nova senha foram fornecidos
        if (!token || !password) {
            return NextResponse.json({ error: 'Token e nova senha são obrigatórios.' }, { status: 400 });
        }

        console.log("Token recebido:", token);
        console.log("Nova senha recebida:", password);
        
        const hashedToken = crypto
            .createHash('sha256')
            .update(token) // Pega o token puro que veio do request
            .digest('hex'); // Transforma no hash

        console.log("Token 'hasheado' para busca no DB:", hashedToken);

        // 4. Busca o token hasheado no banco de dados
        const [rows]: [any[], any] = await pool.execute(
            'SELECT * FROM PasswordResetTokens WHERE token = ?',
            [hashedToken]
        );

        const tokenRecord = rows[0];

        if (!tokenRecord) {
            return NextResponse.json({ error: 'Token de redefinição inválido ou expirado.' }, { status: 400 });
        }

        console.log("Registro de token encontrado no DB:", tokenRecord);

        // 6. Verifica se o token já expirou
        const now = new Date();
        if (now > new Date(tokenRecord.expiresAt)) {
            await pool.execute('DELETE FROM PasswordResetTokens WHERE id = ?', [tokenRecord.id]);
            
            return NextResponse.json({ error: 'Token de redefinição inválido ou expirado.' }, { status: 400 });
        }

        console.log("Token verificado com sucesso e dentro do prazo de validade.");
        
        // 7. Hashea a nova senha
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log("Nova senha hasheada:", hashedPassword);

        // 8. Atualiza a senha do usuário no banco de dados
        await pool.execute(
            'UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, tokenRecord.userId]
        );

        console.log(`Senha do usuário ${tokenRecord.userId} foi atualizada com sucesso.`);

        // 9. Deleta o token que foi utilizado da tabela de tokens
        await pool.execute(
            'DELETE FROM PasswordResetTokens WHERE id = ?',
            [tokenRecord.id]
        );

        console.log(`Token ${tokenRecord.id} foi deletado após o uso.`);


        return NextResponse.json({ message: 'Senha redefinida com sucesso!' });

    } catch (error) {
        console.error("Erro no endpoint /reset-password:", error);
        return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
    }
}