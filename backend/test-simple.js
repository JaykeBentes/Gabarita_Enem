const mysql = require('mysql2/promise');

async function testSpecificEmail() {
  let connection;
  
  try {
    console.log('=== TESTE EMAIL ESPECÍFICO ===');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'appenem_db'
    });
    
    // Verificar se o email existe
    const [users] = await connection.execute(
      'SELECT id, name, email FROM users WHERE email = ?',
      ['jakebentes@hotmail.com']
    );
    
    if (users.length > 0) {
      console.log('✓ Email encontrado:', users[0]);
    } else {
      console.log('❌ Email não encontrado no banco');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testSpecificEmail();