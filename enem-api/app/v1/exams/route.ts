import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { RateLimiter } from '@/lib/api/rate-limit';
import { logger } from '@/lib/api/logger';

export const dynamic = 'force-dynamic';

const rateLimiter = new RateLimiter();

export async function GET(request: NextRequest) {
    try {
        const { rateLimitHeaders } = rateLimiter.check(request);
        await logger();
        
        const filePath = path.join(process.cwd(), 'public/exams.json');
        const examsRaw = await readFile(filePath, 'utf-8');
        const exams = JSON.parse(examsRaw);
        
        return NextResponse.json(exams, { headers: rateLimitHeaders });
    } catch (error) {
        return NextResponse.json({
            error: {
                code: 'internal_server_error',
                message: error instanceof Error ? error.message : 'An internal server error occurred.',
                docUrl: 'https://enem.dev/docs/errors#internal-server-error'
            }
        }, { status: 500 });
    }
}
