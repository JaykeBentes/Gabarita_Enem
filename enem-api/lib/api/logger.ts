import { NextRequest } from 'next/server';

export async function logger(_request: NextRequest) {
    // Logger desabilitado para evitar erros do Prisma em produção
    return;
}
