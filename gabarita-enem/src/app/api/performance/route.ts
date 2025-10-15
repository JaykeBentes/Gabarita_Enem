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
    
    const [generalStats] = await connection.execute(
      'SELECT COUNT(*) as totalSimulations, COALESCE(ROUND(AVG(score_percentage), 0), 0) as averageScore, COALESCE(ROUND(SUM(time_elapsed) / 3600, 1), 0) as totalHours FROM simulations WHERE user_id = ?',
      [decoded.userId]
    );

    const [subjectStats] = await connection.execute(
      'SELECT subject, ROUND(AVG(score_percentage), 0) as score, COUNT(*) as count FROM simulations WHERE user_id = ? GROUP BY subject ORDER BY score DESC',
      [decoded.userId]
    );

    connection.release();

    const stats = (generalStats as any[])[0] || { totalSimulations: 0, averageScore: 0, totalHours: 0 };
    const subjectMap: { [key: string]: string } = {
      'matematica': 'Matemática',
      'ciencias-natureza': 'Ciências da Natureza',
      'linguagens': 'Linguagens',
      'ciencias-humanas': 'Ciências Humanas'
    };

    const subjectPerformance = (subjectStats as any[]).map(s => ({
      name: subjectMap[s.subject] || s.subject,
      score: parseInt(s.score) || 0
    }));

    const strongPoints = subjectPerformance.filter(s => s.score >= 70).map(s => s.name);
    const improvementAreas = subjectPerformance.filter(s => s.score < 70).map(s => s.name);

    const response = {
      generalStats: {
        totalSimulations: parseInt(stats.totalSimulations) || 0,
        averageScore: parseInt(stats.averageScore) || 0,
        totalHours: parseFloat(stats.totalHours) || 0,
        evolution: stats.totalSimulations > 1 ? '+5%' : '0%'
      },
      subjectPerformance: subjectPerformance || [],
      strongPoints: strongPoints || [],
      improvementAreas: improvementAreas || []
    };
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}