const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.initToken();
  }

  initToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
      console.log('Token inicializado:', this.token ? 'Token presente' : 'Token ausente');
    }
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  ensureToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  async request(endpoint, options = {}) {
    this.ensureToken();
    
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    console.log('=== REQUEST ===');
    console.log('URL:', url);
    console.log('Method:', options.method || 'GET');
    console.log('Token presente:', !!this.token);
    console.log('Headers:', config.headers);
    if (options.body) {
      console.log('Body:', options.body);
    }

    try {
      console.log('Fazendo fetch...');
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Resposta não é JSON:', text.substring(0, 200));
        throw new Error('Servidor retornou resposta inválida (não JSON)');
      }

      if (!response.ok) {
        console.error('=== ERRO NA API ===');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Data:', data);
        if (response.status === 500) {
          console.error('Detalhes do erro do servidor:', data.debug);
        }
        throw new Error(data.error || `Erro HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('=== RESPOSTA OK ===');
      console.log('Data:', data);
      return data;
    } catch (error) {
      console.error('=== ERRO NO REQUEST ===');
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Verificar se é erro de rede
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erro de conexão: Verifique se o servidor backend está rodando na porta 3000');
      }
      
      throw error;
    }
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  logout() {
    this.clearToken();
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserProfile() {
    return this.request('/user/profile');
  }

  async getPerformance() {
    return this.request('/performance');
  }

  async getHistory() {
    return this.request('/history');
  }

  async getSimulations() {
    return this.request('/simulations');
  }

  async saveSimulation(simulationData) {
    console.log('=== SALVANDO SIMULAÇÃO ===');
    console.log('Dados da simulação:', simulationData);
    console.log('Token atual:', this.token ? 'Token presente' : 'Token ausente');
    return this.request('/simulations', {
      method: 'POST',
      body: JSON.stringify(simulationData),
    });
  }

  async changePassword(data) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getQuestions(year = null, subject, count = 10, random = true) {
    console.log(`=== API SERVICE getQuestions ===`);
    console.log(`Parâmetros recebidos: year=${year}, subject=${subject}, count=${count}, random=${random}`);
    
    const params = new URLSearchParams();
    if (subject) {
      params.append('subject', subject);
      console.log(`Adicionado subject: ${subject}`);
    }
    params.append('count', count.toString());
    console.log(`Adicionado count: ${count}`);

    // Usar rota correta do Next.js backend
    const url = `${this.baseURL}/questions?${params.toString()}`;
    console.log(`URL final: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Status da resposta:', response.status, response.statusText);
      
      // Verificar se a resposta é JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Resposta não é JSON:', text.substring(0, 200));
        throw new Error('API ENEM indisponível - retornou HTML em vez de JSON');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Erro na API ENEM:', response.status, data);
        throw new Error(data.error || `Erro HTTP ${response.status}`);
      }
      
      console.log(`=== RESPOSTA RECEBIDA ===`);
      console.log(`Total de questões: ${data.questions?.length}`);
      console.log(`Debug info:`, data.debug);
      
      return data;
    } catch (error) {
      if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
        console.error('API retornou HTML em vez de JSON');
        throw new Error('API do ENEM indisponível no momento');
      }
      console.error('=== ERRO NO API SERVICE ===');
      console.error('Erro completo:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();