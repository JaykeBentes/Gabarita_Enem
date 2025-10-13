class EnemService {
  constructor() {
    this.baseUrl = process.env.ENEM_API_BASE || 'http://localhost:3001';
  }

  async getAvailableYears() {
    try {
      const response = await fetch(`${this.baseUrl}/v1/exams`);
      if (!response.ok) {
        throw new Error('Failed to fetch available years');
      }
      const data = await response.json();
      return data.map(exam => exam.year) || [];
    } catch (error) {
      console.error('Error fetching available years:', error);
      return [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015]; // fallback
    }
  }

  async getExamByYear(year) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/exams/${year}/questions?limit=200&offset=0`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return {
        year,
        questions: data.questions || []
      };
    } catch (error) {
      console.error(`Error fetching exam for year ${year}:`, error);
      return null;
    }
  }

  async getQuestionsBySubject(year, subject) {
    const exam = await this.getExamByYear(year);
    if (!exam) return [];

    // Mapear matérias para códigos da API
    const subjectMap = {
      'matematica': 'matematica',
      'ciencias-natureza': 'ciencias-natureza', 
      'linguagens': 'linguagens',
      'ciencias-humanas': 'ciencias-humanas'
    };

    const disciplineCode = subjectMap[subject];
    if (!disciplineCode) return exam.questions;

    // Filtrar questões por disciplina usando o código
    return exam.questions.filter(q => q.discipline === disciplineCode);
  }

  async getRandomQuestions(year, count = 10) {
    const exam = await this.getExamByYear(year);
    if (!exam || exam.questions.length === 0) return [];

    const shuffled = [...exam.questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async getRandomQuestionsBySubject(year, subject, count = 10) {
    const questions = await this.getQuestionsBySubject(year, subject);
    if (questions.length === 0) return [];

    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async getRandomQuestionsFromMultipleYears(subject, count = 10) {
    console.log(`Gerando questões mock para ${subject}, quantidade: ${count}`);
    
    // Questões mock temporárias para testar
    const mockQuestions = [];
    
    for (let i = 1; i <= count; i++) {
      mockQuestions.push({
        index: i,
        title: `Questão ${i} - ${subject.toUpperCase()} - ENEM 2023`,
        context: `Contexto da questão ${i} sobre ${subject}. Esta é uma questão de exemplo para testar o sistema.`,
        alternatives: [
          { letter: 'A', text: `Alternativa A da questão ${i}` },
          { letter: 'B', text: `Alternativa B da questão ${i}` },
          { letter: 'C', text: `Alternativa C da questão ${i}` },
          { letter: 'D', text: `Alternativa D da questão ${i}` },
          { letter: 'E', text: `Alternativa E da questão ${i}` }
        ],
        correctAnswer: ['A', 'B', 'C', 'D', 'E'][Math.floor(Math.random() * 5)],
        discipline: subject,
        year: 2023
      });
    }
    
    console.log(`Questões mock geradas: ${mockQuestions.length}`);
    return mockQuestions;
  }
}

const enemService = new EnemService();
module.exports = { enemService };