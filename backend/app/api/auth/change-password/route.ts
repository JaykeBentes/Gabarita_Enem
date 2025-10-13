import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '../../../../lib/database';

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
  console.log('=== CHANGE PASSWORD API CHAMADA ===');
  
  try {
    const body = await request.json();
    console.log('Body recebido:', body);
    
    const { step, email, userId, newPassword } = body;
    console.log('Parâmetros extraídos:', { step, email, userId, newPassword: newPassword ? '[PRESENTE]' : '[AUSENTE]' });

    const connection = await pool.getConnection();
    console.log('Conexão com banco obtida');

    if (step === 'validate') {
      console.log('=== VALIDANDO EMAIL ===');
      console.log('Email para validar:', email);
      
      const [users] = await connection.execute(
        'SELECT id, name FROM users WHERE email = ?',
        [email]
      );
      
      console.log('Resultado da consulta:', users);
      connection.release();

      if (!Array.isArray(users) || users.length === 0) {
        console.log('Email não encontrado');
        return NextResponse.json(
          { error: 'E-mail não encontrado no sistema' },
          { status: 404 }
        );
      }

      const user = users[0] as any;
      console.log('Usuário encontrado:', user);
      
      const response = NextResponse.json({
        success: true,
        userId: user.id,
        userName: user.name
      });
      
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173');
      return response;
    }

    if (step === 'update') {
      console.log('=== ATUALIZANDO SENHA ===');
      console.log('UserId:', userId);
      console.log('Nova senha presente:', !!newPassword);
      
      if (!newPassword || newPassword.length < 6) {
        console.log('Senha inválida');
        connection.release();
        return NextResponse.json(
          { error: 'A nova senha deve ter pelo menos 6 caracteres' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      console.log('Senha hasheada gerada');
      
      const [result] = await connection.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [hashedPassword, userId]
      );
      
      console.log('Resultado da atualização:', result);
      connection.release();

      const response = NextResponse.json({
        message: 'Senha modificada com sucesso!'
      });
      
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:5173');
      return response;
    }

    return NextResponse.json(
      { error: 'Operação inválida' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in change password:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}