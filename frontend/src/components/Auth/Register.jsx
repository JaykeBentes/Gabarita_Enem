import React, { useState } from 'react';
import { User, Mail, Lock, Calendar } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const Register = ({ onSwitchToLogin }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        birthDate: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Senhas não coincidem');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            const response = await apiService.register({
                name: formData.name,
                email: formData.email,
                birthDate: formData.birthDate,
                password: formData.password
            });
            
            // Fazer login automaticamente após registro
            const loginResponse = await apiService.login({
                email: formData.email,
                password: formData.password
            });
            
            login(loginResponse.user, loginResponse.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Criar Conta</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <User size={20} />
                        <input
                            type="text"
                            placeholder="Nome completo"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <Mail size={20} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <Calendar size={20} />
                        <input
                            type="date"
                            placeholder="Data de nascimento"
                            value={formData.birthDate}
                            onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <Lock size={20} />
                        <input
                            type="password"
                            placeholder="Senha"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <Lock size={20} />
                        <input
                            type="password"
                            placeholder="Confirmar senha"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            required
                        />
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" disabled={isLoading} className="auth-button">
                        {isLoading ? 'Criando conta...' : 'Cadastrar'}
                    </button>
                </form>
                <p>
                    Já tem conta? 
                    <button onClick={onSwitchToLogin} className="link-button">
                        Entrar
                    </button>
                </p>
            </div>
        </div>
    );
};