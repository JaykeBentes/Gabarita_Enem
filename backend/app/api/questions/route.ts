import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const count = parseInt(searchParams.get('count') || '10');

    console.log(`=== API QUESTIONS ===`);
    console.log(`Subject: ${subject}, Count: ${count}`);

    if (!subject) {
      return NextResponse.json({ error: 'Matéria é obrigatória' }, { status: 400 });
    }

    const disciplineMap: { [key: string]: string } = {
      'matematica': 'matematica',
      'ciencias-natureza': 'ciencias-natureza', 
      'linguagens': 'linguagens',
      'ciencias-humanas': 'ciencias-humanas'
    };
    
    const discipline = disciplineMap[subject];
    if (!discipline) {
      return NextResponse.json({ error: 'Disciplina inválida' }, { status: 400 });
    }

    const availableYears = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009];
    const allQuestions: any[] = [];
    const shuffledYears = [...availableYears].sort(() => 0.5 - Math.random());
    
    for (const year of shuffledYears) {
      if (allQuestions.length >= count) break;
      
      try {
        const detailsPath = path.join(process.cwd(), '..', 'enem-api', 'public', year.toString(), 'details.json');
        
        if (fs.existsSync(detailsPath)) {
          const details = JSON.parse(fs.readFileSync(detailsPath, 'utf8'));
          const questionsForSubject = details.questions.filter((q: any) => q.discipline === discipline);
          const shuffledQuestions = [...questionsForSubject].sort(() => 0.5 - Math.random());
          
          for (const questionMeta of shuffledQuestions) {
            if (allQuestions.length >= count) break;
            
            try {
              const questionPath = path.join(process.cwd(), '..', 'enem-api', 'public', year.toString(), 'questions', questionMeta.index.toString(), 'details.json');
              
              if (fs.existsSync(questionPath)) {
                const questionData = JSON.parse(fs.readFileSync(questionPath, 'utf8'));
                
                const mappedQuestion = {
                  id: `${year}-${questionData.index}`,
                  index: questionData.index,
                  title: (questionData.context || '') + (questionData.alternativesIntroduction ? '\n\n' + questionData.alternativesIntroduction : ''),
                  alternatives: questionData.alternatives?.map((alt: any) => ({
                    letter: alt.letter,
                    text: alt.text
                  })) || [],
                  correctAnswer: questionData.correctAlternative,
                  year: year
                };
                
                if (mappedQuestion.alternatives.length === 5 && mappedQuestion.correctAnswer) {
                  allQuestions.push(mappedQuestion);
                }
              }
            } catch (questionError) {
              console.warn(`Erro questão ${questionMeta.index}:`, questionError);
            }
          }
        }
      } catch (error) {
        console.warn(`Erro ano ${year}:`, error);
      }
    }
    
    console.log(`Encontradas ${allQuestions.length} questões para ${subject}`);
    
    if (allQuestions.length < count) {
      return NextResponse.json({
        error: `Questões insuficientes. Encontradas: ${allQuestions.length}, Necessárias: ${count}`
      }, { status: 404 });
    }

    const finalQuestions = allQuestions.slice(0, count);
    console.log(`Retornando ${finalQuestions.length} questões`);
    
    return NextResponse.json({ questions: finalQuestions });

  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

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

