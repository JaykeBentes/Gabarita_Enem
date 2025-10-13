import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '../../../lib/database';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const userId = decoded.userId;

    const connection = await pool.getConnection();

    // Buscar histórico recente de simulações
    const [recentHistory] = await connection.execute(`
      SELECT 
        subject,
        score_percentage,
        created_at,
        total_questions,
        correct_answers,
        time_elapsed
      FROM simulations 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [userId]);

    connection.release();

    const formatGrade = (score: number) => {
      if (score >= 90) return { grade: 'Excelente', color: 'text-green-500' };
      if (score >= 80) return { grade: 'Muito Bom', color: 'text-green-400' };
      if (score >= 70) return { grade: 'Bom', color: 'text-yellow-500' };
      if (score >= 60) return { grade: 'Regular', color: 'text-orange-500' };
      return { grade: 'Precisa Melhorar', color: 'text-red-500' };
    };

    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(date));
    };

    const formattedHistory = (recentHistory as any[]).map(item => {
      const gradeInfo = formatGrade(item.score_percentage);
      return {
        subject: item.subject,
        date: formatDate(item.created_at),
        score: Math.round(item.score_percentage),
        grade: gradeInfo.grade,
        gradeColor: gradeInfo.color,
        totalQuestions: item.total_questions,
        correctAnswers: item.correct_answers,
        timeElapsed: Math.round(item.time_elapsed / 60) // em minutos
      };
    });

    return NextResponse.json({
      recentHistory: formattedHistory
    });

  } catch (error) {
    console.error('Error fetching history data:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}