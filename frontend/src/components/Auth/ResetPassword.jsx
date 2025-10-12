import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { apiService } from '../../services/api';

export const ResetPassword = ({ onSwitchToLogin }) => {
    const [token, setToken] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get('token');

        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        } else {
            setError('Token de redefinição inválido ou ausente. Por favor, solicite um novo link.');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        if (!token) {
            setError('Não foi possível encontrar um token válido.');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            await apiService.post('/auth/reset-password', { token, password });
            setMessage('Senha redefinida com sucesso!.');
            

            setTimeout(() => {
                onSwitchToLogin();
            }, 1000);

        } catch (err) {
            setError('Não foi possível redefinir a senha. O link pode ter expirado.');
        } finally {
            setIsLoading(false);
        }
    };

    if (message) {
        return (
            <div className="auth-card">
                <h2>Sucesso!</h2>
                <p className="success-message">{message}</p>
                <button onClick={onSwitchToLogin} className="auth-button">
                    Ir para Login
                </button>
            </div>
        );
    }
    
    return (
        <div className="auth-card">
            <h2>Crie sua Nova Senha</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <Lock size={20} />
                    <input
                        type="password"
                        placeholder="Nova Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <Lock size={20} />
                    <input
                        type="password"
                        placeholder="Confirmar Nova Senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <div className="error-message">{error}</div>}
                
                <button type="submit" disabled={!token || isLoading} className="auth-button">
                    {isLoading ? 'Salvando...' : 'Redefinir Senha'}
                </button>
            </form>
        </div>
    );
};