import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { apiService } from '../../services/api';

export const ModificarSenha = ({ onSwitchToLogin }) => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [step, setStep] = useState(1); // 1 = email, 2 = password
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState('');

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            const response = await apiService.changePassword({ step: 'validate', email });
            setUserId(response.userId);
            setUserName(response.userName);
            setStep(2);
            setMessage(`Olá ${response.userName}! Agora defina sua nova senha.`);
        } catch (err) {
            setError('E-mail não encontrado no sistema.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        
        if (newPassword.length < 6) {
            setError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            await apiService.changePassword({ step: 'update', userId, newPassword });
            setMessage('Senha modificada com sucesso!');
            setTimeout(() => onSwitchToLogin(), 2000);
        } catch (err) {
            setError('Erro ao modificar senha. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    if (step === 2) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Modificar Senha</h2>
                    <p className="auth-subtitle">
                        <User size={16} style={{ display: 'inline', marginRight: '8px' }} />
                        {userName}, digite sua nova senha
                    </p>
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="input-group">
                            <Lock size={20} />
                            <input
                                type="password"
                                placeholder="Nova Senha"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
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
                                minLength={6}
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {message && <div className="success-message">{message}</div>}
                        
                        <button type="submit" disabled={isLoading} className="auth-button">
                            {isLoading ? 'Modificando...' : 'Modificar Senha'}
                        </button>
                    </form>
                    <p>
                        <button onClick={() => setStep(1)} className="link-button">
                            Voltar
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Modificar Senha</h2>
                <p className="auth-subtitle">Digite seu e-mail para validar sua conta</p>
                <form onSubmit={handleEmailSubmit}>
                    <div className="input-group">
                        <Mail size={20} />
                        <input
                            type="email"
                            placeholder="Seu E-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}
                    
                    <button type="submit" disabled={isLoading} className="auth-button">
                        {isLoading ? 'Validando...' : 'Validar E-mail'}
                    </button>
                </form>
                <p>
                    Lembrou a senha? 
                    <button onClick={onSwitchToLogin} className="link-button">
                        Entrar
                    </button>
                </p>
            </div>
        </div>
    );
};