const fetch = require('node-fetch');

async function testChangePasswordAPI() {
  const baseURL = 'http://localhost:3000/api/auth/change-password';
  
  try {
    console.log('=== TESTE DA API MODIFICAR SENHA ===');
    
    // Teste 1: Validar email
    console.log('\n--- TESTE 1: Validar Email ---');
    const validateResponse = await fetch(baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        step: 'validate',
        email: 'jakebentes@hotmail.com'
      })
    });
    
    console.log('Status da validação:', validateResponse.status);
    const validateData = await validateResponse.json();
    console.log('Resposta da validação:', validateData);
    
    if (validateResponse.ok && validateData.userId) {
      // Teste 2: Atualizar senha
      console.log('\n--- TESTE 2: Atualizar Senha ---');
      const updateResponse = await fetch(baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step: 'update',
          userId: validateData.userId,
          newPassword: 'testeSenha123'
        })
      });
      
      console.log('Status da atualização:', updateResponse.status);
      const updateData = await updateResponse.json();
      console.log('Resposta da atualização:', updateData);
      
      if (updateResponse.ok) {
        console.log('✓ API funcionando corretamente!');
      } else {
        console.log('❌ Erro na atualização da senha');
      }
    } else {
      console.log('❌ Erro na validação do email');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Certifique-se de que o servidor backend está rodando na porta 3000');
    }
  }
}

testChangePasswordAPI();