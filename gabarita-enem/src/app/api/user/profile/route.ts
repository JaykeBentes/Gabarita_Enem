import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const connection = await getPool().getConnection();
    const [users] = await connection.execute(
      'SELECT id, name, email, birth_date, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );
    connection.release();

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const user = users[0] as any;
    const memberSince = new Date(user.created_at).toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long' 
    });

    return NextResponse.json({
      name: user.name,
      email: user.email,
      birthDate: user.birth_date,
      memberSince,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=ffffff&size=100`
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}