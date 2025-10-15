import { NextRequest } from 'next/server';
import { ipAddress, geolocation } from '@vercel/functions';
import { PrismaClient } from '@prisma/client';

export async function logger(request: NextRequest) {
    // Logger desabilitado para evitar erros do Prisma em produção
    return;
}
