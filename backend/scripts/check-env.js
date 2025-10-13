const fs = require('fs');
const path = require('path');

function checkEnvFile() {
  console.log('=== VERIFICANDO ARQUIVO .env.local ===');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Arquivo .env.local não encontrado');
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  console.log('✅ Arquivo .env.local encontrado');
  console.log('Variáveis configuradas:');
  
  const requiredVars = ['DB_HOST', 'DB_USER', 'DB_NAME', 'SENDGRID_API_KEY'];
  const foundVars = {};
  
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value !== undefined) {
      foundVars[key.trim()] = value.trim();
      if (key.trim() === 'SENDGRID_API_KEY') {
        console.log(`  ${key.trim()}: ${value.substring(0, 10)}...`);
      } else {
        console.log(`  ${key.trim()}: ${value || '(vazio)'}`);
      }
    }
  });
  
  console.log('\n=== VERIFICAÇÃO DE VARIÁVEIS OBRIGATÓRIAS ===');
  requiredVars.forEach(varName => {
    if (foundVars[varName]) {
      console.log(`✅ ${varName}: Configurado`);
    } else {
      console.log(`❌ ${varName}: Não encontrado`);
    }
  });
}

function checkPackageJson() {
  console.log('\n=== VERIFICANDO DEPENDÊNCIAS ===');
  
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    console.error('❌ package.json não encontrado');
    return;
  }
  
  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const deps = { ...packageContent.dependencies, ...packageContent.devDependencies };
  
  const requiredDeps = ['mysql2', '@sendgrid/mail', 'next'];
  
  requiredDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`✅ ${dep}: ${deps[dep]}`);
    } else {
      console.log(`❌ ${dep}: Não instalado`);
    }
  });
}

function main() {
  console.log('🔍 VERIFICAÇÃO BÁSICA DE CONFIGURAÇÃO\n');
  
  checkEnvFile();
  checkPackageJson();
  
  console.log('\n=== INSTRUÇÕES ===');
  console.log('1. Certifique-se que todas as variáveis estão configuradas');
  console.log('2. Execute: npm install (se houver dependências faltando)');
  console.log('3. Inicie o servidor: npm run dev');
  console.log('4. Teste a funcionalidade observando os logs no terminal');
}

main();