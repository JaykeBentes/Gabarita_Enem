# Deploy no Vercel - Configuração de Variáveis de Ambiente

## 1. Fazer Deploy
1. Conecte o repositório ao Vercel
2. Selecione a pasta `gabarita-enem` como root directory
3. Configure as variáveis de ambiente abaixo

## 2. Variáveis de Ambiente no Vercel
No painel do Vercel, vá em **Settings > Environment Variables** e adicione:

```
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=appenem_db
JWT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://seu-dominio.vercel.app
```

⚠️ **IMPORTANTE**: 
- Altere `NEXTAUTH_URL` para sua URL do Vercel
- Considere gerar novos secrets para produção
- Nunca commite o arquivo `.env.local`

## 3. API Externa (enem-api)
A enem-api roda localmente na porta 3001. Para produção, você precisará:
1. Fazer deploy da enem-api separadamente
2. Atualizar as URLs da API no código para apontar para a API em produção