import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { name, email, birthDate, password } = await request.json();

    if (!name || !email || !birthDate || !password) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    const connection = await getPool().getConnection();
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      connection.release();
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    await connection.execute(
      'INSERT INTO users (name, email, birth_date, password_hash) VALUES (?, ?, ?, ?)',
      [name, email, birthDate, passwordHash]
    );
    connection.release();

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: { name, email, birthDate }
    }, { status: 201 });

  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}