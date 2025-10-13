const http = require('http');

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function testChangePassword() {
  try {
    console.log('=== TESTE MODIFICAR SENHA EXPRESS API ===');
    
    // Teste 1: Validar email
    console.log('\n--- TESTE 1: Validação de Email ---');
    const validateResult = await makeRequest('/api/auth/change-password', {
      step: 'validate',
      email: 'jakebentes@hotmail.com'
    });
    
    console.log('Status:', validateResult.status);
    console.log('Resposta:', validateResult.data);
    
    if (validateResult.status === 200 && validateResult.data.userId) {
      // Teste 2: Atualizar senha
      console.log('\n--- TESTE 2: Atualização de Senha ---');
      const updateResult = await makeRequest('/api/auth/change-password', {
        step: 'update',
        userId: validateResult.data.userId,
        newPassword: 'novaSenha123'
      });
      
      console.log('Status:', updateResult.status);
      console.log('Resposta:', updateResult.data);
    } else {
      console.log('❌ Falha na validação do email');
    }
    
    console.log('\n=== TESTE CONCLUÍDO ===');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testChangePassword();