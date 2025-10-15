import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { subject, totalQuestions, correctAnswers, timeElapsed, answers, questions } = await request.json();
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const userId = decoded.userId;
    const scorePercentage = (correctAnswers / totalQuestions) * 100;

    const connection = await getPool().getConnection();
    await connection.execute(
      'INSERT INTO simulations (user_id, total_questions, correct_answers, time_elapsed, score_percentage, subject) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, totalQuestions, correctAnswers, timeElapsed, scorePercentage, subject]
    );
    connection.release();

    return NextResponse.json({
      message: 'Simulação salva com sucesso',
      score: scorePercentage,
      correctAnswers,
      totalQuestions
    });

  } catch (error) {
    console.error('Error saving simulation:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}