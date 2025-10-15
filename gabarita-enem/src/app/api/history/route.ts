import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/database';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

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
    const [simulations] = await connection.execute(
      'SELECT subject, ROUND(score_percentage, 0) as score_percentage, created_at FROM simulations WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [decoded.userId]
    );
    connection.release();

    const subjectMap: { [key: string]: string } = {
      'matematica': 'Matemática',
      'ciencias-natureza': 'Ciências da Natureza',
      'linguagens': 'Linguagens',
      'ciencias-humanas': 'Ciências Humanas'
    };

    const recentHistory = (simulations as any[]).map(sim => {
      const score = parseInt(sim.score_percentage) || 0;
      let grade, gradeColor;
      
      if (score >= 80) {
        grade = 'Excelente';
        gradeColor = 'text-green-500';
      } else if (score >= 60) {
        grade = 'Bom';
        gradeColor = 'text-blue-500';
      } else {
        grade = 'Precisa Melhorar';
        gradeColor = 'text-orange-500';
      }

      return {
        subject: subjectMap[sim.subject] || sim.subject,
        score: `${score}%`,
        grade,
        gradeColor,
        date: new Date(sim.created_at).toLocaleDateString('pt-BR')
      };
    });

    return NextResponse.json({ 
      recentHistory: recentHistory || []
    });

  } catch (error) {
    console.error('Error fetching history data:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}