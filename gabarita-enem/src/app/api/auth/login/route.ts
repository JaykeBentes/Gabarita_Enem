import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    const connection = await getPool().getConnection();
    const [users] = await connection.execute(
      'SELECT id, name, email, birth_date, password_hash FROM users WHERE email = ?',
      [email]
    );
    connection.release();

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const user = users[0] as any;
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        birthDate: user.birth_date
      }
    });

  } catch (error) {
    console.error('Error logging in user:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}