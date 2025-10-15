import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { step, email, userId, newPassword } = await request.json();

    const connection = await getPool().getConnection();

    if (step === 'validate') {
      const [users] = await connection.execute(
        'SELECT id, name FROM users WHERE email = ?',
        [email]
      );
      
      connection.release();

      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json({ error: 'E-mail não encontrado no sistema' }, { status: 404 });
      }

      const user = users[0] as any;
      
      return NextResponse.json({
        success: true,
        userId: user.id,
        userName: user.name
      });
    }

    if (step === 'update') {
      if (!newPassword || newPassword.length < 6) {
        connection.release();
        return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, { status: 400 });
      }

      const hashedPassword = await hashPassword(newPassword);
      
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hashedPassword, userId]
      );
      
      connection.release();

      return NextResponse.json({ message: 'Senha modificada com sucesso!' });
    }

    return NextResponse.json({ error: 'Operação inválida' }, { status: 400 });

  } catch (error) {
    console.error('Error in change password:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}