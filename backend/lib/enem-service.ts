interface EnemQuestion {
  index: number;
  title: string;
  context?: string;
  files?: string[];
  alternatives: {
    letter: string;
    text: string;
    file?: string;
  }[];
  correctAnswer: string;
  year?: number;
}

interface EnemExam {
  year: number;
  questions: EnemQuestion[];
}

class EnemService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.ENEM_API_BASE || 'http://localhost:3001';
    console.log('EnemService inicializado com baseUrl:', this.baseUrl);
  }

  async getAvailableYears(): Promise<number[]> {
    try {
      console.log(`Buscando anos disponíveis em: ${this.baseUrl}`);
      const response = await fetch(`${this.baseUrl}/v1/exams`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AppEnem/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.years || data.map((exam: any) => exam.year) || [2023, 2022, 2021, 2020, 2019];
    } catch (error) {
      console.error('Erro ao buscar anos da API ENEM:', error);
      return [2023, 2022, 2021, 2020, 2019]; // fallback
    }
  }

  async getExamByYear(year: number): Promise<EnemExam | null> {
    try {
      console.log(`Buscando exame do ano ${year} em: ${this.baseUrl}`);
      const response = await fetch(`${this.baseUrl}/v1/exams/${year}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AppEnem/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const examData = await response.json();
      
      // Buscar as questões do exame
      const questionsResponse = await fetch(`${this.baseUrl}/v1/exams/${year}/questions?limit=50&offset=0`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AppEnem/1.0'
        }
      });
      
      if (!questionsResponse.ok) {
        throw new Error(`HTTP ${questionsResponse.status}: ${questionsResponse.statusText}`);
      }
      
      const questionsData = await questionsResponse.json();
      
      return {
        year,
        questions: questionsData.questions || []
      };
    } catch (error) {
      console.error(`Erro ao buscar exame do ano ${year}:`, error);
      throw error;
    }
  }

  async getQuestionsBySubject(year: number, subject: string): Promise<EnemQuestion[]> {
    try {
      const exam = await this.getExamByYear(year);
      if (!exam) {
        throw new Error(`Exame não encontrado para o ano ${year}`);
      }

      // Mapear matérias para filtros baseados na estrutura real da API
      const subjectFilters: { [key: string]: (q: any) => boolean } = {
        'matematica': (q) => {
          const content = (q.title + ' ' + (q.context || '') + ' ' + (q.statement || '')).toLowerCase();
          return content.includes('matemática') || content.includes('cálculo') || content.includes('função') || content.includes('equação');
        },
        'ciencias-natureza': (q) => {
          const content = (q.title + ' ' + (q.context || '') + ' ' + (q.statement || '')).toLowerCase();
          return content.includes('química') || content.includes('física') || content.includes('biologia') || content.includes('natureza');
        },
        'linguagens': (q) => {
          const content = (q.title + ' ' + (q.context || '') + ' ' + (q.statement || '')).toLowerCase();
          return content.includes('linguagem') || content.includes('português') || content.includes('literatura') || content.includes('texto');
        },
        'ciencias-humanas': (q) => {
          const content = (q.title + ' ' + (q.context || '') + ' ' + (q.statement || '')).toLowerCase();
          return content.includes('história') || content.includes('geografia') || content.includes('sociologia') || content.includes('filosofia');
        }
      };

      const filter = subjectFilters[subject];
      if (!filter) {
        return exam.questions;
      }

      const filteredQuestions = exam.questions.filter(filter);
      console.log(`Questões filtradas para ${subject}: ${filteredQuestions.length}`);
      
      return filteredQuestions;
    } catch (error) {
      console.error(`Erro ao buscar questões por matéria:`, error);
      throw error;
    }
  }

  async getRandomQuestions(year: number, count: number = 10): Promise<EnemQuestion[]> {
    try {
      const exam = await this.getExamByYear(year);
      if (!exam || exam.questions.length === 0) {
        throw new Error(`Nenhuma questão encontrada para o ano ${year}`);
      }

      const shuffled = [...exam.questions].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (error) {
      console.error(`Erro ao buscar questões aleatórias:`, error);
      throw error;
    }
  }

  async getRandomQuestionsBySubject(year: number, subject: string, count: number = 10): Promise<EnemQuestion[]> {
    try {
      console.log(`Buscando questões da API ENEM: subject=${subject}, count=${count}, year=${year}`);
      
      const questions = await this.getQuestionsBySubject(year, subject);
      if (questions.length === 0) {
        throw new Error(`Nenhuma questão encontrada para ${subject} no ano ${year}`);
      }

      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      const result = shuffled.slice(0, count);
      
      console.log(`Questões encontradas na API ENEM: ${result.length}`);
      return result;
    } catch (error) {
      console.error(`Erro ao buscar questões por matéria da API ENEM:`, error);
      throw error;
    }
  }

  async getRandomQuestionsFromMultipleYears(subject: string, count: number = 10): Promise<EnemQuestion[]> {
    try {
      const availableYears = await this.getAvailableYears();
      const allQuestions: EnemQuestion[] = [];

      for (const year of availableYears.slice(0, 3)) {
        try {
          const questions = await this.getQuestionsBySubject(year, subject);
          const questionsWithYear = questions.map(q => ({ ...q, year }));
          allQuestions.push(...questionsWithYear);
        } catch (error) {
          console.error(`Erro ao buscar questões do ano ${year}:`, error);
        }
      }

      if (allQuestions.length === 0) {
        throw new Error(`Nenhuma questão encontrada para ${subject}`);
      }

      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (error) {
      console.error(`Erro ao buscar questões de múltiplos anos:`, error);
      throw error;
    }
  }
}

export const enemService = new EnemService();
export type { EnemQuestion, EnemExam };