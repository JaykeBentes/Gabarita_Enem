import { NextResponse } from "next/server";

export async function GET(
    request: Request,
        { params }: { params: { year: string } }
) {
    try {
    const year = params.year;

    // URL da API ENEM local (a que você rodou com git clone)
    const base = process.env.ENEM_API_BASE || "http://localhost:3000";

    // Monta a URL para pegar o details.json daquele ano
    const res = await fetch(`${base}/${year}/details.json`);

    if (!res.ok) {
        return NextResponse.json(
            { error: `Não foi possível carregar dados do ENEM ${year}` },
            { status: 404 }
        );
    }

    const data = await res.json();
    return NextResponse.json(data);

    } catch (err) {
        return NextResponse.json(
            { error: "Erro interno no servidor", details: String(err) },
            { status: 500 }
        );
    }
}
