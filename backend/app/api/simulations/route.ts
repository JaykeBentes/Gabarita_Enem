import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '../../../lib/database';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Token de autorização ausente');
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const userId = decoded.userId;
    console.log('UserId decodificado:', userId);

    const requestData = await request.json();
    console.log('Dados recebidos:', {
      subject: requestData.subject,
      totalQuestions: requestData.totalQuestions,
      correctAnswers: requestData.correctAnswers,
      timeElapsed: requestData.timeElapsed,
      answersCount: Object.keys(requestData.answers || {}).length,
      questionsCount: requestData.questions?.length
    });

    const { subject, totalQuestions, correctAnswers, timeElapsed, answers, questions } = requestData;

    // Validações
    if (!subject || !totalQuestions || correctAnswers === undefined || !timeElapsed) {
      console.log('Dados obrigatórios ausentes:', { subject, totalQuestions, correctAnswers, timeElapsed });
      return NextResponse.json(
        { error: 'Dados obrigatórios ausentes' },
        { status: 400 }
      );
    }

    const scorePercentage = (correctAnswers / totalQuestions) * 100;
    console.log('Score calculado:', scorePercentage);

    const connection = await pool.getConnection();

    try {
      // Inserir simulação
      console.log('Inserindo simulação...');
      const [simulationResult] = await connection.execute(
        'INSERT INTO simulations (user_id, total_questions, correct_answers, time_elapsed, score_percentage, subject) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, totalQuestions, correctAnswers, timeElapsed, scorePercentage, subject]
      );

      const simulationId = (simulationResult as any).insertId;
      console.log('Simulação inserida com ID:', simulationId);

      // Inserir respostas
      console.log('Inserindo respostas...');
      for (let i = 0; i < questions.length; i++) {
        const userAnswer = answers[i] || '';
        const correctAnswer = questions[i].correctAnswer;
        const isCorrect = userAnswer === correctAnswer;

        await connection.execute(
          'INSERT INTO simulation_answers (simulation_id, question_index, user_answer, correct_answer, is_correct) VALUES (?, ?, ?, ?, ?)',
          [simulationId, i, userAnswer, correctAnswer, isCorrect]
        );
      }
      console.log('Todas as respostas inseridas');

      connection.release();

      return NextResponse.json({
        message: 'Simulação salva com sucesso',
        simulationId,
        scorePercentage
      });
    } catch (dbError) {
      connection.release();
      throw dbError;
    }

  } catch (error) {
    console.error('Error saving simulation:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + (error as Error).message },
      { status: 500 }
    );
  }
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

    const [simulations] = await connection.execute(
      'SELECT * FROM simulations WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    connection.release();

    return NextResponse.json({ simulations });

  } catch (error) {
    console.error('Error fetching simulations:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}