import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const count = parseInt(searchParams.get('count') || '10');
    
    console.log(`=== API QUESTIONS NEXTJS ===`);
    console.log(`Subject: ${subject}, Count: ${count}`);
    
    if (!subject) {
      return NextResponse.json({ error: 'Matéria é obrigatória' }, { status: 400 });
    }

    // Anos disponíveis para seleção aleatória
    const availableYears = ['2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];
    
    // Mapear matérias do frontend para disciplinas da API
    const subjectMap: { [key: string]: string } = {
      'ciencias-humanas': 'ciencias-humanas',
      'ciencias-natureza': 'ciencias-natureza', 
      'linguagens': 'linguagens',
      'matematica': 'matematica'
    };
    
    if (!subjectMap[subject]) {
      return NextResponse.json({ error: 'Matéria não encontrada' }, { status: 400 });
    }

    let allQuestions: any[] = [];
    
    // Buscar questões de múltiplos anos até ter questões suficientes
    for (const year of availableYears) {
      if (allQuestions.length >= count * 3) break; // Buscar mais para garantir variedade
      
      try {
        // Para matemática e ciências da natureza, buscar questões do meio/final da prova
        let offset = 0;
        if (subject === 'matematica') offset = 130;
        else if (subject === 'ciencias-natureza') offset = 90;
        const enemApiUrl = process.env.ENEM_API_URL 
          ? `${process.env.ENEM_API_URL}/v1/exams/${year}/questions?limit=50&offset=${offset}`
          : `http://localhost:3001/v1/exams/${year}/questions?limit=50&offset=${offset}`;
        console.log(`Buscando em ${year}: ${enemApiUrl}`);
        
        const response = await fetch(enemApiUrl);
        if (!response.ok) continue;
        
        const data = await response.json();
        const yearQuestions = data.questions || [];
        
        // Filtrar por disciplina
        const filteredQuestions = yearQuestions.filter((q: any) => 
          q.discipline === subjectMap[subject]
        );
        
        console.log(`${year}: ${filteredQuestions.length} questões de ${subject}`);
        allQuestions.push(...filteredQuestions);
        
      } catch (error) {
        console.error(`Erro ao buscar questões de ${year}:`, error);
        continue;
      }
    }
    
    if (allQuestions.length === 0) {
      return NextResponse.json({ 
        error: `Nenhuma questão encontrada para a matéria: ${subject}` 
      }, { status: 404 });
    }
    
    // Embaralhar questões e selecionar exatamente a quantidade solicitada
    const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffledQuestions.slice(0, count);
    
    // Garantir que temos exatamente a quantidade solicitada
    if (selectedQuestions.length < count) {
      return NextResponse.json({ 
        error: `Apenas ${selectedQuestions.length} questões disponíveis para ${subject}, mas ${count} foram solicitadas` 
      }, { status: 404 });
    }
    
    console.log(`Questões selecionadas: ${selectedQuestions.length}`);
    
    return NextResponse.json({
      questions: selectedQuestions,
      metadata: {
        total: selectedQuestions.length,
        limit: count,
        subject: subject
      }
    });

  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}