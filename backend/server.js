const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

// Usar http nativo do Node.js
const http = require('http');

const app = express();
const PORT = 3000;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'appenem_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

// Initialize database
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        birth_date DATE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS simulations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_questions INT NOT NULL,
        correct_answers INT NOT NULL,
        time_elapsed INT NOT NULL,
        score_percentage DECIMAL(5,2) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id, name, email, birth_date, password_hash FROM users WHERE email = ?',
      [email]
    );
    connection.release();

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        birthDate: user.birth_date
      }
    });

  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, birthDate, password } = req.body;

    if (!name || !email || !birthDate || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const connection = await pool.getConnection();
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await connection.execute(
      'INSERT INTO users (name, email, birth_date, password_hash) VALUES (?, ?, ?, ?)',
      [name, email, birthDate, passwordHash]
    );
    connection.release();

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: { name, email, birthDate }
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Simulation routes
app.get('/api/questions', async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const { subject, count = 10 } = req.query;
    const requestedCount = parseInt(count);
    
    console.log(`=== API QUESTIONS EXPRESS ===`);
    console.log(`Subject: ${subject}, Count: ${requestedCount}`);
    
    if (!subject) {
      return res.status(400).json({ error: 'Matéria é obrigatória' });
    }

    const disciplineMap = {
      'matematica': 'matematica',
      'ciencias-natureza': 'ciencias-natureza', 
      'linguagens': 'linguagens',
      'ciencias-humanas': 'ciencias-humanas'
    };
    
    const discipline = disciplineMap[subject];
    if (!discipline) {
      return res.status(400).json({ error: 'Disciplina inválida' });
    }

    const availableYears = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009];
    const allQuestions = [];
    const shuffledYears = [...availableYears].sort(() => 0.5 - Math.random());
    
    for (const year of shuffledYears) {
      if (allQuestions.length >= requestedCount) break;
      
      try {
        const detailsPath = path.join(__dirname, '..', 'enem-api', 'public', year.toString(), 'details.json');
        
        if (fs.existsSync(detailsPath)) {
          const details = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));
          const questionsForSubject = details.questions.filter(q => q.discipline === discipline);
          const shuffledQuestions = [...questionsForSubject].sort(() => 0.5 - Math.random());
          
          for (const questionMeta of shuffledQuestions) {
            if (allQuestions.length >= requestedCount) break;
            
            try {
              const questionPath = path.join(__dirname, '..', 'enem-api', 'public', year.toString(), 'questions', questionMeta.index.toString(), 'details.json');
              
              if (fs.existsSync(questionPath)) {
                const questionData = JSON.parse(fs.readFileSync(questionPath, 'utf8'));
                
                console.log(`\n=== PROCESSANDO QUESTÃO ${questionData.index}/${year} ===`);
                console.log('Context:', questionData.context?.substring(0, 100) + '...');
                console.log('AlternativesIntroduction:', questionData.alternativesIntroduction);
                console.log('Files:', questionData.files);
                console.log('Alternatives original:', questionData.alternatives);
                console.log('CorrectAlternative:', questionData.correctAlternative);
                
                const mappedQuestion = {
                  id: `${year}-${questionData.index}`,
                  index: questionData.index,
                  title: (questionData.context || '') + (questionData.alternativesIntroduction ? '\n\n' + questionData.alternativesIntroduction : ''),
                  alternatives: questionData.alternatives?.map(alt => ({
                    letter: alt.letter,
                    text: alt.text
                  })) || [],
                  correctAnswer: questionData.correctAlternative,
                  files: questionData.files || [],
                  year: year
                };
                
                console.log('Alternatives mapeadas:', mappedQuestion.alternatives);
                console.log('Título final:', mappedQuestion.title?.substring(0, 100) + '...');
                
                // Validações rigorosas
                const isValid = (
                  mappedQuestion.alternatives.length === 5 &&
                  mappedQuestion.correctAnswer &&
                  mappedQuestion.title &&
                  mappedQuestion.title.length > 10 &&
                  new Set(mappedQuestion.alternatives.map(a => a.text)).size === 5 && // Alternativas diferentes
                  mappedQuestion.alternatives.every(a => a.text && a.text.length > 0) && // Todas com texto
                  ['A', 'B', 'C', 'D', 'E'].includes(mappedQuestion.correctAnswer) // Resposta válida
                );
                
                if (isValid) {
                  allQuestions.push(mappedQuestion);
                  console.log('✅ Questão válida adicionada');
                } else {
                  console.log('❌ Questão inválida rejeitada:');
                  console.log('  - Alternativas:', mappedQuestion.alternatives.length);
                  console.log('  - Resposta:', mappedQuestion.correctAnswer);
                  console.log('  - Título válido:', mappedQuestion.title?.length > 10);
                  console.log('  - Alternativas diferentes:', new Set(mappedQuestion.alternatives.map(a => a.text)).size);
                }
              }
            } catch (questionError) {
              console.warn(`Erro questão ${questionMeta.index}:`, questionError.message);
            }
          }
        }
      } catch (error) {
        console.warn(`Erro ano ${year}:`, error.message);
      }
    }
    
    console.log(`Encontradas ${allQuestions.length} questões para ${subject}`);
    
    if (allQuestions.length < requestedCount) {
      return res.status(404).json({
        error: `Questões insuficientes. Encontradas: ${allQuestions.length}, Necessárias: ${requestedCount}`
      });
    }

    const finalQuestions = allQuestions.slice(0, requestedCount);
    console.log(`Retornando ${finalQuestions.length} questões`);
    
    res.json({ questions: finalQuestions });

  } catch (error) {
    console.error('Erro na API:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/simulations', async (req, res) => {
  try {
    const { subject, totalQuestions, correctAnswers, timeElapsed, answers, questions } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const userId = decoded.userId;

    const scorePercentage = (correctAnswers / totalQuestions) * 100;

    const connection = await pool.getConnection();
    await connection.execute(
      'INSERT INTO simulations (user_id, total_questions, correct_answers, time_elapsed, score_percentage, subject) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, totalQuestions, correctAnswers, timeElapsed, scorePercentage, subject]
    );
    connection.release();

    res.json({
      message: 'Simulação salva com sucesso',
      score: scorePercentage,
      correctAnswers,
      totalQuestions
    });

  } catch (error) {
    console.error('Error saving simulation:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Profile routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id, name, email, birth_date, created_at FROM users WHERE id = ?',
      [req.userId]
    );
    connection.release();

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = users[0];
    const memberSince = new Date(user.created_at).toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long' 
    });

    res.json({
      name: user.name,
      email: user.email,
      birthDate: user.birth_date,
      memberSince,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=7c3aed&color=ffffff&size=100`
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/performance', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Estatísticas gerais
    const [generalStats] = await connection.execute(
      'SELECT COUNT(*) as totalSimulations, COALESCE(ROUND(AVG(score_percentage), 0), 0) as averageScore, COALESCE(ROUND(SUM(time_elapsed) / 3600, 1), 0) as totalHours FROM simulations WHERE user_id = ?',
      [req.userId]
    );

    // Performance por matéria
    const [subjectStats] = await connection.execute(
      'SELECT subject, ROUND(AVG(score_percentage), 0) as score, COUNT(*) as count FROM simulations WHERE user_id = ? GROUP BY subject ORDER BY score DESC',
      [req.userId]
    );

    connection.release();


    
    const stats = generalStats[0] || { totalSimulations: 0, averageScore: 0, totalHours: 0 };
    const subjectMap = {
      'matematica': 'Matemática',
      'ciencias-natureza': 'Ciências da Natureza',
      'linguagens': 'Linguagens',
      'ciencias-humanas': 'Ciências Humanas'
    };

    const subjectPerformance = subjectStats.map(s => ({
      name: subjectMap[s.subject] || s.subject,
      score: parseInt(s.score) || 0
    }));

    // Determinar pontos fortes e áreas de melhoria
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
    
    res.json(response);

  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

app.get('/api/history', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [simulations] = await connection.execute(
      'SELECT subject, ROUND(score_percentage, 0) as score_percentage, created_at FROM simulations WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [req.userId]
    );
    connection.release();

    const subjectMap = {
      'matematica': 'Matemática',
      'ciencias-natureza': 'Ciências da Natureza',
      'linguagens': 'Linguagens',
      'ciencias-humanas': 'Ciências Humanas'
    };

    const recentHistory = simulations.map(sim => {
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

    res.json({ 
      recentHistory: recentHistory || []
    });

  } catch (error) {
    console.error('Error fetching history data:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Endpoint de teste para verificar questões
app.get('/api/test-question/:year/:index', async (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const { year, index } = req.params;
    const questionPath = path.join(__dirname, '..', 'enem-api', 'public', year, 'questions', index, 'details.json');
    
    if (!fs.existsSync(questionPath)) {
      return res.status(404).json({ error: 'Questão não encontrada' });
    }
    
    const questionData = JSON.parse(fs.readFileSync(questionPath, 'utf8'));
    
    const mappedQuestion = {
      id: `${year}-${questionData.index}`,
      index: questionData.index,
      title: (questionData.context || '') + (questionData.alternativesIntroduction ? '\n\n' + questionData.alternativesIntroduction : ''),
      alternatives: questionData.alternatives?.map(alt => ({
        letter: alt.letter,
        text: alt.text
      })) || [],
      correctAnswer: questionData.correctAlternative,
      year: parseInt(year)
    };
    
    const validation = {
      hasTitle: !!mappedQuestion.title && mappedQuestion.title.length > 10,
      has5Alternatives: mappedQuestion.alternatives.length === 5,
      hasCorrectAnswer: !!mappedQuestion.correctAnswer,
      alternativesDifferent: new Set(mappedQuestion.alternatives.map(a => a.text)).size === 5,
      allAlternativesHaveText: mappedQuestion.alternatives.every(a => a.text && a.text.length > 0),
      correctAnswerValid: ['A', 'B', 'C', 'D', 'E'].includes(mappedQuestion.correctAnswer)
    };
    
    res.json({
      original: questionData,
      mapped: mappedQuestion,
      validation,
      isValid: Object.values(validation).every(v => v)
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await initDatabase();
});