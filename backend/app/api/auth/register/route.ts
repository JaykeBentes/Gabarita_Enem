import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool, { initDatabase } from '../../../../lib/database';

let dbInitialized = false;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function POST(request: Request) {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
  try {
    const { name, email, birthDate, password } = await request.json();

    if (!name || !email || !birthDate || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      connection.release();
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await connection.execute(
      'INSERT INTO users (name, email, birth_date, password_hash) VALUES (?, ?, ?, ?)',
      [name, email, birthDate, passwordHash]
    );

    connection.release();

    const response = NextResponse.json(
      { 
        message: 'Usuário criado com sucesso',
        user: { name, email, birthDate }
      },
      { status: 201 }
    );
    
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return response;

  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}