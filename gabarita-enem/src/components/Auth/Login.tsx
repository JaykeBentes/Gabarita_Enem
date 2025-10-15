'use client';

import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';

interface LoginProps {
  onSwitchToRegister: () => void;
  onSwitchToModificarSenha: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onSwitchToModificarSenha }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const response = await apiService.login(formData);
            login(response.user, response.token);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Entrar na Plataforma</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <User size={20} />
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <Lock size={20} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Senha"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="password-toggle"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" disabled={isLoading} className="auth-button">
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <p>
                    Não tem conta? 
                    <button onClick={onSwitchToRegister} className="link-button">
                        Cadastre-se
                    </button>
                </p>
                <p>
                    Quer modificar sua senha?
                    <button onClick={onSwitchToModificarSenha} className="link-button">
                        Modificar Senha
                    </button>
                </p>
            </div>
        </div>
    );
};