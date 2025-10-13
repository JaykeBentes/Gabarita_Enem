async function testPasswordReset() {
  try {
    console.log('Testando /auth/password-reset...');
    
    const response = await fetch('http://localhost:3000/api/auth/password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        step: 'validate', 
        email: 'jakebentes@hotmail.com' 
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

testPasswordReset();