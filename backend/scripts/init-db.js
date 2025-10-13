const { initDatabase } = require('../lib/database.ts');

async function main() {
  try {
    console.log('Inicializando banco de dados...');
    await initDatabase();
    console.log('Banco de dados inicializado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao inicializar banco:', error);
    process.exit(1);
  }
}

main();