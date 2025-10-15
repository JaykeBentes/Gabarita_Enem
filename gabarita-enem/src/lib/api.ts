const API_BASE_URL = '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.initToken();
  }

  private initToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private ensureToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    this.ensureToken();
    
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error('Servidor retornou resposta inválida (não JSON)');
      }

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erro de conexão: Verifique se o servidor está funcionando');
      }
      throw error;
    }
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: any) {
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

  async getUserProfile() {
    return this.request('/user/profile');
  }

  async getPerformance() {
    return this.request('/performance');
  }

  async getHistory() {
    return this.request('/history');
  }

  async saveSimulation(simulationData: any) {
    return this.request('/simulations', {
      method: 'POST',
      body: JSON.stringify(simulationData),
    });
  }

  async changePassword(data: any) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getQuestions(year: number | null = null, subject: string, count: number = 10, random: boolean = true) {
    const params = new URLSearchParams();
    if (subject) {
      params.append('subject', subject);
    }
    params.append('count', count.toString());

    const url = `/api/questions?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error('API ENEM indisponível - retornou HTML em vez de JSON');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP ${response.status}`);
      }
      
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'SyntaxError' && error.message.includes('JSON')) {
        throw new Error('API do ENEM indisponível no momento');
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();