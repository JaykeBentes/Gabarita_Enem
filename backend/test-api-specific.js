// Teste usando curl via child_process
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testChangePasswordAPI() {
  const baseURL = 'http://localhost:3000/api';
  
  try {
    console.log('=== TESTE DA API CHANGE-PASSWORD ===');
    
    // Teste 1: Validar email jakebentes@hotmail.com
    console.log('\n--- TESTE 1: Validação de Email ---');
    
    const validateResponse = await fetch(`${baseURL}/auth/change-password`, {
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
    
    if (!validateResponse.ok) {
      const errorText = await validateResponse.text();
      console.log('❌ Erro na validação:', errorText);
      return;
    }
    
    const validateData = await validateResponse.json();
    console.log('✓ Resposta da validação:', validateData);
    
    // Teste 2: Atualizar senha
    console.log('\n--- TESTE 2: Atualização de Senha ---');
    
    const updateResponse = await fetch(`${baseURL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        step: 'update',
        userId: validateData.userId,
        newPassword: 'novaSenha123'
      })
    });
    
    console.log('Status da atualização:', updateResponse.status);
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.log('❌ Erro na atualização:', errorText);
      return;
    }
    
    const updateData = await updateResponse.json();
    console.log('✓ Resposta da atualização:', updateData);
    
    console.log('\n=== TESTE DA API CONCLUÍDO ===');
    
  } catch (error) {
    console.error('❌ Erro durante o teste da API:', error.message);
  }
}

testChangePasswordAPI();