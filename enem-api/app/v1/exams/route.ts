import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { readFile } from 'node:fs/promises';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const filePath = path.join(process.cwd(), 'public/exams.json');
        const examsRaw = await readFile(filePath, 'utf-8');
        const exams = JSON.parse(examsRaw);
        
        return NextResponse.json(exams);
    } catch (error) {
        return NextResponse.json({
            error: {
                code: 'internal_server_error',
                message: error instanceof Error ? error.message : 'Unknown error'
            }
        }, { status: 500 });
    }
}
