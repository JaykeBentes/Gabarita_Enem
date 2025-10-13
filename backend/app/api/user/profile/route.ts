import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '../../../../lib/database';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const connection = await pool.getConnection();

    const [users] = await connection.execute(
      'SELECT id, name, email, birth_date, created_at FROM users WHERE id = ?',
      [userId]
    );

    connection.release();

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const user = users[0] as any;

    // Adicionar campos adicionais
    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      birthDate: user.birth_date,
      memberSince: new Date(user.created_at).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long' 
      }),
      avatarUrl: `https://placehold.co/100x100/7c3aed/ffffff?text=${user.name.charAt(0).toUpperCase()}`
    };

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}