# Instruções para Executar o AppEnem

## Pré-requisitos
- Node.js instalado
- MySQL instalado e rodando
- Banco de dados `appenem_db` criado

## Passos para execução

### 1. Instalar dependências

#### Frontend
```bash
cd frontend
npm install
```

#### Backend
```bash
cd backend
npm install
```

#### API Externa (ENEM)
```bash
cd enem-api
npm install
```

### 2. Configurar banco de dados
Execute o arquivo `database_setup.sql` no MySQL para criar as tabelas necessárias.

### 3. Executar os serviços

**IMPORTANTE: Execute na seguinte ordem:**

#### 1º - API Externa (porta 3001)
```bash
cd enem-api
npm run dev
```

#### 2º - Backend (porta 3000)
```bash
cd backend
npm run dev
```

#### 3º - Frontend (porta 5173)
```bash
cd frontend
npm run dev
```

### 4. Acessar a aplicação
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Externa ENEM: http://localhost:3001

## Funcionalidades do Simulado
### Como usar:
1. Acesse a aba "Simulado"
2. Selecione a matéria desejada
3. Escolha entre 5 ou 10 questões
4. Clique em "Iniciar Simulado"
5. Responda as questões e veja seus resultados

## Solução de Problemas

### Se as questões não carregarem:
1. Verifique se a API externa está rodando na porta 3001
2. Verifique se o backend está rodando na porta 3000
3. Verifique os logs do console para erros de conexão

