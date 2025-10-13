import { NextResponse } from "next/server";
import { enemService } from '../../../../../lib/enem-service';

type Props = {
    params: Promise<{ year: string }>; 
};

export async function GET(request: Request, props: Props) {
    // Esta rota NÃO requer autenticação - é pública para acessar questões do ENEM
    try {
        const { year } = await props.params;
        const { searchParams } = new URL(request.url);
        const subject = searchParams.get('subject');
        const count = parseInt(searchParams.get('count') || '10');
        const random = searchParams.get('random') === 'true';

        console.log(`Requisição para questões ENEM: year=${year}, subject=${subject}, count=${count}, random=${random}`);

        const yearNum = parseInt(year);
        if (isNaN(yearNum)) {
            return NextResponse.json(
                { error: 'Ano inválido' },
                { status: 400 }
            );
        }

        let questions;
        
        // Usar sempre dados locais para garantir funcionamento
        if (random && subject) {
            questions = await enemService.getRandomQuestionsBySubject(yearNum, subject, count);
        } else if (random) {
            questions = await enemService.getRandomQuestions(yearNum, count);
        } else if (subject) {
            questions = await enemService.getQuestionsBySubject(yearNum, subject);
        } else {
            const exam = await enemService.getExamByYear(yearNum);
            questions = exam?.questions || [];
        }

        console.log(`Retornando ${questions.length} questões`);
        return NextResponse.json({ questions });
        
    } catch (err: any) {
        console.error('Erro geral na rota ENEM:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

