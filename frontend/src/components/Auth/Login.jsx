import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export const Login = ({ onSwitchToRegister , onSwitchToRecuperarSenha}) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const response = await apiService.login(formData);
            login(response.user, response.token);
        } catch (err) {
            setError(err.message);
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
                    Esqueceu sua senha?
                    <button onClick={onSwitchToRecuperarSenha} className="link-button">
                        Recuperar Senha
                    </button>
                </p>
            </div>
        </div>
    );
};