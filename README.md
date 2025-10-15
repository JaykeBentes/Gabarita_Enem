# Gabarita ENEM

Sistema completo de simulados do ENEM com questões reais dos anos 2015-2023.

## 🚀 Funcionalidades

- **Simulados por Matéria**: Matemática, Ciências da Natureza, Linguagens e Ciências Humanas
- **Questões Reais**: Base de dados com questões oficiais do ENEM 2015-2023
- **Interface Moderna**: Design responsivo e intuitivo
- **Resultados Detalhados**: Análise completa do desempenho
- **Área de Estudos**: Vídeos educacionais organizados por matéria
- **Perfil do Usuário**: Acompanhamento do progresso e estatísticas

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: TiDB Cloud (MySQL compatível)
- **API Externa**: ENEM API (localhost:3001)
- **Autenticação**: NextAuth.js

## 📁 Estrutura do Projeto

```
Gabarita_Enem/
├── gabarita-enem/          # Aplicação principal Next.js
│   ├── src/
│   │   ├── app/            # App Router do Next.js
│   │   ├── components/     # Componentes React
│   │   ├── lib/           # Utilitários e configurações
│   │   └── types/         # Definições TypeScript
│   └── ...
├── enem-api/              # API externa com questões do ENEM
└── backend/               # [Projeto antigo - pode ser removido]
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### 1. Instalar dependências da API ENEM
```bash
cd enem-api
npm install
npm run dev  # Roda na porta 3001
```

### 2. Configurar e executar a aplicação principal
```bash
cd gabarita-enem
npm install
```

### 3. Configurar variáveis de ambiente
Crie o arquivo `.env.local` em `gabarita-enem/`:
```env
# TiDB Cloud Database
DATABASE_URL="mysql://[user]:[password]@[host]:4000/[database]?sslaccept=strict"
TIDB_HOST="gateway01.us-east-1.prod.aws.tidbcloud.com"
TIDB_PORT="4000"
TIDB_USER="[seu_usuario]"
TIDB_PASSWORD="[sua_senha]"
TIDB_DATABASE="[seu_database]"

# NextAuth
NEXTAUTH_SECRET="[chave_secreta]"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Executar a aplicação
```bash
npm run dev  # Roda na porta 3000
```

## 📊 Funcionalidades Principais

### Simulados
- Seleção por matéria (Matemática, Ciências da Natureza, Linguagens, Ciências Humanas)
- Opção de 5 ou 10 questões
- Timer integrado
- Questões com contexto completo, imagens e alternativas
- Resultado detalhado com correção

### Área de Estudos
- Vídeos educacionais organizados por matéria
- Player integrado do YouTube
- Conteúdo curado para preparação ENEM

### Perfil do Usuário
- Estatísticas de desempenho
- Histórico de simulados
- Análise de pontos fortes e áreas de melhoria

## 🎯 API de Questões

A aplicação consome questões da ENEM API local que fornece:
- Questões oficiais do ENEM 2015-2023
- Filtros por disciplina e ano
- Imagens e contexto completo das questões
- Alternativas corretas identificadas

## 🚀 Deploy

O projeto está configurado para deploy no Vercel:
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

## 📝 Licença

Este projeto está sob a licença MIT.