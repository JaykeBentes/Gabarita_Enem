import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '../../../lib/database';

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

    // Buscar estatísticas gerais
    const [generalStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_simulations,
        AVG(score_percentage) as average_score,
        SUM(time_elapsed) as total_time,
        MAX(score_percentage) as best_score
      FROM simulations 
      WHERE user_id = ?
    `, [userId]);

    // Buscar desempenho por matéria
    const [subjectPerformance] = await connection.execute(`
      SELECT 
        subject,
        AVG(score_percentage) as average_score,
        COUNT(*) as simulations_count,
        MAX(score_percentage) as best_score,
        MIN(score_percentage) as worst_score
      FROM simulations 
      WHERE user_id = ? 
      GROUP BY subject
      ORDER BY average_score DESC
    `, [userId]);

    // Calcular evolução (últimos 30 dias vs 30 dias anteriores)
    const [evolutionData] = await connection.execute(`
      SELECT 
        AVG(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN score_percentage END) as recent_avg,
        AVG(CASE WHEN created_at < DATE_SUB(NOW(), INTERVAL 30 DAY) AND created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) THEN score_percentage END) as previous_avg
      FROM simulations 
      WHERE user_id = ?
    `, [userId]);

    // Identificar pontos fortes e áreas de melhoria
    const subjects = subjectPerformance as any[];
    const avgScore = (generalStats as any[])[0]?.average_score || 0;
    
    const strongPoints = subjects
      .filter(s => s.average_score > avgScore + 5)
      .map(s => s.subject)
      .slice(0, 3);

    const improvementAreas = subjects
      .filter(s => s.average_score < avgScore - 5)
      .map(s => s.subject)
      .slice(0, 3);

    connection.release();

    const stats = (generalStats as any[])[0];
    const evolution = (evolutionData as any[])[0];
    
    const evolutionPercentage = evolution.recent_avg && evolution.previous_avg 
      ? ((evolution.recent_avg - evolution.previous_avg) / evolution.previous_avg * 100).toFixed(1)
      : '0';

    return NextResponse.json({
      generalStats: {
        totalSimulations: stats?.total_simulations || 0,
        averageScore: Math.round(stats?.average_score || 0),
        totalHours: Math.round((stats?.total_time || 0) / 3600),
        evolution: `${evolutionPercentage > 0 ? '+' : ''}${evolutionPercentage}%`
      },
      subjectPerformance: subjects.map(subject => ({
        name: subject.subject,
        score: Math.round(subject.average_score)
      })),
      strongPoints,
      improvementAreas
    });

  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}