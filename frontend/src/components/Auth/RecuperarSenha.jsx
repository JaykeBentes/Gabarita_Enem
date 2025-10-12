import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { apiService } from '../../services/api';

export const RecuperarSenha = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({ email: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        console.log("CLICOU NO BOTÃO");
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            // Envia o e-mail para o backend
            await apiService.post('/auth/forgot-password', formData); 
            setMessage('Um link de recuperação foi enviado.');
        } catch (err) {
            setError('Não foi possível processar a solicitação. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Recuperar Senha</h2>
                    <p className="auth-subtitle" style={{ padding: '10px 0' }}>Digite seu e-mail para receber o link de recuperação.</p> 
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <Mail size={20} />
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ email: e.target.value })}
                                required
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {message && <div className="success-message">{message}</div>}
                        
                        <button type="submit" disabled={isLoading} className="auth-button">
                            {isLoading ? 'Enviando...' : 'Enviar Link'}
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