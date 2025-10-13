const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Configuração do banco
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'appenem_db'
};

async function testChangePassword() {
  let connection;
  
  try {
    console.log('=== TESTE DE MODIFICAR SENHA ===');
    
    // Conectar ao banco
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Conectado ao banco de dados');
    
    // 1. Verificar se existe usuário de teste
    const [users] = await connection.execute(
      'SELECT id, name, email FROM users LIMIT 1'
    );
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco');
      
      // Criar usuário de teste
      const testPassword = await bcrypt.hash('123456', 12);
      await connection.execute(
        'INSERT INTO users (name, email, birth_date, password_hash) VALUES (?, ?, ?, ?)',
        ['Usuário Teste', 'teste@email.com', '2000-01-01', testPassword]
      );
      console.log('✓ Usuário de teste criado: teste@email.com / 123456');
      
      // Buscar o usuário criado
      const [newUsers] = await connection.execute(
        'SELECT id, name, email FROM users WHERE email = ?',
        ['teste@email.com']
      );
      
      if (newUsers.length > 0) {
        console.log('✓ Usuário encontrado:', newUsers[0]);
      }
    } else {
      console.log('✓ Usuário encontrado:', users[0]);
    }
    
    // 2. Testar validação de email
    console.log('\n--- TESTE 1: Validação de Email ---');
    const testEmail = users.length > 0 ? users[0].email : 'teste@email.com';
    
    const [validateUsers] = await connection.execute(
      'SELECT id, name FROM users WHERE email = ?',
      [testEmail]
    );
    
    if (validateUsers.length > 0) {
      console.log('✓ Email validado com sucesso:', validateUsers[0]);
    } else {
      console.log('❌ Email não encontrado');
      return;
    }
    
    // 3. Testar atualização de senha
    console.log('\n--- TESTE 2: Atualização de Senha ---');
    const userId = validateUsers[0].id;
    const newPassword = 'novaSenha123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const [updateResult] = await connection.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    
    if (updateResult.affectedRows > 0) {
      console.log('✓ Senha atualizada com sucesso');
      
      // Verificar se a senha foi realmente atualizada
      const [updatedUser] = await connection.execute(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      );
      
      const isPasswordCorrect = await bcrypt.compare(newPassword, updatedUser[0].password_hash);
      if (isPasswordCorrect) {
        console.log('✓ Verificação: Nova senha está correta');
      } else {
        console.log('❌ Verificação: Nova senha não confere');
      }
    } else {
      console.log('❌ Falha ao atualizar senha');
    }
    
    console.log('\n=== TESTE CONCLUÍDO ===');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✓ Conexão fechada');
    }
  }
}

// Executar teste
testChangePassword();