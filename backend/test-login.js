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

async function testLogin() {
  try {
    console.log('=== TESTE LOGIN ===');
    
    const result = await makeRequest('/api/auth/login', {
      email: 'jakebentes@hotmail.com',
      password: 'novaSenha123'
    });
    
    console.log('Status:', result.status);
    console.log('Resposta:', result.data);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testLogin();